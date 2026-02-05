## 实现数字账号登录系统（带模拟数据 fallback）

### 需求分析

用户要求：
1. 使用数字格式账号（如2025020101）替代邮箱登录
2. 继续使用 Supabase SDK
3. 在后端数据获取失败时使用模拟数据
4. 直接使用 SDK 方法，避免复杂包装层

### 解决方案

#### 1. 修改登录页面 (login.html)

**更新表单结构**：
- 将邮箱输入字段改为账号输入字段
- 更新标签文本从"邮箱"改为"账号"
- 保持密码输入字段不变

**修改登录逻辑**：
- 获取账号和密码输入值
- 通过账号查询对应的邮箱（Supabase 需要邮箱登录）
- 使用查询到的邮箱和密码进行登录

**代码修改**：
```html
<!-- 修改前 -->
<div class="mb-4">
    <label for="email" class="block text-sm font-medium text-gray-400 mb-1">邮箱</label>
    <input type="email" id="email" class="w-full bg-dark-light border border-white/10 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-primary" required>
</div>

<!-- 修改后 -->
<div class="mb-4">
    <label for="username" class="block text-sm font-medium text-gray-400 mb-1">账号</label>
    <input type="text" id="username" class="w-full bg-dark-light border border-white/10 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-primary" required>
</div>
```

#### 2. 重构 supabase.js 文件

**核心设计**：
- 简化 SDK 初始化逻辑
- 添加数字账号到邮箱的映射
- 实现带 fallback 的数据方法
- 支持数字账号登录

**代码修改**：
```javascript
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
    // 其他模拟数据保持不变...
};

// 初始化Supabase客户端
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', function() {
        // 动态加载Supabase SDK
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.async = false;
        
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

// 登录服务
window.AuthService = {
    // 通过账号获取邮箱
    async getEmailByAccount(account) {
        try {
            if (window.supabaseReady && window.supabase) {
                const { data, error } = await window.supabase
                    .from('profiles')
                    .select('email')
                    .eq('username', account)
                    .single();
                
                if (error) throw error;
                return data.email;
            } else {
                // 使用模拟映射
                const user = accountMap[account];
                if (user) {
                    return user.email;
                }
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
            // 获取邮箱
            const email = await this.getEmailByAccount(account);
            
            // 使用邮箱登录
            if (window.supabaseReady && window.supabase) {
                const { data, error } = await window.supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });
                
                if (error) throw error;
                return { data, error: null, source: 'backend' };
            } else {
                // 模拟登录
                const user = accountMap[account];
                if (user && user.password === password) {
                    return { 
                        data: { 
                            user: { 
                                id: user.id || '1',
                                email: user.email,
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
    
    // 其他数据方法保持不变...
};

console.log('Supabase配置加载完成');
```

#### 3. 更新登录页面脚本

**修改登录处理逻辑**：
- 获取账号和密码输入值
- 使用 AuthService.signIn 进行登录
- 处理不同数据源的情况
- 提供清晰的错误反馈

**代码修改**：
```javascript
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorElement = document.getElementById('login-error');
    const loadingElement = document.createElement('div');
    loadingElement.id = 'login-loading';
    loadingElement.className = 'text-center text-gray-400 py-2';
    loadingElement.style.display = 'none';
    loginForm.parentNode.insertBefore(loadingElement, loginForm.nextSibling);
    
    // 检查Supabase初始化状态
    function checkSupabaseStatus() {
        if (!window.supabaseReady && !window.supabaseError) {
            loadingElement.textContent = '系统初始化中...';
            loadingElement.style.display = 'block';
            loginForm.querySelector('button[type="submit"]').disabled = true;
        } else {
            loadingElement.style.display = 'none';
            loginForm.querySelector('button[type="submit"]').disabled = false;
        }
    }
    
    // 初始检查
    checkSupabaseStatus();
    
    // 定期检查状态
    const statusInterval = setInterval(checkSupabaseStatus, 500);
    
    // 登录表单处理
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const account = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        errorElement.textContent = '';
        loadingElement.textContent = '登录中...';
        loadingElement.style.display = 'block';
        
        try {
            // 使用AuthService登录
            const { data, error, source } = await window.AuthService.signIn(account, password);
            
            if (error) {
                throw error;
            }
            
            // 登录成功
            if (source === 'mock') {
                loadingElement.textContent = '系统暂时使用模拟数据，登录成功...';
            } else {
                loadingElement.textContent = '登录成功，正在跳转...';
            }
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            console.error('登录失败:', error);
            errorElement.textContent = error.message || '登录失败，请检查账号和密码';
            loadingElement.style.display = 'none';
        }
    });
    
    // 清理定时器
    setTimeout(() => clearInterval(statusInterval), 10000);
});
```

#### 4. 更新其他页面的数据加载逻辑

**使用数字账号格式**：
- 更新所有页面的用户显示，使用数字账号
- 确保在模拟数据中使用正确的账号格式
- 保持数据来源的清晰标识

### 技术要点

1. **数字账号支持**：实现从数字账号到邮箱的映射，兼容Supabase的邮箱登录要求
2. **优先级明确**：后端数据优先，模拟数据作为fallback
3. **直接SDK调用**：核心操作直接使用官方SDK方法
4. **数据源标识**：明确标记数据来源，便于调试和用户了解
5. **用户体验**：
   - 清晰的加载状态反馈
   - 当使用模拟数据时给予明确提示
   - 提供具体的错误信息
6. **错误处理**：
   - 捕获并记录所有错误
   - 给予用户友好的错误提示
   - 在SDK不可用时提供降级方案

### 预期效果

- **数字账号登录**：用户可以使用2025020101这种格式的账号登录
- **后端数据优先**：当后端可用时，始终使用真实数据
- **模拟数据fallback**：当后端不可用时，自动使用模拟数据
- **清晰的反馈**：用户能知道数据来源和系统状态
- **稳定可靠**：即使在网络问题或SDK故障时也能提供基本功能

### 测试账号

**数字账号**：

| 账号       | 密码        | 角色       |
|------------|------------|------------|
| 2025020101 | admin123   | 管理员     |
| 2025020102 | teacher123 | 教师       |
| 2025020103 | student123 | 社员       |
| 2025020104 | student123 | 社员       |

### 实施步骤

1. **修改 login.html**：更新表单结构和登录逻辑
2. **重构 supabase.js**：实现数字账号映射和登录服务
3. **更新其他页面**：确保使用数字账号格式显示用户信息
4. **测试验证**：
   - 正常情况：使用后端数据登录
   - 网络问题：使用模拟数据登录
   - SDK失败：使用模拟数据和简化登录逻辑

通过这个方案，系统将支持数字账号登录，同时保持后端数据优先、模拟数据作为fallback的设计，满足用户的所有要求。