export function dataUrlToBlob(dataUrl: string) {
  const [header, payload] = dataUrl.split(",");
  const mimeType = header.match(/data:(.*?);base64/)?.[1] ?? "application/octet-stream";
  const bytes = Uint8Array.from(atob(payload ?? ""), (char) => char.charCodeAt(0));
  return new Blob([bytes], { type: mimeType });
}

export function dataUrlToServerBlob(dataUrl: string) {
  return fetch(dataUrl).then((response) => response.blob());
}

