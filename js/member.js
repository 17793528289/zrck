// 会员中心功能
class MemberManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.loadUserData();
        this.bindEvents();
    }

    checkAuthentication() {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');

        if (!token || !userData) {
            // 未登录，跳转到首页
            alert('请先登录！');
            window.location.href = 'index.html';
            return;
        }

        this.currentUser = JSON.parse(userData);
        this.updateUserInterface();
    }

    loadUserData() {
        // 模拟加载用户数据
        const userStats = {
            projects: 3,
            activities: 2,
            courses: 8,
            score: 85
        };

        // 更新页面数据
        this.updateDashboard(userStats);
    }

    updateUserInterface() {
        // 更新用户信息
        document.getElementById('userGreeting').textContent = `欢迎，${this.currentUser.name}`;
        document.getElementById('memberWelcome').textContent = `欢迎回来，${this.currentUser.name}！`;
        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('userGrade').textContent = this.currentUser.grade;
        
        // 更新会员统计
        const today = new Date().toLocaleDateString('zh-CN');
        document.getElementById('memberStats').innerHTML = 
            `今日有 <strong>3</strong> 个新活动，<strong>5</strong> 个新资源更新 | ${today}`;
    }

    updateDashboard(stats) {
        // 更新统计卡片
        const progressBars = document.querySelectorAll('.progress-fill');
        if (progressBars[0]) {
            progressBars[0].style.width = '65%';
        }
        if (progressBars[1]) {
            progressBars[1].style.width = '30%';
        }
        if (progressBars[2]) {
            progressBars[2].style.width = '75%';
        }
        if (progressBars[3]) {
            progressBars[3].style.width = '20%';
        }
    }

    bindEvents() {
        // 绑定所有交互事件
        this.bindQuickActions();
        this.bindActivityButtons();
        this.bindResourceButtons();
    }

    bindQuickActions() {
        // 快速操作按钮
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.querySelector('span:last-child').textContent;
                console.log(`快速操作: ${action}`);
            });
        });
    }

    bindActivityButtons() {
        // 活动报名按钮
        document.querySelectorAll('.action-btn.primary').forEach(btn => {
            btn.addEventListener('click', function() {
                const activityTitle = this.closest('.activity-item').querySelector('h3').textContent;
                if (confirm(`确定要报名参加"${activityTitle}"吗？`)) {
                    this.textContent = '已报名';
                    this.classList.remove('primary');
                    this.disabled = true;
                    alert('报名成功！');
                }
            });
        });
    }

    bindResourceButtons() {
        // 资源学习按钮
        document.querySelectorAll('.resource-item .action-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const resourceTitle = this.closest('.resource-item').querySelector('h3').textContent;
                alert(`开始学习: ${resourceTitle}`);
                
                // 更新学习进度
                const progressBar = this
