import group from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_group';
import has from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_has';

// Groups the object's values by a criterion. Pass either a string attribute
// to group by, or a function that returns the criterion.
export default group(function(result, value, key) {
  if (has(result, key)) result[key].push(value); else result[key] = [value];
});
