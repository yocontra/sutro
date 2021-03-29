"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pluralize_1 = __importDefault(require("pluralize"));
const methods_1 = __importDefault(require("./methods"));
exports.default = ({ resource, endpoint, instance }) => {
    let path = '';
    if (resource)
        path += `/${pluralize_1.default(resource)}`;
    if (resource && instance)
        path += `/:${resource}Id`;
    if (endpoint && !methods_1.default[endpoint])
        path += `/${endpoint}`;
    return path;
};
//# sourceMappingURL=getPath.js.map