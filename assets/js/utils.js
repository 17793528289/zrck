// 通用工具函数库
window.App.utils = {
    // DOM操作相关
    dom: {
        // 显示元素
        show: (element) => {
            if (element) {
                element.classList.remove('hidden');
                if (element.classList.contains('modal')) {
                    element.classList.add('flex');
                }
            }
        },

        // 隐藏元素
        hide: (element) => {
            if (element) {
                element.classList.add('hidden');
                element.classList.remove('flex');
            }
        },

        // 切换元素显示状态
        toggle: (element) => {
            if (element) {
                element.classList.toggle('hidden');
            }
        },

        // 检查元素是否可见
        isVisible: (element) => {
            return element && !element.classList.contains('hidden');
        },

        // 获取元素位置
        getPosition: (element) => {
            if (!element) return null;
            const rect = element.getBoundingClientRect();
            return {
                top: rect.top + window.pageYOffset,
                left: rect.left + window.pageXOffset,
                width: rect.width,
                height: rect.height
            };
        }
    },

    // 表单处理相关
    form: {
        // 序列化表单数据
        serialize: (form) => {
            const formData = new FormData(form);
            const data = {};
            for (let [key, value] of formData.entries()) {
                // 处理多选和数组字段
                if (data[key]) {
                    if (Array.isArray(data[key])) {
                        data[key].push(value);
                    } else {
                        data[key] = [data[key], value];
                    }
                } else {
                    data[key] = value;
                }
            }
            return data;
        },

        // 验证邮箱格式
        validateEmail: (email) => {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email.trim());
        },

        // 验证密码强度
        validatePassword: (password) => {
            return password.length >= 6;
        },

        // 验证手机号格式
        validatePhone: (phone) => {
            const re = /^1[3-9]\d{9}$/;
            return re.test(phone.trim());
        },

        // 清除表单数据
        clear: (form) => {
            if (form) {
                form.reset();
                // 清除自定义错误提示
                const errors = form.querySelectorAll('.error-message');
                errors.forEach(error => error.remove());
                
                // 清除错误样式
                const inputs = form.querySelectorAll('input, textarea');
                inputs.forEach(input => {
                    input.classList.remove('border-red-500', 'error');
                });
            }
        }
    },

    // 字符串处理
    string: {
        // 截断字符串
        truncate: (str, length, suffix = '...') => {
            if (!str || str.length <= length) return str;
            return str.substring(0, length) + suffix;
        },

        // 首字母大写
        capitalize: (str) => {
            if (!str) return '';
            return str.charAt(0).toUpperCase() + str.slice(1);
        },

        // 生成随机ID
        generateId: (length = 8) => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        }
    },

    // 日期时间处理
    date: {
        // 格式化日期
        format: (date, format = 'YYYY-MM-DD') => {
            if (!date) return '';
            
            const d = new Date(date);
            if (isNaN(d.getTime())) return '';

            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            const seconds = String(d.getSeconds()).padStart(2, '0');

            return format
                .replace('YYYY', year)
                .replace('MM', month)
                .replace('DD', day)
                .replace('HH', hours)
                .replace('mm', minutes)
                .replace('ss', seconds);
        },

        // 相对时间显示
        relativeTime: (date) => {
            if (!date) return '';
            
            const now = new Date();
            const d = new Date(date);
            const diff = now - d;
            
            const minute = 60 * 1000;
            const hour = 60 * minute;
            const day = 24 * hour;
            const week = 7 * day;
            const month = 30 * day;
            const year = 365 * day;

            if (diff < minute) {
                return '刚刚';
            } else if (diff < hour) {
                return `${Math.floor(diff / minute)}分钟前`;
            } else if (diff < day) {
                return `${Math.floor(diff / hour)}小时前`;
            } else if (diff < week) {
                return `${Math.floor(diff / day)}天前`;
            } else if (diff < month) {
                return `${Math.floor(diff / week)}周前`;
            } else if (diff < year) {
                return `${Math.floor(diff / month)}月前`;
            } else {
                return `${Math.floor(diff / year)}年前`;
            }
        }
    },

    // 本地存储管理
    storage: {
        // 设置存储项
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.warn('本地存储失败:', error);
                return false;
            }
        },

        // 获取存储项
        get: (key, defaultValue = null) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.warn('本地存储读取失败:', error);
                return defaultValue;
            }
        },

        // 删除存储项
        remove: (key) => {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.warn('本地存储删除失败:', error);
                return false;
            }
        },

        // 清空所有存储
        clear: () => {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.warn('本地存储清空失败:', error);
                return false;
            }
        }
    },

    // 消息提示系统
    notification: {
        // 显示成功消息
        success: (message, duration = 3000) => {
            return this.show(message, 'success', duration);
        },

        // 显示错误消息
        error: (message, duration = 5000) => {
            return this.show(message, 'error', duration);
        },

        // 显示警告消息
        warning: (message, duration = 4000) => {
            return this.show(message, 'warning', duration);
        },

        // 显示信息消息
        info: (message, duration = 3000) => {
            return this.show(message, 'info', duration);
        },

        // 显示消息（核心方法）
        show: (message, type = 'info', duration = 3000) => {
            // 创建消息容器
            const container = document.getElementById('notification-container') || createNotificationContainer();
            
            // 创建消息元素
            const notification = document.createElement('div');
            notification.className = `notification notification-${type} animate__animated animate__fadeInRight`;
            
            const icons = {
                success: 'fa-check-circle',
                error: 'fa-exclamation-circle',
                warning: 'fa-exclamation-triangle',
                info: 'fa-info-circle'
            };
            
            notification.innerHTML = `
                <div class="flex items-center">
                    <i class="fas ${icons[type]} mr-3"></i>
                    <span>${message}</span>
                    <button class="ml-auto close-btn" onclick="this.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(notification);
            
            // 自动消失
            if (duration > 0) {
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.classList.remove('animate__fadeInRight');
                        notification.classList.add('animate__fadeOutRight');
                        setTimeout(() => {
                            if (notification.parentNode) {
                                notification.parentNode.removeChild(notification);
                            }
                        }, 500);
                    }
                }, duration);
            }
            
            return notification;
        }
    },

    // 加载状态管理
    loading: {
        // 设置加载状态
        set: (element, isLoading, loadingText = '加载中...') => {
            if (!element) return;
            
            if (isLoading) {
                // 保存原始状态
                const originalHtml = element.innerHTML;
                const originalDisabled = element.disabled;
                
                element.setAttribute('data-original-html', originalHtml);
                element.setAttribute('data-original-disabled', originalDisabled);
                
                // 设置加载状态
                element.disabled = true;
                element.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>${loadingText}`;
            } else {
                // 恢复原始状态
                const originalHtml = element.getAttribute('data-original-html');
                const originalDisabled = element.getAttribute('data-original-disabled') === 'true';
                
                if (originalHtml) {
                    element.innerHTML = originalHtml;
                }
                element.disabled = originalDisabled;
                
                // 清理数据属性
                element.removeAttribute('data-original-html');
                element.removeAttribute('data-original-disabled');
            }
        },

        // 显示全局加载遮罩
        showGlobal: (message = '加载中...') => {
            let overlay = document.getElementById('global-loading-overlay');
            
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'global-loading-overlay';
                overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                overlay.innerHTML = `
                    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
                        <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                        <p>${message}</p>
                    </div>
                `;
                document.body.appendChild(overlay);
            }
            
            return overlay;
        },

        // 隐藏全局加载遮罩
        hideGlobal: () => {
            const overlay = document.getElementById('global-loading-overlay');
            if (overlay) {
                overlay.remove();
            }
        }
    },

    // 网络请求工具
    http: {
        // GET请求
        get: async (url, options = {}) => {
            return this.request('GET', url, null, options);
        },

        // POST请求
        post: async (url, data, options = {}) => {
            return this.request('POST', url, data, options);
        },

        // PUT请求
        put: async (url, data, options = {}) => {
            return this.request('PUT', url, data, options);
        },

        // DELETE请求
        delete: async (url, options = {}) => {
            return this.request('DELETE', url, null, options);
        },

        // 通用请求方法
        request: async (method, url, data = null, options = {}) => {
            const config = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            };

            if (data && (method === 'POST' || method === 'PUT')) {
                config.body = JSON.stringify(data);
            }

            try {
                const response = await fetch(url, config);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                return { data: result, error: null };
            } catch (error) {
                console.error('HTTP请求失败:', error);
                return { data: null, error };
            }
        }
    }
};

// 创建消息通知容器
function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'fixed top-4 right-4 z-50 space-y-2 max-w-sm';
    document.body.appendChild(container);
    return container;
}

// 添加通知样式
const notificationStyles = `
.notification {
    @apply p-4 rounded-lg shadow-lg border-l-4;
}

.notification-success {
    @apply bg-green-50 border-green-400 text-green-700 dark:bg-green-900 dark:text-green-300;
}

.notification-error {
    @apply bg-red-50 border-red-400 text-red-700 dark:bg-red-900 dark:text-red-300;
}

.notification-warning {
    @apply bg-yellow-50 border-yellow-400 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300;
}

.notification-info {
    @apply bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-900 dark:text-blue-300;
}

.notification .close-btn {
    @apply opacity-70 hover:opacity-100 transition-opacity;
}
`;

// 注入样式
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = notificationStyles;
    document.head.appendChild(style);
}

console.log('工具函数库加载完成');