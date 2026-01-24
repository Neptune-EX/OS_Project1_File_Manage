import _ from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/underscore';
import each from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/each';
import functions from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/functions';
import { push } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_setup';
import chainResult from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_chainResult';

// Add your own custom functions to the Underscore object.
export default function mixin(obj) {
  each(functions(obj), function(name) {
    var func = _[name] = obj[name];
    _.prototype[name] = function() {
      var args = [this._wrapped];
      push.apply(args, arguments);
      return chainResult(this, func.apply(_, args));
    };
  });
  return _;
}
