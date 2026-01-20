// Supabase配置
const supabaseUrl = 'https://xwfcvhbneaajirmixpfj.supabase.co';
const supabaseKey = 'sb_publishable_5hrKzOXRlbtROlh13kl0ig_y4gBXXEt';

// 初始化Supabase客户端
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 导出Supabase客户端
export { supabase };