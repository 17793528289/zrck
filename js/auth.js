// auth.js - 简化版本
console.log('auth.js 文件已加载');

// 确保DOM完全加载后再执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('auth.js: DOM已加载');
    
    // 检查元素是否存在
    const loginModal = document.getElementById('loginModal');
    console.log('登录模态框元素:', loginModal);
    
    // 如果模态框存在，确保它初始隐藏
    if (loginModal) {
        loginModal.style.display = 'none';
        console.log('已隐藏登录模态框');
    }
});
