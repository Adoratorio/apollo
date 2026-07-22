import { type TargetDescriptor } from './types.ts';

class SingleTarget {
  element: HTMLElement;
  descriptor: TargetDescriptor;
  id: string;
  boundingRect: DOMRect = new DOMRect();
  boundings: Partial<DOMRect> = {};

  constructor(element: HTMLElement, descriptor: TargetDescriptor, id: number) {
    this.element = element;
    this.descriptor = descriptor;
    this.id = `${this.descriptor.id}-${id}`;

    if (typeof this.descriptor.callback !== 'function') {
      this.descriptor.callback = () => {};
    }
    this.calculateBoundings();
  }

  calculateBoundings(): void {
    this.boundingRect = this.element.getBoundingClientRect();
    let offsetX = 0;
    let offsetY = 0;

    if (this.descriptor.offset && this.descriptor.offset.x) {
      offsetX = this.descriptor.offset.x;
    }
    if (this.descriptor.offset && this.descriptor.offset.y) {
      offsetY = this.descriptor.offset.y;
    }

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
