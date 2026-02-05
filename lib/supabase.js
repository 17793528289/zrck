// Supabase统一配置
const SUPABASE_URL = 'https://xwfcvhbneaajirmixpfj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5hrKzOXRlbtROlh13kl0ig_y4gBXXEt';

// 初始化状态
window.supabase = null;
window.supabaseReady = false;
window.supabaseError = null;

// 数字账号到邮箱的映射（模拟数据）
const accountMap = {
    '2025020101': { email: '2025020101@example.com', password: 'admin123', role: 'admin' },
    '2025020102': { email: '2025020102@example.com', password: 'teacher123', role: 'teacher' },
    '2025020103': { email: '2025020103@example.com', password: 'student123', role: 'member' },
    '2025020104': { email: '2025020104@example.com', password: 'student123', role: 'member' }
};

// 模拟数据
const mockData = {
    users: [
        { id: '1', username: '2025020101', email: '2025020101@example.com', role: 'admin', joined_at: new Date('2024-01-01') },
        { id: '2', username: '2025020102', email: '2025020102@example.com', role: 'teacher', joined_at: new Date('2024-01-05') },
        { id: '3', username: '2025020103', email: '2025020103@example.com', role: 'member', joined_at: new Date('2024-01-10') },
        { id: '4', username: '2025020104', email: '2025020104@example.com', role: 'member', joined_at: new Date('2024-01-15') }
    ],
    activities: [
        {
            id: '1',
            title: '机器人设计与编程竞赛',
            description: '社团成员组队参加市级机器人竞赛，展示创意和技术实力',
            start_date: new Date('2024-03-15'),
            location: '科技楼创客空间',
            status: 'ongoing',
            organizer: '张明'
        },
        {
            id: '2',
            title: 'Python编程基础培训',
            description: '为新成员提供Python编程入门培训，包括基础语法和项目实践',
            start_date: new Date('2024-03-20'),
            location: '学校电脑室',
            status: 'upcoming',
            organizer: '李华'
        },
        {
            id: '3',
            title: '3D打印技术工作坊',
            description: '学习3D建模和3D打印技术，制作创意模型和实用物品',
            start_date: new Date('2024-03-10'),
            location: '科技楼创客空间',
            status: 'past',
            organizer: '王强'
        }
    ],
    resources: [
        {
            id: '1',
            title: 'Python编程教程',
            description: 'Python基础到进阶的完整教程，包含大量实战项目',
            category: '编程',
            type: 'PDF',
            views: 150,
            downloads: 80,
            created_at: new Date('2024-02-10')
        },
        {
            id: '2',
            title: 'Arduino开发指南',
            description: 'Arduino入门到精通，包含传感器使用和项目案例',
            category: '硬件',
            type: '文档',
            views: 200,
            downloads: 120,
            created_at: new Date('2024-02-15')
        },
        {
            id: '3',
            title: '3D建模软件教程',
            description: 'Blender和AutoCAD基础教程，适合初学者',
            category: '设计',
            type: '视频',
            views: 300,
            downloads: 150,
            created_at: new Date('2024-02-20')
        }
    ],
    projects: [
        {
            id: '1',
            title: '智能机器人',
            description: '基于Arduino的智能机器人，可实现避障和自动导航',
            members: ['张明', '李华'],
            status: 'in_progress',
            created_at: new Date('2024-02-01')
        },
        {
            id: '2',
            title: '智能家居控制系统',
            description: '使用ESP8266构建的智能家居控制系统，可远程控制家电',
            members: ['李华', '王强'],
            status: 'planning',
            created_at: new Date('2024-02-05')
        },
        {
            id: '3',
            title: '环保监测系统',
            description: '基于树莓派的环境监测系统，可监测温度、湿度和空气质量',
            members: ['王强', '张明'],
            status: 'completed',
            created_at: new Date('2024-01-20')
        }
    ]
};

// 登录服务
window.AuthService = {
    // 通过账号获取邮箱
    async getEmailByAccount(account) {
        try {
            // 首先检查是否存在模拟账号
            const user = accountMap[account];
            if (user) {
                // 直接返回模拟账号的邮箱，不尝试后端API
                return user.email;
            }
            
            // 如果没有模拟账号，尝试使用后端API
            if (window.supabaseReady && window.supabase) {
                const { data, error } = await window.supabase
                    .from('profiles')
                    .select('email')
                    .eq('username', account)
                    .single();
                
                if (error) throw error;
                return data.email;
            } else {
                throw new Error('账号不存在');
            }
        } catch (error) {
            console.warn('获取邮箱失败，使用模拟数据:', error.message);
            const user = accountMap[account];
            if (user) {
                return user.email;
            }
            throw new Error('账号不存在');
        }
    },
    
    // 登录方法
    async signIn(account, password) {
        try {
            // 首先检查是否存在模拟账号
            const user = accountMap[account];
            if (user && user.password === password) {
                // 直接使用模拟登录，不尝试后端API
                return { 
                    data: { 
                        user: { 
                            id: user.id || '1',
                            email: user.email,
                            role: user.role,
                            user_metadata: {
                                username: account,
                                role: user.role
                            }
                        } 
                    }, 
                    error: null, 
                    source: 'mock' 
                };
            }
            
            // 如果没有模拟账号，尝试使用后端API
            if (window.supabaseReady && window.supabase) {
                // 获取邮箱
                const email = await this.getEmailByAccount(account);
                
                const { data, error } = await window.supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });
                
                if (error) throw error;
                return { data, error: null, source: 'backend' };
            } else {
                throw new Error('账号或密码错误');
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
            console.warn('获取用户列表失败，使用模拟数据:', error.message);
            return { data: mockData.users, error: null, source: 'mock' };
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
            console.warn('获取活动列表失败，使用模拟数据:', error.message);
            return { data: mockData.activities, error: null, source: 'mock' };
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
            console.warn('获取资源列表失败，使用模拟数据:', error.message);
            return { data: mockData.resources, error: null, source: 'mock' };
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
            console.warn('获取项目列表失败，使用模拟数据:', error.message);
            return { data: mockData.projects, error: null, source: 'mock' };
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
                    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
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
    
    // 模拟用户数据（包含密码用于登录验证）
    const mockUsers = [
        { id: '1', username: 'admin', email: 'admin@example.com', password: 'admin123', role: 'admin', joined_at: new Date('2024-01-01') },
        { id: '2', username: 'teacher', email: 'teacher@example.com', password: 'teacher123', role: 'teacher', joined_at: new Date('2024-01-05') },
        { id: '3', username: 'student1', email: 'student1@example.com', password: 'student123', role: 'member', joined_at: new Date('2024-01-10') },
        { id: '4', username: 'student2', email: 'student2@example.com', password: 'student123', role: 'member', joined_at: new Date('2024-01-15') }
    ];
    
    // 模拟当前用户
    let currentUser = null;
    
    const mockActivities = [
        {
            id: '1',
            title: '机器人设计与编程竞赛',
            description: '社团成员组队参加市级机器人竞赛，展示创意和技术实力',
            start_date: new Date('2024-03-15'),
            location: '科技楼创客空间',
            status: 'ongoing',
            organizer: '张明'
        },
        {
            id: '2',
            title: 'Python编程基础培训',
            description: '为新成员提供Python编程入门培训，包括基础语法和项目实践',
            start_date: new Date('2024-03-20'),
            location: '学校电脑室',
            status: 'upcoming',
            organizer: '李华'
        },
        {
            id: '3',
            title: '3D打印技术工作坊',
            description: '学习3D建模和3D打印技术，制作创意模型和实用物品',
            start_date: new Date('2024-03-10'),
            location: '科技楼创客空间',
            status: 'past',
            organizer: '王强'
        }
    ];
    
    const mockResources = [
        {
            id: '1',
            title: 'Python编程教程',
            description: 'Python基础到进阶的完整教程，包含大量实战项目',
            category: '编程',
            type: 'PDF',
            views: 150,
            downloads: 80,
            created_at: new Date('2024-02-10')
        },
        {
            id: '2',
            title: 'Arduino开发指南',
            description: 'Arduino入门到精通，包含传感器使用和项目案例',
            category: '硬件',
            type: '文档',
            views: 200,
            downloads: 120,
            created_at: new Date('2024-02-15')
        },
        {
            id: '3',
            title: '3D建模软件教程',
            description: 'Blender和AutoCAD基础教程，适合初学者',
            category: '设计',
            type: '视频',
            views: 300,
            downloads: 150,
            created_at: new Date('2024-02-20')
        }
    ];
    
    const mockProjects = [
        {
            id: '1',
            title: '智能机器人',
            description: '基于Arduino的智能机器人，可实现避障和自动导航',
            members: ['张明', '李华'],
            status: 'in_progress',
            created_at: new Date('2024-02-01')
        },
        {
            id: '2',
            title: '智能家居控制系统',
            description: '使用ESP8266构建的智能家居控制系统，可远程控制家电',
            members: ['李华', '王强'],
            status: 'planning',
            created_at: new Date('2024-02-05')
        },
        {
            id: '3',
            title: '环保监测系统',
            description: '基于树莓派的环境监测系统，可监测温度、湿度和空气质量',
            members: ['王强', '张明'],
            status: 'completed',
            created_at: new Date('2024-01-20')
        }
    ];
    
    return {
        auth: {
            signInWithPassword: async (credentials) => {
                const user = mockUsers.find(u => u.email === credentials.email && u.password === credentials.password);
                if (user) {
                    currentUser = user;
                    return { 
                        data: { 
                            user: { 
                                id: user.id,
                                email: user.email,
                                user_metadata: {
                                    username: user.username,
                                    role: user.role
                                }
                            } 
                        }, 
                        error: null 
                    };
                } else {
                    return { 
                        data: null, 
                        error: { message: '邮箱或密码错误' } 
                    };
                }
            },
            signUp: async () => ({ 
                error: { message: '系统初始化中，请使用现有账号登录' } 
            }),
            signOut: async () => {
                currentUser = null;
                return { error: null };
            },
            getUser: async () => ({ 
                data: { user: currentUser },
                error: null
            }),
            resetPasswordForEmail: async () => ({ 
                error: { message: '系统初始化中，请联系管理员' } 
            }),
            updateUser: async () => ({ 
                error: { message: '系统初始化中，请联系管理员' } 
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