<template>
  <Tooltip :tips="t('setting')">
    <Icons type="setting" @click="modalShow = true"></Icons>
  </Tooltip>
  <Modal v-model:visible="modalShow">
    <div class="container dark">
      <Icons type="close" @click="modalShow=false"></Icons>
      <div class="title">{{ t('setting') }}</div>
      <div class="content">
        <Tabs v-model="currentTab" :tabs="settingTabs" type="line"></Tabs>
        <JsConfig v-show="currentTab === 'js'" />
        <CssConfig v-show="currentTab === 'css'" />
        <HtmlConfig v-show="currentTab === 'html'" />
        <PreferenceConfig v-show="currentTab === 'preference'" />
      </div>
    </div>
  </Modal>
</template>

<script setup>
import { computed, ref } from 'vue';
import { t } from '@/lang/index.js';
import Modal from './base/Modal.vue';
import Tabs from './base/Tabs.vue';
import Icons from './base/Icons.vue';
import Tooltip from './base/Tooltip.vue';
import CssConfig from './settings/CssConfig.vue';
import HtmlConfig from './settings/HtmlConfig.vue';
import JsConfig from './settings/JsConfig.vue';
import PreferenceConfig from './settings/PreferenceConfig.vue';

const modalShow = ref(false);
const settingTabs = computed(() => [
  { label: 'JavaScript', value: 'js', },
  { label: 'HTML', value: 'html', },
  { label: 'CSS', value: 'css', },
  { label: t('preference'), value: 'preference' },
]);
const currentTab = ref('js');
</script>

<style lang="less" scoped>
.codeicon-close {
  position: absolute;
  right: 5px;
  cursor: pointer;
}
.container {
  min-width: 400px;
  width: 760px;
  min-height: 250px;
  height: 60%;
  position: relative;
  background: rgb(49, 49, 61);
  z-index: 1;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-shadow: 1px 0 6px 1px #fff1;
  .title {
    font-size: 20px;
    margin-bottom: 10px;
  }
  .content {
    flex-grow: 1;
    display: flex;
    max-height: calc(100% - 40px);
  }
  :deep(.setting-panel) {
    flex-grow: 1;
    padding-left: 10px;
    max-height: 100%;
    overflow: hidden;
    overflow-y: auto;
    .setting-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      input {
        background: #1e1e1eaa;
        outline: none;
        border: none;
        line-height: 20px;
        text-align: right;
        padding: 2px 5px;
        caret-color: #fff;
        margin-right: 5px;
        border-radius: 4px;
        color: #fff;
      }
    }
    &::-webkit-scrollbar {
      background-color: #222;
      width: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: rgb(135, 151, 218);
      border-radius: 5px;
    }
    &__title {
      margin: 8px 0;
      &:not(:first-of-type) {
        margin-top: 15px;
      }
    }
    textarea {
      width: calc(100% - 20px);
      background: #222;
      border-radius: 4px;
      border: none;
      outline: none;
      color: #fff;
      resize: vertical;
      padding: 5px 10px;
    }
  }
}

@media screen and (max-width: 768px) {
  .container {
    width: 500px;
  }
}
</style>