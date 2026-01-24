import { _isNaN } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_setup';
import isNumber from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isNumber';

// Is the given value `NaN`?
export default function isNaN(obj) {
  return isNumber(obj) && _isNaN(obj);
}
