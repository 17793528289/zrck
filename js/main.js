// 主脚本文件
// 导入模块
// 注意：由于使用CDN，这里的导入语法在浏览器中可能需要调整
// 实际使用时，可能需要将所有脚本直接包含在HTML文件中

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
  // 初始化平滑滚动
  initSmoothScroll();
  
  // 初始化导航栏
  initNavbar();
  
  // 初始化动画效果
  initAnimations();
});

// 平滑滚动功能
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// 导航栏功能
function initNavbar() {
  // 移动端菜单切换
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      menuToggle.classList.toggle('open');
    });
  }
  
  // 滚动时导航栏样式变化
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add('bg-primary/95', 'backdrop-blur-md', 'shadow-lg');
      } else {
        navbar.classList.remove('bg-primary/95', 'backdrop-blur-md', 'shadow-lg');
      }
    }
  });
}

// 动画效果
function initAnimations() {
  // 监听元素进入视口时触发动画
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // 观察所有带有animate类的元素
  const animatedElements = document.querySelectorAll('.animate');
  animatedElements.forEach(element => {
    observer.observe(element);
  });
}

// 加载更多功能
function loadMoreItems(containerSelector, loadMoreBtnSelector, itemsPerLoad = 6) {
  const container = document.querySelector(containerSelector);
  const loadMoreBtn = document.querySelector(loadMoreBtnSelector);
  
  if (!container || !loadMoreBtn) return;
  
  const items = container.querySelectorAll('.item');
  let currentIndex = itemsPerLoad;
  
  // 初始隐藏超出数量的项目
  for (let i = currentIndex; i < items.length; i++) {
    items[i].classList.add('hidden');
  }
  
  // 如果所有项目都已显示，隐藏加载更多按钮
  if (currentIndex >= items.length) {
    loadMoreBtn.classList.add('hidden');
  }
  
  // 加载更多按钮点击事件
  loadMoreBtn.addEventListener('click', () => {
    const endIndex = Math.min(currentIndex + itemsPerLoad, items.length);
    
    for (let i = currentIndex; i < endIndex; i++) {
      items[i].classList.remove('hidden');
      items[i].classList.add('fade-in');
    }
    
    currentIndex = endIndex;
    
    // 如果所有项目都已显示，隐藏加载更多按钮
    if (currentIndex >= items.length) {
      loadMoreBtn.classList.add('hidden');
    }
  });
}

// 表单验证功能
function validateForm(formSelector, rules = {}) {
  const form = document.querySelector(formSelector);
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    let isValid = true;
    
    // 清除之前的错误信息
    const errorElements = form.querySelectorAll('.error-message');
    errorElements.forEach(el => el.remove());
    
    // 验证每个字段
    for (const fieldName in rules) {
      const field = form.querySelector(`[name="${fieldName}"]`);
      if (!field) continue;
      
      const value = field.value.trim();
      const fieldRules = rules[fieldName];
      
      // 验证必填项
      if (fieldRules.required && value === '') {
        showError(field, fieldRules.requiredMessage || '此项为必填项');
        isValid = false;
        continue;
      }
      
      // 验证最小长度
      if (fieldRules.minLength && value.length < fieldRules.minLength) {
        showError(field, fieldRules.minLengthMessage || `最少需要${fieldRules.minLength}个字符`);
        isValid = false;
        continue;
      }
      
      // 验证最大长度
      if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
        showError(field, fieldRules.maxLengthMessage || `最多允许${fieldRules.maxLength}个字符`);
        isValid = false;
        continue;
      }
      
      // 验证正则表达式
      if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
        showError(field, fieldRules.patternMessage || '格式不正确');
        isValid = false;
        continue;
      }
    }
    
    if (!isValid) {
      e.preventDefault();
    }
  });
  
  // 显示错误信息
  function showError(field, message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message text-red-500 text-sm mt-1';
    errorElement.textContent = message;
    field.parentNode.appendChild(errorElement);
    field.classList.add('border-red-500');
    
    // 输入时清除错误信息
    field.addEventListener('input', () => {
      errorElement.remove();
      field.classList.remove('border-red-500');
    });
  }
}

// 导出函数
export {
  initSmoothScroll,
  initNavbar,
  initAnimations,
  loadMoreItems,
  validateForm
};