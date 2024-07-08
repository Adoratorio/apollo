import Aion from '@adoratorio/aion';

export interface Easing {
  mode : Function,
  duration : number,
}

export interface Vec2 {
  x : number,
  y : number,
}

export interface ApolloOptions {
  easing : Easing,
  initialPosition : Vec2,
  detectTouch : boolean,
  aion : Aion | null,
}

export interface Timeline {
  start : number,
  duration : number,
  initial: number,
  current: number,
  final: number,
}

export interface ApolloPlugin {
  id? : string,              // Plugin id assigned during registration
  name : string,             // Human readable name for the plugin
  register? : Function       // Called when the plugin is registered
  destroy? : Function        // Called when a plugin is unregistered
  preFrame? : Function       // Called at the start of the frame before apollo code
  frame? : Function          // Called each aion frame at the end of apollo code
  beforeRender? : Function   // Called before applying rendering to cursror
  afterRender? : Function    // Called after applying rendering to cursor
}