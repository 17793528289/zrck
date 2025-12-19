// database-tool.js - 完整的数据库操作工具
// =====================================
// 版本: 2.0.0
// 功能: Supabase数据库操作工具类，支持增删改查、实时订阅、批量操作等

class SiteDatabase {
    constructor(options = {}) {
        // 参数验证和配置合并
        this.config = this._validateConfig(options);
        this.supabase = null;
        this.currentPage = options.defaultPage || 'home';
        this.channel = null;
        this.isConnected = false;
        this._initCallbacks = [];
        
        // 自动初始化
        if (options.autoInit !== false) {
            this.initialize();
        }
    }
    
    // ================= 初始化方法 =================
    
    // 配置验证
    _validateConfig(options) {
        const config = {
            url: options.url || window.SUPABASE_CONFIG?.url,
            key: options.key || window.SUPABASE_CONFIG?.key,
            autoTestConnection: options.autoTestConnection !== false,
            maxRetries: options.maxRetries || 3,
            retryDelay: options.retryDelay || 1000
        };
        
        if (!config.url || !config.key) {
            throw new Error('Supabase配置不完整，需要url和key参数[6,7](@ref)');
        }
        
        if (!config.url.startsWith('https://')) {
            throw new Error('Supabase URL必须以https开头');
        }
        
        return config;
    }
    
    // 初始化数据库连接
    async initialize() {
        try {
            if (!window.supabase) {
                throw new Error('Supabase SDK未加载，请确保在引入此工具前加载Supabase客户端库[6](@ref)');
            }
            
            this.supabase = window.supabase.createClient(this.config.url, this.config.key, {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true
                }
            });
            
            console.log('✅ 数据库工具初始化成功');
            
            // 测试连接
            if (this.config.autoTestConnection) {
                const testResult = await this.testConnection();
                this.isConnected = testResult.success;
                
                if (this.isConnected) {
                    console.log('✅ 数据库连接测试通过');
                    this._executeInitCallbacks();
                } else {
                    console.warn('⚠️ 数据库连接测试失败:', testResult.message);
                }
            }
            
            return { success: true, connected: this.isConnected };
            
        } catch (error) {
            console.error('❌ 数据库初始化失败:', error.message);
            return { 
                success: false, 
                error: error.message,
                connected: false
            };
        }
    }
    
    // 初始化回调管理
    onInit(callback) {
        if (this.isConnected) {
            callback();
        } else {
            this._initCallbacks.push(callback);
        }
    }
    
    _executeInitCallbacks() {
        this._initCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('初始化回调执行失败:', error);
            }
        });
        this._initCallbacks = [];
    }
    
    // ================= 核心数据库操作 =================
    
    // 保存内容到数据库（支持upsert操作）
    async saveContent(sectionName, content, options = {}) {
        try {
            if (!this.supabase) {
                throw new Error('数据库未初始化');
            }
            
            if (!sectionName?.trim()) {
                throw new Error('区块名称不能为空');
            }
            
            const now = new Date().toISOString();
            const data = {
                page_name: this.currentPage,
                section_name: sectionName.trim(),
                content: content,
                updated_at: now
            };
            
            console.log(`💾 保存内容: ${sectionName}`, options.debug ? content : '');
            
            // 使用upsert操作，简化逻辑[6](@ref)
            const { error } = await this._withRetry(() => 
                this.supabase
                    .from('site_data')
                    .upsert(data, {
                        onConflict: 'page_name,section_name',
                        ignoreDuplicates: false
                    })
            );
            
            if (error) throw error;
            
            // 成功回调
            if (options.onSuccess) {
                options.onSuccess(sectionName, content);
            }
            
            return { 
                success: true, 
                action: 'saved',
                section: sectionName,
                timestamp: now
            };
            
        } catch (error) {
            console.error(`❌ 保存失败 [${sectionName}]:`, error.message);
            
            // 错误回调
            if (options.onError) {
                options.onError(error, sectionName, content);
            }
            
            return { 
                success: false, 
                error: error.message,
                section: sectionName
            };
        }
    }
    
    // 获取单个区块内容
    async getContent(sectionName, options = {}) {
        try {
            if (!this.supabase) {
                throw new Error('数据库未初始化');
            }
            
            const { data, error } = await this._withRetry(() =>
                this.supabase
                    .from('site_data')
                    .select(options.fields || 'content, updated_at')
                    .eq('page_name', this.currentPage)
                    .eq('section_name', sectionName)
                    .maybeSingle()
            );
            
            if (error) {
                if (error.code === 'PGRST116') {
                    return options.defaultValue !== undefined ? options.defaultValue : '';
                }
                throw error;
            }
            
            return options.returnFullData ? data : (data?.content || '');
            
        } catch (error) {
            console.error(`❌ 获取内容失败 [${sectionName}]:`, error);
            
            if (options.onError) {
                options.onError(error, sectionName);
            }
            
            return options.defaultValue !== undefined ? options.defaultValue : '';
        }
    }
    
    // 获取整个页面的所有区块
    async getPageContents(options = {}) {
        try {
            if (!this.supabase) {
                throw new Error('数据库未初始化');
            }
            
            const { data, error } = await this._withRetry(() =>
                this.supabase
                    .from('site_data')
                    .select('section_name, content, created_at, updated_at')
                    .eq('page_name', this.currentPage)
                    .order('updated_at', { ascending: false })
            );
            
            if (error) throw error;
            
            // 转换为对象格式
            const contents = {};
            const metadata = {};
            
            (data || []).forEach(item => {
                contents[item.section_name] = item.content;
                metadata[item.section_name] = {
                    created_at: item.created_at,
                    updated_at: item.updated_at
                };
            });
            
            return options.includeMetadata ? { contents, metadata } : contents;
            
        } catch (error) {
            console.error('❌ 获取页面内容失败:', error);
            
            if (options.onError) {
                options.onError(error, this.currentPage);
            }
            
            return options.includeMetadata ? { contents: {}, metadata: {} } : {};
        }
    }
    
    // 删除区块
    async deleteSection(sectionName, options = {}) {
        try {
            if (!this.supabase) {
                throw new Error('数据库未初始化');
            }
            
            const { error } = await this._withRetry(() =>
                this.supabase
                    .from('site_data')
                    .delete()
                    .eq('page_name', this.currentPage)
                    .eq('section_name', sectionName)
            );
            
            if (error) throw error;
            
            console.log(`✅ 删除成功: ${sectionName}`);
            
            if (options.onSuccess) {
                options.onSuccess(sectionName);
            }
            
            return { success: true, section: sectionName };
            
        } catch (error) {
            console.error(`❌ 删除失败 [${sectionName}]:`, error);
            
            if (options.onError) {
                options.onError(error, sectionName);
            }
            
            return { success: false, error: error.message, section: sectionName };
        }
    }
    
    // ================= 高级功能 =================
    
    // 重试机制
    async _withRetry(operation, retries = this.config.maxRetries) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const result = await operation();
                return result;
            } catch (error) {
                if (attempt === retries) throw error;
                
                console.warn(`⚠️ 操作失败，第${attempt}次重试...`, error.message);
                await this._delay(this.config.retryDelay * attempt);
            }
        }
    }
    
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // 实时监听变化[7](@ref)
    subscribeToChanges(callback, options = {}) {
        if (!this.supabase) {
            console.error('❌ 数据库未初始化，无法订阅变更');
            return null;
        }
        
        if (this.channel) {
            this.unsubscribe();
        }
        
        const events = options.events || ['INSERT', 'UPDATE', 'DELETE'];
        const filter = options.filter || `page_name=eq.${this.currentPage}`;
        
        this.channel = this.supabase
            .channel('site-data-changes')
            .on('postgres_changes', {
                event: events[0],
                schema: 'public',
                table: 'site_data',
                filter: filter
            }, (payload) => {
                try {
                    console.log('📡 数据变更:', payload);
                    callback(payload);
                } catch (error) {
                    console.error('❌ 订阅回调执行失败:', error);
                }
            })
            .subscribe((status) => {
                console.log('📡 订阅状态:', status);
                
                if (status === 'SUBSCRIBED' && options.onSubscribed) {
                    options.onSubscribed();
                }
            });
        
        return this.channel;
    }
    
    // 取消订阅
    unsubscribe() {
        if (this.channel && this.supabase) {
            this.supabase.removeChannel(this.channel);
            this.channel = null;
            console.log('🔕 已取消数据订阅');
        }
    }
    
    // 批量保存多个区块
    async saveMultipleSections(sections, options = {}) {
        const results = [];
        const batchId = Date.now();
        
        try {
            // 小批量数据直接并行处理
            if (Object.keys(sections).length <= 10) {
                const promises = Object.entries(sections).map(([sectionName, content]) =>
                    this.saveContent(sectionName, content, options)
                );
                
                const batchResults = await Promise.all(promises);
                results.push(...batchResults);
            } else {
                // 大批量数据分批处理
                const sectionsArray = Object.entries(sections);
                const batchSize = options.batchSize || 5;
                
                for (let i = 0; i < sectionsArray.length; i += batchSize) {
                    const batch = sectionsArray.slice(i, i + batchSize);
                    const batchPromises = batch.map(([sectionName, content]) =>
                        this.saveContent(sectionName, content, options)
                    );
                    
                    const batchResults = await Promise.all(batchPromises);
                    results.push(...batchResults);
                    
                    // 批次间延迟
                    if (i + batchSize < sectionsArray.length) {
                        await this._delay(100);
                    }
                }
            }
            
            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success);
            
            console.log(`✅ 批量操作完成: ${successful}成功, ${failed.length}失败`);
            
            return {
                success: failed.length === 0,
                batchId,
                results,
                total: results.length,
                successful: successful,
                failed: failed.length
            };
            
        } catch (error) {
            console.error('❌ 批量操作失败:', error);
            return {
                success: false,
                batchId,
                error: error.message,
                results
            };
        }
    }
    
    // 设置当前页面
    setCurrentPage(pageName, options = {}) {
        if (!pageName?.trim()) {
            console.warn('⚠️ 页面名称不能为空');
            return false;
        }
        
        const oldPage = this.currentPage;
        this.currentPage = pageName.trim();
        
        console.log(`📄 页面切换: ${oldPage} → ${this.currentPage}`);
        
        // 重新订阅（如果之前有订阅）
        if (options.resubscribe && this.channel) {
            this.unsubscribe();
            if (options.subscribeCallback) {
                this.subscribeToChanges(options.subscribeCallback);
            }
        }
        
        if (options.onPageChange) {
            options.onPageChange(oldPage, this.currentPage);
        }
        
        return true;
    }
    
    // 测试数据库连接
    async testConnection() {
        try {
            if (!this.supabase) {
                throw new Error('数据库客户端未初始化');
            }
            
            const startTime = Date.now();
            const { data, error } = await this.supabase
                .from('site_data')
                .select('count')
                .limit(1)
                .single();
            
            if (error) throw error;
            
            const responseTime = Date.now() - startTime;
            
            return { 
                success: true, 
                message: `数据库连接正常 (${responseTime}ms)`,
                responseTime: responseTime
            };
            
        } catch (error) {
            return { 
                success: false, 
                message: '连接失败: ' + error.message,
                responseTime: null
            };
        }
    }
    
    // 获取数据库统计信息
    async getStats() {
        try {
            if (!this.supabase) {
                throw new Error('数据库未初始化');
            }
            
            const { data, error } = await this.supabase
                .from('site_data')
                .select('page_name, section_name, updated_at')
                .order('updated_at', { ascending: false });
            
            if (error) throw error;
            
            const stats = {
                totalSections: data?.length || 0,
                pages: {},
                lastUpdated: data?.[0]?.updated_at || null
            };
            
            // 按页面分组统计
            data?.forEach(item => {
                if (!stats.pages[item.page_name]) {
                    stats.pages[item.page_name] = 0;
                }
                stats.pages[item.page_name]++;
            });
            
            return { success: true, stats };
            
        } catch (error) {
            console.error('❌ 获取统计信息失败:', error);
            return { success: false, error: error.message, stats: null };
        }
    }
    
    // 清理资源
    destroy() {
        this.unsubscribe();
        this.supabase = null;
        this.isConnected = false;
        this._initCallbacks = [];
        console.log('🧹 数据库工具实例已清理');
    }
}

// ================= 全局实例和工具函数 =================

// 创建全局数据库实例（延迟初始化）
window.siteDB = null;

window.initSiteDatabase = function(config = {}) {
    if (!window.siteDB) {
        try {
            window.siteDB = new SiteDatabase(config);
            
            // 提供就绪状态检查
            window.siteDBReady = function(callback) {
                if (window.siteDB.isConnected) {
                    callback();
                } else {
                    window.siteDB.onInit(callback);
                }
            };
            
        } catch (error) {
            console.error('❌ 数据库初始化失败:', error);
            return null;
        }
    }
    return window.siteDB;
};

// ================= 使用示例和演示函数 =================

window.demoDatabase = {
    // 示例1: 快速保存标题
    async saveTitle(title = null) {
        if (!window.siteDB) {
            console.error('❌ 请先调用 initSiteDatabase() 初始化数据库');
            return;
        }
        
        const pageTitle = title || document.title || '默认标题';
        const result = await window.siteDB.saveContent('page_title', pageTitle, {
            debug: true,
            onSuccess: (section, content) => {
                console.log(`🎉 标题保存成功: ${section} = "${content}"`);
            }
        });
        
        console.log('保存标题结果:', result);
        return result;
    },
    
    // 示例2: 保存页面中的所有标题
    async saveAllHeadings() {
        if (!window.siteDB) return;
        
        const headings = {};
        document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading, index) => {
            const tagName = heading.tagName.toLowerCase();
            headings[`${tagName}_${index}`] = {
                text: heading.textContent,
                html: heading.innerHTML,
                level: parseInt(tagName.replace('h', ''))
            };
        });
        
        const result = await window.siteDB.saveMultipleSections(headings, {
            batchSize: 3,
            onSuccess: (section) => {
                console.log(`✅ 标题保存成功: ${section}`);
            }
        });
        
        console.log('批量保存标题结果:', result);
        return result;
    },
    
    // 示例3: 加载数据到页面元素
    async loadToPage(selectors = {}) {
        if (!window.siteDB) return;
        
        const contents = await window.siteDB.getPageContents({
            includeMetadata: true
        });
        
        let loadedCount = 0;
        
        for (const [section, content] of Object.entries(contents.contents)) {
            // 优先使用自定义选择器，然后尝试通用选择器
            const selector = selectors[section] || `[data-section="${section}"]`;
            const element = document.getElementById(section) || document.querySelector(selector);
            
            if (element && content) {
                element.innerHTML = content;
                element.setAttribute('data-loaded', 'true');
                element.setAttribute('data-updated', contents.metadata[section]?.updated_at || '');
                loadedCount++;
                
                // 添加视觉反馈
                element.style.transition = 'background-color 0.5s ease';
                element.style.backgroundColor = '#e8f5e8';
                setTimeout(() => {
                    element.style.backgroundColor = '';
                }, 1000);
            }
        }
        
        console.log(`✅ 页面数据加载完成: ${loadedCount}个区块`);
        return { loaded: loadedCount, total: Object.keys(contents.contents).length };
    },
    
    // 示例4: 开启实时监听并自动更新页面
    startLiveUpdates(options = {}) {
        if (!window.siteDB) return null;
        
        return window.siteDB.subscribeToChanges((payload) => {
            console.log('🔄 实时更新:', payload);
            
            const { new: newData, old: oldData, eventType } = payload;
            if (newData && eventType !== 'DELETE') {
                const sectionName = newData.section_name;
                const element = document.getElementById(sectionName) || 
                               document.querySelector(`[data-section="${sectionName}"]`);
                
                if (element) {
                    // 更新内容
                    element.innerHTML = newData.content || '';
                    
                    // 视觉反馈
                    element.style.transition = 'all 0.5s ease';
                    element.style.backgroundColor = options.highlightColor || '#fff3cd';
                    element.style.borderLeft = '4px solid #ffc107';
                    
                    setTimeout(() => {
                        element.style.backgroundColor = '';
                        element.style.borderLeft = '';
                    }, 2000);
                    
                    console.log(`🔁 实时更新区块: ${sectionName}`);
                }
            }
        }, {
            events: ['INSERT', 'UPDATE'],
            onSubscribed: () => {
                console.log('🎯 实时更新已启用，页面将自动同步数据变更');
            }
        });
    },
    
    // 示例5: 性能测试
    async performanceTest(iterations = 10) {
        if (!window.siteDB) return;
        
        console.log('🚀 开始性能测试...');
        const results = [];
        
        for (let i = 0; i < iterations; i++) {
            const startTime = Date.now();
            const testData = `性能测试数据 ${i} - ${Date.now()}`;
            
            const result = await window.siteDB.saveContent(`perf_test_${i}`, testData);
            const responseTime = Date.now() - startTime;
            
            results.push({
                iteration: i,
                success: result.success,
                responseTime: responseTime
            });
            
            // 清理测试数据
            if (result.success) {
                await window.siteDB.deleteSection(`perf_test_${i}`);
            }
        }
        
        const avgTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
        const successRate = (results.filter(r => r.success).length / results.length) * 100;
        
        console.log(`📊 性能测试完成: 平均响应时间 ${avgTime.toFixed(2)}ms, 成功率 ${successRate}%`);
        return { results, avgTime, successRate };
    }
};

// 自动初始化（如果配置存在）
if (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.autoInit !== false) {
    window.addEventListener('DOMContentLoaded', function() {
        window.initSiteDatabase(window.SUPABASE_CONFIG);
    });
}

console.log('🚀 数据库工具已加载！');
console.log('💡 使用方法:');
console.log('   1. 初始化: initSiteDatabase({ url: "...", key: "..." })');
console.log('   2. 保存数据: siteDB.saveContent("section", "content")');
console.log('   3. 演示功能: demoDatabase.saveTitle()');
