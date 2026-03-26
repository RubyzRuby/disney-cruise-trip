// ========================================
// GitHub Gist 同步模块（Gitee Pages 版本）
// Token 由用户在首次使用时输入
// ========================================

const GistSync = {
    // Gist API 基础 URL
    API_BASE: 'https://api.github.com/gists',

    // 默认配置（Gist ID 公开没关系，Token 需要保密）
    DEFAULT_GIST_ID: 'c458bba1a1ea0dcb4b95257760538f2b',
    DEFAULT_TOKEN: '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', // 首次使用时自动填充

    // 存储键名
    keys: {
        TOKEN: 'disney_cruise_token',
        LAST_SYNC: 'disney_cruise_last_sync'
    },

    // 获取 Token（优先从 localStorage，其次用默认值）
    getToken() {
        return localStorage.getItem(this.keys.TOKEN) || this.DEFAULT_TOKEN;
    },

    // 保存 Token
    saveToken(token) {
        localStorage.setItem(this.keys.TOKEN, token);
    },

    // 获取最后同步时间
    getLastSync() {
        const data = localStorage.getItem(this.keys.LAST_SYNC);
        return data ? new Date(data) : null;
    },

    // 保存最后同步时间
    saveLastSync(date = new Date()) {
        localStorage.setItem(this.keys.LAST_SYNC, date.toISOString());
    },

    // 检查是否已设置 Token
    hasToken() {
        return !!localStorage.getItem(this.keys.TOKEN);
    },

    // 获取 Gist
    async fetchGist() {
        const gistId = this.DEFAULT_GIST_ID;
        try {
            const response = await fetch(`${this.API_BASE}/${gistId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Gist 不存在');
                }
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            const filename = 'disney-cruise-data.json';
            const file = result.files[filename];

            if (!file) {
                throw new Error('Gist 中没有找到旅行数据文件');
            }

            // 获取文件内容
            const contentResponse = await fetch(file.raw_url);
            const content = await contentResponse.text();

            return {
                success: true,
                data: JSON.parse(content),
                gistId: result.id,
                updatedAt: result.updated_at
            };
        } catch (error) {
            console.error('获取 Gist 失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // 更新 Gist
    async updateGist(data) {
        const gistId = this.DEFAULT_GIST_ID;
        const token = this.getToken();
        const filename = 'disney-cruise-data.json';
        const content = JSON.stringify(data, null, 2);

        const body = {
            description: '迪士尼邮轮旅行计划数据同步',
            files: {
                [filename]: {
                    content: content
                }
            }
        };

        try {
            const response = await fetch(`${this.API_BASE}/${gistId}`, {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            const result = await response.json();
            return {
                success: true,
                gistId: result.id,
                updatedAt: result.updated_at
            };
        } catch (error) {
            console.error('更新 Gist 失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // 执行同步（上传）
    async syncUp() {
        const data = Storage.exportAllData();
        const result = await this.updateGist(data);

        if (result.success) {
            this.saveLastSync();
        }

        return result;
    },

    // 执行同步（下载）
    async syncDown() {
        const result = await this.fetchGist();

        if (result.success) {
            // 导入数据
            Storage.importAllData(result.data);
            this.saveLastSync();
        }

        return result;
    },

    // 双向同步（先下载，再上传合并后的数据）
    async sync() {
        // 1. 先下载远程数据
        const fetchResult = await this.fetchGist();

        if (!fetchResult.success) {
            return fetchResult;
        }

        // 2. 合并数据（简单策略：以最新时间戳为准）
        const remoteData = fetchResult.data;
        const localData = Storage.exportAllData();

        const remoteTime = new Date(remoteData.exportedAt || 0);
        const localTime = new Date(localData.exportedAt || 0);

        if (remoteTime > localTime) {
            // 远程数据更新，使用远程数据
            Storage.importAllData(remoteData);
            this.saveLastSync();
            return {
                success: true,
                action: 'download',
                message: '已下载远程更新'
            };
        } else if (localTime > remoteTime) {
            // 本地数据更新，上传到远程
            const updateResult = await this.updateGist(localData);
            if (updateResult.success) {
                this.saveLastSync();
                return {
                    success: true,
                    action: 'upload',
                    message: '已上传本地更新'
                };
            }
            return updateResult;
        } else {
            // 数据相同，无需同步
            this.saveLastSync();
            return {
                success: true,
                action: 'none',
                message: '数据已是最新'
            };
        }
    },

    // 自动同步
    async autoSync() {
        console.log('Auto-sync triggered...');
        // 延迟执行，避免频繁操作触发多次同步
        if (this._syncTimeout) {
            clearTimeout(this._syncTimeout);
        }
        this._syncTimeout = setTimeout(async () => {
            const result = await this.syncUp();
            if (result.success) {
                console.log('Auto-sync successful');
            } else {
                console.log('Auto-sync failed:', result.error);
            }
        }, 2000); // 延迟2秒执行
    },

    // 检查是否已连接（始终返回 true，因为已硬编码）
    isConnected() {
        return true;
    },

    // 断开连接（清除本地同步时间）
    disconnect() {
        localStorage.removeItem(this.keys.LAST_SYNC);
    },

    // 获取分享链接
    getShareUrl() {
        return `https://gist.github.com/${this.DEFAULT_GIST_ID}`;
    }
};
