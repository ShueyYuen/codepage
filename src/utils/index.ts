export const isFunction = (val: any) => typeof val === 'function';
export const isArray = Array.isArray;
export const isString = (val: any) => typeof val === 'string';
export const isSymbol = (val: any) => typeof val === 'symbol';
export const isObject = (val: null) => val !== null && typeof val === 'object';
const onRE = /^on[^a-z]/;
export const isOn = (key: string) => onRE.test(key);