import restArguments from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/restArguments';
import difference from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/difference';

// Return a version of the array that does not contain the specified value(s).
export default restArguments(function(array, otherArrays) {
  return difference(array, otherArrays);
});
