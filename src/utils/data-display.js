const SYMBOL_REGEXP = /^Symbol\((.*)\)\$symbol$/;
const PROXY_SYMBOL = Symbol("proxy");
const STYLE_SEPARATOR = "###style###";

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
      if (value.$proxy) {
        const data = _parse(value.$proxy) || [];
        data[PROXY_SYMBOL] = true;
        return data;
      }
      if (value.$id) {
        const isArray = value.$array;
        const result = isArray ? [] : {};
        refs.set(value.$id, result);
        for (const [key, val] of Object.entries(isArray || value)) {
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
        func.toString = () => value.$function;
        return func;
      }
      if (value.$symbol) {
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

const consoleDisplayStyles = new CSSStyleSheet();
consoleDisplayStyles.replace(`
__HARD_INJECT__(src/utils/data-display.css)
`);

class ConsoleDisplayElement extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [consoleDisplayStyles];
  }

  // 渲染初始结构
  render(data) {
    this.data = data = data || this.data;
    const method = this.getAttribute("method");
    const stack = this.getAttribute("stack");
    if (!method || !stack || !data) {
      return;
    }

    const pureString = data[0] && typeof data[0] === "string";
    if (pureString) {
      data = this.formatValue(data);
    }
    if (method === "table") {
      const element = this.createTableElement(data);
      element && this.shadowRoot.appendChild(element);
      const narrowElement = this.createBaseElement(data[0]);
      narrowElement && this.shadowRoot.appendChild(narrowElement);
      return;
    }
    data.forEach((value) => {
      const element = this.createBaseElement(value, false, pureString);
      element && this.shadowRoot.appendChild(element);
    });
  }

  formatValue(data) {
    const parseString = (value) => value ? value.toString() : JSON.stringify(value) || 'undefined';
    let i = 0;
    const result = [];
    while (i < data.length) {
      let item = data[i];
      if (typeof item === "string") {
        let j = 0, str = "";
        while (j < item.length) {
          const char = item[j];
          j++;
          if (char !== "%") {
            str += char === " " ? "&nbsp;" : char;
            continue;
          }
          const nextChar = item[j];
          if (!'sdfioOc'.includes(nextChar)) {
            str += char;
            continue;
          }
          i++, j++;
          const hasNextItem = i in data;
          if (!hasNextItem) {
            str += `%${nextChar}`;
            continue;
          }
          const nextItem = data[i];
          switch (nextChar) {
            case "s":
              str += parseString(nextItem);
              break;
            case "d":
            case "i":
              str += parseInt(nextItem);
              break;
            case "f":
              str += parseFloat(nextItem);
              break;
            case "o":
            case "O":
              result.push(str);
              const hasStyle = str.includes(STYLE_SEPARATOR);
              const [style] = hasStyle ? str.split(STYLE_SEPARATOR) : [""];
              str = `${style}${STYLE_SEPARATOR}`;
              result.push(nextItem);
              break;
            case "c":
              result.push(str);
              str = `${parseString(nextItem)}${STYLE_SEPARATOR}`;
              break;
          }
        }
        item = str;
      }
      result.push(item);
      i++;
    }
    return result.filter(Boolean);
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
      const pureStringString = pureString && !isSymbol;
      strSpan.className = `item ${pureStringString ? "" : "string"}`;
      if (pureStringString) {
        const hasStyle = value.includes(STYLE_SEPARATOR);
        const [style, content] = hasStyle
          ? value.split(STYLE_SEPARATOR)
          : ["", value];
        strSpan.innerHTML = content;
        strSpan.style = style;
        strSpan.classList.toggle("has-style", hasStyle);
      } else {
        strSpan.textContent = isSymbol ? value.toString() : `"${value}"`;
      }
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
      if (functionString.startsWith("function")) {
        const fSpan = document.createElement("span");
        fSpan.textContent = "ƒ";
        fSpan.className = "function-symbol";
        funcSpan.appendChild(fSpan);
        functionString = functionString.replace(/^function/, "");
      } else if (functionString.startsWith("class")) {
        const classSpan = document.createElement("span");
        classSpan.textContent = "class";
        classSpan.className = "class-symbol";
        funcSpan.appendChild(classSpan);
        functionString = functionString.replace(/^class/, "");
      }

      funcSpan.appendChild(document.createTextNode(functionString));
      funcSpan.className = "item function";
      return funcSpan;
    }

    return this.createObjectElement(value, narrow);
  }

  createObjectElement(value, narrow) {
    const isObjArray = Array.isArray(value);
    const isProxy = value[PROXY_SYMBOL] || false;
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
    if (isObjArray && !isProxy) {
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
      const keys = Reflect.ownKeys(value)
        .filter((key) => key !== PROXY_SYMBOL)
        .filter((key) => !(isObjArray && key === "length"));
      inlineDc.appendChild(document.createTextNode(isProxy ? `Proxy(${isObjArray ? 'Array' : 'Object'}) {` : "{"));
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
      Reflect.ownKeys(value)
        .filter((key) => key !== PROXY_SYMBOL)
        .forEach((key) => {
          const val = value[key];
          const li = document.createElement("li");

          const keySpan = document.createElement("span");
          const content = key.toString();
          const isArrayLength = isObjArray && content === "length";
          keySpan.className = `key ${isArrayLength ? "length-key" : ""}`;
          keySpan.textContent = content;
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
    const indexProperty = ["(index)", ...properties];
    indexProperty.forEach((prop) => {
      const th = document.createElement("th");
      th.textContent = prop.toString();
      th.__property__ = prop;

      const toggle = document.createElement("span");
      toggle.className = "toggle";
      th.appendChild(toggle);
      tr.appendChild(th);
    });

    Array.from(tr.cells).forEach((th) => {
      th.style.cursor = "pointer";
      let ascending = true;
      th.addEventListener("click", () => {
        const rows = Array.from(tbody.querySelectorAll("tr"));
        const isIndex = th.__property__ === "(index)";
        rows.sort((rowA, rowB) => {
          const [valueA, valueB] = [rowA, rowB].map((row) =>
            isIndex ? row.__index__ : row.__inner__?.[th.__property__]
          );
          if (valueA < valueB) return ascending ? -1 : 1;
          if (valueA > valueB) return ascending ? 1 : -1;
          return 0;
        });
        rows.forEach((row) => tbody.appendChild(row));

        Array.from(tr.querySelectorAll(".toggle")).forEach(
          (toggle) => (toggle.textContent = "")
        );
        th.querySelector(".toggle").textContent = ascending ? "▼" : "▲";
        ascending = !ascending;
      });
    });

    thead.appendChild(tr);
    table.appendChild(thead);

    list.forEach((item, index) => {
      const tr = document.createElement("tr");
      indexProperty.forEach((prop) => {
        const isNotIndex = prop !== "(index)";
        const td = document.createElement("td");
        const propertyElement = isNotIndex
          ? this.createBaseElement(item[prop])
          : document.createTextNode(index);
        propertyElement && td.appendChild(propertyElement);
        tr.appendChild(td);
      });
      tr.__inner__ = item;
      tr.__index__ = index;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    return table;
  }

  // 属性观察
  static get observedAttributes() {
    return ["data", "method", "stack"];
  }

  // 当属性变化时更新组件
  attributeChangedCallback(name, oldValue, newValue) {
    // TODO: 优化更新逻辑, 避免重复渲染
    if (oldValue !== newValue) {
      try {
        if (name === "data") {
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
