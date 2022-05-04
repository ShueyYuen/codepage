import { h, ref, onMounted, watch } from "vue"
import { useDebounceFn } from '@vueuse/core';
import content from './result.js'
import bus from '@/utils/bus.js';
export default {
  name: "RenderIFrame",
  setup() {
    const views = ref('');
    const reloadView = () => views.value = content.value;
    const debounceReloadView = useDebounceFn(reloadView, 2000);
    onMounted(reloadView);
    watch(content, debounceReloadView);
    bus.on('hard-refresh', () => {
      reloadView();
      window.frames['result-show'].location.reload();
    });
    return () => h("iframe", {
      frameborder: '0',
      allow: 'fullscreen',
      sandbox: 'allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation',
      srcdoc: views.value,
      name: 'result-show',
    });
  }
}
