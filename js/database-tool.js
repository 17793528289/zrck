// database-tool.js - 数据库操作工具
// =====================================

class SiteDatabase {
  constructor() {
    // 检查是否已加载Supabase
    if (!window.supabase) {
      console.error('请先加载Supabase SDK');
      return;
    }
    
    // 使用配置初始化
    const config = window.SUPABASE_CONFIG || {
      url: '',
      key: ''
    };
    
    if (!config.url || !config.key) {
      console.warn('Supabase配置为空，请检查supabase-config.js');
      return;
    }
    
    this.supabase = window.supabase.createClient(config.url, config.key);
    this.currentPage = 'home'; // 默认页面
    
    console.log('✅ 数据库工具初始化成功');
  }
  
  // ================= 基本操作 =================
  
  // 1. 保存内容到数据库
  async saveContent(sectionName, content) {
    try {
      if (!sectionName) {
        throw new Error('区块名称不能为空');
      }
      
      console.log(`💾 正在保存: ${sectionName}`, content);
      
      // 先检查是否已存在该区块
      const { data: existing } = await this.supabase
        .from('site_data')
        .select('id')
        .eq('page_name', this.currentPage)
        .eq('section_name', sectionName)
        .maybeSingle(); // 使用 maybeSingle 避免未找到时报错
      
      let result;
      
      if (existing) {
        // 更新已有数据
        const { error } = await this.supabase
          .from('site_data')
          .update({ 
            content: content,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
        
        if (error) throw error;
        result = { success: true, action: '更新' };
      } else {
        // 插入新数据
        const { error } = await this.supabase
          .from('site_data')
          .insert([{
            page_name: this.currentPage,
            section_name: sectionName,
            content: content,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
        
        if (error) throw error;
        result = { success: true, action: '创建' };
      }
      
      console.log(`✅ ${result.action}成功: ${sectionName}`);
      return result;
      
    } catch (error) {
      console.error('❌ 保存失败:', error.message);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
  
  // 2. 获取单个区块内容
  async getContent(sectionName) {
    try {
      const { data, error } = await this.supabase
        .from('site_data')
        .select('content')
        .eq('page_name', this.currentPage)
        .eq('section_name', sectionName)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // 未找到数据，返回空
          return '';
        }
        throw error;
      }
      
      return data.content || '';
      
    } catch (error) {
      console.error('获取内容失败:', error);
      return '';
    }
  }
  
  // 3. 获取整个页面的所有区块
  async getPageContents() {
    try {
      const { data, error } = await this.supabase
        .from('site_data')
        .select('section_name, content, updated_at')
        .eq('page_name', this.currentPage)
        .order('id', { ascending: true });
      
      if (error) throw error;
      
      // 转换为对象格式：{ 区块名: 内容 }
      const contents = {};
      (data || []).forEach(item => {
        contents[item.section_name] = item.content;
      });
      
      return contents;
      
    } catch (error) {
      console.error('获取页面内容失败:', error);
      return {};
    }
  }
  
  // 4. 删除区块
  async deleteSection(sectionName) {
    try {
      const { error } = await this.supabase
        .from('site_data')
        .delete()
        .eq('page_name', this.currentPage)
        .eq('section_name', sectionName);
      
      if (error) throw error;
      
      return { success: true };
      
    } catch (error) {
      console.error('删除失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  // ================= 高级功能 =================
  
  // 5. 实时监听变化（页面自动更新）
  subscribeToChanges(callback) {
    return this.supabase
      .channel('site-updates')
      .on('postgres_changes', {
        event: '*', // 监听所有事件：INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'site_data',
        filter: `page_name=eq.${this.currentPage}`
      }, (payload) => {
        console.log('📡 数据变化:', payload);
        callback(payload);
      })
      .subscribe((status) => {
        console.log('📡 订阅状态:', status);
      });
  }
  
  // 6. 批量保存多个区块
  async saveMultipleSections(sections) {
    const results = [];
    
    for (const [sectionName, content] of Object.entries(sections)) {
      const result = await this.saveContent(sectionName, content);
      results.push({
        section: sectionName,
        ...result
      });
    }
    
    return results;
  }
  
  // 7. 设置当前页面
  setCurrentPage(pageName) {
    this.currentPage = pageName;
    console.log(`📄 切换到页面: ${pageName}`);
  }
  
  // 8. 测试连接
  async testConnection() {
    try {
      const { data, error } = await this.supabase
        .from('site_data')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      
      return { 
        success: true, 
        message: '数据库连接正常' 
      };
      
    } catch (error) {
      return { 
        success: false, 
        message: '连接失败: ' + error.message 
      };
    }
  }
}

// ================= 使用示例 =================

// 创建全局数据库实例
window.siteDB = new SiteDatabase();

// 示例函数 - 可以直接在浏览器控制台调用
window.demoDatabase = {
  // 示例1: 保存标题
  async saveTitle() {
    const title = document.title || '我的网站';
    const result = await siteDB.saveContent('page_title', title);
    console.log('保存标题结果:', result);
    return result;
  },
  
  // 示例2: 保存当前页面的所有h1内容
  async saveAllHeadings() {
    const headings = {};
    document.querySelectorAll('h1, h2, h3').forEach((heading, index) => {
      headings[`heading_${index}`] = heading.textContent;
    });
    
    const result = await siteDB.saveMultipleSections(headings);
    console.log('保存所有标题结果:', result);
    return result;
  },
  
  // 示例3: 加载数据到页面
  async loadToPage() {
    const contents = await siteDB.getPageContents();
    
    for (const [section, content] of Object.entries(contents)) {
      // 尝试找到对应的元素
      const element = document.getElementById(section) || 
                     document.querySelector(`[data-section="${section}"]`);
      
      if (element && content) {
        element.innerHTML = content;
        console.log(`✅ 加载: ${section}`);
      }
    }
    
    console.log('页面数据加载完成');
  },
  
  // 示例4: 开启实时监听
  startLiveUpdates() {
    return siteDB.subscribeToChanges((payload) => {
      console.log('实时更新:', payload);
      
      // 如果有元素对应这个区块，立即更新
      if (payload.new && payload.new.section_name) {
        const element = document.getElementById(payload.new.section_name) ||
                       document.querySelector(`[data-section="${payload.new.section_name}"]`);
        
        if (element) {
          element.innerHTML = payload.new.content || '';
          element.style.backgroundColor = '#e8f5e8';
          setTimeout(() => {
            element.style.backgroundColor = '';
          }, 1000);
        }
      }
    });
  }
};

console.log('🚀 数据库工具已加载！');
console.log('试试: demoDatabase.saveTitle()');
console.log('试试: demoDatabase.loadToPage()');
console.log('试试: demoDatabase.startLiveUpdates()');
