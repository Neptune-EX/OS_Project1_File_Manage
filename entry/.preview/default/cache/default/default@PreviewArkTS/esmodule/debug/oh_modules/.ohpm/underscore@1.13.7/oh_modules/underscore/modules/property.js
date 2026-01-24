import deepGet from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_deepGet';
import toPath from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_toPath';

// Creates a function that, when passed an object, will traverse that object’s
// properties down the given `path`, specified as an array of keys or indices.
export default function property(path) {
  path = toPath(path);
  return function(obj) {
    return deepGet(obj, path);
  };
}
