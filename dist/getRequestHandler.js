'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _async = require('async');

var _makeErrorCause = require('make-error-cause');

var _makeErrorCause2 = _interopRequireDefault(_makeErrorCause);

var _handleAsync = require('./handleAsync');

var _handleAsync2 = _interopRequireDefault(_handleAsync);

var _pipeSSE = require('./pipeSSE');

var _pipeSSE2 = _interopRequireDefault(_pipeSSE);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EError = (0, _makeErrorCause2.default)('EndpointError');
var CError = (0, _makeErrorCause2.default)('ConfigurationError');

var createHandlerFunction = function createHandlerFunction(handler) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      name = _ref.name,
      resourceName = _ref.resourceName;

  if (typeof handler === 'function') handler = { process: handler };
  if (!handler.process) throw new CError(resourceName + '.' + name + ' missing process function!');
  if (!name) throw new CError(resourceName + '.' + name + ' missing name!');
  if (!resourceName) throw new CError(resourceName + '.' + name + ' missing resourceName!');

  return function (opt, cb) {
    if (!handler.tailable && opt.tail) {
      return cb(new EError('Endpoint not capable of SSE!'));
    }

    var tasks = {
      isAuthorized: function isAuthorized(done) {
        var handleResult = function handleResult(err, allowed) {
          if (err) {
            return done(new EError(resourceName + '.' + name + '.isAuthorized returned an error!', err));
          }
          if (typeof allowed !== 'boolean') {
            return done(new EError(resourceName + '.' + name + '.isAuthorized did not return a boolean!'));
          }
          if (!allowed) return done({ status: 401 });
          done(null, true);
        };

        if (!handler.isAuthorized) return handleResult(null, true);
        (0, _handleAsync2.default)(handler.isAuthorized.bind(null, opt), handleResult);
      },
      rawData: ['isAuthorized', function (_ref2, done) {
        var isAuthorized = _ref2.isAuthorized;

        var handleResult = function handleResult(err, res) {
          // bad shit happened
          if (err) {
            return done(new EError(resourceName + '.' + name + '.process returned an error!', err));
          }

          // no results
          if (!res) return done();

          done(null, res);
        };

        (0, _handleAsync2.default)(handler.process.bind(null, opt), handleResult);
      }],
      formattedData: ['rawData', function (_ref3, done) {
        var rawData = _ref3.rawData;

        var handleResult = function handleResult(err, data) {
          if (err) {
            return done(new EError(resourceName + '.' + name + '.format returned an error!', err));
          }
          done(null, data);
        };

        if (typeof rawData === 'undefined') return handleResult();
        if (!handler.format) return handleResult(null, rawData);
        (0, _handleAsync2.default)(handler.format.bind(null, opt, rawData), handleResult);
      }]
    };

    (0, _async.auto)(tasks, function (err, _ref4) {
      var formattedData = _ref4.formattedData,
          rawData = _ref4.rawData;

      if (opt.tail && rawData && !rawData.pipe) {
        return cb(new EError(resourceName + '.' + name + '.process didn\'t returned a non-stream for SSE!'));
      }
      cb(err, {
        result: formattedData,
        stream: opt.tail && rawData
      });
    });
  };
};

var getRequestHandler = function getRequestHandler(_ref5, resourceName) {
  var handler = _ref5.handler,
      name = _ref5.name,
      successCode = _ref5.successCode,
      emptyCode = _ref5.emptyCode;

  var processor = createHandlerFunction(handler, { name: name, resourceName: resourceName });
  var handleSutroRequest = function handleSutroRequest(req, res, next) {
    var opt = (0, _extends3.default)({}, req.params, {
      user: req.user,
      data: req.body,
      options: req.query,
      session: req.session,
      tail: req.get('accept') === 'text/event-stream',
      _req: req,
      _res: res
    });

    // TODO: get rid of plain function syntax and handle this somewhere else!
    var formatter = handler.format && handler.format.bind(null, opt);

    processor(opt, function (err) {
      var _ref6 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          result = _ref6.result,
          stream = _ref6.stream;

      if (err) return next(err);
      if (stream) return (0, _pipeSSE2.default)(stream, res, formatter);

      if (result) {
        res.status(successCode);
        res.json(result);
      } else {
        res.status(emptyCode);
      }
      res.end();
    });
  };

  return handleSutroRequest;
};

exports.default = getRequestHandler;
module.exports = exports['default'];