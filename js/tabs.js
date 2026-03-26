// ========================================    // 标签切换逻辑（优化版）    // ========================================    const TabManager = {
    tabs: null,
    pages: null,
    currentTab: 'itinerary',
    isAnimating: false,

    init() {
        this.tabs = document.querySelectorAll('.tab-item');
        this.pages = document.querySelectorAll('.page');

        // 初始化当前标签
        const activeTab = document.querySelector('.tab-item.active');
        if (activeTab) {
            this.currentTab = activeTab.dataset.tab;
        }

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

        // 防止重复点击或动画中切换
        if (!targetTab || this.currentTab === targetId || this.isAnimating) return;

        this.isAnimating = true;
        const prevTab = this.currentTab;
        this.currentTab = targetId;

        // 获取当前页面和新页面
        const currentPage = document.getElementById(prevTab);
        const targetPage = document.getElementById(targetId);

        // 立即更新标签状态
        this.tabs.forEach(t => t.classList.remove('active'));
        targetTab.classList.add('active');

        // 页面切换动画
        if (currentPage) {
            currentPage.style.animation = 'fadeOut 0.2s ease forwards';
        }

        setTimeout(() => {
            // 隐藏当前页面
            if (currentPage) {
                currentPage.classList.remove('active');
                currentPage.style.animation = '';
            }

            // 显示新页面
            if (targetPage) {
                targetPage.classList.add('active');
                targetPage.style.animation = 'fadeIn 0.3s ease';

                // 滚动到顶部
                const mainContent = document.querySelector('.main-content');
                if (mainContent) {
                    mainContent.scrollTop = 0;
                }
            }

            this.isAnimating = false;

            // 触发页面切换事件
            document.dispatchEvent(new CustomEvent('tabChange', { detail: { tab: targetId } }));
        }, 200);
    },

    // 切换到指定标签
    switchTo(tabId) {
        this.performSwitch(tabId);
    }
};

// 添加淡出动画
const tabStyle = document.createElement('style');
tabStyle.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-10px); }
    }
`;
document.head.appendChild(tabStyle);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    TabManager.init();
});
