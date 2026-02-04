// Supabase统一配置
const SUPABASE_URL = 'https://xwfcvhbneaajirmixpfj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5hrKzOXRlbtROlh13kl0ig_y4gBXXEt';

// 初始化Supabase客户端
if (typeof window.supabase === 'undefined') {
    try {
        // 检查全局supabase对象是否存在
        if (typeof window.supabase === 'undefined' && typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
            window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase客户端初始化成功');
        } else {
            throw new Error('Supabase SDK未正确加载');
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
        } catch (error) {
            console.error('获取活动列表失败:', error);
            return { data: null, error };
        }
    },

    // 获取活动详情
    async getActivityById(id) {
        try {
            const { data, error } = await window.supabase
                .from('activities')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('获取活动详情失败:', error);
            return { data: null, error };
        }
    },

    // 活动报名
    async registerActivity(activityId, userId) {
        try {
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
        } catch (error) {
            console.error('活动报名失败:', error);
            return { data: null, error };
        }
    },

    // 获取用户报名的活动
    async getUserRegistrations(userId) {
        try {
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
        } catch (error) {
            console.error('获取用户报名活动失败:', error);
            return { data: null, error };
        }
    },

    // 签到
    async checkIn(activityId, userId, location = null) {
        try {
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
        } catch (error) {
            console.error('签到失败:', error);
            return { data: null, error };
        }
    },

    // 获取用户签到记录
    async getUserCheckins(userId) {
        try {
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
        } catch (error) {
            console.error('获取用户签到记录失败:', error);
            return { data: null, error };
        }
    },

    // 发送留言
    async sendMessage(name, email, content) {
        try {
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
        } catch (error) {
            console.error('发送留言失败:', error);
            return { data: null, error };
        }
    },

    // 获取审核通过的留言
    async getApprovedMessages(limit = 10) {
        try {
            const { data, error } = await window.supabase
                .from('messages')
                .select('*')
                .eq('is_approved', true)
                .order('created_at', { ascending: false })
                .limit(limit);
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('获取留言失败:', error);
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

// 存储功能
window.App.storage = {
    // 上传文件
    async uploadFile(file, bucket = 'avatars', folder = 'users') {
        try {
            const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${file.name}`;
            const filePath = `${folder}/${fileName}`;
            
            const { error } = await window.supabase.storage
                .from(bucket)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });
            
            if (error) throw error;
            
            // 获取公共URL
            const { data: { publicUrl } } = await window.supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);
            
            return { url: publicUrl, error: null };
        } catch (error) {
            console.error('文件上传失败:', error);
            return { url: null, error };
        }
    },
    
    // 更新用户头像
    async updateAvatar(userId, file) {
        try {
            // 上传文件
            const { url, error: uploadError } = await this.uploadFile(file, 'avatars', 'users');
            if (uploadError) throw uploadError;
            
            // 更新用户资料
            const { error: updateError } = await window.supabase
                .from('profiles')
                .update({ avatar_url: url })
                .eq('id', userId);
            
            if (updateError) throw updateError;
            
            return { url, error: null };
        } catch (error) {
            console.error('更新头像失败:', error);
            return { url: null, error };
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
        storage: {
            from: () => ({
                upload: async () => ({ error: { message: '系统初始化中，请刷新页面重试' } }),
                getPublicUrl: async () => ({ data: { publicUrl: null } })
            })
        },
        from: () => ({
            select: (columns) => createChainableObject('系统初始化中，请刷新页面重试'),
            update: () => createChainableObject('系统初始化中，请刷新页面重试')
        })
    };
}

console.log('Supabase配置加载完成');