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
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(endpoint, req, res) {
    var opt, authorized, err, rawData, resultData;
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
            if (!endpoint.process) {
              _context.next = 17;
              break;
            }

            _context.next = 14;
            return (0, _handleAsync.promisify)(endpoint.process.bind(null, opt));

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
            return (0, _handleAsync.promisify)(endpoint.format.bind(null, opt, rawData));

          case 22:
            _context.t2 = _context.sent;
            _context.next = 26;
            break;

          case 25:
            _context.t2 = rawData;

          case 26:
            resultData = _context.t2;

            if (!(resultData == null)) {
              _context.next = 33;
              break;
            }

            if (!(req.method === 'POST')) {
              _context.next = 30;
              break;
            }

            return _context.abrupt('return', res.status(201).end());

          case 30:
            if (!(req.method === 'GET')) {
              _context.next = 32;
              break;
            }

            throw new _errors.NotFoundError();

          case 32:
            return _context.abrupt('return', res.status(204).end());

          case 33:

            // some data, status code for it
            res.status(req.method === 'POST' ? 201 : 200);

            // stream response

            if (!(resultData.pipe && resultData.on)) {
              _context.next = 37;
              break;
            }

            resultData.pipe(res);
            return _context.abrupt('return');

          case 37:

            // json obj response
            res.json(resultData).end();

          case 38:
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

exports.default = function (endpoint) {
  if (typeof endpoint === 'function') endpoint = { process: endpoint };
  return function (req, res, next) {
    return process(endpoint, req, res).catch(next);
  };
};

module.exports = exports['default'];