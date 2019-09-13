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
|:-------|:--:|:-----:|:----------|
|cursor|`HTMLElement`|`document.querySelector('.apollo__cursor)`|The HTML element reiceving the transforms to follow the mouse|
|props|`Array<PropertyDescriptor>`|`[]`|An array of Propery Descriptors to define wich props will be animated, a timeline will be created for each prop|
|easing|`Easing`|`{ mode: Apollo.EASING.CUBIC, duration: 1000 }`|An easing object used to describe the cursor element aniamtion|
|target|`Array<TargetDescriptor>`|`[]`|An array of Targets to describe witch elements will trigger an event when the mouse pass hover or out it|
|hiddenUntilFirstInteraction|boolean|`false`|If you want to keep the cursor element invisibile until the first valid user interaction is performed|
|initialPosition|`Vec2`|`{ x: 0, y: 0 }`|A Two components (x, y) vector to determinate the strarting position of the cursor element|
|detectTouch|boolean|`true`|If the touch events counts as valid interaction to evaluate a new cursor position|
|emitGlobal|boolean|`true`|If a global event is fired on `window` on items over or out|
|aion|`Aion`|`new Aion()`|An `Aion` instance to be used as engine, if not submitted one will be created for you|
|renderByPixel|boolean|`false`|If values rounding is used before applying styles|