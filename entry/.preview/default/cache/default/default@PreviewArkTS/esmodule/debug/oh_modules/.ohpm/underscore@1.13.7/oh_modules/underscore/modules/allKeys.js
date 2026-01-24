import isObject from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isObject';
import { hasEnumBug } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_setup';
import collectNonEnumProps from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_collectNonEnumProps';

// Retrieve all the enumerable property names of an object.
export default function allKeys(obj) {
  if (!isObject(obj)) return [];
  var keys = [];
  for (var key in obj) keys.push(key);
  // Ahem, IE < 9.
  if (hasEnumBug) collectNonEnumProps(obj, keys);
  return keys;
}
