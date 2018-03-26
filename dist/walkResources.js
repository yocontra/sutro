'use strict';

exports.__esModule = true;

var _urlJoin = require('url-join');

var _urlJoin2 = _interopRequireDefault(_urlJoin);

var _getPath = require('./getPath');

var _getPath2 = _interopRequireDefault(_getPath);

var _methods = require('./methods');

var _methods2 = _interopRequireDefault(_methods);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const idxd = o => o.index || o;

const walkResource = ({ base, name, resource, hierarchy, handler }) => {
  const res = idxd(resource);

  // sort custom stuff first
  const endpointNames = [];
  Object.keys(res).forEach(k => _methods2.default[k] ? endpointNames.push(k) : endpointNames.unshift(k));

  endpointNames.forEach(endpointName => {
    const endpoint = res[endpointName];
    const methodInfo = endpoint.http || _methods2.default[endpointName];
    if (!methodInfo) {
      // TODO: error if still nothing found
      const newBase = (0, _getPath2.default)({ resource: name, instance: true });
      walkResource({
        base: base ? (0, _urlJoin2.default)(base, newBase) : newBase,
        name: endpointName,
        resource: endpoint,
        hierarchy: hierarchy ? `${hierarchy}.${name}` : name,
        handler
      });
      return;
    }
    const path = endpoint.path || (0, _getPath2.default)({
      resource: name,
      endpoint: endpointName,
      instance: methodInfo.instance
    });
    const fullPath = base ? (0, _urlJoin2.default)(base, path) : path;
    handler(Object.assign({
      hierarchy: hierarchy ? `${hierarchy}.${name}.${endpointName}` : `${name}.${endpointName}`,
      path: fullPath,
      endpoint
    }, methodInfo));
  });
};

exports.default = (resources, handler) => {
  Object.keys(idxd(resources)).forEach(resourceName => {
    walkResource({
      name: resourceName,
      resource: resources[resourceName],
      handler
    });
  });
};

module.exports = exports['default'];