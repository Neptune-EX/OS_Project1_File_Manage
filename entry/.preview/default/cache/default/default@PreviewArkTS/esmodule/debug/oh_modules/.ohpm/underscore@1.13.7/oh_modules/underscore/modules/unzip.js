import max from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/max';
import getLength from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_getLength';
import pluck from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/pluck';

// Complement of zip. Unzip accepts an array of arrays and groups
// each array's elements on shared indices.
export default function unzip(array) {
  var length = (array && max(array, getLength).length) || 0;
  var result = Array(length);

  for (var index = 0; index < length; index++) {
    result[index] = pluck(array, index);
  }
  return result;
}
