<template>
  <div class="dropdown-wrap">
    <div class="dropdown-content__wrap">
      <div class="dropdown-content">{{ current?.label || 'None' }}</div>
      <i class="codeicon codeicon-arrow-down" :class="{rotate: optionShow}"></i>
    </div>
    <input @focus="optionShow = true" @blur="handleBlur"/>
    <div class="options-wrap" v-show="optionShow">
      <div v-for="item in props.options" @mousedown="handleClick(item)">
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, computed, nextTick } from 'vue';
const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    default: () => [],
  }
});
const emits = defineEmits(['update:modelValue']);
const optionShow = ref(false);
const current = computed(() =>
  props.options.find(item => item.value === props.modelValue));
const handleClick = (item) => emits('update:modelValue', item.value);
const handleBlur = () => nextTick(() => optionShow.value = false);
</script>

<style lang="less" scoped>
.dropdown-wrap {
  position: relative;
  background: #222;
  font-size: 14px;
  border-radius: 4px;
  input {
    width: 100%;
    top: 0;
    opacity: 0;
    cursor: pointer;
    position: absolute;
  }
  .dropdown-content__wrap {
    display: flex;
    align-items: center;
    .codeicon {
      line-height: 16px;
      transition: all .3s ease;
    }
    .rotate {
      transition: all .3s ease;
      transform: rotate(180deg);
    }
  }
  .dropdown-content {
    padding: 2px 10px;
    flex-grow: 1;
  }
  .options-wrap {
    transform: translateY(5px);
    position: absolute;
    background: rgb(124, 131, 160);
    width: 100%;
    border-radius: 5px;
    div {
      cursor: pointer;
      padding: 2px 10px;
      border-radius: 5px;
      &:hover {
        transition: all .3s ease;
        background: rgb(135, 151, 218);
      }
    }
  }
}
</style>