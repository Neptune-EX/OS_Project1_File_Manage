import tagTester from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_tagTester';
import isFunction from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isFunction';
import isArrayBuffer from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isArrayBuffer';
import { hasDataViewBug } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_stringTagBug';

var isDataView = tagTester('DataView');

// In IE 10 - Edge 13, we need a different heuristic
// to determine whether an object is a `DataView`.
// Also, in cases where the native `DataView` is
// overridden we can't rely on the tag itself.
function alternateIsDataView(obj) {
  return obj != null && isFunction(obj.getInt8) && isArrayBuffer(obj.buffer);
}

export default (hasDataViewBug ? alternateIsDataView : isDataView);
