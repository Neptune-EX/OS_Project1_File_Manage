import identity from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/identity';
import isFunction from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isFunction';
import isObject from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isObject';
import isArray from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isArray';
import matcher from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/matcher';
import property from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/property';
import optimizeCb from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_optimizeCb';

// An internal function to generate callbacks that can be applied to each
// element in a collection, returning the desired result — either `_.identity`,
// an arbitrary callback, a property matcher, or a property accessor.
export default function baseIteratee(value, context, argCount) {
  if (value == null) return identity;
  if (isFunction(value)) return optimizeCb(value, context, argCount);
  if (isObject(value) && !isArray(value)) return matcher(value);
  return property(value);
}
