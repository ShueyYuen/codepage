<template>
<router-link :to="shareUrl" replace @click="handleClick(shareUrl)">
  <Icons type="share" />
</router-link>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useClipboard, useWebNotification } from '@vueuse/core';
import { useCodeStore } from '@/store/modules/code.js';
import { b64EncodeUnicode, compress, arrayToBase64String, decompress } from '../utils/tool.js';
import Icons from '@/components/base/Icons.vue';

const codeStore = useCodeStore();

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
  const share = JSON.stringify(codeStore.config);
  // console.log(share, b64EncodeUnicode(share).length);
  // compress(share).then(res => {
  //   console.log('result', res,  arrayToBase64String(res), arrayToBase64String(res).length);
  //   console.log('decompress:', decompress(res).then(v => {
  //     // console.log(v);
  //   }));
  // });
  return { path: '/',query: {
    code: b64EncodeUnicode(share),
  }};
});
</script>
