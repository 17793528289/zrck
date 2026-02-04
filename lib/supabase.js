// Supabase配置
const supabaseUrl = 'https://your-project-id.supabase.co';
const supabaseAnonKey = 'your-anon-key';

// 创建Supabase客户端
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

// 全局对象
window.App = window.App || {};
window.App.supabase = supabase;

// 认证相关函数
window.App.auth = {
    // 登录
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        return { data, error };
    },
    
    // 注册
    async signUp(email, password, userMetadata = {}) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userMetadata
            }
        });
        return { data, error };
    },
    
    // 退出登录
    async signOut() {
        const { error } = await supabase.auth.signOut();
        return { error };
    },
    
    // 获取当前用户
    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },
    
    // 重置密码
    async resetPassword(email) {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/login.html`
        });
        return { data, error };
    },
    
    // 更新密码
    async updatePassword(newPassword) {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });
        return { data, error };
    },
    
    // 更新用户信息
    async updateUser(data) {
        const { data: user, error } = await supabase.auth.updateUser(data);
        return { user, error };
    }
};

// 数据库操作函数
window.App.db = {
    // 获取活动列表
    async getActivities(filters = {}) {
        let query = supabase.from('activities').select('*');
        
        // 应用过滤条件
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.category) {
            query = query.eq('category', filters.category);
        }
        
        // 排序
        query = query.order('start_date', { ascending: false });
        
        const { data, error } = await query;
        return { data, error };
    },
    
    // 获取活动详情
    async getActivityById(id) {
        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('id', id)
            .single();
        return { data, error };
    },
    
    // 报名活动
    async registerActivity(activityId, userId) {
        const { data, error } = await supabase
            .from('activity_registrations')
            .insert({
                activity_id: activityId,
                user_id: userId,
                status: 'registered'
            });
        return { data, error };
    },
    
    // 获取用户报名的活动
    async getUserRegistrations(userId) {
        const { data, error } = await supabase
            .from('activity_registrations')
            .select(`
                *,
                activities (*)
            `)
            .eq('user_id', userId);
        return { data, error };
    },
    
    // 获取项目列表
    async getProjects(filters = {}) {
        let query = supabase.from('projects').select('*');
        
        // 应用过滤条件
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        
        // 排序
        query = query.order('created_at', { ascending: false });
        
        const { data, error } = await query;
        return { data, error };
    },
    
    // 获取用户参与的项目
    async getUserProjects(userId) {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .contains('members', [userId]);
        return { data, error };
    },
    
    // 签到
    async checkIn(activityId, userId) {
        const { data, error } = await supabase
            .from('checkins')
            .insert({
                activity_id: activityId,
                user_id: userId,
                checkin_time: new Date().toISOString()
            });
        return { data, error };
    },
    
    // 获取用户签到记录
    async getUserCheckins(userId) {
        const { data, error } = await supabase
            .from('checkins')
            .select(`
                *,
                activities (*)
            `)
            .eq('user_id', userId)
            .order('checkin_time', { ascending: false });
        return { data, error };
    },
    
    // 发送留言
    async sendMessage(name, email, content) {
        const { data, error } = await supabase
            .from('messages')
            .insert({
                name,
                email,
                content,
                is_approved: false
            });
        return { data, error };
    },
    
    // 获取审核通过的留言
    async getApprovedMessages() {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('is_approved', true)
            .order('created_at', { ascending: false });
        return { data, error };
    },
    
    // 获取通知
    async getNotifications(userId) {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .contains('recipient_ids', [userId])
            .order('created_at', { ascending: false });
        return { data, error };
    },
    
    // 标记通知为已读
    async markNotificationAsRead(notificationId) {
        const { data, error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);
        return { data, error };
    }
};

// 聊天相关函数
window.App.chat = {
    // 获取聊天列表
    async getChats(userId) {
        const { data, error } = await supabase
            .from('chats')
            .select(`
                *,
                chat_members (*),
                chat_messages (*)
            `)
            .contains('participants', [userId])
            .order('last_message_time', { ascending: false });
        return { data, error };
    },
    
    // 获取聊天消息
    async getChatMessages(chatId, limit = 50, offset = 0) {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true })
            .range(offset, offset + limit - 1);
        return { data, error };
    },
    
    // 发送消息
    async sendMessage(chatId, senderId, content, type = 'text') {
        const { data, error } = await supabase
            .from('chat_messages')
            .insert({
                chat_id: chatId,
                sender_id: senderId,
                content,
                type,
                status: 'sent'
            });
        
        // 更新聊天最后消息
        if (!error && data.length > 0) {
            await supabase
                .from('chats')
                .update({
                    last_message: content,
                    last_message_time: new Date().toISOString()
                })
                .eq('id', chatId);
        }
        
        return { data, error };
    },
    
    // 创建群聊
    async createGroupChat(name, participantIds) {
        const { data, error } = await supabase
            .from('chats')
            .insert({
                type: 'group',
                name,
                participants: participantIds
            });
        
        // 创建聊天成员记录
        if (!error && data.length > 0) {
            const chatId = data[0].id;
            const memberInserts = participantIds.map(userId => ({
                chat_id: chatId,
                user_id: userId,
                joined_at: new Date().toISOString()
            }));
            
            await supabase
                .from('chat_members')
                .insert(memberInserts);
        }
        
        return { data, error };
    },
    
    // 创建私聊
    async createPrivateChat(userId1, userId2) {
        // 检查是否已存在私聊
        const { data: existingChats } = await supabase
            .from('chats')
            .select('*')
            .eq('type', 'private')
            .contains('participants', [userId1, userId2]);
        
        if (existingChats && existingChats.length > 0) {
            return { data: existingChats[0], error: null };
        }
        
        // 创建新的私聊
        const { data, error } = await supabase
            .from('chats')
            .insert({
                type: 'private',
                participants: [userId1, userId2]
            });
        
        // 创建聊天成员记录
        if (!error && data.length > 0) {
            const chatId = data[0].id;
            const memberInserts = [userId1, userId2].map(userId => ({
                chat_id: chatId,
                user_id: userId,
                joined_at: new Date().toISOString()
            }));
            
            await supabase
                .from('chat_members')
                .insert(memberInserts);
        }
        
        return { data, error };
    },
    
    // 标记消息为已读
    async markMessagesAsRead(chatId, userId) {
        const { data, error } = await supabase
            .from('chat_messages')
            .update({ status: 'read' })
            .eq('chat_id', chatId)
            .neq('sender_id', userId);
        
        // 更新聊天成员最后阅读时间
        await supabase
            .from('chat_members')
            .update({ last_read_at: new Date().toISOString() })
            .eq('chat_id', chatId)
            .eq('user_id', userId);
        
        return { data, error };
    }
};

// 为了兼容旧的代码，同时导出到全局变量
const auth = window.App.auth;
const db = window.App.db;
const chat = window.App.chat;