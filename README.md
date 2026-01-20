# 武威第十八中学卓然创客社团官网

## 项目概述

这是武威第十八中学卓然创客社团的官方网站，使用HTML、Tailwind CSS和Supabase构建。

## 技术栈

- **前端**: HTML5, Tailwind CSS 3, JavaScript
- **后端**: Supabase (认证, 数据库, 存储)
- **部署**: GitHub Pages

## 项目结构

```
├── css/
│   ├── main.css          # 主样式文件
│   └── output.css        # Tailwind构建输出 (会被忽略)
├── js/
│   ├── auth.js           # 认证功能
│   ├── config.js         # 配置文件 (会被忽略)
│   ├── main.js           # 主脚本
│   ├── supabase.js       # Supabase客户端初始化
│   └── theme.js          # 主题切换功能
├── .env.example          # 环境变量示例
├── .gitignore           # Git忽略文件
├── index.html           # 首页
├── login.html           # 登录页
├── member-center.html   # 成员中心
├── teacher-center.html  # 教师中心
├── admin.html           # 管理后台
├── activities.html      # 活动页面
├── showcase.html        # 项目展示
├── about.html           # 关于我们
├── visitor-center.html  # 访客中心
├── package.json         # 项目依赖
├── supabase-tables.sql  # Supabase数据库表结构
└── tailwind.config.js   # Tailwind配置
```

## 开始使用

### 1. 克隆仓库

```bash
git clone https://github.com/your-username/zrck1.git
cd zrck1
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置Supabase

1. 创建Supabase项目: https://supabase.com/
2. 获取项目URL和匿名密钥
3. 复制 `js/config.js.example` 为 `js/config.js` 并填写配置
4. 复制 `.env.example` 为 `.env` 并填写配置

### 4. 构建Tailwind CSS

```bash
npm run build
```

### 5. 本地测试

使用HTTP服务器启动项目:

```bash
# 使用Python
python -m http.server 8000

# 使用Node.js
npx http-server -p 8000
```

然后在浏览器中访问: http://localhost:8000

## Supabase配置

### 1. 认证设置

- 启用邮箱/密码认证
- 设置站点URL: `https://your-username.github.io/zrck1/`
- 配置重定向URL: `https://your-username.github.io/zrck1/login.html`

### 2. 数据库设置

1. 执行 `supabase-tables.sql` 文件中的SQL语句创建表和RLS策略
2. 确保RLS已启用

### 3. CORS配置

在Supabase控制台中配置CORS:

1. 进入项目设置 > API
2. 在CORS设置中添加以下域名:
   - `https://your-username.github.io`
   - `http://localhost:8000` (用于本地开发)
3. 保存设置

### 4. 存储设置

如果需要使用Supabase Storage存储图片和文件:

1. 进入Storage
2. 创建存储桶
3. 配置访问权限

## 部署到GitHub Pages

### 1. 配置GitHub仓库

1. 在GitHub上创建仓库
2. 将本地代码推送到GitHub

### 2. 启用GitHub Pages

1. 进入仓库设置 > Pages
2. 选择分支: `main` 或 `master`
3. 选择目录: `/ (root)`
4. 点击保存
5. 等待部署完成

### 3. 更新Supabase配置

- 更新站点URL和重定向URL为GitHub Pages的URL
- 更新CORS设置，添加GitHub Pages域名

## 测试

### 认证测试

1. 访问登录页面
2. 注册新账号
3. 登录
4. 检查用户中心是否正常显示

### 数据操作测试

1. 登录管理员账号
2. 创建新活动
3. 创建新项目
4. 检查数据是否正确显示

## 开发说明

### 环境变量

- 不要将 `js/config.js` 提交到版本控制系统
- 使用 `.env` 文件管理环境变量

### 代码规范

- 保持代码简洁清晰
- 使用Tailwind CSS类名，避免内联样式
- 确保响应式设计

### 错误处理

- 所有异步操作都应有错误处理
- 向用户显示友好的错误信息
- 记录错误日志

## 维护

### 更新依赖

```bash
npm update
```

### 备份数据库

定期从Supabase控制台导出数据库备份。

### 监控

使用Supabase控制台监控项目状态和错误。

## 扩展功能

- [ ] 添加实时聊天功能
- [ ] 实现在线报名系统
- [ ] 添加文件上传功能
- [ ] 实现数据统计和分析

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT
