import _ from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/underscore';
import baseIteratee from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_baseIteratee';

// External wrapper for our callback generator. Users may customize
// `_.iteratee` if they want additional predicate/iteratee shorthand styles.
// This abstraction hides the internal-only `argCount` argument.
export default function iteratee(value, context) {
  return baseIteratee(value, context, Infinity);
}
_.iteratee = iteratee;
