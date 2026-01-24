import partial from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/partial';
import delay from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/delay';
import _ from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/underscore';

// Defers a function, scheduling it to run after the current call stack has
// cleared.
export default partial(delay, _, 1);
