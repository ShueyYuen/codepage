<template>
  <div class="setting-panel">
    <div class="setting-item">
      <div class="setting-panel__title">
        {{ t('gzip') }}
        <Tooltip :tips="t('gzipInfo')" position="right" :multiline="true" transform="10">
          <Icons type="info-circle"></Icons>
        </Tooltip>
      </div>
      <Radio type="switch" v-model="preferStore.gzip"></Radio>
    </div>
    <div class="setting-item">
      <div class="setting-panel__title">
        {{ t('onlineSave') }}
      </div>
      <Radio type="switch" v-model="preferStore.online"></Radio>
    </div>

    <div class="setting-item">
      <div class="setting-panel__title">
        Console
        <Tooltip :tips="t('consoleInfo')" position="right" :multiline="true" transform="10">
          <Icons type="info-circle"></Icons>
        </Tooltip>
      </div>
      <Radio type="switch" v-model="preferStore.console"></Radio>
    </div>
    <div class="setting-item">
      <div class="setting-panel__title">{{ t('language') }}</div>
      <Dropdown v-model="preferStore.language" style="width: 120px;" :options="languageOptions" />
    </div>
    <div class="setting-item">
      <div class="setting-panel__title">{{ t('debounce') }}</div>
      <div>
        <input style="width: 85px;" v-model="preferStore.debounce" />
        <span>ms</span>
      </div>
    </div>
    <div class="setting-panel__title">{{ t('operation') }}</div>
    <div class="operation_wrapper">
      <Radio v-model="preferStore.operation.theme" type="round">
        <Icons type="dark"></Icons>
      </Radio>
      <Radio v-model="preferStore.operation.download" type="round">
        <Icons type="download"></Icons>
      </Radio>
      <Radio v-model="preferStore.operation.fullscreen" type="round">
        <Icons type="compress"></Icons>
      </Radio>
      <Radio v-model="preferStore.operation.github" type="round">
        <Icons type="github"></Icons>
      </Radio>
      <Radio v-model="preferStore.operation.share" type="round">
        <Icons type="share"></Icons>
      </Radio>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue';
import i18n, { t } from '@/lang/index.js';
import Dropdown from '../base/Dropdown.vue';
import Tooltip from '../base/Tooltip.vue';
import Radio from '../base/Radio.vue';
import Icons from '../base/Icons.vue';

import { usePreferStore } from '@/store/index.js';

const preferStore = usePreferStore();

const languageOptions = [
  { value: '', label: 'With system' },
  { value: 'cn', label: '中文' },
  { value: 'en', label: 'English' },
];

watch(() => preferStore.language, () => {
  i18n.global.locale = preferStore.language || i18n.global.fallbackLocale;
}, { immediate: true });
</script>

<style lang="less" scoped>
.operation_wrapper {
  display: flex;
  justify-content: space-around;
}
</style>