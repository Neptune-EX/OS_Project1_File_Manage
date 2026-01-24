import createAssigner from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_createAssigner';
import keys from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/keys';

// Assigns a given object with all the own properties in the passed-in
// object(s).
// (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
export default createAssigner(keys);
