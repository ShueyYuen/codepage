import { computed, watch } from 'vue';
import { useCodeStore, usePreferStore } from '@/store/index.js';
import { useDebounceFn } from '@vueuse/core';
import bus from '@/utils/bus.js';

const codeStore = useCodeStore();
const preferStore = usePreferStore();

const debounceCompileToCss = useDebounceFn(codeStore.compileStyle, preferStore.debounce);
bus.on('hard-refresh', codeStore.compileStyle);
bus.on('compile', (type) => {
  if ((type ?? '') === codeStore.cssPre)
    codeStore.compileStyle();
});
watch(() => codeStore.css, debounceCompileToCss);
watch(() => codeStore.cssPre, codeStore.compileStyle);

export default computed(() =>
`<!DOCTYPE html>
<html style="--theme-background:${preferStore.theme==='dark'?'#1e1e1e':'#fffffe'};">
<head>
  ${codeStore.head}
  <!-- injected css -->
  ${codeStore.cssLinks.map(v => `<link rel="stylesheet" href="${v}"/>`).join('\n')}
  <!-- injected script -->
  ${codeStore.jsLinks.map(v => `<script src="${v}"></script>`).join('\n')}
  <style>
    ${codeStore.compiledCss}
  </style>
</head>
<body>
  ${codeStore.html}
  <script>
    ${codeStore.js}
  </script>
</body>
</html>`);