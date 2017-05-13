'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _getRequestHandler = require('./getRequestHandler');

var _getRequestHandler2 = _interopRequireDefault(_getRequestHandler);

var _getSwagger = require('./getSwagger');

var _getSwagger2 = _interopRequireDefault(_getSwagger);

var _getMeta = require('./getMeta');

var _getMeta2 = _interopRequireDefault(_getMeta);

var _walkResources = require('./walkResources');

var _walkResources2 = _interopRequireDefault(_walkResources);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      swagger = _ref.swagger,
      base = _ref.base,
      resources = _ref.resources;

  if (!resources) throw new Error('Missing resources option');
  var router = (0, _express.Router)({ mergeParams: true });
  router.swagger = (0, _getSwagger2.default)({ swagger: swagger, base: base, resources: resources });
  router.meta = (0, _getMeta2.default)({ base: base, resources: resources });
  router.base = base;
  router.get('/swagger.json', function (req, res) {
    return res.status(200).json(router.swagger).end();
  });
  router.get('/meta.json', function (req, res) {
    return res.status(200).json(router.meta).end();
  });

  (0, _walkResources2.default)(resources, function (o) {
    router[o.method](o.path, (0, _getRequestHandler2.default)(o));
  });
  return router;
};

module.exports = exports['default'];