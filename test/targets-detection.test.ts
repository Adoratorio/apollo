// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Apollo from '../src/index.ts';
import { TargetsDetection } from '../src/plugins/index.ts';
import { createFakeAion } from './fakeAion.ts';

function rect(left: number, top: number, width: number, height: number): DOMRect {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

let aion: ReturnType<typeof createFakeAion>;
let element: HTMLElement;

beforeEach(() => {
  aion = createFakeAion();
  document.body.innerHTML = '';
  element = document.createElement('div');
  document.body.append(element);
  element.getBoundingClientRect = () => rect(100, 100, 50, 50);
});

describe('TargetsDetection', () => {
  it('emits enter and leave for the mouse using the descriptor offset', () => {
    const apollo = new Apollo({ aion });
    const callback = vi.fn();
    const detection = new TargetsDetection({
      emitGlobal: false,
      targets: [{ id: 't', elements: [element], offset: { x: 10 }, callback }],
    });
    apollo.registerPlugin(detection);

    // Inside the horizontal offset, outside the element itself
    window.dispatchEvent(
      new PointerEvent('pointermove', { clientX: 95, clientY: 120, pointerType: 'mouse' }),
    );
    aion.frame(16);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0]?.[1]).toBe('apollo-mouse-enter');
    expect(detection.activeMouseTarget?.id).toBe('t-0');

    window.dispatchEvent(
      new PointerEvent('pointermove', { clientX: 0, clientY: 0, pointerType: 'mouse' }),
    );
    aion.frame(16);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback.mock.calls[1]?.[1]).toBe('apollo-mouse-leave');
    expect(detection.activeMouseTarget).toBeNull();
  });

  it('recomputes boundings once per frame after a scroll, not per event', () => {
    const apollo = new Apollo({ aion });
    const detection = new TargetsDetection({
      targets: [{ id: 't', elements: [element] }],
    });
    const spy = vi.spyOn(element, 'getBoundingClientRect');
    apollo.registerPlugin(detection);

    aion.frame(16);
    const initial = spy.mock.calls.length;

    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('resize'));
    expect(spy.mock.calls.length).toBe(initial);

    aion.frame(16);
    expect(spy.mock.calls.length).toBe(initial + 1);
    aion.frame(16);
    expect(spy.mock.calls.length).toBe(initial + 1);
  });

  it('hit-tests visibility only for targets under the pointer', () => {
    const apollo = new Apollo({ aion });
    const other = document.createElement('div');
    document.body.append(other);
    other.getBoundingClientRect = () => rect(500, 500, 50, 50);
    const fromPoint = vi.fn(() => element);
    document.elementFromPoint = fromPoint;

    const detection = new TargetsDetection({
      emitGlobal: false,
      targets: [
        {
          id: 't',
          elements: [element, other],
          checkVisibility: TargetsDetection.VISIBILITY_CHECK.FULL,
        },
      ],
    });
    apollo.registerPlugin(detection);

    aion.frame(16);
    expect(fromPoint).not.toHaveBeenCalled();

    window.dispatchEvent(
      new PointerEvent('pointermove', { clientX: 120, clientY: 120, pointerType: 'mouse' }),
    );
    aion.frame(16);
    // Four corners of the hovered target only
    expect(fromPoint).toHaveBeenCalledTimes(4);
    expect(detection.activeMouseTarget?.element).toBe(element);
  });

  it('drops removed elements and clears the active target', () => {
    const apollo = new Apollo({ aion });
    const detection = new TargetsDetection({
      emitGlobal: false,
      targets: [{ id: 't', elements: [element] }],
    });
    apollo.registerPlugin(detection);
    window.dispatchEvent(
      new PointerEvent('pointermove', { clientX: 120, clientY: 120, pointerType: 'mouse' }),
    );
    aion.frame(16);
    expect(detection.activeMouseTarget).not.toBeNull();

    detection.pullFromTarget(element);
    expect(detection.activeMouseTarget).toBeNull();
    aion.frame(16);
    expect(detection.activeMouseTarget).toBeNull();
  });
});
