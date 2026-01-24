import { toString } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_setup';

// Internal function for creating a `toString`-based type tester.
export default function tagTester(name) {
  var tag = '[object ' + name + ']';
  return function(obj) {
    return toString.call(obj) === tag;
  };
}
