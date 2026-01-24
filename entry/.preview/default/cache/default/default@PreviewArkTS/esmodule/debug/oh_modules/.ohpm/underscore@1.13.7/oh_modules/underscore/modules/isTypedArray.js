import { supportsArrayBuffer, nativeIsView, toString } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_setup';
import isDataView from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isDataView';
import constant from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/constant';
import isBufferLike from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_isBufferLike';

// Is a given value a typed array?
var typedArrayPattern = /\[object ((I|Ui)nt(8|16|32)|Float(32|64)|Uint8Clamped|Big(I|Ui)nt64)Array\]/;
function isTypedArray(obj) {
  // `ArrayBuffer.isView` is the most future-proof, so use it when available.
  // Otherwise, fall back on the above regular expression.
  return nativeIsView ? (nativeIsView(obj) && !isDataView(obj)) :
                isBufferLike(obj) && typedArrayPattern.test(toString.call(obj));
}

export default supportsArrayBuffer ? isTypedArray : constant(false);
