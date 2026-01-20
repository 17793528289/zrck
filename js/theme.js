// 主题切换功能
class ThemeSwitcher {
  constructor() {
    this.themeToggle = document.getElementById('theme-toggle');
    this.currentTheme = localStorage.getItem('theme') || 'dark';
    this.init();
  }

  init() {
    // 设置初始主题
    this.setTheme(this.currentTheme);
    
    // 添加主题切换事件监听
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => {
        this.toggleTheme();
      });
    }
  }

  setTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
    
    // 更新主题切换按钮图标
    if (this.themeToggle) {
      const icon = this.themeToggle.querySelector('i');
      if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }
    }
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }
}

// 初始化主题切换
document.addEventListener('DOMContentLoaded', () => {
  new ThemeSwitcher();
});

// 导出ThemeSwitcher类
export { ThemeSwitcher };