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

// 右键菜单项接口
interface MenuItem {
  label: string;
  action: (item: FolderItem | FileItem) => void;
  icon?: string;
}

class FolderExplorer {
  private folderStructure: FolderItem;
  private files: FileItem[];
  private currentFileIndex: number;
  private onFileSelect: (index: number) => void;
  private onNewFile: () => void;
  private onDeleteFile: ((path: string) => void) | null = null;
  private onRenameFile: ((oldPath: string, newName: string) => void) | null = null;
  private onMoveFile: ((sourcePath: string, targetPath: string) => void) | null = null;
  private container: HTMLElement;
  private folderTreeElement: HTMLElement | null = null;
  private newFileBtn: HTMLButtonElement | null = null;
  private styles: HTMLStyleElement;
  private contextMenu: HTMLElement | null = null;
  private draggedItem: HTMLElement | null = null;
  private draggedItemPath: string = '';
  private dropTarget: HTMLElement | null = null;

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

  // 设置删除文件回调
  setDeleteFileCallback(callback: (path: string) => void): void {
    this.onDeleteFile = callback;
  }

  // 设置重命名文件回调
  setRenameFileCallback(callback: (oldPath: string, newName: string) => void): void {
    this.onRenameFile = callback;
  }

  // 设置移动文件回调
  setMoveFileCallback(callback: (sourcePath: string, targetPath: string) => void): void {
    this.onMoveFile = callback;
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
        width: 200px;
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
        user-select: none;
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
      
      .context-menu {
        position: absolute;
        background: #252526;
        border: 1px solid #3c3c3c;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
        padding: 5px 0;
        z-index: 1000;
        border-radius: 3px;
      }
      
      .context-menu-item {
        padding: 6px 15px;
        cursor: pointer;
        display: flex;
        align-items: center;
      }
      
      .context-menu-item:hover {
        background-color: #2a2d2e;
      }
      
      .context-menu-icon {
        margin-right: 8px;
        width: 16px;
        text-align: center;
      }
      
      .dragover {
        background-color: #264f78 !important;
        border: 1px dashed #0e639c;
      }
      
      .dragging {
        opacity: 0.5;
      }
      
      .rename-input {
        background: #3c3c3c;
        color: #e7e7e7;
        border: none;
        padding: 2px 4px;
        width: calc(100% - 25px);
        margin-left: 21px;
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
          folderItem.dataset.path = item.path;
          folderItem.dataset.type = 'folder';
          folderItem.draggable = true;
          folderItem.innerHTML = `
            <span class="folder-icon">📁</span>
            ${item.name}
          `;

          // 添加拖拽事件
          this.addDragListeners(folderItem, item);
          
          // 添加右键菜单
          this.addContextMenuListener(folderItem, item);

          container.appendChild(folderItem);

          const folderContent = document.createElement('div');
          folderContent.className = 'folder-content';
          folderContent.dataset.parentPath = item.path;
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
        fileItem.dataset.path = item.path;
        fileItem.dataset.type = 'file';
        fileItem.draggable = true;
        fileItem.innerHTML = `
          <span class="file-icon">📄</span>
          ${item.name}
        `;

        // 添加文件点击事件
        fileItem.addEventListener('click', () => {
          const fileIndex = this.files.findIndex(f => f.path === item.path);
          if (fileIndex !== -1) {
            this.onFileSelect(fileIndex);
          }
        });

        // 添加拖拽事件
        this.addDragListeners(fileItem, item);
        
        // 添加右键菜单
        this.addContextMenuListener(fileItem, item);

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

  // 添加拖拽事件监听
  private addDragListeners(itemElement: HTMLElement, item: FolderItem | FileItem): void {
    itemElement.addEventListener('dragstart', (e) => {
      e.dataTransfer?.setData('text/plain', item.path);
      this.draggedItem = itemElement;
      setTimeout(() => {
        itemElement.classList.add('dragging');
      }, 0);
    });

    itemElement.addEventListener('dragend', () => {
      itemElement.classList.remove('dragging');
      this.draggedItem = null;
    });

    itemElement.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (itemElement !== this.draggedItem) {
        itemElement.classList.add('dragover');
      }
    });

    itemElement.addEventListener('dragleave', () => {
      itemElement.classList.remove('dragover');
    });

    itemElement.addEventListener('drop', (e) => {
      e.preventDefault();
      const sourcePath = this.draggedItem?.dataset.path;
      const targetPath = itemElement.dataset.path;

      if (sourcePath && targetPath && this.onMoveFile) {
        this.onMoveFile(sourcePath, targetPath);
      }

      itemElement.classList.remove('dragover');
    });
  }

  // 添加右键菜单监听
  private addContextMenuListener(itemElement: HTMLElement, item: FolderItem | FileItem): void {
    itemElement.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.showContextMenu(e.clientX, e.clientY, item);
    });
  }

  // 显示右键菜单
  private showContextMenu(x: number, y: number, item: FolderItem | FileItem): void {
    if (!this.contextMenu) return;

    this.contextMenu.innerHTML = '';

    // 添加重命名菜单项
    const renameItem = document.createElement('div');
    renameItem.className = 'context-menu-item';
    renameItem.innerHTML = `
      <span class="context-menu-icon">✏️</span>
      重命名
    `;
    renameItem.addEventListener('click', () => {
      this.renameItem(item);
    });
    this.contextMenu.appendChild(renameItem);

    // 添加删除菜单项
    const deleteItem = document.createElement('div');
    deleteItem.className = 'context-menu-item';
    deleteItem.innerHTML = `
      <span class="context-menu-icon">🗑️</span>
      删除
    `;
    deleteItem.addEventListener('click', () => {
      this.deleteItem(item);
    });
    this.contextMenu.appendChild(deleteItem);

    // 添加移动菜单项
    const moveItem = document.createElement('div');
    moveItem.className = 'context-menu-item';
    moveItem.innerHTML = `
      <span class="context-menu-icon">📦</span>
      移动
    `;
    moveItem.addEventListener('click', () => {
      this.moveItem(item);
    });
    this.contextMenu.appendChild(moveItem);

    this.contextMenu.style.left = `${x}px`;
    this.contextMenu.style.top = `${y}px`;
    this.contextMenu.classList.add('visible');
  }

  // 重命名文件或文件夹
  private renameItem(item: FolderItem | FileItem): void {
    const newName = prompt('输入新名称', item.name);
    if (newName && this.onRenameFile) {
      this.onRenameFile(item.path, newName);
    }
  }

  // 删除文件或文件夹
  private deleteItem(item: FolderItem | FileItem): void {
    if (confirm('确定要删除吗？') && this.onDeleteFile) {
      this.onDeleteFile(item.path);
    }
  }

  // 移动文件或文件夹
  private moveItem(item: FolderItem | FileItem): void {
    const targetPath = prompt('输入目标路径', item.path);
    if (targetPath && this.onMoveFile) {
      this.onMoveFile(item.path, targetPath);
    }
  }
}

export default FolderExplorer;
