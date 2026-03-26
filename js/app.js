// ========================================
// 迪士尼邮轮App - 主应用逻辑（支持多用户协作）
// ========================================

const DisneyCruiseApp = {
    // 初始化
    init() {
        // 初始化基础UI（这些不依赖用户登录）
        this.initStars();
        this.initEnhancedStars();
        this.initCountdown();

        // 初始化标签切换器（始终需要）
        if (typeof TabManager !== 'undefined') {
            TabManager.init();
        }

        // 检查并初始化用户
        if (!this.initUser()) {
            return; // 等待用户选择，后续初始化在selectUser中完成
        }

        // 用户已登录，初始化功能模块
        this.initUserFeatures();

        console.log('🚢 迪士尼邮轮App已启动！当前用户:', Storage.getCurrentUser()?.name);
    },

    // 初始化用户相关功能
    initUserFeatures() {
        this.initItinerary();
        this.initTodo();
        this.initBookings();
        this.initExpense();
        this.initSOS();
        this.initModals();
        this.initExportFeature();
        this.initSettings();
        this.initSyncModal();
    },

    // 初始化同步弹窗事件
    initSyncModal() {
        // 关闭按钮
        const closeBtn = document.getElementById('closeSyncModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeSyncModal());
        }

        // 创建 Gist 按钮
        const createBtn = document.getElementById('createGistBtn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.createNewGist());
        }

        // 连接 Gist 按钮
        const connectBtn = document.getElementById('connectGistBtn');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => this.connectToGist());
        }

        // 上传按钮
        const syncUpBtn = document.getElementById('syncUpBtn');
        if (syncUpBtn) {
            syncUpBtn.addEventListener('click', () => this.syncUp());
        }

        // 下载按钮
        const syncDownBtn = document.getElementById('syncDownBtn');
        if (syncDownBtn) {
            syncDownBtn.addEventListener('click', () => this.syncDown());
        }

        // 断开连接按钮
        const disconnectBtn = document.getElementById('disconnectBtn');
        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', () => this.disconnectGist());
        }

        // 点击背景关闭
        const modal = document.getElementById('syncModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeSyncModal();
            });
        }

        // 导入弹窗事件
        const closeImportBtn = document.getElementById('closeImportModal');
        const cancelImportBtn = document.getElementById('cancelImport');
        const confirmImportBtn = document.getElementById('confirmImport');

        if (closeImportBtn) {
            closeImportBtn.addEventListener('click', () => this.closeImportModal());
        }
        if (cancelImportBtn) {
            cancelImportBtn.addEventListener('click', () => this.closeImportModal());
        }
        if (confirmImportBtn) {
            confirmImportBtn.addEventListener('click', () => this.importData());
        }

        // 点击背景关闭导入弹窗
        const importModal = document.getElementById('importModal');
        if (importModal) {
            importModal.addEventListener('click', (e) => {
                if (e.target === importModal) this.closeImportModal();
            });
        }

        // 公开 Gist 复选框控制 Token 输入
        const isPublicCheckbox = document.getElementById('isPublicGist');
        const tokenInput = document.getElementById('githubToken');
        if (isPublicCheckbox && tokenInput) {
            isPublicCheckbox.addEventListener('change', (e) => {
                tokenInput.style.display = e.target.checked ? 'none' : 'block';
            });
            // 初始状态
            tokenInput.style.display = isPublicCheckbox.checked ? 'none' : 'block';
        }
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

            // 显示当前用户并初始化功能
            this.showCurrentUser();
            setTimeout(() => {
                this.initUserFeatures();
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
        this.renderItinerary();
    },

    renderItinerary() {
        const container = document.getElementById('timeline');
        if (!container) return;

        const progress = Storage.getItineraryProgress();

        container.innerHTML = `
            <div class="itinerary-actions" style="margin-bottom: 16px; text-align: right;">
                <button class="btn-primary" onclick="DisneyCruiseApp.openActivityModal()">+ 添加活动</button>
            </div>
            ${cruiseData.itinerary.map((day, dayIdx) => `
                <div class="timeline-day">
                    <div class="day-header">
                        <div class="day-badge">D${day.day}</div>
                        <div class="day-info">
                            <h3>${day.title} ${day.emoji}</h3>
                            <p>${day.date} ${day.weekday} · ${day.location}</p>
                        </div>
                        <button class="day-edit-btn" onclick="DisneyCruiseApp.editDay(${dayIdx})">✏️</button>
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
                                    <div class="activity-actions">
                                        <button class="activity-edit-btn" onclick="DisneyCruiseApp.editActivity(${dayIdx}, ${idx})">✏️</button>
                                        <button class="activity-delete-btn" onclick="DisneyCruiseApp.deleteActivity(${dayIdx}, ${idx})">🗑️</button>
                                        <div class="activity-check ${isCompleted ? 'checked' : ''}" onclick="DisneyCruiseApp.toggleActivity('${actId}')"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `).join('')}
        `;
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

    openActivityModal(dayIdx = null, actIdx = null) {
        const isEdit = dayIdx !== null && actIdx !== null;
        const day = isEdit ? cruiseData.itinerary[dayIdx] : null;
        const act = isEdit ? day.activities[actIdx] : null;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'activityModal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${isEdit ? '✏️ 编辑活动' : '+ 添加活动'}</h3>
                    <button class="modal-close" onclick="document.getElementById('activityModal').remove()">×</button>
                </div>
                <div class="modal-body">
                    ${!isEdit ? `
                        <select class="modal-select" id="activityDay">
                            ${cruiseData.itinerary.map((d, i) => `<option value="${i}">第${d.day}天 - ${d.title}</option>`).join('')}
                        </select>
                    ` : ''}
                    <input type="text" class="modal-input" id="activityTime" placeholder="时间（如：10:00）" value="${act?.time || ''}">
                    <input type="text" class="modal-input" id="activityTitle" placeholder="活动名称" value="${act?.title || ''}">
                    <input type="text" class="modal-input" id="activityDesc" placeholder="活动描述" value="${act?.desc || ''}">
                    <div style="display: flex; gap: 12px; margin-bottom: 12px;">
                        <label class="checkbox-label" style="flex: 1;">
                            <input type="checkbox" id="activityMustDo" ${act?.mustDo ? 'checked' : ''}>
                            <span>必须完成</span>
                        </label>
                        <label class="checkbox-label" style="flex: 1;">
                            <input type="checkbox" id="activityHighlight" ${act?.highlight ? 'checked' : ''}>
                            <span>高亮标记</span>
                        </label>
                        <label class="checkbox-label" style="flex: 1;">
                            <input type="checkbox" id="activityConfirmed" ${act?.confirmed ? 'checked' : ''}>
                            <span>已确认</span>
                        </label>
                    </div>
                    <select class="modal-select" id="activityGroup">
                        <option value="">全员参与</option>
                        <option value="chongqing" ${act?.group === 'chongqing' ? 'selected' : ''}>重庆组</option>
                        <option value="shenzhen" ${act?.group === 'shenzhen' ? 'selected' : ''}>深圳组</option>
                    </select>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="document.getElementById('activityModal').remove()">取消</button>
                    <button class="btn-primary" onclick="DisneyCruiseApp.saveActivity(${dayIdx !== null ? dayIdx : 'null'}, ${actIdx !== null ? actIdx : 'null'})">保存</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    },

    saveActivity(dayIdx, actIdx) {
        const isEdit = dayIdx !== null && actIdx !== null;

        const time = document.getElementById('activityTime').value.trim();
        const title = document.getElementById('activityTitle').value.trim();
        const desc = document.getElementById('activityDesc').value.trim();
        const mustDo = document.getElementById('activityMustDo').checked;
        const highlight = document.getElementById('activityHighlight').checked;
        const confirmed = document.getElementById('activityConfirmed').checked;
        const group = document.getElementById('activityGroup').value;

        if (!time || !title) {
            this.showToast('⚠️ 请填写时间和活动名称');
            return;
        }

        const newActivity = {
            time,
            title,
            desc,
            mustDo,
            highlight,
            confirmed,
            group: group || undefined
        };

        if (isEdit) {
            // 编辑现有活动
            cruiseData.itinerary[dayIdx].activities[actIdx] = newActivity;
            this.showToast('✅ 活动已更新');
        } else {
            // 添加新活动
            const selectedDay = parseInt(document.getElementById('activityDay').value);
            cruiseData.itinerary[selectedDay].activities.push(newActivity);
            // 按时间排序
            cruiseData.itinerary[selectedDay].activities.sort((a, b) => a.time.localeCompare(b.time));
            this.showToast('✅ 活动已添加');
        }

        document.getElementById('activityModal').remove();
        this.renderItinerary();
    },

    editActivity(dayIdx, actIdx) {
        this.openActivityModal(dayIdx, actIdx);
    },

    deleteActivity(dayIdx, actIdx) {
        if (confirm('确定要删除这个活动吗？')) {
            cruiseData.itinerary[dayIdx].activities.splice(actIdx, 1);
            this.showToast('✅ 活动已删除');
            this.renderItinerary();
        }
    },

    editDay(dayIdx) {
        const day = cruiseData.itinerary[dayIdx];

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'dayModal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>✏️ 编辑日期信息</h3>
                    <button class="modal-close" onclick="document.getElementById('dayModal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <input type="text" class="modal-input" id="dayTitle" placeholder="日期标题" value="${day.title}">
                    <input type="text" class="modal-input" id="dayDate" placeholder="日期（如：6月22日）" value="${day.date}">
                    <input type="text" class="modal-input" id="dayWeekday" placeholder="星期（如：周一）" value="${day.weekday}">
                    <input type="text" class="modal-input" id="dayLocation" placeholder="地点" value="${day.location}">
                    <input type="text" class="modal-input" id="dayEmoji" placeholder="表情符号" value="${day.emoji}">
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="document.getElementById('dayModal').remove()">取消</button>
                    <button class="btn-primary" onclick="DisneyCruiseApp.saveDay(${dayIdx})">保存</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    },

    saveDay(dayIdx) {
        const title = document.getElementById('dayTitle').value.trim();
        const date = document.getElementById('dayDate').value.trim();
        const weekday = document.getElementById('dayWeekday').value.trim();
        const location = document.getElementById('dayLocation').value.trim();
        const emoji = document.getElementById('dayEmoji').value.trim();

        if (!title || !date) {
            this.showToast('⚠️ 请填写标题和日期');
            return;
        }

        cruiseData.itinerary[dayIdx] = {
            ...cruiseData.itinerary[dayIdx],
            title,
            date,
            weekday,
            location,
            emoji
        };

        this.showToast('✅ 日期信息已更新');
        document.getElementById('dayModal').remove();
        this.renderItinerary();
    },

    // 待办事项
    initTodo() {
        this.renderTodos();
        this.updateTodoProgress();
    },

    renderTodos() {
        const container = document.getElementById('todoContainer');
        if (!container) return;

        const currentUser = Storage.getCurrentUser();
        const allTodos = Storage.getAllTodosWithStatus();
        const members = cruiseData.members;

        // 合并所有用户的待办（以当前用户的数据为基础）
        const baseTodos = allTodos[currentUser?.id] || cruiseData.defaultTodos;

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
                ${(baseTodos[key] || []).map(todo => {
                    // 获取每个用户的完成状态
                    const userStatuses = members.map(member => {
                        const memberTodos = allTodos[member.id] || {};
                        const memberCategory = memberTodos[key] || [];
                        const memberTodo = memberCategory.find(t => t.id === todo.id);
                        const isCompleted = memberTodo?.completed?.[member.id] || false;
                        return {
                            member,
                            isCompleted,
                            isCurrentUser: member.id === currentUser?.id
                        };
                    });

                    const currentUserCompleted = userStatuses.find(s => s.isCurrentUser)?.isCompleted || false;
                    const completedCount = userStatuses.filter(s => s.isCompleted).length;
                    const totalCount = members.length;
                    const allCompleted = completedCount === totalCount;

                    return `
                        <div class="todo-item ${allCompleted ? 'fully-completed' : ''}">
                            <div class="todo-checkbox ${currentUserCompleted ? 'checked' : ''}"
                                 onclick="DisneyCruiseApp.toggleTodo('${key}', '${todo.id}')">
                            </div>
                            <div class="todo-content">
                                <div class="todo-text ${currentUserCompleted ? 'completed' : ''}">${todo.text}</div>
                                <div class="todo-user-status">
                                    ${userStatuses.map(s => `
                                        <span class="user-status ${s.isCompleted ? 'done' : 'pending'}"
                                              title="${s.member.name} (${s.member.groupName})">
                                            ${s.member.emoji} ${s.member.name}
                                            ${s.isCompleted ? '✓' : '○'}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="todo-delete" onclick="DisneyCruiseApp.deleteTodo('${key}', '${todo.id}')">🗑️</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `).join('');
    },

    toggleTodo(category, id) {
        if (Storage.toggleTodoStatus(category, id)) {
            this.renderTodos();
            this.updateTodoProgress();
        }
    },

    deleteTodo(category, id) {
        // 删除所有用户数据中的这条待办
        const members = cruiseData.members;
        members.forEach(member => {
            const key = Storage.keys.TODOS_PREFIX + member.id;
            const data = localStorage.getItem(key);
            if (data) {
                const todos = JSON.parse(data);
                if (todos[category]) {
                    todos[category] = todos[category].filter(t => t.id !== id);
                    localStorage.setItem(key, JSON.stringify(todos));
                }
            }
        });
        this.renderTodos();
        this.updateTodoProgress();
    },

    addTodo(category, text) {
        const members = cruiseData.members;
        const newId = Date.now().toString();
        const newTodo = {
            id: newId,
            text: text,
            completed: { userZ: false, userW: false, userY: false }
        };

        // 为所有用户添加这条待办
        members.forEach(member => {
            const key = Storage.keys.TODOS_PREFIX + member.id;
            const data = localStorage.getItem(key);
            let todos;
            if (data) {
                todos = JSON.parse(data);
            } else {
                todos = JSON.parse(JSON.stringify(cruiseData.defaultTodos));
            }
            todos[category].push(newTodo);
            localStorage.setItem(key, JSON.stringify(todos));
        });

        this.renderTodos();
        this.updateTodoProgress();
    },

    updateTodoProgress() {
        const allTodos = Storage.getAllTodosWithStatus();
        const members = cruiseData.members;

        let totalItems = 0;
        let totalCompleted = 0;

        // 以第一个用户的待办为基准统计
        const baseUserId = members[0]?.id;
        const baseTodos = allTodos[baseUserId] || {};

        Object.values(baseTodos).forEach(category => {
            category.forEach(todo => {
                totalItems++;
                // 检查是否三人都完成
                const allDone = members.every(m => {
                    const mTodos = allTodos[m.id] || {};
                    const cat = Object.keys(baseTodos).find(k =>
                        (baseTodos[k] || []).some(t => t.id === todo.id)
                    );
                    if (!cat) return false;
                    const mTodo = (mTodos[cat] || []).find(t => t.id === todo.id);
                    return mTodo?.completed?.[m.id] || false;
                });
                if (allDone) totalCompleted++;
            });
        });

        const percentage = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

        const progressFill = document.getElementById('todoProgress');
        const progressText = document.getElementById('progressText');

        if (progressFill) progressFill.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${percentage}% 完成 (${totalCompleted}/${totalItems})`;
    },

    // 预订管理
    initBookings() {
        this.renderBookings();
    },

    renderBookings() {
        const container = document.getElementById('bookingsContainer');
        if (!container) return;

        const bookings = Storage.getBookings();
        const currentUser = Storage.getCurrentUser();

        container.innerHTML = `
            <div class="bookings-actions">
                <button class="btn-primary" onclick="DisneyCruiseApp.openBookingModal()">+ 添加预订</button>
            </div>
            ${bookings.map((booking, index) => `
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
                    <div class="booking-footer">
                        <div class="booking-price">¥${booking.price.toLocaleString()}</div>
                        <div class="booking-actions">
                            <button class="booking-edit-btn" onclick="DisneyCruiseApp.editBooking(${index})">✏️ 编辑</button>
                            <button class="booking-delete-btn" onclick="DisneyCruiseApp.deleteBooking(${index})">🗑️ 删除</button>
                        </div>
                    </div>
                </div>
            `).join('')}
        `;
    },

    openBookingModal(bookingIndex = null) {
        const bookings = Storage.getBookings();
        const booking = bookingIndex !== null ? bookings[bookingIndex] : null;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'bookingModal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${booking ? '✏️ 编辑预订' : '+ 添加预订'}</h3>
                    <button class="modal-close" onclick="document.getElementById('bookingModal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <select class="modal-select" id="bookingType">
                        <option value="cruise" ${booking?.type === 'cruise' ? 'selected' : ''}>🚢 邮轮</option>
                        <option value="flight" ${booking?.type === 'flight' ? 'selected' : ''}>✈️ 机票</option>
                        <option value="hotel" ${booking?.type === 'hotel' ? 'selected' : ''}>🏨 酒店</option>
                        <option value="tour" ${booking?.type === 'tour' ? 'selected' : ''}>🎢 门票</option>
                        <option value="other" ${booking?.type === 'other' ? 'selected' : ''}>📦 其他</option>
                    </select>
                    <input type="text" class="modal-input" id="bookingItemName" placeholder="项目名称"
                           value="${booking?.itemName || ''}">
                    <input type="number" class="modal-input" id="bookingPrice" placeholder="价格（元）"
                           value="${booking?.price || ''}">
                    <input type="text" class="modal-input" id="bookingOrderNumber" placeholder="订单号"
                           value="${booking?.orderNumber || ''}">
                    <select class="modal-select" id="bookingStatus">
                        <option value="confirmed" ${booking?.status === 'confirmed' ? 'selected' : ''}>已确认</option>
                        <option value="pending" ${booking?.status === 'pending' ? 'selected' : ''}>待定</option>
                    </select>
                    <textarea class="modal-textarea" id="bookingDetails" placeholder="详细信息（每行一个，格式：标签: 值）">${booking?.details?.map(d => `${d.label}: ${d.value}`).join('\n') || ''}</textarea>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="document.getElementById('bookingModal').remove()">取消</button>
                    <button class="btn-primary" onclick="DisneyCruiseApp.saveBooking(${bookingIndex !== null ? bookingIndex : 'null'})">保存</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    },

    saveBooking(bookingIndex) {
        const type = document.getElementById('bookingType').value;
        const itemName = document.getElementById('bookingItemName').value.trim();
        const price = parseFloat(document.getElementById('bookingPrice').value);
        const orderNumber = document.getElementById('bookingOrderNumber').value.trim();
        const status = document.getElementById('bookingStatus').value;
        const detailsText = document.getElementById('bookingDetails').value.trim();

        if (!itemName || !price) {
            this.showToast('⚠️ 请填写项目名称和价格');
            return;
        }

        // 解析详细信息
        const details = detailsText.split('\n').filter(line => line.trim()).map(line => {
            const [label, ...valueParts] = line.split(':');
            return {
                label: label.trim(),
                value: valueParts.join(':').trim()
            };
        });

        // 类型图标映射
        const icons = {
            cruise: '🚢',
            flight: '✈️',
            hotel: '🏨',
            tour: '🎢',
            other: '📦'
        };

        // 类型名称映射
        const typeNames = {
            cruise: '邮轮',
            flight: '机票',
            hotel: '酒店',
            tour: '门票',
            other: '其他'
        };

        const newBooking = {
            id: bookingIndex !== null ? undefined : Date.now().toString(),
            type,
            typeName: typeNames[type],
            icon: icons[type],
            itemName,
            details,
            price,
            status,
            orderNumber
        };

        const bookings = Storage.getBookings();

        if (bookingIndex !== null) {
            // 编辑现有预订
            newBooking.id = bookings[bookingIndex].id;
            bookings[bookingIndex] = newBooking;
            this.showToast('✅ 预订已更新');
        } else {
            // 添加新预订
            newBooking.id = 'bk' + Date.now();
            bookings.push(newBooking);
            this.showToast('✅ 预订已添加');
        }

        Storage.saveBookings(bookings);
        document.getElementById('bookingModal').remove();
        this.renderBookings();
    },

    editBooking(index) {
        this.openBookingModal(index);
    },

    deleteBooking(index) {
        if (confirm('确定要删除这条预订信息吗？')) {
            const bookings = Storage.getBookings();
            bookings.splice(index, 1);
            Storage.saveBookings(bookings);
            this.showToast('✅ 预订已删除');
            this.renderBookings();
        }
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
    },

    // ========================================
    // 设置与同步功能
    // ========================================

    // 初始化设置页
    initSettings() {
        // 打开同步弹窗
        const openSyncBtn = document.getElementById('openSyncBtn');
        if (openSyncBtn) {
            openSyncBtn.addEventListener('click', () => this.openSyncModal());
        }

        // 导出数据按钮
        const exportDataBtn = document.getElementById('exportDataBtn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => this.exportAllData());
        }

        // 导入数据按钮
        const importDataBtn = document.getElementById('importDataBtn');
        if (importDataBtn) {
            importDataBtn.addEventListener('click', () => this.openImportModal());
        }

        // 清除数据按钮
        const clearDataBtn = document.getElementById('clearDataBtn');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => this.clearAllData());
        }

        // 更新同步状态显示
        this.updateSyncStatus();
    },

    // 更新同步状态显示
    updateSyncStatus() {
        const statusEl = document.getElementById('syncStatus');
        if (!statusEl) return;

        const config = GistSync.getConfig();
        const lastSync = GistSync.getLastSync();

        if (config.gistId) {
            const timeText = lastSync ?
                `上次同步: ${lastSync.toLocaleString('zh-CN')}` :
                '已连接，等待首次同步';
            statusEl.innerHTML = `
                <div class="sync-status-icon">☁️</div>
                <div class="sync-status-text">
                    <p class="sync-status-main">已连接</p>
                    <p class="sync-status-sub">${timeText}</p>
                </div>
            `;
        } else {
            statusEl.innerHTML = `
                <div class="sync-status-icon">📵</div>
                <div class="sync-status-text">
                    <p class="sync-status-main">未连接</p>
                    <p class="sync-status-sub">数据仅存储在本地</p>
                </div>
            `;
        }
    },

    // 打开同步弹窗
    openSyncModal() {
        const modal = document.getElementById('syncModal');
        if (modal) {
            modal.classList.add('active');
            this.updateSyncModalUI();
        }
    },

    // 关闭同步弹窗
    closeSyncModal() {
        const modal = document.getElementById('syncModal');
        if (modal) {
            modal.classList.remove('active');
        }
    },

    // 更新同步弹窗UI
    updateSyncModalUI() {
        const config = GistSync.getConfig();
        const lastSync = GistSync.getLastSync();
        const isConnected = GistSync.isConnected();

        // 更新连接状态
        const statusEl = document.getElementById('syncConnectionStatus');
        if (statusEl) {
            const dot = statusEl.querySelector('.status-dot');
            const text = statusEl.querySelector('.status-text');
            if (isConnected) {
                dot.classList.remove('offline');
                text.textContent = '已连接';
            } else {
                dot.classList.add('offline');
                text.textContent = '未连接';
            }
        }

        // 显示/隐藏操作区域
        const actionsSection = document.getElementById('syncActionsSection');
        if (actionsSection) {
            actionsSection.style.display = isConnected ? 'block' : 'none';
        }

        // 更新已连接信息
        if (isConnected) {
            const gistIdEl = document.getElementById('connectedGistId');
            const lastSyncEl = document.getElementById('lastSyncTime');
            if (gistIdEl) gistIdEl.textContent = config.gistId.substring(0, 12) + '...';
            if (lastSyncEl) {
                lastSyncEl.textContent = lastSync ?
                    lastSync.toLocaleString('zh-CN') : '从未';
            }
        }
    },

    // 创建新的 Gist
    async createNewGist() {
        const isPublic = document.getElementById('isPublicGist')?.checked ?? true;
        const token = document.getElementById('githubToken')?.value || null;

        this.showToast('⏳ 正在创建分享链接...');

        const data = Storage.exportAllData();
        const result = await GistSync.createGist(data, token, isPublic);

        if (result.success) {
            // 保存配置
            GistSync.saveConfig({
                gistId: result.gistId,
                token: token,
                autoSync: true
            });
            GistSync.saveLastSync();

            this.showToast('✅ 分享链接创建成功！');

            // 显示 Gist ID 供复制
            setTimeout(() => {
                alert(`分享链接已创建！\n\nGist ID: ${result.gistId}\n\n请保存此 ID，其他人可以用它连接到你的数据。\n\n查看链接: ${result.htmlUrl}`);
            }, 300);

            this.updateSyncModalUI();
            this.updateSyncStatus();
        } else {
            this.showToast(`❌ 创建失败: ${result.error}`);
        }
    },

    // 连接到现有 Gist
    async connectToGist() {
        const gistId = document.getElementById('gistIdInput')?.value.trim();
        if (!gistId) {
            this.showToast('⚠️ 请输入 Gist ID');
            return;
        }

        this.showToast('⏳ 正在连接...');

        const result = await GistSync.fetchGist(gistId);

        if (result.success) {
            // 导入数据
            Storage.importAllData(result.data);

            // 保存配置
            GistSync.saveConfig({
                gistId: gistId,
                token: null,
                autoSync: true
            });
            GistSync.saveLastSync();

            this.showToast('✅ 连接成功！数据已同步');

            // 刷新页面数据
            this.initUserFeatures();
            this.updateSyncModalUI();
            this.updateSyncStatus();
        } else {
            this.showToast(`❌ 连接失败: ${result.error}`);
        }
    },

    // 上传数据到云端
    async syncUp() {
        this.showToast('⏳ 正在上传...');

        const result = await GistSync.syncUp();

        if (result.success) {
            this.showToast('✅ 上传成功！');
            this.updateSyncModalUI();
            this.updateSyncStatus();
        } else {
            this.showToast(`❌ 上传失败: ${result.error}`);
        }
    },

    // 从云端下载数据
    async syncDown() {
        this.showToast('⏳ 正在下载...');

        const result = await GistSync.syncDown();

        if (result.success) {
            this.showToast('✅ 下载成功！');
            this.initUserFeatures();
            this.updateSyncModalUI();
            this.updateSyncStatus();
        } else {
            this.showToast(`❌ 下载失败: ${result.error}`);
        }
    },

    // 断开连接
    disconnectGist() {
        if (confirm('确定要断开云端同步吗？本地数据将保留。')) {
            GistSync.disconnect();
            this.showToast('✅ 已断开连接');
            this.updateSyncModalUI();
            this.updateSyncStatus();
        }
    },

    // 导出所有数据
    exportAllData() {
        const data = Storage.exportAllData();
        const jsonStr = JSON.stringify(data, null, 2);

        // 创建下载
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `disney-cruise-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('✅ 数据已导出！');
    },

    // 打开导入弹窗
    openImportModal() {
        const modal = document.getElementById('importModal');
        if (modal) {
            modal.classList.add('active');
            document.getElementById('importDataText').value = '';
        }
    },

    // 关闭导入弹窗
    closeImportModal() {
        const modal = document.getElementById('importModal');
        if (modal) {
            modal.classList.remove('active');
        }
    },

    // 导入数据
    importData() {
        const textarea = document.getElementById('importDataText');
        if (!textarea) return;

        const jsonStr = textarea.value.trim();
        if (!jsonStr) {
            this.showToast('⚠️ 请输入数据');
            return;
        }

        try {
            const data = JSON.parse(jsonStr);
            const success = Storage.importAllData(data);

            if (success) {
                this.showToast('✅ 数据导入成功！');
                this.closeImportModal();
                this.initUserFeatures();
            } else {
                this.showToast('❌ 数据导入失败');
            }
        } catch (e) {
            this.showToast('❌ 无效的 JSON 数据');
        }
    },

    // 清除所有数据
    clearAllData() {
        if (confirm('⚠️ 警告：这将清除所有本地数据！\n\n此操作不可恢复，确定要继续吗？')) {
            if (confirm('再次确认：真的要清除所有数据吗？')) {
                Storage.clearAll();
                GistSync.disconnect();
                this.showToast('✅ 所有数据已清除');
                location.reload();
            }
        }
    }
};

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    DisneyCruiseApp.init();
});
