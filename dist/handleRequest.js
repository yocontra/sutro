'use strict';

var _arguments = arguments;
Object.defineProperty(exports, "__esModule", {
  value: true
});

var _palisade = require('palisade');

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _once = require('once');

var _once2 = _interopRequireDefault(_once);

var _rethinkdbChangeStream = require('rethinkdb-change-stream');

var _rethinkdbChangeStream2 = _interopRequireDefault(_rethinkdbChangeStream);

var _pipeSSE = require('./pipeSSE');

var _pipeSSE2 = _interopRequireDefault(_pipeSSE);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var extractChanged = function extractChanged(res) {
  if (!res.changes) return;
  if (!res.changes[0]) return;
  if (res.changes[0].new_val) return res.changes[0].new_val;
  if (res.changes[0].old_val) return res.changes[0].old_val;
};

var createCustomHandlerFunction = function createCustomHandlerFunction(handler) {
  return function (opt, cb) {
    var stream = undefined;
    var done = (0, _once2.default)(cb);
    try {
      stream = handler(opt, function (err, data) {
        return done(err, {
          result: (0, _palisade.screenDeep)(opt.user, data)
        });
      });
    } catch (err) {
      return done(err);
    }
    if (opt.tail) {
      if (stream && stream.pipe) return done(null, { stream: stream });
      done(new Error('Endpoint did not return a stream'));
    }
  };
};

var handleAsync = function handleAsync(fn, cb) {
  var wrapped = (0, _once2.default)(cb);
  var res = undefined;
  try {
    res = fn(wrapped);
  } catch (err) {
    return wrapped(err, false);
  }
  if (typeof res !== 'undefined') wrapped(null, res);
};

var createHandlerFunction = function createHandlerFunction(handler, _ref) {
  var name = _ref.name;
  var resourceName = _ref.resourceName;

  if (!!handler.default || typeof handler === 'function') {
    return createCustomHandlerFunction(handler.default || handler);
  }

  return function (opt, cb) {
    if (opt.tail && !handler.tailable) {
      cb(new Error('Endpoint not capable of SSE'));
    }

    var tasks = {
      isAuthorized: function isAuthorized(done) {
        var handleResult = function handleResult(err, allowed) {
          if (err) {
            return done(new Error(resourceName + '.' + name + '.isAuthorized threw an error: ' + (err.stack || err.message || err)), false);
          }
          if (typeof allowed !== 'boolean') {
            return done(new Error(resourceName + '.' + name + '.isAuthorized did not return a boolean!'));
          }
          if (!allowed) return done({ status: 401 }, false);
          done(null, true);
        };

        handleAsync(handler.isAuthorized.bind(null, opt), handleResult);
      },
      rawData: ['isAuthorized', function (done, _ref2) {
        var isAuthorized = _ref2.isAuthorized;

        var handleResult = function handleResult(err, res) {
          // bad shit happened
          if (err) {
            return done(new Error(resourceName + '.' + name + '.fetch threw an error: ' + (err.stack || err.message || err)));
          }

          // no results
          if (!res) return done();

          // array of docs
          if (Array.isArray(res)) return done(null, res);

          // changes came back
          if (res.changes) return done(null, extractChanged(res));

          // one document instance
          done(null, res);
        };

        if (!isAuthorized) return handleResult();
        if (opt.tail) return handleResult();
        handleAsync(handler.fetch.bind(null, opt), handleResult);
      }],
      formattedData: ['rawData', function (done, _ref3) {
        var rawData = _ref3.rawData;

        var handleResult = function handleResult(err, data) {
          if (err) {
            return done(new Error(resourceName + '.' + name + '.format threw an error: ' + (err.stack || err.message || err)));
          }
          done(null, data);
        };

        if (typeof rawData === 'undefined') return handleResult();
        handleAsync(handler.format.bind(null, opt, rawData), handleResult);
      }]
    };

    _async2.default.auto(tasks, function (err, _ref4) {
      var formattedData = _ref4.formattedData;
      var rawData = _ref4.rawData;
      return cb(err, {
        result: formattedData,
        stream: opt.tail && rawData ? rawData : null
      });
    });
  };
};

exports.default = function (_ref5, resourceName) {
  var handler = _ref5.handler;
  var name = _ref5.name;
  var successCode = _ref5.successCode;

  var processor = createHandlerFunction(handler, { name: name, resourceName: resourceName });
  return function (req, res, next) {
    var opt = {
      id: req.params.id,
      user: req.user,
      data: req.body,
      options: req.query,
      session: req.session,
      tail: req.get('accept') === 'text/event-stream',
      _req: req,
      _res: res
    };
    var formatter = handler.formatResponse ? handler.formatResponse.bind(null, opt) : function () {
      return _palisade.screenDeep.apply(undefined, [opt.user].concat(Array.prototype.slice.call(_arguments)));
    };

    processor(opt, function (err) {
      var _ref6 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var result = _ref6.result;
      var stream = _ref6.stream;

      if (err) return next(err);
      if (stream) return (0, _pipeSSE2.default)(stream, res, formatter);

      if (result) {
        res.status(successCode);
        res.json(result);
      } else {
        res.status(204);
      }
      res.end();
    });
  };
};

module.exports = exports['default'];