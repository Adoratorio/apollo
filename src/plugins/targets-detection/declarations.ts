import type SingleTarget from './SingleTarget.ts';

export const VISIBILITY_CHECK = {
  NONE: 'none',
  PARTIAL: 'partial',
  FULL: 'full',
} as const;

export type VISIBILITY_CHECK = (typeof VISIBILITY_CHECK)[keyof typeof VISIBILITY_CHECK];

export const EVENTS = {
  MOUSE_ENTER: 'apollo-mouse-enter',
  MOUSE_LEAVE: 'apollo-mouse-leave',
  CURSOR_ENTER: 'apollo-cursor-enter',
  CURSOR_LEAVE: 'apollo-cursor-leave',
} as const;

export type EVENTS = (typeof EVENTS)[keyof typeof EVENTS];

export type TargetCallback = (target: SingleTarget, event: EVENTS) => void;

export interface TargetDescriptor {
  id: string;
  elements: ApolloHTMLElement[];
  offset: Vec2;
  callback: TargetCallback;
  checkVisibility: VISIBILITY_CHECK;
}

export interface ApolloHTMLElement extends HTMLElement {
  _apolloId: string;
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface TargetsDetectionOptions {
  targets: TargetDescriptor[];
  emitGlobal: boolean;
}
