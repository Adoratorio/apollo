# Targets Detection

`TargetsDetection` is a plugin for `Apollo` that will trigger callbacks or events when the mouse or the cursor hovers or leave designated DOM elements. It does not use native mouseover or mouseleave events so it's more computationally expensive but it allows you to set an offset around the element (not possible in native events) and to track the cursor HTML element events not only the mouse. So if you don't need either of those please use native events.

## Available options
`TargetsDetection` accepts in the constructor an option object with the following possible props.

| parameter | type | default | description |
| :- | :-: | :-: | :- |
| targets | `Array<TargetDescriptor>` | `[]` | The DOM element on which the renderer will apply the style |
| emitGlobal | `boolean` | `true` | Determins if the plugin will emit custom events on `window` |

`TargetDescriptor` are composed as follow

| parameter | type | default | description |
| :- | :-: | :-: | :- |
| id | `string` | `` | The unique identifier of the target |
| elements | `Array<HTMLElements>` | `[]` | The list of DOM nodes to watch |
| offset | `Vec2` | `{ x: 0, y: 0 }` | The virtual offset around the element in both direction included when triggering events |
| callback | `Function` | `(target, type) => { }` | The function called on each event, will have the target and the event type as params  |
| checkVisibility | `TargetDetection.VISIBILITY_CHECK.NONE \| TargetDetection.VISIBILITY_CHECK.FULL \| TargetDetection.VISIBILITY_CHECK.PARTIAL` | `TargetDetection.VISIBILITY_CHECK.NONE` | If to check the full or partial visibility of the element before firing events or not checking at all  |

```javascript
import TargetsDetection from '@adoratorio/apollo/plugins/targets-detection';

apollo.registerPlugin(new TargetsDetection({
  id: 'td-test',
  elements: Array.from(document.querySelectorAll('[data-apollo-hover]')),
  offset: { x: 10, y: 5 },
  callback: (target, type) => {
    console.log(target, type);
  },
  ckeckVisibility: TargetDetection.VISIBILITY_CHECK.PARTIAL,
}));
```

## APIs

Targets are the interaction core, having callback and event on hover and leave of the element, you can define targets passing target descriptors to the constructor or using the dedicated method
```typescript
apolloInstance.addTarget(targets Array<TargetDescriptor>)
```
Anytime an element in target is hovered or leaved the callback is fired and a global event is emitted (if the emitGlobal option is set to true).
Emitted events are

|enumerator|name|when|
|:---|:---|:---|
|TargetsDetaction.EVENTS.MOUSE_ENTER|`apollo-mouse-enter`|When the mouse pointer enter a target|
|TargetsDetaction.EVENTS.CURSOR_ENTER|`apollo-cursor-enter`|When the cursor element enter a target|
|TargetsDetaction.EVENTS.MOUSE_LEAVE|`apollo-mouse-leave`|When the mouse pointer leave a target|
|TargetsDetaction.EVENTS.CURSOR_LEAVE|`apollo-cursor-leave`|When the cursor element enter a target|

## Public methods

### addTarget()

Add a full target passing a new target descriptor

```typescript
apollo.addTarget(target : TargetDescriptor) : undefined
```

**Parameters**

| parameter | required | description |
|:---|:---:|:---|
| target | `TargetDescriptor` | An object containg info about the target to be added |

### removeTarget()

Remove a specific target using his `id`

```typescript
apollo.removeTarget(id : string) : undefined
```

**Parameters**

| parameter | required | description |
|:---|:---:|:---|
| id | `string` | The id of the target to be removed |

### pullFromTarget()

Remove a specific element from his target group

```typescript
apollo.pullFromTarget(element : HTMLElement) : undefined
```

**Parameters**

| parameter | required | description |
|:---|:---:|:---|
| element | `HTMLElement` | The DOM node to be removed from his target group |
