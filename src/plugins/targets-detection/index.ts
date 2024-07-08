import Apollo from "../..";
import { ApolloPlugin } from "../../declarations";
import { ApolloHTMLElement, TargetDescriptor, TargetsDetectionOptions } from "./declarations";
import SingleTarget from "./SingleTarget";
import { isInRect, isVisible, emitEvent } from './utils';

class TargetsDetection implements ApolloPlugin {
  private context : Apollo | null = null;
  private options : TargetsDetectionOptions;
  private _targets : Array<SingleTarget> = [];
  
  public name : string = 'TargetsDetection';
  public activeMouseTarget : SingleTarget | null = null;
  public activeCursorTarget : SingleTarget | null = null;

  constructor(options : Partial<TargetsDetectionOptions>) {
    const defaults : TargetsDetectionOptions = {
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

  public register(context : Apollo) : void {
    this.context = context;
  }

  public preFrame(context : Apollo, delta : number) {
    this._targets.forEach(target => target.frame(delta));

    this.checkTargets();
  }

  private checkTargets() {
    if (!this.context) return;

    // Check the out
    if (this.activeMouseTarget !== null && !isInRect(this.context.mouse, this.activeMouseTarget.boundings as DOMRect)) {
      emitEvent('apollo-mouse-leave', { target: this.activeMouseTarget });
      this.activeMouseTarget.descriptor.callback(this.activeMouseTarget, 'apollo-mouse-leave');
      this.activeMouseTarget = null;
    }
    if (this.activeCursorTarget !== null && !isInRect(this.context.coords, this.activeCursorTarget.boundings as DOMRect)) {
      emitEvent('apollo-cursor-leave', { target: this.activeCursorTarget });
      this.activeCursorTarget.descriptor.callback(this.activeCursorTarget, 'apollo-cursor-leave');
      this.activeCursorTarget = null;
    }

    let matchedOneMouse = false;
    let matchedOneCursor = false;
    for (let i = 0; i < this._targets.length; i++) {
      const target = this._targets[i];
      if (isVisible(target)) {
        // Check the in
        if (isInRect(this.context.mouse, target.boundings as DOMRect) && !matchedOneMouse) {
          if (this.activeMouseTarget === null || this.activeMouseTarget.id !== target.id) {
            if (this.activeMouseTarget !== null) {
              if (this.options.emitGlobal) emitEvent('apollo-mouse-leave', { target: this.activeMouseTarget });
              this.activeMouseTarget.descriptor.callback(this.activeMouseTarget, 'apollo-mouse-leave');
            }
            this.activeMouseTarget = target;
            if (this.options.emitGlobal) emitEvent('apollo-mouse-enter', { target: this.activeMouseTarget });
            this.activeMouseTarget.descriptor.callback(this.activeMouseTarget, 'apollo-mouse-enter');
          }
          matchedOneMouse = true;
        }
        if (isInRect(this.context.coords, target.boundings as DOMRect) && !matchedOneCursor) {
          if (this.activeCursorTarget === null || this.activeCursorTarget.id !== target.id) {
            if(this.activeCursorTarget !== null) {
              if (this.options.emitGlobal) emitEvent('apollo-cursor-leave', { target: this.activeCursorTarget });
              this.activeCursorTarget.descriptor.callback(this.activeCursorTarget, 'apollo-cursor-leave');
            }
            this.activeCursorTarget = target;
            if (this.options.emitGlobal) emitEvent('apollo-cursor-enter', { target: this.activeCursorTarget });
            this.activeCursorTarget.descriptor.callback(this.activeCursorTarget, 'apollo-cursor-enter');
          }
          matchedOneCursor = true;
        }
      }
    }
  }

  public render(context : Apollo, delta : number) {
    this._targets.forEach(target => target.render(delta));
  }

  public afterRender(context : Apollo, delta : number) {
    this._targets.forEach(target => target.postRender(delta));
  }

  public addTarget(target : TargetDescriptor) {
    target.elements.forEach((element, index) => {
      if (element._apolloId !== '-1') return;
      this._targets.push(new SingleTarget(element, target, index));
    });
  }

  public removeTarget(id : string) {
    for (let index = this._targets.length - 1; index >= 0; index--) {
      const target = this._targets[index];
      if (target.descriptor.id === id) {
        delete this._targets[index];
        this._targets.splice(index, 1);
      }
    }
  }
  
  public pullFromTarget(element : ApolloHTMLElement) {
    for (let index = this._targets.length - 1; index >= 0; index--) {
      const target = this._targets[index];
      if (target.id === element._apolloId) {
        element._apolloId = '-1';
        delete this._targets[index];
        this._targets.splice(index, 1);
      }
    }
  }
}

export default TargetsDetection;