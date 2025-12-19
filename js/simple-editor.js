// simple-editor.js - 简单在线编辑器
// =====================================

class SimpleEditor {
  constructor() {
    this.isEditing = false;
    this.init();
  }
  
  init() {
    // 检查URL参数，例如 ?edit=true
    const urlParams = new URLSearchParams(window.location.search);
    this.isEditing = urlParams.get('edit') === 'true';
    
    if (this.isEditing) {
      this.createEditorUI();
      this.enableEditMode();
    }
    
    // 自动加载页面数据
    this.loadPageData();
    
    // 如果配置了实时更新，就开启
    if (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.enableRealtime) {
      this.startRealtimeUpdates();
    }
  }
  
  // 创建编辑界面
  createEditorUI() {
    // 创建浮动编辑面板
    const editorPanel = document.createElement('div');
    editorPanel.id = 'simple-editor-panel';
    editorPanel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border: 2px solid #4CAF50;
      border-radius: 8px;
      padding: 15px;
      z-index: 10000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      max-width: 300px;
      max-height: 80vh;
      overflow-y: auto;
      font-family: Arial, sans-serif;
    `;
    
    editorPanel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="margin: 0; color: #4CAF50;">✏️ 在线编辑器</h3>
        <button onclick="window.simpleEditor.togglePanel()" style="
          background: #ff4444;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 4px 8px;
          cursor: pointer;
        ">×</button>
      </div>
      
      <div style="margin-bottom: 10px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">页面名称:</label>
        <input type="text" id="editor-page-name" value="home" style="
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        ">
      </div>
      
      <div style="margin-bottom: 10px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">区块名称:</label>
        <input type="text" id="editor-section-name" placeholder="例如: title, content" style="
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        ">
      </div>
      
      <div style="margin-bottom: 10px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">内容:</label>
        <textarea id="editor-content" rows="4" style="
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: inherit;
        "></textarea>
      </div>
      
      <div style="display: flex; gap: 10px; margin-bottom: 15px;">
        <button onclick="window.simpleEditor.saveFromEditor()" style="
          flex: 1;
          background: #4CAF50;
          color: white;
          border: none;
          padding: 10px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        ">💾 保存</button>
        
        <button onclick="window.simpleEditor.loadPageData()" style="
          flex: 1;
          background: #2196F3;
          color: white;
          border: none;
          padding: 10px;
          border-radius: 4px;
          cursor: pointer;
        ">🔄 加载</button>
      </div>
      
      <div id="editor-message" style="
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 10px;
        display: none;
      "></div>
      
      <div style="border-top: 1px solid #eee; padding-top: 10px;">
        <small style="color: #666;">
          提示：点击页面中的任何文本都可以直接编辑
        </small>
      </div>
    `;
    
    document.body.appendChild(editorPanel);
  }
  
  // 启用编辑模式
  enableEditMode() {
    // 为可编辑元素添加点击事件
    document.addEventListener('click', (e) => {
      if (this.isEditing && this.isEditableElement(e.target)) {
        this.editElement(e.target);
      }
    });
    
    // 添加编辑按钮到所有文本元素
    setTimeout(() => {
      this.addEditButtons();
    }, 1000);
  }
  
  // 判断是否可编辑元素
  isEditableElement(element) {
    const tagName = element.tagName.toLowerCase();
    return ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div', 'li', 'td'].includes(tagName) &&
           !element.closest('#simple-editor-panel');
  }
  
  // 添加编辑按钮
  addEditButtons() {
    // 找到所有文本元素
    const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, div:not([class*="editor"])');
    
    elements.forEach(element => {
      if (!element.dataset.hasEditButton && this.isEditableElement(element)) {
        element.dataset.hasEditButton = 'true';
        element.style.position = 'relative';
        
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '✏️';
        editBtn.title = '点击编辑';
        editBtn.style.cssText = `
          position: absolute;
          top: -8px;
          right: -8px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          font-size: 12px;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.3s;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        
        element.addEventListener('mouseenter', () => {
          editBtn.style.opacity = '1';
        });
        
        element.addEventListener('mouseleave', () => {
          editBtn.style.opacity = '0';
        });
        
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.editElement(element);
        });
        
        element.appendChild(editBtn);
      }
    });
  }
  
  // 编辑元素
  editElement(element) {
    // 获取当前内容
    const currentContent = element.innerHTML;
    const sectionName = element.id || 
                       element.dataset.section || 
                       `section_${Date.now()}`;
    
    // 填充到编辑器
    document.getElementById('editor-section-name').value = sectionName;
    document.getElementById('editor-content').value = currentContent;
    
    // 高亮元素
    const originalBorder = element.style.border;
    element.style.border = '2px dashed #4CAF50';
    
    setTimeout(() => {
      element.style.border = originalBorder;
    }, 2000);
    
    // 滚动到编辑器
    document.getElementById('simple-editor-panel').scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
  
  // 从编辑器保存
  async saveFromEditor() {
    const sectionName = document.getElementById('editor-section-name').value.trim();
    const content = document.getElementById('editor-content').value.trim();
    const pageName = document.getElementById('editor-page-name').value.trim();
    
    if (!sectionName) {
      this.showMessage('请输入区块名称', 'error');
      return;
    }
    
    if (!content) {
      this.showMessage('请输入内容', 'error');
      return;
    }
    
    if (!window.siteDB) {
      this.showMessage('数据库未初始化', 'error');
      return;
    }
    
    // 设置页面
    window.siteDB.setCurrentPage(pageName);
    
    // 保存到数据库
    const result = await window.siteDB.saveContent(sectionName, content);
    
    if (result.success) {
      this.showMessage(`✅ ${result.action}成功: ${sectionName}`, 'success');
      
      // 更新页面上的对应元素
      this.updateElementOnPage(sectionName, content);
    } else {
      this.showMessage(`❌ 保存失败: ${result.error}`, 'error');
    }
  }
  
  // 更新页面元素
  updateElementOnPage(sectionName, content) {
    // 尝试多种方式找到元素
    const element = document.getElementById(sectionName) ||
                   document.querySelector(`[data-section="${sectionName}"]`) ||
                   document.querySelector(`[data-id="${sectionName}"]`);
    
    if (element) {
      element.innerHTML = content;
      
      // 添加成功动画
      element.style.transition = 'background-color 0.5s';
      element.style.backgroundColor = '#e8f5e8';
      setTimeout(() => {
        element.style.backgroundColor = '';
      }, 1000);
    }
  }
  
  // 显示消息
  showMessage(message, type = 'info') {
    const messageEl = document.getElementById('editor-message');
    messageEl.textContent = message;
    messageEl.style.display = 'block';
    
    switch(type) {
      case 'success':
        messageEl.style.backgroundColor = '#d4edda';
        messageEl.style.color = '#155724';
        messageEl.style.border = '1px solid #c3e6cb';
        break;
      case 'error':
        messageEl.style.backgroundColor = '#f8d7da';
        messageEl.style.color = '#721c24';
        messageEl.style.border = '1px solid #f5c6cb';
        break;
      default:
        messageEl.style.backgroundColor = '#d1ecf1';
        messageEl.style.color = '#0c5460';
        messageEl.style.border = '1px solid #bee5eb';
    }
    
    // 3秒后自动隐藏
    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 3000);
  }
  
  // 加载页面数据
  async loadPageData() {
    if (!window.siteDB) {
      this.showMessage('数据库未初始化', 'error');
      return;
    }
    
    const pageName = document.getElementById('editor-page-name')?.value || 'home';
    window.siteDB.setCurrentPage(pageName);
    
    const contents = await window.siteDB.getPageContents();
    
    let updatedCount = 0;
    for (const [section, content] of Object.entries(contents)) {
      if (this.updateElementOnPage(section, content)) {
        updatedCount++;
      }
    }
    
    this.showMessage(`✅ 加载完成，更新了 ${updatedCount} 个区块`, 'success');
  }
  
  // 开始实时更新
  startRealtimeUpdates() {
    if (!window.siteDB) return;
    
    window.siteDB.subscribeToChanges((payload) => {
      console.log('实时更新收到:', payload);
      
      if (payload.new && payload.new.section_name) {
        this.updateElementOnPage(payload.new.section_name, payload.new.content);
        
        // 显示实时更新通知
        this.showMessage(`🔄 实时更新: ${payload.new.section_name}`, 'info');
      }
    });
  }
  
  // 切换面板显示
  togglePanel() {
    const panel = document.getElementById('simple-editor-panel');
    if (panel.style.display === 'none') {
      panel.style.display = 'block';
    } else {
      panel.style.display = 'none';
    }
  }
}

// 初始化编辑器
window.simpleEditor = new SimpleEditor();
