import _ from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/underscore';
import baseIteratee from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_baseIteratee';
import iteratee from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/iteratee';

// The function we call internally to generate a callback. It invokes
// `_.iteratee` if overridden, otherwise `baseIteratee`.
export default function cb(value, context, argCount) {
  if (_.iteratee !== iteratee) return _.iteratee(value, context);
  return baseIteratee(value, context, argCount);
}
