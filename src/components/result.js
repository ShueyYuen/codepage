import { ref, watch, computed } from "vue";
import { useCodeStore, usePreferStore } from "@/store/index.js";
import loadJavaScript from "@/utils/load";

export function useResult() {
  const codeStore = useCodeStore();
  const preferStore = usePreferStore();

  const js = ref("");
  const css = ref("");

  watch(
    () => [codeStore.js, codeStore.useTs, codeStore.tsConfig],
    ([v, useTs, tsConfig]) => {
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
      ).then(
        () =>
          (js.value = ts.transpile(v, {
            ...tsConfig,
          }))
      );
    },
    { deep: true }
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
<html style="--theme-background:${
        preferStore.theme === "dark" ? "#1e1e1e" : "#fffffe"
      };">
<head>
  ${codeStore.head}
  <!-- injected css -->
  ${codeStore.cssLinks
    .map((v) => `<link rel="stylesheet" href="${v}"/>`)
    .join("\n")}
  <!-- injected script -->
  ${codeStore.jsLinks.map((v) => `<script src="${v}"></script>`).join("\n")}
  <style>
    ${css.value}
  </style>
</head>
<body>
  <script>
  // This is injected for console;
  function customStringify(obj) {
    const seen = new Map();

    function _stringify(value) {
      if (value && typeof value === "object") {
        if (seen.has(value)) {
          return { $ref: seen.get(value) }; // 返回循环引用的标识符
        }
        const id = \`#\${seen.size}\`;
        seen.set(value, id);
        if (Array.isArray(value)) {
          return value.map(_stringify); // 处理数组
        }
        const result = {};
        for (const [key, val] of Object.entries(value)) {
          result[key] = _stringify(val);
        }
        return { $id: id, ...result }; // 包含对象的唯一标识符
      }
      if (value && typeof value === "function") {
        return {
          $function: value.toString(),
          $length: value.length,
          $name: value.name,
        };
      }
      if (value === undefined) {
        return { $ref: "#undefined" }; // 处理 undefined
      }
      return value; // 直接返回非对象值
    }
    return JSON.stringify(_stringify(obj));
  }
  ['log', 'warn', 'error', 'info'].forEach((method) => {
    const originMethod = console[method]; 
    console[method] = function (...message) {
      originMethod.call(console, ...message);
      window.parent.postMessage({
        source: 'result-show',
        method,
        content: customStringify(message),
      });
    };
  });
  </script>
  ${codeStore.html}
  <script>
    ${js.value}
  </script>
</body>
</html>`
  );
}
