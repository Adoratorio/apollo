# Apollo

An engine to create custom cursor animations and effects.

## Installation
Apollo s written in typescript and available as npm package with the alongside types definitions. So install as always

```bash
# Install package
npm install @adoratorio/apollo
```
## Usage
Then it can be required or imported as module

```javascript
import Apollo from '@adoratorio/apollo';
const apollo = new Apollo({ });
```
From now on you can instanciate and register plugins to handle the rendering of the amount with different teqniques or to add functionalities. Plugins stucture is explained later.

For the plugins they can also be imported singularly as modules from the plguins folder and then registered using the `registerPlugin` method.

```javascript
import { CSSRender } from '@/adoratorio/apollo/plugins';
apollo.registerPlugin(new CSSRender({ /* ... plugin options */ }));
```

## Available options
Apollo accept in the constructor an `option` object with the following possible props.

|parameter|type|default|description|
|:--------|:--:|:-----:|:----------|
|easing|`Easing`|`{ mode: Apollo.EASING.CUBIC, duration: 1000 }`|An easing object used to describe the cursor element aniamtion|
|initialPosition|`Vec2`|`{ x: 0, y: 0 }`|A Two components (x, y) vector to determinate the strarting position of the cursor element|
|detectTouch|boolean|`true`|If the touch events counts as valid interaction to evaluate a new cursor position|
|aion|`Aion`|`new Aion()`|An `Aion` instance to be used as engine, if not submitted one will be created for you|

## APIs

### Public Methods

### registerPlugin()

Register a plugin inside the current `Apollo` instance. Return a string with the registration id, useful for unregister
```typescript
apollo.registerPlugin(plugin : ApolloPlugin) : string
```

**Parameters**

| parameter | required | description |
|:---|:---:|:---|
| plugin | `ApolloPlugin` | The instance of the plugin to register |

### registerPlugins()

Register multiple plugins inside the current `Apollo` instance. Return an array of strings with the registration ids in positional corrispondence with the provided plugins array
```typescript
apollo.registerPlugins(plugin : Array<ApolloPlugin>) : Array<string>
```

**Parameters**

| parameter | required | description |
|:---|:---:|:---|
| plugin | `ApolloPlugin` | The instance of the plugin to register |

### unregisterPlugin()

Remove a plugin from the current `Apollo` instance using the registration id of the plugin. Return `true` if the plugin was found and unregistered
```typescript
apollo.unregisterPlugin(id : string) : boolean
```

**Parameters**

| parameter | required | description |
|:---|:---:|:---|
| plugin | `ApolloPlugin` | The instance of the plugin to register |

### getPlugin()

Get instance of a registerd plugin using his name
```typescript
apollo.getPlugin(name : String) : ApolloPlugin | undefined
```

**Parameters**

| parameter | required | description |
|:---|:---:|:---|
| name | `string` | The name of the plugin to retrive |

### startMouseTracking()

Starts the mouse tracking per frame. Same as `apollo.trackMouse = true`.
```typescript
apollo.startMouseTracking();
```

### stopMouseTracking()

Stops temporarly the mouse tracking per frame. Same as `apollo.trackMouse = false`.
```typescript
apollo.stopMouseTracking();
```

### Instance Properties

The Apollo instance exposes two main properties:

#### coords 
• Type: `interface Vec2 { x:number, y:number }`
With x and y props exposes the current smoothed position in screen pixels, updated frame-by-frame.

#### normalizedCoords
• Type: `interface Vec2 { x:number, y:number }`
With x and y props exposes the current smoothed position in normalized values from `-1` to `1`, updated frame-by-frame.

#### mouse 
• Type: `interface Vec2 { x:number, y:number }`
With x and y props exposes the current native mouse pointer position in screen pixels, updated frame-by-frame.

#### normalizedMouse
• Type: `interface Vec2 { x:number, y:number }`
With x and y props exposes the current native mouse pointer position in normalized values from `-1` to `1`, updated frame-by-frame.

#### velocity 
• Type: `interface Vec2 { x:number, y:number }`
With x and y props exposes the diffrence in time from the previous frame of the smoothed coords (not the mouse) indicating how much they have change in one frame using absolute values, updated frame-by-frame.

#### direction
• Type: `interface Vec2 { x:number, y:number }`
Comparing the previous frame and the current one holds the value of the direction the cursor is moving `-1` for right to left and bottom to top, `1` for left to right or top to bottom. Can be multiplied with velocity to have full information about the cursor movement compared to previous frame.

#### trackMouse
• Type: `boolean`
Get or set the current mouse tracking state. If `true` the mouse is being tracked and the `coords` and `mouse` are updated respectively. If `false` it will stop recording mouse position (not the frame or the engine itself).
