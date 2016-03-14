'use strict';

var _maxSafeInteger = require('babel-runtime/core-js/number/max-safe-integer');

var _maxSafeInteger2 = _interopRequireDefault(_maxSafeInteger);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _through = require('through2');

var _through2 = _interopRequireDefault(_through);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getEvent = function getEvent(_ref, fmt) {
  var type = _ref.type;
  var data = _ref.data;
  return 'event:' + type + '\ndata:' + (0, _stringify2.default)(fmt ? fmt(data) : data) + '\n\n';
};

exports.default = function (stream, res, fmt) {
  res.status(200);
  res.type('text/event-stream');
  res.set('Cache-control', 'no-cache');
  res.write('\n');
  res.flush();

  res.setTimeout(_maxSafeInteger2.default);

  stream.pipe(_through2.default.obj(function (o, _, cb) {
    res.write(getEvent(o, fmt));
    res.flush();
    cb();
  }));

  res.once('close', function () {
    return stream.end();
  });
};

module.exports = exports['default'];