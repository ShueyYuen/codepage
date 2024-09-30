<template>
  <div class="setting-panel">
    <div class="setting-item">
      <div class="setting-panel__title">
        {{ t('ts') }}
      </div>
      <Radio type="switch" v-model="codeStore.useTs"></Radio>
    </div>
    <div class="setting-panel__title">Javascript CDN</div>
    <ItemsInput v-model="codeStore.jsLinks" placeholder="CDN link" />
  </div>
</template>

<script setup>
import Radio from '../base/Radio.vue';
import ItemsInput from '../base/ItemsInput.vue';
import { t } from '@/lang/index.js';
import { useCodeStore } from '@/store/index.js';

const codeStore = useCodeStore();
</script>
