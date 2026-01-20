// 测试showcase.html中的JavaScript代码
const projects = {
    1: {
        title: "智能机器人",
        content: `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <img src="https://picsum.photos/seed/project1/800/600" alt="智能机器人" class="w-full h-auto rounded-lg mb-4">
                    <div class="bg-secondary p-4 rounded-lg">
                        <h3 class="text-lg font-bold mb-2">项目信息</h3>
                        <ul class="space-y-2">
                            <li class="flex items-center space-x-2">
                                <i class="fas fa-user text-accent-green"></i>
                                <span class="text-text-secondary">作者：张明</span>
                            </li>
                            <li class="flex items-center space-x-2">
                                <i class="fas fa-calendar-alt text-accent-green"></i>
                                <span class="text-text-secondary">完成时间：2024-01-15</span>
                            </li>
                            <li class="flex items-center space-x-2">
                                <i class="fas fa-tags text-accent-green"></i>
                                <span class="text-text-secondary">分类：硬件、编程</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div>
                    <h3 class="text-lg font-bold mb-2">项目简介</h3>
                    <p class="text-text-secondary mb-4">
                        基于Arduino的智能机器人，可以实现避障、跟随、语音控制等功能。
                        该机器人采用了超声波传感器、红外传感器和语音模块，
                        可以通过手机APP或语音指令进行控制。
                    </p>
                    <h3 class="text-lg font-bold mb-2">技术栈</h3>
                    <div class="flex flex-wrap gap-2 mb-4">
                        <span class="text-xs bg-secondary px-3 py-1 rounded-full">Arduino</span>
                        <span class="text-xs bg-secondary px-3 py-1 rounded-full">传感器</span>
                        <span class="text-xs bg-secondary px-3 py-1 rounded-full">C++</span>
                        <span class="text-xs bg-secondary px-3 py-1 rounded-full">蓝牙</span>
                    </div>
                    <h3 class="text-lg font-bold mb-2">功能特性</h3>
                    <ul class="space-y-2 text-text-secondary">
                        <li class="flex items-center space-x-2">
                            <i class="fas fa-check-circle text-accent-green"></i>
                            <span>超声波避障</span>
                        </li>
                        <li class="flex items-center space-x-2">
                            <i class="fas fa-check-circle text-accent-green"></i>
                            <span>红外跟随</span>
                        </li>
                        <li class="flex items-center space-x-2">
                            <i class="fas fa-check-circle text-accent-green"></i>
                            <span>语音控制</span>
                        </li>
                        <li class="flex items-center space-x-2">
                            <i class="fas fa-check-circle text-accent-green"></i>
                            <span>手机APP控制</span>
                        </li>
                        <li class="flex items-center space-x-2">
                            <i class="fas fa-check-circle text-accent-green"></i>
                            <span>自动充电</span>
                        </li>
                    </ul>
                </div>
            </div>
        `
    },
    2: {
        title: "校园网站设计",
        content: `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <img src="https://picsum.photos/seed/project2/800/600" alt="校园网站设计" class="w-full h-auto rounded-lg mb-4">
                    <div class="bg-secondary p-4 rounded-lg">
                        <h3 class="text-lg font-bold mb-2">项目信息</h3>
                        <ul class="space-y-2">
                            <li class="flex items-center space-x-2">
                                <i class="fas fa-user text-accent-green"></i>
                                <span class="text-text-secondary">作者：李华</span>
                            </li>
                            <li class="flex items-center space-x-2">
                                <i class="fas fa-calendar-alt text-accent-green"></i>
                                <span class="text-text-secondary">完成时间：2024-01-10</span>
                            </li>
                            <li class="flex items-center space-x-2">
                                <i class="fas fa-tags text-accent-green"></i>
                                <span class="text-text-secondary">分类：设计、前端</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div>
                    <h3 class="text-lg font-bold mb-2">项目简介</h3>
                    <p class="text-text-secondary mb-4">
                        为学校设计的现代化网站，采用响应式设计，支持多种设备访问。
                        网站包含学校介绍、新闻动态、师资力量、招生信息等多个模块，
                        设计简洁美观，用户体验良好。
                    </p>
                    <h3 class="text-lg font-bold mb-2">技术栈</h3>
                    <div class="flex flex-wrap gap-2 mb-4">
                        <span class="text-xs bg-secondary px-3 py-1 rounded-full">HTML5</span>
                        <span class="text-xs bg-secondary px-3 py-1 rounded-full">CSS3</span>
                        <span class="text-xs bg-secondary px-3 py-1 rounded-full">JavaScript</span>
                        <span class="text-xs bg-secondary px-3 py-1 rounded-full">Tailwind CSS</span>
                    </div>
                    <h3 class="text-lg font-bold mb-2">设计特点</h3>
                    <ul class="space-y-2 text-text-secondary">
                        <li class="flex items-center space-x-2">
                            <i class="fas fa-check-circle text-accent-green"></i>
                            <span>响应式设计，适配各种设备</span>
                        </li>
                        <li class="flex items-center space-x-2">
                            <i class="fas fa-check-circle text-accent-green"></i>
                            <span>现代化UI设计，简洁美观</span>
                        </li>
                        <li class="flex items-center space-x-2">
                            <i class="fas fa-check-circle text-accent-green"></i>
                            <span>良好的用户体验，易于导航</span>
                        </li>
                        <li class="flex items-center space-x-2">
                            <i class="fas fa-check-circle text-accent-green"></i>
                            <span>优化的加载速度和性能</span>
                        </li>
                    </ul>
                </div>
            </div>
        `
    },
    3: {
        title: "数据可视化平台",
        content: `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <img src="https://picsum.photos/seed/project3/800/600" alt="数据可视化平台" class="w-full h-auto rounded-lg mb-4">
                    <div class="bg-secondary p-4 rounded-lg">
                        <h3 class="text-lg font-bold mb-2">项目信息</h3>
                        <ul class="space-y-2">
                            <li class="flex items-center space-x-2">
                                <i class="fas fa-user text-accent-green"></i>
                                <span class="text-text-secondary">作者：王强</span>
                            </li>
                            <li class="flex items-center space-x-2">
                                <i class="fas fa-calendar-alt text-accent-green"></i>
                                <span class="text-text-secondary">完成时间：2024-01-20</span>
                            </li>
                            <li class="flex items-center space-x-2">
                                <i class="fas fa-tags text-accent-green"></i>
                                <span class="text-text-secondary">分类：数据、可视化</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div>
                    <h3 class="text-lg font-bold mb-2">项目简介</h3>
                    <p class="text-text-secondary mb-4">
                        一个基于Web的数据可视化平台，可以将复杂的数据转化为直观的图表和仪表盘。
                        该平台支持多种数据源连接，包括数据库、API和CSV文件，
                        提供了丰富的图表类型和交互功能。
                    </p>
                    <h3 class="text-lg font-bold mb-2">技术栈</h3>
                    <div class="flex flex-wrap gap-2 mb-4">
                        <span class="text-xs bg-secondary px-3 py-1 rounded-full">React</span>
                        <span class="text-xs bg-secondary px-3 py-1 rounded-full">D3.js</span>
                        <span class="text-xs bg-secondary px-3 py-1 rounded-full">Node.js</span>
                        <span class="text-xs bg-secondary px-3 py-1 rounded-full">Express</span>
                    </div>
                    <h3 class="text-lg font-bold mb-2">核心功能</h3>
                    <ul class="space-y-2 text-text-secondary">
                        <li class="flex items-center space-x-2">
                            <i class="fas fa-check-circle text-accent-green"></i>
                            <span>多种图表类型（柱状图、折线图、饼图等）</span>
                        </li>
                        <li class="flex items-center space-x-2">
                            <i class="fas fa-check-circle text-accent-green"></i>
                            <span>实时数据更新和刷新</span>
                        </li>
                        <li class="flex items-center space-x-2">
                            <i class="fas fa-check-circle text-accent-green"></i>
                            <span>交互式图表，支持缩放、拖拽等操作</span>
                        </li>
                        <li class="flex items-center space-x-2">
                            <i class="fas fa-check-circle text-accent-green"></i>
                            <span>自定义仪表盘设计</span>
                        </li>
                    </ul>
                </div>
            </div>
        `
    },
    4: {
        title: "智能家居控制系统",
        content: `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <img src="https://picsum.photos/seed/project4/800/600" alt="智能家居控制系统" class="w-full h-auto rounded-lg mb-4">
                    <div class="bg-secondary p-4 rounded-lg">
                        <h3 class="text-lg font-bold mb-2">项目信息</h3>
                        <ul class="space-y-2">
                            <li class="flex items-center space-x-2">
                                <i class="fas fa-user text-accent-green"></i>
                                <span class="text-text-secondary">作者：刘洋</span>
                            </li>
                            <li class="flex items-center space-x-2">
                                <i class="fas fa-calendar-alt text-accent-green"></i>
                                <span class="text-text-secondary">完成时间：2024-01-25</span>
                            </li>
                            <li class="flex items-center space-x-2">
                                <i class="fas fa-tags text-accent-green"></i>
                                <span class="text-text-secondary">分类：物联网、智能家居</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div>
                    <h3 class="text-lg font-bold mb-2">项目简介</h3>
                    <p class="text-text-secondary mb-4">
                        一个基于物联网技术的智能家居控制系统，可以远程控制家中的灯光、电器、
                        安防设备等。该系统采用了MQTT协议进行设备通信，支持手机APP和语音控制，
                        提供了自动化场景设置和定时任务功能。
                    </p>
                    <h3 class="text-lg font-bold mb-2">技术栈</h3>
                    <div class="flex flex-wrap gap-2 mb-4">
                        <span class="text-xs bg-secondary px-3 py-1 rounded-full">ESP8266</span>
                        <span class="text-xs bg-secondary px-3 py-1 rounded-full">MQTT</span>
                        <span class="text-xs bg-secondary px-3 py-1 rounded-full">Python</span>
                    </div>
                    <h3 class="text-lg font-bold mb-2">系统功能</h3>
                    <ul class="space-y-2 text-text-secondary">
                        <li class="flex items-center space-x-2">
                            <i class="fas fa-check-circle text-accent-green"></i>
                            <span>远程控制灯光开关和亮度</span>
                        </li>
                        <li class="flex items-center space-x-2">
                            <i class="fas fa-check-circle text-accent-green"></i>
                            <span>温度和湿度监测与控制</span>
                        </li>
                        <li class="flex items-center space-x-2">
                            <i class="fas fa-check-circle text-accent-green"></i>
                            <span>安防监控和报警</span>
                        </li>
                        <li class="flex items-center space-x-2">
                            <i class="fas fa-check-circle text-accent-green"></i>
                            <span>智能门锁控制</span>
                        </li>
                        <li class="flex items-center space-x-2">
                            <i class="fas fa-check-circle text-accent-green"></i>
                            <span>语音助手集成</span>
                        </li>
                    </ul>
                </div>
            </div>
        `
    }
};

// 分类筛选功能
document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 更新按钮样式
            filterBtns.forEach(b => {
                b.classList.remove('bg-accent-green', 'text-primary');
                b.classList.add('bg-secondary', 'text-text-secondary');
            });
            btn.classList.remove('bg-secondary', 'text-text-secondary');
            btn.classList.add('bg-accent-green', 'text-primary');
            
            // 筛选项目
            const filter = btn.dataset.filter;
            projectCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
    
    // 项目详情模态框
    const projectModals = document.querySelectorAll('.project-modal');
    const projectCloseBtns = document.querySelectorAll('.project-close');
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const projectId = parseInt(card.dataset.projectId);
            const project = projects[projectId];
            const modal = document.getElementById(`project-modal-${projectId}`);
            const modalContent = modal.querySelector('.modal-content');
            
            modalContent.innerHTML = `
                <h2 class="text-2xl font-bold mb-4">${project.title}</h2>
                ${project.content}
            `;
            
            modal.classList.remove('hidden');
        });
    });
    
    projectCloseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.project-modal');
            modal.classList.add('hidden');
        });
    });
    
    // 点击模态框外部关闭
    projectModals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });
});