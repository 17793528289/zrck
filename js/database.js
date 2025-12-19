// 数据库操作工具
const DatabaseService = {
  // 获取页面数据
  async getPageData(pageName) {
    try {
      const { data, error } = await supabase
        .from('site_data')
        .select('*')
        .eq('page_name', pageName)
        .order('id', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取数据失败:', error);
      return [];
    }
  },
  
  // 保存或更新数据
  async saveData(pageName, sectionName, content) {
    try {
      // 先检查是否已存在
      const { data: existing } = await supabase
        .from('site_data')
        .select('id')
        .eq('page_name', pageName)
        .eq('section_name', sectionName)
        .single();
      
      if (existing) {
        // 更新已有数据
        const { error } = await supabase
          .from('site_data')
          .update({ 
            content: content,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
        
        if (error) throw error;
        return { success: true, action: 'updated' };
      } else {
        // 插入新数据
        const { error } = await supabase
          .from('site_data')
          .insert([{
            page_name: pageName,
            section_name: sectionName,
            content: content,
            updated_at: new Date().toISOString()
          }]);
        
        if (error) throw error;
        return { success: true, action: 'created' };
      }
    } catch (error) {
      console.error('保存数据失败:', error);
      return { success: false, error: error.message };
    }
  },
  
  // 实时监听数据变化
  subscribeToChanges(pageName, callback) {
    return supabase
      .channel('site-data-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'site_data',
        filter: `page_name=eq.${pageName}`
      }, (payload) => {
        console.log('数据变化:', payload);
        callback(payload);
      })
      .subscribe();
  },
  
  // 批量保存多个区块
  async saveMultipleSections(pageName, sections) {
    const results = [];
    
    for (const [sectionName, content] of Object.entries(sections)) {
      const result = await this.saveData(pageName, sectionName, content);
      results.push({ section: sectionName, ...result });
    }
    
    return results;
  }
};

// 让函数在全局可用
window.DatabaseService = DatabaseService;
