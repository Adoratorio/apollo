import Aion from '@adoratorio/aion';

import {
  TYPE,
  Vec2,
  ApolloOptions,
  FOLLOW,
  Easing,
  Magnetism,
  MODE,
  Timeline,
  Target,
  Element,
  PUSH,
  ApolloHTMLElement,
} from './declarations';

import Easings from './easing';
import { pushMode, editHTMLElement } from './utils';


class Apollo {
  static EASING = Easings;
  static TYPE = TYPE;
  static MODE = MODE;
  static FOLLOW = FOLLOW;
  static PUSH = PUSH;

  private options : ApolloOptions;
  private frameHandler : Function;
  private cursorCheckHandler : Function;

  private elements : Array<Element> = [];
  private domElements : Array<HTMLElement> = [];

  private timelineCursor : Timeline;
  private boundingCursor : Vec2 = { x: 0, y: 0 };

  private _coords : Vec2 = { x: 0, y: 0 };
  private _mousePosition : Vec2 = { x: 0, y: 0 };
  private _cursorPosition : Vec2 = { x: 0, y: 0 };
  private _cursorPositionPrev : Vec2 = { x: 0, y: 0 };
  private _velocity : Vec2 = { x: 0, y: 0 };

  private _distanceFromCenter : number = 0;
  private _distanceFromBorder : number = 0;

  private _pulling : boolean = false;
  private _pushing : boolean = false;

  private status : boolean = false;
  private leave : boolean = false;
  private first : boolean = true;

  private engine : Aion;

  constructor(options : Partial<ApolloOptions>) {
    const defaults : ApolloOptions = {
      mode: FOLLOW.CURSOR,
      cursor: document.querySelector('.apollo__cursor') as HTMLElement,
      type: Apollo.TYPE.HTML,
      easing: {
        mode: Apollo.EASING.LINEAR,
        duration: 1000,
      },
      targets: [],
      hiddenUntilFirstInteraction: false,
      detectTouch: false,
      emitGlobal: false,
      onUpdate: () => {},
      onEnter: () => {},
      onMove: () => {},
      onLeave: () => {},
      aion: null,
    }
    this.options = {...defaults, ...options};

    this.timelineCursor = {
      initial: { x: 0, y: 0 },
      current: { x: 0, y: 0 },
      final: { x: 0, y: 0 },
    };

    this.frameHandler = (delta: number) => this.frame(delta);
    this.cursorCheckHandler = (delta: number) => this.cursorCheck(delta);

    this.bindMouse();
    this.initTargets();

    if (this.options.type === Apollo.TYPE.HTML) {
      this.setBoundingCursor();
    }

    if (this.options.hiddenUntilFirstInteraction && this.options.type === Apollo.TYPE.HTML) {
      (<HTMLElement>this.options.cursor).style.display = 'none';
    } else {
      this.first = false;
    }

    this.options.aion = new Aion();
    if (this.options.aion === null || typeof this.options.aion === 'undefined') {
      this.engine = new Aion();
    } else {
      this.engine = this.options.aion;
    }
    this.engine.start();
    this.engine.add(this.frameHandler, 'cursorMove');
    this.engine.add(this.cursorCheckHandler, 'cursorCheck', true);
  }

  private bindMouse = () : void => {
    document.body.addEventListener('mousemove', this.mouseMove);
    
    if (this.options.detectTouch) {
      document.body.addEventListener('touchstart', this.touchMove);
      document.body.addEventListener('touchmove', this.touchMove);
    }
  }

  private unbindMouse = () : void => {
    document.body.removeEventListener('mousemove', this.mouseMove);

    if (this.options.detectTouch) {
      document.body.removeEventListener('touchstart', this.touchMove);
      document.body.removeEventListener('touchmove', this.touchMove);
    }
  }

  private mouseMove = (event : MouseEvent) : void => {
    this._mousePosition = {
      x: event.clientX,
      y: event.clientY,
    };
  }

  private touchMove = (event : TouchEvent) : void => {
    this._mousePosition = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  }

  private setBoundingCursor = () : Vec2 => {
    const { width, height } : ClientRect = (<HTMLElement>this.options.cursor).getBoundingClientRect();

    return this.boundingCursor = {
      x: width / 2,
      y: height / 2,
    }
  }

  private frame = (delta : number) : void => {
    this.timelineCursor.final = {
      x: this._mousePosition.x,
      y: this._mousePosition.y,
    };

    const deltaT : number = Math.min(Math.max(delta, 0), this.options.easing.duration);
    const t : number = this.options.easing.mode(deltaT / this.options.easing.duration);

    this.timelineCursor.current.x = this.timelineCursor.initial.x + (t * (this.timelineCursor.final.x - this.timelineCursor.initial.x));
    this.timelineCursor.current.y = this.timelineCursor.initial.y + (t * (this.timelineCursor.final.y - this.timelineCursor.initial.y));

    this._cursorPosition = {
      x: Math.round(this.timelineCursor.current.x - this.boundingCursor.x),
      y: Math.round(this.timelineCursor.current.y - this.boundingCursor.y),
    }

    if (this.options.mode === 'mouse') {
      this._coords = this._mousePosition;
    } else if (this.options.mode === 'cursor') {
      this._coords = this._cursorPosition;
    }

    if (this.options.type === Apollo.TYPE.HTML &&
        this.options.hiddenUntilFirstInteraction &&
        this.timelineCursor.initial.x !== this.timelineCursor.current.x &&
        this.first) {
          setTimeout(() => {
            (<HTMLElement>this.options.cursor).style.display = 'block';
            this.first = false;
          }, this.options.easing.duration);
    }

    if (!this._pushing && !this.first && this.options.type === Apollo.TYPE.HTML) {
      (<HTMLElement>this.options.cursor).style.webkitTransform = `translate3d(${this._cursorPosition.x}px, ${this._cursorPosition.y}px, 0px)`;
      (<HTMLElement>this.options.cursor).style.transform = `translate3d(${this._cursorPosition.x}px, ${this._cursorPosition.y}px, 0px)`;
    }

    this.timelineCursor.initial.x = this.timelineCursor.current.x;
    this.timelineCursor.initial.y = this.timelineCursor.current.y;

    this._velocity = {
      x: Math.abs((this._cursorPosition.x - this._cursorPositionPrev.x) / delta),
      y: Math.abs((this._cursorPosition.y - this._cursorPositionPrev.y) / delta),
    }

    this._cursorPositionPrev = this._cursorPosition;

    this.options.onUpdate(this._coords);

    if (this.options.emitGlobal) {
      const eventInit : CustomEventInit = {};
      eventInit.detail = this._coords;
      const customEvent : CustomEvent = new CustomEvent('apollo-update', eventInit);
      window.dispatchEvent(customEvent);
    }
  }

  private cursorCheck = (delta : number) : void => {
    this.status = false;

    this.elements.forEach((element : any) => {
      const offset = element.target.offset;
      element.rect = this.inRect(element.domElement, offset);

      if (element.rect.check && getComputedStyle(element.domElement)['pointerEvents'] !== 'none') {
        this.status = true;
        this.leave = false;

        if (!element.status) {
          this.options.onEnter(element);

          if (this.options.emitGlobal) {
            const eventInit : CustomEventInit = {};
            eventInit.detail = element;
            const customEvent : CustomEvent = new CustomEvent('apollo-enter', eventInit);
            window.dispatchEvent(customEvent);
          }

        } else {
          this.options.onMove(element);

          if (this.options.emitGlobal) {
            const eventInit : CustomEventInit = {};
            eventInit.detail = element;
            const customEvent : CustomEvent = new CustomEvent('apollo-move', eventInit);
            window.dispatchEvent(customEvent);
          }
        }

        element.status = true;

        this._distanceFromCenter = this.setDistanceFromCenter(element.domElement, element.target.offset, element.rect);
        this._distanceFromBorder = this.setDistanceFromBorder(element.domElement, element.target.offset, element.rect);

        if (element.target.magnetism) {
          this.setMagnetism(element, delta);
        }

        element.domElement.classList.add('apollo--active');
        if (this.options.type === Apollo.TYPE.HTML) (<HTMLElement>this.options.cursor).classList.add('apollo__cursor--active');
      } else if (element.domElement.classList.contains('apollo--active')) {
        element.domElement.classList.remove('apollo--active');
        element.status = false;

        if (!this.leave) {
          this.leave = true;
          this.options.onLeave(element);

          if (this.options.emitGlobal) {
            const eventInit : CustomEventInit = {};
            eventInit.detail = element;
            const customEvent : CustomEvent = new CustomEvent('apollo-leave', eventInit);
            window.dispatchEvent(customEvent);
          }
        }
      } else {
        element.domElement.classList.remove('apollo--active');

        if (element.target.magnetism) {
          if (element.target.magnetism.mode === 'pull') {
            const coords = this.easeMagnetism({ x: 0, y: 0 }, element, delta);

            if (Math.round(coords.y) !== 0 || Math.round(coords.x) !== 0) {
              element.domElement.style.webkitTransform = `translate3d(${coords.x}px, ${coords.y}px, 0px)`;
              element.domElement.style.transform = `translate3d(${coords.x}px, ${coords.y}px, 0px)`;
            } else {
              element.domElement.style.removeProperty('webkit-transform');
              element.domElement.style.removeProperty('transform');
              element.domElement.style.removeProperty('z-index');

              this._pulling = false;
            }
          } else if (element.target.magnetism.mode === 'push' && this._pushing) {
            const coords = this.easeMagnetism(this._coords, element, delta);

            if (Math.round(coords.y) !== Math.round(this._coords.y) || Math.round(coords.x) !== Math.round(this._coords.x)) {
              if (this.options.type === Apollo.TYPE.HTML) {
                (<HTMLElement>this.options.cursor).style.webkitTransform = `translate3d(${coords.x}px, ${coords.y}px, 0px)`;
                (<HTMLElement>this.options.cursor).style.transform = `translate3d(${coords.x}px, ${coords.y}px, 0px)`;
              }
            } else {
              this._pushing = false;
            }
          }
        }
      }
    });

    if (!this.status) {
      if (this.options.type === Apollo.TYPE.HTML) {
        (<HTMLElement>this.options.cursor).classList.remove('apollo__cursor--active');
      }
    }
  }

  private setMagnetism = (element : Element, delta : number) : void => {
    const magnetism = element.target.magnetism as Magnetism;
    const mode : MODE = magnetism.mode;

    if (mode === 'pull') {
      this.pull(element, delta);
    } else if (mode === 'push') {
      this.push(element, delta);
    }
  }

  private pull = (element : Element, delta : number) : void => {
    this._pulling = true;

    const coordsTemp : Vec2 = {
      x: this._coords.x - (element.rect.bounding.left + element.rect.bounding.center.x) + this.boundingCursor.x,
      y: this._coords.y - (element.rect.bounding.top + element.rect.bounding.center.y) + this.boundingCursor.y,
    };

    const coords = this.easeMagnetism(coordsTemp, element, delta);

    element.domElement.style.webkitTransform = `translate3d(${coords.x}px, ${coords.y}px, 0px)`;
    element.domElement.style.transform = `translate3d(${coords.x}px, ${coords.y}px, 0px)`;
    element.domElement.style.zIndex = '10';
  }

  private push = (element : Element, delta : number) : void => {
    if (!this._pushing) {
      element.timeline.initial = {
        x: this._coords.x,
        y: this._coords.y,
      };
    }

    this._pushing = true;

    const coordsTemp = pushMode(element, this.boundingCursor);

    const coords = this.easeMagnetism(coordsTemp, element, delta);

    if (this.options.type === Apollo.TYPE.HTML) {
      (<HTMLElement>this.options.cursor).style.webkitTransform = `translate3d(${coords.x}px, ${coords.y}px, 0px)`;
      (<HTMLElement>this.options.cursor).style.transform = `translate3d(${coords.x}px, ${coords.y}px, 0px)`;
    }
  }

  private easeMagnetism = (tempCoords : Vec2, element : Element, delta : number) : Vec2 => {
    element.timeline.final = {
      x: tempCoords.x,
      y: tempCoords.y,
    };

    const deltaT : number = Math.min(Math.max(delta, 0), (<Magnetism>element.target.magnetism).easing.duration);
    const t : number = (<Magnetism>element.target.magnetism).easing.mode(deltaT / (<Magnetism>element.target.magnetism).easing.duration);

    element.timeline.current.x = element.timeline.initial.x + (t * (element.timeline.final.x - element.timeline.initial.x));
    element.timeline.current.y = element.timeline.initial.y + (t * (element.timeline.final.y - element.timeline.initial.y));

    const coords = {
      x: element.timeline.current.x,
      y: element.timeline.current.y,
    }

    element.timeline.initial.x = element.timeline.current.x;
    element.timeline.initial.y = element.timeline.current.y;

    return coords;
  }

  private setElBounding = (el : HTMLElement, offset? : Vec2 | null) : any => {
    let bounding : ClientRect = el.getBoundingClientRect();

    const _bounding : any = bounding;

    _bounding.center = {
      x: bounding.width / 2,
      y: bounding.height / 2,
    }

    const offsetTemp : Vec2 = {
      x: 0,
      y: 0,
    };

    const _offset : Vec2 = {...offsetTemp, ...offset};

    return {
      bounding: _bounding,
      offset: _offset,
    };
  }

  private initTargets = () : Array<HTMLElement> => {
    this.options.targets.forEach((target) => {
      if (target.magnetism && (<Magnetism>target.magnetism).mode === Apollo.MODE.PUSH && (<Magnetism>target.magnetism).options === undefined) {
        (<Magnetism>target.magnetism).options = Apollo.PUSH.CENTER;
      }

      target.elements.forEach((element, index) => {
        (<ApolloHTMLElement>element).apolloId = `${target.id}-${index}`;

        const obj = {
          domElement: element,
          apolloId: `${target.id}-${index}`,
          target,
          active: false,
          timeline: {
            initial: { x: 0, y: 0 },
            current: { x: 0, y: 0 },
            final: { x: 0, y: 0 },
          },
          rect: {},
        };

        this.elements.push(obj);
      });

      this.domElements.push(...target.elements);
    });

    return this.domElements;
  }

  private detachDomElements = (elements : Array<HTMLElement> | null) : any => {
    if (elements !== null) {
      elements.forEach((element) => {
        this.elements = this.elements.filter(el => (<ApolloHTMLElement>el.domElement).apolloId !== (<ApolloHTMLElement>element).apolloId);
        this.domElements = this.domElements.filter(el => (<ApolloHTMLElement>el).apolloId !== (<ApolloHTMLElement>element).apolloId);
      });

    } else {
      this.elements = [];
      this.domElements = [];
    }

    return {
      domElements: this.domElements,
      elements: this.elements,
    };
  }

  public get mouse() : Vec2 {
    return this._mousePosition;
  }

  public get cursor() : Vec2 {
    return this._cursorPosition;
  }

  public get coords() : Vec2 {
    return this._coords;
  }

  public get velocity() : Vec2 {
    return this._velocity;
  }

  public get distanceFromCenter() : number {
    return this._distanceFromCenter;
  }

  public get distanceFromBorder() : number {
    return this._distanceFromBorder;
  }

  public inRect = (el: HTMLElement | null, offset? : Vec2 | null) : any => {
    if (el === null) throw new Error('Element cannot be null');

    const rect = this.setElBounding(el, offset);

    return {
      bounding: rect.bounding,
      offset: rect.offset,
      check: this._coords.x >= (rect.bounding.left - rect.offset.x)
        && this._coords.y >= (rect.bounding.top - rect.offset.y)
        && this._coords.x <= (rect.bounding.right + rect.offset.x)
        && this._coords.y <= (rect.bounding.bottom + rect.offset.y),
    };
  }

  public addTargets = (targets : Array<Target>) : Array<Target> => {
    targets.forEach((target) => {
      if (target.magnetism && (<Magnetism>target.magnetism).mode === Apollo.MODE.PUSH && (<Magnetism>target.magnetism).options === undefined) {
        (<Magnetism>target.magnetism).options = Apollo.PUSH.CENTER;
      }

      target.elements.forEach((element, index) => {
        (<ApolloHTMLElement>element).apolloId = `${target.id}-${index}`;

        const obj = {
          domElement: element,
          apolloId: `${target.id}-${index}`,
          target,
          active: false,
          timeline: {
            initial: { x: 0, y: 0 },
            current: { x: 0, y: 0 },
            final: { x: 0, y: 0 },
          },
          rect: {},
        };

        this.elements.push(obj);
      });

      this.domElements.push(...target.elements);
    });

    this.options.targets.push(...targets);

    return this.options.targets;
  }

  public removeTarget = (targetId : string) : Array<Target> => {
    const targets = this.options.targets.filter(target => target.id === targetId);
    this.options.targets = this.options.targets.filter(target => target.id !== targetId);

    targets.forEach((target) => {
      this.detachDomElements(target.elements);
    });

    return this.options.targets;
  }

  public setCursorPosition(position : Vec2) : Vec2 {
    this._mousePosition = position;

    return this._mousePosition;
  }

  public setDistanceFromCenter(el: HTMLElement | null, offset? : Vec2 | null, rect? : any) : number {
    if (el === null) throw new Error('Element cannot be null');
    if (rect === undefined) rect = this.setElBounding(el, offset);

    const _left = (rect.bounding.left - rect.offset.x) - this._coords.x;
    const _top = (rect.bounding.top - rect.offset.y) - this._coords.y;

    const _right = (rect.bounding.right + rect.offset.x) - this._coords.x;
    const _bottom = (rect.bounding.bottom + rect.offset.y) - this._coords.y;

    const _center = {
      x: (_right - _left) / 2,
      y: (_bottom - _top) / 2,
    };

    const distance = {
      left: Math.abs(_left) + this.boundingCursor.x,
      top: Math.abs(_top) + this.boundingCursor.y,
      right: Math.abs(_right) - this.boundingCursor.x,
      bottom: Math.abs(_bottom) - this.boundingCursor.y,
    }

    const ratio : Vec2 = { x: 0, y: 0 };


    if (distance.left <= _center.x) {
      ratio.x = Math.round((distance.left / _center.x) * 100);
    } else {
      ratio.x = Math.round((distance.right / _center.x) * 100);
    }
    if (distance.top <= _center.y) {
      ratio.y = Math.round((distance.top / _center.y) * 100);
    } else {
      ratio.y = Math.round((distance.bottom / _center.y) * 100);
    }

    let distanceRatio : number = Math.min(Math.abs(ratio.x), Math.abs(ratio.y)) / 100;
    distanceRatio = Math.min(Math.max(distanceRatio, 0), 1);

    return distanceRatio;
  }

  public setDistanceFromBorder(el: HTMLElement | null, offset? : Vec2 | null, rect? : any) : number {
    if (el === null) throw new Error('Element cannot be null');
    if (rect === undefined) rect = this.setElBounding(el, offset);

    const _left = (rect.bounding.left - rect.offset.x) - this._coords.x;
    const _top = (rect.bounding.top - rect.offset.y) - this._coords.y;

    const _right = (rect.bounding.right + rect.offset.x) - this._coords.x;
    const _bottom = (rect.bounding.bottom + rect.offset.y) - this._coords.y;

    const _center = {
      x: (_right - _left) / 2,
      y: (_bottom - _top) / 2,
    };

    const distance = {
      left: Math.abs(_left) - this.boundingCursor.x,
      top: Math.abs(_top) - this.boundingCursor.y,
      right: Math.abs(_right) - this.boundingCursor.x,
      bottom: Math.abs(_bottom) - this.boundingCursor.y,
    }

    const ratio : any = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    };


    if (distance.left <= rect.offset.x) {
      ratio.x = Math.round((Math.abs(_left) / (rect.offset.x - (this.boundingCursor.x * 2))) * 100);
    } else {
      ratio.x = Math.round((Math.abs(_right) / rect.offset.x) * 100);
    }
    if (distance.top <= rect.offset.y) {
      ratio.y = Math.round((Math.abs(_top) / (rect.offset.y - (this.boundingCursor.y * 2))) * 100);
    } else {
      ratio.y = Math.round((Math.abs(_bottom) / rect.offset.y) * 100);
    }

    let distanceRatio : number = Math.min(Math.abs(ratio.x), Math.abs(ratio.y)) / 100;
    distanceRatio = Math.min(Math.max(distanceRatio, 0), 1);

    return distanceRatio;
  }
}

export default Apollo;
