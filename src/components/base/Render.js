// XTable 组件库代码
import { defineComponent, getCurrentInstance } from 'vue';
export default defineComponent({
  name: 'Render',
  props: {
    params: {},
    renderMethod: {
      type: Function,
      require: true,
    },
  },
  render() {
    const internalInstance = getCurrentInstance();
    if (!internalInstance) return;
    const props = internalInstance.props;
    return props.renderMethod?.(props.params);
  },
});