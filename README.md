# 在线项目预览编辑器

这是一个基于 Monaco Editor 和 Web Components 构建的在线项目预览编辑器。它允许用户创建和编辑多种类型的文件（HTML、CSS、JavaScript、TypeScript、SCSS、LESS），并实时预览结果。

## 功能特点

- 支持多种文件类型：HTML、CSS、JavaScript、TypeScript、SCSS、LESS
- 使用 Monaco Editor 提供强大的代码编辑功能
- 实时项目预览
- 文件管理：创建、编辑和删除文件
- 使用原生 Web Components 而非第三方框架
- 内置标签系统便于在多个文件之间切换

## 如何使用

1. 克隆或下载此仓库
2. 安装依赖：
```bash
npm install
```
3. 运行以下命令启动开发服务器：
```bash
npm run dev
```
4. 或者构建项目并启动生产服务器：
```bash
npm run build
npm start
```
5. 在浏览器中访问 `http://localhost:3000/` 即可开始使用

## 项目结构

- `public/index.html`：应用程序入口点
- `public/code-editor.js`：主要的代码编辑器组件
- `public/404.html`：404页面
- `src/server.ts`：TypeScript编写的Node.js服务器

## 如何操作

1. 编辑文件：点击左侧文件树或顶部标签页切换文件
2. 新建文件：点击左侧面板"新建文件"按钮
3. 删除文件：点击标签页中的"×"按钮（注意：index.html不可删除）
4. 预览项目：点击顶部导航栏的"运行预览"按钮或侧边栏的"显示预览"按钮

## roadmap

- [ ] 添加更多文件类型支持
- [ ] 实现项目保存和加载功能
- [ ] 集成更多Monaco编辑器功能，如格式化、调试等
- [ ] 添加终端模拟器
- [ ] 实现协作编辑功能

## 技术栈

- **Monaco Editor**：为代码编辑提供了强大的功能
- **Web Components**：使用原生的Web组件化技术，不依赖第三方框架
- **TypeScript**：使用TypeScript进行类型安全的开发
- **Node.js**：提供简单的HTTP服务器
- **Webpack**：用于打包和构建前端资源
