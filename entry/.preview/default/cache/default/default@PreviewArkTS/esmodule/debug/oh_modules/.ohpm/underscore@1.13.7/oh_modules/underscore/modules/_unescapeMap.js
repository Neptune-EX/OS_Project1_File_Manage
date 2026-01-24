import invert from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/invert';
import escapeMap from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_escapeMap';

// Internal list of HTML entities for unescaping.
export default invert(escapeMap);
