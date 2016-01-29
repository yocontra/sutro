'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pluralize = require('pluralize');

var _pluralize2 = _interopRequireDefault(_pluralize);

var _requireDir = require('require-dir');

var _requireDir2 = _interopRequireDefault(_requireDir);

var _lodash = require('lodash.mapvalues');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.map');

var _lodash4 = _interopRequireDefault(_lodash3);

var _lodash5 = require('lodash.omit');

var _lodash6 = _interopRequireDefault(_lodash5);

var _methods = require('./methods');

var _methods2 = _interopRequireDefault(_methods);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var blacklist = ['model'];
var getDefaultFn = function getDefaultFn(m) {
  return m.__esModule ? m.default : m;
};

exports.default = function (opt) {
  if (!opt.path) throw new Error('Missing path');
  var resources = (0, _requireDir2.default)(opt.path, { recurse: true });

  var getPath = function getPath(resourceName, methodName, methodInfo) {
    var path = '/' + _pluralize2.default.plural(resourceName);
    if (!_methods2.default[methodName]) {
      path += '/' + methodName;
    }
    if (methodInfo.instance) {
      path += '/:id';
    }

    return path;
  };

  var getEndpoints = function getEndpoints(handlers, resourceName) {
    return (0, _lodash4.default)((0, _lodash6.default)(handlers, blacklist), function (handler, methodName) {
      var fn = getDefaultFn(handler);
      if (typeof fn !== 'function') {
        throw new Error('"' + resourceName + '" handler "' + methodName + '" did not export a function');
      }
      var methodInfo = handler.http ? handler.http : _methods2.default[methodName];
      if (!methodInfo) {
        throw new Error('"' + resourceName + '" handler "' + methodName + '" did not export a HTTP config object');
      }
      if (typeof methodInfo.method === 'undefined') {
        throw new Error('"' + resourceName + '" handler "' + methodName + '" did not export a HTTP config object containing "method"');
      }
      if (typeof methodInfo.instance === 'undefined') {
        throw new Error('"' + resourceName + '" handler "' + methodName + '" did not export a HTTP config object containing "instance"');
      }

      return {
        name: methodName,
        method: methodInfo.method.toLowerCase(),
        path: getPath(resourceName, methodName, methodInfo),
        instance: !!methodInfo.instance,
        handler: fn,
        model: handlers.model
      };
    });
  };

  return (0, _lodash2.default)(resources, getEndpoints);
};

module.exports = exports['default'];