import find from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/find';
import matcher from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/matcher';

// Convenience version of a common use case of `_.find`: getting the first
// object containing specific `key:value` pairs.
export default function findWhere(obj, attrs) {
  return find(obj, matcher(attrs));
}
