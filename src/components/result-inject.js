// 代理Proxy，用于标记代理对象
const proxyInner = ((global, inner) => {
  const ProxyConstructor = global.Proxy;
  const proxyWeakMap = new WeakMap();
  function markedProxy(target, handler) {
    if (!new.target) {
      throw new TypeError("Constructor Proxy requires 'new'");
    }
    const result = new ProxyConstructor(target, handler);
    proxyWeakMap.set(result, target);
    return result;
  }
  global.Proxy = markedProxy;
  return {
    isProxy: function (obj) {
      return proxyWeakMap.has(obj);
    },
    toRaw: function (obj) {
      const result = proxyWeakMap.get(obj);
      return result ? this.toRaw(result) : obj;
    },
  };
})(globalThis);

// This is injected for console;
function customStringify(obj) {
  const seen = new Map();

  function markSeen(value) {
    const id = `#${seen.size}`;
    seen.set(value, id);
    return id;
  }

  function _stringify(value) {
    if (!value) {
      return value;
    }
    const type = typeof value;
    if (type === "object") {
      if (seen.has(value)) {
        return { $ref: seen.get(value) }; // 返回循环引用的标识符
      }
      if (proxyInner.isProxy(value)) {
        const raw = proxyInner.toRaw(value);
        return {
          $proxy: _stringify(raw),
        }; // 返回代理对象
      }
      const id = markSeen(value)
      if (Array.isArray(value)) {
        return { $id: id, $array: value.map(_stringify) }; // 处理数组
      }
      const result = {};
      Reflect.ownKeys(value).forEach((key) => {
        result[_stringify(key)] = _stringify(value[key]);
      });
      return { $id: id, ...result }; // 包含对象的唯一标识符
    }
    if (type === "function") {
      return {
        $function: value.toString(),
        $length: value.length,
        $name: value.name,
      };
    }
    if (type === "symbol") {
      return `${value.toString()}$symbol`; // 处理 Symbol
    }
    if (value === undefined) {
      return { $ref: "#undefined" }; // 处理 undefined
    }
    return value; // 直接返回非对象值
  }
  return JSON.stringify(_stringify(obj));
}

function getStack() {
  return new Error().stack
    .split("\n")
    .slice(2)
    .map((v) => v.trim().slice(3))
    .join("\n");
}

["clear", "log", "info", "warn", "error", "dir", "table", "trace"].forEach(
  (method) => {
    const originMethod = console[method];
    console[method] = (...message) => {
      originMethod.call(console, ...message);
      parent.postMessage({
        source: "result-show",
        stack: getStack(),
        method,
        content: customStringify(message),
      });
    };
  }
);

const timers = new Map();
const {
  time: originalTime,
  timeLog: originalTimeLog,
  timeEnd: originalTimeEnd,
} = console;
console.time = (label = "default") => {
  originalTime.call(console, label);
  timers.set(label, performance.now());
};
const showTimer = (label, method) => {
  const hasLabel = timers.has(label);
  parent.postMessage({
    source: "result-show",
    stack: getStack(),
    method: hasLabel ? method : "warn",
    content: customStringify([
      hasLabel
        ? `${label}: ${performance.now() - timers.get(label)}ms`
        : `Timer '${label}' does not exist`,
    ]),
  });
};
console.timeLog = (label = "default") => {
  originalTimeLog.call(console, label);
  showTimer(label, "timeLog");
};
console.timeEnd = (label = "default") => {
  originalTimeEnd.call(console, label);
  showTimer(label, "timeEnd");
  timers.delete(label);
};

const countMap = new Map();
const { count: originalCount, countReset: originalCountReset } = console;
console.count = (label = "default") => {
  originalCount.call(console, label);
  countMap.set(label, (countMap.get(label) || 0) + 1);
  parent.postMessage({
    source: "result-show",
    stack: getStack(),
    method: "count",
    content: customStringify([`${label}: ${countMap.get(label)}`]),
  });
};
console.countReset = (label = "default") => {
  originalCountReset.call(console, label);
  const hasLabel = countMap.has(label);
  if (hasLabel) {
    countMap.set(label, 0);
  } else {
    parent.postMessage({
      source: "result-show",
      stack: getStack(),
      method: "warn",
      content: customStringify([`Count for '${label}' does not exist`]),
    });
  }
};

window.addEventListener("error", (event) => {
  parent.postMessage({
    source: "result-show",
    stack: getStack(),
    method: "error",
    content: customStringify([event.message]),
  });
});

window.addEventListener("unhandledrejection", (event) => {
  parent.postMessage({
    source: "result-show",
    stack: getStack(),
    method: "error",
    content: customStringify([event.reason.message]),
  });
});