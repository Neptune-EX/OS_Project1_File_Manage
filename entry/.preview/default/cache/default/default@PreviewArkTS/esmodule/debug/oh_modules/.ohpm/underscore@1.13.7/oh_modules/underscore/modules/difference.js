import restArguments from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/restArguments';
import flatten from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_flatten';
import filter from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/filter';
import contains from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/contains';

// Take the difference between one array and a number of other arrays.
// Only the elements present in just the first array will remain.
export default restArguments(function(array, rest) {
  rest = flatten(rest, true, true);
  return filter(array, function(value){
    return !contains(rest, value);
  });
});
