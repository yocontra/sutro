'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _urlJoin = require('url-join');

var _urlJoin2 = _interopRequireDefault(_urlJoin);

var _getPath = require('./getPath');

var _getPath2 = _interopRequireDefault(_getPath);

var _methods = require('./methods');

var _methods2 = _interopRequireDefault(_methods);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var walkResource = function walkResource(_ref) {
  var base = _ref.base,
      name = _ref.name,
      resource = _ref.resource,
      handler = _ref.handler;

  // sort custom stuff first
  var endpointNames = [];
  (0, _keys2.default)(resource).forEach(function (k) {
    return _methods2.default[k] ? endpointNames.push(k) : endpointNames.unshift(k);
  });

  endpointNames.forEach(function (endpointName) {
    var endpoint = resource[endpointName];
    var methodInfo = endpoint.http || _methods2.default[endpointName];
    if (!methodInfo) {
      // TODO: error if still nothing found
      var newBase = (0, _getPath2.default)({ resource: name, instance: true });
      walkResource({
        base: base ? (0, _urlJoin2.default)(base, newBase) : newBase,
        name: endpointName,
        resource: endpoint,
        handler: handler
      });
      return;
    }
    var path = endpoint.path || (0, _getPath2.default)({
      resource: name,
      endpoint: endpointName,
      instance: methodInfo.instance
    });
    var fullPath = base ? (0, _urlJoin2.default)(base, path) : path;
    handler((0, _extends3.default)({ path: fullPath, endpoint: endpoint }, methodInfo));
  });
};

exports.default = function (resources, handler) {
  (0, _keys2.default)(resources).forEach(function (resourceName) {
    walkResource({
      name: resourceName,
      resource: resources[resourceName],
      handler: handler
    });
  });
};

module.exports = exports['default'];