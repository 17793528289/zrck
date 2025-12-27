// 启用严格模式
"use strict";

// Supabase配置
const SUPABASE_CONFIG = {
    url: 'https://wxbemuwgiiucdgmbhbvg.supabase.co',
    anonKey: 'sb_publishable_KuzTRmYOZ9P6UmKgmb_VwA_6Qj_A6Nk'
};

// 初始化Supabase客户端
const supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// 主初始化函数
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeLoginSystem();
    checkExistingLogin();
});

// 导航系统初始化
function initializeNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
}

// 登录系统初始化
function initializeLoginSystem() {
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeBtn = document.querySelector('.close');
    const loginForm = document.getElementById('loginForm');
    const viewModeBtn = document.getElementById('viewModeBtn');
    const switchToLogin = document.getElementById('switchToLogin');

    // 登录按钮点击事件
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (loginModal) {
                loginModal.style.display = 'block';
            }
        });
    }

    // 关闭按钮
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            if (loginModal) {
                loginModal.style.display = 'none';
                clearLoginMessage();
            }
        });
    }

    // 点击模态框外部关闭
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
                clearLoginMessage();
            }
        });
    }

    // 登录表单提交
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const submitBtn = document.getElementById('submitBtn');
            
            // 输入验证
            if (!username || !password) {
                showLoginMessage('请输入用户名和密码', 'error');
                return;
            }
            
            // 设置加载状态
            setButtonLoading(true, submitBtn);
            
            try {
                const loginResult = await validateLogin(username, password);
                
                if (loginResult.success) {
                    showLoginMessage('登录成功！', 'success');
                    saveLoginState(loginResult.user, username);
                    updateUIAfterLogin(loginResult.user);
                    
                    setTimeout(() => {
                        if (loginModal) loginModal.style.display = 'none';
                    }, 2000);
                    
                } else {
                    showLoginMessage(loginResult.message, 'error');
                }
            } catch (error) {
                console.error('登录过程异常:', error);
                showLoginMessage('登录出现异常，请重试', 'error');
            } finally {
                setButtonLoading(false, submitBtn);
            }
        });
    }

    // 访客模式按钮
    if (viewModeBtn) {
        viewModeBtn.addEventListener('click', setGuestMode);
    }

    // 横幅登录按钮
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            if (loginModal) {
                loginModal.style.display = 'block';
            }
        });
    }
}

// 验证登录信息
async function validateLogin(username, password) {
    try {
        // 首先尝试Supabase验证
        const { data, error } = await supabase
            .from('members')
            .select('*')
            .eq('student_id', username)
            .eq('password', password)
            .single();
        
        if (!error && data) {
            return {
                success: true,
                user: {
                    name: data.name,
                    grade: data.grade || '未知班级',
                    role: data.role || 'student',
                    student_id: data.student_id
                },
                message: '登录成功'
            };
        }
        
        // 如果Supabase验证失败，回退到本地验证
        return validateLocalLogin(username, password);
        
    } catch (error) {
        console.error('Supabase登录异常:', error);
        return validateLocalLogin(username, password);
    }
}

// 本地验证函数（备用方案）
function validateLocalLogin(username, password) {
    const testAccounts = {
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
    };
    
    if (testAccounts[username] && testAccounts[username].password === password) {
        return {
            success: true,
            user: testAccounts[username],
            message: '登录成功（本地模式）'
        };
    }
    
    return {
        success: false,
        message: '用户名或密码错误'
    };
}

// 设置按钮加载状态
function setButtonLoading(isLoading, button) {
    if (!button) return;
    
    if (isLoading) {
        button.textContent = '登录中...';
        button.disabled = true;
        button.classList.add('loading');
    } else {
        button.textContent = '登录';
        button.disabled = false;
        button.classList.remove('loading');
    }
}

// 显示登录消息
function showLoginMessage(text, type) {
    const messageEl = document.getElementById('loginMessage');
    if (messageEl) {
        messageEl.textContent = text;
        messageEl.className = `message ${type}`;
        messageEl.style.display = 'block';
        
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);
    }
}

// 清除登录消息
function clearLoginMessage() {
    const messageEl = document.getElementById('loginMessage');
    if (messageEl) {
        messageEl.style.display = 'none';
    }
}

// 保存登录状态
function saveLoginState(user, username) {
    try {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('loginTime', new Date().toISOString());
        
        const rememberMe = document.querySelector('input[name="remember"]');
        if (rememberMe && rememberMe.checked) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('username', username);
        }
    } catch (error) {
        console.error('保存登录状态失败:', error);
    }
}

// 登录后更新UI
function updateUIAfterLogin(user) {
    // 更新用户问候语
    const userGreeting = document.getElementById('userGreeting');
    if (userGreeting) {
        userGreeting.textContent = `欢迎，${user.name}`;
    }
    
    // 更新模式横幅
    const modeBanner = document.getElementById('modeBanner');
    const bannerText = document.getElementById('bannerText');
    if (modeBanner && bannerText) {
        modeBanner.className = 'mode-banner member-mode';
        bannerText.textContent = `欢迎回来，${user.name}！`;
        
        // 更新横幅按钮
        const switchToLogin = document.getElementById('switchToLogin');
        if (switchToLogin) {
            switchToLogin.textContent = '进入会员中心';
            switchToLogin.onclick = function(e) {
                e.preventDefault();
                window.location.href = 'member.html';
            };
        }
    }
    
    // 如果是管理员，显示管理员入口
    if (user.role === 'admin' || user.role === 'teacher') {
        showAdminAccess();
    }
}

// 设置访客模式
function setGuestMode() {
    // 清除登录状态
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('username');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('username');
    
    // 更新UI
    const userGreeting = document.getElementById('userGreeting');
    if (userGreeting) {
        userGreeting.textContent = '欢迎访问';
    }
    
    // 更新模式横幅
    const modeBanner = document.getElementById('modeBanner');
    const bannerText = document.getElementById('bannerText');
    if (modeBanner && bannerText) {
        modeBanner.className = 'mode-banner guest-mode';
        bannerText.textContent = '您当前处于访客浏览模式';
        
        // 重置横幅按钮
        const switchToLogin = document.getElementById('switchToLogin');
        if (switchToLogin) {
            switchToLogin.textContent = '登录解锁更多内容';
            switchToLogin.onclick = function(e) {
                e.preventDefault();
                const modal = document.getElementById('loginModal');
                if (modal) modal.style.display = 'block';
            };
        }
    }
    
    // 移除管理员入口
    const existingAdminLink = document.querySelector('a[href="admin-panel.html"]');
    if (existingAdminLink) {
        existingAdminLink.parentElement.remove();
    }
    
    alert('已切换到访客浏览模式');
}

// 检查是否已经登录
function checkExistingLogin() {
    let currentUser = null;
    try {
        currentUser = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
        if (currentUser) {
            const user = JSON.parse(currentUser);
            updateUIAfterLogin(user);
        }
    } catch (error) {
        console.error('检查登录状态时出错:', error);
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('currentUser');
    }
}

// 显示管理员访问入口
function showAdminAccess() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        const existingAdminLink = navMenu.querySelector('a[href="admin-panel.html"]');
        if (!existingAdminLink) {
            const adminLink = document.createElement('li');
            adminLink.innerHTML = '<a href="admin-panel.html" style="color: #e74c3c; font-weight: bold;">⚙️ 管理后台</a>';
            navMenu.appendChild(adminLink);
        }
    }
}

// 退出登录函数（供其他页面使用）
function logout() {
    if (confirm('确定要退出登录吗？')) {
        sessionStorage.clear();
        localStorage.removeItem('currentUser');
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    }
}
