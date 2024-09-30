<template>
  <div class="ts-config" v-show="codeStore.useTs">
    <div class="ts-config-group">
      <div class="ts-config-title">{{ t('languageAndEnvironment') }}</div>
      <div class="setting-item">
        <div class="setting-panel__title">
          experimentalDecorators
        </div>
        <Radio type="switch" v-model="codeStore.tsConfig.experimentalDecorators"></Radio>
      </div>
      <div class="setting-item">
        <div class="setting-panel__title">
          emitDecoratorMetadata
        </div>
        <Radio type="switch" v-model="codeStore.tsConfig.emitDecoratorMetadata"></Radio>
      </div>
    </div>
    <div class="ts-config-group">
      <div class="ts-config-title">{{ t('compatibility') }}</div>
      <div class="setting-item">
        <div class="setting-panel__title">
          noImplicitAny
        </div>
        <Radio type="switch" v-model="codeStore.tsConfig.noImplicitAny"></Radio>
      </div>
      <div class="setting-item">
        <div class="setting-panel__title">
          noStrictGenericChecks
        </div>
        <Radio type="switch" v-model="codeStore.tsConfig.noStrictGenericChecks"></Radio>
      </div>
    </div>
  </div>
</template>

<script setup>
import Radio from '../base/Radio.vue';
import { t } from '@/lang/index.js';
import { useCodeStore } from '@/store/index.js';

const codeStore = useCodeStore();
</script>

<style lang="less" scoped>
.ts-config {
  padding: 10px;
  border-radius: 5px;
  background: rgba(0, 0, 0, 0.15);
  display: flex;
  column-gap: 30px;

  .ts-config-title {
    margin: 10px 0;
  }

  .ts-config-group {
    flex-basis: 50%;

    :deep(.setting-panel__title) {
      opacity: 0.8;
    }
  }
}
</style>