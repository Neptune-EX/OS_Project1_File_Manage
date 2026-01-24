import tagTester from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_tagTester';
import { isIE11 } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_stringTagBug';
import { ie11fingerprint, weakMapMethods }  from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_methodFingerprint';

export default isIE11 ? ie11fingerprint(weakMapMethods) : tagTester('WeakMap');
