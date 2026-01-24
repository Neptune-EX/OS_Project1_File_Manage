import filter from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/filter';

// Trim out all falsy values from an array.
export default function compact(array) {
  return filter(array, Boolean);
}
