import Aion from '@adoratorio/aion';

import {
  ApolloOptions,
  Vec2,
  Property,
  Timeline,
} from './declarations';

import Easings from './easing';

class Apollo {
  static EASING = Easings;

  private options : ApolloOptions;
  private mousePosition : Vec2;
  private cursorBounding : ClientRect;
  private properties : Array<Property>;
  private frameHandler : Function;
  private engine : Aion;
  private autoUpdatePosition : boolean;
  private cursorPosition : Vec2;
  private cursorPositionPrev : Vec2 = { x: 0, y: 0 };
  private _velocity : Vec2 = { x: 0, y: 0 };
  private _direction : Vec2 = { x: 0, y: 0 };
  private cursorXTimeline : Timeline;
  private cursorYTimeline : Timeline;

  constructor(options : Partial<ApolloOptions>) {
    const defaults : ApolloOptions = {
      cursor: document.querySelector('.apollo__cursor') as HTMLElement,
      props: [],
      easing: {
        mode: Apollo.EASING.OUT_CUBIC,
        duration: 1000,
      },
      // targets: [],
      hiddenUntilFirstInteraction: false,
      initialPosition: { x: 0, y: 0 },
      detectTouch: false,
      emitGlobal: false,
      onEnter: () => {},
      onLeave: () => {},
      aion: null,
      autoStartPositionUpdate: true,
      renderByPixel: false,
    }
    this.options = {...defaults, ...options};

    // Set the initial mouse position
    this.mousePosition = this.options.initialPosition;
    this.cursorPosition = this.mousePosition;
    this.cursorBounding = (this.cursorElement as HTMLElement).getBoundingClientRect();
    this.cursorXTimeline = {
      initial: this.cursorPosition.x,
      current: this.cursorPosition.x,
      final: this.cursorPosition.x,
    };
    this.cursorYTimeline = {
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
    this.properties = [];
    this.options.props.forEach((prop) => {
      this.properties.push({
        key: prop.key,
        type: prop.type,
        suffix: prop.suffix,
        easing: prop.easing,
        timeline: {
          initial: prop.initial,
          current: prop.initial,
          final: prop.initial,
        },
        renderByPixel: prop.renderByPixel,
      });
    });

    this.frameHandler = (delta : number) => { this.frame(delta); };
    this.engine.add(this.frameHandler, 'apollo-frame');
    this.bindEvents();

    this.autoUpdatePosition = false;
    if (this.options.autoStartPositionUpdate) this.startPositionUpdate();
  }

  private mouseMove = (event : MouseEvent) : void => {
    this.mousePosition = {
      x: event.clientX,
      y: event.clientY,
    };
  }

  private touchMove = (event : TouchEvent) : void => {
    this.mousePosition = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  }

  private frame = (delta : number) : void => {
    this.cursorXTimeline.final = this.mousePosition.x;
    this.cursorYTimeline.final = this.mousePosition.y;
  
    const deltaT : number = Math.min(Math.max(delta), this.options.easing.duration);
    const t : number = this.options.easing.mode(deltaT / this.options.easing.duration);

    this.cursorXTimeline.current = this.cursorXTimeline.initial + t * (this.cursorXTimeline.final - this.cursorXTimeline.initial);
    this.cursorYTimeline.current = this.cursorYTimeline.initial + t * (this.cursorYTimeline.final - this.cursorYTimeline.initial);

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
    if (this.cursorElement !== null) {
      if (this.autoUpdatePosition) {
        const transform = `translate3d(${this.cursorPosition.x}px, ${this.cursorPosition.y}px, 0px)`;
        (this.cursorElement as HTMLElement).style.transform = transform;
      }
    }

    this.postRender(delta);
  }

  private postRender(delta : number) {
    this.cursorXTimeline.initial = this.cursorXTimeline.current;
    this.cursorYTimeline.initial = this.cursorYTimeline.current;

    this._velocity = {
      x: (this.cursorPosition.x - this.cursorPositionPrev.x) / delta,
      y: (this.cursorPosition.y - this.cursorPositionPrev.y) / delta,
    };

    this._direction = {
      x: this.velocity.x > 0 ? 1 : -1,
      y: this.velocity.y > 0 ? 1 : -1,
    };

    this.velocity.x = Math.abs(this.velocity.x);
    this.velocity.y = Math.abs(this.velocity.y);

    this.cursorPositionPrev = this.cursorPosition;
  }

  private bindEvents() {
    document.body.addEventListener('mousemove', this.mouseMove, { passive: true });

    if (this.options.detectTouch) {
      document.body.addEventListener('touchstart', this.touchMove, { passive: true });
      document.body.addEventListener('touchmove', this.touchMove, { passive: true });
    }
  }

  public startPositionUpdate() {
    this.autoUpdatePosition = true;
  }

  public pausePositionUpdate() {
    this.autoUpdatePosition = false;
  }

  public get cursorElement() : Element | null {
    return this.options.cursor;
  }

  public get coords() : Vec2 {
    return this.cursorPosition;
  }

  public get velocity() : Vec2 {
    return this._velocity;
  }

  public get direction() : Vec2 {
    return this._direction;
  }
}

export default Apollo;
