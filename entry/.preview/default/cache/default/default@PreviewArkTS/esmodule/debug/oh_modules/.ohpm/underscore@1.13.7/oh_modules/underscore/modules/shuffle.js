import sample from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/sample';

// Shuffle a collection.
export default function shuffle(obj) {
  return sample(obj, Infinity);
}
