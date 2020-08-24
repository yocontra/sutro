"use strict";

exports.__esModule = true;
exports.default = void 0;

var _urlJoin = _interopRequireDefault(require("url-join"));

var _dotProp = _interopRequireDefault(require("dot-prop"));

var _walkResources = _interopRequireDefault(require("./walkResources"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: handle nesting correctly
var _default = ({
  base,
  resources
}) => {
  const paths = {};
  (0, _walkResources.default)(resources, ({
    hierarchy,
    path,
    method,
    instance,
    endpoint
  }) => {
    if (endpoint.hidden) return; // skip

    const descriptor = {
      path: base ? (0, _urlJoin.default)(base, path) : path,
      method,
      instance
    };

    _dotProp.default.set(paths, hierarchy, descriptor);
  });
  return paths;
};

exports.default = _default;
module.exports = exports.default;