# Changelog

## 4.0.1

- Require Aion 1.0.1 so consumers receive the frame cleanup and scheduling fixes.

## 4.0.0

- ESM-only, TypeScript 7 toolchain, `debug` option, unified `[Apollo]` errors; requires `@adoratorio/aion` ^1.
- `direction` reports 0 per axis while the cursor is still.
- Touch pointers are ignored unless `detectTouch` is on; listeners live on `window`.
- Nested options (`easing`, `initialPosition`) are merged with the defaults.
- TargetsDetection recomputes boundings once per frame after scroll/resize and hit-tests visibility only for targets under the pointer; `recalculate()`; descriptor `offset`, `callback` and `checkVisibility` are optional.
- CSSRender measures the cursor with `offsetWidth`/`offsetHeight` and skips unchanged transforms; `boundings` is a `Size`.
- `registerPlugins(plugins, ids?)`; `getPlugin<T>()`.
- Support typed partial nested options and zero-duration immediate easing.
- Emit leave when active targets become occluded and reuse visibility tests within a frame.
- Restore CSSRender-owned transforms on destruction.
- Add opt-in respectReducedMotion without changing the default animation.
- Include source files and inline source maps for consumer debugging.
- Typecheck tests, verify packed exports, and document active maintainers separately from contributors.
