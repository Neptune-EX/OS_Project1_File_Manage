import restArguments from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/restArguments';
import unzip from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/unzip';

// Zip together multiple lists into a single array -- elements that share
// an index go together.
export default restArguments(unzip);
