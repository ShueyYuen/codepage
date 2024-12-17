const fs = require("fs");
const path = require("path");

module.exports = function (source) {
  // 使用正则匹配占位符
  return source.replace(/__HARD_INJECT__\((.*?)\)/g, (match, filePath) => {
    const absolutePath = path.resolve(this.rootContext, filePath.trim());
    this.addDependency(absolutePath);

    try {
      // 读取文件内容
      const fileContent = fs.readFileSync(absolutePath, "utf-8");
      return fileContent.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
    } catch (err) {
      this.emitError(`Failed to inject file: ${absolutePath}`);
      return `/* Error: Failed to inject ${filePath} */`;
    }
  });
};
