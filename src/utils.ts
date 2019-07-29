import { Vec2 } from "./declarations";

export function isInRect(point : Vec2, rect : DOMRect, offset : Vec2) {
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