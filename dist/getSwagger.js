'use strict';

exports.__esModule = true;

var _lodash = require('lodash.omit');

var _lodash2 = _interopRequireDefault(_lodash);

var _walkResources = require('./walkResources');

var _walkResources2 = _interopRequireDefault(_walkResources);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const param = /:(\w+)/gi;

const getResponses = (method, endpoint) => {
  const out = {
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

const flattenConfig = (base, override = {}) => {
  const filtered = (0, _lodash2.default)(override, ['consumes', 'produces', 'responses', 'parameters']);
  return Object.assign({
    consumes: override.consumes || base.consumes,
    produces: override.produces || base.produces,
    responses: override.responses ? Object.assign({}, base.responses, override.responses) : base.responses,
    parameters: override.parameters ? [...(base.parameters || []), ...override.parameters] : base.parameters
  }, filtered);
};

const getPaths = resources => {
  const paths = {};
  (0, _walkResources2.default)(resources, ({ path, method, endpoint }) => {
    if (endpoint.hidden || endpoint.swagger === false) return; // skip
    const params = path.match(param);
    const base = {
      consumes: method !== 'get' && ['application/json'] || undefined,
      produces: ['application/json'],
      parameters: params && params.map(name => ({
        name: name.slice(1),
        in: 'path',
        required: true,
        type: 'string'
      })) || undefined,
      responses: getResponses(method, endpoint)
    };
    const fixedPath = path.replace(param, '{$1}');
    if (!paths[fixedPath]) paths[fixedPath] = {};
    paths[fixedPath][method] = flattenConfig(base, endpoint.swagger);
  });
  return paths;
};

exports.default = ({ swagger = {}, base, resources }) => {
  const out = Object.assign({
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