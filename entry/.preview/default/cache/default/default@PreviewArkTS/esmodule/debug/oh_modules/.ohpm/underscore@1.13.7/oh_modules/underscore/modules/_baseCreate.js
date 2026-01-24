import isObject from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isObject';
import { nativeCreate } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_setup';

// Create a naked function reference for surrogate-prototype-swapping.
function ctor() {
  return function(){};
}

// An internal function for creating a new object that inherits from another.
export default function baseCreate(prototype) {
  if (!isObject(prototype)) return {};
  if (nativeCreate) return nativeCreate(prototype);
  var Ctor = ctor();
  Ctor.prototype = prototype;
  var result = new Ctor;
  Ctor.prototype = null;
  return result;
}
