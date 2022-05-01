<template>
<router-link :to="shareUrl" replace @click="handleClick(shareUrl)">
  <i class="codeicon codeicon-share"/>
</router-link>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useClipboard, useWebNotification } from '@vueuse/core';
import { useCodeStore } from '@/store/modules/code.js';
import { b64EncodeUnicode } from '../utils/tool.js';
import { useRoute } from 'vue-router';

const codeStore = useCodeStore();

const route = useRoute();
const handleClick = (path) => {
  const source = ref(`${window.location.origin}/?code=${path.query.code}`);
  const { text, copy, copied } = useClipboard({ source });
  copy();
  const { show, close } = useWebNotification({
    title: `Share url copied!`,
    body: source.value,
    dir: 'auto',
    lang: 'en',
    renotify: true,
    tag: 'test',
  });
  show();
  setTimeout(close, 3000);
};

const shareUrl = computed(() => {
  return { path: '/',query: {
    code: b64EncodeUnicode(JSON.stringify({
      css: codeStore.css,
      html: codeStore.html,
      js: codeStore.js,
    })) }};
});
</script>

<style lang="less" scoped>
.codeicon {
  line-height: 26px;
  font-size: 16px;
  color: #fff;
}
a {
  cursor: pointer;
  height: 26px;
  padding: 0 10px;
  background: #1e1e1e;
  text-decoration: none;
}
</style>
