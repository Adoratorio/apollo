import { type ApolloPlugin } from '../../declarations.ts';
import type Apollo from '../../index.ts';
import { type CSSRenderOptions } from './declarations.ts';

class CSSRender implements ApolloPlugin {
  private context: Apollo | null = null;
  private options: CSSRenderOptions;
  private cursorBounding: DOMRect;

  public name = 'CSSRender';

  constructor(options: Partial<CSSRenderOptions>) {
    const defaults: CSSRenderOptions = {
      cursor: document.querySelector('.apollo__cursor') as HTMLElement,
      precision: 4,
      render: true,
    };

    this.options = { ...defaults, ...options };

    this.cursorBounding = (this.cursorElement as HTMLElement).getBoundingClientRect();
  }

  public register(context: Apollo): void {
    this.context = context;
  }

  public frame(): void {
    if (!this.context) {
      return;
    }
    if (!this.options.render) {
      return;
    }

    const position = {
      x: parseFloat(
        (this.context.coords.x - this.cursorBounding.width / 2).toFixed(this.options.precision),
      ),
      y: parseFloat(
        (this.context.coords.y - this.cursorBounding.height / 2).toFixed(this.options.precision),
      ),
    };

    if (this.cursorElement !== null) {
      const transform = `translateX(${position.x}px) translateY(${position.y}px) translateZ(0px)`;
      (this.cursorElement as HTMLElement).style.transform = transform;
    }
  }

  public startRender(): void {
    this.options.render = true;
  }

  public stopRender(): void {
    this.options.render = false;
  }

  public get cursorElement(): Element | null {
    return this.options.cursor;
  }

  public get boundings(): Partial<DOMRect> {
    return this.cursorBounding;
  }
}

export default CSSRender;
