export function updateTransform(transform : string, key : string, value : number, suffix : string) {
  if (transform.indexOf(`${key}(`) >= 0) {
    const reg = new RegExp(`(${key}[\(]{1}[A-z0-9%-\.]*[\)]{1})`, 'i');
    return transform.replace(reg, `${key}(${value}${suffix})`);
  } else {
    return `${transform} ${key}(${value}${suffix})`;
  }
}

export function createProp() {
  Object.defineProperty(HTMLElement.prototype, '_apolloId', {
    value: '-1',
    configurable: true,
    enumerable: true,
    writable: true,
  });
}