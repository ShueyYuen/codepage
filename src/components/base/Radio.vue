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
.radio__switch {
  position: relative;
  height: 14px;
  width: 10px;
  border-radius: 8px;
  background: #83838355;
  border: 1px solid transparent;
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    transition: all .3s ease-in-out;
    width: 10px;
    height: 10px;
    border-radius: 5px;
    left: 1px;
    background: #83838355;
  }
  &.active {
    background: #36519e44;
    border-color: #36519e;
    &::after {
      left: 18px;
      background: #36519e;
    }
  }
}
.radio__round {
  width: 40px;
  border-radius: 20px;
  padding: 0;
  position: relative;
  height: 40px;
  background: #36529e42;
  transition: all .3s ease;
  :deep(.codeicon) {
    padding: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 18px;
  }
}
.active {
  background: #36519e;
  color: #fff;
}
</style>
