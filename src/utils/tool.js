export const isFunction = (val) => typeof val === 'function';
export const isArray = Array.isArray;
export const isString = (val) => typeof val === 'string';
export const isSymbol = (val) => typeof val === 'symbol';
export const isObject = (val) => val !== null && typeof val === 'object';
const onRE = /^on[^a-z]/;
export const isOn = (key) => onRE.test(key);

export const b64EncodeUnicode = (str) => window.btoa(encodeURIComponent(str));

export const UnicodeDecodeB64 = (str) => decodeURIComponent(window.atob(str));

export const arrayToBase64String = (a) => window.btoa(String.fromCharCode(...new Uint8Array(a)));

export const base64StringToArray = (s) => new Uint8Array([...window.atob(s)].map(char => char.charCodeAt(0)));

export const compress = (string, encoding='gzip') => {
  const byteArray = new TextEncoder().encode(string);
  const cs = new CompressionStream(encoding);
  const writer = cs.writable.getWriter();
  writer.write(byteArray);
  writer.close();
  return new Response(cs.readable).arrayBuffer();
}
  
export const decompress = (byteArray, encoding='gzip') => {
  const cs = new DecompressionStream(encoding);
  const writer = cs.writable.getWriter();
  writer.write(byteArray);
  writer.close();
  return new Response(cs.readable).arrayBuffer().then(function (arrayBuffer) {
    return new TextDecoder().decode(arrayBuffer);
  });
}