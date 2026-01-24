import isArrayLike from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_isArrayLike';
import findIndex from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/findIndex';
import findKey from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/findKey';

// Return the first value which passes a truth test.
export default function find(obj, predicate, context) {
  var keyFinder = isArrayLike(obj) ? findIndex : findKey;
  var key = keyFinder(obj, predicate, context);
  if (key !== void 0 && key !== -1) return obj[key];
}
