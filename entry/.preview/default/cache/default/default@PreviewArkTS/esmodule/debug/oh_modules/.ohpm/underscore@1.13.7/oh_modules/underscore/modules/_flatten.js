import getLength from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_getLength';
import isArrayLike from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_isArrayLike';
import isArray from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isArray';
import isArguments from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isArguments';

// Internal implementation of a recursive `flatten` function.
export default function flatten(input, depth, strict, output) {
  output = output || [];
  if (!depth && depth !== 0) {
    depth = Infinity;
  } else if (depth <= 0) {
    return output.concat(input);
  }
  var idx = output.length;
  for (var i = 0, length = getLength(input); i < length; i++) {
    var value = input[i];
    if (isArrayLike(value) && (isArray(value) || isArguments(value))) {
      // Flatten current level of array or arguments object.
      if (depth > 1) {
        flatten(value, depth - 1, strict, output);
        idx = output.length;
      } else {
        var j = 0, len = value.length;
        while (j < len) output[idx++] = value[j++];
      }
    } else if (!strict) {
      output[idx++] = value;
    }
  }
  return output;
}
