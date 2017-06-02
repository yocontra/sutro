'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _lodash = require('lodash.omit');

var _lodash2 = _interopRequireDefault(_lodash);

var _walkResources = require('./walkResources');

var _walkResources2 = _interopRequireDefault(_walkResources);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var param = /:(\w+)/gi;

var getResponses = function getResponses(method, endpoint) {
  var out = {
    '404': {
      description: 'Not found'
    },
    '500': {
      description: 'Server error'
    },
    default: {
      description: 'Unexpected error'
    }
  };

  if (method === 'post') {
    out['201'] = {
      description: 'Success, created'
    };
  } else {
    out['200'] = {
      description: 'Success'
    };
    out['204'] = {
      description: 'Success, no data return necessary'
    };
  }

  if (endpoint.isAuthorized) {
    out['401'] = {
      description: 'Unauthorized'
    };
  }
  return out;
};

var flattenConfig = function flattenConfig(base) {
  var override = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var filtered = (0, _lodash2.default)(override, ['consumes', 'produces', 'responses', 'parameters']);
  return (0, _extends3.default)({
    consumes: override.consumes || base.consumes,
    produces: override.produces || base.produces,
    responses: override.responses ? (0, _extends3.default)({}, base.responses, override.responses) : base.responses,
    parameters: override.parameters ? [].concat((0, _toConsumableArray3.default)(base.parameters || []), (0, _toConsumableArray3.default)(override.parameters)) : base.parameters
  }, filtered);
};

var getPaths = function getPaths(resources) {
  var paths = {};
  (0, _walkResources2.default)(resources, function (_ref) {
    var path = _ref.path,
        method = _ref.method,
        endpoint = _ref.endpoint;

    if (endpoint.hidden || endpoint.swagger === false) return; // skip
    var params = path.match(param);
    var base = {
      consumes: method !== 'get' && ['application/json'] || undefined,
      produces: ['application/json'],
      parameters: params && params.map(function (name) {
        return {
          name: name.slice(1),
          in: 'path',
          required: true,
          type: 'string'
        };
      }) || undefined,
      responses: getResponses(method, endpoint)
    };
    var fixedPath = path.replace(param, '{$1}');
    if (!paths[fixedPath]) paths[fixedPath] = {};
    paths[fixedPath][method] = flattenConfig(base, endpoint.swagger);
  });
  return paths;
};

exports.default = function (_ref2) {
  var _ref2$swagger = _ref2.swagger,
      swagger = _ref2$swagger === undefined ? {} : _ref2$swagger,
      base = _ref2.base,
      resources = _ref2.resources;

  var out = (0, _extends3.default)({
    swagger: '2.0',
    info: {
      title: 'Sutro API',
      version: '1.0.0'
    },
    basePath: base,
    schemes: ['http'],
    paths: getPaths(resources)
  }, swagger);
  return out;
};

module.exports = exports['default'];