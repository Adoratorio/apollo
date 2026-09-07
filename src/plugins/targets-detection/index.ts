import { type ApolloPlugin, type Vec2 } from '../../types.ts';
import type Apollo from '../../index.ts';
import {
  EVENTS,
  VISIBILITY_CHECK,
  type TargetDescriptor,
  type TargetsDetectionOptions,
} from './types.ts';
import SingleTarget from './SingleTarget.ts';
import { emitEvent, isInRect, isVisible } from './utils.ts';

class TargetsDetection implements ApolloPlugin {
  static readonly VISIBILITY_CHECK: typeof VISIBILITY_CHECK = VISIBILITY_CHECK;
  static readonly EVENTS: typeof EVENTS = EVENTS;

  #context: Apollo | null = null;
  #options: TargetsDetectionOptions;
  #targets: SingleTarget[] = [];
  #elementsMap = new WeakMap<HTMLElement, SingleTarget>();
  #resizeObserver: ResizeObserver | null = null;
  // Boundings are recomputed at most once per frame, on the first frame after a
  // scroll/resize, instead of synchronously on every event
  #dirty = true;
  #markDirty = (): void => {
    this.#dirty = true;
  };

  public name = 'TargetsDetection';
  public activeMouseTarget: SingleTarget | null = null;
  public activeCursorTarget: SingleTarget | null = null;

  constructor(options: Partial<TargetsDetectionOptions> = {}) {
    const defaults: TargetsDetectionOptions = {
      targets: [],
      emitGlobal: true,
    };
    this.#options = { ...defaults, ...options };

    this.#options.targets.forEach((target) => {
      this.addTarget(target);
    });
  }

  public register(context: Apollo): void {
    this.#context = context;

    if (typeof window !== 'undefined') {
      // Capture-phase scroll also catches scrolling inside nested containers
      window.addEventListener('scroll', this.#markDirty, { passive: true, capture: true });
      window.addEventListener('resize', this.#markDirty, { passive: true });
      if (typeof ResizeObserver !== 'undefined' && typeof document !== 'undefined') {
        this.#resizeObserver = new ResizeObserver(this.#markDirty);
        this.#resizeObserver.observe(document.body);
      }
    }
    this.#dirty = true;
  }

  public preFrame(): void {
    if (this.#dirty) {
      this.#recalculateBoundings();
    }
    this.#checkTargets();
  }

  #recalculateBoundings(): void {
    for (const target of this.#targets) {
      target.calculateBoundings();
    }
    this.#dirty = false;
  }

  // Force a boundings recompute: useful when targets move without emitting a
  // scroll/resize event (e.g. transform-based/virtual scrolling)
  public recalculate(): void {
    this.#recalculateBoundings();
  }

  #emit(target: SingleTarget, event: EVENTS): void {
    if (this.#options.emitGlobal) {
      emitEvent(event, { target });
    }
    target.descriptor.callback?.(target, event);
  }

  // Resolves the target under `point`, emitting leave/enter as the active one
  // changes. The first matching target in registration order wins. Visibility
  // is only hit-tested for targets the point is inside of.
  #track(
    active: SingleTarget | null,
    point: Vec2,
    enter: EVENTS,
    leave: EVENTS,
  ): SingleTarget | null {
    let current = active;
    if (current !== null && !isInRect(point, current.boundings)) {
      this.#emit(current, leave);
      current = null;
    }

    const hit = this.#targets.find(
      (target) => isInRect(point, target.boundings) && isVisible(target),
    );
    if (hit && (current === null || current.id !== hit.id)) {
      if (current !== null) {
        this.#emit(current, leave);
      }
      current = hit;
      this.#emit(current, enter);
    }

    return current;
  }

  #checkTargets(): void {
    if (!this.#context) {
      return;
    }

    this.activeMouseTarget = this.#track(
      this.activeMouseTarget,
      this.#context.mouse,
      EVENTS.MOUSE_ENTER,
      EVENTS.MOUSE_LEAVE,
    );
    this.activeCursorTarget = this.#track(
      this.activeCursorTarget,
      this.#context.coords,
      EVENTS.CURSOR_ENTER,
      EVENTS.CURSOR_LEAVE,
    );
  }

  public addTarget(target: TargetDescriptor): void {
    target.elements.forEach((element, index) => {
      if (this.#elementsMap.has(element)) {
        return;
      }
      const singleTarget = new SingleTarget(element, target, index);
      this.#targets.push(singleTarget);
      this.#elementsMap.set(element, singleTarget);
    });
  }

  public removeTarget(id: string): void {
    for (let index = this.#targets.length - 1; index >= 0; index--) {
      const target = this.#targets[index];
      if (target && target.descriptor.id === id) {
        this.#drop(target, index);
      }
    }
  }

  public pullFromTarget(element: HTMLElement): void {
    const target = this.#elementsMap.get(element);
    if (!target) {
      return;
    }
    this.#drop(target, this.#targets.indexOf(target));
  }

  #drop(target: SingleTarget, index: number): void {
    this.#elementsMap.delete(target.element);
    if (index !== -1) {
      this.#targets.splice(index, 1);
    }
    if (this.activeMouseTarget === target) {
      this.activeMouseTarget = null;
    }
    if (this.activeCursorTarget === target) {
      this.activeCursorTarget = null;
    }
  }

  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.#markDirty, { capture: true });
      window.removeEventListener('resize', this.#markDirty);
    }
    if (this.#resizeObserver !== null) {
      this.#resizeObserver.disconnect();
      this.#resizeObserver = null;
    }
    this.#targets = [];
    this.#elementsMap = new WeakMap();
    this.activeMouseTarget = null;
    this.activeCursorTarget = null;
    this.#context = null;
  }
}

export default TargetsDetection;
