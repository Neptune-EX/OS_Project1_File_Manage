import _has from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_has';
import toPath from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_toPath';

// Shortcut function for checking if an object has a given property directly on
// itself (in other words, not on a prototype). Unlike the internal `has`
// function, this public version can also traverse nested properties.
export default function has(obj, path) {
  path = toPath(path);
  var length = path.length;
  for (var i = 0; i < length; i++) {
    var key = path[i];
    if (!_has(obj, key)) return false;
    obj = obj[key];
  }
  return !!length;
}
