<template>
<Tooltip :tips="t('setting')">
  <Icons type="setting"  @click="modalShow = true"></Icons>
</Tooltip>
<Modal v-model:visible="modalShow">
  <div class="container dark">
    <Icons type="close"  @click="modalShow=false"></Icons>
    <div class="title">{{ t('setting') }}</div>
    <div class="content">
      <Tabs v-model="currentTab" :tabs="settingTabs" type="line"></Tabs>
      <div class="setting-panel" v-show="currentTab === 'js'">
        <div class="setting-panel__title">Javascript CDN</div>
        <ItemsInput v-model="codeStore.jsLinks" placeholder="CDN link" />
      </div>
      <div class="setting-panel" v-show="currentTab === 'css'">
        <div class="setting-panel__title">CSS Preprocessor</div>
        <Dropdown v-model="codeStore.cssPre" :options="cssOptions"/>
        <div class="setting-panel__title">CSS CDN</div>
        <ItemsInput v-model="codeStore.cssLinks" placeholder="CSS CDN link" />
      </div>
      <div class="setting-panel" v-show="currentTab === 'html'">
        <div class="setting-panel__title">Stuff to &lt;head&gt;</div>
        <textarea rows="10" v-model="codeStore.head" placeholder="such as: meta, link"/>
      </div>
    </div>
  </div>
</Modal>
</template>

<script setup>
import { ref } from 'vue';
import { t } from '@/lang/index.js';
import Modal from './base/Modal.vue';
import Tabs from './base/Tabs.vue';
import Icons from './base/Icons.vue';
import ItemsInput from './base/ItemsInput.vue';
import Dropdown from './base/Dropdown.vue';
import Tooltip from './base/Tooltip.vue';
import { useCodeStore } from '@/store/modules/code.js';

const codeStore = useCodeStore();
const modalShow = ref(false);
const settingTabs = ref([
  { label: 'JavaScript', value: 'js', },
  { label: 'HTML', value: 'html', },
  { label: 'CSS', value: 'css', },
]);
const currentTab = ref('js');
const cssOptions = ref([
  { value: '', label: 'None' },
  { value: 'scss', label: 'SCSS' },
  { value: 'less', label: 'LESS' },
]);
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
  .setting-panel {
    flex-grow: 1;
    padding-left: 10px;
    max-height: 100%;
    overflow: hidden;
    overflow-y: auto;
    &::-webkit-scrollbar {
      background-color: #222;
      width: 5px;
    }

    /*滚动条中间滑动部分*/
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