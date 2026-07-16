// Supabase 客户端初始化 + 通用函数
// 依赖：需要先加载 supabase-config.js 和 Supabase CDN SDK

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 检查登录状态，返回 user 或 null
async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  // 额外查询 profiles 表获取昵称
  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, avatar_url')
    .eq('id', user.id)
    .single();

  return {
    ...user,
    nickname: profile?.nickname || user.email?.split('@')[0] || '用户',
    avatar_url: profile?.avatar_url || ''
  };
}

// 登出
async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('登出失败:', error.message);
    return false;
  }
  window.location.href = 'index.html';
  return true;
}
