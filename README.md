# 卓然创客社团网站

武威第十八中学卓然创客社团官方网站，使用HTML、Tailwind CSS和Supabase构建。

## 项目结构

```
├── assets/          # 静态资源
│   └── js/          # JavaScript文件
├── lib/             # 库文件
│   └── supabase.js  # Supabase配置和服务
├── index.html       # 首页
├── about.html       # 社团简介
├── activities.html  # 社团活动
├── showcase.html    # 社团展示
├── admin.html       # 后台管理
├── login.html       # 登录页面
├── member-center.html  # 社员中心
├── teacher-center.html # 教师中心
├── visitor-center.html # 访客中心
├── chat.html        # 聊天系统
└── supabase-tables.sql # 数据库表结构
```

## 部署说明

### GitHub Pages部署

1. **准备工作**
   - 确保仓库中包含所有必要文件
   - 确保`index.html`是网站的主页

2. **部署步骤**
   - 登录GitHub，进入仓库页面
   - 点击"Settings"选项卡
   - 在左侧菜单中选择"Pages"
   - 在"Source"部分，选择"main"分支和"/(root)"目录
   - 点击"Save"按钮
   - 等待GitHub Pages构建完成（通常需要1-2分钟）

3. **常见问题及解决方案**

   **问题1：功能无法使用**
   - **原因**：GitHub Pages部署后，路径和环境与本地开发不同
   - **解决方案**：
     1. 确保所有资源引用使用相对路径
     2. 检查Supabase配置是否正确
     3. 确保所有脚本正确加载

   **问题2：Supabase相关功能失败**
   - **原因**：
     - 存储访问被跟踪保护阻止
     - API请求被CORS策略阻止
     - SDK加载失败
   - **解决方案**：
     1. 确保Supabase项目的设置允许GitHub Pages域名
     2. 检查浏览器控制台是否有相关错误信息
     3. 网站会自动使用模拟数据作为fallback

   **问题3：Chart.js加载失败**
   - **原因**：CDN资源加载被阻止
   - **解决方案**：
     1. 确保网络连接正常
     2. 网站会在Chart.js加载失败时使用静态数据

## 本地开发

1. **克隆仓库**
   ```bash
   git clone https://github.com/yourusername/zrck2.git
   cd zrck2
   ```

2. **启动本地服务器**
   - 使用VS Code的Live Server扩展
   - 或使用Python内置服务器：
     ```bash
     python -m http.server 8000
     ```
   - 或使用Node.js的http-server：
     ```bash
     npx http-server .
     ```

3. **访问网站**
   打开浏览器，访问 `http://localhost:8000`

## 技术栈

- **前端**：HTML5, Tailwind CSS, JavaScript
- **后端**：Supabase (数据库和认证)
- **图表**：Chart.js
- **图标**：Font Awesome

## 功能模块

- 首页展示
- 社团简介
- 社团活动
- 社团展示
- 后台管理
- 用户登录/注册
- 社员中心
- 教师中心
- 访客中心
- 聊天系统

## 管理员登录

- **账号**：2025020101
- **密码**：admin123

## 教师登录

- **账号**：2025020102
- **密码**：teacher123

## 学生登录

- **账号**：2025020103
- **密码**：student123

## 注意事项

1. 网站使用Tailwind CSS CDN，在生产环境中建议安装为PostCSS插件
2. 网站会在Supabase不可用时自动使用模拟数据
3. 登录系统支持数字账号和邮箱格式
4. 后台管理需要管理员或教师权限

## 故障排查

1. **页面无法加载**：检查网络连接和文件路径
2. **功能无法使用**：检查浏览器控制台错误信息
3. **登录失败**：确保使用正确的账号密码
4. **数据不显示**：检查Supabase连接状态

如果问题持续存在，请查看浏览器控制台的详细错误信息，并根据错误信息进行修复。