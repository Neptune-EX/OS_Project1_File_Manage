// Named Exports
// =============

//     Underscore.js 1.13.7
//     https://underscorejs.org
//     (c) 2009-2024 Jeremy Ashkenas, Julian Gonggrijp, and DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

// Baseline setup.
export { VERSION } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/_setup';
export { default as restArguments } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/restArguments';

// Object Functions
// ----------------
// Our most fundamental functions operate on any JavaScript object.
// Most functions in Underscore depend on at least one function in this section.

// A group of functions that check the types of core JavaScript values.
// These are often informally referred to as the "isType" functions.
export { default as isObject } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isObject';
export { default as isNull } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isNull';
export { default as isUndefined } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isUndefined';
export { default as isBoolean } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isBoolean';
export { default as isElement } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isElement';
export { default as isString } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isString';
export { default as isNumber } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isNumber';
export { default as isDate } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isDate';
export { default as isRegExp } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isRegExp';
export { default as isError } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isError';
export { default as isSymbol } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isSymbol';
export { default as isArrayBuffer } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isArrayBuffer';
export { default as isDataView } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isDataView';
export { default as isArray } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isArray';
export { default as isFunction } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isFunction';
export { default as isArguments } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isArguments';
export { default as isFinite } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isFinite';
export { default as isNaN } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isNaN';
export { default as isTypedArray } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isTypedArray';
export { default as isEmpty } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isEmpty';
export { default as isMatch } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isMatch';
export { default as isEqual } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isEqual';
export { default as isMap } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isMap';
export { default as isWeakMap } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isWeakMap';
export { default as isSet } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isSet';
export { default as isWeakSet } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/isWeakSet';

// Functions that treat an object as a dictionary of key-value pairs.
export { default as keys } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/keys';
export { default as allKeys } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/allKeys';
export { default as values } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/values';
export { default as pairs } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/pairs';
export { default as invert } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/invert';
export { default as functions,
         default as methods   } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/functions';
export { default as extend } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/extend';
export { default as extendOwn,
         default as assign    } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/extendOwn';
export { default as defaults } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/defaults';
export { default as create } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/create';
export { default as clone } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/clone';
export { default as tap } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/tap';
export { default as get } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/get';
export { default as has } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/has';
export { default as mapObject } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/mapObject';

// Utility Functions
// -----------------
// A bit of a grab bag: Predicate-generating functions for use with filters and
// loops, string escaping and templating, create random numbers and unique ids,
// and functions that facilitate Underscore's chaining and iteration conventions.
export { default as identity } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/identity';
export { default as constant } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/constant';
export { default as noop } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/noop';
export { default as toPath } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/toPath';
export { default as property } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/property';
export { default as propertyOf } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/propertyOf';
export { default as matcher,
         default as matches } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/matcher';
export { default as times } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/times';
export { default as random } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/random';
export { default as now } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/now';
export { default as escape } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/escape';
export { default as unescape } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/unescape';
export { default as templateSettings } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/templateSettings';
export { default as template } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/template';
export { default as result } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/result';
export { default as uniqueId } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/uniqueId';
export { default as chain } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/chain';
export { default as iteratee } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/iteratee';

// Function (ahem) Functions
// -------------------------
// These functions take a function as an argument and return a new function
// as the result. Also known as higher-order functions.
export { default as partial } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/partial';
export { default as bind } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/bind';
export { default as bindAll } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/bindAll';
export { default as memoize } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/memoize';
export { default as delay } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/delay';
export { default as defer } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/defer';
export { default as throttle } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/throttle';
export { default as debounce } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/debounce';
export { default as wrap } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/wrap';
export { default as negate } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/negate';
export { default as compose } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/compose';
export { default as after } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/after';
export { default as before } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/before';
export { default as once } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/once';

// Finders
// -------
// Functions that extract (the position of) a single element from an object
// or array based on some criterion.
export { default as findKey } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/findKey';
export { default as findIndex } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/findIndex';
export { default as findLastIndex } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/findLastIndex';
export { default as sortedIndex } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/sortedIndex';
export { default as indexOf } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/indexOf';
export { default as lastIndexOf } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/lastIndexOf';
export { default as find,
         default as detect } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/find';
export { default as findWhere } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/findWhere';

// Collection Functions
// --------------------
// Functions that work on any collection of elements: either an array, or
// an object of key-value pairs.
export { default as each,
         default as forEach } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/each';
export { default as map,
         default as collect } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/map';
export { default as reduce,
         default as foldl,
         default as inject } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/reduce';
export { default as reduceRight,
         default as foldr       } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/reduceRight';
export { default as filter,
         default as select } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/filter';
export { default as reject } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/reject';
export { default as every,
         default as all   } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/every';
export { default as some,
         default as any  } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/some';
export { default as contains,
         default as includes,
         default as include  } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/contains';
export { default as invoke } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/invoke';
export { default as pluck } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/pluck';
export { default as where } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/where';
export { default as max } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/max';
export { default as min } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/min';
export { default as shuffle } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/shuffle';
export { default as sample } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/sample';
export { default as sortBy } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/sortBy';
export { default as groupBy } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/groupBy';
export { default as indexBy } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/indexBy';
export { default as countBy } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/countBy';
export { default as partition } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/partition';
export { default as toArray } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/toArray';
export { default as size } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/size';

// `_.pick` and `_.omit` are actually object functions, but we put
// them here in order to create a more natural reading order in the
// monolithic build as they depend on `_.contains`.
export { default as pick } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/pick';
export { default as omit } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/omit';

// Array Functions
// ---------------
// Functions that operate on arrays (and array-likes) only, because they’re
// expressed in terms of operations on an ordered list of values.
export { default as first,
         default as head,
         default as take  } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/first';
export { default as initial } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/initial';
export { default as last } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/last';
export { default as rest,
         default as tail,
         default as drop } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/rest';
export { default as compact } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/compact';
export { default as flatten } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/flatten';
export { default as without } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/without';
export { default as uniq,
         default as unique } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/uniq';
export { default as union } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/union';
export { default as intersection } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/intersection';
export { default as difference } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/difference';
export { default as unzip,
         default as transpose } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/unzip';
export { default as zip } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/zip';
export { default as object } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/object';
export { default as range } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/range';
export { default as chunk } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/chunk';

// OOP
// ---
// These modules support the "object-oriented" calling style. See also
// `underscore.js` and `index-default.js`.
export { default as mixin } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/mixin';
export { default } from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/underscore-array-methods';
