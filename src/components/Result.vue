<template>
<RenderIframe :js="js" :html="html" :css="css"></RenderIframe>
</template>

<script setup>
import RenderIframe from '@/components/base/RenderIframe.js';
import { computed } from 'vue';
import { useCodeStore } from '@/store/modules/code.js';

const codeStore = useCodeStore();

const css = computed(() => codeStore.css);
const html = computed(() => codeStore.html);
const js = computed(() => codeStore.js);
const head = computed(() => codeStore.head);
</script>

<style lang="less">
</style>
