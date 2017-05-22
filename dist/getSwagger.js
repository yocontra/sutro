'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

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

var getPaths = function getPaths(resources) {
  var paths = {};
  (0, _walkResources2.default)(resources, function (_ref) {
    var path = _ref.path,
        method = _ref.method,
        endpoint = _ref.endpoint;

    if (endpoint.hidden || endpoint.swagger === false) return; // skip
    var swaggerMeta = endpoint.swagger || {};
    var params = path.match(param);
    var descriptor = (0, _extends3.default)({
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
    }, swaggerMeta);

    var fixedPath = path.replace(param, '{$1}');
    if (!paths[fixedPath]) paths[fixedPath] = {};
    paths[fixedPath][method] = descriptor;
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