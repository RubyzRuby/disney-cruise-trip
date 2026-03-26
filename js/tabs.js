// ========================================    // 标签切换逻辑（优化版）    // ========================================    const TabManager = {
    tabs: null,
    pages: null,
    currentTab: 'itinerary',

    init() {
        this.tabs = document.querySelectorAll('.tab-item');
        this.pages = document.querySelectorAll('.page');

        this.tabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e));
        });

        // 添加键盘快捷键支持
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                const tabMap = { '1': 'itinerary', '2': 'todo', '3': 'bookings', '4': 'expense', '5': 'sos' };
                if (tabMap[e.key]) {
                    this.switchTo(tabMap[e.key]);
                }
            }
        });
    },

    switchTab(e) {
        const targetTab = e.currentTarget;
        const targetId = targetTab.dataset.tab;
        this.performSwitch(targetId, targetTab);
    },

    performSwitch(targetId, targetTab = null) {
        if (!targetTab) {
            targetTab = document.querySelector(`.tab-item[data-tab="${targetId}"]`);
        }
        if (!targetTab || this.currentTab === targetId) return;

        this.currentTab = targetId;

        // 移除所有活动状态
        this.tabs.forEach(t => t.classList.remove('active'));
        this.pages.forEach(p => {
            if (p.classList.contains('active')) {
                p.style.animation = 'fadeOut 0.2s ease';
            }
        });

        // 延迟切换以显示动画
        setTimeout(() => {
            this.pages.forEach(p => {
                p.classList.remove('active');
                p.style.animation = '';
            });

            // 添加新的活动状态
            targetTab.classList.add('active');
            const targetPage = document.getElementById(targetId);
            if (targetPage) {
                targetPage.classList.add('active');
                // 滚动到顶部
                const mainContent = document.querySelector('.main-content');
                if (mainContent) {
                    mainContent.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }

            // 触发页面切换事件
            document.dispatchEvent(new CustomEvent('tabChange', { detail: { tab: targetId } }));
        }, 150);
    },

    // 切换到指定标签
    switchTo(tabId) {
        this.performSwitch(tabId);
    }
};

// 添加淡出动画
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-10px); }
    }
`;
document.head.appendChild(style);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    TabManager.init();
});
