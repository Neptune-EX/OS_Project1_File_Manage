import restArguments from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/restArguments';
import isFunction from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isFunction';
import map from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/map';
import deepGet from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_deepGet';
import toPath from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_toPath';

// Invoke a method (with arguments) on every item in a collection.
export default restArguments(function(obj, path, args) {
  var contextPath, func;
  if (isFunction(path)) {
    func = path;
  } else {
    path = toPath(path);
    contextPath = path.slice(0, -1);
    path = path[path.length - 1];
  }
  return map(obj, function(context) {
    var method = func;
    if (!method) {
      if (contextPath && contextPath.length) {
        context = deepGet(context, contextPath);
      }
      if (context == null) return void 0;
      method = context[path];
    }
    return method == null ? method : method.apply(context, args);
  });
});
