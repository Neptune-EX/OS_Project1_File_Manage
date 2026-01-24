import { toString } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_setup';

// Is a given value a boolean?
export default function isBoolean(obj) {
  return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
}
