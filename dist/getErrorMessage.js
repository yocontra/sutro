'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var getErrorMessage = function getErrorMessage(err, debug) {
  if (err.error) return getErrorMessage(err.error);

  if (debug) return err.stack || err.message || err;

  if (process.env.NODE_ENV === 'production') {
    return err.message || err;
  }
  return err.message || err.stack || err;
};

exports.default = getErrorMessage;
module.exports = exports['default'];