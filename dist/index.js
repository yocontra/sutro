'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _express = require('express');

var _pluralize = require('pluralize');

var _pluralize2 = _interopRequireDefault(_pluralize);

var _getRequestHandler = require('./getRequestHandler');

var _getRequestHandler2 = _interopRequireDefault(_getRequestHandler);

var _getSwagger = require('./getSwagger');

var _getSwagger2 = _interopRequireDefault(_getSwagger);

var _methods = require('./methods');

var _methods2 = _interopRequireDefault(_methods);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getPath = function getPath(_ref) {
  var resource = _ref.resource,
      endpoint = _ref.endpoint,
      instance = _ref.instance;

  var path = '/' + (0, _pluralize2.default)(resource);
  if (instance) path += '/:' + resource + 'Id';
  if (endpoint && !_methods2.default[endpoint]) path += '/' + endpoint;
  return path;
};
//import join from 'url-join'


var wireResource = function wireResource(_ref2) {
  var name = _ref2.name,
      resource = _ref2.resource,
      router = _ref2.router;

  (0, _keys2.default)(resource).forEach(function (endpointName) {
    var endpoint = resource[endpointName];
    var methodInfo = endpoint.http || _methods2.default[endpointName];
    if (!methodInfo) {
      // TODO: error if still nothing found
      // TODO: fix paths
      wireResource({ name: endpointName, resource: endpoint, router: router });
      return;
    }
    var newPath = endpoint.path || getPath({
      resource: name,
      endpoint: endpointName,
      instance: methodInfo.instance
    });
    console.log(name, endpointName, newPath);
    router[methodInfo.method](newPath, (0, _getRequestHandler2.default)(endpoint));
  });
};

var wireResources = function wireResources(resources, router) {
  (0, _keys2.default)(resources).forEach(function (resourceName) {
    wireResource({
      name: resourceName,
      resource: resources[resourceName],
      router: router
    });
  });
};

exports.default = function () {
  var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      path = _ref3.path,
      resources = _ref3.resources;

  if (!resources) throw new Error('Missing resources option');
  var router = (0, _express.Router)({ mergeParams: true });
  router.swagger = (0, _getSwagger2.default)(resources);
  router.path = path;
  router.get('/swagger.json', function (req, res) {
    return res.json(router.swagger);
  });

  wireResources(resources, router);
  return router;
};

module.exports = exports['default'];