// ========================================
// 本地存储封装 - 支持多用户协作
// ========================================

const Storage = {
    // 存储键名
    keys: {
        CURRENT_USER: 'disney_cruise_current_user',
        USER_PROFILES: 'disney_cruise_profiles',
        TODOS_PREFIX: 'disney_cruise_todos_',
        EXPENSES: 'disney_cruise_expenses',
        BOOKINGS: 'disney_cruise_bookings',
        ITINERARY_PROGRESS: 'disney_cruise_progress'
    },

    // 获取当前用户
    getCurrentUser() {
        const data = localStorage.getItem(this.keys.CURRENT_USER);
        if (data) {
            return JSON.parse(data);
        }
        return null;
    },

    // 设置当前用户
    setCurrentUser(userId) {
        const member = cruiseData.members.find(m => m.id === userId);
        if (member) {
            // 检查是否有自定义名称
            const customName = this.getUserCustomName(userId);
            const userToSave = {
                ...member,
                displayName: customName || member.name
            };
            localStorage.setItem(this.keys.CURRENT_USER, JSON.stringify(userToSave));
            return userToSave;
        }
        return null;
    },

    // 获取用户自定义名称
    getUserCustomName(userId) {
        const profiles = this.getUserProfiles();
        return profiles[userId]?.customName;
    },

    // 获取所有用户资料
    getUserProfiles() {
        const data = localStorage.getItem(this.keys.USER_PROFILES);
        return data ? JSON.parse(data) : {};
    },

    // 保存用户自定义名称
    saveUserCustomName(userId, customName) {
        const profiles = this.getUserProfiles();
        if (!profiles[userId]) {
            profiles[userId] = {};
        }
        profiles[userId].customName = customName;
        localStorage.setItem(this.keys.USER_PROFILES, JSON.stringify(profiles));

        // 同时更新当前用户显示名称
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            currentUser.displayName = customName;
            localStorage.setItem(this.keys.CURRENT_USER, JSON.stringify(currentUser));
        }
    },

    // 是否是主编辑
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    },

    // 获取当前用户的待办清单
    getTodos() {
        const user = this.getCurrentUser();
        if (!user) {
            console.log('getTodos: no current user');
            // 返回深拷贝，避免修改原始数据
            return JSON.parse(JSON.stringify(cruiseData.defaultTodos));
        }

        const key = this.keys.TODOS_PREFIX + user.id;
        const data = localStorage.getItem(key);

        if (data) {
            console.log('getTodos: found data for user', user.id);
            const todos = JSON.parse(data);
            // 转换旧数据格式：将布尔值转换为对象格式
            this.migrateTodoFormat(todos);
            return todos;
        }

        // 首次使用：复制默认数据并添加用户专属标记
        console.log('getTodos: first time for user', user.id);
        const userTodos = JSON.parse(JSON.stringify(cruiseData.defaultTodos));
        // 确保所有待办事项的 completed 是对象格式
        this.migrateTodoFormat(userTodos);
        this.saveTodos(userTodos);
        return userTodos;
    },

    // 迁移旧数据格式（布尔值 -> 对象）
    migrateTodoFormat(todos) {
        const members = cruiseData?.members || [];
        Object.keys(todos).forEach(category => {
            if (Array.isArray(todos[category])) {
                todos[category].forEach(todo => {
                    // 如果 completed 是布尔值，转换为对象格式
                    if (typeof todo.completed === 'boolean') {
                        const oldValue = todo.completed;
                        todo.completed = {};
                        members.forEach(m => {
                            todo.completed[m.id] = oldValue;
                        });
                    }
                    // 确保所有成员都有状态
                    if (typeof todo.completed === 'object' && todo.completed !== null) {
                        members.forEach(m => {
                            if (!(m.id in todo.completed)) {
                                todo.completed[m.id] = false;
                            }
                        });
                    }
                });
            }
        });
    },

    // 获取所有用户的待办确认状态（用于显示）
    getAllTodosWithStatus() {
        const result = {};
        const members = cruiseData?.members || [];

        // 获取每个用户的待办
        members.forEach(member => {
            const key = this.keys.TODOS_PREFIX + member.id;
            const data = localStorage.getItem(key);
            if (data) {
                const todos = JSON.parse(data);
                this.migrateTodoFormat(todos);
                result[member.id] = todos;
            } else {
                // 使用默认数据
                const defaultTodos = JSON.parse(JSON.stringify(cruiseData.defaultTodos));
                result[member.id] = defaultTodos;
            }
        });

        return result;
    },

    // 切换当前用户的待办完成状态
    toggleTodoStatus(category, todoId) {
        console.log('toggleTodoStatus called:', category, todoId);

        const user = this.getCurrentUser();
        console.log('current user:', user);
        if (!user) {
            console.log('No user, returning false');
            return false;
        }

        const todos = this.getTodos();
        console.log('todos keys:', Object.keys(todos));
        console.log('category exists:', category in todos);

        if (todos[category]) {
            console.log('todos in category:', todos[category].map(t => t.id));
        }

        const todo = todos[category]?.find(t => t.id === todoId);
        console.log('found todo:', todo);

        if (!todo) {
            console.log('Todo not found, returning false');
            return false;
        }

        // 确保 completed 是对象格式
        if (typeof todo.completed !== 'object' || todo.completed === null) {
            console.log('Migrating todo format, old value:', todo.completed);
            const oldValue = todo.completed === true;
            todo.completed = {};
            cruiseData.members.forEach(m => {
                todo.completed[m.id] = oldValue;
            });
        }

        // 切换当前用户的状态
        console.log('Toggling status for user:', user.id, 'current:', todo.completed[user.id]);
        todo.completed[user.id] = !todo.completed[user.id];
        console.log('New status:', todo.completed[user.id]);

        this.saveTodos(todos);
        return true;
    },

    // 检查待办是否全部完成（三人）
    isTodoFullyCompleted(todo) {
        if (!todo.completed || typeof todo.completed !== 'object') return false;
        return Object.values(todo.completed).every(v => v === true);
    },

    // 获取待办完成人数
    getTodoCompletedCount(todo) {
        if (!todo.completed || typeof todo.completed !== 'object') return 0;
        return Object.values(todo.completed).filter(v => v === true).length;
    },

    // 保存当前用户的待办清单
    saveTodos(todos) {
        const user = this.getCurrentUser();
        if (!user) return;

        const key = this.keys.TODOS_PREFIX + user.id;
        localStorage.setItem(key, JSON.stringify(todos));
    },

    // 获取共享的支出记录（所有用户共享）
    getExpenses() {
        const data = localStorage.getItem(this.keys.EXPENSES);
        return data ? JSON.parse(data) : [];
    },

    // 保存支出记录（所有成员可编辑）
    saveExpenses(expenses) {
        localStorage.setItem(this.keys.EXPENSES, JSON.stringify(expenses));
        return true;
    },

    // 添加支出记录（所有成员都可以添加）
    addExpense(expense) {
        const expenses = this.getExpenses();
        const user = this.getCurrentUser();
        expense.addedBy = user ? user.name : '未知';
        expenses.push(expense);
        localStorage.setItem(this.keys.EXPENSES, JSON.stringify(expenses));
        return true;
    },

    // 获取预订信息（所有成员可编辑）
    getBookings() {
        const data = localStorage.getItem(this.keys.BOOKINGS);
        if (data) {
            return JSON.parse(data);
        }
        return cruiseData.defaultBookings;
    },

    // 保存预订信息（所有成员可编辑）
    saveBookings(bookings) {
        localStorage.setItem(this.keys.BOOKINGS, JSON.stringify(bookings));
        return true;
    },

    // 获取行程进度（所有用户共享）
    getItineraryProgress() {
        const data = localStorage.getItem(this.keys.ITINERARY_PROGRESS);
        return data ? JSON.parse(data) : {};
    },

    // 保存行程进度（所有用户都可以标记）
    saveItineraryProgress(progress) {
        localStorage.setItem(this.keys.ITINERARY_PROGRESS, JSON.stringify(progress));
    },

    // 清除当前用户数据
    clearUserData() {
        const user = this.getCurrentUser();
        if (user) {
            localStorage.removeItem(this.keys.TODOS_PREFIX + user.id);
        }
    },

    // 清除所有数据（重置）
    clearAll() {
        Object.values(this.keys).forEach(key => {
            if (key.endsWith('_')) {
                // 删除所有用户待办前缀的键
                for (let i = 0; i < localStorage.length; i++) {
                    const storageKey = localStorage.key(i);
                    if (storageKey && storageKey.startsWith(key)) {
                        localStorage.removeItem(storageKey);
                    }
                }
            } else {
                localStorage.removeItem(key);
            }
        });
    },

    // 导出所有数据（用于分享给其他成员）
    exportData() {
        const data = {
            bookings: this.getBookings(),
            expenses: this.getExpenses(),
            progress: this.getItineraryProgress(),
            exportedAt: new Date().toISOString(),
            exportedBy: this.getCurrentUser()?.name || '未知'
        };
        return JSON.stringify(data, null, 2);
    },

    // 导入数据（主编辑权限）
    importData(jsonString) {
        if (!this.isAdmin()) {
            alert('只有主编辑可以导入数据');
            return false;
        }

        try {
            const data = JSON.parse(jsonString);
            if (data.bookings) this.saveBookings(data.bookings);
            if (data.expenses) localStorage.setItem(this.keys.EXPENSES, JSON.stringify(data.expenses));
            if (data.progress) this.saveItineraryProgress(data.progress);
            return true;
        } catch (e) {
            console.error('导入数据失败:', e);
            return false;
        }
    },

    // ========================================
    // Gist 同步专用方法
    // ========================================

    // 导出所有数据（包括所有用户的待办）
    exportAllData() {
        const data = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            exportedBy: this.getCurrentUser()?.name || '未知',
            data: {
                bookings: this.getBookings(),
                expenses: this.getExpenses(),
                progress: this.getItineraryProgress(),
                profiles: this.getUserProfiles()
            }
        };

        // 收集所有用户的待办清单
        const members = cruiseData?.members || [];
        members.forEach(member => {
            const key = this.keys.TODOS_PREFIX + member.id;
            const todos = localStorage.getItem(key);
            if (todos) {
                data.data[`todos_${member.id}`] = JSON.parse(todos);
            }
        });

        return data;
    },

    // 导入所有数据（用于 Gist 同步）
    importAllData(importedData) {
        try {
            // 验证数据结构
            if (!importedData || !importedData.data) {
                throw new Error('无效的数据格式');
            }

            const data = importedData.data;

            // 导入预订信息
            if (data.bookings) {
                this.saveBookings(data.bookings);
            }

            // 导入支出记录
            if (data.expenses) {
                localStorage.setItem(this.keys.EXPENSES, JSON.stringify(data.expenses));
            }

            // 导入行程进度
            if (data.progress) {
                this.saveItineraryProgress(data.progress);
            }

            // 导入用户资料
            if (data.profiles) {
                localStorage.setItem(this.keys.USER_PROFILES, JSON.stringify(data.profiles));
            }

            // 导入各用户的待办清单
            Object.keys(data).forEach(key => {
                if (key.startsWith('todos_')) {
                    const userId = key.replace('todos_', '');
                    localStorage.setItem(this.keys.TODOS_PREFIX + userId, JSON.stringify(data[key]));
                }
            });

            return true;
        } catch (e) {
            console.error('导入所有数据失败:', e);
            return false;
        }
    }
};
