import Apollo from '../dist/index.js';
import { CSSRender, TargetsDetection } from '../dist/plugins/index.js';

function engine() {
  const handlers = new Map();
  return {
    start() {},
    add(fn, id) {
      handlers.set(id, fn);
      return id;
    },
    remove(id) {
      handlers.delete(id);
    },
    frame(dt = 16) {
      for (const fn of handlers.values()) {
        fn(dt);
      }
    },
  };
}
function assert(ok, message) {
  if (!ok) {
    throw new Error(message);
  }
}
export async function run() {
  const checks = [];
  const target = document.createElement('div');
  target.style.cssText = 'position:fixed;left:10px;top:10px;width:100px;height:100px';
  document.body.append(target);
  const cursor = document.createElement('div');
  cursor.style.cssText = 'position:fixed;width:20px;height:20px;pointer-events:none';
  document.body.append(cursor);
  const clock = engine();
  const a = new Apollo({ aion: clock, initialPosition: { x: 50, y: 50 } });
  a.registerPlugin(new CSSRender({ cursor }));
  const events = [];
  const detection = new TargetsDetection({
    emitGlobal: false,
    targets: [
      {
        id: 't',
        elements: [target],
        checkVisibility: 'full',
        callback: (_, event) => events.push(event),
      },
    ],
  });
  a.registerPlugin(detection);
  const original = document.elementFromPoint.bind(document);
  let hitTests = 0;
  document.elementFromPoint = (...args) => {
    hitTests++;
    return original(...args);
  };
  clock.frame();
  assert(hitTests === 4, 'Visibility check was not shared within the frame');
  assert(detection.activeMouseTarget, 'Target should be visible');
  const matrix = new DOMMatrix(getComputedStyle(cursor).transform);
  assert(matrix.m41 === 40 && matrix.m42 === 40, 'Cursor not centered using real layout');
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:100';
  document.body.append(overlay);
  clock.frame();
  assert(
    detection.activeMouseTarget === null && events.includes('apollo-mouse-leave'),
    'Occluded target stayed active',
  );
  a.destroy();
  assert(cursor.style.transform === '', 'Cursor transform was not restored');
  target.remove();
  cursor.remove();
  overlay.remove();
  document.elementFromPoint = original;
  checks.push('real hit testing, shared visibility reads, overlay leave and CSS centering');
  const benchmark = [];
  for (const count of [0, 10, 100, 1000]) {
    const elements = Array.from({ length: count }, () => {
      const el = document.createElement('div');
      el.style.cssText = 'position:fixed;top:10px;left:10px;width:10px;height:10px';
      document.body.append(el);
      return el;
    });
    const c = engine();
    const apollo = new Apollo({ aion: c, initialPosition: { x: 900, y: 600 } });
    apollo.registerPlugin(
      new TargetsDetection({ emitGlobal: false, targets: [{ id: 'bench', elements }] }),
    );
    c.frame();
    const samples = [];
    for (let i = 0; i < 360; i++) {
      const start = performance.now();
      c.frame(i % 2 ? 16.67 : 8.33);
      samples.push(performance.now() - start);
    }
    samples.sort((first, second) => first - second);
    benchmark.push({
      targets: count,
      p50_ms: samples[Math.floor(samples.length * 0.5)],
      p95_ms: samples[Math.floor(samples.length * 0.95)],
      scenario:
        'stationary pointer outside all targets; warm cached bounds; synthetic 60/120Hz deltas',
    });
    apollo.destroy();
    elements.forEach((el) => el.remove());
  }
  return { checks, benchmark };
}
