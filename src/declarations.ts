import Aion from '@adoratorio/aion';

export enum PROPERTY_SUFFIX {
  NO_SUFFIX = '',
  PIXEL = 'px',
  PERCENTAGE = '%',
  DEG = 'deg',
  SECONDS = 's',
}

export enum PROPERTY_TYPE {
  TYPELESS = 'typeless',
  STYLE = 'style',
  TRANSFORM = 'transform',
  ATTRIBUTE = 'attribute',
}

export interface PropertyDescriptor {
  key : string,
  type : PROPERTY_TYPE,
  target? : Element | null,
  suffix : PROPERTY_SUFFIX,
  easing : Easing,
  initial : number,
  precision? : number,
}

export interface TargetDescriptor {
  id : string,
  elements : Array<ApolloHTMLElement>,
  offset : Vec2,
  callback : Function,
}

export interface ApolloHTMLElement extends HTMLElement {
  _apolloId : string,
}

export enum TYPE {
  HTML = 'html',
  CANVAS = 'canvas',
  SVG = 'svg',
}

export interface Easing {
  mode : Function,
  duration : number,
}

export interface Vec2 {
  x : number,
  y : number,
}

export interface ApolloOptions {
  cursor : HTMLElement | null,
  props : Array<PropertyDescriptor>,
  easing : Easing,
  targets : Array<TargetDescriptor>,
  hiddenUntilFirstInteraction : boolean,
  initialPosition : Vec2,
  detectTouch : boolean,
  emitGlobal : boolean,
  aion : Aion | null,
  renderByPixel : boolean,
  callbacks : {
    frame : Function,
    render : Function,
    postRender : Function,
  }
}

export interface Timeline {
  start : number,
  duration : number,
  initial: number,
  current: number,
  final: number,
}