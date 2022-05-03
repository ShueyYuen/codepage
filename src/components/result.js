import { computed, watch } from 'vue';
import { useCodeStore } from '@/store/index.js';
import { useDebounceFn } from '@vueuse/core';
import bus from '@/utils/bus.js';

const codeStore = useCodeStore();

const debounceCompileToCss = useDebounceFn(codeStore.compileStyle, 1500);
bus.on('refresh', codeStore.compileStyle);
bus.on('compile', (type) => {
  if ((type ?? '') === codeStore.cssPre)
    codeStore.compileStyle();
});
watch(() => codeStore.css, debounceCompileToCss);
watch(() => codeStore.cssPre, codeStore.compileStyle);

export default computed(() =>
`<!DOCTYPE html>
<html>
  <head>
    ${codeStore.head}
    ${codeStore.cssLinks.map(v => `<link rel="stylesheet" href="${v}"/>`).join('\n    ')}
    ${codeStore.jsLinks.map(v => `<script src="${v}"></script>`).join('\n    ')}
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