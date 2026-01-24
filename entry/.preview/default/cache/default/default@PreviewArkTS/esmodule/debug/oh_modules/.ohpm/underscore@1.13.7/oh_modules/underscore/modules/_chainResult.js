import _ from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/underscore';

// Helper function to continue chaining intermediate results.
export default function chainResult(instance, obj) {
  return instance._chain ? _(obj).chain() : obj;
}
