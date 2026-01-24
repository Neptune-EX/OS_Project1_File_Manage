import initial from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/initial';

// Get the first element of an array. Passing **n** will return the first N
// values in the array. The **guard** check allows it to work with `_.map`.
export default function first(array, n, guard) {
  if (array == null || array.length < 1) return n == null || guard ? void 0 : [];
  if (n == null || guard) return array[0];
  return initial(array, array.length - n);
}
