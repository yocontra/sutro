"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handle_async_1 = require("handle-async");
const stream_1 = require("stream");
const errors_1 = require("./errors");
const cacheControl_1 = __importDefault(require("./cacheControl"));
const defaultCacheHeaders = {
    private: true,
    noCache: true
};
const traceAsync = async (trace, name, promise) => {
    if (!trace)
        return promise; // no tracing, just return
    const ourTrace = trace.start(name);
    try {
        const res = await promise;
        ourTrace.end();
        return res;
    }
    catch (err) {
        ourTrace.end();
        throw err;
    }
};
const streamResponse = async (stream, req, res, codes, cacheStream) => {
    let hasFirstChunk = false;
    return new Promise((resolve, reject) => {
        let finished = false;
        const ourStream = stream_1.pipeline(stream, new stream_1.Transform({
            transform(chunk, _, cb) {
                // wait until we get a chunk without an error before writing the headers
                if (hasFirstChunk)
                    return cb(null, chunk);
                hasFirstChunk = true;
                if (stream.contentType)
                    res.type(stream.contentType);
                res.status(codes.success);
                cb(null, chunk);
            }
        }), (err) => {
            finished = true;
            if (!err || req.timedout)
                return resolve(undefined); // timed out, no point throwing a duplicate error
            reject(err);
        });
        // make sure we don't keep working if the response closed!
        res.once('close', () => {
            if (finished)
                return; // no need to blow up
            ourStream.destroy(new Error('Socket closed before response finished'));
        });
        if (cacheStream) {
            ourStream.pipe(cacheStream);
            ourStream.pause();
        }
        // just use a regular pipe to res, since pipeline would close it on error
        // which would make us unable to send an error back out
        ourStream.pipe(res);
    });
};
const sendBufferResponse = (resultData, _req, res, codes) => {
    res.status(codes.success);
    res.type('json');
    if (Buffer.isBuffer(resultData)) {
        res.send(resultData);
    }
    else if (typeof resultData === 'string') {
        res.send(Buffer.from(resultData));
    }
    else {
        res.json(resultData);
    }
    res.end();
};
const sendResponse = async (opt, successCode, resultData, writeCache) => {
    const { _res, _req, method, noResponse } = opt;
    const codes = {
        noResponse: successCode || 204,
        success: successCode || 200
    };
    // no response
    if (resultData == null) {
        if (method === 'GET')
            throw new errors_1.NotFoundError();
        return _res.status(codes.noResponse).end();
    }
    // user asked for no body (save bandwidth)
    if (noResponse) {
        return _res.status(codes.noResponse).end();
    }
    // stream response
    if (resultData.pipe && resultData.on) {
        const cacheStream = await writeCache(resultData);
        await streamResponse(resultData, _req, _res, codes, cacheStream);
        return;
    }
    // json obj response
    sendBufferResponse(resultData, _req, _res, codes);
    await writeCache(resultData);
};
const exec = async (req, res, { endpoint, successCode }, { trace, augmentContext }) => {
    let opt = {
        ...req.params,
        ip: req.ip,
        url: req.url,
        protocol: req.protocol,
        method: req.method,
        subdomains: req.subdomains,
        path: req.path,
        headers: req.headers,
        cookies: req.cookies,
        user: req.user,
        data: req.body,
        options: req.query,
        session: req.session,
        noResponse: req.query.response === 'false',
        onFinish: (fn) => {
            res.once('finish', fn.bind(null, req, res));
        },
        withRaw: (fn) => {
            fn(req, res);
        },
        _req: req,
        _res: res
    };
    if (augmentContext)
        opt = await traceAsync(trace, 'sutro/augmentContext', handle_async_1.promisify(augmentContext.bind(null, opt, req)));
    // check isAuthorized
    const authorized = !endpoint?.isAuthorized ||
        (await traceAsync(trace, 'sutro/isAuthorized', handle_async_1.promisify(endpoint.isAuthorized.bind(null, opt))));
    if (authorized !== true)
        throw new errors_1.UnauthorizedError();
    if (req.timedout)
        return;
    let resultData;
    // check cache
    const cacheKey = endpoint?.cache &&
        endpoint.cache.key &&
        (await traceAsync(trace, 'sutro/cache.key', handle_async_1.promisify(endpoint.cache.key.bind(null, opt))));
    if (req.timedout)
        return;
    const cachedData = endpoint?.cache &&
        endpoint.cache.get &&
        (await traceAsync(trace, 'sutro/cache.get', handle_async_1.promisify(endpoint.cache.get.bind(null, opt, cacheKey))));
    if (req.timedout)
        return;
    // call execute
    if (!cachedData) {
        const executeFn = typeof endpoint === 'function' ? endpoint : endpoint?.execute;
        const rawData = typeof executeFn === 'function'
            ? await traceAsync(trace, 'sutro/execute', handle_async_1.promisify(executeFn.bind(null, opt)))
            : executeFn || null;
        if (req.timedout)
            return;
        // call format on execute result
        resultData = endpoint?.format
            ? await traceAsync(trace, 'sutro/format', handle_async_1.promisify(endpoint.format.bind(null, opt, rawData)))
            : rawData;
        if (req.timedout)
            return;
    }
    else {
        resultData = cachedData;
    }
    // call cacheControl
    const cacheHeaders = endpoint?.cache && endpoint.cache.header
        ? typeof endpoint.cache.header === 'function'
            ? await traceAsync(trace, 'sutro/cache.header', handle_async_1.promisify(endpoint.cache.header.bind(null, opt, resultData)))
            : endpoint.cache.header
        : defaultCacheHeaders;
    if (req.timedout)
        return;
    if (cacheHeaders)
        res.set('Cache-Control', cacheControl_1.default(cacheHeaders));
    const writeCache = async (data) => {
        if (cachedData || !endpoint?.cache?.set)
            return;
        return traceAsync(trace, 'sutro/cache.set', handle_async_1.promisify(endpoint.cache.set.bind(null, opt, data, cacheKey)));
    };
    await sendResponse(opt, successCode, resultData, writeCache);
};
exports.default = (resource, { trace, augmentContext }) => {
    // wrap it so it has a name
    const handleAPIRequest = async (req, res, next) => {
        if (req.timedout)
            return;
        try {
            await traceAsync(trace, 'sutro/handleAPIRequest', exec(req, res, resource, { trace, augmentContext }));
        }
        catch (err) {
            return next(err);
        }
    };
    return handleAPIRequest;
};
//# sourceMappingURL=getRequestHandler.js.map