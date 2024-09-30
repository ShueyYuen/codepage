<template>
  <div class="setting-panel">
    <div class="setting-panel__title">{{ t('stuffHead') }}</div>
    <textarea rows="10" v-model="codeStore.head" placeholder="such as: meta, link" />
  </div>
</template>

<script setup>
import { t } from '@/lang/index.js';
import { useCodeStore } from '@/store/index.js';

const codeStore = useCodeStore();
</script>