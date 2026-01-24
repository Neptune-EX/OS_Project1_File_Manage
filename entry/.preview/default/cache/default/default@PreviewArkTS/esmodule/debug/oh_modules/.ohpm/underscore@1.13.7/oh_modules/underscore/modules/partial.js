import restArguments from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/restArguments';
import executeBound from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_executeBound';
import _ from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/underscore';

// Partially apply a function by creating a version that has had some of its
// arguments pre-filled, without changing its dynamic `this` context. `_` acts
// as a placeholder by default, allowing any combination of arguments to be
// pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.
var partial = restArguments(function(func, boundArgs) {
  var placeholder = partial.placeholder;
  var bound = function() {
    var position = 0, length = boundArgs.length;
    var args = Array(length);
    for (var i = 0; i < length; i++) {
      args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
    }
    while (position < arguments.length) args.push(arguments[position++]);
    return executeBound(func, bound, this, this, args);
  };
  return bound;
});

partial.placeholder = _;
export default partial;
