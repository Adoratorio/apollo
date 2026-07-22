# Apollo

An engine to create custom cursor animations, magnetism, and hover effects.

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
  cursor: document.querySelector('.apollo__cursor')
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
| `detectTouch` | `boolean` | `false` | If touch events count as valid interaction to evaluate a new cursor position. |
| `aion` | `Aion \| null` | `null` | An `Aion` instance to be used as engine; if left `null` one will be created automatically. |
| `debug` | `boolean` | `false` | Enable namespaced `console.warn` diagnostics for recoverable issues (contract violations always throw). Forwarded to the internally created `Aion`. |

## Methods

### Plugin Management

```typescript
// Register a single plugin (returns the assigned ID)
apollo.registerPlugin(plugin: ApolloPlugin, id?: string): string

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
*   **`velocity` (`Vec2`)**: Absolute per-axis speed of the cursor since the previous frame.
*   **`direction` (`Vec2`)**: Movement direction (`-1` or `1` per axis).
*   **`trackMouse` (`boolean`)**: Get or set the current mouse tracking state.

## TypeScript Support

Apollo is written in TypeScript and exports all necessary types and interfaces (e.g., `ApolloOptions`, `ApolloPlugin`, `Vec2`).