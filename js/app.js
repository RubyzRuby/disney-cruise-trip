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
        this.initExportFeature();
        this.initEnhancedStars();

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
                    <h2>你是谁？</h2>
                    <p>点击下方选择你的身份</p>
                </div>
                <div class="user-options">
                    ${cruiseData.members.map(member => `
                        <div class="user-option" onclick="DisneyCruiseApp.selectUser('${member.id}')">
                            <div class="user-option-emoji">${member.emoji}</div>
                            <div class="user-option-info">
                                <div class="user-option-name">我是 ${member.name}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <p class="user-selector-hint">💡 Z / W / Y 三人都可以编辑所有内容</p>
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

    // 编辑用户名称 - 优化版本
    editUserName() {
        const user = Storage.getCurrentUser();
        if (!user) return;

        // 创建自定义弹窗替代 prompt
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'editNameModal';
        modal.innerHTML = `
            <div class="modal-content" style="max-height: 300px;">
                <div class="modal-header">
                    <h3>✏️ 修改你的名字</h3>
                    <button class="modal-close" onclick="document.getElementById('editNameModal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <input type="text" class="modal-input" id="newNameInput"
                           placeholder="输入你的名字" value="${user.displayName || user.name}"
                           maxlength="10" style="text-align: center; font-size: 18px;">
                    <p style="text-align: center; color: var(--text-secondary); font-size: 12px; margin-top: 8px;">
                        最多10个字符
                    </p>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="document.getElementById('editNameModal').remove()">取消</button>
                    <button class="btn-primary" id="saveNameBtn">保存</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const input = document.getElementById('newNameInput');
        input.focus();
        input.select();

        // 绑定保存按钮
        document.getElementById('saveNameBtn').addEventListener('click', () => {
            const newName = input.value.trim();
            if (newName && newName.length <= 10) {
                Storage.saveUserCustomName(user.id, newName);
                const displayNameEl = document.getElementById('userDisplayName');
                if (displayNameEl) {
                    displayNameEl.textContent = newName;
                    // 添加闪烁效果
                    displayNameEl.style.animation = 'nameFlash 0.6s ease';
                    setTimeout(() => displayNameEl.style.animation = '', 600);
                }
                modal.remove();
                this.showToast('✨ 名字已保存！');
            } else if (!newName) {
                input.style.borderColor = 'var(--accent-sos)';
                setTimeout(() => input.style.borderColor = '', 300);
            }
        });

        // 回车保存
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('saveNameBtn').click();
            }
        });

        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    },

    // 显示提示消息
    showToast(message, duration = 2000) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            color: var(--gold-primary);
            padding: 16px 32px;
            border-radius: 30px;
            font-size: 16px;
            z-index: 9999;
            animation: fadeInScale 0.3s ease;
            backdrop-filter: blur(10px);
            border: 1px solid var(--gold-primary);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOutScale 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
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
                        const confirmedBadge = act.confirmed ? '<span class="badge confirmed">✓</span>' : '';
                        const highlightBadge = act.highlight ? '<span class="badge highlight">✨</span>' : '';
                        const mustDoBadge = act.mustDo ? '<span class="badge mustdo">必须</span>' : '';
                        const groupBadge = act.group ? `<span class="badge group">${act.group === 'chongqing' ? '重庆组' : '深圳组'}</span>` : '';
                        return `
                            <div class="activity-item ${isCompleted ? 'completed' : ''} ${act.confirmed ? 'confirmed' : ''} ${act.mustDo ? 'must-do' : ''}" data-id="${actId}">
                                <div class="activity-badges">${mustDoBadge}${confirmedBadge}${highlightBadge}${groupBadge}</div>
                                <div class="activity-time">${act.time}</div>
                                <div class="activity-title">${act.title}</div>
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
    },

    // 增强星空效果
    initEnhancedStars() {
        const container = document.getElementById('stars');
        if (!container) return;

        // 添加流动星星
        for (let i = 0; i < 15; i++) {
            const shootingStar = document.createElement('div');
            shootingStar.className = 'shooting-star';
            shootingStar.style.left = `${Math.random() * 100}%`;
            shootingStar.style.top = `${Math.random() * 50}%`;
            shootingStar.style.animationDelay = `${Math.random() * 10}s`;
            shootingStar.style.animationDuration = `${2 + Math.random() * 3}s`;
            container.appendChild(shootingStar);
        }
    },

    // 行程导出功能
    initExportFeature() {
        // 在行程页面添加导出按钮
        const itineraryPage = document.getElementById('itinerary');
        if (!itineraryPage) return;

        const exportBtn = document.createElement('button');
        exportBtn.className = 'export-btn';
        exportBtn.innerHTML = '📤 分享行程';
        exportBtn.onclick = () => this.exportItinerary();

        const pageHeader = itineraryPage.querySelector('.page-header');
        if (pageHeader) {
            pageHeader.appendChild(exportBtn);
        }
    },

    exportItinerary() {
        const user = Storage.getCurrentUser();
        const exportText = this.generateItineraryText();

        // 创建弹窗显示导出内容
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-height: 80vh;">
                <div class="modal-header">
                    <h3>📤 分享行程</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <textarea id="exportText" class="modal-input" readonly
                        style="height: 200px; font-size: 13px; line-height: 1.6; resize: none;">${exportText}</textarea>
                    <p style="text-align: center; color: var(--text-secondary); font-size: 12px; margin-top: 8px;">
                        复制上方内容分享给朋友
                    </p>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal').remove()">关闭</button>
                    <button class="btn-primary" onclick="DisneyCruiseApp.copyExportText()">📋 复制</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    },

    generateItineraryText() {
        let text = `🚢 迪士尼探险号邮轮之旅\n`;
        text += `📅 ${cruiseData.cruiseInfo.duration} · ${cruiseData.cruiseInfo.departure} 出发\n`;
        text += `👥 ${cruiseData.cruiseInfo.passengers}人 · ${cruiseData.cruiseInfo.roomType}\n`;
        text += `═`.repeat(30) + `\n\n`;

        cruiseData.itinerary.forEach(day => {
            text += `【第${day.day}天】${day.date} ${day.weekday}\n`;
            text += `${day.title} ${day.emoji}\n`;
            text += `📍 ${day.location}\n\n`;

            day.activities.forEach(act => {
                const icon = act.mustDo ? '🔴' : act.confirmed ? '✅' : act.highlight ? '✨' : '📍';
                text += `${icon} ${act.time} ${act.title}\n`;
                if (act.desc) text += `   ${act.desc}\n`;
            });

            text += `\n`;
        });

        text += `═`.repeat(30) + `\n`;
        text += `💰 预算：人均 ¥${Math.round(cruiseData.defaultBookings.reduce((sum, b) => sum + b.price, 0) / cruiseData.cruiseInfo.passengers).toLocaleString()}\n`;
        text += `📱 更多详情打开旅行计划App查看`;

        return text;
    },

    copyExportText() {
        const textarea = document.getElementById('exportText');
        if (textarea) {
            textarea.select();
            document.execCommand('copy');
            this.showToast('📋 已复制到剪贴板！');
        }
    }
};

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    DisneyCruiseApp.init();
});
