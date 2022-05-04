<template>
  <div id="css-editor" class="editor"></div>
</template>

<script setup>
import * as monaco from 'monaco-editor';
import { onMounted, watch, onUnmounted } from 'vue';
import { useCodeStore, usePreferStore } from '@/store/index.js';
import { emmetCSS } from "emmet-monaco-es";

emmetCSS(monaco);
let editor = null;

const codeStore = useCodeStore();
watch(() => codeStore.cssPre, () => {
  monaco.editor.setModelLanguage(editor.getModel(), codeStore.cssPre || 'css');
});

const preferStore = usePreferStore();
watch(() => preferStore.theme, () => {
  editor.updateOptions({
    theme: preferStore.editorTheme,
  });
});

onMounted(() => {
  editor = monaco.editor.create(document.getElementById('css-editor'), {
    value: codeStore.css,//编辑器初始显示文字
    language: codeStore.cssPre || 'css',//语言支持自行查阅demo
    automaticLayout: true,//自动布局
    theme: preferStore.editorTheme,
    readOnly: preferStore.readonly,
  });
  editor.onDidChangeModelContent(() => {
    codeStore.setCSS(editor.getValue());
  });
});

onUnmounted(() => {
  editor.dispose();
});
</script>