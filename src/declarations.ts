import Aion from '@adoratorio/aion';

export enum TYPE {
  HTML = 'html',
  SVG = 'svg',
  CANVAS = 'canvas',
}

export enum MODE {
  PULL = 'pull',
  PUSH = 'push',
}

export enum PUSH {
  TOP = 'top',
  TOPLEFT = 'topleft',
  TOPRIGHT = 'topright',
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  BOTTOMLEFT = 'bottomleft',
  BOTTOMRIGHT = 'bottomright',
}

export enum FOLLOW {
  MOUSE = 'mouse',
  CURSOR = 'cursor',
}

export interface Ease {
  easing : Function,
  duration : number,
}

export interface Magnetism {
  mode : MODE,
  ease : Ease,
  options? : PUSH,
}

export interface Vec2 {
  x : number,
  y : number,
}

export interface Target {
  id: string,
  elements : Array<HTMLElement>,
  offset : Vec2,
  magnetism : Magnetism | boolean,
}

export interface Element {
  domElement : HTMLElement,
  target : Target,
  timeline : Timeline,
  active : boolean,
  rect : any,
}

export interface ApolloOptions {
  follow: FOLLOW,
  container : HTMLElement,
  cursor : HTMLElement,
  type : TYPE,
  ease: Ease,
  targets: Array<Target>
  emitGlobal : boolean,
  onEnter : Function,
  onMove : Function,
  onLeave : Function,
  aion : Aion | null,
}

export interface Timeline {
  initial: Vec2,
  current: Vec2,
  final: Vec2,
}

export interface ApolloHTMLElement extends HTMLElement {
  apolloId : string,
}
