import { defineStore } from 'pinia'

export const useCodeStore = defineStore({
  id: 'code',
  state: () => ({
    css: '',
    html: '',
    js: '',
    head: '',
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
  },
})