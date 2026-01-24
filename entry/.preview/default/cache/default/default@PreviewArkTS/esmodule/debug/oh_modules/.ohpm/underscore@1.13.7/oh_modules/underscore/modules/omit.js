import restArguments from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/restArguments';
import isFunction from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isFunction';
import negate from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/negate';
import map from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/map';
import flatten from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_flatten';
import contains from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/contains';
import pick from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/pick';

// Return a copy of the object without the disallowed properties.
export default restArguments(function(obj, keys) {
  var iteratee = keys[0], context;
  if (isFunction(iteratee)) {
    iteratee = negate(iteratee);
    if (keys.length > 1) context = keys[1];
  } else {
    keys = map(flatten(keys, false, false), String);
    iteratee = function(value, key) {
      return !contains(keys, key);
    };
  }
  return pick(obj, iteratee, context);
});
