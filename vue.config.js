const { defineConfig } = require("@vue/cli-service");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = defineConfig({
  publicPath: "./",
  terser: {
    minify: 'swc',
  },
  configureWebpack: {
    cache: { type: "filesystem" },
    plugins: [new MonacoWebpackPlugin({
      languages: ['typescript', 'css', 'less', 'scss', 'html', 'javascript'],
      globalAPI: true,
    })],
  },
});