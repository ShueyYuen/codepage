export function download(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const element = document.createElement("a");
  element.style.display = "none";
  element.href = url;
  element.setAttribute("download", filename);
  document.body.appendChild(element);
  element.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(element);
}