'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _palisade = require('palisade');

var _lodash = require('lodash.mapvalues');

var _lodash2 = _interopRequireDefault(_lodash);

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

exports.default = function (handler) {
  return function (req, res) {
    var stream = null;
    var called = false;
    var formatter = _palisade.screenDeep.bind(null, req.user);
    var opt = {
      id: req.params.id,
      user: req.user,
      data: req.body,
      options: req.query,
      tail: req.get('accept') === 'text/event-stream',
      _req: req,
      _res: res
    };

    // if returns a stream, pipe it through SSE
    // otherwise assume its going to call the cb
    try {
      stream = handler(opt, sendResponse);
    } catch (err) {
      sendResponse(err);
    }
    if (opt.tail && stream && stream.on) {
      pipeStream(stream);
    }

    // guts
    function pipeStream(stream) {
      if (called) return stream.end();
      called = true;
      (0, _pipeSSE2.default)(stream, res, formatter);
    }

    function sendResponse(err, data) {
      if (called) return;
      called = true;
      if (err) return sendError(err, res);
      if (opt.tail) return sendError(new Error('Endpoint not capable of SSE'), res);
      var transformedData = formatter(data);
      if (transformedData) {
        res.status(200);
        res.json(transformedData);
      } else {
        res.status(204);
      }
      res.end();
    }
  };
};

module.exports = exports['default'];