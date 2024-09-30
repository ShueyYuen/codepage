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
    useTs: false,
  }),
  getters: {
    config: (state) => {
      const result = {
        css: state.css,
        html: state.html,
        js: state.js,
        head: state.head,
        jses: state.jsLinks,
        csses: state.cssLinks,
        pre: state.cssPre,
        ts: state.useTs ? 1 : 0,
      }
      Object.entries(result).forEach(([key, value]) => {
        if (value === '' || value === false || value === 0) {
          return delete result[key];
        }
        if (Array.isArray(value) && value.length === 0) {
          delete result[key];
        }
      });
      return result;
    }
  },
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
      this.jsLinks = data.jses ?? [];
      this.cssLinks = data.csses ?? [];
      this.cssPre = data.pre ?? '';
      this.useTs = Boolean(data.ts);
    }
  },
});