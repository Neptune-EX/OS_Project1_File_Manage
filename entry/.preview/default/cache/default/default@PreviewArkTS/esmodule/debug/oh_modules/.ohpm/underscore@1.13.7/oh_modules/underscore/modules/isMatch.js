import keys from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/keys';

// Returns whether an object has a given set of `key:value` pairs.
export default function isMatch(object, attrs) {
  var _keys = keys(attrs), length = _keys.length;
  if (object == null) return !length;
  var obj = Object(object);
  for (var i = 0; i < length; i++) {
    var key = _keys[i];
    if (attrs[key] !== obj[key] || !(key in obj)) return false;
  }
  return true;
}
