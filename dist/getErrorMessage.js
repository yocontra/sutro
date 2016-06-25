'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (err) {
  if (process.env.NODE_ENV === 'production') {
    return err.message || err;
  }
  return err.stack || err.message || err;
};

module.exports = exports['default'];