<template>
  <i :class="`codeicon codeicon-${props.type}`"></i>
</template>

<script setup>
import { defineProps } from 'vue';
const props = defineProps({
  type: {
    type: String,
    required: true,
  }
});
</script>

<style lang="less" scoped>
.codeicon {
  line-height: 26px;
  font-size: 16px;
  color: var(--deactive);
  padding: 0 10px;
  transition: all .3s ease;
  &:hover {
    color: var(--active);
  }
}
</style>