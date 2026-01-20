# Supabase后端设置方案

## 1. 项目现状分析
- 已创建基本的HTML网站，使用Tailwind CSS和Font Awesome
- 已通过CDN引入Supabase JS库
- 已实现基本的认证功能（登录、注册、登出）
- 已配置Supabase客户端（js/supabase.js）
- 已实现认证逻辑（js/auth.js）

## 2. 后端设置步骤

### 2.1 Supabase项目配置
1. **创建Supabase项目**：访问[Supabase官网](https://supabase.com/)，注册并创建新项目
2. **配置项目设置**：
   - 获取项目URL和匿名密钥（已在supabase.js中配置）
   - 配置认证 providers（邮箱/密码、社交登录等）
   - 设置站点URL用于重定向

### 2.2 数据库设计与创建

#### 用户表（已由Supabase Auth自动创建）
- `auth.users` - 存储用户基本信息

#### 自定义表设计
1. **社团成员表** (`members`)
   ```sql
   CREATE TABLE members (
     id UUID REFERENCES auth.users(id) PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     student_id VARCHAR(20) UNIQUE NOT NULL,
     grade VARCHAR(10),
     class VARCHAR(10),
     role VARCHAR(20) DEFAULT 'member', -- member, admin, teacher
     avatar_url TEXT,
     bio TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. **社团活动表** (`activities`)
   ```sql
   CREATE TABLE activities (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     title VARCHAR(255) NOT NULL,
     description TEXT,
     cover_image TEXT,
     start_time TIMESTAMP WITH TIME ZONE,
     end_time TIMESTAMP WITH TIME ZONE,
     location VARCHAR(255),
     organizer UUID REFERENCES auth.users(id),
     status VARCHAR(20) DEFAULT 'upcoming', -- upcoming, ongoing, completed
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. **项目展示表** (`projects`)
   ```sql
   CREATE TABLE projects (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     title VARCHAR(255) NOT NULL,
     description TEXT,
     cover_image TEXT,
     category VARCHAR(50),
     members UUID[] REFERENCES auth.users(id),
     status VARCHAR(20) DEFAULT 'ongoing', -- ongoing, completed, archived
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

4. **访客留言表** (`messages`)
   ```sql
   CREATE TABLE messages (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name VARCHAR(255) NOT NULL,
     email VARCHAR(255) NOT NULL,
     content TEXT NOT NULL,
     status VARCHAR(20) DEFAULT 'unread', -- unread, read, replied
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

### 2.3 认证设置
1. **启用邮箱/密码认证**
2. **配置邮件模板**：用于验证邮件和密码重置
3. **设置JWT过期时间**
4. **配置重定向URL**：确保与GitHub部署的URL匹配

### 2.4 权限配置
1. **RLS（行级安全）策略**：
   - 成员表：仅允许用户查看和修改自己的信息
   - 活动表：允许所有用户查看，仅管理员和组织者可以修改
   - 项目表：允许所有用户查看，仅管理员和项目成员可以修改
   - 留言表：仅管理员可以查看和修改

2. **API密钥管理**：
   - 使用匿名密钥进行客户端访问
   - 为服务器端操作创建服务角色密钥

### 2.5 GitHub部署集成
1. **配置环境变量**：在GitHub仓库中添加Supabase URL和密钥
2. **设置CORS**：在Supabase项目中添加GitHub部署的域名到CORS允许列表
3. **自动化部署**：使用GitHub Actions实现自动化构建和部署
4. **测试部署**：确保部署后的网站能正确连接到Supabase

### 2.6 功能测试与调试
1. **测试认证流程**：注册、登录、登出
2. **测试数据操作**：创建、读取、更新、删除数据
3. **调试工具**：使用Supabase控制台的日志和监控功能
4. **错误处理**：完善前端错误处理机制

## 3. 代码优化建议
1. **将环境变量分离**：不要将Supabase密钥硬编码在文件中
2. **完善错误处理**：添加更详细的错误提示和日志
3. **实现用户资料管理**：允许用户更新个人信息
4. **添加数据验证**：在前端和后端都进行数据验证
5. **实现分页和搜索**：对于大量数据的页面

## 4. 后续扩展建议
1. **添加文件存储**：使用Supabase Storage存储图片和文件
2. **实现实时功能**：使用Supabase Realtime实现实时更新
3. **添加通知系统**：通过Supabase Edge Functions发送通知
4. **实现数据分析**：使用Supabase Analytics分析用户行为

## 5. 实施计划
1. **第1步**：完成Supabase项目配置和认证设置
2. **第2步**：创建数据库表和RLS策略
3. **第3步**：优化前端代码，添加环境变量支持
4. **第4步**：配置GitHub部署和CORS
5. **第5步**：测试所有功能
6. **第6步**：部署上线

这个方案将帮助您完整设置Supabase后端，并与GitHub部署集成，实现一个功能完整的社团网站。