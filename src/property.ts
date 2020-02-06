import Apollo from ".";
import {
  PROPERTY_SUFFIX,
  PROPERTY_TYPE,
  Timeline,
  PropertyDescriptor,
  Easing,
} from "./declarations";
import { updateTransform } from "./utils";

class Property {
  private _value : number;
  private playing : boolean;
  readonly id : string;
  readonly key : string;
  readonly type : PROPERTY_TYPE ;
  readonly target : Element | null | undefined;
  readonly suffix : PROPERTY_SUFFIX ;
  readonly timeline : Timeline;
  readonly easing : Easing;
  readonly precision : number;

  constructor(descriptor : PropertyDescriptor) {
    this.playing = true;
    this.id = descriptor.id;
    this.key = descriptor.key;
    this.type = descriptor.type;
    this.target = descriptor.target;
    this.suffix = descriptor.suffix;
    this.easing = descriptor.easing;
    this.timeline = {
      start: 0,
      duration: this.easing.duration,
      initial: descriptor.initial,
      final: descriptor.initial,
      current: descriptor.initial,
    };
    this._value = descriptor.initial;
    this.precision = descriptor.precision || 4;
  }

  frame(delta : number) {
    const deltaT : number = performance.now() - this.timeline.start;
    const deltaTClamp : number = Math.min(Math.max(deltaT, 0), this.timeline.duration);
    const time : number = this.easing.mode(deltaTClamp / this.timeline.duration);

    this.timeline.current = this.timeline.initial + (time * (this.timeline.final - this.timeline.initial));
  }

  render(delta : number) {
    if (!this.playing) return;
    if (this.target !== null && typeof this.target !== 'undefined') {
      const current = parseFloat(this.timeline.current.toFixed(this.precision));
      if (this.type === Apollo.PROPERTY_TYPE.TRANSFORM) {
        const transform = (this.target as HTMLElement).style.transform;
        if (transform !== null) {
          const updated = updateTransform(transform, this.key, this.value, this.suffix);
          (this.target as HTMLElement).style.transform = updated || '';
        }
      }
      if (this.type === Apollo.PROPERTY_TYPE.STYLE) {
        (this.target as HTMLElement).style[this.key as any] = `${current}${this.suffix}`;
      }
      if (this.type === Apollo.PROPERTY_TYPE.ATTRIBUTE) {
        this.target.setAttribute(this.key, `${current}${this.suffix}`);
      }
    }
  }

  postRender(delta : number) {
    this._value = this.timeline.current;
  }

  public get value() {
    return this._value;
  }

  public set value(value : number) {
    this.timeline.start = performance.now();
    this.timeline.initial = this._value;
    this.timeline.final = value;
  }

  public play(value : number | undefined) {
    if (typeof value === 'undefined') value = this.timeline.initial;
    this.timeline.start = performance.now();
    this.timeline.initial = value;
    this.timeline.current = value;
    this.timeline.final = value;
    this.playing = true;
  }

  public pause() {
    this.playing = false;
  }
}

export default Property;
