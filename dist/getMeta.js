'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _urlJoin = require('url-join');

var _urlJoin2 = _interopRequireDefault(_urlJoin);

var _dotProp = require('dot-prop');

var _dotProp2 = _interopRequireDefault(_dotProp);

var _walkResources = require('./walkResources');

var _walkResources2 = _interopRequireDefault(_walkResources);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: handle nesting correctly
exports.default = function (_ref) {
  var base = _ref.base,
      resources = _ref.resources;

  var paths = {};
  (0, _walkResources2.default)(resources, function (_ref2) {
    var hierarchy = _ref2.hierarchy,
        path = _ref2.path,
        method = _ref2.method,
        instance = _ref2.instance,
        endpoint = _ref2.endpoint;

    if (endpoint.hidden) return; // skip
    var descriptor = {
      path: base ? (0, _urlJoin2.default)(base, path) : path,
      method: method,
      instance: instance
    };
    _dotProp2.default.set(paths, hierarchy, descriptor);
  });
  return paths;
};

module.exports = exports['default'];