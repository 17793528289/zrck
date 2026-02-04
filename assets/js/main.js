// 主JavaScript文件 - 修复版本
document.addEventListener('DOMContentLoaded', function() {
    console.log('Main JavaScript loaded');

    // 移动端菜单切换
    const menuToggle = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 主题切换功能
    function initTheme() {
        // 获取保存的主题，提供降级方案
        let savedTheme = 'dark';
        try {
            savedTheme = localStorage.getItem('theme') || 'dark';
        } catch (error) {
            console.warn('获取主题设置失败:', error);
        }
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
        
        // 主题切换按钮
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', function() {
                const isDark = document.documentElement.classList.contains('dark');
                const newTheme = isDark ? 'light' : 'dark';
                
                document.documentElement.classList.toggle('dark');
                // 保存主题设置，提供降级方案
                try {
                    localStorage.setItem('theme', newTheme);
                } catch (error) {
                    console.warn('保存主题设置失败:', error);
                }
                
                // 显示通知，提供降级方案
                if (window.App && window.App.utils && window.App.utils.notification) {
                    window.App.utils.notification.success(`已切换到${newTheme === 'dark' ? '深色' : '浅色'}模式`);
                } else {
                    console.log(`已切换到${newTheme === 'dark' ? '深色' : '浅色'}模式`);
                }
            });
        }
    }

    // 卡片悬停效果
    function initCardHover() {
        const cards = document.querySelectorAll('.card-hover');
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-4px)';
                this.style.transition = 'all 0.3s ease';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }

    // 图片懒加载
    function initLazyLoad() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        } else {
            // 降级方案
            lazyImages.forEach(img => {
                img.src = img.dataset.src;
            });
        }
    }

    // 模态框统一管理
    function initModals() {
        // 使用事件委托处理所有模态框
        document.addEventListener('click', function(e) {
            // 关闭按钮
            if (e.target.closest('[data-close-modal]')) {
                const modal = e.target.closest('.modal');
                if (modal) {
                    if (window.App && window.App.utils && window.App.utils.dom && window.App.utils.dom.hide) {
                        window.App.utils.dom.hide(modal);
                    } else {
                        modal.classList.add('hidden');
                    }
                }
            }
            
            // 点击模态框外部关闭
            if (e.target.classList.contains('modal')) {
                if (window.App && window.App.utils && window.App.utils.dom && window.App.utils.dom.hide) {
                    window.App.utils.dom.hide(e.target);
                } else {
                    e.target.classList.add('hidden');
                }
            }
        });

        // 打开模态框的按钮
        document.addEventListener('click', function(e) {
            const openButton = e.target.closest('[data-open-modal]');
            if (openButton) {
                const modalId = openButton.getAttribute('data-open-modal');
                const modal = document.getElementById(modalId);
                if (modal) {
                    if (window.App && window.App.utils && window.App.utils.dom && window.App.utils.dom.show) {
                        window.App.utils.dom.show(modal);
                    } else {
                        modal.classList.remove('hidden');
                    }
                }
            }
        });
    }

    // 表单验证增强
    function initFormValidation() {
        const forms = document.querySelectorAll('form[data-validate]');
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input[required], textarea[required]');
            
            inputs.forEach(input => {
                input.addEventListener('blur', function() {
                    validateField(this);
                });
                
                input.addEventListener('input', function() {
                    clearFieldError(this);
                });
            });

            form.addEventListener('submit', function(e) {
                if (!validateForm(this)) {
                    e.preventDefault();
                }
            });
        });

        function validateField(field) {
            clearFieldError(field);
            
            let isValid = true;
            let errorMessage = '';

            if (!field.value.trim()) {
                isValid = false;
                errorMessage = '此字段为必填项';
            } else if (field.type === 'email' && !validateEmail(field.value)) {
                isValid = false;
                errorMessage = '请输入有效的邮箱地址';
            } else if (field.type === 'password' && !validatePassword(field.value)) {
                isValid = false;
                errorMessage = '密码至少需要6位字符';
            }

            if (!isValid) {
                showFieldError(field, errorMessage);
            }

            return isValid;
        }

        function validateForm(form) {
            const fields = form.querySelectorAll('input[required], textarea[required]');
            let isValid = true;

            fields.forEach(field => {
                if (!validateField(field)) {
                    isValid = false;
                }
            });

            return isValid;
        }

        function showFieldError(field, message) {
            // 移除现有错误提示
            clearFieldError(field);
            
            // 添加错误样式
            field.classList.add('border-red-500');
            
            // 创建错误消息元素
            const errorEl = document.createElement('div');
            errorEl.className = 'text-red-500 text-sm mt-1 flex items-center';
            errorEl.innerHTML = `<i class="fas fa-exclamation-circle mr-1"></i>${message}`;
            
            field.parentNode.appendChild(errorEl);
            field.setAttribute('data-error-element', 'true');
        }

        function clearFieldError(field) {
            field.classList.remove('border-red-500');
            
            const existingError = field.parentNode.querySelector('[data-error-element]');
            if (existingError) {
                existingError.remove();
            }
        }

        function validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email.trim());
        }

        function validatePassword(password) {
            return password.length >= 6;
        }
    }

    // 标签页功能
    function initTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanes = document.querySelectorAll('.tab-pane');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                // 移除所有标签页按钮的活动状态
                tabButtons.forEach(btn => {
                    btn.classList.remove('active', 'text-primary', 'border-primary');
                    btn.classList.add('text-gray-400');
                });
                
                // 添加当前按钮的活动状态
                this.classList.add('active', 'text-primary', 'border-primary');
                this.classList.remove('text-gray-400');
                
                // 隐藏所有标签页内容
                tabPanes.forEach(pane => {
                    pane.classList.add('hidden');
                    pane.classList.remove('active');
                });
                
                // 显示当前标签页内容
                const tabId = this.getAttribute('data-tab');
                const currentPane = document.getElementById(tabId + '-tab');
                if (currentPane) {
                    currentPane.classList.remove('hidden');
                    currentPane.classList.add('active');
                }
            });
        });
    }

    // 聊天系统功能
    function initChatSystem() {
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-btn');
        
        if (messageInput && sendButton) {
            // 自动调整输入框高度
            messageInput.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
            });
            
            // 发送消息
            sendButton.addEventListener('click', function() {
                sendMessage();
            });
            
            // 按Enter发送消息
            messageInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }
        
        function sendMessage() {
            if (!messageInput) return;
            
            const message = messageInput.value.trim();
            if (message) {
                // 模拟发送消息
                console.log('发送消息:', message);
                
                // 清空输入框
                messageInput.value = '';
                messageInput.style.height = 'auto';
                
                // 显示成功提示
                if (window.App && window.App.utils && window.App.utils.notification) {
                    window.App.utils.notification.success('消息发送成功');
                } else {
                    console.log('消息发送成功');
                }
            }
        }
    }

    // 初始化所有功能
    try {
        initTheme();
        initCardHover();
        initLazyLoad();
        initModals();
        initFormValidation();
        initTabs();
        initChatSystem();
    } catch (error) {
        console.error('初始化功能失败:', error);
    }

    // 滚动时导航栏效果
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const nav = document.querySelector('nav');
        if (!nav) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // 向下滚动
            nav.style.transform = 'translateY(-100%)';
        } else {
            // 向上滚动
            nav.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });

    // 错误处理
    window.addEventListener('error', function(e) {
        console.error('JavaScript错误:', e.error);
    });
    
    window.addEventListener('unhandledrejection', function(e) {
        console.error('未处理的Promise拒绝:', e.reason);
    });
});

// 全局函数
function showNotification(message, type = 'success') {
    if (window.App && window.App.utils && window.App.utils.notification && window.App.utils.notification[type]) {
        window.App.utils.notification[type](message);
    } else {
        // 降级处理
        alert(message);
    }
}

function setLoading(button, isLoading) {
    if (!button) return;
    
    try {
        if (isLoading) {
            button.disabled = true;
            const originalText = button.innerHTML;
            button.setAttribute('data-original-text', originalText);
            button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>加载中...';
        } else {
            button.disabled = false;
            const originalText = button.getAttribute('data-original-text');
            if (originalText) {
                button.innerHTML = originalText;
            }
            button.removeAttribute('data-original-text');
        }
    } catch (error) {
        console.error('设置加载状态失败:', error);
    }
}