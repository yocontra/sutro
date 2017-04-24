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

var idxd = function idxd(o) {
  return o.index || o;
};

var walkResource = function walkResource(_ref) {
  var base = _ref.base,
      name = _ref.name,
      resource = _ref.resource,
      hierarchy = _ref.hierarchy,
      handler = _ref.handler;

  var res = idxd(resource);

  // sort custom stuff first
  var endpointNames = [];
  (0, _keys2.default)(res).forEach(function (k) {
    return _methods2.default[k] ? endpointNames.push(k) : endpointNames.unshift(k);
  });

  endpointNames.forEach(function (endpointName) {
    var endpoint = res[endpointName];
    var methodInfo = endpoint.http || _methods2.default[endpointName];
    if (!methodInfo) {
      // TODO: error if still nothing found
      var newBase = (0, _getPath2.default)({ resource: name, instance: true });
      walkResource({
        base: base ? (0, _urlJoin2.default)(base, newBase) : newBase,
        name: endpointName,
        resource: endpoint,
        hierarchy: hierarchy ? hierarchy + '.' + name : name,
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
    handler((0, _extends3.default)({
      hierarchy: hierarchy ? hierarchy + '.' + name + '.' + endpointName : name + '.' + endpointName,
      path: fullPath,
      endpoint: endpoint
    }, methodInfo));
  });
};

exports.default = function (resources, handler) {
  (0, _keys2.default)(idxd(resources)).forEach(function (resourceName) {
    walkResource({
      name: resourceName,
      resource: resources[resourceName],
      handler: handler
    });
  });
};

module.exports = exports['default'];