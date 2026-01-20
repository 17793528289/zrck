// 初始化Supabase客户端
console.log('🔄 正在初始化Supabase客户端...');
console.log('配置信息:', {
  url: config.supabase.url,
  anonKey: config.supabase.anonKey ? '已配置' : '未配置'
});

const supabase = window.supabase.createClient(config.supabase.url, config.supabase.anonKey);

// 添加全局错误监听器
supabase.auth.onAuthStateChange((event, session) => {
  console.log(`🔄 认证状态变化: ${event}`, session?.user?.email || '无会话');
});

console.log('✓ Supabase客户端初始化完成');

// 导出Supabase客户端
export { supabase };