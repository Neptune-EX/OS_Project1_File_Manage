import getLength from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_getLength';
import isArray from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isArray';
import isString from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isString';
import isArguments from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isArguments';
import keys from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/keys';

// Is a given array, string, or object empty?
// An "empty" object has no enumerable own-properties.
export default function isEmpty(obj) {
  if (obj == null) return true;
  // Skip the more expensive `toString`-based type checks if `obj` has no
  // `.length`.
  var length = getLength(obj);
  if (typeof length == 'number' && (
    isArray(obj) || isString(obj) || isArguments(obj)
  )) return length === 0;
  return getLength(keys(obj)) === 0;
}
