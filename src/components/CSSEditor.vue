<template>
  <div id="css-editor" class="editor"></div>
</template>

<script setup>
import * as monaco from 'monaco-editor';
import { onMounted, watch, onUnmounted } from 'vue';
import { useCodeStore } from '@/store/modules/code.js';
import { emmetCSS } from "emmet-monaco-es";

const codeStore = useCodeStore();
emmetCSS(monaco);

let editor = null;

watch(() => codeStore.cssPre, () => {
  editor.updateOptions({
    language: codeStore.cssPre || 'css',
  });
});

onMounted(() => {
  editor = monaco.editor.create(document.getElementById('css-editor'), {
    value: codeStore.css,//编辑器初始显示文字
    language: codeStore.cssPre || 'css',//语言支持自行查阅demo
    automaticLayout: true,//自动布局
    theme:'vs-dark' //官方自带三种主题vs, hc-black, or vs-dark
  });
  editor.onDidChangeModelContent(() => {
    codeStore.setCSS(editor.getValue());
  });
});

onUnmounted(() => {
  editor.dispose();
});
</script>