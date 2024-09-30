<template>
  <div class="setting-panel">
    <div class="setting-panel__title">{{ t('cssPreprocessor') }}</div>
    <Dropdown v-model="codeStore.cssPre" :options="cssOptions" />
    <div class="setting-panel__title">CSS CDN</div>
    <ItemsInput v-model="codeStore.cssLinks" placeholder="CSS CDN link" />
  </div>
</template>

<script setup>
import ItemsInput from '../base/ItemsInput.vue';
import Dropdown from '../base/Dropdown.vue';
import { t } from '@/lang/index.js';
import { useCodeStore } from '@/store/index.js';

const codeStore = useCodeStore();

const cssOptions = [
  { value: '', label: 'None' },
  { value: 'scss', label: 'SCSS' },
  { value: 'less', label: 'LESS' },
];
</script>