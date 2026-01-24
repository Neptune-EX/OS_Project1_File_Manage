import findLastIndex from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/findLastIndex';
import createIndexFinder from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_createIndexFinder';

// Return the position of the last occurrence of an item in an array,
// or -1 if the item is not included in the array.
export default createIndexFinder(-1, findLastIndex);
