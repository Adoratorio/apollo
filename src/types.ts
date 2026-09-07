import type AionInstance from '@adoratorio/aion';
import { type EasingFunction } from './easing.ts';
import type Apollo from './index.ts';

export type Aion = AionInstance;

export interface Easing {
  mode: EasingFunction;
  duration: number;
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface ApolloOptions {
  // Opt in to immediate movement when the user requests reduced motion.
  respectReducedMotion?: boolean;
  easing: Easing;
  initialPosition: Vec2;
  detectTouch: boolean;
  aion: Aion | null;
  debug: boolean;
}

// Per-axis smoothing state: each frame moves `current` from `initial` towards
// `final` by the easing curve evaluated at `delta / duration`
export interface Timeline {
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

// Constructor input accepts partial nested settings; resolved options stay complete.
export type ApolloInputOptions = Omit<Partial<ApolloOptions>, 'easing' | 'initialPosition'> & {
  easing?: Partial<ApolloOptions['easing']>;
  initialPosition?: Partial<ApolloOptions['initialPosition']>;
};
