# Changelog

This file records changes from 4.0.0 onward. See [GitHub releases](https://github.com/Adoratorio/apollo/releases) for published release notes. Dates are shown where a matching GitHub release exists.

## Unreleased

### Documentation

- Refine contributor guidance and release notes; consolidate maintainer contacts in the README.

## [4.0.1](https://github.com/Adoratorio/apollo/releases/tag/v4.0.1) — 2026-09-08

### Changes

- Require Aion 1.0.1 so consumers receive the frame cleanup and scheduling fixes.

## 4.0.0

### Breaking changes

- Use native ES modules; CommonJS builds are not provided.
- Requires `@adoratorio/aion` ^1.

### Changes

- Add a `debug` option and consistent `[Apollo]` errors.
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

### Maintenance

- Update the development toolchain to TypeScript 7.
- Include source files and inline source maps for consumer debugging.
- Typecheck tests and verify packed exports.
