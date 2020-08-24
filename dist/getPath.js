"use strict";

exports.__esModule = true;
exports.default = void 0;

var _pluralize = _interopRequireDefault(require("pluralize"));

var _methods = _interopRequireDefault(require("./methods"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = ({
  resource,
  endpoint,
  instance
}) => {
  let path = '';
  if (resource) path += `/${(0, _pluralize.default)(resource)}`;
  if (resource && instance) path += `/:${resource}Id`;
  if (endpoint && !_methods.default[endpoint]) path += `/${endpoint}`;
  return path;
};

exports.default = _default;
module.exports = exports.default;