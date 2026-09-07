import { type ApolloPlugin } from '../../types.ts';
import type Apollo from '../../index.ts';
import { type CSSRenderOptions, type Size } from './types.ts';

class CSSRender implements ApolloPlugin {
  #options: CSSRenderOptions;
  #size: Size = { width: 0, height: 0 };
  #resizeObserver: ResizeObserver | null = null;
  #lastTransform = '';

  public name = 'CSSRender';

  constructor(options: Partial<CSSRenderOptions> = {}) {
    const defaults: CSSRenderOptions = {
      cursor:
        typeof document !== 'undefined'
          ? document.querySelector<HTMLElement>('.apollo__cursor')
          : null,
      precision: 4,
      render: true,
    };
    this.#options = { ...defaults, ...options };

    const { cursor } = this.#options;
    if (cursor) {
      this.#measure(cursor);
      if (typeof ResizeObserver !== 'undefined') {
        this.#resizeObserver = new ResizeObserver(() => this.#measure(cursor));
        this.#resizeObserver.observe(cursor);
      }
    }
  }

  // Layout size, unaffected by the transforms applied to the cursor itself
  // (a CSS scale on hover must not shift the centering)
  #measure(cursor: HTMLElement): void {
    this.#size = { width: cursor.offsetWidth, height: cursor.offsetHeight };
  }

  public frame(context: Apollo): void {
    const { cursor, render, precision } = this.#options;
    if (!render || !cursor) {
      return;
    }

    const factor = 10 ** precision;
    const x = Math.round((context.coords.x - this.#size.width / 2) * factor) / factor;
    const y = Math.round((context.coords.y - this.#size.height / 2) * factor) / factor;

    // Skip the style write when the cursor has not moved
    const transform = `translate3d(${x}px, ${y}px, 0)`;
    if (transform === this.#lastTransform) {
      return;
    }
    this.#lastTransform = transform;
    cursor.style.transform = transform;
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

  public get cursorElement(): HTMLElement | null {
    return this.#options.cursor;
  }

  public get boundings(): Size {
    return this.#size;
  }
}

export default CSSRender;
