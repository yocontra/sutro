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

var _errors = require('./errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var process = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(_ref2, req, res) {
    var endpoint = _ref2.endpoint,
        successCode = _ref2.successCode;
    var opt, authorized, err, processFn, rawData, resultData;
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

            // check isAuthorized

            _context.t0 = !endpoint.isAuthorized;

            if (_context.t0) {
              _context.next = 6;
              break;
            }

            _context.next = 5;
            return (0, _handleAsync.promisify)(endpoint.isAuthorized.bind(null, opt));

          case 5:
            _context.t0 = _context.sent;

          case 6:
            authorized = _context.t0;

            if (!(authorized !== true)) {
              _context.next = 11;
              break;
            }

            err = new Error('Unauthorized');

            err.status = 401;
            throw err;

          case 11:

            // call process
            processFn = typeof endpoint === 'function' ? endpoint : endpoint.process;

            if (!processFn) {
              _context.next = 18;
              break;
            }

            _context.next = 15;
            return (0, _handleAsync.promisify)(processFn.bind(null, opt));

          case 15:
            _context.t1 = _context.sent;
            _context.next = 19;
            break;

          case 18:
            _context.t1 = null;

          case 19:
            rawData = _context.t1;

            if (!endpoint.format) {
              _context.next = 26;
              break;
            }

            _context.next = 23;
            return (0, _handleAsync.promisify)(endpoint.format.bind(null, opt, rawData));

          case 23:
            _context.t2 = _context.sent;
            _context.next = 27;
            break;

          case 26:
            _context.t2 = rawData;

          case 27:
            resultData = _context.t2;

            if (!(resultData == null)) {
              _context.next = 32;
              break;
            }

            if (!(req.method === 'GET')) {
              _context.next = 31;
              break;
            }

            throw new _errors.NotFoundError();

          case 31:
            return _context.abrupt('return', res.status(successCode || 204).end());

          case 32:

            // some data, status code for it
            res.status(successCode || 200);

            // stream response

            if (!(resultData.pipe && resultData.on)) {
              _context.next = 36;
              break;
            }

            resultData.pipe(res);
            return _context.abrupt('return');

          case 36:

            // json obj response
            res.json(resultData).end();

          case 37:
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
  return function (req, res, next) {
    return process(o, req, res).catch(next);
  };
};

module.exports = exports['default'];