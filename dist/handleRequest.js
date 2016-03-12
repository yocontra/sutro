'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _palisade = require('palisade');

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _once = require('once');

var _once2 = _interopRequireDefault(_once);

var _pipeSSE = require('./pipeSSE');

var _pipeSSE2 = _interopRequireDefault(_pipeSSE);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var extractChanged = function extractChanged(res) {
  if (!res.changes[0]) return;
  if (res.changes[0].new_val) return res.changes[0].new_val;
  if (res.changes[0].old_val) return res.changes[0].old_val;
};

var handleAsync = function handleAsync(fn, cb) {
  var wrapped = (0, _once2.default)(cb);
  var res = undefined;
  try {
    res = fn(wrapped);
  } catch (err) {
    return wrapped(err);
  }

  // using a callback
  if (typeof res === 'undefined') return;

  // using a promise
  if (typeof res.then === 'function') {
    return res.then(function (data) {
      wrapped(null, data);
    }, function (err) {
      wrapped(err);
    });
  }

  // returned a plain value
  wrapped(null, res);
};

var createHandlerFunction = function createHandlerFunction(handler, _ref) {
  var name = _ref.name;
  var resourceName = _ref.resourceName;

  if (!handler.process) throw new Error(resourceName + '.' + name + ' missing process function');

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

        if (!handler.isAuthorized) return handleResult(null, true);
        handleAsync(handler.isAuthorized.bind(null, opt), handleResult);
      },
      rawData: ['isAuthorized', function (done) {
        var handleResult = function handleResult(err, res) {
          // bad shit happened
          if (err) {
            return done(new Error(resourceName + '.' + name + '.process threw an error: ' + (err.stack || err.message || err)));
          }

          // no results
          if (!res) return done();

          // array of docs
          if (Array.isArray(res)) return done(null, res);

          // changes came back
          if (res.changes) return done(null, extractChanged(res));

          // one document instance, or stream
          done(null, res);
        };

        handleAsync(handler.process.bind(null, opt), handleResult);
      }],
      formattedData: ['rawData', function (done, _ref2) {
        var rawData = _ref2.rawData;

        var handleResult = function handleResult(err, data) {
          if (err) {
            return done(new Error(resourceName + '.' + name + '.format threw an error: ' + (err.stack || err.message || err)));
          }
          done(null, data);
        };

        if (typeof rawData === 'undefined') return handleResult();
        if (!handler.format) return handleResult(null, rawData);
        handleAsync(handler.format.bind(null, opt, rawData), handleResult);
      }]
    };

    _async2.default.auto(tasks, function (err, _ref3) {
      var formattedData = _ref3.formattedData;
      var rawData = _ref3.rawData;

      if (opt.tail && rawData && !rawData.pipe) {
        return cb(new Error(resourceName + '.' + name + '.process didn\'t return a stream'));
      }
      cb(err, {
        result: formattedData,
        stream: opt.tail && rawData
      });
    });
  };
};

exports.default = function (_ref4, resourceName) {
  var handler = _ref4.handler;
  var name = _ref4.name;
  var successCode = _ref4.successCode;

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

    // TODO: get rid of plain function syntax
    // and handle this somewhere else!
    var formatter = handler.format ? handler.format.bind(null, opt) : null;

    processor(opt, function (err) {
      var _ref5 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var result = _ref5.result;
      var stream = _ref5.stream;

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