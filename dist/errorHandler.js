'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _debug2 = require('debug');

var _debug3 = _interopRequireDefault(_debug2);

var _lodash = require('lodash.mapvalues');

var _lodash2 = _interopRequireDefault(_lodash);

var _getErrorMessage = require('./getErrorMessage');

var _getErrorMessage2 = _interopRequireDefault(_getErrorMessage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug3.default)('sutro:errors'); /* eslint no-unused-vars:0 */


var getErrorFields = function getErrorFields(err) {
  if (!err.errors) return;
  return (0, _lodash2.default)(err.errors, _getErrorMessage2.default);
};

var sendError = function sendError(err, res) {
  res.status(err.status || 500);
  res.json({
    error: (0, _getErrorMessage2.default)(err),
    fields: getErrorFields(err)
  });
  res.end();
};

exports.default = function (err, req, res, next) {
  sendError(err, res);
  debug((0, _getErrorMessage2.default)(err, debug));
};

module.exports = exports['default'];