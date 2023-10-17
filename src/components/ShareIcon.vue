<template>
<router-link :to="shareUrl" replace @click="handleClick(shareUrl)">
  <Icons type="share" />
</router-link>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { useClipboard, useWebNotification } from '@vueuse/core';
import { useCodeStore, usePreferStore } from '@/store/index.js';

import { compress, arrayToBase64String, b64EncodeUnicode } from '../utils/tool.js';
import Icons from '@/components/base/Icons.vue';

const codeStore = useCodeStore();
const preferStore = usePreferStore();

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

const shareUrl = ref({
  path: '/',
  query: {
    code: '',
    gzip: 0,
  }
});

watchEffect(() => {
  const share = JSON.stringify(codeStore.config);
  if (preferStore.gzip) {
    compress(share).then(res => {
      shareUrl.value.query.code = arrayToBase64String(res);
    });
  } else {
    shareUrl.value.query.code = b64EncodeUnicode(share);
  }
  shareUrl.value.query.code = encodeURIComponent(shareUrl.value.query.code);
  shareUrl.value.query.gzip = +preferStore.gzip;
});
</script>
