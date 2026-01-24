import baseCreate from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_baseCreate';
import extendOwn from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/extendOwn';

// Creates an object that inherits from the given prototype object.
// If additional properties are provided then they will be added to the
// created object.
export default function create(prototype, props) {
  var result = baseCreate(prototype);
  if (props) extendOwn(result, props);
  return result;
}
