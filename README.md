# Apollo

Custom cursors, motion and target detection for browser interfaces.

## Installation

```bash
npm install @adoratorio/apollo
```

## Usage

This package is ESM-only. Import it as a module:

```typescript
import Apollo from '@adoratorio/apollo';

const apollo = new Apollo({
  initialPosition: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
});
```

From here, you can instantiate and register plugins to handle the rendering of the cursor or to add functionalities.

```typescript
import { CSSRender } from '@adoratorio/apollo/plugins';

apollo.registerPlugin(new CSSRender({
  cursor: document.querySelector<HTMLElement>('.apollo__cursor')
}));
```

### Shipped Plugins

The following plugins are shipped from the `@adoratorio/apollo/plugins` entry point:

| Plugin | Description |
| :----- | :---------- |
| [`CSSRender`](src/plugins/css-render/README.md) | Renders the cursor by writing CSS transforms directly on a DOM element. |
| [`TargetsDetection`](src/plugins/targets-detection/README.md) | Fires callbacks/events when the mouse or cursor enters/leaves designated target elements. |

## Configuration

Apollo accepts an `options` object with the following properties:

| Parameter | Type | Default | Description |
| :-------- | :--: | :-----: | :---------- |
| `easing` | `Easing` | `{ mode: Apollo.EASING.CUBIC, duration: 1000 }` | An easing object used to describe the cursor element animation. |
| `initialPosition` | `Vec2` | `{ x: 0, y: 0 }` | Starting position of the cursor element. |
| `detectTouch` | `boolean` | `false` | If touch events count as valid interaction to evaluate a new cursor position. When `false` touch pointers are ignored entirely. |
| `aion` | `Aion \| null` | `null` | An `Aion` instance to be used as engine; if left `null` one will be created automatically. |
| `debug` | `boolean` | `false` | Enable namespaced `console.warn` diagnostics for recoverable issues (contract violations always throw). Forwarded to the internally created `Aion`. |
| `respectReducedMotion` | `boolean` | Disabled when omitted | Use immediate movement while the system requests reduced motion. |

All constructor options are optional; `easing` and `initialPosition` accept partial objects. Durations are in milliseconds. `Apollo.EASING` provides `LINEAR`, `QUAD`, `CUBIC`, `QUART` and `QUINT`; a custom `(t: number) => number` function is also accepted. When providing an `aion` instance, start that engine yourself. `destroy()` removes Apollo's frame handler without destroying the shared engine.

## Methods

### Plugin Management

```text
// Register a single plugin (returns the assigned ID)
apollo.registerPlugin(plugin: ApolloPlugin, id?: string): string

// Register several plugins at once (returns the assigned IDs)
apollo.registerPlugins(plugins: ApolloPlugin[], ids?: string[]): string[]

// Unregister a plugin by ID
apollo.unregisterPlugin(id: string): boolean

// Retrieve a registered plugin by name
apollo.getPlugin(name: string): ApolloPlugin | undefined
```

### Instance Management

```typescript
// Starts or stops the mouse tracking per frame
apollo.startMouseTracking();
apollo.stopMouseTracking();

// Tear down the instance and clean up
apollo.destroy();
```

## Properties

*   **`coords` (`Vec2`)**: The current smoothed position in screen pixels. Settable.
*   **`normalizedCoords` (`Vec2`)**: Smoothed position in normalized values (`-1` to `1`).
*   **`mouse` (`Vec2`)**: Native mouse pointer position in screen pixels.
*   **`normalizedMouse` (`Vec2`)**: Native pointer position normalized to the viewport, from `-1` to `1`.
*   **`velocity` (`Vec2`)**: Absolute per-axis cursor speed in pixels per millisecond.
*   **`direction` (`Vec2`)**: Movement direction (`-1`, `0` or `1` per axis; `0` while the cursor is still).
*   **`trackMouse` (`boolean`)**: Get or set the current mouse tracking state.

## Custom plugins

Plugin names must be unique. `registerPlugin(plugin, id?)` assigns an ID and calls `register(context)` if provided; `registerPlugins(plugins, ids = [])` does this in array order. `getPlugin<T>(name)` looks up the plugin by its name, while `unregisterPlugin(id)` uses the assigned ID, calls `destroy()` and returns `false` when absent. An omitted or empty ID is generated automatically.

An `ApolloPlugin` requires `name` and may expose `id`, `register(context)`, `preFrame(context, delta)`, `frame(context, delta)`, `afterFrame(context, delta)` and `destroy()`. On each frame, Apollo calls all `preFrame` hooks, updates its motion, calls all `frame` hooks, commits its frame state, then calls all `afterFrame` hooks. Hooks run in registration order within each phase; `delta` is in milliseconds.

## Browser Support & SSR

Apollo listens for pointer events on `window` and needs `requestAnimationFrame`. Instantiating it outside of a browser environment throws an error.

## TypeScript Support

Apollo exports `ApolloOptions`, `ApolloInputOptions`, `ApolloPlugin`, `Vec2`, `Easing`, `Timeline` and `Aion` types. Plugin classes and their configuration types are exported from `@adoratorio/apollo/plugins`.

## Compatibility

Imports are safe during server-side rendering. Create instances and DOM plugins on the client after mounting. The package targets ES2023 and does not include polyfills.

## Motion and layout

Nested constructor settings may be partial. An easing duration of zero means
immediate movement; negative or non-finite easing durations are rejected.
`respectReducedMotion: true` opts in to immediate movement while the system
requests reduced motion. The default remains the existing easing behavior,
and plugin frame hooks continue running even while the instance is still.

When target positions change through transforms or virtual scrolling, call
`TargetsDetection.recalculate()` after updating the transform, before its next
frame check. Scroll/resize invalidation is automatic; arbitrary transforms are
not DOM resize events.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, checks and pull requests.
Version history is documented in the [changelog](CHANGELOG.md) and [GitHub releases](https://github.com/Adoratorio/apollo/releases).

## Maintainers

Maintained by [Adoratorio](https://github.com/Adoratorio).

- [Andrea Gottardi](https://github.com/AndreaGottardi)
- [Daniele Borra](https://github.com/borradaniele)
- [Andrea Biason](https://github.com/biazo5)

Contributor credits are preserved in [package.json](package.json) and the Git history.

## License

[MIT](LICENSE).
