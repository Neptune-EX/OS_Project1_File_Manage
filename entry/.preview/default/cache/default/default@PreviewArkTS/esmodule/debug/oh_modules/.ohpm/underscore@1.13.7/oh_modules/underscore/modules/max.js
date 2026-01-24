import isArrayLike from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_isArrayLike';
import values from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/values';
import cb from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_cb';
import each from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/each';

// Return the maximum element (or element-based computation).
export default function max(obj, iteratee, context) {
  var result = -Infinity, lastComputed = -Infinity,
      value, computed;
  if (iteratee == null || (typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null)) {
    obj = isArrayLike(obj) ? obj : values(obj);
    for (var i = 0, length = obj.length; i < length; i++) {
      value = obj[i];
      if (value != null && value > result) {
        result = value;
      }
    }
  } else {
    iteratee = cb(iteratee, context);
    each(obj, function(v, index, list) {
      computed = iteratee(v, index, list);
      if (computed > lastComputed || (computed === -Infinity && result === -Infinity)) {
        result = v;
        lastComputed = computed;
      }
    });
  }
  return result;
}
