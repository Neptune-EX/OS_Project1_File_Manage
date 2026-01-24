import restArguments from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/restArguments';
import flatten from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_flatten';
import bind from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/bind';

// Bind a number of an object's methods to that object. Remaining arguments
// are the method names to be bound. Useful for ensuring that all callbacks
// defined on an object belong to it.
export default restArguments(function(obj, keys) {
  keys = flatten(keys, false, false);
  var index = keys.length;
  if (index < 1) throw new Error('bindAll must be passed function names');
  while (index--) {
    var key = keys[index];
    obj[key] = bind(obj[key], obj);
  }
  return obj;
});
