<script setup>
const version = "1.0.0";
const buildTime = "2022.04.03";
console.log(
  `%c Release Build Info 
  %cVersion			v${version}
  BuildTime		${buildTime}`,
  "background:#000;color:#FFF;font-weight:bold;",
  "background:#FFF;color:#000;"
);
</script>

<template>
  <router-view />
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
}
</style>
