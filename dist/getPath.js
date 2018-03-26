'use strict';

exports.__esModule = true;

var _pluralize = require('pluralize');

var _pluralize2 = _interopRequireDefault(_pluralize);

var _methods = require('./methods');

var _methods2 = _interopRequireDefault(_methods);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = ({ resource, endpoint, instance }) => {
  let path = '';
  if (resource) path += `/${(0, _pluralize2.default)(resource)}`;
  if (resource && instance) path += `/:${resource}Id`;
  if (endpoint && !_methods2.default[endpoint]) path += `/${endpoint}`;
  return path;
};

module.exports = exports['default'];