import keys from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/keys';

// Convert an object into a list of `[key, value]` pairs.
// The opposite of `_.object` with one argument.
export default function pairs(obj) {
  var _keys = keys(obj);
  var length = _keys.length;
  var pairs = Array(length);
  for (var i = 0; i < length; i++) {
    pairs[i] = [_keys[i], obj[_keys[i]]];
  }
  return pairs;
}
