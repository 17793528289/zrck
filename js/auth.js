// 用户认证功能
class Auth {
  constructor() {
    this.user = null;
    this.init();
  }

  init() {
    // 检查用户是否已登录
    this.checkAuth();
    
    // 添加登出按钮事件监听
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.logout();
      });
    }
  }

  async checkAuth() {
    try {
      // 从Supabase获取当前用户
      const { data: { user } } = await supabase.auth.getUser();
      this.user = user;
      this.updateUI();
      return user;
    } catch (error) {
      console.error('检查认证状态失败:', error);
      return null;
    }
  }

  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      this.user = data.user;
      this.updateUI();
      return data.user;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  }

  async register(email, password, metadata = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) {
        throw error;
      }
      
      this.user = data.user;
      this.updateUI();
      return data.user;
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  }

  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      this.user = null;
      this.updateUI();
      // 重定向到首页
      window.location.href = '/';
    } catch (error) {
      console.error('登出失败:', error);
      throw error;
    }
  }

  updateUI() {
    // 更新导航栏登录/登出按钮
    const authNav = document.getElementById('auth-nav');
    if (authNav) {
      if (this.user) {
        // 用户已登录，显示登出按钮和用户中心
        authNav.innerHTML = `
          <a href="member-center.html" class="nav-link">
            <i class="fas fa-user mr-2"></i>用户中心
          </a>
          <button id="logout-btn" class="nav-link bg-accent-pink text-white hover:bg-accent-pink/80">
            <i class="fas fa-sign-out-alt mr-2"></i>登出
          </button>
        `;
        
        // 重新添加登出按钮事件监听
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', () => {
            this.logout();
          });
        }
      } else {
        // 用户未登录，显示登录按钮
        authNav.innerHTML = `
          <a href="login.html" class="nav-link btn btn-primary">
            <i class="fas fa-sign-in-alt mr-2"></i>登录
          </a>
        `;
      }
    }
  }

  isAuthenticated() {
    return !!this.user;
  }

  getUser() {
    return this.user;
  }
}

// 初始化认证
const auth = new Auth();

// 导出认证实例
export { auth };