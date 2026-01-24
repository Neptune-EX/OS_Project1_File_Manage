import filter from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/filter';
import negate from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/negate';
import cb from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_cb';

// Return all the elements for which a truth test fails.
export default function reject(obj, predicate, context) {
  return filter(obj, negate(cb(predicate)), context);
}
