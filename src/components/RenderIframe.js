import { h, ref, onMounted, watch } from "vue"
import { useDebounceFn } from '@vueuse/core';
import content from './result.js'
import bus from '@/utils/bus.js';
export default {
  name: "RenderIFrame",
  props: {
    css: {
      type: String,
      default: ""
    },
    head: {
      type: String,
      default: ""
    },
    html: {
      type: String,
      default: ""
    },
    js: {
      type: String,
      default: ""
    },
    head: {
      type: String,
      default: ""
    },
    csses: {
      type: Array,
      default: () => [],
    },
    jses: {
      type: Array,
      default: () => [],
    },
  },
  setup(props, { slots }) {
    const views = ref('');
    const reloadView = () => views.value = content.value;
    const debounceReloadView = useDebounceFn(reloadView, 1500);
    onMounted(reloadView);
    watch(content, debounceReloadView);
    bus.on('refresh', reloadView);
    return () => h("iframe", {
      frameborder: '0',
      allow: 'fullscreen',
      sandbox: 'allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation',
      srcdoc: views.value,
      name: 'result-show',
    });
  }
}
