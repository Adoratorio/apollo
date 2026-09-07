// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Apollo, { EASING } from '../src/index.ts';
import { createFakeAion } from './fakeAion.ts';

function move(x: number, y: number, pointerType = 'mouse'): void {
  window.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, pointerType }));
}

const instances: Apollo[] = [];
function createApollo(options: ConstructorParameters<typeof Apollo>[0] = {}): Apollo {
  const instance = new Apollo(options);
  instances.push(instance);
  return instance;
}
afterEach(() => {
  for (const instance of instances.splice(0)) {
    instance.destroy();
  }
  vi.restoreAllMocks();
});

let aion: ReturnType<typeof createFakeAion>;

beforeEach(() => {
  aion = createFakeAion();
});

describe('Apollo', () => {
  it('eases the cursor towards the mouse and reports direction 0 while still', () => {
    const apollo = createApollo({ aion, easing: { mode: EASING.LINEAR, duration: 100 } });

    aion.frame(16);
    expect(apollo.direction).toEqual({ x: 0, y: 0 });
    expect(apollo.velocity).toEqual({ x: 0, y: 0 });

    move(100, -50);
    aion.frame(50);

    expect(apollo.mouse).toEqual({ x: 100, y: -50 });
    expect(apollo.coords).toEqual({ x: 50, y: -25 });
    expect(apollo.direction).toEqual({ x: 1, y: -1 });
    expect(apollo.velocity).toEqual({ x: 1, y: 0.5 });
  });

  it('merges a partial easing with the defaults', () => {
    const apollo = createApollo({ aion, easing: { duration: 50 } });
    move(100, 0);
    expect(() => aion.frame(16)).not.toThrow();
    expect(apollo.coords.x).toBeGreaterThan(0);
  });

  it('ignores touch pointers unless detectTouch is on', () => {
    const apollo = createApollo({ aion });
    move(30, 40, 'touch');
    expect(apollo.mouse).toEqual({ x: 0, y: 0 });

    const touchApollo = createApollo({ aion, detectTouch: true });
    const touch = new Event('touchmove') as TouchEvent;
    Object.defineProperty(touch, 'touches', { value: [{ clientX: 30, clientY: 40 }] });
    window.dispatchEvent(touch);
    expect(touchApollo.mouse).toEqual({ x: 30, y: 40 });
    expect(apollo.mouse).toEqual({ x: 0, y: 0 });
  });

  it('keeps the render position frozen while mouse tracking is off', () => {
    const apollo = createApollo({ aion, easing: { mode: EASING.LINEAR, duration: 16 } });
    apollo.stopMouseTracking();
    move(100, 100);
    aion.frame(16);

    expect(apollo.mouse).toEqual({ x: 100, y: 100 });
    expect(apollo.coords).toEqual({ x: 0, y: 0 });

    apollo.coords = { x: 10, y: 10 };
    aion.frame(16);
    expect(apollo.coords).toEqual({ x: 10, y: 10 });
  });

  it('runs plugin hooks in order and rejects duplicated plugin names', () => {
    const apollo = createApollo({ aion });
    const calls: string[] = [];
    const plugin = {
      name: 'probe',
      register: vi.fn(),
      preFrame: () => calls.push('pre'),
      frame: () => calls.push('frame'),
      afterFrame: () => calls.push('after'),
      destroy: vi.fn(),
    };

    const id = apollo.registerPlugin(plugin);
    expect(plugin.register).toHaveBeenCalledWith(apollo);
    expect(() => apollo.registerPlugin({ name: 'probe' })).toThrow('already registered');

    aion.frame(16);
    expect(calls).toEqual(['pre', 'frame', 'after']);

    expect(apollo.unregisterPlugin(id)).toBe(true);
    expect(plugin.destroy).toHaveBeenCalledTimes(1);
    expect(apollo.unregisterPlugin(id)).toBe(false);
  });

  it('detaches from the engine and the window on destroy', () => {
    const apollo = createApollo({ aion });
    const plugin = { name: 'probe', destroy: vi.fn() };
    apollo.registerPlugin(plugin);

    apollo.destroy();
    move(50, 50);

    expect(apollo.mouse).toEqual({ x: 0, y: 0 });
    expect(aion.queue).toHaveLength(0);
    expect(plugin.destroy).toHaveBeenCalledTimes(1);
  });
});

describe('Apollo easing input', () => {
  it('treats zero duration as immediate and rejects invalid durations', () => {
    const apollo = createApollo({ aion, easing: { duration: 0 } });
    move(100, 200);
    aion.frame(16);
    expect(apollo.coords).toEqual({ x: 100, y: 200 });
    for (const duration of [-1, NaN, Infinity]) {
      expect(() => createApollo({ aion, easing: { duration } })).toThrow(RangeError);
    }
  });
});
