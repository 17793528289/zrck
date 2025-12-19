// 管理员编辑工具
class SiteEditor {
  constructor() {
    this.currentPage = 'home';
    this.isAdmin = false;
    this.init();
  }
  
  init() {
    // 检查URL参数，如果有 ?admin=true 则显示编辑按钮
    const urlParams = new URLSearchParams(window.location.search);
    this.isAdmin = urlParams.get('admin') === 'true';
    
    if (this.isAdmin) {
      this.createAdminUI();
      this.loadPageData();
    }
  }
  
  // 创建管理界面
  createAdminUI() {
    // 创建编辑按钮容器
    const editorContainer = document.createElement('div');
    editorContainer.id = 'site-editor';
    editorContainer.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 9999;
      background: white;
      border: 2px solid #007bff;
      border-radius: 8px;
      padding: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      max-width: 300px;
    `;
    
    editorContainer.innerHTML = `
      <h3 style="margin: 0 0 10px 0; color: #007bff;">网站编辑器</h3>
      <div style="margin-bottom: 10px;">
        <label>页面名称:</label>
        <input type="text" id="page-name" value="home" style="width: 100%; padding: 5px;">
      </div>
      <button onclick="window.editor.loadPageData()" style="padding: 5px 10px; margin-bottom: 10px;">
        加载页面数据
      </button>
      <div id="editor-sections" style="max-height: 300px; overflow-y: auto;"></div>
      <button onclick="window.editor.saveAll()" style="background: #28a745; color: white; padding: 8px; width: 100%; margin-top: 10px;">
        保存所有修改
      </button>
      <button onclick="window.editor.toggleEditor()" style="background: #dc3545; color: white; padding: 5px; width: 100%; margin-top: 5px;">
        关闭编辑器
      </button>
    `;
    
    document.body.appendChild(editorContainer);
    
    // 为页面元素添加编辑按钮
    this.addEditButtons();
  }
  
  // 为页面区块添加编辑按钮
  addEditButtons() {
    // 找到所有可能的内容区块
    const editableElements = document.querySelectorAll('h1, h2, h3, h4, h5, p, div.content, section, [data-editable]');
    
    editableElements.forEach((element, index) => {
      // 跳过已经在编辑器中的元素
      if (element.closest('#site-editor')) return;
      
      const sectionName = element.id || `section_${index}`;
      element.dataset.section = sectionName;
      
      // 创建编辑按钮
      const editBtn = document.createElement('button');
      editBtn.innerHTML = '✏️';
      editBtn.style.cssText = `
        position: absolute;
        top: 5px;
        right: 5px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 3px;
        padding: 2px 5px;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.3s;
        z-index: 100;
      `;
      editBtn.onmouseenter = () => editBtn.style.opacity = '1';
      editBtn.onmouseleave = () => editBtn.style.opacity = '0.7';
      editBtn.onclick = (e) => {
        e.stopPropagation();
        this.editElement(element, sectionName);
      };
      
      // 相对定位容器
      if (getComputedStyle(element).position === 'static') {
        element.style.position = 'relative';
      }
      element.appendChild(editBtn);
    });
  }
  
  // 编辑单个元素
  editElement(element, sectionName) {
    const currentContent = element.innerHTML;
    
    // 在编辑器中显示
    const editorSections = document.getElementById('editor-sections');
    const existingEditor = document.getElementById(`editor-${sectionName}`);
    
    if (!existingEditor) {
      const editor = document.createElement('div');
      editor.id = `editor-${sectionName}`;
      editor.style.cssText = `
        border: 1px solid #ddd;
        padding: 10px;
        margin-bottom: 10px;
        border-radius: 5px;
      `;
      
      editor.innerHTML = `
        <div style="font-size: 12px; color: #666; margin-bottom: 5px;">${sectionName}</div>
        <textarea 
          style="width: 100%; height: 100px; padding: 5px; font-family: monospace;"
          id="input-${sectionName}"
        >${currentContent.replace(/<br>/g, '\n')}</textarea>
        <div style="margin-top: 5px; display: flex; gap: 5px;">
          <button onclick="window.editor.saveSection('${sectionName}')" style="padding: 3px 8px; font-size: 12px;">
            保存
          </button>
          <button onclick="window.editor.removeEditor('${sectionName}')" style="padding: 3px 8px; font-size: 12px; background: #dc3545; color: white;">
            取消
          </button>
        </div>
      `;
      
      editorSections.appendChild(editor);
    }
  }
  
  // 加载页面数据
  async loadPageData() {
    const pageName = document.getElementById('page-name').value || 'home';
    this.currentPage = pageName;
    
    const data = await DatabaseService.getPageData(pageName);
    
    // 应用数据到页面
    data.forEach(item => {
      const element = document.querySelector(`[data-section="${item.section_name}"]`);
      if (element) {
        element.innerHTML = item.content;
      }
    });
    
    alert(`已加载 ${data.length} 个区块的数据`);
  }
  
  // 保存单个区块
  async saveSection(sectionName) {
    const input = document.getElementById(`input-${sectionName}`);
    const content = input.value;
    
    const result = await DatabaseService.saveData(
      this.currentPage, 
      sectionName, 
      content
    );
    
    if (result.success) {
      // 更新页面显示
      const element = document.querySelector(`[data-section="${sectionName}"]`);
      if (element) {
        element.innerHTML = content;
      }
      
      // 移除编辑器
      this.removeEditor(sectionName);
      alert(`区块 "${sectionName}" 保存成功！`);
    } else {
      alert('保存失败: ' + result.error);
    }
  }
  
  // 保存所有修改
  async saveAll() {
    const editors = document.querySelectorAll('#editor-sections > div');
    const results = [];
    
    for (const editor of editors) {
      const sectionName = editor.id.replace('editor-', '');
      const input = document.getElementById(`input-${sectionName}`);
      
      if (input) {
        const result = await DatabaseService.saveData(
          this.currentPage,
          sectionName,
          input.value
        );
        results.push({ sectionName, ...result });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    alert(`保存完成！成功: ${successCount}，失败: ${results.length - successCount}`);
    
    // 重新加载页面数据
    this.loadPageData();
  }
  
  removeEditor(sectionName) {
    const editor = document.getElementById(`editor-${sectionName}`);
    if (editor) {
      editor.remove();
    }
  }
  
  toggleEditor() {
    const editor = document.getElementById('site-editor');
    if (editor.style.display === 'none') {
      editor.style.display = 'block';
    } else {
      editor.style.display = 'none';
    }
  }
}

// 初始化编辑器
window.addEventListener('DOMContentLoaded', () => {
  window.editor = new SiteEditor();
});
