import _ from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/underscore';

// Start chaining a wrapped Underscore object.
export default function chain(obj) {
  var instance = _(obj);
  instance._chain = true;
  return instance;
}
