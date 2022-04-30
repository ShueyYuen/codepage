<template>
  <Tabs v-model="currentTab" :tabs="tabs"></Tabs>
  <keep-alive>
    <component :is="componentName"></component>
  </keep-alive>
</template>

<script setup>
import { computed, ref, h } from 'vue';
import Tabs from '@/components/base/Tabs.vue';
import CSSEditor from '@/components/CSSEditor.vue';
import HTMLEditor from '@/components/HTMLEditor.vue';
import JSEditor from '@/components/JSEditor.vue';
import Result from '@/components/Result.vue';

const componentMap = {
  js: JSEditor,
  html: HTMLEditor,
  css: CSSEditor,
  result: Result,
}

const currentTab = ref('js');
const tabs = computed(() => [
  { label: 'JavaScript', value: 'js', },
  { label: 'HTML', value: 'html', },
  { label: 'CSS', value: 'css', },
  { value: 'gap' },
  { label: 'Result', value: 'result', },
]);
const componentName = computed(() => componentMap[currentTab.value]);
</script>

<style lang="less" scoped>
.content {
  flex-grow: 1;
  display: flex;
  position: relative;
}
</style>