import isFunction from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isFunction';
import toPath from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_toPath';

// Traverses the children of `obj` along `path`. If a child is a function, it
// is invoked with its parent as context. Returns the value of the final
// child, or `fallback` if any child is undefined.
export default function result(obj, path, fallback) {
  path = toPath(path);
  var length = path.length;
  if (!length) {
    return isFunction(fallback) ? fallback.call(obj) : fallback;
  }
  for (var i = 0; i < length; i++) {
    var prop = obj == null ? void 0 : obj[path[i]];
    if (prop === void 0) {
      prop = fallback;
      i = length; // Ensure we don't continue iterating.
    }
    obj = isFunction(prop) ? prop.call(obj) : prop;
  }
  return obj;
}
