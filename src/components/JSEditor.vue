<template>
  <div id="js-editor" class="editor"></div>
</template>

<script setup>
import * as monaco from 'monaco-editor';
import { onMounted } from 'vue';
import { useCodeStore } from '@/store/modules/code.js';

let editor = null;
const codeStore = useCodeStore();

onMounted(() => {
  editor = monaco.editor.create(document.getElementById('js-editor'), {
    value: codeStore.js,//编辑器初始显示文字
    language:'javascript',//语言支持自行查阅demo
    automaticLayout: true,//自动布局
    theme:'vs-dark' //官方自带三种主题vs, hc-black, or vs-dark
  });
  editor.onDidChangeModelContent(() => {
    codeStore.setJS(editor.getValue());
  })
})
</script>