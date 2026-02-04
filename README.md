# 武威第十八中学卓然创客社团网站

## 项目概述

本项目是武威第十八中学卓然创客社团的官方网站，旨在展示社团风采、管理社团活动、促进社员交流。网站采用现代化的技术栈和设计风格，为社团成员和访客提供良好的用户体验。

## 技术栈

- **前端**：HTML5 + Tailwind CSS v4 + 原生JavaScript
- **后端**：Supabase (用户认证、数据存储、API、实时数据库)
- **图标**：Font Awesome
- **图表**：Chart.js (用于后台管理数据统计)
- **部署**：静态网站托管（如GitHub Pages、Vercel等）

## 项目结构

```
zrck2/
├── index.html              # 首页
├── about.html              # 社团简介页
├── activities.html         # 社团活动页
├── showcase.html           # 社团展示页
├── login.html              # 登录/注册页
├── member-center.html      # 社员中心
├── teacher-center.html     # 教师中心
├── admin.html              # 后台管理
├── visitor-center.html     # 访客中心
├── chat.html               # 社员聊天系统
├── assets/
│   ├── js/
│   │   └── main.js         # 通用脚本
├── lib/
│   └── supabase.js         # Supabase配置和工具函数
└── README.md               # 项目说明
```

## 核心功能

### 1. 公共页面
- **首页**：社团概览、核心功能展示、最新活动、社团风采
- **社团简介**：社团历史、宗旨、组织结构、指导教师
- **社团活动**：活动列表、活动详情、报名功能
- **社团展示**：活动展示、成果展示、成员介绍、设备资源
- **访客中心**：社团信息浏览、活动查看、留言板、加入我们

### 2. 认证系统
- **登录/注册**：账号密码登录、新用户注册
- **忘记密码**：密码重置功能
- **权限控制**：不同角色（社员、教师、管理员）的访问权限

### 3. 社员功能
- **社员中心**：个人信息管理、活动参与记录、项目管理、通知中心、签到功能
- **聊天系统**：实时聊天、社团群聊、项目组聊天、私信功能

### 4. 教师功能
- **教师中心**：活动管理、成员管理、项目指导、资源管理、签到管理

### 5. 管理员功能
- **后台管理**：用户管理、内容管理、活动管理、系统设置、数据统计

## 安装和运行

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/zrck2.git
cd zrck2
```

### 2. 配置Supabase

1. 访问 [Supabase](https://supabase.com/) 注册账号并创建项目
2. 在项目设置中获取 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`
3. 修改 `lib/supabase.js` 文件，填入你的Supabase配置

### 3. 启动本地服务器

使用VS Code的Live Server插件或其他本地服务器工具启动项目：

```bash
# 使用Python 3
python -m http.server 8000

# 或使用Node.js的http-server
npm install -g http-server
http-server -p 8000
```

然后在浏览器中访问 `http://localhost:8000`

### 4. 部署

可以部署到任何静态网站托管服务，如：

- **GitHub Pages**：将代码推送到GitHub仓库，开启GitHub Pages功能
- **Vercel**：连接GitHub仓库，自动部署
- **Netlify**：连接GitHub仓库，自动部署

## 数据库设计

### 1. 用户表 (profiles)
- id (主键)
- username (用户名)
- full_name (姓名)
- email (邮箱)
- avatar_url (头像)
- role (角色: member, teacher, admin)
- joined_at (加入时间)
- bio (个人简介)

### 2. 活动表 (activities)
- id (主键)
- title (标题)
- description (描述)
- start_date (开始时间)
- end_date (结束时间)
- location (地点)
- organizer (组织者)
- status (状态: upcoming, ongoing, past)
- category (分类)
- images (图片URL数组)
- created_at (创建时间)

### 3. 活动报名表 (activity_registrations)
- id (主键)
- activity_id (活动ID)
- user_id (用户ID)
- status (状态: registered, attended, cancelled)
- registered_at (报名时间)

### 4. 项目表 (projects)
- id (主键)
- title (标题)
- description (描述)
- members (成员ID数组)
- mentor (指导教师ID)
- status (状态: planning, in_progress, completed)
- images (图片URL数组)
- created_at (创建时间)

### 5. 签到表 (checkins)
- id (主键)
- activity_id (活动ID)
- user_id (用户ID)
- checkin_time (签到时间)
- location (签到地点，可选)

### 6. 留言表 (messages)
- id (主键)
- name (姓名)
- email (邮箱)
- content (内容)
- is_approved (是否审核通过)
- created_at (创建时间)

### 7. 通知表 (notifications)
- id (主键)
- title (标题)
- content (内容)
- recipient_ids (接收者ID数组)
- is_read (是否已读)
- created_at (创建时间)

### 8. 聊天表 (chats)
- id (主键)
- type (类型: group, private)
- name (群聊名称，私聊可为空)
- participants (参与者ID数组)
- last_message (最后一条消息内容)
- last_message_time (最后一条消息时间)
- created_at (创建时间)

### 9. 聊天消息表 (chat_messages)
- id (主键)
- chat_id (聊天ID)
- sender_id (发送者ID)
- content (消息内容)
- type (类型: text, image, file)
- status (状态: sent, delivered, read)
- created_at (创建时间)

### 10. 聊天成员表 (chat_members)
- id (主键)
- chat_id (聊天ID)
- user_id (用户ID)
- joined_at (加入时间)
- last_read_at (最后阅读时间)

## 开发说明

### 1. 响应式设计

网站采用移动优先的响应式设计，使用Tailwind CSS的断点系统适配不同设备尺寸：
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### 2. 主题设计

- **配色方案**：深色背景 (#121212)，强调色 #03fc90 和 #fc03f8
- **字体**：中文使用无衬线字体，英文使用 Inter 或 Roboto
- **风格**：科技感与教育属性结合，简洁现代

### 3. Supabase集成

网站使用Supabase进行后端功能实现，主要包括：
- 用户认证和授权
- 数据存储和查询
- 实时数据库（用于聊天系统）
- 文件存储（用于头像、活动图片等）

### 4. 性能优化

- **图片优化**：使用适当的图片格式和大小
- **代码优化**：减少不必要的JavaScript，优化DOM操作
- **资源加载**：合理使用缓存，减少重复请求
- **Supabase优化**：使用适当的查询方法，优化实时订阅

## 贡献指南

欢迎社团成员和开发者贡献代码和建议。贡献流程：

1. Fork本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 许可证

本项目采用MIT许可证。详见LICENSE文件。

## 联系方式

- **社团邮箱**：contact@example.com
- **项目维护**：社团技术部

---

**武威第十八中学卓然创客社团**
**官网**：[https://example.com](https://example.com)
**成立时间**：2018年
**宗旨**：培养创新能力，实践科学精神