"use strict";

exports.__esModule = true;
exports.default = void 0;

var _urlJoin = _interopRequireDefault(require("url-join"));

var _getPath = _interopRequireDefault(require("./getPath"));

var _methods = _interopRequireDefault(require("./methods"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const idxd = o => o.index || o;

const walkResource = ({
  base,
  name,
  resource,
  hierarchy,
  handler
}) => {
  const res = idxd(resource); // sort custom stuff first

  const endpointNames = [];
  Object.keys(res).forEach(k => _methods.default[k] ? endpointNames.push(k) : endpointNames.unshift(k));
  endpointNames.forEach(endpointName => {
    const endpoint = res[endpointName];
    const methodInfo = endpoint.http || _methods.default[endpointName];

    if (!methodInfo) {
      // TODO: error if still nothing found
      const newBase = (0, _getPath.default)({
        resource: name,
        instance: true
      });
      walkResource({
        base: base ? (0, _urlJoin.default)(base, newBase) : newBase,
        name: endpointName,
        resource: endpoint,
        hierarchy: hierarchy ? `${hierarchy}.${name}` : name,
        handler
      });
      return;
    }

    const path = endpoint.path || (0, _getPath.default)({
      resource: name,
      endpoint: endpointName,
      instance: methodInfo.instance
    });
    const fullPath = base ? (0, _urlJoin.default)(base, path) : path;
    handler({
      hierarchy: hierarchy ? `${hierarchy}.${name}.${endpointName}` : `${name}.${endpointName}`,
      path: fullPath,
      endpoint,
      ...methodInfo
    });
  });
};

var _default = (resources, handler) => {
  Object.keys(idxd(resources)).forEach(resourceName => {
    walkResource({
      name: resourceName,
      resource: resources[resourceName],
      handler
    });
  });
};

exports.default = _default;
module.exports = exports.default;