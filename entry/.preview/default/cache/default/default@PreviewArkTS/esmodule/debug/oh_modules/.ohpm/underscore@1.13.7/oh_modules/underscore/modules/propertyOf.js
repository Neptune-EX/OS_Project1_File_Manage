import noop from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/noop';
import get from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/get';

// Generates a function for a given object that returns a given property.
export default function propertyOf(obj) {
  if (obj == null) return noop;
  return function(path) {
    return get(obj, path);
  };
}
