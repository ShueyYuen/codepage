<template>
<Tabs v-model="currentTab" :tabs="tabs" :cling="showResult">
  <template #operation>
    <div class="operation-group">
      <Radio v-model="showResult" :disabled="!currentTab">{{ t('result') }}</Radio>
      <SettingModel></SettingModel>
      <Tooltip :tips="t('refresh')">
        <Icons type="refresh" @click="bus.emit('hard-refresh')"></Icons>
      </Tooltip>
      <Tooltip :tips="t(preferStore.theme)">
        <Icons :type="preferStore.theme" @click="preferStore.switchTheme()"></Icons>
      </Tooltip>
      <Tooltip :tips="t('download')">
        <a download="index.html"
          :href="`data:text/plain;charset=utf-8,${encodeURIComponent(content)}`">
          <Icons type="download"></Icons>
        </a>
      </Tooltip>
      <Tooltip :tips="t(isFullscreen ? 'compress' : 'expand')">
        <Icons v-if="isSupported" @click="toggle"
          :type="isFullscreen ? 'compress' : 'expand'" />
      </Tooltip>
      <Tooltip :tips="t('github')">
        <a href="https://github.com/ShueyYuen/codepage" target="_blank">
          <Icons type="github"></Icons>
        </a>
      </Tooltip>
      <Tooltip :tips="t('share')">
        <ShareIcon></ShareIcon>
      </Tooltip>
    </div>
  </template>
</Tabs>
<splitpanes @resize="editorSize = $event[0].size">
  <pane min-size="20" :class="{ collapse: !currentTab || !showResult }" :size="editorDisplaySize">
    <keep-alive>
      <component :is="componentName"></component>
    </keep-alive>
  </pane>
  <pane min-size="20" :size="100 - editorDisplaySize">
    <RenderIframe></RenderIframe>
  </pane>
</splitpanes>
</template>

<script setup>
import { computed, ref } from 'vue';
import Tabs from '@/components/base/Tabs.vue';
import Icons from '@/components/base/Icons.vue';
import RenderIframe from '@/components/RenderIframe.js';
import Radio from '@/components/base/Radio.vue';
import { t } from '@/lang/index.js';
import bus from '@/utils/bus.js';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import ShareIcon from '@/components/ShareIcon.vue';
import { UnicodeDecodeB64 } from '@/utils/tool.js';
import { useCodeStore, usePreferStore } from '@/store/index.js';
import SettingModel from '../components/SettingModel.vue';
import content from '@/components/result.js';
import Tooltip from '../components/base/Tooltip.vue';
import CSSEditor from '@/components/CSSEditor.vue';
import HTMLEditor from '@/components/HTMLEditor.vue';
import JSEditor from '@/components/JSEditor.vue';

import { useFullscreen } from '@vueuse/core';
const { isSupported, isFullscreen, enter, exit, toggle } = useFullscreen(document.body);

const componentMap = {
  js: JSEditor,
  html: HTMLEditor,
  css: CSSEditor,
}
const cssMap = {
  '': 'CSS',
  scss: 'SCSS',
  less: 'LESS',
}
const searchParams = new URLSearchParams(window.location.search);
const codeStore = useCodeStore();
const loadCode = JSON.parse(
  UnicodeDecodeB64(searchParams.get('code') ?? '') || '{}');
codeStore.setDefault(loadCode);
const preferStore = usePreferStore();
const theme = searchParams.get('theme') ?? 'dark';
preferStore.setTheme(theme);

const showTab = searchParams.get('tab') ?? 'result';
const showResult = ref(showTab === 'result');
const currentTab = ref(showTab === 'result' ? '' : showTab);
const editorSize = ref(50);
const editorDisplaySize = computed(() =>
  showResult.value ? currentTab.value ? editorSize.value : 0 : 100);
const tabs = computed(() => [
  { label: 'JavaScript', value: 'js', },
  { label: 'HTML', value: 'html', },
  { label: cssMap[codeStore.cssPre], value: 'css', },
  { value: 'gap' }, { slot: 'operation' },
]);
const componentName = computed(() => componentMap[currentTab.value]);
</script>

<style lang="less" scoped>
.app-container {
  width: 100%;
  height: 100%;
}
.content {
  flex-grow: 1;
  display: flex;
  position: relative;
}
.collapse+:deep(.splitpanes__splitter) {
  display: none;
}
:deep(.splitpanes__splitter) {
  min-width: 5px;
  background: rgb(201, 201, 201);
  margin-left: -1px;
  position: relative;
  transition: all .4s ease;
  &::after,
  &::before {
    content: '';
    position: absolute;
    background: #3f62c2;
    height: 50px;
    top: 50%;
    transform: translateY(-50%);
    right: 1px;
    width: 1px;
    transition: all .4s ease;
  }
  &::before {
    left: 1px;
  }
  &:hover {
    background: #3f62c2;
    &::after,
    &::before {
      background: #fff;
    }
  }
}
.operation-group {
  background: var(--background);
  height: 26px;
  display: flex;
  cursor: pointer;
  box-sizing: border-box;
}
</style>