'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _thinkyExportSchema = require('thinky-export-schema');

var _thinkyExportSchema2 = _interopRequireDefault(_thinkyExportSchema);

var _lodash = require('lodash.mapvalues');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.map');

var _lodash4 = _interopRequireDefault(_lodash3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  var prefix = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
  var resources = arguments[1];
  return (0, _lodash2.default)(resources, function (endpoints) {
    return {
      model: endpoints[0] && endpoints[0].model ? (0, _thinkyExportSchema2.default)(endpoints[0].model) : undefined,
      endpoints: (0, _lodash4.default)(endpoints, function (endpoint) {
        return {
          name: endpoint.name,
          method: endpoint.method.toUpperCase(),
          successCode: endpoint.successCode,
          path: prefix ? '' + prefix + endpoint.path : endpoint.path,
          instance: endpoint.instance
        };
      })
    };
  });
};

module.exports = exports['default'];