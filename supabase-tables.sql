-- 武威第十八中学卓然创客社团网站数据库表结构

-- 用户表 (profiles)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'teacher', 'admin')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  bio TEXT
);

-- 活动表 (activities)
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  organizer TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'past')),
  category TEXT NOT NULL,
  images JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 活动报名表 (activity_registrations)
CREATE TABLE activity_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(activity_id, user_id)
);

-- 项目表 (projects)
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  members JSONB DEFAULT '[]',
  mentor UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed')),
  images JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 签到表 (checkins)
CREATE TABLE checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  checkin_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  location TEXT,
  UNIQUE(activity_id, user_id)
);

-- 留言表 (messages)
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 通知表 (notifications)
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  recipient_ids JSONB DEFAULT '[]',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 聊天表 (chats)
CREATE TABLE chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('group', 'private')),
  name TEXT,
  participants JSONB DEFAULT '[]',
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 聊天消息表 (chat_messages)
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'file')),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 聊天成员表 (chat_members)
CREATE TABLE chat_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(chat_id, user_id)
);

-- 资源表 (resources)
CREATE TABLE resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('document', 'image', 'video', 'link', 'other')),
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  uploader UUID REFERENCES profiles(id) ON DELETE SET NULL,
  tags JSONB DEFAULT '[]',
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_start_date ON activities(start_date);
CREATE INDEX idx_activity_registrations_activity_id ON activity_registrations(activity_id);
CREATE INDEX idx_activity_registrations_user_id ON activity_registrations(user_id);
CREATE INDEX idx_checkins_activity_id ON checkins(activity_id);
CREATE INDEX idx_checkins_user_id ON checkins(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_members_chat_id ON chat_members(chat_id);
CREATE INDEX idx_chat_members_user_id ON chat_members(user_id);

-- 资源表索引
CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_uploader ON resources(uploader);

-- 启用实时功能
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- 创建策略
-- 仅允许用户查看自己的个人资料
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- 仅允许用户更新自己的个人资料
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 允许所有人查看活动
CREATE POLICY "Everyone can view activities" ON activities
  FOR SELECT USING (true);

-- 允许教师和管理员创建和更新活动
CREATE POLICY "Teachers and admins can manage activities" ON activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

-- 允许用户查看自己的活动报名
CREATE POLICY "Users can view own registrations" ON activity_registrations
  FOR SELECT USING (auth.uid() = user_id);

-- 允许用户创建自己的活动报名
CREATE POLICY "Users can create own registrations" ON activity_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 允许教师和管理员查看所有活动报名
CREATE POLICY "Teachers and admins can view all registrations" ON activity_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

-- 允许用户查看自己的签到记录
CREATE POLICY "Users can view own checkins" ON checkins
  FOR SELECT USING (auth.uid() = user_id);

-- 允许用户创建自己的签到记录
CREATE POLICY "Users can create own checkins" ON checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 允许教师和管理员查看所有签到记录
CREATE POLICY "Teachers and admins can view all checkins" ON checkins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

-- 允许所有人查看已审核的留言
CREATE POLICY "Everyone can view approved messages" ON messages
  FOR SELECT USING (is_approved = true);

-- 允许所有人创建留言
CREATE POLICY "Everyone can create messages" ON messages
  FOR INSERT WITH CHECK (true);

-- 允许教师和管理员管理留言
CREATE POLICY "Teachers and admins can manage messages" ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

-- 允许用户查看发送给自己的通知
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (
    auth.uid()::text = ANY (recipient_ids::text[])
  );

-- 允许教师和管理员创建通知
CREATE POLICY "Teachers and admins can create notifications" ON notifications
  FOR INSERT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

-- 允许用户查看自己参与的聊天
CREATE POLICY "Users can view own chats" ON chats
  FOR SELECT USING (
    auth.uid()::text = ANY (participants::text[])
  );

-- 允许用户创建聊天
CREATE POLICY "Users can create chats" ON chats
  FOR INSERT WITH CHECK (
    auth.uid()::text = ANY (participants::text[])
  );

-- 允许用户查看自己参与的聊天消息
CREATE POLICY "Users can view messages in their chats" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = chat_messages.chat_id 
      AND auth.uid()::text = ANY (chats.participants::text[])
    )
  );

-- 允许用户发送消息到自己参与的聊天
CREATE POLICY "Users can send messages to their chats" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = chat_id 
      AND auth.uid()::text = ANY (chats.participants::text[])
    )
  );

-- 允许用户查看自己的聊天成员记录
CREATE POLICY "Users can view own chat memberships" ON chat_members
  FOR SELECT USING (auth.uid() = user_id);

-- 允许用户创建自己的聊天成员记录
CREATE POLICY "Users can create own chat memberships" ON chat_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 资源表策略
-- 允许所有人查看资源
CREATE POLICY "Everyone can view resources" ON resources
  FOR SELECT USING (true);

-- 允许用户上传资源
CREATE POLICY "Users can upload resources" ON resources
  FOR INSERT WITH CHECK (
    auth.uid() = uploader
  );

-- 允许上传者管理自己的资源
CREATE POLICY "Uploaders can manage own resources" ON resources
  FOR UPDATE USING (
    auth.uid() = uploader
  );

-- 允许教师和管理员管理所有资源
CREATE POLICY "Teachers and admins can manage all resources" ON resources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );
