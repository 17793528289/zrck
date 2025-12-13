// 导航栏切换
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        
        // 汉堡菜单动画
        const spans = navToggle.querySelectorAll('span');
        spans.forEach(span => span.classList.toggle('active'));
    });
}

// 页面加载动画
document.addEventListener('DOMContentLoaded', function() {
    // 添加淡入动画
    const elements = document.querySelectorAll('.feature-item, .activity-card');
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.6s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });
});

// 表单验证（用于加入我们页面）
function validateForm() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const grade = document.getElementById('grade').value;
    
    if (name === '' || email === '' || grade === '') {
        alert('请填写所有必填字段');
        return false;
    }
    
    if (!validateEmail(email)) {
        alert('请输入有效的邮箱地址');
        return false;
    }
    
    return true;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// 图片懒加载
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// 滚动效果
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = '#fff';
        navbar.style.backdropFilter = 'none';
    }
});

// 初始化函数
function init() {
    lazyLoadImages();
    
    // 为所有链接添加平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 页面加载完成后初始化
window.addEventListener('load', init);
// 用户数据
const users = {
    '2023001': { password: '123456', name: '张三', role: 'student', class: '高一(1)班' },
    '2023002': { password: '123456', name: '李四', role: 'student', class: '高一(2)班' },
    'teacher': { password: 'teacher123', name: '王老师', role: 'teacher' },
    'admin': { password: 'admin123', name: '管理员', role: 'admin' }
};

// DOM元素
const loginBtn = document.getElementById('loginBtn');
const guestBtn = document.getElementById('guestBtn');
const loginModal = document.getElementById('loginModal');
const closeBtn = document.querySelector('.close');
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const userGreeting = document.getElementById('userGreeting');
const guestBanner = document.getElementById('guestBanner');
const memberContent = document.getElementById('memberContent');
const guestContent = document.getElementById('guestContent');
const quickVisit = document.getElementById('quickVisit');
const promptLogin = document.getElementById('promptLogin');
const loginLink = document.getElementById('loginLink');

// 初始化
function initAuthSystem() {
    checkLoginStatus();
    setupEventListeners();
}

// 检查登录状态
function checkLoginStatus() {
    const userData = localStorage.getItem('zrck_user');
    const visitData = localStorage.getItem('zrck_visitor');
    
    if (userData) {
        const user = JSON.parse(userData);
        setUserMode(user);
    } else if (visitData) {
        setVisitorMode();
    } else {
        // 默认访客模式
        setVisitorMode();
    }
}

// 设置事件监听
function setupEventListeners() {
    // 登录按钮
    loginBtn.addEventListener('click', () => {
        showLoginModal();
        switchToMemberLogin();
    });

    // 访客按钮
    guestBtn.addEventListener('click', setVisitorMode);

    // 快速体验按钮
    quickVisit.addEventListener('click', setVisitorMode);

    // 提示登录按钮
    promptLogin.addEventListener('click', showLoginModal);
    loginLink.addEventListener('click', showLoginModal);

    // 关闭访客提示
    document.getElementById('closeGuestBanner').addEventListener('click', () => {
        guestBanner.style.display = 'none';
    });

    // 登录选项切换
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            if (this.dataset.type === 'visitor') {
                switchToVisitorLogin();
            } else {
                switchToMemberLogin();
            }
        });
    });

    // 开始访客体验
    document.getElementById('startVisit').addEventListener('click', setVisitorMode);

    // 登录表单提交
    loginForm.addEventListener('submit', handleLogin);

    // 模态框关闭
    closeBtn.addEventListener('click', closeLoginModal);
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) closeLoginModal();
    });
}

// 显示登录模态框
function showLoginModal() {
    loginModal.style.display = 'block';
}

// 关闭登录模态框
function closeLoginModal() {
    loginModal.style.display = 'none';
    clearMessage();
}

// 切换到会员登录
function switchToMemberLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('visitorPanel').style.display = 'none';
}

// 切换到访客登录
function switchToVisitorLogin() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('visitorPanel').style.display = 'block';
}

// 处理登录
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (users[username] && users[username].password === password) {
        const user = {
            username: username,
            ...users[username]
        };
        
        localStorage.setItem('zrck_user', JSON.stringify(user));
        localStorage.removeItem('zrck_visitor');
        
        showMessage('登录成功！', 'success');
        setTimeout(() => {
            closeLoginModal();
            setUserMode(user);
        }, 1000);
    } else {
        showMessage('用户名或密码错误！', 'error');
    }
}

// 设置用户模式
function setUserMode(user) {
    userGreeting.textContent = `欢迎，${user.name}`;
    guestBanner.style.display = 'none';
    memberContent.style.display = 'block';
    guestContent.style.display = 'none';
    
    // 显示会员专属活动
    document.querySelectorAll('.member-activity').forEach(el => {
        el.style.display = 'block';
    });
    
    // 更新用户菜单
    updateUserMenu(user);
}

// 设置访客模式
function setVisitorMode() {
    userGreeting.textContent = '欢迎访客';
    guestBanner.style.display = 'block';
    memberContent.style.display = 'none';
    guestContent.style.display = 'block';
    
    // 隐藏会员专属活动
    document.querySelectorAll('.member-activity').forEach(el => {
        el.style.display = 'none';
    });
    
    localStorage.setItem('zrck_visitor', 'true');
    localStorage.removeItem('zrck_user');
    
    closeLoginModal();
    showMessage('已切换到访客模式', 'success');
}

// 更新用户菜单
function updateUserMenu(user) {
    const dropdown = document.querySelector('.user-dropdown');
    dropdown.innerHTML = `
        <button class="user-info">${user.name} (${user.role})</button>
        <button id="logoutBtn" class="logout-btn">退出登录</button>
        <button id="switchToGuest" class="guest-btn">切换访客模式</button>
    `;
    
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('switchToGuest').addEventListener('click', setVisitorMode);
}

// 退出登录
function logout() {
    localStorage.removeItem('zrck_user');
    showMessage('已退出登录', 'success');
    setVisitorMode();
}

// 显示消息
function showMessage(text, type) {
    loginMessage.textContent = text;
    loginMessage.className = `message ${type}`;
    loginMessage.style.display = 'block';
    
    setTimeout(() => {
        loginMessage.style.display = 'none';
    }, 3000);
}

// 清除消息
function clearMessage() {
    loginMessage.style.display = 'none';
}

// 初始化系统
document.addEventListener('DOMContentLoaded', initAuthSystem);
