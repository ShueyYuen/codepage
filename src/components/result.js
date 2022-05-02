import { computed } from 'vue';
import { useCodeStore } from '@/store/index.js';

const codeStore = useCodeStore();

export default computed(() =>
`<!DOCTYPE html>
<html>
  <head>
    ${codeStore.head}
    ${codeStore.cssLinks.map(v => `<link rel="stylesheet" href="${v}"/>`).join('\n    ')}
    ${codeStore.jsLinks.map(v => `<script src="${v}"></script>`).join('\n    ')}
    <style>
      ${codeStore.css}
    </style>
  </head>
  <body>
    ${codeStore.html}
    <script>
      ${codeStore.js}
    </script>
  </body>
</html>`);