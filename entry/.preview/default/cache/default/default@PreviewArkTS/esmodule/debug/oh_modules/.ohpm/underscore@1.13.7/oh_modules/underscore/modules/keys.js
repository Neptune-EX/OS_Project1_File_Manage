import isObject from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isObject';
import { nativeKeys, hasEnumBug } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_setup';
import has from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_has';
import collectNonEnumProps from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_collectNonEnumProps';

// Retrieve the names of an object's own properties.
// Delegates to **ECMAScript 5**'s native `Object.keys`.
export default function keys(obj) {
  if (!isObject(obj)) return [];
  if (nativeKeys) return nativeKeys(obj);
  var keys = [];
  for (var key in obj) if (has(obj, key)) keys.push(key);
  // Ahem, IE < 9.
  if (hasEnumBug) collectNonEnumProps(obj, keys);
  return keys;
}
