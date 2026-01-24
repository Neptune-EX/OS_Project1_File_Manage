import partial from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/partial';
import before from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/before';

// Returns a function that will be executed at most one time, no matter how
// often you call it. Useful for lazy initialization.
export default partial(before, 2);
