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
    value: '-1',
    configurable: true,
    enumerable: true,
    writable: true,
  });
}

export function isVisible(target : Target) {
  const topLeftElements = document.elementsFromPoint(target.boundingRect.left + 1, target.boundingRect.top + 1) as Array<ApolloHTMLElement>;
  const bottomRightElements = document.elementsFromPoint(target.boundingRect.right - 1, target.boundingRect.bottom - 1) as Array<ApolloHTMLElement>;
  // const topLeftElement = topLeftElements.find(e => e._apolloId !== '-1' && e._apolloId === target.id);
  // const bottomRightElement = bottomRightElements.find(e => e._apolloId !== '-1' && e._apolloId === target.id);
  const topLeftElement = topLeftElements[0];
  const bottomRightElement = bottomRightElements[0];
  if (typeof topLeftElement !== 'undefined' && typeof bottomRightElement !== 'undefined') {
    if (topLeftElement !== null && target.id === topLeftElement._apolloId) return true;
    if (bottomRightElement !== null && target.id === bottomRightElement._apolloId) return true;
  } else {
    return false;
  }
}

export function emitEvent(id : string, payload : any) {
  const init : CustomEventInit = { };
  init.detail = payload;
  const customEvent = new CustomEvent(id, init);
  window.dispatchEvent(customEvent);
}