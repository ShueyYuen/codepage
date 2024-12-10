function customParse(json) {
  const obj = JSON.parse(json);
  const refs = new Map([['#undefined', undefined]]);

  function _parse(value) {
    if (value && typeof value === "object") {
      if (value.$ref) {
        return refs.get(value.$ref); // 处理循环引用
      }
      if (value.$id) {
        const result = Array.isArray(value) ? [] : {};
        refs.set(value.$id, result);
        for (const [key, val] of Object.entries(value)) {
          if (key !== "$id") {
            result[key] = _parse(val);
          }
        }
        return result;
      }
      if (value.$function) {
        const func = () => console.log('this is a mock function');
        func.name = value.$name || "anonymous";
        func.length = value.$length || 0;
        func.toString = () => value.$function;
        return func;
      }
      if (Array.isArray(value)) {
        return value.map(_parse);
      }
      const result = {};
      for (const [key, val] of Object.entries(value)) {
        result[key] = _parse(val);
      }
      return result;
    }
    return value;
  }

  return _parse(obj);
}

class ConsoleDisplayElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  // 渲染初始结构
  render(data) {
    this.shadowRoot.innerHTML = `
<style>
:host {
    display: inline-flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    line-height: 1.5;
    background: #282c34;
    color: #e8e8e8;
    font-family: Consolas, monospace;
    padding: 16px;
    border-radius: 8px;
    overflow: auto;
    max-height: 400px;
}
.item {
    margin-right: 4px;
    display: inline-block;
}
ul {
    list-style: none;
    padding: 0;
    margin: 0;
}
li {
    margin: 4px 0;
}
.nil-value, .item .object .key {
    color: #fff6;
}
.string {
    color: #4fb2d3;
}
.number {
    color: #8e78f2;
}
.key {
    color: #79aaf8;
}
.toggle {
    cursor: pointer;
    color: #bbb;
    user-select: none;
    margin-right: 5px;
}
.closed > .toggle::before {
    content: "▶";
}
.open > .toggle::before {
    content: "▼";
}
.container {
    display: inline-flex;
    flex-direction: column;
}
.nested {
    display: none;
    margin-left: 12px;
}
.open > .container > .nested {
    display: block;
}
</style>
        `;
    const pureString = data[0] && typeof data[0] === "string";
    data.forEach((value) => {
      const element = this.createBaseElement(value, false, pureString);
      element && this.shadowRoot.appendChild(element);
    });
  }

  createBaseElement(value, narrow = false, pureString = false) {
    if (value == undefined || typeof value === "bigint") {
      const nilSpan = document.createElement("span");
      nilSpan.textContent = JSON.stringify(value) || "undefined";
      nilSpan.className = "item nil-value";
      return nilSpan;
    }

    if (typeof value === "string") {
      const strSpan = document.createElement("span");
      strSpan.textContent = pureString ? value : `"${value}"`;
      strSpan.className = `item ${pureString ? "" : "string"}`;
      return strSpan;
    }

    if (typeof value === "number" || typeof value === "boolean") {
      const numSpan = document.createElement("span");
      numSpan.textContent = value;
      numSpan.className = "item number";
      return numSpan;
    }

    if (typeof value === "function") {
      const funcSpan = document.createElement("span");
      funcSpan.textContent = value.toString();
      funcSpan.className = "item function";
      return funcSpan;
    }

    return this.createObjectElement(value, narrow);
  }

  createObjectElement(value, narrow) {
    const isObjArray = Array.isArray(value);
    if (narrow) {
      const narrowSpan = document.createElement("span");
      narrowSpan.textContent = isObjArray ? `Array(${value.length})` : "{...}";
      narrowSpan.className = "item value";
      return narrowSpan;
    }

    const objSpan = document.createElement("span");
    objSpan.className = "item complex closed";

    const toggle = document.createElement("span");
    toggle.className = "toggle";
    objSpan.appendChild(toggle);

    const dc = document.createElement("span");
    dc.className = "container";

    const inlineDc = document.createElement("span");
    inlineDc.className = `item ${isObjArray ? "array" : "object"}`;
    if (isObjArray) {
      inlineDc.appendChild(document.createTextNode("["));
      value.forEach((val, index) => {
        const element = this.createBaseElement(val, true);
        inlineDc.appendChild(element);
        if (index !== value.length - 1) {
          inlineDc.appendChild(document.createTextNode(", "));
        }
      });
      inlineDc.appendChild(document.createTextNode("]"));
    } else {
      const keysLength = Object.keys(value).length;
      inlineDc.appendChild(document.createTextNode("{"));
      Array.from(Object.entries(value))
        .slice(0, 5)
        .forEach(([key, val], index) => {
          const keySpan = document.createElement("span");
          keySpan.className = "key";
          keySpan.textContent = key;
          inlineDc.appendChild(keySpan);
          inlineDc.appendChild(document.createTextNode(": "));
          const element = this.createBaseElement(val, true);
          inlineDc.appendChild(element);
          if (index !== keysLength - 1) {
            inlineDc.appendChild(document.createTextNode(", "));
          }
        });
      if (keysLength > 5) {
        inlineDc.appendChild(document.createTextNode("..."));
      }
      inlineDc.appendChild(document.createTextNode("}"));
    }

    dc.appendChild(inlineDc);

    const ul = document.createElement("ul");
    ul.className = "nested";
    dc.appendChild(ul);

    objSpan.appendChild(dc);
    objSpan.addEventListener("click", (e) => {
      e.stopPropagation();

      const isOpen = !objSpan.classList.contains("open");
      objSpan.className = `item complex ${isOpen ? "open" : "closed"}`;

      if (ul.children.length !== 0) {
        return;
      }
      for (const [key, val] of Object.entries(value)) {
        const li = document.createElement("li");

        const keySpan = document.createElement("span");
        keySpan.className = "key";
        keySpan.textContent = key;
        li.appendChild(keySpan);
        li.appendChild(document.createTextNode(": "));

        const valueElement = this.createBaseElement(val);
        li.appendChild(valueElement);
        ul.appendChild(li);
      }
    });

    return objSpan;
  }

  // 属性观察
  static get observedAttributes() {
    return ["data"];
  }

  // 当属性变化时更新组件
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "data" && oldValue !== newValue) {
      try {
        const parsedData = customParse(newValue);
        if (!Array.isArray(parsedData)) {
          throw new Error("Must provide an array of objects");
        }
        this.render(parsedData);
      } catch (e) {
        console.error("Invalid JSON provided to ConsoleDisplayElement:", e);
      }
    }
  }
}

// 注册自定义元素
customElements.define("console-display", ConsoleDisplayElement);
