import baseCreate from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_baseCreate';
import isObject from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isObject';

// Internal function to execute `sourceFunc` bound to `context` with optional
// `args`. Determines whether to execute a function as a constructor or as a
// normal function.
export default function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
  if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
  var self = baseCreate(sourceFunc.prototype);
  var result = sourceFunc.apply(self, args);
  if (isObject(result)) return result;
  return self;
}
