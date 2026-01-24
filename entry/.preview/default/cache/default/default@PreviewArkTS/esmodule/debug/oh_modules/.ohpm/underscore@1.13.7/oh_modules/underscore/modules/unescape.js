import createEscaper from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_createEscaper';
import unescapeMap from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_unescapeMap';

// Function for unescaping strings from HTML interpolation.
export default createEscaper(unescapeMap);
