'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _handleAsync = require('handle-async');

var _newrelic = require('newrelic');

var _newrelic2 = _interopRequireDefault(_newrelic);

var _errors = require('./errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var wrap = function wrap(name, fn) {
  return _newrelic2.default.createTracer(name, function () {
    return (0, _handleAsync.promisify)(fn);
  })();
};

var process = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref2, req, res) {
    var endpoint = _ref2.endpoint,
        successCode = _ref2.successCode;
    var opt, authorized, processFn, rawData, resultData;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            opt = (0, _extends3.default)({}, req.params, {
              ip: req.ip,
              url: req.url,
              protocol: req.protocol,
              method: req.method,
              subdomains: req.subdomains,
              path: req.path,
              cookies: req.cookies,
              user: req.user,
              data: req.body,
              options: req.query,
              session: req.session,
              _req: req,
              _res: res
            });


            _newrelic2.default.addCustomParameters(opt);

            // check isAuthorized
            _context.t0 = !endpoint.isAuthorized;

            if (_context.t0) {
              _context.next = 7;
              break;
            }

            _context.next = 6;
            return wrap('isAuthorized', endpoint.isAuthorized.bind(null, opt));

          case 6:
            _context.t0 = _context.sent;

          case 7:
            authorized = _context.t0;

            if (!(authorized !== true)) {
              _context.next = 10;
              break;
            }

            throw new _errors.UnauthorizedError();

          case 10:

            // call process
            processFn = typeof endpoint === 'function' ? endpoint : endpoint.process;

            if (!processFn) {
              _context.next = 17;
              break;
            }

            _context.next = 14;
            return wrap('process', processFn.bind(null, opt));

          case 14:
            _context.t1 = _context.sent;
            _context.next = 18;
            break;

          case 17:
            _context.t1 = null;

          case 18:
            rawData = _context.t1;

            if (!endpoint.format) {
              _context.next = 25;
              break;
            }

            _context.next = 22;
            return wrap('format', endpoint.format.bind(null, opt, rawData));

          case 22:
            _context.t2 = _context.sent;
            _context.next = 26;
            break;

          case 25:
            _context.t2 = rawData;

          case 26:
            resultData = _context.t2;

            if (!(resultData == null)) {
              _context.next = 31;
              break;
            }

            if (!(req.method === 'GET')) {
              _context.next = 30;
              break;
            }

            throw new _errors.NotFoundError();

          case 30:
            return _context.abrupt('return', res.status(successCode || 204).end());

          case 31:

            // some data, status code for it
            res.status(successCode || 200);

            // stream response

            if (!(resultData.pipe && resultData.on)) {
              _context.next = 35;
              break;
            }

            resultData.pipe(res);
            return _context.abrupt('return');

          case 35:

            // json obj response
            res.json(resultData).end();

          case 36:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function process(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

exports.default = function (o) {
  // wrap it so it has a name
  var handleAPIRequest = function handleAPIRequest(req, res, next) {
    _newrelic2.default.startWebTransaction(o.hierarchy, function () {
      return process(o, req, res).catch(next);
    });
  };
  return handleAPIRequest;
};

module.exports = exports['default'];