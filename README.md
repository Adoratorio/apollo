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
|props|Array<PropertyDescriptor>|`[]`|An array of Propery Descriptors to define wich props will be animated, a timeline will be created for each prop|
|easing|`Easing`|`{ mode: Apollo.EASING.CUBIC, duration: 1000 }`|An easing object used to describe the cursor element aniamtion|