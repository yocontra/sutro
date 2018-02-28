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

var _pump = require('pump');

var _pump2 = _interopRequireDefault(_pump);

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
              noResponse: req.query.response === 'false',
              _req: req,
              _res: res
            });


            _newrelic2.default.addCustomAttributes((0, _extends3.default)({}, opt, {
              _req: undefined,
              _res: undefined
            }));

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
            if (!req.timedout) {
              _context.next = 12;
              break;
            }

            return _context.abrupt('return');

          case 12:

            // call process
            processFn = typeof endpoint === 'function' ? endpoint : endpoint.process;

            if (!processFn) {
              _context.next = 19;
              break;
            }

            _context.next = 16;
            return wrap('process', processFn.bind(null, opt));

          case 16:
            _context.t1 = _context.sent;
            _context.next = 20;
            break;

          case 19:
            _context.t1 = null;

          case 20:
            rawData = _context.t1;

            if (!req.timedout) {
              _context.next = 23;
              break;
            }

            return _context.abrupt('return');

          case 23:
            if (!endpoint.format) {
              _context.next = 29;
              break;
            }

            _context.next = 26;
            return wrap('format', endpoint.format.bind(null, opt, rawData));

          case 26:
            _context.t2 = _context.sent;
            _context.next = 30;
            break;

          case 29:
            _context.t2 = rawData;

          case 30:
            resultData = _context.t2;

            if (!req.timedout) {
              _context.next = 33;
              break;
            }

            return _context.abrupt('return');

          case 33:
            if (!(resultData == null)) {
              _context.next = 37;
              break;
            }

            if (!(req.method === 'GET')) {
              _context.next = 36;
              break;
            }

            throw new _errors.NotFoundError();

          case 36:
            return _context.abrupt('return', res.status(successCode || 204).end());

          case 37:
            if (!opt.noResponse) {
              _context.next = 39;
              break;
            }

            return _context.abrupt('return', res.status(successCode || 204).end());

          case 39:

            // some data, status code for it
            res.status(successCode || 200);

            // stream response

            if (!(resultData.pipe && resultData.on)) {
              _context.next = 43;
              break;
            }

            (0, _pump2.default)(resultData, res, function (err) {
              if (err) throw err;
              res.end();
            });
            return _context.abrupt('return');

          case 43:

            // json obj response
            res.json(resultData).end();

          case 44:
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
    if (req.timedout) return;
    _newrelic2.default.startWebTransaction(o.hierarchy, function () {
      return process(o, req, res).catch(next);
    });
  };
  return handleAPIRequest;
};

module.exports = exports['default'];