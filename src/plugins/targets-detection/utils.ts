import { Vec2, VISIBILITY_CHECK } from "./declarations";
import SingleTarget from "./SingleTarget";

export function isInRect(point: Vec2, rect: DOMRect, offset: Vec2 = { x: 0, y: 0 }) {
  return (
    point.x >= (rect.left - offset.x) 
    && point.x <= (rect.right + offset.x)
    && point.y >= (rect.top - offset.y) 
    && point.y <= (rect.bottom + offset.y)
  )
}

export function isVisible(target: SingleTarget) {
  if (!target.descriptor.checkVisibility || target.descriptor.checkVisibility === VISIBILITY_CHECK.NONE) return true;

  const rect = target.boundingRect;
  const points = [
    { x: rect.left + 1, y: rect.top + 1 },
    { x: rect.left + 1, y: rect.bottom - 1 },
    { x: rect.right - 1, y: rect.top + 1 },
    { x: rect.right - 1, y: rect.bottom - 1 },
  ];
  
  const elements = points.map(({x, y}) => document.elementFromPoint(x, y));

  if (target.descriptor.checkVisibility === VISIBILITY_CHECK.PARTIAL) {
    return elements.some(el => target.element.contains(el));
  }

  if (target.descriptor.checkVisibility === VISIBILITY_CHECK.FULL) {
    return elements.every(el => target.element.contains(el));
  }

  return false;
}

export function emitEvent(id: string, payload: any) {
  const init: CustomEventInit = { };
  init.detail = payload;
  const customEvent = new CustomEvent(id, init);
  window.dispatchEvent(customEvent);
}