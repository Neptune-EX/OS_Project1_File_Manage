import rest from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/rest';

// Get the last element of an array. Passing **n** will return the last N
// values in the array.
export default function last(array, n, guard) {
  if (array == null || array.length < 1) return n == null || guard ? void 0 : [];
  if (n == null || guard) return array[array.length - 1];
  return rest(array, Math.max(0, array.length - n));
}
