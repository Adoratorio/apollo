import { Vec2, ApolloHTMLElement, VISIBILITY_CHECK } from "./declarations";
import SingleTarget from "./SingleTarget";

export function isInRect(point : Vec2, rect : DOMRect, offset : Vec2 = { x: 0, y: 0 }) {
  return (
    point.x >= (rect.left - offset.x) 
    && point.x <= (rect.right + offset.x)
    && point.y >= (rect.top - offset.y) 
    && point.y <= (rect.bottom + offset.y)
  )
}

export function isVisible(target : SingleTarget) {
  if (!target.descriptor.checkVisibility || target.descriptor.checkVisibility === VISIBILITY_CHECK.NONE) return true;

  const topLeftElement = document.elementFromPoint(target.boundingRect.left + 1, target.boundingRect.top + 1);
  const bottomLeftElement = document.elementFromPoint(target.boundingRect.left + 1, target.boundingRect.bottom - 1);
  const topRightElement = document.elementFromPoint(target.boundingRect.right - 1, target.boundingRect.top + 1);
  const bottomRightElement = document.elementFromPoint(target.boundingRect.right - 1, target.boundingRect.bottom - 1);

  if (target.descriptor.checkVisibility === VISIBILITY_CHECK.PARTIAL) {
    if (target.element.contains(topLeftElement)) return true;
    if (target.element.contains(bottomLeftElement)) return true;
    if (target.element.contains(topRightElement)) return true;
    if (target.element.contains(bottomRightElement)) return true;

    return false;
  }

  if (target.descriptor.checkVisibility === VISIBILITY_CHECK.FULL) {
    if(
      target.element.contains(topLeftElement) &&
      target.element.contains(bottomLeftElement) &&
      target.element.contains(topRightElement) &&
      target.element.contains(bottomRightElement)
    ) return true;
    return false;
  }

  return false;
}

export function emitEvent(id : string, payload : any) {
  const init : CustomEventInit = { };
  init.detail = payload;
  const customEvent = new CustomEvent(id, init);
  window.dispatchEvent(customEvent);
}