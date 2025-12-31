// 启用严格模式
"use strict";

/**
 * 主应用程序 - 登录系统
 * 版本: 1.0.0
 * 最后更新: 2024-01-18
 */

// ==================== 配置部分 ====================
const APP_CONFIG = {
    supabase: {
        url: 'https://wxbemuwgiiucdgmbhbvg.supabase.co',
        anonKey: 'sb_publishable_KuzTRmYOZ9P6UmKgmb_VwA_6Qj_A6Nk'
    },
    testAccounts: {
        '2023001': { 
            password: '123456', 
            name: '张三', 
            grade: '高一(1)班', 
            role: 'student' 
        },
        '2023002': { 
            password: '123456', 
            name: '李四', 
            grade: '高一(3)班', 
            role: 'student' 
        },
        'admin': { 
            password: 'admin123', 
            name: '系统管理员', 
            role: 'admin',
            grade: '系统管理'
        }
    }
};

// ==================== Supabase客户端管理 ====================
class SupabaseManager {
    constructor() {
        this.client = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return this.client;
        
        if (window.supabase && APP_CONFIG.supabase.url && APP_CONFIG.supabase.anonKey) {
            try {
                this.client = window.supabase.createClient(
                    APP_CONFIG.supabase.url, 
                    APP_CONFIG.supabase.anonKey
                );
                this.initialized = true;
                console.log('Supabase客户端初始化成功');
                return this.client;
            } catch (error) {
                console.error('Supabase客户端初始化失败:', error);
                return null;
            }
        } else {
            console.warn('Supabase库未加载或配置不完整');
            return null;
        }
    }

    getClient() {
        if (!this.initialized) {
            this.init();
        }
        return this.client;
    }
}

// 全局实例
const supabaseManager = new SupabaseManager();

// ==================== 登录管理器 ====================
class LoginManager {
    constructor() {
        this.isProcessing = false;
    }

    // 验证登录
    async validate(username, password) {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        
        try {
            // 首先尝试Supabase验证
            const supabaseResult = await this.validateWithSupabase(username, password);
            if (supabaseResult.success) {
                return supabaseResult;
            }
            
            // 回退到本地验证
            return this.validateLocally(username, password);
        } finally {
            this.isProcessing = false;
        }
    }

    // Supabase验证
    async validateWithSupabase(username, password) {
        const client = supabaseManager.getClient();
        if (!client) {
            return { success: false, message: '数据库连接失败' };
        }

        try {
            const { data, error } = await client
                .from('members')
                .select('*')
                .eq('student_id', username)
                .eq('password', password)
                .single();
            
            if (error) {
                return { success: false, message: '数据库查询失败' };
            }
            
            if (data) {
                return {
                    success: true,
                    user: {
                        name: data.name || '用户',
                        grade: data.grade || '未知班级',
                        role: data.role || 'student',
                        student_id: data.student_id || username
                    },
                    source: 'supabase'
                };
            }
            
            return { success: false, message: '用户不存在或密码错误' };
        } catch (error) {
            console.error('Supabase验证错误:', error);
            return { success: false, message: '数据库连接异常' };
        }
    }

    // 本地验证
    validateLocally(username, password) {
        const account = APP_CONFIG.testAccounts[username];
        
        if (account && account.password === password) {
            return {
                success: true,
                user: {
                    name: account.name,
                    grade: account.grade || '未知班级',
                    role: account.role || 'student',
                    student_id: username
                },
                source: 'local'
            };
        }
        
        return { success: false, message: '用户名或密码错误' };
    }

    // 保存登录状态
    saveLoginState(user, username, rememberMe = false) {
        try {
            const loginData = {
                user: user,
                username: username,
                loginTime: new Date().toISOString()
            };
            
            // 总是保存到sessionStorage
            sessionStorage.setItem('loginData', JSON.stringify(loginData));
            
            // 如果用户选择了记住我，保存到localStorage
            if (rememberMe) {
                localStorage.setItem('loginData', JSON.stringify(loginData));
            } else {
                localStorage.removeItem('loginData');
            }
            
            return true;
        } catch (error) {
            console.error('保存登录状态失败:', error);
            return false;
        }
    }

    // 获取登录状态
    getLoginState() {
        try {
            const loginData = sessionStorage.getItem('loginData') || localStorage.getItem('loginData');
            return loginData ? JSON.parse(loginData) : null;
        } catch (error) {
            console.error('获取登录状态失败:', error);
            return null;
        }
    }

    // 清除登录状态
    clearLoginState() {
        sessionStorage.removeItem('loginData');
        localStorage.removeItem('loginData');
    }

    // 检查是否登录
    isLoggedIn() {
        return this.getLoginState() !== null;
    }
}

// ==================== UI管理器 ====================
class UIManager {
    constructor() {
        this.loginManager = new LoginManager();
    }

    // 显示消息
    showMessage(text, type = 'info') {
        const messageEl = document.getElementById('loginMessage');
        if (!messageEl) return;
        
        messageEl.textContent = text;
        messageEl.className = `message message-${type}`;
        messageEl.style.display = 'block';
        
        // 自动隐藏消息
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);
    }

    // 设置按钮加载状态
    setButtonLoading(button, isLoading) {
        if (!button) return;
        
        if (isLoading) {
            button.innerHTML = '<span class="loading-spinner"></span> 登录中...';
            button.disabled = true;
            button.classList.add('loading');
        } else {
            button.innerHTML = '登录';
            button.disabled = false;
            button.classList.remove('loading');
        }
    }

    // 更新用户界面
    updateUI(user = null) {
        const userGreeting = document.getElementById('userGreeting');
        const modeBanner = document.getElementById('modeBanner');
        const bannerText = document.getElementById('bannerText');
        const switchToLogin = document.getElementById('switchToLogin');
        
        if (user) {
            // 用户已登录状态
            if (userGreeting) {
                userGreeting.textContent = `欢迎，${user.name}`;
            }
            
            if (modeBanner && bannerText) {
                modeBanner.className = 'mode-banner member-mode';
                bannerText.textContent = `欢迎回来，${user.name}！`;
            }
            
            if (switchToLogin) {
                switchToLogin.textContent = '进入会员中心';
                switchToLogin.onclick = (e) => {
                    e.preventDefault();
                    window.location.href = 'member.html';
                };
            }
            
            this.showAdminAccess(user.role);
        } else {
            // 访客状态
            if (userGreeting) {
                userGreeting.textContent = '欢迎访问';
            }
            
            if (modeBanner && bannerText) {
                modeBanner.className = 'mode-banner guest-mode';
                bannerText.textContent = '您当前处于访客浏览模式';
            }
            
            if (switchToLogin) {
                switchToLogin.textContent = '登录解锁更多内容';
                switchToLogin.onclick = (e) => {
                    e.preventDefault();
                    this.showLoginModal();
                };
            }
            
            this.hideAdminAccess();
        }
    }

    // 显示管理员访问入口
    showAdminAccess(userRole) {
        if (userRole !== 'admin' && userRole !== 'teacher') return;
        
        const navMenu = document.querySelector('.nav-menu');
        if (!navMenu) return;
        
        const existingAdminLink = navMenu.querySelector('a[href="admin-panel.html"]');
        if (existingAdminLink) return;
        
        const adminLink = document.createElement('li');
        adminLink.innerHTML = '<a href="admin-panel.html" style="color: #e74c3c; font-weight: bold;">⚙️ 管理后台</a>';
        navMenu.appendChild(adminLink);
    }

    // 隐藏管理员访问入口
    hideAdminAccess() {
        const existingAdminLink = document.querySelector('a[href="admin-panel.html"]');
        if (existingAdminLink) {
            existingAdminLink.parentElement.remove();
        }
    }

    // 显示登录模态框
    showLoginModal() {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.display = 'block';
        }
    }

    // 隐藏登录模态框
    hideLoginModal() {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.display = 'none';
        }
    }
}

// ==================== 登录处理器 ====================
class LoginHandler {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.loginManager = uiManager.loginManager;
    }

    // 处理登录提交
    async handleLogin(event) {
        event.preventDefault();
        
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const rememberMeInput = document.querySelector('input[name="remember"]');
        const submitBtn = document.getElementById('submitBtn');
        
        if (!usernameInput || !passwordInput) {
            this.uiManager.showMessage('系统错误：找不到登录表单元素', 'error');
            return;
        }
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = rememberMeInput ? rememberMeInput.checked : false;
        
        // 验证输入
        if (!username || !password) {
            this.uiManager.showMessage('请输入用户名和密码', 'error');
            return;
        }
        
        if (username.length < 3) {
            this.uiManager.showMessage('用户名至少3个字符', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.uiManager.showMessage('密码至少6个字符', 'error');
            return;
        }
        
        // 设置加载状态
        this.uiManager.setButtonLoading(submitBtn, true);
        
        try {
            const result = await this.loginManager.validate(username, password);
            
            if (result.success) {
                this.uiManager.showMessage('登录成功！', 'success');
                
                // 保存登录状态
                this.loginManager.saveLoginState(result.user, username, rememberMe);
                
                // 更新UI
                this.uiManager.updateUI(result.user);
                
                // 隐藏登录模态框
                setTimeout(() => {
                    this.uiManager.hideLoginModal();
                }, 1500);
                
            } else {
                this.uiManager.showMessage(result.message, 'error');
            }
        } catch (error) {
            console.error('登录处理异常:', error);
            this.uiManager.showMessage('登录失败，请稍后重试', 'error');
        } finally {
            this.uiManager.setButtonLoading(submitBtn, false);
        }
    }

    // 处理登出
    handleLogout() {
        if (confirm('确定要退出登录吗？')) {
            this.loginManager.clearLoginState();
            this.uiManager.updateUI(null);
            window.location.reload();
        }
    }

    // 处理访客模式
    handleGuestMode() {
        this.loginManager.clearLoginState();
        this.uiManager.updateUI(null);
        this.uiManager.showMessage('已切换到访客浏览模式', 'info');
    }
}

// ==================== 导航处理器 ====================
class NavigationHandler {
    // 初始化导航
    init() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
            
            // 点击其他地方关闭导航
            document.addEventListener('click', (event) => {
                if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
                    navMenu.classList.remove('active');
                }
            });
        }
    }
}

// ==================== 主应用程序 ====================
class LoginSystemApp {
    constructor() {
        this.uiManager = new UIManager();
        this.loginHandler = new LoginHandler(this.uiManager);
        this.navigationHandler = new NavigationHandler();
        this.initialized = false;
    }

    // 初始化应用程序
    init() {
        if (this.initialized) return;
        
        // 1. 初始化导航
        this.navigationHandler.init();
        
        // 2. 检查登录状态
        this.checkLoginStatus();
        
        // 3. 初始化事件监听器
        this.initEventListeners();
        
        // 4. 初始化Supabase
        supabaseManager.init();
        
        this.initialized = true;
        console.log('登录系统初始化完成');
    }

    // 检查登录状态
    checkLoginStatus() {
        const loginData = this.uiManager.loginManager.getLoginState();
        if (loginData && loginData.user) {
            this.uiManager.updateUI(loginData.user);
        } else {
            this.uiManager.updateUI(null);
        }
    }

    // 初始化事件监听器
    initEventListeners() {
        // 登录按钮
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.uiManager.showLoginModal();
            });
        }

        // 登录表单
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                this.loginHandler.handleLogin(e);
            });
        }

        // 关闭按钮
        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.uiManager.hideLoginModal();
            });
        }

        // 模态框外部点击关闭
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.addEventListener('click', (e) => {
                if (e.target === loginModal) {
                    this.uiManager.hideLoginModal();
                }
            });
        }

        // 访客模式按钮
        const viewModeBtn = document.getElementById('viewModeBtn');
        if (viewModeBtn) {
            viewModeBtn.addEventListener('click', () => {
                this.loginHandler.handleGuestMode();
            });
        }

        // 横幅登录按钮
        const switchToLogin = document.getElementById('switchToLogin');
        if (switchToLogin) {
            // 点击事件在UI更新时动态设置
        }

        // 添加键盘事件支持
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.uiManager.hideLoginModal();
            }
        });
    }
}

// ==================== 全局导出 ====================
// 创建全局应用程序实例
window.loginSystem = new LoginSystemApp();

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 初始化应用程序
    window.loginSystem.init();
    
    // 全局注销函数
    window.logout = function() {
        window.loginSystem.loginHandler.handleLogout();
    };
    
    // 全局访客模式函数
    window.setGuestMode = function() {
        window.loginSystem.loginHandler.handleGuestMode();
    };
    
    console.log('应用程序启动完成');
});

// ==================== CSS样式增强 ====================
// 添加一些基础样式增强
const style = document.createElement('style');
style.textContent = `
    .loading-spinner {
        display: inline-block;
        width: 12px;
        height: 12px;
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        border-top-color: #fff;
        animation: spin 1s ease-in-out infinite;
        margin-right: 8px;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    button.loading {
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    .message {
        padding: 10px 15px;
        margin: 10px 0;
        border-radius: 4px;
        font-size: 14px;
    }
    
    .message-success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
    
    .message-error {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
    
    .message-info {
        background-color: #d1ecf1;
        color: #0c5460;
        border: 1px solid #bee5eb;
    }
    
    /* 模态框动画 */
    .modal {
        display: none;
        animation: fadeIn 0.3s ease-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .modal-content {
        animation: slideDown 0.3s ease-out;
    }
    
    @keyframes slideDown {
        from { transform: translateY(-20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
`;

document.head.appendChild(style);
