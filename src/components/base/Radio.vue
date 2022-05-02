<template>
  <div
      :class="['radio', `radio__${type}`, props.modelValue ? 'active' : '']"
      @click="handleClick">
    <slot></slot>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  type: {
    type: String,
    default: 'border'
  },
  disabled: {
    type: Boolean,
    default: false,
  }
});

const emits = defineEmits(['update:modelValue']);

const handleClick =  function() {
  if (props.disabled) return;
  emits('update:modelValue', !props.modelValue);
}
</script>

<style lang="less" scoped>
.radio {
  height: 20px;
  line-height: 20px;
  font-size: 14px;
  margin: 3px 0;
  padding: 0 10px;
  user-select: none;
  color: #fff8;
}
.radio__border {
  border-radius: 8px;
  background: #36519e55;
}
.active {
  background: #36519e;
  color: #fff;
}
</style>
