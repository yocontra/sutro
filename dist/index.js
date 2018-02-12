'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _handleAsync = require('handle-async');

var _errors = require('./errors');

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
      resources = _ref.resources,
      pre = _ref.pre;

  if (!resources) throw new Error('Missing resources option');
  var router = (0, _express.Router)({ mergeParams: true });
  router.swagger = (0, _getSwagger2.default)({ swagger: swagger, base: base, resources: resources });
  router.meta = (0, _getMeta2.default)({ base: base, resources: resources });
  router.base = base;

  router.get('/', function (req, res) {
    return res.status(200).json(router.meta).end();
  });
  router.get('/swagger', function (req, res) {
    return res.status(200).json(router.swagger).end();
  });

  (0, _walkResources2.default)(resources, function (o) {
    var handlers = [(0, _getRequestHandler2.default)(o)];
    if (pre) {
      handlers.unshift(function (req, res, next) {
        (0, _handleAsync.promisify)(pre.bind(null, o, req, res)).catch(next).then(function () {
          return next();
        });
      });
    }
    router[o.method].apply(router, [o.path].concat(handlers));
  });

  // handle 404s
  router.use(function (req, res, next) {
    return next(new _errors.NotFoundError());
  });
  return router;
};

module.exports = exports['default'];