<template>
  <teleport to="body">
    <div class="code-modal" v-show="visible">
      <div
        v-if="mask"
        @click="handleClose"
        class="code-modal__mask"
      ></div>
      <slot class="code-modal__container"></slot>
    </div>
  </teleport>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  visible: {
    // 控制对话框是否显示，可使用 v-model 双向绑定数据
    type: Boolean,
    default: false
  },
  mask: {
    // 控制对话框是否显示，可使用 v-model 双向绑定数据
    type: Boolean,
    default: true
  },
});

const emits = defineEmits(['update:visible']);

const handleClose = () => {
  emits('update:visible', false);
}
</script>
<style lang="less" scoped>
.code-modal {
  color: #fff;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  &__mask {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.4);
  }
  &__container {
    z-index: 1;
  }
}
</style>
