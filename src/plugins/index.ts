import CSSRender from './css-render/index.ts';
import TargetsDetection from './targets-detection/index.ts';

export type { CSSRenderOptions } from './css-render/declarations.ts';
export {
  EVENTS,
  VISIBILITY_CHECK,
  type ApolloHTMLElement,
  type TargetCallback,
  type TargetDescriptor,
  type TargetsDetectionOptions,
  type Vec2,
} from './targets-detection/declarations.ts';

const plugins: {
  CSSRender: typeof CSSRender;
  TargetsDetection: typeof TargetsDetection;
} = {
  CSSRender,
  TargetsDetection,
};

export { CSSRender, TargetsDetection };

export default plugins;
