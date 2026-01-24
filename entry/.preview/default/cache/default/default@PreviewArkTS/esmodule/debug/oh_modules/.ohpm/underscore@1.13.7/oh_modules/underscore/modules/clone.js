import isObject from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isObject';
import isArray from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isArray';
import extend from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/extend';

// Create a (shallow-cloned) duplicate of an object.
export default function clone(obj) {
  if (!isObject(obj)) return obj;
  return isArray(obj) ? obj.slice() : extend({}, obj);
}
