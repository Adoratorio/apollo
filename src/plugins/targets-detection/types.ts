import { type Vec2 } from '../../types.ts';
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

export type ApolloHTMLElement = HTMLElement;

export interface Rect {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
}

export interface TargetDescriptor {
  id: string;
  elements: ApolloHTMLElement[];
  offset?: Partial<Vec2>;
  callback?: TargetCallback;
  checkVisibility?: VISIBILITY_CHECK;
}

export interface TargetsDetectionOptions {
  targets: TargetDescriptor[];
  emitGlobal: boolean;
}

export type { Vec2 } from '../../types.ts';
