<template>
  <div v-for="(item, i) in list" class="input-wrap">
    <input v-model="item.value" :placeholder="props.placeholder" @blur="blurd"/>
    <i class="codeicon codeicon-delete" @click="handleDelete(i)"></i>
  </div>
  <div class="add-button" @click="handleAdd">{{ props.address }}</div>
</template>

<script setup>
import { defineProps, defineEmits, computed, watch, ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
  placeholder: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: 'Add',
  }
});
const emits = defineEmits(['update:modelValue']);

const list = ref([]);

watch(props.modelValue, () => {
  const addLength = list.value.reduce((t,c) => c.value ? t : t + 1, 0)
    || props.modelValue.length ? 0 : 1;
  list.value = props.modelValue.map(v => ({ value: v }))
    .concat(Array(addLength).fill({ value: '' }));
}, { immediate: true });

const blurd = () => emits('update:modelValue',
  list.value.map(v => v.value).filter(v => v));
const handleDelete = (idx) => list.value.splice(idx, 1) && blurd();
const handleAdd = () => list.value.push({value: ''});
</script>

<style lang="less">
.input-wrap {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  input {
    flex-grow: 1;
    padding: 2px 10px;
    background: #222;
    color: #fff;
    outline: none;
    border: none;
    border-radius: 4px;
  }
  .codeicon {
    padding: 0 5px;
    cursor: pointer;
    &:hover {
      color: red;
      transition: all .3s ease;
    }
  }
}
.add-button {
  width: fit-content;
  padding: 0 10px;
  font-size: 14px;
  background: rgb(124, 131, 160);
  border-radius: 5px;
  cursor: pointer;
  user-select: none;
  transition: all .3s ease;
  margin: 10px 0;
  &:hover {
    background: rgb(135, 151, 218);
  }
}
</style>