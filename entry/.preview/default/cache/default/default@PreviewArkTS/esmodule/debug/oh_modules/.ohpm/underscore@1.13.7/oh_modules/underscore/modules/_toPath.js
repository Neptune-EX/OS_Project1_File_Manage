import _ from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/underscore';
import '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/toPath';

// Internal wrapper for `_.toPath` to enable minification.
// Similar to `cb` for `_.iteratee`.
export default function toPath(path) {
  return _.toPath(path);
}
