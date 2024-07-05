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
    this.boundingRect = this.element.getBoundingClientRect();
    this.boundings = {
      top: this.boundingRect.top - this.descriptor.offset.y,
      bottom: this.boundingRect.bottom + this.descriptor.offset.y,
      left: this.boundingRect.left - this.descriptor.offset.x,
      right: this.boundingRect.right + this.descriptor.offset.x,
      width: this.boundingRect.width + (this.descriptor.offset.x * 2),
      height: this.boundingRect.height + (this.descriptor.offset.y * 2),
    }
  }
}

export default SingleTarget;