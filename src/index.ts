import Aion from '@adoratorio/aion';
import {
  ApolloOptions,
  Vec2,
  Timeline,
  PROPERTY_TYPE,
  PROPERTY_SUFFIX,
  TargetDescriptor,
  PropertyDescriptor,
  ApolloHTMLElement,
} from './declarations';
import Easings from './easing';
import Property from './property';
import Target from './target';
import { createProp, isInRect, isVisible, emitEvent } from './utils';

class Apollo {
  static EASING = Easings;
  static PROPERTY_TYPE = PROPERTY_TYPE;
  static PROPERTY_SUFFIX = PROPERTY_SUFFIX;

  private options : ApolloOptions;
  private _properties : Array<Property>;
  private _targets : Array<Target>;
  private mousePosition : Vec2;
  private mouseRenderPosition : Vec2;
  private _trackMouse : boolean;
  private cursorPosition : Vec2;
  private cursorPositionPrev : Vec2 = { x: 0, y: 0 };
  private cursorBounding : ClientRect;
  private _velocity : Vec2 = { x: 0, y: 0 };
  private _direction : Vec2 = { x: 0, y: 0 };
  private engine : Aion;
  private frameHandler : Function;
  private cursorXTimeline : Timeline;
  private cursorYTimeline : Timeline;
  public activeMouseTarget : Target | null = null;
  public activeCursorTarget : Target | null = null;

  constructor(options : Partial<ApolloOptions>) {
    createProp();
    const defaults : ApolloOptions = {
      cursor: document.querySelector('.apollo__cursor') as HTMLElement,
      props: [],
      easing: {
        mode: Apollo.EASING.CUBIC,
        duration: 1000,
      },
      targets: [],
      hiddenUntilFirstInteraction: false,
      initialPosition: { x: 0, y: 0 },
      detectTouch: false,
      emitGlobal: false,
      aion: null,
      renderByPixel: false,
      callbacks: {
        frame: () => {},
        render: () => {},
        postRender: () => {},
      },
      render: true,
    }
    this.options = {...defaults, ...options};

    if (typeof this.options.callbacks.frame === 'undefined') this.options.callbacks.frame = () => {};
    if (typeof this.options.callbacks.render === 'undefined') this.options.callbacks.render = () => {};
    if (typeof this.options.callbacks.postRender === 'undefined') this.options.callbacks.postRender = () => {};

    // Set the initial mouse position
    this.mousePosition = this.options.initialPosition;
    this.mouseRenderPosition = this.mousePosition;
    this.cursorPosition = this.mousePosition;
    this.cursorBounding = (this.cursorElement as HTMLElement).getBoundingClientRect();
    this.cursorXTimeline = {
      start: 0,
      duration: this.options.easing.duration,
      initial: this.cursorPosition.x,
      current: this.cursorPosition.x,
      final: this.cursorPosition.x,
    };
    this.cursorYTimeline = {
      start: 0,
      duration: this.options.easing.duration,
      initial: this.cursorPosition.y,
      current: this.cursorPosition.y,
      final: this.cursorPosition.y,
    };
    // Create or set the engine
    if (this.options.aion !== null) {
      this.engine = this.options.aion;
    } else {
      this.engine = new Aion();
      this.engine.start();
    }
    // For each prop descriptor start the property
    this._properties = [];
    this.options.props.forEach((prop) => {
      this._properties.push(new Property(prop));
    });
    // Add all the targets
    this._targets = [];
    this.options.targets.forEach((target) => {
      target.elements.forEach((element, index) => {
        this._targets.push(new Target(element, target, index));
      })
    });

    this.frameHandler = (delta : number) => { this.frame(delta); };
    this.engine.add(this.frameHandler, 'apollo-frame');
    this.bindEvents();

    this._trackMouse = true;
  }

  private frame = (delta : number) : void => {
    this.options.callbacks.frame(this.coords, this.mouse);
    this._properties.forEach(property => property.frame(delta));
    this._targets.forEach(target => target.frame(delta));

    this.checkTargets();

    this.cursorXTimeline.final = this.mouseRenderPosition.x;
    this.cursorYTimeline.final = this.mouseRenderPosition.y;
  
    const deltaT : number = Math.min(Math.max(delta, 0), this.options.easing.duration);
    const time : number = this.options.easing.mode(deltaT / this.options.easing.duration);

    this.cursorXTimeline.current = this.cursorXTimeline.initial + (time * (this.cursorXTimeline.final - this.cursorXTimeline.initial));
    this.cursorYTimeline.current = this.cursorYTimeline.initial + (time * (this.cursorYTimeline.final - this.cursorYTimeline.initial));

    const position = {
      x: this.cursorXTimeline.current - this.cursorBounding.width / 2,
      y: this.cursorYTimeline.current - this.cursorBounding.height / 2,
    };

    const roundedPosition = {
      x: Math.round(this.cursorXTimeline.current - this.cursorBounding.width / 2),
      y: Math.round(this.cursorYTimeline.current - this.cursorBounding.height / 2),
    };

    this.cursorPosition = this.options.renderByPixel ? roundedPosition : position;
    
    this.render(delta);
  }
  
  private render = (delta : number) : void => {
    if (!this.options.render) return;
    this.options.callbacks.render(this.coords, this.mouse);
    this._properties.forEach(property => property.render(delta));
    this._targets.forEach(target => target.render(delta));

    if (this.cursorElement !== null) {
      const transform = `translateX(${this.cursorPosition.x}px) translateY(${this.cursorPosition.y}px) translateZ(0px)`;
      (this.cursorElement as HTMLElement).style.transform = transform;
    }

    this.postRender(delta);
  }

  private postRender(delta : number) {
    this._properties.forEach(property => property.postRender(delta));
    this._targets.forEach(target => target.postRender(delta));

    this.cursorXTimeline.initial = this.cursorXTimeline.current;
    this.cursorYTimeline.initial = this.cursorYTimeline.current;

    this._velocity = {
      x: (this.cursorPosition.x - this.cursorPositionPrev.x) / delta,
      y: (this.cursorPosition.y - this.cursorPositionPrev.y) / delta,
    };

    this._direction = {
      x: this._velocity.x > 0 ? 1 : -1,
      y: this._velocity.y > 0 ? 1 : -1,
    };

    this.velocity.x = Math.abs(this._velocity.x);
    this.velocity.y = Math.abs(this._velocity.y);

    this.options.callbacks.postRender(this.coords, this.mouse);

    this.cursorPositionPrev = this.cursorPosition;
  }

  checkTargets() {
    // Check the out
    if (this.activeMouseTarget !== null && !isInRect(this.mousePosition, this.activeMouseTarget.boundings)) {
      emitEvent('apollo-mouse-leave', { target: this.activeMouseTarget });
      this.activeMouseTarget.descriptor.callback(this.activeMouseTarget, 'apollo-mouse-leave');
      this.activeMouseTarget = null;
    }
    if (this.activeCursorTarget !== null && !isInRect(this.cursorPosition, this.activeCursorTarget.boundings)) {
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
        if (isInRect(this.mousePosition, target.boundings) && !matchedOneMouse) {
          if (this.activeMouseTarget === null || this.activeMouseTarget.id !== target.id) {
            if (this.activeMouseTarget !== null) {
              emitEvent('apollo-mouse-leave', { target: this.activeMouseTarget })
              this.activeMouseTarget.descriptor.callback(this.activeMouseTarget, 'apollo-mouse-leave');
            }
            this.activeMouseTarget = target;
            emitEvent('apollo-mouse-enter', { target: this.activeMouseTarget });
            this.activeMouseTarget.descriptor.callback(this.activeMouseTarget, 'apollo-mouse-enter');
          }
          matchedOneMouse = true;
        }
        if (isInRect(this.cursorPosition, target.boundings) && !matchedOneCursor) {
          if (this.activeCursorTarget === null || this.activeCursorTarget.id !== target.id) {
            if(this.activeCursorTarget !== null) {
              emitEvent('apollo-cursor-leave', { target: this.activeCursorTarget });
              this.activeCursorTarget.descriptor.callback(this.activeCursorTarget, 'apollo-cursor-leave');
            }
            this.activeCursorTarget = target;
            emitEvent('apollo-cursor-enter', { target: this.activeCursorTarget });
            this.activeCursorTarget.descriptor.callback(this.activeCursorTarget, 'apollo-cursor-enter');
          }
          matchedOneCursor = true;
        }
      }
    }
  }

  private bindEvents() {
    document.body.addEventListener('mousemove', this.mouseMove, { passive: true });

    if (this.options.detectTouch) {
      document.body.addEventListener('touchstart', this.touchMove, { passive: true });
      document.body.addEventListener('touchmove', this.touchMove, { passive: true });
    }
  }

  private mouseMove = (event : MouseEvent) : void => {
    this.mousePosition = {
      x: event.clientX,
      y: event.clientY,
    };
    if (!this._trackMouse) return;
    this.mouseRenderPosition = this.mousePosition;
  }

  private touchMove = (event : TouchEvent) : void => {
    this.mousePosition = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
    if (!this._trackMouse) return;
    this.mouseRenderPosition = this.mousePosition;
  }

  public addProperties(props : Array<PropertyDescriptor>) {
    props.forEach((prop) => {
      this._properties.push(new Property(prop));
    })
  }

  public removeProperty(id : string) {
    const index = this._properties.findIndex((prop) => prop.id === id);
    if (index > -1) {
      delete this._properties[index];
      this._properties.splice(index, 1);
    }
  }

  public addTarget(target : TargetDescriptor) {
    target.elements.forEach((element, index) => {
      if (element._apolloId !== '-1') return;
      this._targets.push(new Target(element, target, index));
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

  public getProperty(id : string) : Property | undefined {
    return this._properties.find(p => p.id === id);
  }

  public get trackMouse() : boolean {
    return this._trackMouse;
  }

  public set trackMouse(value : boolean) {
    this._trackMouse = value;
  }

  public startMouseTracking() {
    this._trackMouse = true;
  }

  public stopMouseTracking() {
    this._trackMouse = false;
  }

  public get cursorElement() : Element | null {
    return this.options.cursor;
  }

  public get coords() : Vec2 {
    return this.cursorPosition;
  }

  public set coords(coords : Vec2) {
    this.mouseRenderPosition = coords;
  }

  public get normalizedCoords() : Vec2 {
    return {
      x: ((this.cursorPosition.x / window.innerWidth) * 2) - 1,
      y: ((this.cursorPosition.y / window.innerHeight) * 2) - 1,
    }
  }

  public get mouse() : Vec2 {
    return this.mousePosition;
  }

  public get velocity() : Vec2 {
    return this._velocity;
  }

  public get direction() : Vec2 {
    return this._direction;
  }

  public get properties() : Array<Property> {
    return this._properties;
  }
}

export default Apollo;
