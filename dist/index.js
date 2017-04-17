'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _getRequestHandler = require('./getRequestHandler');

var _getRequestHandler2 = _interopRequireDefault(_getRequestHandler);

var _getSwagger = require('./getSwagger');

var _getSwagger2 = _interopRequireDefault(_getSwagger);

var _walkResources = require('./walkResources');

var _walkResources2 = _interopRequireDefault(_walkResources);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      swagger = _ref.swagger,
      path = _ref.path,
      resources = _ref.resources;

  if (!resources) throw new Error('Missing resources option');
  var router = (0, _express.Router)({ mergeParams: true });
  router.swagger = (0, _getSwagger2.default)({ swagger: swagger, path: path, resources: resources });
  router.path = path;
  router.get('/swagger.json', function (req, res) {
    return res.status(200).json(router.swagger).end();
  });

  (0, _walkResources2.default)(resources, function (_ref2) {
    var path = _ref2.path,
        method = _ref2.method,
        endpoint = _ref2.endpoint;

    router[method](path, (0, _getRequestHandler2.default)(endpoint));
  });
  return router;
};

module.exports = exports['default'];