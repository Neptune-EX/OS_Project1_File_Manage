import filter from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/filter';
import matcher from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/matcher';

// Convenience version of a common use case of `_.filter`: selecting only
// objects containing specific `key:value` pairs.
export default function where(obj, attrs) {
  return filter(obj, matcher(attrs));
}
