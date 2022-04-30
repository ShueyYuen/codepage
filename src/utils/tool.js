export const isFunction = (val) => typeof val === 'function';
export const isArray = Array.isArray;
export const isString = (val) => typeof val === 'string';
export const isSymbol = (val) => typeof val === 'symbol';
export const isObject = (val) => val !== null && typeof val === 'object';
const onRE = /^on[^a-z]/;
export const isOn = (key) => onRE.test(key);

export const b64EncodeUnicode = (str) => window.btoa(encodeURIComponent(str));

export const UnicodeDecodeB64 = (str) => decodeURIComponent(window.atob(str));