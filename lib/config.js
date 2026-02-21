// 配置文件
// 注意：在生产环境中，这些值应该从环境变量中获取
const config = {
    supabase: {
        url: 'https://xwfcvhbneaajirmixpfj.supabase.co',
        anonKey: 'sb_publishable_5hrKzOXRlbtROlh13kl0ig_y4gBXXEt'
    },
    site: {
        name: '卓然创客社团',
        domain: 'zrck2026.github.io',
        contactEmail: 'contact@zrck2026.com',
        baseUrl: 'https://zrck2026.github.io'
    }
};

// 导出配置
if (typeof window !== 'undefined') {
    window.config = config;
} else {
    module.exports = config;
}
