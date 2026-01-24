import _ from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/underscore';
import isArray from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isArray';

// Normalize a (deep) property `path` to array.
// Like `_.iteratee`, this function can be customized.
export default function toPath(path) {
  return isArray(path) ? path : [path];
}
_.toPath = toPath;
