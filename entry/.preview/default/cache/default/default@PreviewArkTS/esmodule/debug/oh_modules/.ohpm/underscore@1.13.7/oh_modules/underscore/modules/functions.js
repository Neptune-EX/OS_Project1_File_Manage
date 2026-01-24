import isFunction from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isFunction';

// Return a sorted list of the function names available on the object.
export default function functions(obj) {
  var names = [];
  for (var key in obj) {
    if (isFunction(obj[key])) names.push(key);
  }
  return names.sort();
}
