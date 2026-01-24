import group from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_group';

// Indexes the object's values by a criterion, similar to `_.groupBy`, but for
// when you know that your index values will be unique.
export default group(function(result, value, key) {
  result[key] = value;
});
