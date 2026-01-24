import partial from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/partial';

// Returns the first function passed as an argument to the second,
// allowing you to adjust arguments, run code before and after, and
// conditionally execute the original function.
export default function wrap(func, wrapper) {
  return partial(wrapper, func);
}
