import { TargetDescriptor, ApolloHTMLElement } from "./declarations";

class Target {
  element : ApolloHTMLElement;
  descriptor : TargetDescriptor;
  id : string;
  boundingRect : ClientRect;
  boundings : ClientRect;

  constructor(element : ApolloHTMLElement, descriptor : TargetDescriptor, id : number) {
    this.element = element;
    this.descriptor = descriptor;
    this.id = `${this.descriptor.id}-${id}`;
    this.element._apolloId = this.id;
    this.boundingRect = this.element.getBoundingClientRect();
    this.boundings = {
      top: this.boundingRect.top - descriptor.offset.y,
      bottom: this.boundingRect.bottom + descriptor.offset.y,
      left: this.boundingRect.left - descriptor.offset.x,
      right: this.boundingRect.right + descriptor.offset.x,
      width: this.boundingRect.width + (descriptor.offset.x * 2),
      height: this.boundingRect.height + (descriptor.offset.y * 2),
    }
  }

  frame(delta : number) {

  }

  render(delta : number) {

  }

  postRender(delta : number) {

  }
}

export default Target;
