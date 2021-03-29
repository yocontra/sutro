"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_omit_1 = __importDefault(require("lodash.omit"));
const walkResources_1 = __importDefault(require("./walkResources"));
const param = /:(\w+)/gi;
const getResponses = (method, endpoint) => {
    const out = {
        404: {
            description: 'Not found'
        },
        500: {
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
    }
    else {
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
const flattenConfig = (base, override) => {
    const filtered = lodash_omit_1.default(override, [
        'consumes',
        'produces',
        'responses',
        'parameters'
    ]);
    return {
        consumes: override.consumes || base.consumes,
        produces: override.produces || base.produces,
        responses: override.responses
            ? {
                ...base.responses,
                ...override.responses
            }
            : base.responses,
        parameters: override.parameters
            ? [...(base.parameters || []), ...override.parameters]
            : base.parameters,
        ...filtered
    };
};
const getPaths = (resources) => {
    const paths = {};
    walkResources_1.default(resources, ({ path, method, endpoint }) => {
        if (endpoint?.hidden || endpoint?.swagger === false)
            return; // skip
        const params = path?.match(param);
        const base = {
            consumes: (method !== 'get' && ['application/json']) || undefined,
            produces: ['application/json'],
            parameters: (params &&
                params.map((name) => ({
                    name: name.slice(1),
                    in: 'path',
                    required: true,
                    type: 'string'
                }))) ||
                undefined,
            responses: getResponses(method, endpoint)
        };
        const fixedPath = path.replace(param, '{$1}');
        if (!paths[fixedPath])
            paths[fixedPath] = {};
        paths[fixedPath][method] = endpoint?.swagger
            ? flattenConfig(base, endpoint?.swagger)
            : base;
    });
    return paths;
};
exports.default = ({ swagger = {}, base, resources }) => {
    const out = {
        swagger: '2.0',
        info: {
            title: 'Sutro API',
            version: '1.0.0'
        },
        basePath: base,
        schemes: ['http'],
        paths: getPaths(resources),
        ...swagger
    };
    return out;
};
//# sourceMappingURL=getSwagger.js.map