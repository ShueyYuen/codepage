const SYMBOL_REGEXP = /^Symbol\((.*)\)\$symbol$/;
function customParse(json) {
  const obj = JSON.parse(json);
  const refs = new Map([["#undefined", undefined]]);

  function _parse(value) {
    if (!value) {
      return value;
    }
    const type = typeof value;
    if (type === "object") {
      if (value.$ref) {
        return refs.get(value.$ref); // 处理循环引用
      }
      if (value.$id) {
        const result = Array.isArray(value) ? [] : {};
        refs.set(value.$id, result);
        for (const [key, val] of Object.entries(value)) {
          if (key !== "$id") {
            result[_parse(key)] = _parse(val);
          }
        }
        return result;
      }
      if (value.$function) {
        const func = function () {
          console.log("this is a mock function");
        };
        func.name = value.$name || "anonymous";
        func.length = value.$length || 0;
        func.toString = () => value.$function;
        return func;
      }
      if (value.$symbol) {
        console.log(value.$symbol, Symbol.for(value.$symbol));
        return Symbol.for(value.$symbol);
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
    if (type === "string" && SYMBOL_REGEXP.test(value)) {
      return Symbol.for(value.match(SYMBOL_REGEXP)[1]);
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
    this.data = (data = data || this.data);
    this.shadowRoot.innerHTML = `
<style>
:host {
    display: inline-flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    line-height: 1.5;
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
.item.nil-value, .item .object .key {
    color: #fff6;
}
.item.string {
    color: #4fb2d3;
}
.item.number {
    color: #8e78f2;
}
.item.function {
    font-style: italic;
    white-space: pre-wrap;
}
.function-symbol {
    color: #d45831;
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
table {
    border-collapse: collapse;
    border-spacing: 0;
    border: 1px solid #444;
    margin-top: 8px;
}
th {
    color: #fff4;
}
</style>
        `;
    const method = this.getAttribute("method");
    if (method === "table") {
      const element = this.createTableElement(data);
      element && this.shadowRoot.appendChild(element);
      const narrowElement = this.createBaseElement(data[0]);
      narrowElement && this.shadowRoot.appendChild(narrowElement);
      return;
    }
    const pureString = data[0] && typeof data[0] === "string";
    data.forEach((value) => {
      const element = this.createBaseElement(value, false, pureString);
      element && this.shadowRoot.appendChild(element);
    });
  }

  createBaseElement(value, narrow = false, pureString = false) {
    const type = typeof value;
    if (value == undefined || type === "bigint") {
      const nilSpan = document.createElement("span");
      nilSpan.textContent = JSON.stringify(value) || "undefined";
      nilSpan.className = "item nil-value";
      return nilSpan;
    }

    const isSymbol = type === "symbol";
    if (type === "string" || isSymbol) {
      const strSpan = document.createElement("span");
      strSpan.textContent = isSymbol || pureString ? value.toString() : `"${value}"`;
      strSpan.className = `item ${pureString && !isSymbol ? "" : "string"}`;
      return strSpan;
    }

    if (type === "number" || type === "boolean") {
      const numSpan = document.createElement("span");
      numSpan.textContent = value;
      numSpan.className = "item number";
      return numSpan;
    }

    if (type === "function") {
      const funcSpan = document.createElement("span");
      let functionString = value.toString();
      const ifFunctionDefined = functionString.startsWith("function");
      if (ifFunctionDefined) {
        const fSpan = document.createElement("span");
        fSpan.textContent = "ƒ";
        fSpan.className = "function-symbol";
        funcSpan.appendChild(fSpan);
        functionString = functionString.replace(/^function/, "");
      }

      funcSpan.appendChild(document.createTextNode(functionString));
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
      const keys = Reflect.ownKeys(value);
      inlineDc.appendChild(document.createTextNode("{"));
      keys.slice(0, 5).forEach((key, index) => {
        const val = value[key];
        const keySpan = document.createElement("span");
        keySpan.className = "key";
        keySpan.textContent = key.toString();
        inlineDc.appendChild(keySpan);
        inlineDc.appendChild(document.createTextNode(": "));
        const element = this.createBaseElement(val, true);
        inlineDc.appendChild(element);
        if (index !== keys.length - 1) {
          inlineDc.appendChild(document.createTextNode(", "));
        }
      });
      if (keys.length > 5) {
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
      Reflect.ownKeys(value).forEach((key) => {
        const val = value[key];
        const li = document.createElement("li");

        const keySpan = document.createElement("span");
        keySpan.className = "key";
        keySpan.textContent = key.toString();
        li.appendChild(keySpan);
        li.appendChild(document.createTextNode(": "));

        const valueElement = this.createBaseElement(val);
        li.appendChild(valueElement);
        ul.appendChild(li);
      });
    });

    return objSpan;
  }

  createTableElement(data) {
    const [list, properties] = data;
    if (!Array.isArray(list) || !Array.isArray(properties)) {
      return;
    }
    const table = document.createElement("table");
    table.style.width = "100%";
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
    const tr = document.createElement("tr");

    // Add index column header
    const indexTh = document.createElement("th");
    indexTh.textContent = "(index)";
    tr.appendChild(indexTh);

    properties.forEach((prop) => {
      const th = document.createElement("th");
      th.textContent = prop.toString();
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    table.appendChild(thead);

    list.forEach((item, index) => {
      const tr = document.createElement("tr");

      // Add index column data
      const indexTd = document.createElement("td");
      indexTd.textContent = index;
      tr.appendChild(indexTd);

      properties.forEach((prop) => {
        const td = document.createElement("td");
        const propertyElement = this.createBaseElement(item[prop]);
        propertyElement && td.appendChild(propertyElement);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    return table;
  }

  // 属性观察
  static get observedAttributes() {
    return ["data", "method"];
  }

  // 当属性变化时更新组件
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      try {
        if (name === 'data') {
          const parsedData = customParse(newValue);
          if (!Array.isArray(parsedData)) {
            throw new Error("Must provide an array of objects");
          }
          this.render(parsedData);
        } else {
          this.render();
        }
      } catch (e) {
        console.error("Invalid JSON provided to ConsoleDisplayElement:", e);
      }
    }
  }
}

// 注册自定义元素
customElements.define("console-display", ConsoleDisplayElement);
