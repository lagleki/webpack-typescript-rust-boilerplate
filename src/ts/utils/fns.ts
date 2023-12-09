export function getRandomValueFromArray<T>(array: T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

export function typedArrayToBuffer(array: Uint8Array): ArrayBuffer {
  return array.buffer.slice(
    array.byteOffset,
    array.byteLength + array.byteOffset
  );
}

export function cloneObject<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export const fetchTimeout = async (url: string, ms = 5000, options = {}) => {
  const controller = new AbortController();
  const promise = fetch(url, { signal: controller.signal, ...options });
  const timeout = setTimeout(() => {
    controller.abort();
  }, ms);
  clearTimeout(timeout);
  return await promise;
};
