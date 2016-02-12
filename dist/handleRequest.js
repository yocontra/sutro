'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _palisade = require('palisade');

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _once = require('once');

var _once2 = _interopRequireDefault(_once);

var _lodash = require('lodash.mapvalues');

var _lodash2 = _interopRequireDefault(_lodash);

var _rethinkdbChangeStream = require('rethinkdb-change-stream');

var _rethinkdbChangeStream2 = _interopRequireDefault(_rethinkdbChangeStream);

var _pipeSSE = require('./pipeSSE');

var _pipeSSE2 = _interopRequireDefault(_pipeSSE);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getError = function getError(err) {
  if (err.message) return err.message;
  if (err.error) {
    if (err.error.message) return err.error.message;
    return err.error;
  }
  return err;
};

var getErrorFields = function getErrorFields(err) {
  if (!err.errors) return;
  return (0, _lodash2.default)(err.errors, getError);
};

var sendError = function sendError(err, res) {
  res.status(err.status || 500);
  res.json({
    error: getError(err),
    fields: getErrorFields(err)
  });
  res.end();
};

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

var createHandlerFunction = function createHandlerFunction(handler) {
  if (!!handler.default || typeof handler === 'function') {
    return createCustomHandlerFunction(handler.default || handler);
  }

  return function (opt, cb) {
    if (opt.tail && !handler.tailable) {
      cb(new Error('Endpoint not capable of SSE'));
    }

    var tasks = {
      isAuthorized: function isAuthorized(done) {
        handler.isAuthorized(opt, function (err, allowed) {
          if (err) return done(err, false);
          if (!allowed) return done({ status: 401 }, false);
          done(null, true);
        });
      },
      query: ['isAuthorized', function (done, res) {
        if (!res.isAuthorized) return done();
        handler.createQuery(opt, done);
      }],
      rawResults: ['query', function (done, res) {
        if (!res.query) return done(new Error('No query returned!'));
        if (opt.tail) return done();
        res.query.execute(function (err, res) {
          // bad shit happened
          if (err) return done(err);

          // no results
          if (!res) return done();

          // array of docs
          if (Array.isArray(res)) return done(null, res);

          // changes came back
          if (res.changes) return done(null, extractChanged(res));

          // one document instance
          done(null, res);
        });
      }],
      formatResponse: ['rawResults', function (done, res) {
        if (!res.rawResults) return done();
        done(null, handler.formatResponse(opt, res.rawResults));
      }]
    };

    _async2.default.auto(tasks, function (err, res) {
      return cb(err, {
        result: res.formatResponse,
        stream: opt.tail && res.query ? (0, _rethinkdbChangeStream2.default)(res.query) : null
      });
    });
  };
};

exports.default = function (_ref) {
  var handler = _ref.handler;
  var successCode = _ref.successCode;

  var processor = createHandlerFunction(handler);
  return function (req, res) {
    var opt = {
      id: req.params.id,
      user: req.user,
      data: req.body,
      options: req.query,
      tail: req.get('accept') === 'text/event-stream',
      _req: req,
      _res: res
    };
    var formatter = handler.formatResponse ? handler.formatResponse.bind(null, opt) : _palisade.screenDeep.bind(null, opt.user);

    processor(opt, function (err, _ref2) {
      var result = _ref2.result;
      var stream = _ref2.stream;

      if (err) return sendError(err, res);
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