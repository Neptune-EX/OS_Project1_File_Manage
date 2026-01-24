import optimizeCb from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_optimizeCb';

// Run a function **n** times.
export default function times(n, iteratee, context) {
  var accum = Array(Math.max(0, n));
  iteratee = optimizeCb(iteratee, context, 1);
  for (var i = 0; i < n; i++) accum[i] = iteratee(i);
  return accum;
}
