import Aion from '@adoratorio/aion';
import {
  ApolloOptions,
  Vec2,
  Timeline,
  ApolloPlugin,
} from './declarations';
import Easings from './easing';
import { createProp } from './utils';

class Apollo {
  static EASING = Easings;

  private options : ApolloOptions;
  private mousePosition : Vec2;
  private mouseRenderPosition : Vec2;
  private _trackMouse : boolean;
  private cursorPosition : Vec2;
  private cursorPositionPrev : Vec2 = { x: 0, y: 0 };
  private _velocity : Vec2 = { x: 0, y: 0 };
  private _direction : Vec2 = { x: 0, y: 0 };
  private engine : Aion;
  private frameHandler : Function;
  private cursorXTimeline : Timeline;
  private cursorYTimeline : Timeline;
  private aionId : string = `apollo-frame-${performance.now()}`;
  private plugins : Array<ApolloPlugin> = [];
  private internalId : number = 0;

  constructor(options : Partial<ApolloOptions>) {
    createProp(); // Will add '_apolloId' to HTMLElement prototype

    const defaults : ApolloOptions = {
      easing: {
        mode: Apollo.EASING.CUBIC,
        duration: 1000,
      },
      initialPosition: { x: 0, y: 0 },
      detectTouch: false,
      aion: null,
    }
    this.options = {...defaults, ...options};

    // Set the initial mouse position
    this.mousePosition = this.options.initialPosition;
    this.mouseRenderPosition = this.mousePosition;
    this.cursorPosition = this.mousePosition;
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

    this.frameHandler = (delta : number) => { this.frame(delta); };
    this.engine.add(this.frameHandler, this.aionId);
    this.bindEvents();

    this._trackMouse = true;
  }

  private frame = (delta : number) : void => {
    this.plugins.forEach((plugin) => plugin.preFrame && plugin.preFrame(this, delta));

    this.cursorXTimeline.final = this.mouseRenderPosition.x;
    this.cursorYTimeline.final = this.mouseRenderPosition.y;
  
    const deltaT : number = Math.min(Math.max(delta, 0), this.options.easing.duration);
    const time : number = this.options.easing.mode(deltaT / this.options.easing.duration);

    this.cursorXTimeline.current = this.cursorXTimeline.initial + (time * (this.cursorXTimeline.final - this.cursorXTimeline.initial));
    this.cursorYTimeline.current = this.cursorYTimeline.initial + (time * (this.cursorYTimeline.final - this.cursorYTimeline.initial));

    this.cursorPosition = {
      x: this.cursorXTimeline.current,
      y: this.cursorYTimeline.current,
    };

    this.plugins.forEach((plugin) => plugin.frame && plugin.frame(this, delta));
    
    this.render(delta);
  }
  
  private render = (delta : number) : void => {
    this.plugins.forEach((plugin) => plugin.beforeRender && plugin.beforeRender(this, delta));

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

    this.cursorPositionPrev = this.cursorPosition;

    this.plugins.forEach((plugin) => plugin.afterRender && plugin.afterRender(this, delta));
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

  private register (plugin : ApolloPlugin, id : string) {
    if (typeof plugin.register === 'function') plugin.register(this);
    plugin.id = id;
    this.plugins.push(plugin);
  }

  public registerPlugin(plugin : ApolloPlugin, id? : string) : string {
    let i = null;
    if (typeof id === 'undefined') {
      i = `hades-plugin-${this.internalId}`;
      this.internalId += 1;
    } else {
      i = id;
    }
    this.register(plugin, i);
    return i;
  }

  public unregisterPlugin(id : string) : boolean {
    const foundIndex = this.plugins.findIndex((p) => p.id === id);
    if (foundIndex === -1) return false;
    const found = this.plugins[foundIndex];
    if (typeof found.destroy === 'function') found.destroy();
    this.plugins.splice(foundIndex, 1);
    return true;
  }

  public registerPlugins(plugins : Array<ApolloPlugin>, ids : Array<string>) : Array<string> {
    const is : Array<string> = [];
    plugins.forEach((plugin, index) => {
      is.push(this.registerPlugin(plugin, ids[index]));
    });

    return is;
  }

  public getPlugin(name : string) : ApolloPlugin | undefined {
    return this.plugins.find(plugin => plugin.name === name);
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

  public get normalizedMouse() : Vec2 {
    return {
      x: ((this.mousePosition.x / window.innerWidth) * 2) - 1,
      y: ((this.mousePosition.y / window.innerHeight) * 2) - 1,
    }
  }

  public get velocity() : Vec2 {
    return this._velocity;
  }

  public get direction() : Vec2 {
    return this._direction;
  }
}

export default Apollo;
