import { Vec2, ApolloHTMLElement } from "./declarations";
import Target from "./target";

export function isInRect(point : Vec2, rect : ClientRect, offset : Vec2 = { x: 0, y: 0 }) {
  return (
    point.x >= (rect.left - offset.x) 
    && point.x <= (rect.right + offset.x)
    && point.y >= (rect.top - offset.y) 
    && point.y <= (rect.bottom + offset.y)
  )
}

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
    value: -1,
    configurable: true,
    enumerable: true,
    writable: true,
  });
}

export function isVisible(target : Target) {
  const topLeftElement = document.elementFromPoint(target.boundingRect.left + 1, target.boundingRect.top + 1) as ApolloHTMLElement;
  const bottomRightElement = document.elementFromPoint(target.boundingRect.right - 1, target.boundingRect.bottom - 1) as ApolloHTMLElement;
  if (topLeftElement === null && bottomRightElement === null) return false;
  if (topLeftElement !== null && target.id === topLeftElement._apolloId) return true;
  if (bottomRightElement !== null && target.id === bottomRightElement._apolloId) return true;
}