import group from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_group';
import has from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_has';

// Counts instances of an object that group by a certain criterion. Pass
// either a string attribute to count by, or a function that returns the
// criterion.
export default group(function(result, value, key) {
  if (has(result, key)) result[key]++; else result[key] = 1;
});
