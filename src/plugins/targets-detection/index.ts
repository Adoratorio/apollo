import { type ApolloPlugin } from '../../types.ts';
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
  #recalculateHandler: () => void;
  #resizeObserver: ResizeObserver | null = null;

  public name = 'TargetsDetection';
  public activeMouseTarget: SingleTarget | null = null;
  public activeCursorTarget: SingleTarget | null = null;

  constructor(options: Partial<TargetsDetectionOptions> = {}) {
    this.#recalculateHandler = (): void => this.#recalculateBoundings();

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
      // Recompute cached boundings on scroll/resize instead of every frame.
      // Capture-phase scroll also catches scrolling inside nested containers.
      window.addEventListener('scroll', this.#recalculateHandler, { passive: true, capture: true });
      window.addEventListener('resize', this.#recalculateHandler, { passive: true });
      if (typeof ResizeObserver !== 'undefined' && typeof document !== 'undefined') {
        this.#resizeObserver = new ResizeObserver(this.#recalculateHandler);
        this.#resizeObserver.observe(document.body);
      }
    }
    this.#recalculateBoundings();
  }

  public preFrame(): void {
    this.#checkTargets();
  }

  #recalculateBoundings(): void {
    for (const target of this.#targets) {
      target.calculateBoundings();
    }
  }

  // Force a boundings recompute — useful when targets move without emitting a
  // scroll/resize event (e.g. transform-based/virtual scrolling).
  public recalculate(): void {
    this.#recalculateBoundings();
  }

  #checkTargets(): void {
    if (!this.#context) {
      return;
    }

    if (
      this.activeMouseTarget !== null &&
      !isInRect(this.#context.mouse, this.activeMouseTarget.boundings as DOMRect)
    ) {
      if (this.#options.emitGlobal) {
        emitEvent(TargetsDetection.EVENTS.MOUSE_LEAVE, { target: this.activeMouseTarget });
      }
      this.activeMouseTarget.descriptor.callback(
        this.activeMouseTarget,
        TargetsDetection.EVENTS.MOUSE_LEAVE,
      );
      this.activeMouseTarget = null;
    }

    if (
      this.activeCursorTarget !== null &&
      !isInRect(this.#context.coords, this.activeCursorTarget.boundings as DOMRect)
    ) {
      if (this.#options.emitGlobal) {
        emitEvent(TargetsDetection.EVENTS.CURSOR_LEAVE, { target: this.activeCursorTarget });
      }
      this.activeCursorTarget.descriptor.callback(
        this.activeCursorTarget,
        TargetsDetection.EVENTS.CURSOR_LEAVE,
      );
      this.activeCursorTarget = null;
    }

    let matchedOneMouse = false;
    let matchedOneCursor = false;

    for (const target of this.#targets) {
      if (isVisible(target)) {
        if (isInRect(this.#context.mouse, target.boundings as DOMRect) && !matchedOneMouse) {
          if (this.activeMouseTarget === null || this.activeMouseTarget.id !== target.id) {
            if (this.activeMouseTarget !== null) {
              if (this.#options.emitGlobal) {
                emitEvent(TargetsDetection.EVENTS.MOUSE_LEAVE, { target: this.activeMouseTarget });
              }
              this.activeMouseTarget.descriptor.callback(
                this.activeMouseTarget,
                TargetsDetection.EVENTS.MOUSE_LEAVE,
              );
            }
            this.activeMouseTarget = target;
            if (this.#options.emitGlobal) {
              emitEvent(TargetsDetection.EVENTS.MOUSE_ENTER, { target: this.activeMouseTarget });
            }
            this.activeMouseTarget.descriptor.callback(
              this.activeMouseTarget,
              TargetsDetection.EVENTS.MOUSE_ENTER,
            );
          }
          matchedOneMouse = true;
        }

        if (isInRect(this.#context.coords, target.boundings as DOMRect) && !matchedOneCursor) {
          if (this.activeCursorTarget === null || this.activeCursorTarget.id !== target.id) {
            if (this.activeCursorTarget !== null) {
              if (this.#options.emitGlobal) {
                emitEvent(TargetsDetection.EVENTS.CURSOR_LEAVE, {
                  target: this.activeCursorTarget,
                });
              }
              this.activeCursorTarget.descriptor.callback(
                this.activeCursorTarget,
                TargetsDetection.EVENTS.CURSOR_LEAVE,
              );
            }
            this.activeCursorTarget = target;
            if (this.#options.emitGlobal) {
              emitEvent(TargetsDetection.EVENTS.CURSOR_ENTER, {
                target: this.activeCursorTarget,
              });
            }
            this.activeCursorTarget.descriptor.callback(
              this.activeCursorTarget,
              TargetsDetection.EVENTS.CURSOR_ENTER,
            );
          }
          matchedOneCursor = true;
        }
      }
    }
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
        this.#elementsMap.delete(target.element);
        this.#targets.splice(index, 1);
      }
    }
  }

  public pullFromTarget(element: HTMLElement): void {
    if (this.#elementsMap.has(element)) {
      const targetToRemove = this.#elementsMap.get(element);
      if (targetToRemove) {
        this.#elementsMap.delete(element);
        const index = this.#targets.indexOf(targetToRemove);
        if (index !== -1) {
          this.#targets.splice(index, 1);
        }
      }
    }
  }

  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.#recalculateHandler, { capture: true });
      window.removeEventListener('resize', this.#recalculateHandler);
    }
    if (this.#resizeObserver !== null) {
      this.#resizeObserver.disconnect();
      this.#resizeObserver = null;
    }
  }
}

export default TargetsDetection;
