# Apollo

Create custom cursors with integrated animated props.

## Installation
```bash
# Install package
npm install @adoratorio/apollo
```
## Usage

Since this package has a [pkg.module](https://github.com/rollup/rollup/wiki/pkg.module) field, it’s highly recommended to import it as an ES6 module with some bundlers like [webpack](https://webpack.js.org/) or [rollup](https://rollupjs.org/):
```javascript
import Apollo from '@adoratorio/apollo';
const apollo = new Apollo({ });
```
If you are not using any bundlers, you can just load the UMD bundle:
```html
<script src="/apollo/umd/index.js"></script>
<script>var apollo = window.Apollo({ });</script>
```
## Available options
Medusa accept in the constructor and `option` object with the following possible props.

|parameter|type|default|description|
|:--------|:--:|:-----:|:----------|
|cursor|`HTMLElement`|`'.apollo__cursor'`|The HTML element reiceving the transforms to follow the mouse|
|props|`Array<PropertyDescriptor>`|`[]`|An array of Propery Descriptors to define wich props will be animated, a timeline will be created for each prop|
|easing|`Easing`|`{ mode: Apollo.EASING.CUBIC, duration: 1000 }`|An easing object used to describe the cursor element aniamtion|
|target|`Array<TargetDescriptor>`|`[]`|An array of Targets to describe witch elements will trigger an event when the mouse pass hover or out it|
|hiddenUntilFirstInteraction|boolean|`false`|If you want to keep the cursor element invisibile until the first valid user interaction is performed|
|initialPosition|`Vec2`|`{ x: 0, y: 0 }`|A Two components (x, y) vector to determinate the strarting position of the cursor element|
|detectTouch|boolean|`true`|If the touch events counts as valid interaction to evaluate a new cursor position|
|emitGlobal|boolean|`true`|If a global event is fired on `window` on items over or out|
|aion|`Aion`|`new Aion()`|An `Aion` instance to be used as engine, if not submitted one will be created for you|
|renderByPixel|boolean|`false`|If values rounding is used before applying styles|

## APIs
Targets are the interaction core, having callback and event on hover and leave of the element, you can define targets passing target descriptors to the constructor or using the dedicated method
```typescript
apolloInstance.addTargets(targets Array<TargetDescriptor>)
```
Anytime an element in target is hovered or leaved a global event is emitted (if the emitGlobal option is set to true).
Emitted events are

|name|when|
|:---|:---|
|`apollo-mouse-enter`|When the mouse pointer enter a target|
|`apollo-cursor-enter`|When the cursor element enter a target|
|`apollo-mouse-leave`|When the mouse pointer leave a target|
|`apollo-cursor-leave`|When the cursor element enter a target|

Having `TargetDescriptor` defined as follow

|parameter|type|descriptor|
|:--------|:--:|:---------|
|id|`string`|The id of the target, used to identify the target
|elements|`Array<HTMLElement>`|The HTMLElements array used to detect hover and leave
|offset|`{ x: number, y: number }`|The offset that will trigger hover and leave on elements
|callback|`Function`|Callback function for hover and leave

You can animate some css, attributes or js values of the DOM cursor element, or any other DOM element actually, by passing in a property descriptor in the `props` array parameter in constructor or adding a prop with the dedicated method.
```typescript
apolloInstance.addProperties(props : Array<PropertyDescriptor>)
```
Then when you need to update the value and make apollo to ease from the actual value to the newly setted one simply get the property and change its value like so
```typescript
apolloInstance.getProperty(key : string).value = value : any;
```
Having the `PropertyDescriptor` defined ad follow

|parameter|type|descriptor|
|:--------|:--:|:---------|
|key|`string`|The key that will be used when rendering the animation, for example `translateX`|
|type|`string`|Determins how the property will be used when rendering can be `Aplllo.PROPERTY_TYPE.TYPELESS` or `Apollo.PROPERTY_TYPE.STYLE` or `Apollo.PROPERTY_TYPE.TRANSFORM` or `Apollo.PROPERTY_TYPE.ATTRIBUTE`|
|target|`Element`|The DOM element used as target for rendering, not needed if prop is typeless|
|suffix|`string`|The suffix string used to render css props or transform will be applied in the form of `${value}${suffix}`|
|easing|`{ mode: Function, duration: number }`|The easing descriptor used to ease between values
|initial|`number`|The starting value for the property
|precision|`number`|Number of digits used to round the final rendered value

Each property exposes two additional methods: `play` and `pause`. Usable as follow

```typescript
apolloInstance.getProperty('prop_key').pause();
apolloInstance.getProperty('prop_key').play(resumeValue? : number);
```
 
*Watch out*: if the current target of the prop is the cursor element itself and you are animating the `translateX` or `translateY` transform you need to call `apolloInstance.stopMouseTracking()` and later when you need to start the mouse following again `apolloInstance.startMouseTracking()`.

__Anyway__ this is not an actual animation engine, is used just to update some props arount the cursor in a specific way avoiding the necessity to build a complete animation system. If you need more than this a complex animation system is required maybe with some animation frameworks.
