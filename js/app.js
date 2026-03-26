// ========================================
// 迪士尼邮轮App - 主应用逻辑（支持多用户协作）
// ========================================

const DisneyCruiseApp = {
    // 初始化
    init() {
        // 首先检查并初始化用户
        if (!this.initUser()) {
            return; // 等待用户选择
        }

        this.initStars();
        this.initCountdown();
        this.initItinerary();
        this.initTodo();
        this.initBookings();
        this.initExpense();
        this.initSOS();
        this.initModals();

        console.log('🚢 迪士尼邮轮App已启动！当前用户:', Storage.getCurrentUser()?.name);
    },

    // 初始化用户选择
    initUser() {
        const currentUser = Storage.getCurrentUser();
        if (currentUser) {
            this.showCurrentUser();
            return true;
        }

        // 显示用户选择界面
        this.showUserSelector();
        return false;
    },

    // 显示用户选择界面
    showUserSelector() {
        const selector = document.createElement('div');
        selector.className = 'user-selector-modal';
        selector.id = 'userSelector';
        selector.innerHTML = `
            <div class="user-selector-content">
                <div class="user-selector-header">
                    <div class="magic-stars">✨ ✨ ✨</div>
                    <h2>选择你的身份</h2>
                    <p>请选择你是谁，开始使用旅行计划</p>
                </div>
                <div class="user-options">
                    ${cruiseData.members.map(member => `
                        <div class="user-option ${member.role}" onclick="DisneyCruiseApp.selectUser('${member.id}')">
                            <div class="user-option-emoji">${member.emoji}</div>
                            <div class="user-option-info">
                                <div class="user-option-name">${member.name}</div>
                                <div class="user-option-role">${member.role === 'admin' ? '主编辑 · 可修改所有内容' : '成员 · 可管理个人待办'}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <p class="user-selector-hint">💡 提示：指定一人做主编辑，其他人使用成员身份</p>
            </div>
        `;
        document.body.appendChild(selector);
    },

    // 选择用户
    selectUser(userId) {
        const member = Storage.setCurrentUser(userId);
        if (member) {
            const selector = document.getElementById('userSelector');
            if (selector) {
                selector.style.opacity = '0';
                setTimeout(() => selector.remove(), 300);
            }

            // 延迟初始化主应用
            setTimeout(() => {
                this.init();
            }, 300);
        }
    },

    // 显示当前用户信息
    showCurrentUser() {
        const user = Storage.getCurrentUser();
        if (!user) return;

        // 在头部添加用户标识
        const header = document.querySelector('.app-header');
        if (header && !document.getElementById('userBadge')) {
            const userBadge = document.createElement('div');
            userBadge.id = 'userBadge';
            userBadge.className = 'user-badge';
            userBadge.innerHTML = `
                <span class="user-badge-emoji">${user.emoji}</span>
                <span class="user-badge-name" id="userDisplayName">${user.displayName || user.name}</span>
                <button class="user-edit-btn" onclick="DisneyCruiseApp.editUserName()" title="修改名字">✏️</button>
                <button class="user-switch-btn" onclick="DisneyCruiseApp.switchUser()">切换</button>
            `;
            header.appendChild(userBadge);
        }
    },

    // 编辑用户名称
    editUserName() {
        const user = Storage.getCurrentUser();
        if (!user) return;

        const newName = prompt('请输入你的名字：', user.displayName || user.name);
        if (newName && newName.trim()) {
            Storage.saveUserCustomName(user.id, newName.trim());
            // 更新显示
            const displayNameEl = document.getElementById('userDisplayName');
            if (displayNameEl) {
                displayNameEl.textContent = newName.trim();
            }
            alert('名字已保存！');
        }
    },

    // 切换用户
    switchUser() {
        if (confirm('确定要切换用户吗？')) {
            localStorage.removeItem(Storage.keys.CURRENT_USER);
            location.reload();
        }
    },

    // 生成星空背景
    initStars() {
        const container = document.getElementById('stars');
        if (!container) return;

        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 3}s`;
            container.appendChild(star);
        }
    },

    // 倒计时
    initCountdown() {
        const departureDate = new Date(cruiseData.cruiseInfo.departure);
        const today = new Date();
        const diffTime = departureDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const daysElement = document.getElementById('days');
        if (daysElement) {
            daysElement.textContent = diffDays > 0 ? diffDays : 0;
        }
    },

    // 行程规划
    initItinerary() {
        const container = document.getElementById('timeline');
        if (!container) return;

        const progress = Storage.getItineraryProgress();

        container.innerHTML = cruiseData.itinerary.map(day => `
            <div class="timeline-day">
                <div class="day-header">
                    <div class="day-badge">D${day.day}</div>
                    <div class="day-info">
                        <h3>${day.title} ${day.emoji}</h3>
                        <p>${day.date} ${day.weekday} · ${day.location}</p>
                    </div>
                </div>
                <div class="activity-list">
                    ${day.activities.map((act, idx) => {
                        const actId = `day${day.day}_act${idx}`;
                        const isCompleted = progress[actId];
                        const confirmedBadge = act.confirmed ? '<span style="color:#2ecc71;margin-right:4px;">✓</span>' : '';
                        const highlightBadge = act.highlight ? '✨ ' : '';
                        return `
                            <div class="activity-item ${isCompleted ? 'completed' : ''} ${act.confirmed ? 'confirmed' : ''}" data-id="${actId}">
                                <div class="activity-time">${act.time}</div>
                                <div class="activity-title">${confirmedBadge}${highlightBadge}${act.title}</div>
                                <div class="activity-desc">${act.desc}</div>
                                <div class="activity-check ${isCompleted ? 'checked' : ''}" onclick="DisneyCruiseApp.toggleActivity('${actId}')"></div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `).join('');
    },

    toggleActivity(actId) {
        const progress = Storage.getItineraryProgress();
        progress[actId] = !progress[actId];
        Storage.saveItineraryProgress(progress);

        // 更新UI
        const item = document.querySelector(`[data-id="${actId}"]`);
        if (item) {
            item.classList.toggle('completed');
            const check = item.querySelector('.activity-check');
            check.classList.toggle('checked');
        }
    },

    // 待办事项
    initTodo() {
        this.renderTodos();
        this.updateTodoProgress();
    },

    renderTodos() {
        const container = document.getElementById('todoContainer');
        if (!container) return;

        const todos = Storage.getTodos();

        const categories = {
            before: { title: '行前准备', icon: '📋' },
            boarding: { title: '登船前', icon: '🚢' },
            onboard: { title: '船上活动', icon: '⚓' },
            shore: { title: '岸上观光', icon: '🏝️' }
        };

        container.innerHTML = Object.entries(categories).map(([key, cat]) => `
            <div class="todo-category">
                <div class="category-header">
                    <div class="category-icon ${key}">${cat.icon}</div>
                    <div class="category-title">${cat.title}</div>
                </div>
                ${(todos[key] || []).map(todo => `
                    <div class="todo-item">
                        <div class="todo-checkbox ${todo.completed ? 'checked' : ''}"
                             onclick="DisneyCruiseApp.toggleTodo('${key}', '${todo.id}')"></div>
                        <div class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</div>
                        <div class="todo-delete" onclick="DisneyCruiseApp.deleteTodo('${key}', '${todo.id}')">🗑️</div>
                    </div>
                `).join('')}
            </div>
        `).join('');
    },

    toggleTodo(category, id) {
        const todos = Storage.getTodos();
        const todo = todos[category].find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            Storage.saveTodos(todos);
            this.renderTodos();
            this.updateTodoProgress();
        }
    },

    deleteTodo(category, id) {
        const todos = Storage.getTodos();
        todos[category] = todos[category].filter(t => t.id !== id);
        Storage.saveTodos(todos);
        this.renderTodos();
        this.updateTodoProgress();
    },

    addTodo(category, text) {
        const todos = Storage.getTodos();
        const newTodo = {
            id: Date.now().toString(),
            text: text,
            completed: false
        };
        todos[category].push(newTodo);
        Storage.saveTodos(todos);
        this.renderTodos();
        this.updateTodoProgress();
    },

    updateTodoProgress() {
        const todos = Storage.getTodos();
        let total = 0;
        let completed = 0;

        Object.values(todos).forEach(cat => {
            total += cat.length;
            completed += cat.filter(t => t.completed).length;
        });

        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        const progressFill = document.getElementById('todoProgress');
        const progressText = document.getElementById('progressText');

        if (progressFill) progressFill.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${percentage}% 完成 (${completed}/${total})`;
    },

    // 预订管理
    initBookings() {
        const container = document.getElementById('bookingsContainer');
        if (!container) return;

        const bookings = Storage.getBookings();

        container.innerHTML = bookings.map(booking => `
            <div class="booking-card ${booking.type}">
                <div class="booking-header">
                    <div class="booking-type">
                        <div class="booking-icon ${booking.type}">${booking.icon}</div>
                        <div class="booking-type-name">${booking.typeName}</div>
                    </div>
                    <div class="booking-status ${booking.status}">
                        ${booking.status === 'confirmed' ? '已确认' : '待定'}
                    </div>
                </div>
                <div class="booking-details">
                    <div class="booking-detail">
                        <span class="booking-detail-label">项目</span>
                        <span class="booking-detail-value">${booking.itemName}</span>
                    </div>
                    ${booking.details.map(d => `
                        <div class="booking-detail">
                            <span class="booking-detail-label">${d.label}</span>
                            <span class="booking-detail-value">${d.value}</span>
                        </div>
                    `).join('')}
                    <div class="booking-detail">
                        <span class="booking-detail-label">订单号</span>
                        <span class="booking-detail-value">${booking.orderNumber}</span>
                    </div>
                </div>
                <div class="booking-price">¥${booking.price.toLocaleString()}</div>
            </div>
        `).join('');
    },

    // 记账功能
    initExpense() {
        this.renderExpenses();
        this.updateExpenseSummary();
        this.drawExpenseChart();
    },

    renderExpenses() {
        const container = document.getElementById('expenseList');
        if (!container) return;

        const expenses = Storage.getExpenses();

        if (expenses.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">暂无支出记录</div>';
            return;
        }

        container.innerHTML = expenses.slice().reverse().map(expense => {
            const cat = cruiseData.expenseCategories[expense.category];
            return `
                <div class="expense-item">
                    <div class="expense-category-icon" style="background: ${cat.color}20;">${cat.icon}</div>
                    <div class="expense-info">
                        <div class="expense-name">${expense.item}</div>
                        <div class="expense-category">${cat.name}</div>
                    </div>
                    <div class="expense-amount">¥${expense.amount}</div>
                </div>
            `;
        }).join('');
    },

    addExpense(amount, item, category) {
        const expenses = Storage.getExpenses();
        expenses.push({
            id: Date.now(),
            amount: parseFloat(amount),
            item: item,
            category: category,
            date: new Date().toISOString()
        });
        Storage.saveExpenses(expenses);
        this.renderExpenses();
        this.updateExpenseSummary();
        this.drawExpenseChart();
    },

    updateExpenseSummary() {
        const expenses = Storage.getExpenses();
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        const perPerson = total / cruiseData.cruiseInfo.passengers;

        const totalElement = document.getElementById('totalExpense');
        const perPersonElement = document.getElementById('perPerson');

        if (totalElement) totalElement.textContent = `¥${total.toLocaleString()}`;
        if (perPersonElement) perPersonElement.textContent = `¥${Math.round(perPerson).toLocaleString()}`;
    },

    drawExpenseChart() {
        const canvas = document.getElementById('expenseChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const expenses = Storage.getExpenses();

        // 按分类统计
        const categoryTotals = {};
        expenses.forEach(e => {
            categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
        });

        const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

        if (total === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('暂无数据', canvas.width / 2, canvas.height / 2);
            return;
        }

        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制简单饼图
        let currentAngle = -Math.PI / 2;
        const centerX = canvas.width / 2 - 50;
        const centerY = canvas.height / 2;
        const radius = 70;

        Object.entries(categoryTotals).forEach(([cat, amount]) => {
            const percentage = amount / total;
            const angle = percentage * Math.PI * 2;
            const color = cruiseData.expenseCategories[cat].color;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + angle);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();

            currentAngle += angle;
        });

        // 绘制图例
        let legendY = 20;
        Object.entries(categoryTotals).forEach(([cat, amount]) => {
            const percentage = Math.round((amount / total) * 100);
            const color = cruiseData.expenseCategories[cat].color;
            const name = cruiseData.expenseCategories[cat].name;

            ctx.fillStyle = color;
            ctx.fillRect(canvas.width - 90, legendY, 12, 12);

            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`${name} ${percentage}%`, canvas.width - 75, legendY + 10);

            legendY += 22;
        });
    },

    // SOS紧急联系
    initSOS() {
        const container = document.getElementById('sosList');
        if (!container) return;

        container.innerHTML = cruiseData.sosContacts.map(contact => `
            <div class="sos-card" onclick="window.location.href='tel:${contact.number}'">
                <div class="sos-card-icon ${contact.category}">${contact.icon}</div>
                <div class="sos-info">
                    <div class="sos-title">${contact.title}</div>
                    <div class="sos-subtitle">${contact.subtitle}</div>
                </div>
                <div class="sos-number">${contact.number}</div>
            </div>
        `).join('');
    },

    // 弹窗管理
    initModals() {
        // 待办弹窗
        const todoModal = document.getElementById('todoModal');
        const addTodoBtn = document.getElementById('addTodoBtn');
        const closeTodoModal = document.getElementById('closeTodoModal');
        const cancelTodo = document.getElementById('cancelTodo');
        const saveTodo = document.getElementById('saveTodo');

        if (addTodoBtn) {
            addTodoBtn.addEventListener('click', () => {
                todoModal.classList.add('active');
                document.getElementById('todoInput').focus();
            });
        }

        if (closeTodoModal) {
            closeTodoModal.addEventListener('click', () => todoModal.classList.remove('active'));
        }

        if (cancelTodo) {
            cancelTodo.addEventListener('click', () => todoModal.classList.remove('active'));
        }

        if (saveTodo) {
            saveTodo.addEventListener('click', () => {
                const input = document.getElementById('todoInput');
                const category = document.getElementById('todoCategory');
                if (input.value.trim()) {
                    this.addTodo(category.value, input.value.trim());
                    input.value = '';
                    todoModal.classList.remove('active');
                }
            });
        }

        // 记账弹窗
        const expenseModal = document.getElementById('expenseModal');
        const addExpenseBtn = document.getElementById('addExpenseBtn');
        const closeExpenseModal = document.getElementById('closeExpenseModal');
        const cancelExpense = document.getElementById('cancelExpense');
        const saveExpense = document.getElementById('saveExpense');

        if (addExpenseBtn) {
            // 只在记账页面显示添加按钮
            document.addEventListener('tabChange', (e) => {
                addExpenseBtn.style.display = e.detail.tab === 'expense' ? 'flex' : 'none';
            });
            addExpenseBtn.style.display = 'none';

            addExpenseBtn.addEventListener('click', () => {
                expenseModal.classList.add('active');
                document.getElementById('expenseAmount').focus();
            });
        }

        if (closeExpenseModal) {
            closeExpenseModal.addEventListener('click', () => expenseModal.classList.remove('active'));
        }

        if (cancelExpense) {
            cancelExpense.addEventListener('click', () => expenseModal.classList.remove('active'));
        }

        if (saveExpense) {
            saveExpense.addEventListener('click', () => {
                const amount = document.getElementById('expenseAmount');
                const item = document.getElementById('expenseItem');
                const category = document.getElementById('expenseCategory');

                if (amount.value && item.value.trim()) {
                    this.addExpense(amount.value, item.value.trim(), category.value);
                    amount.value = '';
                    item.value = '';
                    expenseModal.classList.remove('active');
                }
            });
        }

        // 点击背景关闭弹窗
        [todoModal, expenseModal].forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.classList.remove('active');
                    }
                });
            }
        });
    }
};

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    DisneyCruiseApp.init();
});
