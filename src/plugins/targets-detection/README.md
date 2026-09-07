# Targets Detection

`TargetsDetection` is a plugin for `Apollo` that will trigger callbacks or events when the mouse or the cursor hovers or leave designated DOM elements. It does not use native mouseover or mouseleave events so it's more computationally expensive but it allows you to set an offset around the element (not possible in native events) and to track the cursor HTML element events not only the mouse. So if you don't need either of those please use native events.

## Available options

`TargetsDetection` accepts in the constructor an option object with the following possible props.

| parameter  |           type            | default | description                                                  |
| :--------- | :-----------------------: | :-----: | :----------------------------------------------------------- |
| targets    | `Array<TargetDescriptor>` |  `[]`   | The DOM element on which the renderer will apply the style   |
| emitGlobal |         `boolean`         | `true`  | Determines if the plugin will emit custom events on `window` |

`TargetDescriptor` are composed as follow

| parameter       |                                                                    type                                                                    |                 default                  | description                                                                                                                                                                |
| :-------------- | :----------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id              |                                                                  `string`                                                                  |                    ``                    | The unique identifier of the target                                                                                                                                        |
| elements        |                                                           `Array<HTMLElements>`                                                            |                   `[]`                   | The list of DOM nodes to watch                                                                                                                                             |
| offset          |                                                         `Partial<Vec2>` (optional)                                                         |             `{ x: 0, y: 0 }`             | The virtual offset around the element in both direction included when triggering events                                                                                    |
| callback        |                                                        `TargetCallback` (optional)                                                         |               `undefined`                | The function called on each event, will have the target and the event type as params                                                                                       |
| checkVisibility | `TargetsDetection.VISIBILITY_CHECK.NONE \| TargetsDetection.VISIBILITY_CHECK.FULL \| TargetsDetection.VISIBILITY_CHECK.PARTIAL` (optional) | `TargetsDetection.VISIBILITY_CHECK.NONE` | If to check the full or partial visibility of the element before firing events or not checking at all. Visibility is hit-tested only for targets the pointer is inside of. |

```typescript
import { TargetsDetection } from '@adoratorio/apollo/plugins';

apollo.registerPlugin(
  new TargetsDetection({
    targets: [
      {
        id: 'td-test',
        elements: Array.from(document.querySelectorAll('[data-apollo-hover]')),
        offset: { x: 10, y: 5 },
        callback: (target, type) => {
          console.log(target, type);
        },
        checkVisibility: TargetsDetection.VISIBILITY_CHECK.PARTIAL,
      },
    ],
    emitGlobal: false,
  }),
);
```

## APIs

Targets are the interaction core, having callback and event on hover and leave of the element, you can define targets passing target descriptors to the constructor or using the dedicated method on the plugin instance

```typescript
targetsDetectionInstance.addTarget(target : TargetDescriptor)
```

Anytime an element in target is hovered or leaved the callback is fired and a global event is emitted (if the emitGlobal option is set to true).
Emitted events are

| enumerator                           | name                  | when                                   |
| :----------------------------------- | :-------------------- | :------------------------------------- |
| TargetsDetection.EVENTS.MOUSE_ENTER  | `apollo-mouse-enter`  | When the mouse pointer enter a target  |
| TargetsDetection.EVENTS.CURSOR_ENTER | `apollo-cursor-enter` | When the cursor element enter a target |
| TargetsDetection.EVENTS.MOUSE_LEAVE  | `apollo-mouse-leave`  | When the mouse pointer leave a target  |
| TargetsDetection.EVENTS.CURSOR_LEAVE | `apollo-cursor-leave` | When the cursor element leave a target |

## Public methods

### addTarget()

Add a full target passing a new target descriptor

```typescript
targetsDetectionInstance.addTarget(target : TargetDescriptor) : undefined
```

**Parameters**

| parameter |      required      | description                                            |
| :-------- | :----------------: | :----------------------------------------------------- |
| target    | `TargetDescriptor` | An object containing info about the target to be added |

### removeTarget()

Remove a specific target using his `id`

```typescript
targetsDetectionInstance.removeTarget(id : string) : undefined
```

**Parameters**

| parameter | required | description                        |
| :-------- | :------: | :--------------------------------- |
| id        | `string` | The id of the target to be removed |

### recalculate()

Boundings are cached and refreshed once per frame after a scroll or resize. Call this when targets move without emitting those events (e.g. transform-based or virtual scrolling).

```typescript
targetsDetectionInstance.recalculate() : undefined
```

### pullFromTarget()

Remove a specific element from his target group

```typescript
targetsDetectionInstance.pullFromTarget(element : HTMLElement) : undefined
```

**Parameters**

| parameter |   required    | description                                      |
| :-------- | :-----------: | :----------------------------------------------- |
| element   | `HTMLElement` | The DOM node to be removed from his target group |
