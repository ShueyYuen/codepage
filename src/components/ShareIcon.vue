<template>
<router-link :to="shareUrl" replace @click="handleClick">
  <Icons type="share" />
</router-link>
</template>

<script setup>
import { ref, watchEffect, computed } from 'vue';
import { useClipboard, useWebNotification } from '@vueuse/core';
import { useCodeStore, usePreferStore } from '@/store/index.js';

import { compress, arrayToBase64String, b64EncodeUnicode } from '../utils/tool.js';
import Icons from '@/components/base/Icons.vue';

import https from '../utils/http'

const codeStore = useCodeStore();
const preferStore = usePreferStore();

const shareUrl = ref({
  path: '/',
  query: {
    code: '',
    gzip: 0,
  }
});

const link = computed(() => `${window.location.origin}/?code=${shareUrl.value.query.code}&gzip=${shareUrl.value.query.gzip}`)

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

const handleClick = (path) => {
  (preferStore.online ? https.post('/code/save', {
    code: b64EncodeUnicode(JSON.stringify(codeStore.config)),
  }).then((res) => `${window.location.origin}/?online=${res.data.id}`) : Promise.resolve(link.value)).then((link) => {
    const { text, copy, copied } = useClipboard({ source: link });
    copy();
    const { show, close } = useWebNotification({
      title: `Share url copied!`,
      body: link,
      dir: 'auto',
      lang: 'en',
      renotify: true,
      tag: 'test',
    });
    show();
    setTimeout(close, 3000);
  })
};
</script>
