'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _debug2 = require('debug');

var _debug3 = _interopRequireDefault(_debug2);

var _lodash = require('lodash.mapvalues');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint no-unused-vars:0 */

var debug = (0, _debug3.default)('sutro:errors');

var getError = function getError(err) {
  if (err.error) return getError(err.error);
  if (err.stack) return err.stack;
  if (err.message) return err.message;
  return err;
};

var getErrorFields = function getErrorFields(err) {
  if (!err.errors) return;
  return (0, _lodash2.default)(err.errors, getError);
};

var sendError = function sendError(err, res) {
  var error = {
    error: getError(err),
    fields: getErrorFields(err)
  };
  res.status(err.status || 500);
  res.json(error);
  res.end();
  return error;
};

exports.default = function (err, req, res, next) {
  var error = sendError(err, res);
  debug(error);
};

module.exports = exports['default'];