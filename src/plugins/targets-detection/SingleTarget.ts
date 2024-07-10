import { TargetDescriptor, ApolloHTMLElement } from "./declarations";

class SingleTarget {
  element : ApolloHTMLElement;
  descriptor : TargetDescriptor;
  id : string;
  boundingRect : DOMRect = {} as unknown as DOMRect;
  boundings : Partial<DOMRect> = {} as unknown as DOMRect;

  constructor(element : ApolloHTMLElement, descriptor : TargetDescriptor, id : number) {
    this.element = element;
    this.descriptor = descriptor;
    this.id = `${this.descriptor.id}-${id}`;
    this.element._apolloId = this.id;
    if (typeof this.descriptor.callback !== 'function') this.descriptor.callback = () => {};
    this.calculateBoundings();
  }
  
  frame(delta : number) {
    this.calculateBoundings();
  }
  
  render(delta : number) {
    
  }
  
  postRender(delta : number) {
    
  }
  
  calculateBoundings() {
    this.boundingRect = this.element.getBoundingClientRect() as DOMRect;
    let offsetX = 0;
    let offsetY = 0;
    if (this.descriptor.offset && this.descriptor.offset.x) offsetX = this.descriptor.offset.x;
    if (this.descriptor.offset && this.descriptor.offset.y) offsetY = this.descriptor.offset.y;

    this.boundings = {
      top: this.boundingRect.top - offsetY,
      bottom: this.boundingRect.bottom + offsetY,
      left: this.boundingRect.left - offsetX,
      right: this.boundingRect.right + offsetX,
      width: this.boundingRect.width + (offsetX * 2),
      height: this.boundingRect.height + (offsetY * 2),
    }
  }
}

export default SingleTarget;