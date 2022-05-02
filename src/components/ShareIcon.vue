<template>
<router-link :to="shareUrl" replace @click="handleClick(shareUrl)">
  <Icons type="share" />
</router-link>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useClipboard, useWebNotification } from '@vueuse/core';
import { useCodeStore } from '@/store/modules/code.js';
import { b64EncodeUnicode } from '../utils/tool.js';
import { useRoute } from 'vue-router';
import Icons from '@/components/base/Icons.vue';

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
      head: codeStore.head,
      jses: codeStore.jsLinks,
      csses: codeStore.cssLinks,
      pre: codeStore.cssPre,
    })) }};
});
</script>
