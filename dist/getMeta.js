'use strict';

exports.__esModule = true;

var _urlJoin = require('url-join');

var _urlJoin2 = _interopRequireDefault(_urlJoin);

var _dotProp = require('dot-prop');

var _dotProp2 = _interopRequireDefault(_dotProp);

var _walkResources = require('./walkResources');

var _walkResources2 = _interopRequireDefault(_walkResources);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: handle nesting correctly
exports.default = ({ base, resources }) => {
  const paths = {};
  (0, _walkResources2.default)(resources, ({ hierarchy, path, method, instance, endpoint }) => {
    if (endpoint.hidden) return; // skip
    const descriptor = {
      path: base ? (0, _urlJoin2.default)(base, path) : path,
      method,
      instance
    };
    _dotProp2.default.set(paths, hierarchy, descriptor);
  });
  return paths;
};

module.exports = exports['default'];