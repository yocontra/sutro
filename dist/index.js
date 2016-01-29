'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _lodash = require('lodash.foreach');

var _lodash2 = _interopRequireDefault(_lodash);

var _loadResources = require('./loadResources');

var _loadResources2 = _interopRequireDefault(_loadResources);

var _handleRequest = require('./handleRequest');

var _handleRequest2 = _interopRequireDefault(_handleRequest);

var _displayResources = require('./displayResources');

var _displayResources2 = _interopRequireDefault(_displayResources);

var _debug2 = require('debug');

var _debug3 = _interopRequireDefault(_debug2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug3.default)('sutro:loader');

var wireEndpoint = function wireEndpoint(router) {
  return function (endpoint) {
    debug('  - ' + endpoint.name + ' (' + endpoint.method.toUpperCase() + ' ' + endpoint.path + ')');
    router[endpoint.method](endpoint.path, (0, _handleRequest2.default)(endpoint.handler));
  };
};

var wireResource = function wireResource(router) {
  return function (endpoints, resourceName) {
    debug('Loaded ' + endpoints.length + ' endpoints for "' + resourceName + '"');
    (0, _lodash2.default)(endpoints, wireEndpoint(router));
  };
};

exports.default = function (opt) {
  var resources = (0, _loadResources2.default)(opt);
  var meta = (0, _displayResources2.default)(resources, opt);

  // construct the router
  var router = (0, _express.Router)({ mergeParams: true });
  router.meta = meta;
  (0, _lodash2.default)(resources, wireResource(router));
  router.get('/_resources', function (req, res) {
    return res.json(meta);
  });
  return router;
};

module.exports = exports['default'];