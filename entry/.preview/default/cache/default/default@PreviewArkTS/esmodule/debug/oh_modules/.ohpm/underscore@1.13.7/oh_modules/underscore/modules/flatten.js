import _flatten from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_flatten';

// Flatten out an array, either recursively (by default), or up to `depth`.
// Passing `true` or `false` as `depth` means `1` or `Infinity`, respectively.
export default function flatten(array, depth) {
  return _flatten(array, depth, false);
}
