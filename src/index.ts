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
  #trackMouse = true;
  #cursorPosition: Vec2;
  #cursorPositionPrev: Vec2;
  #velocity: Vec2 = { x: 0, y: 0 };
  #direction: Vec2 = { x: 0, y: 0 };
  #engine: Aion;
  #cursorXTimeline: Timeline;
  #cursorYTimeline: Timeline;
  #aionId = `apollo-frame-${Apollo.#counter++}`;
  #plugins: ApolloPlugin[] = [];
  #internalId = 0;

  constructor(options: Partial<ApolloOptions> = {}) {
    if (typeof window === 'undefined') {
      throw new Error('[Apollo] You are not using this package in a browser environment');
    }

    const defaults: ApolloOptions = {
      easing: {
        mode: Apollo.EASING.CUBIC,
        duration: 1000,
      },
      initialPosition: { x: 0, y: 0 },
      detectTouch: false,
      aion: null,
      debug: false,
    };
    // Nested objects are merged too, so a partial `easing` keeps the other defaults
    this.#options = {
      ...defaults,
      ...options,
      easing: { ...defaults.easing, ...options.easing },
      initialPosition: { ...defaults.initialPosition, ...options.initialPosition },
    };

    // Set the initial mouse position
    const { x, y } = this.#options.initialPosition;
    this.#mousePosition = { x, y };
    this.#mouseRenderPosition = { x, y };
    this.#cursorPosition = { x, y };
    this.#cursorPositionPrev = { x, y };
    this.#cursorXTimeline = {
      duration: this.#options.easing.duration,
      initial: x,
      current: x,
      final: x,
    };
    this.#cursorYTimeline = {
      duration: this.#options.easing.duration,
      initial: y,
      current: y,
      final: y,
    };

    // Create or set the engine
    if (this.#options.aion !== null) {
      this.#engine = this.#options.aion;
    } else {
      this.#engine = new AionEngine({ debug: this.#options.debug });
      this.#engine.start();
    }

    // `#frame` is an already-bound arrow field: register it directly (no wrapper)
    this.#engine.add(this.#frame, this.#aionId);
    this.#bindEvents();
  }

  #debugWarn(message: string): void {
    if (this.#options.debug) {
      console.warn(`[Apollo] ${message}`);
    }
  }

  #frame = (delta: number): void => {
    // Call PLUGIN preFrame
    this.#plugins.forEach((plugin) => plugin.preFrame?.(this, delta));

    // Get the new final position to go to
    this.#cursorXTimeline.final = this.#mouseRenderPosition.x;
    this.#cursorYTimeline.final = this.#mouseRenderPosition.y;

    // Calculate current timeline value
    const { duration } = this.#options.easing;
    const deltaT = Math.min(Math.max(delta, 0), duration);
    const time = this.#options.easing.mode(deltaT / duration);

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
    const vx = (this.#cursorPosition.x - this.#cursorPositionPrev.x) / dt;
    const vy = (this.#cursorPosition.y - this.#cursorPositionPrev.y) / dt;

    // Direction is derived from the signed velocity: 0 when the cursor is still
    this.#direction = { x: Math.sign(vx), y: Math.sign(vy) };
    this.#velocity = { x: Math.abs(vx), y: Math.abs(vy) };

    // Call PLUGIN frame callback before resetting the timeline and values
    this.#plugins.forEach((plugin) => plugin.frame?.(this, delta));

    this.#cursorXTimeline.initial = this.#cursorXTimeline.current;
    this.#cursorYTimeline.initial = this.#cursorYTimeline.current;

    this.#cursorPositionPrev = this.#cursorPosition;

    // Call PLUGIN afterFrame
    this.#plugins.forEach((plugin) => plugin.afterFrame?.(this, delta));
  };

  #bindEvents(): void {
    // Listen on `window` so the whole viewport is covered and the instance can
    // be created before `document.body` exists
    window.addEventListener('pointermove', this.#pointerMove, { passive: true });

    if (this.#options.detectTouch) {
      // Touch keeps its own listeners: pointer events stop once the browser takes
      // over the gesture (scroll/pan), touch events keep reporting positions
      window.addEventListener('touchstart', this.#touchMove, { passive: true });
      window.addEventListener('touchmove', this.#touchMove, { passive: true });
    }
  }

  #unbindEvents(): void {
    window.removeEventListener('pointermove', this.#pointerMove);
    window.removeEventListener('touchstart', this.#touchMove);
    window.removeEventListener('touchmove', this.#touchMove);
  }

  #updateMouse(x: number, y: number): void {
    this.#mousePosition = { x, y };
    if (this.#trackMouse) {
      this.#mouseRenderPosition = this.#mousePosition;
    }
  }

  #pointerMove = (event: Event): void => {
    const pointerEvent = event as PointerEvent;
    // Touch pointers are handled by the touch listeners (or ignored)
    if (pointerEvent.pointerType === 'touch') {
      return;
    }
    this.#updateMouse(pointerEvent.clientX, pointerEvent.clientY);
  };

  #touchMove = (event: Event): void => {
    const [touch] = (event as TouchEvent).touches;
    if (!touch) {
      return;
    }
    this.#updateMouse(touch.clientX, touch.clientY);
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
      throw new Error('[Apollo] Plugin must have a name property');
    }

    if (this.#plugins.some((p) => p.name === plugin.name)) {
      throw new Error(`[Apollo] Plugin with name "${plugin.name}" is already registered`);
    }

    const pluginId = id || `apollo-plugin-${this.#internalId++}`;
    this.#register(plugin, pluginId);
    return pluginId;
  }

  public unregisterPlugin(id: string): boolean {
    const foundIndex = this.#plugins.findIndex((p) => p.id === id);
    if (foundIndex === -1) {
      this.#debugWarn(`No plugin registered with id "${id}"`);
      return false;
    }
    const found = this.#plugins[foundIndex];
    if (found && typeof found.destroy === 'function') {
      found.destroy();
    }
    this.#plugins.splice(foundIndex, 1);
    return true;
  }

  public registerPlugins(plugins: ApolloPlugin[], ids: string[] = []): string[] {
    return plugins.map((plugin, index) => this.registerPlugin(plugin, ids[index]));
  }

  public destroy(): void {
    this.#unbindEvents();
    this.#engine.remove(this.#aionId);
    this.#plugins.forEach((plugin) => plugin.destroy?.());
    this.#plugins = [];
  }

  public getPlugin<T extends ApolloPlugin = ApolloPlugin>(name: string): T | undefined {
    return this.#plugins.find((plugin) => plugin.name === name) as T | undefined;
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
    this.#mouseRenderPosition = { x: coords.x, y: coords.y };
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
