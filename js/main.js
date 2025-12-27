// 启用严格模式
"use strict";

// Supabase配置 - 请替换为您的实际项目配置
const SUPABASE_CONFIG = {
    url: 'https://your-project-ref.supabase.co',
    anonKey: 'your-anon-key'
};

// 初始化Supabase客户端
const supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// 主初始化函数
document.addEventListener('DOMContentLoaded', function() {
    console.log('网站初始化开始...');
    
    try {
        initializeNavigation();
        initializeLoginSystem();
        initializeAnimations();
        initializeMobileMenu();
        checkExistingLogin();
        
        console.log('网站初始化完成');
    } catch (error) {
        console.error('初始化过程中发生错误:', error);
        showNotification('页面初始化失败，请刷新页面重试', 'error');
    }
});

// 导航系统初始化
function initializeNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
    
    // 平滑滚动
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 登录系统初始化
function initializeLoginSystem() {
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeBtn = document.querySelector('.close');
    const loginForm = document.getElementById('loginForm');
    const modeBanner = document.getElementById('modeBanner');
    const switchToLogin = document.getElementById('switchToLogin');
    const viewModeBtn = document.getElementById('viewModeBtn');
    
    // 确保模态框初始隐藏
    if (loginModal) {
        loginModal.style.display = 'none';
    }
    
    // 事件监听器绑定
    bindEvent(loginBtn, 'click', showLoginModal);
    bindEvent(closeBtn, 'click', hideLoginModal);
    bindEvent(loginModal, 'click', handleModalClick);
    bindEvent(loginForm, 'submit', handleLoginSubmit);
    bindEvent(viewModeBtn, 'click', setGuestMode);
    bindEvent(switchToLogin, 'click', showLoginModal);
    
    // 显示模式横幅
    if (modeBanner) {
        setTimeout(() => {
            modeBanner.style.display = 'block';
            setTimeout(() => modeBanner.classList.add('show'), 100);
        }, 1000);
    }
}

// 动画系统初始化
function initializeAnimations() {
    // 滚动动画
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // 观察所有需要动画的元素
    const animatedElements = document.querySelectorAll('.feature-item, .resource-card, .activity-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// 移动端菜单初始化
function initializeMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        // 点击菜单外区域关闭菜单
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }
}

// 通用事件绑定函数
function bindEvent(element, event, handler) {
    if (element) {
        element.addEventListener(event, handler);
    }
}

// 显示登录模态框
function showLoginModal(e) {
    if (e) e.preventDefault();
    
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.style.display = 'block';
        clearLoginMessage();
        
        // 添加显示动画
        setTimeout(() => {
            loginModal.style.opacity = '1';
            loginModal.style.transform = 'scale(1)';
        }, 10);
    }
}

// 隐藏登录模态框
function hideLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.style.opacity = '0';
        loginModal.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            loginModal.style.display = 'none';
            clearLoginMessage();
        }, 300);
    }
}

// 处理模态框点击
function handleModalClick(e) {
    if (e.target === this) {
        hideLoginModal();
    }
}

// 处理登录提交
async function handleLoginSubmit(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const submitBtn = document.getElementById('submitBtn');
    
    // 输入验证
    if (!validateLoginInput(username, password)) return;
    
    // 设置加载状态
    setButtonLoading(true, submitBtn);
    
    try {
        const loginResult = await validateLoginWithSupabase(username, password);
        
        if (loginResult.success) {
            await handleLoginSuccess(loginResult.user, username);
        } else {
            showLoginMessage(loginResult.message, 'error');
        }
    } catch (error) {
        console.error('登录过程异常:', error);
        showLoginMessage('登录出现异常，请重试', 'error');
    } finally {
        setButtonLoading(false, submitBtn);
    }
}

// 验证登录输入
function validateLoginInput(username, password) {
    if (!username || !password) {
        showLoginMessage('请输入用户名和密码', 'error');
        return false;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        showLoginMessage('用户名包含非法字符', 'error');
        return false;
    }
    
    return true;
}

// 使用Supabase验证登录
async function validateLoginWithSupabase(username, password) {
    try {
        const { data, error } = await supabase
            .from('members')
            .select('*')
            .eq('student_id', username)
            .eq('password', password)
            .single();
        
        if (error) {
            console.error('Supabase查询错误:', error);
            return validateLocalLogin(username, password);
        }
        
        if (data) {
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
        } else {
            return validateLocalLogin(username, password);
        }
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

// 处理登录成功
async function handleLoginSuccess(user, username) {
    showLoginMessage('登录成功！正在跳转...', 'success');
    
    saveLoginState(user, username);
    updateUIAfterLogin(user);
    
    // 延迟跳转以显示成功消息
    setTimeout(() => {
        window.location.href = 'member.html';
    }, 2000);
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
    updateUserGreeting(user);
    updateModeBanner(user);
    
    if (user.role === 'admin' || user
