'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.load = undefined;

var _express = require('express');

var _lodash = require('lodash.foreach');

var _lodash2 = _interopRequireDefault(_lodash);

var _requireDir = require('require-dir');

var _requireDir2 = _interopRequireDefault(_requireDir);

var _loadResources = require('./loadResources');

var _loadResources2 = _interopRequireDefault(_loadResources);

var _handleRequest = require('./handleRequest');

var _handleRequest2 = _interopRequireDefault(_handleRequest);

var _displayResources = require('./displayResources');

var _displayResources2 = _interopRequireDefault(_displayResources);

var _errorHandler = require('./errorHandler');

var _errorHandler2 = _interopRequireDefault(_errorHandler);

var _debug2 = require('debug');

var _debug3 = _interopRequireDefault(_debug2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug3.default)('sutro:loader');

var wireEndpoint = function wireEndpoint(router, endpoint, resourceName) {
  debug('  - ' + endpoint.name + ' (' + endpoint.method.toUpperCase() + ' ' + endpoint.path + ')');
  router[endpoint.method](endpoint.path, (0, _handleRequest2.default)(endpoint, resourceName));
};

var wireResource = function wireResource(router) {
  return function (endpoints, resourceName) {
    var number = endpoints.length > 1 ? 'endpoints' : 'endpoint';
    debug('Loaded ' + endpoints.length + ' ' + number + ' for "' + resourceName + '"');
    (0, _lodash2.default)(endpoints, function (endpoint) {
      return wireEndpoint(router, endpoint, resourceName);
    });
  };
};

var load = exports.load = function load(path) {
  return (0, _requireDir2.default)(path, { recurse: true });
};

exports.default = function (_ref) {
  var prefix = _ref.prefix;
  var resources = _ref.resources;

  if (!resources) throw new Error('Missing resources option');
  var loadedResources = (0, _loadResources2.default)(resources);
  var meta = (0, _displayResources2.default)(prefix, loadedResources);
  var router = (0, _express.Router)({ mergeParams: true });
  router.meta = meta;
  router.prefix = prefix;

  (0, _lodash2.default)(loadedResources, wireResource(router));
  router.get('/_resources', function (req, res) {
    return res.json(meta);
  });
  router.use(_errorHandler2.default);

  return router;
};