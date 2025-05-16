// 表示文件接口
interface FileItem {
  name: string;
  path: string;
  isFolder?: boolean;
  language: string;
  content: string;
}

// 文件夹结构接口
interface FolderItem {
  name: string;
  path: string;
  isFolder: boolean;
  children?: (FolderItem | FileItem)[];
  parent?: FolderItem;
  content?: string;
  language?: string;
}

// 导入文件夹浏览器组件
import FolderExplorer from './folder-explorer';

class CodeEditor extends HTMLElement {
  private editor: any;
  private files: FileItem[];
  private currentFileIndex: number;
  private previewFrame: HTMLIFrameElement | null;
  private folderExplorer: FolderExplorer | null;
  private folderStructure: FolderItem;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.editor = null;
    this.files = [
      { name: 'index.html', path: 'index.html', language: 'html', content: '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <title>我的项目</title>\n  <link rel="stylesheet" href="styles/main.css">\n</head>\n<body>\n  <div id="app">Hello World!</div>\n  <script src="src/main.js"></script>\n</body>\n</html>' },
      { name: 'main.js', path: 'src/main.js', language: 'javascript', content: '// 这里写 JavaScript 代码\nconsole.log("Hello from JavaScript!");' },
      { name: 'main.css', path: 'styles/main.css', language: 'css', content: '/* 这里写 CSS 样式 */\nbody {\n  font-family: sans-serif;\n  margin: 0;\n  padding: 20px;\n}\n\n#app {\n  color: blue;\n}' },
    ];
    this.currentFileIndex = 0;
    this.previewFrame = null;
    this.folderExplorer = null;
    this.folderStructure = { name: 'root', path: '', isFolder: true, children: [] };
  }

  // Web组件连接到DOM时
  connectedCallback(): void {
    this.render();
    this.setupMonacoEditor();
    this.initEventListeners();
    // 初始化文件夹浏览器 - 负责文件展示
    this.setupFolderExplorer();
  }

  // 渲染编辑器界面
  private render(): void {
    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          height: 100%;
          font-family: 'Arial', sans-serif;
        }
        
        .container {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        
        .sidebar {
          width: 220px;
          background: #252526;
          color: #e7e7e7;
          display: flex;
          flex-direction: column;
        }
        
        .folder-tree {
          flex: 1;
          overflow: auto;
          padding: 10px 0;
        }
        
        .folder-item, .file-item {
          padding: 3px 15px;
          cursor: pointer;
          white-space: nowrap;
          display: flex;
          align-items: center;
        }
        
        .folder-item:hover, .file-item:hover {
          background-color: #2a2d2e;
        }
        
        .file-item.active {
          background-color: #37373d;
        }
        
        .folder-icon, .file-icon {
          margin-right: 5px;
          width: 16px;
          text-align: center;
        }
        
        .folder-content {
          padding-left: 15px;
        }
        
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .tab-bar {
          display: flex;
          background: #2d2d2d;
          height: 35px;
          overflow-x: auto;
        }
        
        .tab {
          padding: 0 10px;
          line-height: 35px;
          background: #2d2d2d;
          color: #e7e7e7;
          border-right: 1px solid #3c3c3c;
          cursor: pointer;
          white-space: nowrap;
          display: flex;
          align-items: center;
          min-width: 100px;
        }
        
        .tab.active {
          background: #1e1e1e;
        }

        .tab-close {
          margin-left: 8px;
          opacity: 0.7;
        }
        
        .tab-close:hover {
          opacity: 1;
        }
        
        .editor-container {
          flex: 1;
          overflow: hidden;
        }
        
        #monaco-editor {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        .navbar {
          height: 40px;
          background: #3c3c3c;
          display: flex;
          align-items: center;
          padding: 0 10px;
          gap: 10px;
        }
        
        button {
          padding: 6px 12px;
          background: #0e639c;
          color: white;
          border: none;
          border-radius: 2px;
          cursor: pointer;
        }
        
        button:hover {
          background: #1177bb;
        }
        
        .sidebar-controls {
          padding: 10px;
          border-bottom: 1px solid #3c3c3c;
        }
        
        .preview-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: none;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .preview-frame {
          width: 80%;
          height: 80%;
          background: white;
          border: none;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        }
        
        .preview-controls {
          position: absolute;
          top: 10px;
          right: 10px;
        }

        .preview-close {
          background: #e74c3c;
        }
      </style>
      
      <div class="navbar">
        <button id="run-btn">运行预览</button>
      </div>
      
      <div class="container">
        <div class="sidebar">
          <div class="sidebar-controls">
            <button id="new-file-btn">新建文件</button>
            <button id="show-preview-btn">显示预览</button>
          </div>
          <div class="folder-tree" id="folder-tree"></div>
        </div>
        
        <div class="main-content">
          <div class="tab-bar" id="tab-bar"></div>
          <div class="editor-container">
            <div id="monaco-editor"></div>
          </div>
        </div>
      </div>
      
      <div class="preview-container" id="preview-container">
        <iframe class="preview-frame" id="preview-frame"></iframe>
        <div class="preview-controls">
          <button class="preview-close" id="close-preview-btn">关闭预览</button>
        </div>
      </div>
    `;
  }

  // 初始化Monaco编辑器
  private setupMonacoEditor(): void {
    // 此处在实际项目中应加载Monaco编辑器
    // 在本示例中，我们假设Monaco编辑器已通过CDN加载
    if (typeof (window as any).monaco !== 'undefined') {
      this.initMonaco();
    } else {
      (window as any).require(['vs/editor/editor.main'], () => {
        this.initMonaco();
      });
    }
  }

  // 初始化Monaco编辑器实例
  private initMonaco(): void {
    const editorContainer = this.shadowRoot!.getElementById('monaco-editor');
    if (!editorContainer) return;

    this.editor = (window as any).monaco.editor.create(editorContainer, {
      value: this.files[this.currentFileIndex].content,
      language: this.files[this.currentFileIndex].language,
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: {
        enabled: true
      }
    });

    // 当编辑器内容更改时，更新文件内容
    this.editor.onDidChangeModelContent(() => {
      this.files[this.currentFileIndex].content = this.editor.getValue();
      
      // 如果文件内容变化，也通知文件夹浏览器更新
      if (this.folderExplorer) {
        this.folderExplorer.setFiles(this.files, this.currentFileIndex);
      }
    });

    this.renderTabs();
    // 如果文件夹浏览器已初始化，则更新当前文件
    if (this.folderExplorer) {
      this.folderExplorer.updateCurrentFile(this.currentFileIndex);
    }
  }

  // 添加事件监听器
  private initEventListeners(): void {
    // 运行预览按钮
    const runBtn = this.shadowRoot!.getElementById('run-btn');
    runBtn?.addEventListener('click', () => this.showPreview());

    // 侧边栏显示预览按钮
    const showPreviewBtn = this.shadowRoot!.getElementById('show-preview-btn');
    showPreviewBtn?.addEventListener('click', () => this.showPreview());

    // 关闭预览按钮
    const closePreviewBtn = this.shadowRoot!.getElementById('close-preview-btn');
    closePreviewBtn?.addEventListener('click', () => this.hidePreview());

    // 新建文件按钮
    const newFileBtn = this.shadowRoot!.getElementById('new-file-btn');
    newFileBtn?.addEventListener('click', () => this.createNewFile());
  }

  // 渲染标签页
  private renderTabs(): void {
    const tabBar = this.shadowRoot!.getElementById('tab-bar');
    if (!tabBar) return;
    
    tabBar.innerHTML = '';
    
    this.files.forEach((file, index) => {
      const tab = document.createElement('div');
      tab.className = `tab ${index === this.currentFileIndex ? 'active' : ''}`;
      
      const fileName = file.path.split('/').pop() || file.name;
      tab.innerHTML = `
        ${fileName}
        ${index !== 0 ? '<span class="tab-close">×</span>' : ''}
      `;
      
      tab.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('tab-close')) {
          this.closeFile(index);
        } else {
          this.switchFile(index);
        }
      });
      
      tabBar.appendChild(tab);
    });
  }

  // 切换到另一个文件
  private switchFile(index: number): void {
    if (index === this.currentFileIndex) return;
    
    this.currentFileIndex = index;
    if (this.editor) {
      this.editor.setValue(this.files[index].content);
      (window as any).monaco.editor.setModelLanguage(this.editor.getModel(), this.files[index].language);
    }
    
    this.renderTabs();
    // 更新文件夹浏览器
    if (this.folderExplorer) {
      this.folderExplorer.updateCurrentFile(this.currentFileIndex);
    }
  }

  // 关闭文件
  private closeFile(index: number): void {
    if (index === 0) return; // 不允许关闭index.html
    
    this.files.splice(index, 1);
    
    if (index === this.currentFileIndex) {
      // 如果关闭的是当前文件，切换到第一个文件
      this.currentFileIndex = 0;
      if (this.editor) {
        this.editor.setValue(this.files[0].content);
        (window as any).monaco.editor.setModelLanguage(this.editor.getModel(), this.files[0].language);
      }
    } else if (index < this.currentFileIndex) {
      // 如果关闭的文件在当前文件之前，更新索引
      this.currentFileIndex--;
    }
    
    // 更新文件夹结构
    if (this.folderExplorer) {
      // 更新文件夹浏览器的文件列表
      this.folderExplorer.setFiles(this.files, this.currentFileIndex);
      // 获取最新的文件夹结构
      this.folderStructure = this.folderExplorer.getFolderStructure();
    } else {
      // 如果文件夹浏览器还未初始化，使用内部方法
      this.folderStructure = this.buildFolderStructure(this.files);
    }
    
    this.renderTabs();
    // 如果文件夹浏览器已初始化，则更新
    if (this.folderExplorer) {
      this.folderExplorer.setFiles(this.files, this.currentFileIndex);
    }
  }

  // 创建新文件
  private createNewFile(): void {
    const fileName = prompt('请输入文件名 (例如: script.js 或 folder/style.css):');
    if (!fileName) return;
    
    // 检查文件是否已存在
    if (this.files.some(f => f.path === fileName)) {
      alert('文件已存在!');
      return;
    }
    
    // 根据扩展名判断语言
    const extension = fileName.split('.').pop() || '';
    let language = 'text';
    
    switch (extension) {
      case 'html':
        language = 'html';
        break;
      case 'css':
        language = 'css';
        break;
      case 'js':
        language = 'javascript';
        break;
      case 'ts':
        language = 'typescript';
        break;
      case 'json':
        language = 'json';
        break;
      case 'md':
        language = 'markdown';
        break;
      case 'scss':
        language = 'scss';
        break;
      case 'less':
        language = 'less';
        break;
    }
    
    // 添加新文件
    const newFile: FileItem = {
      name: fileName.split('/').pop() || fileName,
      path: fileName,
      language,
      content: ''
    };
    
    this.files.push(newFile);
    
    // 更新文件夹结构
    if (this.folderExplorer) {
      // 更新文件夹浏览器的文件列表
      this.folderExplorer.setFiles(this.files, this.currentFileIndex);
      // 获取最新的文件夹结构
      this.folderStructure = this.folderExplorer.getFolderStructure();
    } else {
      // 如果文件夹浏览器还未初始化，使用内部方法
      this.folderStructure = this.buildFolderStructure(this.files);
    }
    
    // 切换到新文件
    this.switchFile(this.files.length - 1);
  }

  // 显示预览
  private showPreview(): void {
    const previewContainer = this.shadowRoot!.getElementById('preview-container');
    const previewFrame = this.shadowRoot!.getElementById('preview-frame') as HTMLIFrameElement;
    
    if (!previewContainer || !previewFrame) return;
    
    previewContainer.style.display = 'flex';
    this.previewFrame = previewFrame;
    
    // 准备HTML内容
    const htmlFile = this.files.find(f => f.path === 'index.html');
    if (htmlFile) {
      // 创建一个虚拟环境，在其中注入所有文件
      let htmlContent = htmlFile.content;
      
      // 替换CSS引用
      this.files.forEach(file => {
        if (file.language === 'css' || file.language === 'scss' || file.language === 'less') {
          const linkRegex = new RegExp(`<link[^>]*href=['"]${file.path}['"][^>]*>`, 'g');
          if (linkRegex.test(htmlContent)) {
            // 对于SCSS和LESS文件，这里应该有一个编译步骤
            // 由于这是一个简单的预览，我们暂时直接注入CSS
            htmlContent = htmlContent.replace(linkRegex, `<style>${file.content}</style>`);
          }
        }
      });
      
      // 替换JS引用
      this.files.forEach(file => {
        if (file.language === 'javascript' || file.language === 'typescript') {
          const scriptRegex = new RegExp(`<script[^>]*src=['"]${file.path}['"][^>]*></script>`, 'g');
          if (scriptRegex.test(htmlContent)) {
            // 对于TypeScript文件，这里应该有一个编译步骤
            // 由于这是一个简单的预览，我们暂时直接注入JavaScript
            htmlContent = htmlContent.replace(scriptRegex, `<script>${file.content}</script>`);
          }
        }
      });
      
      // 将内容写入iframe
      const frameDoc = previewFrame.contentDocument || previewFrame.contentWindow?.document;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(htmlContent);
        frameDoc.close();
      }
    }
  }

  // 隐藏预览
  private hidePreview(): void {
    const previewContainer = this.shadowRoot!.getElementById('preview-container');
    if (previewContainer) {
      previewContainer.style.display = 'none';
    }
  }

  // 设置文件夹浏览器
  private setupFolderExplorer(): void {
    const folderTreeContainer = this.shadowRoot!.getElementById('folder-tree');
    if (!folderTreeContainer) return;
    
    // 清空现有内容
    folderTreeContainer.innerHTML = '';
    
    // 创建并初始化文件夹浏览器实例
    this.folderExplorer = new FolderExplorer(folderTreeContainer);
    
    // 设置文件和回调
    setTimeout(() => {
      if (this.folderExplorer) {
        // 设置文件列表
        this.folderExplorer.setFiles(this.files, this.currentFileIndex);
        
        // 设置文件选择回调
        this.folderExplorer.setFileSelectCallback((index: number) => {
          this.switchFile(index);
        });
        
        // 设置新建文件回调
        this.folderExplorer.setNewFileCallback(() => {
          this.createNewFile();
        });
        
        // 获取文件夹结构
        this.folderStructure = this.folderExplorer.getFolderStructure();
      }
    }, 0);
  }

  // 构建文件夹结构
  private buildFolderStructure(files: FileItem[]): FolderItem {
    const root: FolderItem = {
      name: 'root',
      path: '',
      isFolder: true,
      children: []
    };

    // 处理文件，添加到适当的文件夹中
    files.forEach(file => {
      const pathParts = file.path.split('/');
      let currentFolder = root;

      // 处理文件夹路径
      for (let i = 0; i < pathParts.length - 1; i++) {
        const folderName = pathParts[i];
        const folderPath = pathParts.slice(0, i + 1).join('/');
        
        // 查找文件夹是否已存在
        let folder = currentFolder.children?.find(
          item => item.isFolder && item.name === folderName
        ) as FolderItem | undefined;

        // 如果文件夹不存在，创建它
        if (!folder) {
          folder = {
            name: folderName,
            path: folderPath,
            isFolder: true,
            children: [],
            parent: currentFolder
          };
          currentFolder.children?.push(folder);
        }
        
        currentFolder = folder;
      }

      // 将文件添加到最终的文件夹中
      const fileItem: FileItem & FolderItem = {
        ...file,
        isFolder: false,
        parent: currentFolder
      };
      currentFolder.children?.push(fileItem);
    });

    return root;
  }
}

// 注册自定义元素
customElements.define('code-editor', <CustomElementConstructor><unknown>CodeEditor);

export default CodeEditor;
