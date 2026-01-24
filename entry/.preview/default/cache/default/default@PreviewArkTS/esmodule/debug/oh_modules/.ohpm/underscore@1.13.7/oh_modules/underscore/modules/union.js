import restArguments from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/restArguments';
import uniq from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/uniq';
import flatten from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_flatten';

// Produce an array that contains the union: each distinct element from all of
// the passed-in arrays.
export default restArguments(function(arrays) {
  return uniq(flatten(arrays, true, true));
});
