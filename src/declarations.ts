import Aion from '@adoratorio/aion';

export enum TYPE {
  HTML = 'html',
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

export interface Easing {
  mode : Function,
  duration : number,
}

export interface Magnetism {
  mode : MODE,
  easing : Easing,
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
  mode: FOLLOW,
  cursor: HTMLElement | null,
  type: TYPE,
  easing: Easing,
  targets: Array<Target>,
  hiddenUntilFirstInteraction : boolean,
  detectTouch: boolean,
  emitGlobal: boolean,
  renderByPixel: boolean,
  onUpdate: Function,
  onEnter: Function,
  onMove: Function,
  onLeave: Function,
  aion: Aion | null,
  autoStart: boolean,
}

export interface Timeline {
  initial: Vec2,
  current: Vec2,
  final: Vec2,
}

export interface ApolloHTMLElement extends HTMLElement {
  apolloId : string,
}
