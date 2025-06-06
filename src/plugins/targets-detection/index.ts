import Apollo from "../..";
import { ApolloPlugin } from "../../declarations";
import { ApolloHTMLElement, TargetDescriptor, TargetsDetectionOptions, VISIBILITY_CHECK } from "./declarations";
import SingleTarget from "./SingleTarget";
import { isInRect, isVisible, emitEvent } from './utils';

class TargetsDetection implements ApolloPlugin {
  private context: Apollo | null = null;
  private options: TargetsDetectionOptions;
  private _targets: Array<SingleTarget> = [];
  
  public name: string = 'TargetsDetection';
  public activeMouseTarget: SingleTarget | null = null;
  public activeCursorTarget: SingleTarget | null = null;

  static VISIBILITY_CHECK = VISIBILITY_CHECK;

  static EVENTS = {
    MOUSE_ENTER: 'apollo-mouse-enter',
    MOUSE_LEAVE: 'apollo-mouse-leave',
    CURSOR_ENTER: 'apollo-cursor-enter',
    CURSOR_LEAVE: 'apollo-cursor-leave',
  };

  constructor(options: Partial<TargetsDetectionOptions>) {
    const defaults: TargetsDetectionOptions = {
      targets: [],
      emitGlobal: true,
    };

    this.options = { ...defaults, ...options };

    // Add all the targets
    this.options.targets.forEach((target) => {
      target.elements.forEach((element, index) => {
        this._targets.push(new SingleTarget(element, target, index));
      })
    });
  }

  public register(context: Apollo): void {
    this.context = context;
  }

  // @ts-ignore
  public preFrame(context: Apollo, delta: number) {
    this._targets.forEach(target => target.frame(delta));

    this.checkTargets();
  }

  private checkTargets() {
    if (!this.context) return;

    // Check the out
    if (this.activeMouseTarget !== null && !isInRect(this.context.mouse, this.activeMouseTarget.boundings as DOMRect)) {
      emitEvent(TargetsDetection.EVENTS.MOUSE_LEAVE, { target: this.activeMouseTarget });
      this.activeMouseTarget.descriptor.callback(this.activeMouseTarget, TargetsDetection.EVENTS.MOUSE_LEAVE);
      this.activeMouseTarget = null;
    }
    if (this.activeCursorTarget !== null && !isInRect(this.context.coords, this.activeCursorTarget.boundings as DOMRect)) {
      emitEvent(TargetsDetection.EVENTS.CURSOR_LEAVE, { target: this.activeCursorTarget });
      this.activeCursorTarget.descriptor.callback(this.activeCursorTarget, TargetsDetection.EVENTS.CURSOR_LEAVE);
      this.activeCursorTarget = null;
    }

    let matchedOneMouse = false;
    let matchedOneCursor = false;
    for (let i = 0; i < this._targets.length; i++) {
      const target = this._targets[i];
      if (target && isVisible(target)) {
        // Check the in
        if (isInRect(this.context.mouse, target.boundings as DOMRect) && !matchedOneMouse) {
          if (this.activeMouseTarget === null || this.activeMouseTarget.id !== target.id) {
            if (this.activeMouseTarget !== null) {
              if (this.options.emitGlobal)
                emitEvent(TargetsDetection.EVENTS.MOUSE_LEAVE, { target: this.activeMouseTarget });
              this.activeMouseTarget.descriptor.callback(this.activeMouseTarget, TargetsDetection.EVENTS.MOUSE_LEAVE);
            }
            this.activeMouseTarget = target;
            if (this.options.emitGlobal)
              emitEvent(TargetsDetection.EVENTS.MOUSE_ENTER, { target: this.activeMouseTarget });
            this.activeMouseTarget.descriptor.callback(this.activeMouseTarget, TargetsDetection.EVENTS.MOUSE_ENTER);
          }
          matchedOneMouse = true;
        }
        if (isInRect(this.context.coords, target.boundings as DOMRect) && !matchedOneCursor) {
          if (this.activeCursorTarget === null || this.activeCursorTarget.id !== target.id) {
            if(this.activeCursorTarget !== null) {
              if (this.options.emitGlobal)
                emitEvent(TargetsDetection.EVENTS.CURSOR_LEAVE, { target: this.activeCursorTarget });
              this.activeCursorTarget.descriptor.callback(this.activeCursorTarget, TargetsDetection.EVENTS.CURSOR_LEAVE);
            }
            this.activeCursorTarget = target;
            if (this.options.emitGlobal)
              emitEvent(TargetsDetection.EVENTS.CURSOR_ENTER, { target: this.activeCursorTarget });
            this.activeCursorTarget.descriptor.callback(this.activeCursorTarget, TargetsDetection.EVENTS.CURSOR_ENTER);
          }
          matchedOneCursor = true;
        }
      }
    }
  }

  // @ts-ignore
  public render(context: Apollo, delta: number) {
    this._targets.forEach(target => target.render(delta));
  }

  // @ts-ignore
  public afterRender(context: Apollo, delta: number) {
    this._targets.forEach(target => target.postRender(delta));
  }

  public addTarget(target: TargetDescriptor) {
    target.elements.forEach((element, index) => {
      if (element._apolloId !== '-1') return;
      this._targets.push(new SingleTarget(element, target, index));
    });
  }

  public removeTarget(id: string) {
    for (let index = this._targets.length - 1; index >= 0; index--) {
      const target = this._targets[index];
      if (target && target.descriptor.id === id) {
        this._targets.splice(index, 1);
      }
    }
  }
  
  public pullFromTarget(element: ApolloHTMLElement) {
    for (let index = this._targets.length - 1; index >= 0; index--) {
      const target = this._targets[index];
      if (target && target.id === element._apolloId) {
        element._apolloId = '-1';
        this._targets.splice(index, 1);
      }
    }
  }
}

export default TargetsDetection;