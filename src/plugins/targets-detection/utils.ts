import { Vec2, ApolloHTMLElement } from "./declarations";
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
  if (!target.descriptor.checkVisibility) return true;
  const topMostLeftElement = document.elementFromPoint(target.boundingRect.left + 1, target.boundingRect.top + 1) as ApolloHTMLElement;
  const bottomMostRightElement = document.elementFromPoint(target.boundingRect.right - 1, target.boundingRect.bottom - 1) as ApolloHTMLElement;

  if (topMostLeftElement !== null && bottomMostRightElement !== null) {
    if (topMostLeftElement._apolloId === target.id) return true;
    if (bottomMostRightElement._apolloId === target.id) return true;

    let topMostLeftElementParent = topMostLeftElement.parentNode as ApolloHTMLElement;
    let topLeftElementIsValid = false;
    while(
      topMostLeftElementParent
      && topMostLeftElementParent.nodeName.toLocaleLowerCase() !== 'body'
      && !topLeftElementIsValid
    ) {
      if (topMostLeftElementParent._apolloId !== '-1' && topMostLeftElementParent._apolloId === target.id) {
        topLeftElementIsValid = true;
      }
      topMostLeftElementParent = topMostLeftElementParent.parentNode as ApolloHTMLElement;
    }
    let bottomMostRightElementParent = bottomMostRightElement.parentNode as ApolloHTMLElement;
    let bottomRightElementIsValid = false;
    while(
      bottomMostRightElementParent
      && bottomMostRightElementParent.nodeName.toLocaleLowerCase() !== 'body'
      && !bottomRightElementIsValid
    ) {
      if (bottomMostRightElementParent._apolloId !== '-1' && bottomMostRightElementParent._apolloId === target.id) {
        bottomRightElementIsValid = true;
      }
      bottomMostRightElementParent = bottomMostRightElementParent.parentNode as ApolloHTMLElement;
    }
    return topLeftElementIsValid || bottomRightElementIsValid;
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