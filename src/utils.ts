import {
  Vec2,
  Magnetism,
  Timeline,
  Element,
} from './declarations';

export function pushMode(element : Element, boundingCursor : Vec2) : Vec2 {
  const mode = (<Magnetism>element.target.magnetism).options;
  let coords = { x : 0, y: 0 };

  switch (true) {
    case mode === 'top':
      coords = {
        x: (element.rect.bounding.left + element.rect.bounding.center.x) - boundingCursor.x,
        y: element.rect.bounding.top - boundingCursor.y,
      };
      break;

    case mode === 'topleft':
      coords = {
        x: element.rect.bounding.left - boundingCursor.x,
        y: element.rect.bounding.top - boundingCursor.y,
      };
      break;

    case mode === 'topright':
      coords = {
        x: (element.rect.bounding.left + element.rect.bounding.width) - boundingCursor.x,
        y: element.rect.bounding.top - boundingCursor.y,
      };
      break;

    case mode === 'left':
      coords = {
        x: element.rect.bounding.left - boundingCursor.x,
        y: (element.rect.bounding.top + element.rect.bounding.center.y) - boundingCursor.y,
      };
      break;

    case mode === 'center':
      coords = {
        x: (element.rect.bounding.left + element.rect.bounding.center.x) - boundingCursor.x,
        y: (element.rect.bounding.top + element.rect.bounding.center.y) - boundingCursor.y,
      };
      break;

    case mode === 'right':
      coords = {
        x: (element.rect.bounding.left + element.rect.bounding.width) - boundingCursor.x,
        y: (element.rect.bounding.top + element.rect.bounding.center.y) - boundingCursor.y,
      };
      break;

    case mode === 'bottom':
      coords = {
        x: (element.rect.bounding.left + element.rect.bounding.center.x) - boundingCursor.x,
        y: (element.rect.bounding.top + element.rect.bounding.height) - boundingCursor.y,
      };
      break;

    case mode === 'bottomleft':
      coords = {
        x: (element.rect.bounding.left) - boundingCursor.x,
        y: (element.rect.bounding.top + element.rect.bounding.height) - boundingCursor.y,
      };
      break;

    case mode === 'bottomright':
    coords = {
        x: (element.rect.bounding.left + element.rect.bounding.width) - boundingCursor.x,
        y: (element.rect.bounding.top + element.rect.bounding.height) - boundingCursor.y,
      };
      break;

    default:
        console.warn(`'${mode}' is not setted`);
    }

  return coords;
};

export function editHTMLElement() {
  Object.defineProperty(HTMLElement.prototype, 'apolloId', {
    value: '',
    configurable: true,
    enumerable: true,
    writable: true,
  });
}