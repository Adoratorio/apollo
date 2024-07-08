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
    this.boundings = {
      top: this.boundingRect.top - (this.descriptor.offset?.y || 0),
      bottom: this.boundingRect.bottom + (this.descriptor.offset?.y || 0),
      left: this.boundingRect.left - (this.descriptor.offset?.x || 0),
      right: this.boundingRect.right + (this.descriptor.offset?.x || 0),
      width: this.boundingRect.width + ((this.descriptor.offset?.x || 0) * 2),
      height: this.boundingRect.height + ((this.descriptor.offset?.y || 0) * 2),
    }
  }
}

export default SingleTarget;