<template>
  <div class="result-display">
    <iframe id="result-show" frameborder="0" allow="fullscreen"
      sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
      :srcdoc="srcdoc" name="result-show" :style="{ pointerEvents: props.interaction ? 'auto' : 'none' }"
      ref="iframeElement"></iframe>
    <div class="console-output-panel" v-show="preferStore.console">
      <button @click="handleClearConsole">{{ t('clearConsole') }}</button>
      <ul ref="consoleOut"></ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useDebounceFn } from "@vueuse/core";
import bus from "@/utils/bus.js";
import { usePreferStore } from "@/store/index.js";
import { t } from '@/lang/index.js';
import { getCurrentFormattedTime } from '@/utils/tool.js';
import { useResult } from "./result";

const srcdoc = ref("");
const consoleOut = ref(null);
const iframeElement = ref(null);
const preferStore = usePreferStore();

const reloadView = () => (srcdoc.value = content.value);
const debounceReloadView = useDebounceFn(reloadView, 2000);

const props = defineProps({
  interaction: {
    type: Boolean,
    default: true,
  },
})

const content = useResult();
watch(content, debounceReloadView);

onMounted(() => reloadView());
bus.on("hard-refresh", () => {
  reloadView();
  window.frames["result-show"].location.reload();
});

window.addEventListener('message', (msg) => {
  const data = msg.data;
  if (data.source !== 'result-show') {
    return;
  }
  const logEntry = document.createElement('li');
  logEntry.dataset.method = data.method;

  const timeSpan = document.createElement('span');
  timeSpan.className = "time-span";
  timeSpan.textContent = getCurrentFormattedTime();
  logEntry.appendChild(timeSpan);

  const contentSpan = document.createElement('span');
  contentSpan.textContent = data.content;
  logEntry.appendChild(contentSpan);

  consoleOut.value.appendChild(logEntry);
});

const handleClearConsole = () => (consoleOut.value.innerHTML = "");
</script>

<style lang="less" scoped>
.result-display {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  #result-show {
    flex-grow: 10;
    flex-shrink: 10;
  }

  .console-output-panel {
    height: 200px;
    border-top: 5px solid #c9c9c9;
    background: var(--background);
    flex-shrink: 0;
    flex-grow: 0;
    color: var(--deactive);
    position: relative;

    button {
      appearance: none;
      position: absolute;
      right: 5px;
      top: 2px;
      background: transparent;
      border: none;
      color: var(--deactive);
      cursor: pointer;
    }

    ul {
      height: 100%;
      padding: 10px 0;
      overflow: scroll;
    }

    :deep(li) {
      border-bottom: 1px solid rgba(201, 201, 201, 0.2);
      padding: 0 5px;

      &::before {
        content: "> ";
      }

      &[data-method="warn"] {
        background-color: rgba(247, 233, 105, 0.3);
      }

      &[data-method="error"] {
        background-color: rgba(255, 17, 0, 0.3);
      }

      .time-span {
        opacity: 0.5;
        padding-right: 8px;
        user-select: none;
        pointer-events: none;
      }
    }
  }
}
</style>
