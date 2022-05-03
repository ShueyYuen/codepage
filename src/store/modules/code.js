import { defineStore } from 'pinia'
import loadJavaScript from '@/utils/load';
import bus from '@/utils/bus.js';

let sass = null;
loadJavaScript('/scss/sass.js').then(() => {
  sass = new window.Sass();
  console.log('install Sass successfully');
  bus.emit('compile', 'sass');
});
loadJavaScript('https://cdn.jsdelivr.net/npm/less@4').then(() => {
  console.log('install Less successfully');
  bus.emit('compile', 'less');
});

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
    compiledCss: '',
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
      }
      Object.keys(result).forEach(v => result[v]?.length || delete result[v]);
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
    },
    compileStyle() {
      switch(this.cssPre) {
        case 'less':
          window.less?.render(this.css)
            .then((output) => {
              this.compiledCss = output.css;
            }).catch((e) => {
              console.log(e.message,
                `error at: line: ${e.line}, column: ${e.column}`);
            });
          break;
        case 'scss':
          sass?.compile(this.css, (output) => {
            if (output.text)
              this.compiledCss = output.text;
            else console.log(output.message,
              `error at: line: ${output.line}, column: ${output.column}`);
          });
          break;
        default:
          this.compiledCss = this.css;
      }
    }
  },
});