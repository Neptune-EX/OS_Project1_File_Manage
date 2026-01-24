import isArray from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isArray';
import { slice } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_setup';
import isString from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isString';
import isArrayLike from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_isArrayLike';
import map from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/map';
import identity from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/identity';
import values from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/values';

// Safely create a real, live array from anything iterable.
var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
export default function toArray(obj) {
  if (!obj) return [];
  if (isArray(obj)) return slice.call(obj);
  if (isString(obj)) {
    // Keep surrogate pair characters together.
    return obj.match(reStrSymbol);
  }
  if (isArrayLike(obj)) return map(obj, identity);
  return values(obj);
}
