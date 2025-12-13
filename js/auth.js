// 用户认证功能
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.init();
    }

    // 测试用户数据
    users = {
        '2023001': { password: '123456', name: '张三', grade: '高一(1)班' },
        '2023002': { password: '123456', name: '李四', grade: '高一(3)班' },
        'admin': { password: 'admin123', name: '管理员', grade: '教师' }
    };

    init() {
        this.bindEvents();
        this.checkLoginStatus();
    }

    bindEvents() {
        // 登录按钮点击事件
        document.getElementById('loginBtn')?.addEventListener('click', () => {
            this.showLoginModal();
        });

        // 访客模式按钮
        document.getElementById('viewModeBtn')?.addEventListener('click', () => {
            this.setGuestMode();
        });

        // 模态框关闭事件
        document.querySelector('.close')?.addEventListener('click', () => {
            this.hideLoginModal();
        });

        // 模态框外部点击关闭
        document.getElementById('loginModal')?.addEventListener('click', (e) => {
            if (e.target === document.getElementById('loginModal')) {
                this.hideLoginModal();
            }
        });

        // 登录表单提交
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // 横幅登录按钮
        document.getElementById('switchToLogin')?.addEventListener('click', () => {
            this.showLoginModal();
        });
    }

    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // 禁止背景滚动
        }
    }

    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = ''; // 恢复背景滚动
            this.clearLoginForm();
        }
    }

    clearLoginForm() {
        const form = document.getElementById('loginForm');
        if (form) {
            form.reset();
            this.hideMessage();
        }
    }

    async handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.querySelector('input[name="remember"]').checked;

        // 简单验证
        if (!username || !password) {
            this.showMessage('请输入用户名和密码', 'error');
            return;
        }

        // 模拟登录验证
        if (this.authenticate(username, password)) {
            this.showMessage('登录成功！', 'success');
            
            // 延迟跳转，让用户看到成功消息
            setTimeout(() => {
                this.loginSuccess(username, rememberMe);
            }, 1000);
        } else {
            this.showMessage('用户名或密码错误', 'error');
        }
    }

    authenticate(username, password) {
        return this.users[username] && this.users[username].password === password;
    }

    loginSuccess(username, rememberMe) {
        this.isLoggedIn = true;
        this.currentUser = this.users[username];
        
        // 保存登录状态
        if (rememberMe) {
            localStorage.setItem('userToken', username);
            localStorage.setItem('userData', JSON.stringify(this.currentUser));
        } else {
            sessionStorage.setItem('userToken', username);
            sessionStorage.setItem('userData', JSON.stringify(this.currentUser));
        }

        this.updateUI();
        this.hideLoginModal();
        
        // 显示欢迎消息
        this.showWelcomeMessage();
    }

    showWelcomeMessage() {
        const banner = document.getElementById('modeBanner');
        if (banner) {
            banner.innerHTML = `
                <div class="banner-content">
                    <span class="banner-icon">🎉</span>
                    <span>欢迎回来，${this.currentUser.name}！</span>
                    <button onclick="auth.logout()" class="banner-action">退出登录</button>
                </div>
            `;
            banner.className = 'mode-banner member-mode';
        }
    }

    logout() {
        this.isLoggedIn = false;
        this.currentUser = null;
        
        // 清除存储
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        sessionStorage.removeItem('userToken');
        sessionStorage.removeItem('userData');

        this.updateUI();
        this.setGuestMode();
    }

    checkLoginStatus() {
        let token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        let userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');

        if (token && userData) {
            this.isLoggedIn = true;
            this.currentUser = JSON.parse(userData);
            this.updateUI();
            this.showWelcomeMessage();
        } else {
            this.setGuestMode();
        }
    }

    setGuestMode() {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.updateUI();
    }

    updateUI() {
        const banner = document.getElementById('modeBanner');
        const userGreeting = document.getElementById('userGreeting');

        if (this.isLoggedIn) {
            if (banner) {
                banner.style.display = 'block';
            }
            if (userGreeting) {
                userGreeting.textContent = `欢迎，${this.currentUser.name}`;
            }
        } else {
            if (banner) {
                banner.innerHTML = `
                    <div class="banner-content">
                        <span class="banner-icon">👤</span>
                        <span>您当前处于访客浏览模式</span>
                        <button onclick="auth.showLoginModal()" class="banner-action">登录解锁更多内容</button>
                    </div>
                `;
                banner.className = 'mode-banner guest-mode';
            }
            if (userGreeting) {
                userGreeting.textContent = '欢迎访问';
            }
        }
    }

    showMessage(message, type) {
        const messageEl = document.getElementById('loginMessage');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `message ${type}`;
            messageEl.style.display = 'block';

            // 3秒后自动隐藏
            setTimeout(() => {
                this.hideMessage();
            }, 3000);
        }
    }

    hideMessage() {
        const messageEl = document.getElementById('loginMessage');
        if (messageEl) {
            messageEl.style.display = 'none';
        }
    }
}

// 创建全局实例
const auth = new AuthManager();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 确保模态框初始隐藏
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
    }
});
