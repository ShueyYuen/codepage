// 文件夹树组件
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

class FolderExplorer {
  private folderStructure: FolderItem;
  private files: FileItem[];
  private currentFileIndex: number;
  private onFileSelect: (index: number) => void;
  private onNewFile: () => void;
  private container: HTMLElement;
  private folderTreeElement: HTMLElement | null = null;
  private newFileBtn: HTMLButtonElement | null = null;
  private styles: HTMLStyleElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.folderStructure = { name: 'root', path: '', isFolder: true, children: [] };
    this.files = [];
    this.currentFileIndex = 0;
    this.onFileSelect = () => { };
    this.onNewFile = () => { };
    this.styles = document.createElement('style');

    this.render();
    this.renderFolderTree();
    this.initEventListeners();
  }

  // 设置文件列表和当前文件索引
  setFiles(files: FileItem[], currentIndex: number): void {
    this.files = files;
    this.currentFileIndex = currentIndex;
    this.folderStructure = this.buildFolderStructure(files);
    this.renderFolderTree();
  }

  // 更新当前选中文件
  updateCurrentFile(index: number): void {
    this.currentFileIndex = index;
    this.renderFolderTree();
  }

  // 设置文件选择回调
  setFileSelectCallback(callback: (index: number) => void): void {
    this.onFileSelect = callback;
  }

  // 设置新建文件回调
  setNewFileCallback(callback: () => void): void {
    this.onNewFile = callback;
  }

  // 获取文件夹结构
  getFolderStructure(): FolderItem {
    return this.folderStructure;
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

  // 渲染组件
  private render(): void {
    this.styles.textContent = `
      .sidebar {
        width: 100%;
        height: 100%;
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
      
      .sidebar-controls {
        padding: 10px;
        border-bottom: 1px solid #3c3c3c;
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
    `;

    this.container.innerHTML = '';
    this.container.appendChild(this.styles);

    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar';

    const sidebarControls = document.createElement('div');
    sidebarControls.className = 'sidebar-controls';

    this.newFileBtn = document.createElement('button');
    this.newFileBtn.id = 'new-file-btn';
    this.newFileBtn.textContent = '新建文件';

    sidebarControls.appendChild(this.newFileBtn);

    const folderTree = document.createElement('div');
    folderTree.className = 'folder-tree';
    folderTree.id = 'folder-tree';
    this.folderTreeElement = folderTree;

    sidebar.appendChild(sidebarControls);
    sidebar.appendChild(folderTree);
    this.container.appendChild(sidebar);
  }

  // 渲染文件夹树
  private renderFolderTree(): void {
    if (!this.folderTreeElement) return;

    this.folderTreeElement.innerHTML = '';

    const renderItem = (item: FolderItem, container: HTMLElement): void => {
      if (item.isFolder && item.children) {
        // 如果是文件夹
        if (item.name !== 'root') {
          const folderItem = document.createElement('div');
          folderItem.className = 'folder-item';
          folderItem.innerHTML = `
            <span class="folder-icon">📁</span>
            ${item.name}
          `;
          container.appendChild(folderItem);

          const folderContent = document.createElement('div');
          folderContent.className = 'folder-content';
          container.appendChild(folderContent);

          item.children.forEach(child => renderItem(child as FolderItem, folderContent));
        } else {
          // 根文件夹直接渲染其子项
          item.children.forEach(child => renderItem(child as FolderItem, container));
        }
      } else {
        // 如果是文件
        const fileItem = document.createElement('div');
        fileItem.className = `file-item ${this.files.findIndex(f => f.path === item.path) === this.currentFileIndex ? 'active' : ''}`;
        fileItem.innerHTML = `
          <span class="file-icon">📄</span>
          ${item.name}
        `;

        fileItem.addEventListener('click', () => {
          const fileIndex = this.files.findIndex(f => f.path === item.path);
          if (fileIndex !== -1) {
            this.onFileSelect(fileIndex);
          }
        });

        container.appendChild(fileItem);
      }
    };

    renderItem(this.folderStructure, this.folderTreeElement);
  }

  // 添加事件监听器
  private initEventListeners(): void {
    // 新建文件按钮
    this.newFileBtn?.addEventListener('click', () => this.onNewFile());
  }
}

export default FolderExplorer;
