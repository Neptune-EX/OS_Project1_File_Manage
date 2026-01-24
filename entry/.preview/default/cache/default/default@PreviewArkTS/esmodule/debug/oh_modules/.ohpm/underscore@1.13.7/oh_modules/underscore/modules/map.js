import cb from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_cb';
import isArrayLike from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_isArrayLike';
import keys from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/keys';

// Return the results of applying the iteratee to each element.
export default function map(obj, iteratee, context) {
  iteratee = cb(iteratee, context);
  var _keys = !isArrayLike(obj) && keys(obj),
      length = (_keys || obj).length,
      results = Array(length);
  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    results[index] = iteratee(obj[currentKey], currentKey, obj);
  }
  return results;
}
