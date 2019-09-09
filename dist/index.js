'use strict';

exports.__esModule = true;

var _express = require('express');

var _handleAsync = require('handle-async');

var _stream = require('stream');

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

exports.default = ({ swagger, base, resources, pre, post, trace } = {}) => {
  if (!resources) throw new Error('Missing resources option');
  const router = (0, _express.Router)({ mergeParams: true });
  router.swagger = (0, _getSwagger2.default)({ swagger, base, resources });
  router.meta = (0, _getMeta2.default)({ base, resources });
  router.base = base;

  router.get('/', (req, res) => res.status(200).json(router.meta).end());
  router.get('/swagger', (req, res) => res.status(200).json(router.swagger).end());

  (0, _walkResources2.default)(resources, resource => {
    const handlers = [(0, _getRequestHandler2.default)(resource, { trace })];
    if (pre) {
      handlers.unshift(async (req, res, next) => {
        const ourTrace = trace && trace.start('sutro/pre');
        try {
          await (0, _handleAsync.promisify)(pre.bind(null, resource, req, res));
        } catch (err) {
          if (ourTrace) ourTrace.end();
          return next(err);
        }
        if (ourTrace) ourTrace.end();
        next();
      });
    }
    if (post) {
      handlers.unshift(async (req, res, next) => {
        (0, _stream.finished)(res, async err => {
          const ourTrace = trace && trace.start('sutro/post');
          try {
            await (0, _handleAsync.promisify)(post.bind(null, resource, req, res, err));
          } catch (err) {
            if (ourTrace) ourTrace.end();
          }
          if (ourTrace) ourTrace.end();
        });
        next();
      });
    }
    router[resource.method](resource.path, ...handlers);
  });

  // handle 404s
  router.use((req, res, next) => next(new _errors.NotFoundError()));
  return router;
};

module.exports = exports.default;