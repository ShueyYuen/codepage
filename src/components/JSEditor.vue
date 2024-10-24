<template>
  <div id="js-editor" class="editor"></div>
</template>

<script setup>
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { onMounted, onUnmounted, watch } from 'vue';
import { useCodeStore, usePreferStore } from '@/store/index.js';
import bus from '@/utils/bus.js';

let editor = null;
const codeStore = useCodeStore();

const compilerOptions = {
  "target": "es6",
  "strict": true,
  "jsx": "preserve",
  "moduleResolution": "node",
  "esModuleInterop": true
};
watch(
  () => [codeStore.useTs, codeStore.tsConfig],
  ([useTs, tsConfig]) => {
    Object.assign(compilerOptions, tsConfig);
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
      Object.assign(
        monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
        compilerOptions
      )
    );
    editor && monaco.editor.setModelLanguage(editor.getModel(), useTs ? 'typescript' : 'javascript')
  },
  { deep: true, immediate: true }
);

const preferStore = usePreferStore();
watch(() => preferStore.theme, () =>
  editor.updateOptions({
    theme: preferStore.editorTheme,
  })
);

onMounted(() => {
  editor = monaco.editor.create(document.getElementById('js-editor'), {
    value: codeStore.js,//编辑器初始显示文字
    language: codeStore.useTs ? 'typescript' : 'javascript',//语言支持自行查阅demo
    automaticLayout: true,//自动布局
    theme: preferStore.editorTheme,
    readOnly: preferStore.readonly,
  });
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => bus.emit('hard-refresh'));
  editor.onDidChangeModelContent(() => codeStore.setJS(editor.getValue()));
});

onUnmounted(() => editor.dispose());
</script>