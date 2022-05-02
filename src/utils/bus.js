import mitt from "mitt";
import { getCurrentInstance, onUnmounted } from "vue";

/**
 * Call onUnmounted() if it's inside a component lifecycle, if not, do nothing
 *
 * @param fn
 */
function tryOnUnmounted(fn) {
  if (getCurrentInstance()) {
    onUnmounted(fn);
  }
}

const vueBus = new mitt();
vueBus.preEmitList = []; // 存放需预处理的提交
vueBus.$preEmit = (name, params, deal) => {
  if (vueBus.all.get(name)) {
    // 如果已存在则直接提交
    vueBus.emit(name, params);
    return true;
  }
  // 不存在则存储预处理
  if (!deal) {
    // 非$dealPreEmit执行的
    vueBus.preEmitList.push({
      name,
      params,
    });
  }
  return false;
};
vueBus.$dealPreEmit = () => {
  // 执行预处理
  if (vueBus.preEmitList.length > 0) {
    const preEmitList = [];
    for (let i = 0; i < vueBus.preEmitList.length; i++) {
      let emit = vueBus.preEmitList[i];
      if (!vueBus.$preEmit(emit.name, emit.params, true)) {
        preEmitList.push({
          name: emit.name,
          params: emit.params,
        });
      }
    }
    vueBus.preEmitList = preEmitList;
  }
};

const busProxy = {
  on: (event, deal) => {
    vueBus.on(event, deal);
    tryOnUnmounted(() => {
      vueBus.off(event, deal);
    });
  },
  off: vueBus.off,
  once: vueBus.once,
  clear: vueBus.clear,
  emit: vueBus.emit,
  $dealPreEmit: vueBus.$dealPreEmit,
  $preEmit: vueBus.$preEmit,
};

export default busProxy;
