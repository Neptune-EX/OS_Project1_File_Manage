import _ from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/underscore';
import each from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/each';
import { ArrayProto } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_setup';
import chainResult from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_chainResult';

// Add all mutator `Array` functions to the wrapper.
each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
  var method = ArrayProto[name];
  _.prototype[name] = function() {
    var obj = this._wrapped;
    if (obj != null) {
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) {
        delete obj[0];
      }
    }
    return chainResult(this, obj);
  };
});

// Add all accessor `Array` functions to the wrapper.
each(['concat', 'join', 'slice'], function(name) {
  var method = ArrayProto[name];
  _.prototype[name] = function() {
    var obj = this._wrapped;
    if (obj != null) obj = method.apply(obj, arguments);
    return chainResult(this, obj);
  };
});

export default _;
