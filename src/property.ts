import Apollo from ".";
import {
  PROPERTY_SUFFIX,
  PROPERTY_TYPE,
  Timeline,
  PropertyDescriptior,
  Easing,
} from "./declarations";

class Property {
  private _value : number;
  readonly key : string;
  readonly type : PROPERTY_TYPE ;
  readonly target : Element | null | undefined;
  readonly suffix : PROPERTY_SUFFIX ;
  readonly timeline : Timeline;
  readonly easing : Easing;
  readonly renderByPixel : boolean | undefined;

  constructor(descriptor : PropertyDescriptior) {
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
    this.renderByPixel = descriptor.renderByPixel;
  }

  frame(delta : number) {
    const deltaT : number = performance.now() - this.timeline.start;
    const deltaTClamp : number = Math.min(Math.max(deltaT, 0), this.timeline.duration);
    const time : number = this.easing.mode(deltaTClamp / this.timeline.duration);

    this.timeline.current = this.timeline.initial + (time * (this.timeline.final - this.timeline.initial));
  }

  render(delta : number) {
    if (this.target !== null && typeof this.target !== 'undefined') {
      const current = this.renderByPixel ? Math.round(this.timeline.current) : this.timeline.current;
      if (this.type === Apollo.PROPERTY_TYPE.TRANSFORM) {
        (this.target as HTMLElement).style.transform = `${this.key}(${current}${this.suffix})`;
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
}

export default Property;
