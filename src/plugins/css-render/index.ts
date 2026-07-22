import { type ApolloPlugin } from '../../types.ts';
import type Apollo from '../../index.ts';
import { type CSSRenderOptions } from './types.ts';

class CSSRender implements ApolloPlugin {
  #context: Apollo | null = null;
  #options: CSSRenderOptions;
  #cursorBounding: DOMRect;
  #resizeObserver: ResizeObserver | null = null;

  public name = 'CSSRender';

  constructor(options: Partial<CSSRenderOptions> = {}) {
    const defaults: CSSRenderOptions = {
      cursor:
        typeof document !== 'undefined'
          ? (document.querySelector('.apollo__cursor') as HTMLElement)
          : null,
      precision: 4,
      render: true,
    };
    this.#options = { ...defaults, ...options };

    if (this.#options.cursor) {
      this.#cursorBounding = this.#options.cursor.getBoundingClientRect();
      if (typeof ResizeObserver !== 'undefined') {
        this.#resizeObserver = new ResizeObserver(() => {
          if (this.#options.cursor) {
            this.#cursorBounding = this.#options.cursor.getBoundingClientRect();
          }
        });
        this.#resizeObserver.observe(this.#options.cursor);
      }
    } else {
      this.#cursorBounding = new DOMRect();
    }
  }

  public register(context: Apollo): void {
    this.#context = context;
  }

  public frame(): void {
    if (!this.#context || !this.#options.render || !this.cursorElement) {
      return;
    }

    const factor = 10 ** this.#options.precision;
    const position = {
      x: Math.round((this.#context.coords.x - this.#cursorBounding.width / 2) * factor) / factor,
      y: Math.round((this.#context.coords.y - this.#cursorBounding.height / 2) * factor) / factor,
    };

    const transform = `translateX(${position.x}px) translateY(${position.y}px) translateZ(0px)`;
    (this.cursorElement as HTMLElement).style.transform = transform;
  }

  public destroy(): void {
    if (this.#resizeObserver) {
      this.#resizeObserver.disconnect();
      this.#resizeObserver = null;
    }
  }

  public startRender(): void {
    this.#options.render = true;
  }

  public stopRender(): void {
    this.#options.render = false;
  }

  public get cursorElement(): Element | null {
    return this.#options.cursor;
  }

  public get boundings(): Partial<DOMRect> {
    return this.#cursorBounding;
  }
}

export default CSSRender;
