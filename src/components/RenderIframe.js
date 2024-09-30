import { h, ref, onMounted, watch, computed } from "vue";
import { useDebounceFn } from '@vueuse/core';
import bus from '@/utils/bus.js';
import { useCodeStore, usePreferStore } from "@/store/index.js";
import loadJavaScript from "@/utils/load";

function useResult() {
  const codeStore = useCodeStore();
  const preferStore = usePreferStore();

  const js = ref("");
  const css = ref("");

  watch(
    () => [codeStore.js, codeStore.useTs],
    ([v, useTs]) => {
      if (!useTs) {
        return (js.value = v);
      }
      const isTypeScriptLoaded = !!window.ts;
      (isTypeScriptLoaded
        ? Promise.resolve()
        : loadJavaScript(
            "TypeScript",
            "https://cdn.jsdelivr.net/npm/typescript@5.6.2"
          )
      ).then(() => (js.value = ts.transpile(v)));
    }
  );

  watch(
    () => [codeStore.css, codeStore.cssPre],
    ([v, preCss]) => {
      switch (preCss) {
        case "less":
          const isLessLoaded = !!window.less;
          (isLessLoaded
            ? Promise.resolve()
            : loadJavaScript("LESS", "https://cdn.jsdelivr.net/npm/less@4")
          )
            .then(() => window.less.render(v))
            .then((output) => (css.value = output.css))
            .catch((e) => {
              console.log(
                e.message,
                `error at: line: ${e.line}, column: ${e.column}`
              );
            });
          break;
        case "scss":
          const isSassLoaded = !!window.sass;
          (isSassLoaded
            ? Promise.resolve()
            : loadJavaScript("SASS", "/scss/sass.js").then(
                () => (window.sass = new window.Sass())
              )
          ).then(() => {
            window.sass.compile(v, (output) => {
              if (output.text) css.value = output.text;
              else
                console.log(
                  output.message,
                  `error at: line: ${output.line}, column: ${output.column}`
                );
            });
          });
          break;
        default:
          css.value = v;
      }
    }
  );

  return computed(
    () =>
      `<!DOCTYPE html>
<html style="--theme-background:${preferStore.theme === "dark" ? "#1e1e1e" : "#fffffe"};">
<head>
  ${codeStore.head}
  <!-- injected css -->
  ${codeStore.cssLinks.map((v) => `<link rel="stylesheet" href="${v}"/>`).join("\n")}
  <!-- injected script -->
  ${codeStore.jsLinks.map((v) => `<script src="${v}"></script>`).join("\n")}
  <style>
    ${css.value}
  </style>
</head>
<body>
  ${codeStore.html}
  <script>
    ${js.value}
  </script>
</body>
</html>`
  );
}

export default {
  name: "RenderIFrame",
  props: {
    interaction: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const views = ref('');
    const reloadView = () => views.value = content.value;
    const debounceReloadView = useDebounceFn(reloadView, 2000);

    const content = useResult();
    watch(content, debounceReloadView);

    onMounted(reloadView);
    bus.on('hard-refresh', () => {
      reloadView();
      window.frames['result-show'].location.reload();
    });
    return () => h("iframe", {
      id: 'result-show',
      frameborder: '0',
      allow: 'fullscreen',
      sandbox: 'allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation',
      srcdoc: views.value,
      style: {
        pointerEvents: props.interaction ? 'auto' : 'none',
      },
      name: 'result-show',
    });
  }
}
