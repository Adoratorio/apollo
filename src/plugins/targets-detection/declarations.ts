export const VISIBILITY_CHECK = {
  NONE: 'none',
  PARTIAL: 'partial',
  FULL: 'full',
}

export interface TargetDescriptor {
  id : string,
  elements : Array<ApolloHTMLElement>,
  offset : Vec2,
  callback : Function,
  checkVisibility : string,
}

export interface ApolloHTMLElement extends HTMLElement {
  _apolloId : string,
}

export interface Vec2 {
  x : number,
  y : number,
}

export interface TargetsDetectionOptions {
  targets : Array<TargetDescriptor>,
  emitGlobal : boolean,
}