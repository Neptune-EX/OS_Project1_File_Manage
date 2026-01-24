import createAssigner from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_createAssigner';
import allKeys from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/allKeys';

// Fill in a given object with default properties.
export default createAssigner(allKeys, true);
