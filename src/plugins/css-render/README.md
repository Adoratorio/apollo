# CSSRender

`CSSRender` is a plugin for `Apollo` that will handle the rendering using CSS DOM API writing transforms directly on the cursor element provided.

## Available options

`CSSRender` accepts in the constructor an option object with the following possible props.

| parameter |         type          |                   default                   | description                                                                          |
| :-------- | :-------------------: | :-----------------------------------------: | :----------------------------------------------------------------------------------- |
| cursor    | `HTMLElement \| null` | `document.querySelector('.apollo__cursor')` | The DOM element on which the renderer will apply the style                           |
| precision |       `number`        |                     `4`                     | The number of digits after the integer part to round to when rendering               |
| render    |       `boolean`       |                   `true`                    | If the style is currently applied every frame or not, use to pause or play rendering |

```typescript
import { CSSRender } from '@adoratorio/apollo/plugins';

apollo.registerPlugin(
  new CSSRender({
    cursor: document.querySelector<HTMLElement>('.cursor'),
  }),
);
```

## Public methods

### startRender()

Change the plugin rendering status to `true` so it will apply the style

```typescript
CSSRenderInstance.startRender();
```

### stopRender()

Change the plugin rendering status to `false` so it will NOT apply the style

```typescript
CSSRenderInstance.stopRender();
```

### Instance Getters

#### cursorElement

• Type: `HTMLElement | null`
Get back the DOM node associated with the style rendering

#### boundings

• Type: `Size` (`{ width, height }`)
The layout size of the cursor element (transforms excluded), kept up to date with a `ResizeObserver`. Used internally to center the cursor on the mouse.

## Lifecycle and layout

All constructor options are optional. If `cursor` is null or the default selector finds no element, rendering is skipped. Position the cursor element at the viewport origin (usually `position: fixed; top: 0; left: 0; pointer-events: none`); CSSRender writes its centered translation, not positioning styles.

`startRender()`, `stopRender()` and `destroy()` return `void`. `stopRender()` pauses writes while retaining the last transform. `destroy()` disconnects resize tracking and restores the original transform if it still owns the current value. Apollo invokes `frame(context)` automatically; unregister through `apollo.unregisterPlugin(id)` to remove the plugin and run cleanup.
