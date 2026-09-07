import { VISIBILITY_CHECK, type Rect, type Vec2 } from './types.ts';
import type SingleTarget from './SingleTarget.ts';

export function isInRect(point: Vec2, rect: Rect): boolean {
  return (
    point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom
  );
}

// Hit-tests the four corners of the target; expensive (forces layout), so it
// is only called for targets the point is already inside of
export function isVisible(target: SingleTarget): boolean {
  const check = target.descriptor.checkVisibility ?? VISIBILITY_CHECK.NONE;
  if (check === VISIBILITY_CHECK.NONE) {
    return true;
  }

  const rect = target.boundingRect;
  const points = [
    { x: rect.left + 1, y: rect.top + 1 },
    { x: rect.left + 1, y: rect.bottom - 1 },
    { x: rect.right - 1, y: rect.top + 1 },
    { x: rect.right - 1, y: rect.bottom - 1 },
  ];

  const elements = points.map(({ x, y }) => document.elementFromPoint(x, y));

  if (check === VISIBILITY_CHECK.PARTIAL) {
    return elements.some((el) => target.element.contains(el));
  }

  return elements.every((el) => target.element.contains(el));
}

export function emitEvent(id: string, payload: unknown): void {
  window.dispatchEvent(new CustomEvent(id, { detail: payload }));
}
