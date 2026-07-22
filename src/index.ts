import AionEngine from '@adoratorio/aion';
import {
  type Aion,
  type ApolloOptions,
  type ApolloPlugin,
  type Timeline,
  type Vec2,
} from './types.ts';
import { EASINGS } from './easing.ts';

class Apollo {
  static readonly EASING: typeof EASINGS = EASINGS;
  static #counter = 0;

  #options: ApolloOptions;
  #mousePosition: Vec2;
  #mouseRenderPosition: Vec2;
  #trackMouse: boolean;
  #cursorPosition: Vec2;
  #cursorPositionPrev: Vec2 = { x: 0, y: 0 };
  #velocity: Vec2 = { x: 0, y: 0 };
  #direction: Vec2 = { x: 0, y: 0 };
  #engine: Aion;
  #cursorXTimeline: Timeline;
  #cursorYTimeline: Timeline;
  #aionId = `apollo-frame-${Apollo.#counter++}`;
  #plugins: ApolloPlugin[] = [];
  #internalId = 0;

  constructor(options: Partial<ApolloOptions> = {}) {
    const defaults: ApolloOptions = {
      easing: {
        mode: Apollo.EASING.CUBIC,
        duration: 1000,
      },
      initialPosition: { x: 0, y: 0 },
      detectTouch: false,
      aion: null,
    };
    this.#options = { ...defaults, ...options };

    // Set the initial mouse position
    this.#mousePosition = this.#options.initialPosition;
    this.#mouseRenderPosition = this.#mousePosition;
    this.#cursorPosition = this.#mousePosition;
    this.#cursorXTimeline = {
      start: 0,
      duration: this.#options.easing.duration,
      initial: this.#cursorPosition.x,
      current: this.#cursorPosition.x,
      final: this.#cursorPosition.x,
    };
    this.#cursorYTimeline = {
      start: 0,
      duration: this.#options.easing.duration,
      initial: this.#cursorPosition.y,
      current: this.#cursorPosition.y,
      final: this.#cursorPosition.y,
    };

    // Create or set the engine
    if (this.#options.aion !== null) {
      this.#engine = this.#options.aion;
    } else {
      this.#engine = new AionEngine({});
      this.#engine.start();
    }

    // `#frame` is an already-bound arrow field — register it directly (no wrapper)
    this.#engine.add(this.#frame, this.#aionId);
    this.#bindEvents();

    this.#trackMouse = true;
  }

  #frame = (delta: number): void => {
    // Call PLUGIN preFrame
    this.#plugins.forEach((plugin) => plugin.preFrame?.(this, delta));

    // Get the new final position to go to
    this.#cursorXTimeline.final = this.#mouseRenderPosition.x;
    this.#cursorYTimeline.final = this.#mouseRenderPosition.y;

    // Calculate current timeline value
    const deltaT: number = Math.min(Math.max(delta, 0), this.#options.easing.duration);
    const time: number = this.#options.easing.mode(deltaT / this.#options.easing.duration);

    this.#cursorXTimeline.current =
      this.#cursorXTimeline.initial +
      time * (this.#cursorXTimeline.final - this.#cursorXTimeline.initial);
    this.#cursorYTimeline.current =
      this.#cursorYTimeline.initial +
      time * (this.#cursorYTimeline.final - this.#cursorYTimeline.initial);

    this.#cursorPosition = {
      x: this.#cursorXTimeline.current,
      y: this.#cursorYTimeline.current,
    };

    // Calculate velocity and direction (guard delta = 0 to avoid NaN/Infinity)
    const dt = delta || 1;
    this.#velocity = {
      x: (this.#cursorPosition.x - this.#cursorPositionPrev.x) / dt,
      y: (this.#cursorPosition.y - this.#cursorPositionPrev.y) / dt,
    };

    this.#direction = {
      x: this.#velocity.x > 0 ? 1 : -1,
      y: this.#velocity.y > 0 ? 1 : -1,
    };

    // Normalize velocity to absolute values AFTER direction is derived from the signed value
    this.#velocity.x = Math.abs(this.#velocity.x);
    this.#velocity.y = Math.abs(this.#velocity.y);

    // Call PLUGIN frame callback before resetting the timeline and values
    this.#plugins.forEach((plugin) => plugin.frame?.(this, delta));

    this.#cursorXTimeline.initial = this.#cursorXTimeline.current;
    this.#cursorYTimeline.initial = this.#cursorYTimeline.current;

    this.#cursorPositionPrev = this.#cursorPosition;

    // Call PLUGIN afterFrame
    this.#plugins.forEach((plugin) => plugin.afterFrame?.(this, delta));
  };

  #bindEvents(): void {
    document.body.addEventListener('pointermove', this.#mouseMove, { passive: true });

    if (this.#options.detectTouch) {
      document.body.addEventListener('touchstart', this.#touchMove, { passive: true });
      document.body.addEventListener('touchmove', this.#touchMove, { passive: true });
    }
  }

  #mouseMove = (event: Event): void => {
    const mouseEvent = event as MouseEvent;
    this.#mousePosition = {
      x: mouseEvent.clientX,
      y: mouseEvent.clientY,
    };
    if (!this.#trackMouse) {
      return;
    }
    this.#mouseRenderPosition = this.#mousePosition;
  };

  #touchMove = (event: Event): void => {
    const touchEvent = event as TouchEvent;
    this.#mousePosition = {
      x: touchEvent.touches[0]?.clientX || 0,
      y: touchEvent.touches[0]?.clientY || 0,
    };
    if (!this.#trackMouse) {
      return;
    }
    this.#mouseRenderPosition = this.#mousePosition;
  };

  #register(plugin: ApolloPlugin, id: string): void {
    if (typeof plugin.register === 'function') {
      plugin.register(this);
    }
    plugin.id = id;
    this.#plugins.push(plugin);
  }

  public registerPlugin(plugin: ApolloPlugin, id?: string): string {
    if (!plugin.name) {
      throw new Error('Plugin must have a name property');
    }

    if (this.#plugins.some((p) => p.name === plugin.name)) {
      throw new Error(`Plugin with name "${plugin.name}" is already registered`);
    }

    const pluginId = id || `apollo-plugin-${this.#internalId++}`;
    this.#register(plugin, pluginId);
    return pluginId;
  }

  public unregisterPlugin(id: string): boolean {
    const foundIndex = this.#plugins.findIndex((p) => p.id === id);
    if (foundIndex === -1) {
      return false;
    }
    const found = this.#plugins[foundIndex];
    if (found && typeof found.destroy === 'function') {
      found.destroy();
    }
    this.#plugins.splice(foundIndex, 1);
    return true;
  }

  public registerPlugins(plugins: ApolloPlugin[], ids: string[]): string[] {
    const is: string[] = [];
    plugins.forEach((plugin, index) => {
      is.push(this.registerPlugin(plugin, ids[index]));
    });

    return is;
  }

  #unbindEvents(): void {
    document.body.removeEventListener('pointermove', this.#mouseMove);

    if (this.#options.detectTouch) {
      document.body.removeEventListener('touchstart', this.#touchMove);
      document.body.removeEventListener('touchmove', this.#touchMove);
    }
  }

  public destroy(): void {
    this.#unbindEvents();
    this.#engine.remove(this.#aionId);
    this.#plugins.forEach((plugin) => {
      if (plugin.destroy) {
        plugin.destroy();
      }
    });
    this.#plugins = [];
  }

  public getPlugin(name: string): ApolloPlugin | undefined {
    return this.#plugins.find((plugin) => plugin.name === name);
  }

  public get trackMouse(): boolean {
    return this.#trackMouse;
  }

  public set trackMouse(value: boolean) {
    this.#trackMouse = value;
  }

  public startMouseTracking(): void {
    this.#trackMouse = true;
  }

  public stopMouseTracking(): void {
    this.#trackMouse = false;
  }

  public get coords(): Vec2 {
    return this.#cursorPosition;
  }

  public set coords(coords: Vec2) {
    this.#mouseRenderPosition = coords;
  }

  public get normalizedCoords(): Vec2 {
    return {
      x: (this.#cursorPosition.x / window.innerWidth) * 2 - 1,
      y: (this.#cursorPosition.y / window.innerHeight) * 2 - 1,
    };
  }

  public get mouse(): Vec2 {
    return this.#mousePosition;
  }

  public get normalizedMouse(): Vec2 {
    return {
      x: (this.#mousePosition.x / window.innerWidth) * 2 - 1,
      y: (this.#mousePosition.y / window.innerHeight) * 2 - 1,
    };
  }

  public get velocity(): Vec2 {
    return this.#velocity;
  }

  public get direction(): Vec2 {
    return this.#direction;
  }
}

export type { Aion, ApolloOptions, ApolloPlugin, Easing, Timeline, Vec2 } from './types.ts';
export { EASINGS as EASING, type EasingFunction } from './easing.ts';
export default Apollo;
