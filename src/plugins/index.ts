import CSSRender from './css-render/index.ts';
import TargetsDetection from './targets-detection/index.ts';

export type { Vec2 } from '../types.ts';
export type { CSSRenderOptions, Size } from './css-render/types.ts';
export {
  EVENTS,
  VISIBILITY_CHECK,
  type ApolloHTMLElement,
  type Rect,
  type TargetCallback,
  type TargetDescriptor,
  type TargetsDetectionOptions,
} from './targets-detection/types.ts';

const plugins: {
  CSSRender: typeof CSSRender;
  TargetsDetection: typeof TargetsDetection;
} = {
  CSSRender,
  TargetsDetection,
};

export { default as CSSRender } from './css-render/index.ts';
export { default as TargetsDetection } from './targets-detection/index.ts';
export { default as SingleTarget } from './targets-detection/SingleTarget.ts';

export default plugins;
