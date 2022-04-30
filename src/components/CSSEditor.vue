<template>
  <div id="css-editor" class="editor"></div>
</template>

<script setup>
import * as monaco from 'monaco-editor';
import { onMounted } from 'vue';
import { useCodeStore } from '@/store/modules/code.js';
import { emmetCSS } from "emmet-monaco-es";

let editor = null;
const codeStore = useCodeStore();

onMounted(() => {
  emmetCSS(monaco);
  editor = monaco.editor.create(document.getElementById('css-editor'), {
    value: '',//编辑器初始显示文字
    language:'css',//语言支持自行查阅demo
    automaticLayout: true,//自动布局
    theme:'vs-dark' //官方自带三种主题vs, hc-black, or vs-dark
  });
  editor.onDidChangeModelContent(() => {
    codeStore.setCSS(editor.getValue());
  })
})
</script>