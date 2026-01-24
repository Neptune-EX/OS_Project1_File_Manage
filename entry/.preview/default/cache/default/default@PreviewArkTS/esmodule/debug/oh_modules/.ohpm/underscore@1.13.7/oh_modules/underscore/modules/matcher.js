import extendOwn from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/extendOwn';
import isMatch from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isMatch';

// Returns a predicate for checking whether an object has a given set of
// `key:value` pairs.
export default function matcher(attrs) {
  attrs = extendOwn({}, attrs);
  return function(obj) {
    return isMatch(obj, attrs);
  };
}
