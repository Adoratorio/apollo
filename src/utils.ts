export function updateTransform(
  transform: string,
  key: string,
  value: number,
  suffix: string,
): string {
  if (transform.includes(`${key}(`)) {
    const reg = new RegExp(`(${key}[(]{1}[A-z0-9%-.]*[)]{1})`, 'i');
    return transform.replace(reg, `${key}(${value}${suffix})`);
  }
  return `${transform} ${key}(${value}${suffix})`;
}

export function createProp(): void {
  Object.defineProperty(HTMLElement.prototype, '_apolloId', {
    value: '-1',
    configurable: true,
    enumerable: true,
    writable: true,
  });
}
