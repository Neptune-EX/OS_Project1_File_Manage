import { nativeIsArray } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_setup';
import tagTester from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_tagTester';

// Is a given value an array?
// Delegates to ECMA5's native `Array.isArray`.
export default nativeIsArray || tagTester('Array');
