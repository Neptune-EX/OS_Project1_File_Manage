import cb from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_cb';
import getLength from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_getLength';

// Internal function to generate `_.findIndex` and `_.findLastIndex`.
export default function createPredicateIndexFinder(dir) {
  return function(array, predicate, context) {
    predicate = cb(predicate, context);
    var length = getLength(array);
    var index = dir > 0 ? 0 : length - 1;
    for (; index >= 0 && index < length; index += dir) {
      if (predicate(array[index], index, array)) return index;
    }
    return -1;
  };
}
