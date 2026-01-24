import sortedIndex from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/sortedIndex';
import findIndex from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/findIndex';
import createIndexFinder from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_createIndexFinder';

// Return the position of the first occurrence of an item in an array,
// or -1 if the item is not included in the array.
// If the array is large and already in sort order, pass `true`
// for **isSorted** to use binary search.
export default createIndexFinder(1, findIndex, sortedIndex);
