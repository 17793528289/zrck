// Supabase统一配置
const SUPABASE_URL = 'https://xwfcvhbneaajirmixpfj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5hrKzOXRlbtROlh13kl0ig_y4gBXXEt';

// 初始化Supabase客户端
if (typeof window.supabase === 'undefined') {
    // 先创建一个临时对象，确保auth对象存在
    window.supabase = {
        auth: {
            signInWithPassword: async () => ({ 
                error: { message: '系统初始化中，请刷新页面重试' } 
            })
        }
    };
    
    try {
        // 检查全局supabase对象是否存在
        if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
            window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase客户端初始化成功');
        } else {
            // 尝试从CDN加载Supabase SDK
            console.warn('Supabase SDK未加载，尝试从CDN加载');
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.async = false; // 改为同步加载
            script.onload = function() {
                if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
                    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                    console.log('Supabase客户端从CDN加载成功');
                } else {
                    console.error('从CDN加载Supabase SDK失败');
                    window.supabase = createFallbackSupabase();
                }
            };
            script.onerror = function() {
                console.error('从CDN加载Supabase SDK失败');
                window.supabase = createFallbackSupabase();
            };
            document.head.appendChild(script);
        }
    } catch (error) {
        console.error('Supabase初始化失败:', error);
        // 创建降级版本
        window.supabase = createFallbackSupabase();
    }
}

// 创建全局应用对象
window.App = window.App || {};

// 认证功能
window.App.auth = {
    // 用户登录
    async signIn(email, password) {
        try {
            // 确保supabase和auth对象存在
            if (!window.supabase || !window.supabase.auth || !window.supabase.auth.signInWithPassword) {
                throw new Error('系统初始化中，请刷新页面重试');
            }
            
            const { data, error } = await window.supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password
            });
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('登录失败:', error);
            return { data: null, error };
        }
    },

    // 用户注册
    async signUp(email, password, userData = {}) {
        try {
            const { data, error } = await window.supabase.auth.signUp({
                email: email.trim(),
                password: password,
                options: {
                    data: userData
                }
            });
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('注册失败:', error);
            return { data: null, error };
        }
    },

    // 用户登出
    async signOut() {
        try {
            const { error } = await window.supabase.auth.signOut();
            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('登出失败:', error);
            return { error };
        }
    },

    // 获取当前用户
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await window.supabase.auth.getUser();
            if (error) throw error;
            return user;
        } catch (error) {
            console.error('获取用户信息失败:', error);
            return null;
        }
    },

    // 重置密码
    async resetPassword(email) {
        try {
            const { data, error } = await window.supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: `${window.location.origin}/login.html`
            });
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('密码重置失败:', error);
            return { data: null, error };
        }
    },

    // 更新用户信息
    async updateUser(userData) {
        try {
            const { data, error } = await window.supabase.auth.updateUser(userData);
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('更新用户信息失败:', error);
            return { data: null, error };
        }
    }
};

// 数据库操作
window.App.db = {
    // 获取活动列表
    async getActivities(filters = {}) {
        try {
            // 检查window.supabase是否存在且不是降级版本
            if (window.supabase && window.supabase.from && typeof window.supabase.from === 'function') {
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
                return { data, error: null };
            } else {
                // 使用降级版本
                if (window.supabase.db && window.supabase.db.getActivities) {
                    return window.supabase.db.getActivities(filters);
                }
                throw new Error('Supabase客户端未初始化');
            }
        } catch (error) {
            console.error('获取活动列表失败:', error);
            // 如果使用的是降级版本的Supabase客户端，直接返回模拟数据
            if (window.supabase.db && window.supabase.db.getActivities) {
                return window.supabase.db.getActivities(filters);
            }
            return { data: null, error };
        }
    },

    // 获取活动详情
    async getActivityById(id) {
        try {
            // 检查window.supabase是否存在且不是降级版本
            if (window.supabase && window.supabase.from && typeof window.supabase.from === 'function') {
                const { data, error } = await window.supabase
                    .from('activities')
                    .select('*')
                    .eq('id', id)
                    .single();
                
                if (error) throw error;
                return { data, error: null };
            } else {
                // 使用降级版本
                if (window.supabase.db && window.supabase.db.getActivityById) {
                    return window.supabase.db.getActivityById(id);
                }
                throw new Error('Supabase客户端未初始化');
            }
        } catch (error) {
            console.error('获取活动详情失败:', error);
            // 如果使用的是降级版本的Supabase客户端，直接返回模拟数据
            if (window.supabase.db && window.supabase.db.getActivityById) {
                return window.supabase.db.getActivityById(id);
            }
            return { data: null, error };
        }
    },

    // 活动报名
    async registerActivity(activityId, userId) {
        try {
            // 检查window.supabase是否存在且不是降级版本
            if (window.supabase && window.supabase.from && typeof window.supabase.from === 'function') {
                const { data, error } = await window.supabase
                    .from('activity_registrations')
                    .insert({
                        activity_id: activityId,
                        user_id: userId,
                        status: 'registered',
                        registered_at: new Date().toISOString()
                    });
                
                if (error) throw error;
                return { data, error: null };
            } else {
                // 使用降级版本
                if (window.supabase.db && window.supabase.db.registerActivity) {
                    return window.supabase.db.registerActivity(activityId, userId);
                }
                throw new Error('Supabase客户端未初始化');
            }
        } catch (error) {
            console.error('活动报名失败:', error);
            // 如果使用的是降级版本的Supabase客户端，直接返回模拟数据
            if (window.supabase.db && window.supabase.db.registerActivity) {
                return window.supabase.db.registerActivity(activityId, userId);
            }
            return { data: null, error };
        }
    },

    // 获取用户报名的活动
    async getUserRegistrations(userId) {
        try {
            // 检查window.supabase是否存在且不是降级版本
            if (window.supabase && window.supabase.from && typeof window.supabase.from === 'function') {
                const { data, error } = await window.supabase
                    .from('activity_registrations')
                    .select(`
                        *,
                        activities (*)
                    `)
                    .eq('user_id', userId)
                    .order('registered_at', { ascending: false });
                
                if (error) throw error;
                return { data, error: null };
            } else {
                // 使用降级版本
                if (window.supabase.db && window.supabase.db.getUserRegistrations) {
                    return window.supabase.db.getUserRegistrations(userId);
                }
                throw new Error('Supabase客户端未初始化');
            }
        } catch (error) {
            console.error('获取用户报名活动失败:', error);
            // 如果使用的是降级版本的Supabase客户端，直接返回模拟数据
            if (window.supabase.db && window.supabase.db.getUserRegistrations) {
                return window.supabase.db.getUserRegistrations(userId);
            }
            return { data: null, error };
        }
    },

    // 签到
    async checkIn(activityId, userId, location = null) {
        try {
            // 检查window.supabase是否存在且不是降级版本
            if (window.supabase && window.supabase.from && typeof window.supabase.from === 'function') {
                const { data, error } = await window.supabase
                    .from('checkins')
                    .insert({
                        activity_id: activityId,
                        user_id: userId,
                        checkin_time: new Date().toISOString(),
                        location: location
                    });
                
                if (error) throw error;
                return { data, error: null };
            } else {
                // 使用降级版本
                if (window.supabase.db && window.supabase.db.checkIn) {
                    return window.supabase.db.checkIn(activityId, userId, location);
                }
                throw new Error('Supabase客户端未初始化');
            }
        } catch (error) {
            console.error('签到失败:', error);
            // 如果使用的是降级版本的Supabase客户端，直接返回模拟数据
            if (window.supabase.db && window.supabase.db.checkIn) {
                return window.supabase.db.checkIn(activityId, userId, location);
            }
            return { data: null, error };
        }
    },

    // 获取用户签到记录
    async getUserCheckins(userId) {
        try {
            // 检查window.supabase是否存在且不是降级版本
            if (window.supabase && window.supabase.from && typeof window.supabase.from === 'function') {
                const { data, error } = await window.supabase
                    .from('checkins')
                    .select(`
                        *,
                        activities (*)
                    `)
                    .eq('user_id', userId)
                    .order('checkin_time', { ascending: false });
                
                if (error) throw error;
                return { data, error: null };
            } else {
                // 使用降级版本
                if (window.supabase.db && window.supabase.db.getUserCheckins) {
                    return window.supabase.db.getUserCheckins(userId);
                }
                throw new Error('Supabase客户端未初始化');
            }
        } catch (error) {
            console.error('获取用户签到记录失败:', error);
            // 如果使用的是降级版本的Supabase客户端，直接返回模拟数据
            if (window.supabase.db && window.supabase.db.getUserCheckins) {
                return window.supabase.db.getUserCheckins(userId);
            }
            return { data: null, error };
        }
    },

    // 发送留言
    async sendMessage(name, email, content) {
        try {
            // 检查window.supabase是否存在且不是降级版本
            if (window.supabase && window.supabase.from && typeof window.supabase.from === 'function') {
                const { data, error } = await window.supabase
                    .from('messages')
                    .insert({
                        name: name.trim(),
                        email: email.trim(),
                        content: content.trim(),
                        is_approved: false,
                        created_at: new Date().toISOString()
                    });
                
                if (error) throw error;
                return { data, error: null };
            } else {
                // 使用降级版本
                if (window.supabase.db && window.supabase.db.sendMessage) {
                    return window.supabase.db.sendMessage(name, email, content);
                }
                throw new Error('Supabase客户端未初始化');
            }
        } catch (error) {
            console.error('发送留言失败:', error);
            // 如果使用的是降级版本的Supabase客户端，直接返回模拟数据
            if (window.supabase.db && window.supabase.db.sendMessage) {
                return window.supabase.db.sendMessage(name, email, content);
            }
            return { data: null, error };
        }
    },

    // 获取审核通过的留言
    async getApprovedMessages(limit = 10) {
        try {
            // 检查window.supabase是否存在且不是降级版本
            if (window.supabase && window.supabase.from && typeof window.supabase.from === 'function') {
                const { data, error } = await window.supabase
                    .from('messages')
                    .select('*')
                    .eq('is_approved', true)
                    .order('created_at', { ascending: false })
                    .limit(limit);
                
                if (error) throw error;
                return { data, error: null };
            } else {
                // 使用降级版本
                if (window.supabase.db && window.supabase.db.getApprovedMessages) {
                    return window.supabase.db.getApprovedMessages(limit);
                }
                throw new Error('Supabase客户端未初始化');
            }
        } catch (error) {
            console.error('获取留言失败:', error);
            // 如果使用的是降级版本的Supabase客户端，直接返回模拟数据
            if (window.supabase.db && window.supabase.db.getApprovedMessages) {
                return window.supabase.db.getApprovedMessages(limit);
            }
            return { data: null, error };
        }
    },

    // 获取用户列表
    async getUsers(filters = {}) {
        try {
            // 检查window.supabase是否存在且不是降级版本
            if (window.supabase && window.supabase.from && typeof window.supabase.from === 'function') {
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
                return { data, error: null };
            } else {
                // 使用降级版本
                if (window.supabase.db && window.supabase.db.getUsers) {
                    return window.supabase.db.getUsers(filters);
                }
                throw new Error('Supabase客户端未初始化');
            }
        } catch (error) {
            console.error('获取用户列表失败:', error);
            // 如果使用的是降级版本的Supabase客户端，直接返回模拟数据
            if (window.supabase.db && window.supabase.db.getUsers) {
                return window.supabase.db.getUsers(filters);
            }
            return { data: null, error };
        }
    },

    // 获取用户详情
    async getUserById(id) {
        try {
            // 检查window.supabase是否存在且不是降级版本
            if (window.supabase && window.supabase.from && typeof window.supabase.from === 'function') {
                const { data, error } = await window.supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', id)
                    .single();
                
                if (error) throw error;
                return { data, error: null };
            } else {
                // 使用降级版本
                if (window.supabase.db && window.supabase.db.getUserById) {
                    return window.supabase.db.getUserById(id);
                }
                throw new Error('Supabase客户端未初始化');
            }
        } catch (error) {
            console.error('获取用户详情失败:', error);
            // 如果使用的是降级版本的Supabase客户端，直接返回模拟数据
            if (window.supabase.db && window.supabase.db.getUserById) {
                return window.supabase.db.getUserById(id);
            }
            return { data: null, error };
        }
    },

    // 获取资源列表
    async getResources(filters = {}) {
        try {
            // 检查window.supabase是否存在且不是降级版本
            if (window.supabase && window.supabase.from && typeof window.supabase.from === 'function') {
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
                return { data, error: null };
            } else {
                // 使用降级版本
                if (window.supabase.db && window.supabase.db.getResources) {
                    return window.supabase.db.getResources(filters);
                }
                throw new Error('Supabase客户端未初始化');
            }
        } catch (error) {
            console.error('获取资源列表失败:', error);
            // 如果使用的是降级版本的Supabase客户端，直接返回模拟数据
            if (window.supabase.db && window.supabase.db.getResources) {
                return window.supabase.db.getResources(filters);
            }
            return { data: null, error };
        }
    },

    // 获取项目列表
    async getProjects(filters = {}) {
        try {
            // 检查window.supabase是否存在且不是降级版本
            if (window.supabase && window.supabase.from && typeof window.supabase.from === 'function') {
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
                return { data, error: null };
            } else {
                // 使用降级版本
                if (window.supabase.db && window.supabase.db.getProjects) {
                    return window.supabase.db.getProjects(filters);
                }
                throw new Error('Supabase客户端未初始化');
            }
        } catch (error) {
            console.error('获取项目列表失败:', error);
            // 如果使用的是降级版本的Supabase客户端，直接返回模拟数据
            if (window.supabase.db && window.supabase.db.getProjects) {
                return window.supabase.db.getProjects(filters);
            }
            return { data: null, error };
        }
    }
};

// 聊天功能
window.App.chat = {
    // 获取用户聊天列表
    async getChats(userId) {
        try {
            const { data, error } = await window.supabase
                .from('chats')
                .select(`
                    *,
                    chat_members (*),
                    chat_messages!inner (*)
                `)
                .contains('participants', [userId])
                .order('last_message_time', { ascending: false });
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('获取聊天列表失败:', error);
            return { data: null, error };
        }
    },

    // 获取聊天消息
    async getChatMessages(chatId, limit = 50) {
        try {
            const { data, error } = await window.supabase
                .from('chat_messages')
                .select(`
                    *,
                    profiles:sender_id (username, avatar_url)
                `)
                .eq('chat_id', chatId)
                .order('created_at', { ascending: true })
                .limit(limit);
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('获取聊天消息失败:', error);
            return { data: null, error };
        }
    },

    // 发送消息
    async sendMessage(chatId, senderId, content, type = 'text') {
        try {
            const { data, error } = await window.supabase
                .from('chat_messages')
                .insert({
                    chat_id: chatId,
                    sender_id: senderId,
                    content: content.trim(),
                    type: type,
                    status: 'sent',
                    created_at: new Date().toISOString()
                });
            
            if (error) throw error;

            // 更新聊天最后消息
            await window.supabase
                .from('chats')
                .update({
                    last_message: content,
                    last_message_time: new Date().toISOString()
                })
                .eq('id', chatId);

            return { data, error: null };
        } catch (error) {
            console.error('发送消息失败:', error);
            return { data: null, error };
        }
    }
};

// 降级版本的Supabase（当SDK加载失败时使用）
function createFallbackSupabase() {
    console.warn('使用降级版本的Supabase客户端');
    
    // 创建一个递归函数来生成具有链式调用能力的对象
    function createChainableObject(errorMessage) {
        const obj = {
            eq: () => createChainableObject(errorMessage),
            order: () => createChainableObject(errorMessage),
            limit: () => createChainableObject(errorMessage),
            contains: () => createChainableObject(errorMessage),
            single: async () => ({ 
                error: { message: errorMessage } 
            }),
            insert: async () => ({ 
                error: { message: errorMessage } 
            }),
            update: async () => ({ 
                error: { message: errorMessage } 
            }),
            delete: async () => ({ 
                error: { message: errorMessage } 
            }),
            async: async () => ({ 
                error: { message: errorMessage } 
            })
        };
        return obj;
    }
    
    // 模拟数据
    const mockUsers = [
        { id: '1', username: 'admin', email: 'admin@example.com', role: 'admin', joined_at: new Date('2024-01-01') },
        { id: '2', username: 'teacher', email: 'teacher@example.com', role: 'teacher', joined_at: new Date('2024-01-05') },
        { id: '3', username: 'student1', email: 'student1@example.com', role: 'member', joined_at: new Date('2024-01-10') },
        { id: '4', username: 'student2', email: 'student2@example.com', role: 'member', joined_at: new Date('2024-01-15') }
    ];
    
    const mockActivities = [
        {
            id: '1',
            title: '机器人设计与编程竞赛',
            description: '社团成员组队参加市级机器人竞赛，展示创意和技术实力',
            start_date: new Date('2024-03-15'),
            location: '科技楼创客空间',
            status: 'ongoing',
            participants: 25
        },
        {
            id: '2',
            title: 'Python编程基础培训',
            description: '为新成员提供Python编程入门培训，包括基础语法和项目实践',
            start_date: new Date('2024-03-20'),
            location: '学校电脑室',
            status: 'upcoming',
            participants: 20
        },
        {
            id: '3',
            title: '3D打印技术工作坊',
            description: '学习3D建模和3D打印技术，制作创意模型和实用物品',
            start_date: new Date('2024-03-10'),
            location: '科技楼创客空间',
            status: 'past',
            participants: 18
        }
    ];
    
    const mockResources = [
        {
            id: '1',
            title: 'Python编程教程',
            description: 'Python基础到进阶的完整教程，包含大量实战项目',
            category: '编程',
            type: 'PDF',
            created_at: new Date('2024-02-10')
        },
        {
            id: '2',
            title: 'Arduino开发指南',
            description: 'Arduino入门到精通，包含传感器使用和项目案例',
            category: '硬件',
            type: '文档',
            created_at: new Date('2024-02-15')
        },
        {
            id: '3',
            title: '3D建模软件教程',
            description: 'Blender和AutoCAD基础教程，适合初学者',
            category: '设计',
            type: '视频',
            created_at: new Date('2024-02-20')
        }
    ];
    
    const mockProjects = [
        {
            id: '1',
            title: '智能机器人',
            description: '基于Arduino的智能机器人，可实现避障和自动导航',
            author: '张明',
            status: 'active',
            created_at: new Date('2024-02-01')
        },
        {
            id: '2',
            title: '智能家居控制系统',
            description: '使用ESP8266构建的智能家居控制系统，可远程控制家电',
            author: '李华',
            status: 'in_progress',
            created_at: new Date('2024-02-05')
        },
        {
            id: '3',
            title: '环保监测系统',
            description: '基于树莓派的环境监测系统，可监测温度、湿度和空气质量',
            author: '王强',
            status: 'completed',
            created_at: new Date('2024-01-20')
        }
    ];
    
    return {
        auth: {
            signInWithPassword: async () => ({ 
                error: { message: '系统初始化中，请刷新页面重试' } 
            }),
            signUp: async () => ({ 
                error: { message: '系统初始化中，请刷新页面重试' } 
            }),
            signOut: async () => ({ 
                error: { message: '系统初始化中，请刷新页面重试' } 
            }),
            getUser: async () => ({ 
                data: { user: null },
                error: { message: '系统初始化中，请刷新页面重试' }
            }),
            resetPasswordForEmail: async () => ({ 
                error: { message: '系统初始化中，请刷新页面重试' } 
            }),
            updateUser: async () => ({ 
                error: { message: '系统初始化中，请刷新页面重试' } 
            })
        },
        from: () => ({
            select: (columns) => createChainableObject('系统初始化中，请刷新页面重试')
        }),
        // 降级版本的数据库操作
        db: {
            // 获取用户列表
            async getUsers(filters = {}) {
                return { data: mockUsers, error: null };
            },
            // 获取用户详情
            async getUserById(id) {
                const user = mockUsers.find(u => u.id === id);
                return { data: user, error: null };
            },
            // 获取活动列表
            async getActivities(filters = {}) {
                return { data: mockActivities, error: null };
            },
            // 获取活动详情
            async getActivityById(id) {
                const activity = mockActivities.find(a => a.id === id);
                return { data: activity, error: null };
            },
            // 获取资源列表
            async getResources(filters = {}) {
                return { data: mockResources, error: null };
            },
            // 获取项目列表
            async getProjects(filters = {}) {
                return { data: mockProjects, error: null };
            },
            // 其他必要的方法
            async registerActivity(activityId, userId) {
                return { data: null, error: { message: '系统初始化中，请刷新页面重试' } };
            },
            async getUserRegistrations(userId) {
                return { data: [], error: null };
            },
            async checkIn(activityId, userId, location = null) {
                return { data: null, error: { message: '系统初始化中，请刷新页面重试' } };
            },
            async getUserCheckins(userId) {
                return { data: [], error: null };
            },
            async sendMessage(name, email, content) {
                return { data: null, error: { message: '系统初始化中，请刷新页面重试' } };
            },
            async getApprovedMessages(limit = 10) {
                return { data: [], error: null };
            }
        }
    };
}

console.log('Supabase配置加载完成');