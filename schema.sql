-- ============================================================
-- 柒柒的博客 - Supabase 数据库初始化脚本
-- 在 Supabase SQL Editor 中执行本文件即可完成初始化
-- ============================================================

-- 用户资料表（扩展 Supabase auth.users）
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nickname TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 文章表
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  tags TEXT[],
  content TEXT NOT NULL,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nickname, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'nickname', '');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS 策略：公开可读已发布文章，仅作者可写自己的文章
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "公开可读文章" ON articles FOR SELECT USING (status = 'published');
CREATE POLICY "作者可读自己所有文章" ON articles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "作者可插入文章" ON articles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "作者可更新文章" ON articles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "作者可删除文章" ON articles FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "公开可读用户信息" ON profiles FOR SELECT USING (true);
CREATE POLICY "用户可更新自己的资料" ON profiles FOR UPDATE USING (auth.uid() = id);
