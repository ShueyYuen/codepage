import { h, ref, createApp, onMounted, onBeforeUpdate, onActivated } from "vue"

export default {
  name: "RenderIFrame",
  props: {
    css: {
      type: String,
      default: ""
    },
    head: {
      type: String,
      default: ""
    },
    html: {
      type: String,
      default: ""
    },
    js: {
      type: String,
      default: ""
    },
  },
  setup(props, { slots }) {
    const iframeRef = ref(null);
    const iframeBody = ref(null);
    const iframeHead = ref(null);
    const iframeStyle = ref(null);
    const iframeScript = ref(null);
    const reloadView = () => {
      iframeBody.value = iframeRef.value.contentDocument.body;
      iframeHead.value = iframeRef.value.contentDocument.head;
      // style
      iframeStyle.value = document.createElement("style");
      iframeStyle.value.innerHTML = props.css;
      iframeHead.value.appendChild(iframeStyle.value);
      // html
      iframeBody.value.innerHTML = props.html;
      // script
      iframeScript.value = document.createElement("script");
      iframeScript.value.innerHTML = props.js;
      iframeBody.value.appendChild(iframeScript.value);
    }
    onMounted(reloadView);
    onActivated(reloadView);
    return () => h("iframe", { ref: iframeRef })
  }
}