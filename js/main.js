// 启用严格模式
"use strict";

// Supabase配置
const SUPABASE_CONFIG = {
    url: 'https://wxbemuwgiiucdgmbhbvg.supabase.co',
    anonKey: 'sb_publishable_KuzTRmYOZ9P6UmKgmb_VwA_6Qj_A6Nk'
};

// 安全的Supabase客户端初始化
(function initSupabase() {
    if (!window.supabaseClient) {
        window.supabaseClient = window.supabase.createClient(
            SUPABASE_CONFIG.url, 
            SUPABASE_CONFIG.anonKey
        );
    }
})();

// 获取Supabase客户端实例
function getSupabase() {
    if (!window.supabaseClient) {
        throw new Error('Supabase client not initialized');
    }
    return window.supabaseClient;
}

// 主初始化函数
document.addEventListener('DOMContentLoaded', function() {
    const supabase = getSupabase(); // 安全获取实例
    initializeNavigation();
    initializeLoginSystem(supabase); // 传入supabase实例
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

// 登录系统初始化（接收supabase参数）
function initializeLoginSystem(supabase) {
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeBtn = document.querySelector('.close');
    const loginForm = document.getElementById('loginForm');
    const viewModeBtn = document.getElementById('viewModeBtn');
    const switchToLogin = document.getElementById('switchToLogin');

    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (loginModal) loginModal.style.display = 'block';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            if (loginModal) {
                loginModal.style.display = 'none';
                clearLoginMessage();
            }
        });
    }

    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
                clearLoginMessage();
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const submitBtn = document.getElementById('submitBtn');
            
            if (!username || !password) {
                showLoginMessage('请输入用户名和密码', 'error');
                return;
            }
            
            setButtonLoading(true, submitBtn);
            
            try {
                const loginResult = await validateLogin(supabase, username, password);
                
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

    if (viewModeBtn) {
        viewModeBtn.addEventListener('click', setGuestMode);
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            if (loginModal) loginModal.style.display = 'block';
        });
    }
}

// 验证登录信息（接收supabase参数）
async function validateLogin(supabase, username, password) {
    try {
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
        
        return validateLocalLogin(username, password);
    } catch (error) {
        console.error('Supabase登录异常:', error);
        return validateLocalLogin(username, password);
    }
}

// [其余辅助函数保持不变...]
