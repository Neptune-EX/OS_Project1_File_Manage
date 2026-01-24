import isArrayLike from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_isArrayLike';
import values from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/values';
import indexOf from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/indexOf';

// Determine if the array or object contains a given item (using `===`).
export default function contains(obj, item, fromIndex, guard) {
  if (!isArrayLike(obj)) obj = values(obj);
  if (typeof fromIndex != 'number' || guard) fromIndex = 0;
  return indexOf(obj, item, fromIndex) >= 0;
}
