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
};

export default busProxy;
