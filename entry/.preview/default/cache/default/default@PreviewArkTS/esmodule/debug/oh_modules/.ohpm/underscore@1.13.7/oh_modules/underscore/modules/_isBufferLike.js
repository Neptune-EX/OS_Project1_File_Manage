import createSizePropertyCheck from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_createSizePropertyCheck';
import getByteLength from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_getByteLength';

// Internal helper to determine whether we should spend extensive checks against
// `ArrayBuffer` et al.
export default createSizePropertyCheck(getByteLength);
