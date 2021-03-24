"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_join_1 = __importDefault(require("url-join"));
const getPath_1 = __importDefault(require("./getPath"));
const methods_1 = __importDefault(require("./methods"));
// TODO fix me
const idxd = (o) => o.index || o;
const walkResource = ({ base, name, resource, hierarchy, handler }) => {
    const res = idxd(resource);
    // sort custom stuff first
    const endpointNames = [];
    Object.keys(res).forEach((k) => 
    // TODO REVIEW THIS TYPE ASSERTION
    methods_1.default[k] ? endpointNames.push(k) : endpointNames.unshift(k));
    endpointNames.forEach((endpointName) => {
        const endpoint = res[endpointName];
        const methodInfo = endpoint.http || methods_1.default[endpointName];
        if (!methodInfo) {
            // TODO: error if still nothing found
            const newBase = getPath_1.default({ resource: name, instance: true });
            walkResource({
                base: base ? url_join_1.default(base, newBase) : newBase,
                name: endpointName,
                resource: endpoint,
                hierarchy: hierarchy ? `${hierarchy}.${name}` : name,
                handler
            });
            return;
        }
        const path = endpoint.path ||
            getPath_1.default({
                resource: name,
                endpoint: endpointName,
                instance: methodInfo.instance
            });
        const fullPath = base ? url_join_1.default(base, path) : path;
        handler({
            hierarchy: hierarchy
                ? `${hierarchy}.${name}.${endpointName}`
                : `${name}.${endpointName}`,
            path: fullPath,
            endpoint,
            ...methodInfo
        });
    });
};
exports.default = (resources, handler) => {
    Object.keys(idxd(resources)).forEach((resourceName) => {
        walkResource({
            name: resourceName,
            resource: resources[resourceName],
            handler
        });
    });
};
//# sourceMappingURL=walkResources.js.map