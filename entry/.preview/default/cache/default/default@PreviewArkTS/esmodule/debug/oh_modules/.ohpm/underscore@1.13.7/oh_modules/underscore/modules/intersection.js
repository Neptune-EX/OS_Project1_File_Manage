import getLength from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_getLength';
import contains from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/contains';

// Produce an array that contains every item shared between all the
// passed-in arrays.
export default function intersection(array) {
  var result = [];
  var argsLength = arguments.length;
  for (var i = 0, length = getLength(array); i < length; i++) {
    var item = array[i];
    if (contains(result, item)) continue;
    var j;
    for (j = 1; j < argsLength; j++) {
      if (!contains(arguments[j], item)) break;
    }
    if (j === argsLength) result.push(item);
  }
  return result;
}
