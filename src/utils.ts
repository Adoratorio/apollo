import { Vec2 } from "./declarations";

export function isInRect(point : Vec2, rect : DOMRect, offset : Vec2) {
  return (
    point.x >= (rect.left - offset.x) 
    && point.x <= (rect.right + offset.x)
    && point.y >= (rect.top - offset.y) 
    && point.y <= (rect.bottom + offset.y)
  )
}