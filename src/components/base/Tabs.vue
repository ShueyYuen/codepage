<template>
  <div v-if="tabs.length" :class="['switch-tabs', `switch-tabs__${type}`]">
    <template v-for="(tab, i) in tabs" :key="tab.value" class="disable">
      <template v-if="tab.slot && typeof tab.slot === 'string'">
        <slot :name="tab.slot" v-bind="{ tab }"></slot>
      </template>
      <div v-else @click="handleClick(tab)"
        :class="{
          'switch-tabs__item': true,
          gap: tab.value === 'gap',
          disable: tab.disable,
          active : tab.value === modelValue,
          pre : i === selectedIndex - 1,
          badge: tab.badge
        }">
        {{ tab.label }}
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  tabs: {
    type: Array,
    required: true,
    default: () => []
  },
  type: {
    type: String,
    default: 'border'
  },
  cling: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(['update:modelValue']);

const handleClick =  function(tab) {
  if (tab.disable) {
    tab.disablePrompt && tab.disablePrompt(tab);
  } else {
    if (props.cling && tab.value === props.modelValue)
      emits('update:modelValue', '');
    else
      emits('update:modelValue', tab.value);
  }
}

const selectedIndex = computed(() =>
  props.tabs.findIndex((v) => v.value === props.modelValue));
</script>

<style lang="less" scoped>
.switch-tabs {
  display: flex;
  :deep(&__item) {
    flex-basis: 0;
    padding: 0 25px;
    position: relative;
    color: var(--deactive);
    text-align: center;
    cursor: pointer;
    white-space: nowrap;
    user-select: none;
  }
  & .active {
    color: #fff;
  }
  .gap {
    pointer-events: none;
    flex-grow: 2;
  }
}

@media screen and (max-width: 767px) {
  .switch-tabs {
    :deep(&__item) {
      padding: 0 14px;
    }
  }
}

:deep(.disable) {
  opacity: .8;
  cursor: not-allowed;
}
.switch-tabs__border {
  background: linear-gradient(var(--background) 0 50%, #36519e 50% 100%);
  border-bottom: 1px solid hsl(224, 49%, 42%);
  :deep(.switch-tabs__item) {
    height: 26px;
    line-height: 26px;
    font-size: 14px;
    background: var(--background);
    border: 0;

    &:first-of-type {
      border-bottom-left-radius: 0;
    }
    &:last-of-type {
      border-bottom-right-radius: 0;
    }
    &.badge::after {
      content: '';
      position: absolute;
      width: 6px;
      height: 6px;
      top: 4px;
      margin-left: 2px;
      border-radius: 3px;
      background: #FF6161;
      box-shadow: 0px 1px 2px 0px rgba(255, 97, 97, 0.5);
    }
  }
  &>.switch-tabs__item.active {
    background: #36519e;
    border-radius: 4px 4px 0 0;
    box-shadow: none;
  }

  :deep(.active+.switch-tabs__item) {
    border-bottom-left-radius: 4px;
  }
  .active~.switch-tabs__item {
    border: none;
  }
  &>.switch-tabs__item.pre {
    border-bottom-right-radius: 4px;
  }
}

.switch-tabs__line {
  flex-direction: column;
  border-right: 1px solid #444;
  :deep(.switch-tabs__item) {
    height: 32px;
    line-height: 32px;
    font-size: 14px;
    text-align: right;
    padding: 0 10px;
  }
  &>.switch-tabs__item.active {
    &::after {
      content: '';
      position: absolute;
      right: -1px;
      top: 4px;
      width: 2px;
      height: 24px;
      background: #fff;
      // transform: translateX(-50%);
    }
  }
}</style>
