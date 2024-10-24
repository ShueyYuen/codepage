const { defineConfig } = require("@vue/cli-service");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = defineConfig({
  publicPath: "./",
  terser: {
    minify: "swc",
  },
  configureWebpack: {
    cache: { type: "filesystem" },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ["less-loader"],
        },
        {
          test: /\.ttf$/,
          type: "asset/resource",
        },
      ],
    },
    plugins: [
      new MonacoWebpackPlugin({
        publicPath: "/",
        languages: ["typescript", "css", "less", "scss", "html", "javascript"],
        globalAPI: true,
      }),
    ],
  },
});