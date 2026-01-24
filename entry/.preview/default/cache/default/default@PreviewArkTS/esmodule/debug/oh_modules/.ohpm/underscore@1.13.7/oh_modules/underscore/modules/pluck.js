import map from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/map';
import property from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/property';

// Convenience version of a common use case of `_.map`: fetching a property.
export default function pluck(obj, key) {
  return map(obj, property(key));
}
