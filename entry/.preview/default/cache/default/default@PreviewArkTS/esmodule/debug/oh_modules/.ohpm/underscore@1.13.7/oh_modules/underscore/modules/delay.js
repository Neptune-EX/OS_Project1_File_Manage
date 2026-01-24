import restArguments from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/restArguments';

// Delays a function for the given number of milliseconds, and then calls
// it with the arguments supplied.
export default restArguments(function(func, wait, args) {
  return setTimeout(function() {
    return func.apply(null, args);
  }, wait);
});
