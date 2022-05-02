<template>
  <div id="html-editor" class="editor"></div>
</template>

<script setup>
import * as monaco from 'monaco-editor';
import { onMounted, onUnmounted, watch } from 'vue';
import { useCodeStore, usePreferStore } from '@/store/index.js';
import { emmetHTML } from "emmet-monaco-es";

let editor = null;
const codeStore = useCodeStore();

const preferStore = usePreferStore();
watch(() => preferStore.theme, () => {
  editor.updateOptions({
    theme: preferStore.editorTheme,
  });
});

onMounted(() => {
  emmetHTML(monaco);
  editor = monaco.editor.create(document.getElementById('html-editor'), {
    value: codeStore.html,//编辑器初始显示文字
    language:'html',//语言支持自行查阅demo
    automaticLayout: true,//自动布局
    theme: preferStore.editorTheme,
  });
  editor.onDidChangeModelContent(() => {
    codeStore.setHTML(editor.getValue());
  })
});

onUnmounted(() => {
  editor.dispose();
});
</script>