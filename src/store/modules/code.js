import { defineStore } from 'pinia'

export const useCodeStore = defineStore({
  id: 'code',
  state: () => ({
    css: '',
    html: '',
    js: '',
    head: '',
    cssLinks: [],
    jsLinks: [],
    cssPre: '',
  }),
  getters: {},
  actions: {
    setCSS(data){
      this.css = data;
    },
    setHTML(data){
      this.html = data;
    },
    setJS(data){
      this.js = data;
    },
    setHead(data){
      this.head = data;
    },
    setDefault(data) {
      this.css = data.css ?? '';
      this.html = data.html ?? '';
      this.js = data.js ?? '';
      this.head = data.head ?? '';
    }
  },
})