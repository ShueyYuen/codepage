<template>
  <teleport to="body">
    <transition :duration="100">
      <div class="code-modal" v-show="visible">
        <div
          v-if="mask"
          @click="handleClose"
          class="code-modal__mask"
        ></div>
        <slot class="code-modal__container"></slot>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  mask: {
    type: Boolean,
    default: true
  },
});
const emits = defineEmits(['update:visible']);
const handleClose = () => emits('update:visible', false);
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
  z-index: 100;

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
