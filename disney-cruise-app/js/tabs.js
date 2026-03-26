// ========================================
// 标签切换逻辑
// ========================================

const TabManager = {
    tabs: null,
    pages: null,

    init() {
        this.tabs = document.querySelectorAll('.tab-item');
        this.pages = document.querySelectorAll('.page');

        this.tabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e));
        });
    },

    switchTab(e) {
        const targetTab = e.currentTarget;
        const targetId = targetTab.dataset.tab;

        // 移除所有活动状态
        this.tabs.forEach(t => t.classList.remove('active'));
        this.pages.forEach(p => p.classList.remove('active'));

        // 添加新的活动状态
        targetTab.classList.add('active');
        const targetPage = document.getElementById(targetId);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // 触发页面切换事件
        document.dispatchEvent(new CustomEvent('tabChange', { detail: { tab: targetId } }));
    },

    // 切换到指定标签
    switchTo(tabId) {
        const targetTab = document.querySelector(`.tab-item[data-tab="${tabId}"]`);
        if (targetTab) {
            targetTab.click();
        }
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    TabManager.init();
});
