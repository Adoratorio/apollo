import { type Rect, type TargetDescriptor } from './types.ts';

const EMPTY_RECT: Rect = { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 };

class SingleTarget {
  element: HTMLElement;
  descriptor: TargetDescriptor;
  id: string;
  boundingRect: DOMRect = new DOMRect();
  // The bounding rect expanded by the descriptor offset
  boundings: Rect = { ...EMPTY_RECT };

  constructor(element: HTMLElement, descriptor: TargetDescriptor, id: number) {
    this.element = element;
    this.descriptor = descriptor;
    this.id = `${this.descriptor.id}-${id}`;
    this.calculateBoundings();
  }

  calculateBoundings(): void {
    this.boundingRect = this.element.getBoundingClientRect();
    const offsetX = this.descriptor.offset?.x ?? 0;
    const offsetY = this.descriptor.offset?.y ?? 0;

    this.boundings = {
      top: this.boundingRect.top - offsetY,
      bottom: this.boundingRect.bottom + offsetY,
      left: this.boundingRect.left - offsetX,
      right: this.boundingRect.right + offsetX,
      width: this.boundingRect.width + offsetX * 2,
      height: this.boundingRect.height + offsetY * 2,
    };
  }
}

export default SingleTarget;
