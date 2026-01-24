import toPath from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_toPath';
import deepGet from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_deepGet';
import isUndefined from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isUndefined';

// Get the value of the (deep) property on `path` from `object`.
// If any property in `path` does not exist or if the value is
// `undefined`, return `defaultValue` instead.
// The `path` is normalized through `_.toPath`.
export default function get(object, path, defaultValue) {
  var value = deepGet(object, toPath(path));
  return isUndefined(value) ? defaultValue : value;
}
