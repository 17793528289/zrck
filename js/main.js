// main.js - 武威第十八中学卓然创客社团网站

/**
 * 武威第十八中学卓然创客社团网站主JavaScript文件
 * 功能：用户认证、登录状态管理、UI交互控制
 */

// ==================== SUPABASE 客户端初始化 ====================
// 使用单例模式，确保全局只有一个 Supabase 实例[6](@ref)
const SUPABASE_URL = 'https://wxbemuwgiiucdgmbhbvg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_KuzTRmYOZ9P6UmKgmb_VwA_6Qj_A6Nk';

// 检查是否已存在全局 supabase 实例，避免重复声明[6](@ref)
if (typeof window.supabase === 'undefined') {
    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase 客户端初始化成功');
} else {
    console.log('使用已存在的 Supabase 实例');
}

// ==================== 全局变量和配置 ====================
const CONFIG = {
    sessionTimeout: 60 * 60 * 1000, // 会话超时时间：1小时
    autoCloseModal: 3000, // 登录成功后自动关闭模态框时间：3秒
    testAccount: {
        username: '2023001',
        password: '123456'
    }
};

// ==================== 核心功能函数 ====================

/**
 * 用户登录函数
 * @param {string} studentId - 学号/用户名
 * @param {string} password - 密码
 * @returns {Promise<Object>} 用户信息
 */
async function login(studentId, password) {
    try {
        console.log('尝试登录:', studentId);
        
        // 使用 Supabase 查询用户信息[7](@ref)
        const { data: user, error: queryError } = await supabase
            .from('members')
            .select('*')
            .eq('student_id', studentId)
            .single();

        if (queryError) {
            console.error('查询错误:', queryError);
            throw new Error('查询用户信息时出错，请检查网络连接');
        }

        if (!user) {
            throw new Error('用户不存在或学号错误');
        }

        // 验证密码[7](@ref)
        if (user.password !== password) {
            throw new Error('密码错误');
        }

        // 保存登录状态到本地存储
        const loginInfo = {
            user: user,
            loginTime: new Date().getTime(),
            isLoggedIn: true
        };
        localStorage.setItem('makerclub_session', JSON.stringify(loginInfo));
        
        console.log('登录成功:', user.name || user.student_id);
        return user;
    } catch (error) {
        console.error('登录错误:', error);
        throw error;
    }
}

/**
 * 用户注销函数
 */
function logout() {
    localStorage.removeItem('makerclub_session');
    updateLoginState(false);
    showMessage('您已成功退出登录', 'success');
}

/**
 * 检查登录状态
 * @returns {Object|null} 登录信息或null
 */
function checkLoginStatus() {
    const session = localStorage.getItem('makerclub_session');
    if (!session) return null;
    
    try {
        const loginInfo = JSON.parse(session);
        const currentTime = new Date().getTime();
        
        // 检查会话是否过期
        if (currentTime - loginInfo.loginTime > CONFIG.sessionTimeout) {
            localStorage.removeItem('makerclub_session');
            return null;
        }
        
        return loginInfo;
    } catch (error) {
        console.error('解析登录信息错误:', error);
        localStorage.removeItem('makerclub_session');
        return null;
    }
}

/**
 * 更新登录状态UI
 * @param {boolean} isLoggedIn - 是否已登录
 * @param {Object} user - 用户信息
 */
function updateLoginState(isLoggedIn, user = null) {
    const greetingEl = document.getElementById('userGreeting');
    const bannerEl = document.getElementById('modeBanner');
    const switchBtn = document.getElementById('switchToLogin');
    const bannerText = document.getElementById('bannerText');
    const loginBtn = document.getElementById('loginBtn');
    const viewModeBtn = document.getElementById('viewModeBtn');
    
    if (isLoggedIn && user) {
        // 登录状态
        const displayName = user.name || user.student_id || '成员';
        greetingEl.textContent = `欢迎，${displayName}`;
        bannerEl.className = 'mode-banner member-mode';
        bannerText.textContent = `您已登录会员账户（${displayName}）`;
        switchBtn.textContent = '退出登录';
        loginBtn.style.display = 'none';
        viewModeBtn.style.display = 'inline-block';
        
        // 更新退出登录功能
        switchBtn.onclick = () => logout();
    } else {
        // 访客状态
        greetingEl.textContent = '欢迎访问';
        bannerEl.className = 'mode-banner guest-mode';
        bannerText.textContent = '您当前处于访客浏览模式';
        switchBtn.textContent = '登录解锁更多内容';
        loginBtn.style.display = 'inline-block';
        viewModeBtn.style.display = 'none';
        
        // 恢复登录功能
        switchBtn.onclick = () => showLoginModal();
    }
}

/**
 * 显示消息提示
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型：success, error, info
 */
function showMessage(message, type = 'info') {
    const messageEl = document.getElementById('loginMessage');
    if (!messageEl) return;
    
    messageEl.textContent = message;
    messageEl.style.display = 'block';
    
    // 根据类型设置样式
    const styles = {
        success: { background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' },
        error: { background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' },
        info: { background: '#d1ecf1', color: '#0c5460', border: '1px solid #bee5eb' }
    };
    
    Object.assign(messageEl.style, styles[type]);
    
    // 3秒后自动隐藏
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 3000);
}

/**
 * 显示登录模态框
 */
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'block';
        // 清空表单
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('loginMessage').style.display = 'none';
    }
}

/**
 * 隐藏登录模态框
 */
function hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ==================== 事件处理函数 ====================

/**
 * 初始化登录系统事件监听
 */
function initLoginSystem() {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const closeBtn = document.querySelector('.close');
    const modal = document.getElementById('loginModal');
    const switchBtn = document.getElementById('switchToLogin');
    
    if (!loginBtn || !loginForm) {
        console.error('必要的DOM元素未找到');
        return;
    }
    
    // 登录按钮点击事件
    loginBtn.addEventListener('click', showLoginModal);
    
    // 切换登录按钮事件
    switchBtn.addEventListener('click', () => {
        const session = checkLoginStatus();
        if (session && session.isLoggedIn) {
            logout();
        } else {
            showLoginModal();
        }
    });
    
    // 关闭按钮点击事件
    closeBtn.addEventListener('click', hideLoginModal);
    
    // 点击模态框外部关闭
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideLoginModal();
        }
    });
    
    // 表单提交事件
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const studentId = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const messageEl = document.getElementById('loginMessage');
        
        if (!studentId || !password) {
            showMessage('请输入学号和密码', 'error');
            return;
        }
        
        // 测试账户快速登录[7](@ref)
        if (studentId === CONFIG.testAccount.username && password === CONFIG.testAccount.password) {
            showMessage('测试账户登录成功！', 'success');
            updateLoginState(true, { 
                student_id: CONFIG.testAccount.username,
                name: '测试用户'
            });
            setTimeout(hideLoginModal, CONFIG.autoCloseModal);
            return;
        }
        
        showMessage('登录中...', 'info');
        
        try {
            const user = await login(studentId, password);
            showMessage(`欢迎回来，${user.name || '成员'}！`, 'success');
            updateLoginState(true, user);
            
            // 自动关闭模态框
            setTimeout(hideLoginModal, CONFIG.autoCloseModal);
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });
}

/**
 * 初始化页面交互功能
 */
function initPageInteractions() {
    // 平滑滚动到锚点
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
    
    // 导航菜单激活状态
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

// ==================== 应用程序初始化 ====================

/**
 * 主初始化函数
 */
function initApp() {
    console.log('武威第十八中学卓然创客社团网站初始化开始');
    
    try {
        // 检查现有登录状态
        const session = checkLoginStatus();
        if (session && session.isLoggedIn) {
            updateLoginState(true, session.user);
            console.log('检测到已登录用户:', session.user.name || session.user.student_id);
        } else {
            updateLoginState(false);
            console.log('当前处于访客模式');
        }
        
        // 初始化各功能模块
        initLoginSystem();
        initPageInteractions();
        
        console.log('网站初始化完成');
    } catch (error) {
        console.error('初始化过程中发生错误:', error);
        showMessage('系统初始化失败，请刷新页面重试', 'error');
    }
}

// ==================== 页面加载完成后执行 ====================

/**
 * DOM内容加载完成后初始化应用
 */
document.addEventListener('DOMContentLoaded', initApp);

/**
 * 页面卸载前清理资源
 */
window.addEventListener('beforeunload', () => {
    // 清理可能的临时数据
    console.log('页面即将卸载，执行清理操作');
});

// 导出函数供其他模块使用（如果使用模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        login,
        logout,
        checkLoginStatus,
        updateLoginState,
        showMessage
    };
}
