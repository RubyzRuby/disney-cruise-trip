// ========================================
// 本地存储封装 - 支持多用户协作
// ========================================

const Storage = {
    // 存储键名
    keys: {
        CURRENT_USER: 'disney_cruise_current_user',
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
            localStorage.setItem(this.keys.CURRENT_USER, JSON.stringify(member));
            return member;
        }
        return null;
    },

    // 是否是主编辑
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    },

    // 获取当前用户的待办清单
    getTodos() {
        const user = this.getCurrentUser();
        if (!user) return cruiseData.defaultTodos;

        const key = this.keys.TODOS_PREFIX + user.id;
        const data = localStorage.getItem(key);

        if (data) {
            return JSON.parse(data);
        }

        // 首次使用：复制默认数据并添加用户专属标记
        const userTodos = JSON.parse(JSON.stringify(cruiseData.defaultTodos));
        this.saveTodos(userTodos);
        return userTodos;
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

    // 保存支出记录（仅主编辑可编辑）
    saveExpenses(expenses) {
        if (!this.isAdmin()) {
            console.warn('只有主编辑可以修改支出记录');
            return false;
        }
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

    // 获取预订信息（仅主编辑可编辑）
    getBookings() {
        const data = localStorage.getItem(this.keys.BOOKINGS);
        if (data) {
            return JSON.parse(data);
        }
        return cruiseData.defaultBookings;
    },

    // 保存预订信息（仅主编辑可编辑）
    saveBookings(bookings) {
        if (!this.isAdmin()) {
            console.warn('只有主编辑可以修改预订信息');
            return false;
        }
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
    }
};
