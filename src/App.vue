<script setup>
import { watch } from 'vue';
import { usePreferStore } from '@/store/modules/preference.js';

const preferStore = usePreferStore();

watch(() => preferStore.theme, () => {
  document.body.setAttribute('class', preferStore.theme);
}, { immediate: true });

const version = "1.0.5";
const buildTime = "2022.05.03";
console.log(
  `%c  Release Build Info        
%c  Version			v${version}  
  BuildTime		${buildTime}  `,
  "background:#000;color:#FFF;font-weight:bold;",
  "background:#FFF;color:#000;"
);
</script>

<template>
  <router-view/>
</template>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.dark {
  --background: #1e1e1e;
  --deactive: #fffa;
  --active: #fff;
}
.light {
  --background: #fffffe;
  --deactive: #000a;
  --active: #000;
}
.splitpanes {
  flex-grow: 1;
  .editor,
  iframe {
    width: 100%;
    height: 100%;
  }
  iframe {
    background: #fff;
  }
}
* {
  padding: 0;
  margin: 0;
  *::-webkit-scrollbar {
    width: 6px;
    background: var(--background);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--deactive);
    border-radius: 3px;
  }
}
a {
  text-decoration: none;
}
</style>
