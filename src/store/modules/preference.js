import { defineStore } from 'pinia'

export const usePreferStore = defineStore({
  id: 'prefer',
  state: () => ({
    theme: 'dark',
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
    }
  },
})