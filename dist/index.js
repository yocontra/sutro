"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatResultsStream = exports.formatResults = exports.rewriteLargeRequests = void 0;
const express_1 = require("express");
const handle_async_1 = require("handle-async");
const stream_1 = require("stream");
const formatResults_1 = require("./formatResults");
Object.defineProperty(exports, "formatResults", { enumerable: true, get: function () { return formatResults_1.format; } });
Object.defineProperty(exports, "formatResultsStream", { enumerable: true, get: function () { return formatResults_1.stream; } });
const errors_1 = require("./errors");
const getRequestHandler_1 = __importDefault(require("./getRequestHandler"));
const getSwagger_1 = __importDefault(require("./getSwagger"));
const getMeta_1 = __importDefault(require("./getMeta"));
const walkResources_1 = __importDefault(require("./walkResources"));
const rewriteLarge_1 = __importDefault(require("./rewriteLarge"));
// other exports
exports.rewriteLargeRequests = rewriteLarge_1.default;
__exportStar(require("./errors"), exports);
exports.default = ({ swagger, base, resources, pre, post, augmentContext, formatResults, trace }) => {
    if (!resources)
        throw new Error('Missing resources option');
    const router = express_1.Router({ mergeParams: true });
    router.swagger = getSwagger_1.default({ swagger, base, resources });
    router.meta = getMeta_1.default({ base, resources });
    router.base = base;
    router.get('/', (_req, res) => res.status(200).json(router.meta).end());
    router.get('/swagger', (_req, res) => res.status(200).json(router.swagger).end());
    walkResources_1.default(resources, (resource) => {
        const handlers = [
            getRequestHandler_1.default(resource, { augmentContext, formatResults, trace })
        ];
        if (pre) {
            handlers.unshift(async (req, res, next) => {
                const ourTrace = trace && trace.start('sutro/pre');
                try {
                    await handle_async_1.promisify(pre.bind(null, resource, req, res));
                }
                catch (err) {
                    if (ourTrace)
                        ourTrace.end();
                    return next(err);
                }
                if (ourTrace)
                    ourTrace.end();
                next();
            });
        }
        if (post) {
            handlers.unshift(async (req, res, next) => {
                stream_1.finished(res, async (err) => {
                    const ourTrace = trace && trace.start('sutro/post');
                    try {
                        await handle_async_1.promisify(post.bind(null, resource, req, res, err));
                    }
                    catch (err) {
                        if (ourTrace)
                            ourTrace.end();
                    }
                    if (ourTrace)
                        ourTrace.end();
                });
                next();
            });
        }
        router[resource.method](resource.path, ...handlers);
    });
    // handle 404s
    router.use((_req, _res, next) => next(new errors_1.NotFoundError()));
    return router;
};
//# sourceMappingURL=index.js.map