import cb from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_cb';
import keys from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/keys';

// Returns the results of applying the `iteratee` to each element of `obj`.
// In contrast to `_.map` it returns an object.
export default function mapObject(obj, iteratee, context) {
  iteratee = cb(iteratee, context);
  var _keys = keys(obj),
      length = _keys.length,
      results = {};
  for (var index = 0; index < length; index++) {
    var currentKey = _keys[index];
    results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
  }
  return results;
}
