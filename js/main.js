// 初始化Supabase客户端
const supabaseUrl = 'https://wxbemuwgiiucdgmbhbvg.supabase.co';
const supabaseKey = '你的Supabase匿名公共密钥';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// 登录函数 - 修改为更安全的查询方式
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

        // 验证密码 - 这里假设密码在数据库中是加密存储的
        // 实际应用中应该使用Supabase Auth或加密比较
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
    
    if (isLoggedIn && user) {
        greetingEl.textContent = `欢迎，${user.name || user.student_id}`;
        bannerEl.className = 'mode-banner member-mode';
        document.getElementById('bannerText').textContent = '您已登录会员账户';
    } else {
        greetingEl.textContent = '欢迎访问';
        bannerEl.className = 'mode-banner guest-mode';
        document.getElementById('bannerText').textContent = '您当前处于访客浏览模式';
    }
}

// 应用程序初始化
function initApp() {
    console.log('Supabase客户端初始化成功');
    initLoginSystem();
    console.log('登录系统初始化完成');
    
    // 其他初始化代码...
    console.log('应用程序启动完成');
}

// 启动应用
document.addEventListener('DOMContentLoaded', initApp);
