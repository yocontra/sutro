"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_join_1 = __importDefault(require("url-join"));
const dot_prop_1 = __importDefault(require("dot-prop"));
const walkResources_1 = __importDefault(require("./walkResources"));
// TODO: handle nesting correctly
exports.default = ({ base, resources }) => {
    const paths = {};
    walkResources_1.default(resources, ({ hierarchy, path, method, instance, endpoint }) => {
        if (endpoint?.hidden)
            return; // skip
        const descriptor = {
            path: base ? url_join_1.default(base, path) : path,
            method,
            instance
        };
        dot_prop_1.default.set(paths, hierarchy, descriptor);
    });
    return paths;
};
//# sourceMappingURL=getMeta.js.map