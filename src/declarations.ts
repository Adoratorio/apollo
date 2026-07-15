import type AionModule from '@adoratorio/aion';
import { type EasingFunction } from './easing.ts';
import type Apollo from './index.ts';

// `@adoratorio/aion` ships legacy CJS-style typings, so under NodeNext the
// default import is typed as the module namespace: the instance type is
// re-derived from its `default` member (bundlers resolve the real ESM class).
export type Aion = InstanceType<(typeof AionModule)['default']>;

export interface Easing {
  mode: EasingFunction;
  duration: number;
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface ApolloOptions {
  easing: Easing;
  initialPosition: Vec2;
  detectTouch: boolean;
  aion: Aion | null;
}

export interface Timeline {
  start: number;
  duration: number;
  initial: number;
  current: number;
  final: number;
}

export interface ApolloPlugin {
  // Plugin id assigned during registration
  id?: string;
  // Human readable name for the plugin
  name: string;
  // Called when the plugin is registered
  register?: (context: Apollo) => void;
  // Called when a plugin is unregistered
  destroy?: () => void;
  // Called at the start of the frame before apollo code
  preFrame?: (context: Apollo, delta: number) => void;
  // Called each aion frame after apollo calculations
  frame?: (context: Apollo, delta: number) => void;
  // Called at the very end of apollo frame code
  afterFrame?: (context: Apollo, delta: number) => void;
}
