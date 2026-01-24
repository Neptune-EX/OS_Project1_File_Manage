import has from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_has';

// Memoize an expensive function by storing its results.
export default function memoize(func, hasher) {
  var memoize = function(key) {
    var cache = memoize.cache;
    var address = '' + (hasher ? hasher.apply(this, arguments) : key);
    if (!has(cache, address)) cache[address] = func.apply(this, arguments);
    return cache[address];
  };
  memoize.cache = {};
  return memoize;
}
