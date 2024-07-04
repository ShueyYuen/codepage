import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from "path";
import { visualizer } from 'rollup-plugin-visualizer';

import monacoEditorPlugin from "vite-plugin-monaco-editor";

const prefix = `monaco-editor/esm/vs`

export default defineConfig({
  base: "./",
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src")
    }
  },
  plugins: [
    vue(),
    monacoEditorPlugin({
      languageWorkers: ['json', 'css', 'html', 'typescript'],
    }),
    visualizer(),
  ],
  build:{
    minify: 'terser',
    terserOptions: {
      toplevel: true,
      ecma: 2015,
      compress: {
        ecma: 2015,
        passes: 3,
        drop_console: true,
        drop_debugger: true
      }
    },
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          'monaco-editor': ['monaco-editor']
        }
      }
    },
  },
  optimizeDeps: {
    include: [
      `${prefix}/language/json/json.worker`,
      `${prefix}/language/css/css.worker`,
      `${prefix}/language/html/html.worker`,
      `${prefix}/language/typescript/ts.worker`,
      `${prefix}/editor/editor.worker`
    ]
  }
});
