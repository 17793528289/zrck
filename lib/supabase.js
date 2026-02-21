// 从配置文件获取Supabase配置
let SUPABASE_URL = 'https://xwfcvhbneaajirmixpfj.supabase.co';
let SUPABASE_ANON_KEY = 'sb_publishable_5hrKzOXRlbtROlh13kl0ig_y4gBXXEt';

if (typeof window !== 'undefined' && window.config) {
    SUPABASE_URL = window.config.supabase.url;
    SUPABASE_ANON_KEY = window.config.supabase.anonKey;
}

// 初始化状态
window.supabase = null;
window.supabaseReady = false;
window.supabaseError = null;

// 登录服务
window.AuthService = {
    // 通过账号获取邮箱
    async getEmailByAccount(account) {
        try {
            // 检查是否是邮箱格式
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(account)) {
                // 如果是邮箱格式，直接返回
                return account;
            }
            
            // 尝试使用后端API
            if (window.supabaseReady && window.supabase) {
                const { data, error } = await window.supabase
                    .from('profiles')
                    .select('email')
                    .eq('username', account)
                    .limit(1);
                
                if (error) throw error;
                if (data && data.length > 0) {
                    return data[0].email;
                } else {
                    throw new Error('账号不存在');
                }
            } else {
                throw new Error('Supabase未初始化');
            }
        } catch (error) {
            console.error('获取邮箱失败:', error.message);
            // 检查是否是邮箱格式
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(account)) {
                // 如果是邮箱格式，直接返回
                return account;
            }
            throw new Error('账号不存在');
        }
    },
    
    // 登录方法
    async signIn(account, password) {
        try {
            // 检查是否是邮箱格式的账号
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            let email = account;
            if (!emailRegex.test(account)) {
                // 如果不是邮箱格式，尝试获取邮箱
                email = await this.getEmailByAccount(account);
            }
            
            // 使用后端API
            if (window.supabaseReady && window.supabase) {
                const { data, error } = await window.supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });
                
                if (error) {
                    console.error('登录失败:', error);
                    throw error;
                }
                
                // 尝试获取用户角色信息
                if (data.user) {
                    try {
                        // 从profiles表中获取用户角色
                        const { data: profileData, error: profileError } = await window.supabase
                            .from('profiles')
                            .select('role')
                            .eq('id', data.user.id)
                            .limit(1);
                        
                        if (profileError) {
                            console.warn('获取用户角色失败:', profileError.message);
                        } else if (profileData && profileData.length > 0) {
                            // 将角色信息添加到返回数据中
                            data.user.role = profileData[0].role;
                            if (!data.user.user_metadata) {
                                data.user.user_metadata = {};
                            }
                            data.user.user_metadata.role = profileData[0].role;
                        }
                    } catch (profileError) {
                        console.warn('获取用户角色失败:', profileError.message);
                    }
                }
                
                return { data, error: null, source: 'backend' };
            } else {
                throw new Error('Supabase未初始化');
            }
        } catch (error) {
            console.error('登录失败:', error);
            return { data: null, error: error, source: 'error' };
        }
    }
};

// 数据服务
window.DataService = {
    // 获取用户列表
    async getUsers(filters = {}) {
        try {
            if (window.supabaseReady && window.supabase) {
                let query = window.supabase
                    .from('profiles')
                    .select('*')
                    .order('joined_at', { ascending: false });

                if (filters.role) {
                    query = query.eq('role', filters.role);
                }
                if (filters.limit) {
                    query = query.limit(filters.limit);
                }

                const { data, error } = await query;
                if (error) throw error;
                return { data, error: null, source: 'backend' };
            } else {
                throw new Error('Supabase未初始化');
            }
        } catch (error) {
            console.error('获取用户列表失败:', error.message);
            return { data: null, error: error, source: 'error' };
        }
    },

    // 获取活动列表
    async getActivities(filters = {}) {
        try {
            if (window.supabaseReady && window.supabase) {
                let query = window.supabase
                    .from('activities')
                    .select('*')
                    .order('start_date', { ascending: false });

                if (filters.status) {
                    query = query.eq('status', filters.status);
                }
                if (filters.limit) {
                    query = query.limit(filters.limit);
                }

                const { data, error } = await query;
                if (error) throw error;
                return { data, error: null, source: 'backend' };
            } else {
                throw new Error('Supabase未初始化');
            }
        } catch (error) {
            console.error('获取活动列表失败:', error.message);
            return { data: null, error: error, source: 'error' };
        }
    },

    // 获取资源列表
    async getResources(filters = {}) {
        try {
            if (window.supabaseReady && window.supabase) {
                let query = window.supabase
                    .from('resources')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (filters.category) {
                    query = query.eq('category', filters.category);
                }
                if (filters.type) {
                    query = query.eq('type', filters.type);
                }
                if (filters.limit) {
                    query = query.limit(filters.limit);
                }

                const { data, error } = await query;
                if (error) throw error;
                return { data, error: null, source: 'backend' };
            } else {
                throw new Error('Supabase未初始化');
            }
        } catch (error) {
            console.error('获取资源列表失败:', error.message);
            return { data: null, error: error, source: 'error' };
        }
    },

    // 获取项目列表
    async getProjects(filters = {}) {
        try {
            if (window.supabaseReady && window.supabase) {
                let query = window.supabase
                    .from('projects')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (filters.status) {
                    query = query.eq('status', filters.status);
                }
                if (filters.limit) {
                    query = query.limit(filters.limit);
                }

                const { data, error } = await query;
                if (error) throw error;
                return { data, error: null, source: 'backend' };
            } else {
                throw new Error('Supabase未初始化');
            }
        } catch (error) {
            console.error('获取项目列表失败:', error.message);
            return { data: null, error: error, source: 'error' };
        }
    },

    // 添加用户
    async addUser(userData) {
        try {
            if (window.supabaseReady && window.supabase) {
                const { data, error } = await window.supabase
                    .from('profiles')
                    .insert(userData)
                    .select();
                
                if (error) throw error;
                return { data, error: null, source: 'backend' };
            } else {
                throw new Error('Supabase未初始化');
            }
        } catch (error) {
            console.error('添加用户失败:', error);
            return { data: null, error: error, source: 'error' };
        }
    },

    // 添加活动
    async addActivity(activityData) {
        try {
            if (window.supabaseReady && window.supabase) {
                const { data, error } = await window.supabase
                    .from('activities')
                    .insert(activityData)
                    .select();
                
                if (error) throw error;
                return { data, error: null, source: 'backend' };
            } else {
                throw new Error('Supabase未初始化');
            }
        } catch (error) {
            console.error('添加活动失败:', error);
            return { data: null, error: error, source: 'error' };
        }
    },

    // 添加资源
    async addResource(resourceData) {
        try {
            if (window.supabaseReady && window.supabase) {
                const { data, error } = await window.supabase
                    .from('resources')
                    .insert(resourceData)
                    .select();
                
                if (error) throw error;
                return { data, error: null, source: 'backend' };
            } else {
                throw new Error('Supabase未初始化');
            }
        } catch (error) {
            console.error('添加资源失败:', error);
            return { data: null, error: error, source: 'error' };
        }
    },

    // 添加项目
    async addProject(projectData) {
        try {
            if (window.supabaseReady && window.supabase) {
                const { data, error } = await window.supabase
                    .from('projects')
                    .insert(projectData)
                    .select();
                
                if (error) throw error;
                return { data, error: null, source: 'backend' };
            } else {
                throw new Error('Supabase未初始化');
            }
        } catch (error) {
            console.error('添加项目失败:', error);
            return { data: null, error: error, source: 'error' };
        }
    }
};

// 初始化Supabase客户端
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', function() {
        // 动态加载Supabase SDK
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.async = false; // 同步加载
        
        script.onload = function() {
            if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
                try {
                    // 创建Supabase客户端
                    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                        auth: {
                            storageKey: 'sb-auth-token',
                            autoRefreshToken: true,
                            persistSession: true
                        },
                        global: {
                            headers: {
                                'X-Client-Info': 'github-pages-deployment'
                            }
                        }
                    });
                    window.supabaseReady = true;
                    console.log('Supabase客户端初始化成功');
                } catch (e) {
                    console.error('初始化Supabase客户端失败:', e);
                    window.supabaseError = e.message;
                    window.supabaseReady = false;
                }
            } else {
                console.error('Supabase SDK加载失败');
                window.supabaseError = 'SDK加载失败';
                window.supabaseReady = false;
            }
        };
        
        script.onerror = function() {
            console.error('Supabase SDK加载失败');
            window.supabaseError = 'SDK加载失败';
            window.supabaseReady = false;
        };
        
        document.head.appendChild(script);
    });
}

console.log('Supabase配置加载完成');