// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from 'vitest';
import Apollo from '../src/index.ts';
import { CSSRender } from '../src/plugins/index.ts';
import { createFakeAion } from './fakeAion.ts';

const instances: Apollo[] = [];
afterEach(() => {
  for (const a of instances.splice(0)) {
    a.destroy();
  }
  vi.restoreAllMocks();
});
it('centers the cursor and restores the previous transform on destroy', () => {
  const aion = createFakeAion();
  const a = new Apollo({ aion, initialPosition: { x: 100, y: 200 } });
  instances.push(a);
  const cursor = document.createElement('div');
  cursor.style.transform = 'scale(2)';
  Object.defineProperties(cursor, { offsetWidth: { value: 20 }, offsetHeight: { value: 40 } });
  a.registerPlugin(new CSSRender({ cursor }));
  aion.frame(16);
  expect(cursor.style.transform).toBe('translate3d(90px, 180px, 0)');
  a.destroy();
  expect(cursor.style.transform).toBe('scale(2)');
});
it('respects reduced motion only when opted in', () => {
  vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList);
  const aion = createFakeAion();
  const a = new Apollo({ aion, respectReducedMotion: true });
  instances.push(a);
  a.coords = { x: 100, y: 200 };
  aion.frame(16);
  expect(a.coords).toEqual({ x: 100, y: 200 });
  const b = new Apollo({ aion });
  instances.push(b);
  b.coords = { x: 100, y: 200 };
  aion.frame(16);
  expect(b.coords.x).toBeLessThan(100);
});
