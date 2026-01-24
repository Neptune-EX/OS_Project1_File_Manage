import restArguments from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/restArguments';
import isFunction from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isFunction';
import executeBound from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_executeBound';

// Create a function bound to a given object (assigning `this`, and arguments,
// optionally).
export default restArguments(function(func, context, args) {
  if (!isFunction(func)) throw new TypeError('Bind must be called on a function');
  var bound = restArguments(function(callArgs) {
    return executeBound(func, bound, context, this, args.concat(callArgs));
  });
  return bound;
});
