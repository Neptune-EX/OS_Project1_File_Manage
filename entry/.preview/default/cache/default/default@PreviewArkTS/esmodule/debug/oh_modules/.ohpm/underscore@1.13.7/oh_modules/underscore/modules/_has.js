import { hasOwnProperty } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_setup';

// Internal function to check whether `key` is an own property name of `obj`.
export default function has(obj, key) {
  return obj != null && hasOwnProperty.call(obj, key);
}
