import cb from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_cb';
import each from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/each';

// Return all the elements that pass a truth test.
export default function filter(obj, predicate, context) {
  var results = [];
  predicate = cb(predicate, context);
  each(obj, function(value, index, list) {
    if (predicate(value, index, list)) results.push(value);
  });
  return results;
}
