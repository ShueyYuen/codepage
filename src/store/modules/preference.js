import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';

export const usePreferStore = defineStore({
  id: 'prefer',
  state: () => ({
    readonly: false,
    theme: useStorage('theme', 'dark'),
    gzip: useStorage('gzip', false),
    language: useStorage('language', ''),
    debounce: useStorage('debounce', 2000),
    operation: useStorage('operation', {
      theme: true,
      download: true,
      fullscreen: true,
      github: true,
      share: true,
    }),
  }),
  getters: {
    editorTheme: (state) => state.theme === 'dark' ? 'vs-dark' : 'vs',
  },
  actions: {
    switchTheme(){
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
    },
    setTheme(val) {
      this.theme = val;
    },
    setReadonly(data) {
      this.readonly = data;
    }
  },
})