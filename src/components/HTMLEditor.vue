<template>
  <div id="html-editor" class="editor"></div>
</template>

<script setup>
import * as monaco from 'monaco-editor';
import { onMounted, onUnmounted } from 'vue';
import { useCodeStore } from '@/store/modules/code.js';
import { emmetHTML } from "emmet-monaco-es";

let editor = null;
const codeStore = useCodeStore();

onMounted(() => {
  emmetHTML(monaco);
  editor = monaco.editor.create(document.getElementById('html-editor'), {
    value: codeStore.html,//编辑器初始显示文字
    language:'html',//语言支持自行查阅demo
    automaticLayout: true,//自动布局
    theme:'vs-dark' //官方自带三种主题vs, hc-black, or vs-dark
  });
  editor.onDidChangeModelContent(() => {
    codeStore.setHTML(editor.getValue());
  })
});

onUnmounted(() => {
  editor.dispose();
});
</script>