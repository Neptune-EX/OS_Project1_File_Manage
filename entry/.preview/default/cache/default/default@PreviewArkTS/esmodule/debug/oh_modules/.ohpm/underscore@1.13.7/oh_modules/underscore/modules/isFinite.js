import { _isFinite } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_setup';
import isSymbol from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isSymbol';

// Is a given object a finite number?
export default function isFinite(obj) {
  return !isSymbol(obj) && _isFinite(obj) && !isNaN(parseFloat(obj));
}
