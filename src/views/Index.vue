<template>
  <Tabs v-model="currentTab" :tabs="tabs" :cling="showResult">
    <template #operation>
      <Radio v-model="showResult" :disabled="!currentTab">{{ t('result') }}</Radio>
      <ShareIcon></ShareIcon>
    </template>
  </Tabs>
  <splitpanes @resize="editorSize = $event[0].size">
    <pane min-size="20" :class="{ collapse: !currentTab }" :size="editorDisplaySize">
      <keep-alive>
        <component :is="componentName"></component>
      </keep-alive>
    </pane>
    <pane min-size="20" :size="100 - editorDisplaySize" v-if="showResult">
      <Result></Result>
    </pane>
  </splitpanes>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from "vue-router";
import Tabs from '@/components/base/Tabs.vue';
import CSSEditor from '@/components/CSSEditor.vue';
import HTMLEditor from '@/components/HTMLEditor.vue';
import JSEditor from '@/components/JSEditor.vue';
import Result from '@/components/Result.vue';
import Radio from '@/components/base/Radio.vue';
import { t } from '@/lang/index.js';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import ShareIcon from '@/components/ShareIcon.vue';
import { UnicodeDecodeB64 } from '@/utils/tool.js';
import { useCodeStore } from '@/store/modules/code.js';

const componentMap = {
  js: JSEditor,
  html: HTMLEditor,
  css: CSSEditor,
}

const searchParams = new URLSearchParams(window.location.search);
const loadCode = JSON.parse(
  UnicodeDecodeB64(searchParams.get('code') ?? '') || '{}');
const codeStore = useCodeStore();
codeStore.setDefault(loadCode);

const showResult = ref(false);
const currentTab = ref('js');
const editorSize = ref(50);
const editorDisplaySize = computed(() =>
  currentTab.value ? editorSize.value : 0);
const tabs = computed(() => [
  { label: 'JavaScript', value: 'js', },
  { label: 'HTML', value: 'html', },
  { label: 'CSS', value: 'css', },
  { value: 'gap' },
  { slot: 'operation' },
]);
const componentName = computed(() => componentMap[currentTab.value]);
</script>

<style lang="less" scoped>
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
  background: grey;
  margin-left: -1px;
  position: relative;
  &::after,
  &::before {
    content: '';
    position: absolute;
    background: #1a284d;
    height: 50px;
    top: 50%;
    transform: translateY(-50%);
    right: 1px;
    width: 1px;
  }
  &::before {
    left: 1px;
  }
}
</style>