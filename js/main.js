// 初始化Supabase客户端 - 只在main.js中初始化一次
const supabaseUrl = 'https://wxbemuwgiiucdgmbhbvg.supabase.co';
const supabaseKey = 'sb_publishable_KuzTRmYOZ9P6UmKgmb_VwA_6Qj_A6Nk';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// 登录函数
async function login(studentId, password) {
    try {
        // 先查询学号是否存在
        const { data: user, error: queryError } = await supabase
            .from('members')
            .select('*')
            .eq('student_id', studentId)
            .single();

        if (queryError || !user) {
            throw new Error('用户不存在或学号错误');
        }

        // 验证密码
        if (user.password !== password) {
            throw new Error('密码错误');
        }

        return user;
    } catch (error) {
        console.error('登录错误:', error);
        throw error;
    }
}

// 初始化登录系统
function initLoginSystem() {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const closeBtn = document.querySelector('.close');
    const modal = document.getElementById('loginModal');
    
    // 登录按钮点击事件
    loginBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });
    
    // 关闭按钮点击事件
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // 表单提交事件
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const studentId = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const messageEl = document.getElementById('loginMessage');
        
        messageEl.textContent = '登录中...';
        messageEl.className = 'message info';
        
        try {
            const user = await login(studentId, password);
            messageEl.textContent = `欢迎回来，${user.name || '成员'}!`;
            messageEl.className = 'message success';
            
            // 更新UI显示登录状态
            updateLoginState(true, user);
            
            // 3秒后关闭模态框
            setTimeout(() => {
                modal.style.display = 'none';
            }, 3000);
        } catch (error) {
            messageEl.textContent = error.message;
            messageEl.className = 'message error';
        }
    });
}

// 更新登录状态
function updateLoginState(isLoggedIn, user = null) {
    const greetingEl = document.getElementById('userGreeting');
    const bannerEl = document.getElementById('modeBanner');
    const switchBtn = document.getElementById('switchToLogin');
    
    if (isLoggedIn && user) {
        greetingEl.textContent = `欢迎，${user.name || user.student_id}`;
        bannerEl.className = 'mode-banner member-mode';
        document.getElementById('bannerText').textContent = '您已登录会员账户';
        switchBtn.textContent = '退出登录';
        
        // 更新退出登录功能
        switchBtn.onclick = () => {
            updateLoginState(false);
        };
    } else {
        greetingEl.textContent = '欢迎访问';
        bannerEl.className = 'mode-banner guest-mode';
        document.getElementById('bannerText').textContent = '您当前处于访客浏览模式';
        switchBtn.textContent = '登录解锁更多内容';
        
        // 恢复登录功能
        switchBtn.onclick = () => {
            document.getElementById('loginModal').style.display = 'block';
        };
    }
}

// 应用程序初始化
function initApp() {
    console.log('应用程序初始化开始');
    
    // 初始化登录系统
    initLoginSystem();
    
    // 其他初始化代码...
    console.log('应用程序初始化完成');
}

// 启动应用
document.addEventListener('DOMContentLoaded', initApp);
