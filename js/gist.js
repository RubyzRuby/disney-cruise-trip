// ========================================
// GitHub Gist 同步模块
// ========================================

const GistSync = {
    // Gist API 基础 URL
    API_BASE: 'https://api.github.com/gists',

    // 存储键名
    keys: {
        CONFIG: 'disney_cruise_gist_config',
        LAST_SYNC: 'disney_cruise_last_sync'
    },

    // 获取配置
    getConfig() {
        const data = localStorage.getItem(this.keys.CONFIG);
        if (data) {
            return JSON.parse(data);
        }
        return {
            gistId: null,
            token: null,
            autoSync: false
        };
    },

    // 保存配置
    saveConfig(config) {
        localStorage.setItem(this.keys.CONFIG, JSON.stringify(config));
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

    // 创建新 Gist
    async createGist(data, token = null, isPublic = true) {
        const filename = 'disney-cruise-data.json';
        const content = JSON.stringify(data, null, 2);

        const body = {
            description: '迪士尼邮轮旅行计划数据同步',
            public: isPublic,
            files: {
                [filename]: {
                    content: content
                }
            }
        };

        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `token ${token}`;
        }

        try {
            const response = await fetch(this.API_BASE, {
                method: 'POST',
                headers: headers,
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
                htmlUrl: result.html_url,
                rawUrl: result.files[filename].raw_url
            };
        } catch (error) {
            console.error('创建 Gist 失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // 获取 Gist
    async fetchGist(gistId) {
        try {
            const response = await fetch(`${this.API_BASE}/${gistId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Gist 不存在，请检查 ID 是否正确');
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
    async updateGist(gistId, data, token) {
        if (!token) {
            return {
                success: false,
                error: '需要 GitHub Token 才能更新 Gist'
            };
        }

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
        const config = this.getConfig();

        if (!config.gistId) {
            return {
                success: false,
                error: '未配置 Gist ID'
            };
        }

        // 收集所有数据
        const data = Storage.exportAllData();

        const result = await this.updateGist(config.gistId, data, config.token);

        if (result.success) {
            this.saveLastSync();
        }

        return result;
    },

    // 执行同步（下载）
    async syncDown() {
        const config = this.getConfig();

        if (!config.gistId) {
            return {
                success: false,
                error: '未配置 Gist ID'
            };
        }

        const result = await this.fetchGist(config.gistId);

        if (result.success) {
            // 导入数据
            Storage.importAllData(result.data);
            this.saveLastSync();
        }

        return result;
    },

    // 双向同步（先下载，再上传合并后的数据）
    async sync() {
        const config = this.getConfig();

        if (!config.gistId) {
            return {
                success: false,
                error: '未配置 Gist ID，请先创建或连接 Gist'
            };
        }

        // 1. 先下载远程数据
        const fetchResult = await this.fetchGist(config.gistId);

        if (!fetchResult.success) {
            return fetchResult;
        }

        // 2. 合并数据（简单策略：以最新时间戳为准）
        const remoteData = fetchResult.data;
        const localData = Storage.exportAllData();

        // 检查冲突
        const remoteTime = new Date(remoteData.exportedAt);
        const localTime = new Date(localData.exportedAt);

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
            if (!config.token) {
                return {
                    success: false,
                    error: '本地数据较新，但需要 Token 才能上传更新'
                };
            }

            const updateResult = await this.updateGist(config.gistId, localData, config.token);
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

    // 断开连接
    disconnect() {
        this.saveConfig({
            gistId: null,
            token: null,
            autoSync: false
        });
        localStorage.removeItem(this.keys.LAST_SYNC);
    },

    // 自动同步（如果配置了自动同步且已连接）
    async autoSync() {
        const config = this.getConfig();
        if (config.autoSync && config.gistId && config.token) {
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
        }
    },

    // 检查是否已连接
    isConnected() {
        const config = this.getConfig();
        return !!config.gistId;
    },

    // 生成分享链接
    getShareUrl(gistId) {
        return `https://gist.github.com/${gistId}`;
    }
};
