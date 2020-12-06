"use strict";

exports.__esModule = true;
exports.default = exports.rewriteLargeRequests = void 0;

var _express = require("express");

var _handleAsync = require("handle-async");

var _readableStream = require("readable-stream");

var _errors = require("./errors");

var _getRequestHandler = _interopRequireDefault(require("./getRequestHandler"));

var _getSwagger = _interopRequireDefault(require("./getSwagger"));

var _getMeta = _interopRequireDefault(require("./getMeta"));

var _walkResources = _interopRequireDefault(require("./walkResources"));

var _rewriteLarge = _interopRequireDefault(require("./rewriteLarge"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const rewriteLargeRequests = _rewriteLarge.default;
exports.rewriteLargeRequests = rewriteLargeRequests;

function _ref3(req, res, next) {
  return next(new _errors.NotFoundError());
}

var _default = ({
  swagger,
  base,
  resources,
  pre,
  post,
  trace
} = {}) => {
  if (!resources) throw new Error('Missing resources option');
  const router = (0, _express.Router)({
    mergeParams: true
  });
  router.swagger = (0, _getSwagger.default)({
    swagger,
    base,
    resources
  });
  router.meta = (0, _getMeta.default)({
    base,
    resources
  });
  router.base = base;
  router.get('/', (req, res) => res.status(200).json(router.meta).end());
  router.get('/swagger', (req, res) => res.status(200).json(router.swagger).end());
  (0, _walkResources.default)(resources, resource => {
    const handlers = [(0, _getRequestHandler.default)(resource, {
      trace
    })];

    async function _ref(req, res, next) {
      const ourTrace = trace && trace.start('sutro/pre');

      try {
        await (0, _handleAsync.promisify)(pre.bind(null, resource, req, res));
      } catch (err) {
        if (ourTrace) ourTrace.end();
        return next(err);
      }

      if (ourTrace) ourTrace.end();
      next();
    }

    if (pre) {
      handlers.unshift(_ref);
    }

    async function _ref2(req, res, next) {
      (0, _readableStream.finished)(res, async err => {
        const ourTrace = trace && trace.start('sutro/post');

        try {
          await (0, _handleAsync.promisify)(post.bind(null, resource, req, res, err));
        } catch (err) {
          if (ourTrace) ourTrace.end();
        }

        if (ourTrace) ourTrace.end();
      });
      next();
    }

    if (post) {
      handlers.unshift(_ref2);
    }

    router[resource.method](resource.path, ...handlers);
  }); // handle 404s

  router.use(_ref3);
  return router;
};

exports.default = _default;