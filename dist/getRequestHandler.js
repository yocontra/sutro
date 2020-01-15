'use strict';

exports.__esModule = true;

var _handleAsync = require('handle-async');

var _pump = require('pump');

var _pump2 = _interopRequireDefault(_pump);

var _errors = require('./errors');

var _parseIncludes = require('./parseIncludes');

var _parseIncludes2 = _interopRequireDefault(_parseIncludes);

var _cacheControl = require('./cacheControl');

var _cacheControl2 = _interopRequireDefault(_cacheControl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const defaultCacheHeaders = {
  private: true,
  noCache: true
};

const traceAsync = async (trace, name, promise) => {
  if (!trace) return promise; // no tracing, just return
  const ourTrace = trace.start(name);
  try {
    const res = await promise;
    ourTrace.end();
    return res;
  } catch (err) {
    ourTrace.end();
    throw err;
  }
};

const sendResponse = ({ opt, successCode, resultData }) => {
  const { _res, _req, method, noResponse } = opt;
  // no response
  if (resultData == null) {
    if (method === 'GET') throw new _errors.NotFoundError();
    return _res.status(successCode || 204).end();
  }

  // user asked for no body (low bandwidth)
  if (noResponse) {
    return _res.status(successCode || 204).end();
  }

  // some data, status code for it
  _res.status(successCode || 200);

  // stream response
  if (resultData.pipe && resultData.on) {
    if (resultData.contentType) _res.type(resultData.contentType);
    _res.once('close', () => resultData.destroy()); // pump does not handle close properly!
    (0, _pump2.default)(resultData, _res, err => {
      if (_req.timedout) return;
      if (err) throw err;
    });
    return;
  }

  // json obj response
  _res.type('json');
  if (Buffer.isBuffer(resultData)) {
    _res.send(resultData);
  } else if (typeof resultData === 'string') {
    _res.send(Buffer.from(resultData));
  } else {
    _res.json(resultData);
  }

  _res.end();
};

const pipeline = async (req, res, { endpoint, successCode, trace }) => {
  const opt = Object.assign({}, req.params, {
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
    includes: (0, _parseIncludes2.default)(req.query.includes),
    noResponse: req.query.response === 'false',
    onFinish: fn => {
      res.once('finish', fn);
    },
    withMutation: fn => {
      fn(res);
    },
    _req: req,
    _res: res

    // check isAuthorized
  });const authorized = !endpoint.isAuthorized || (await traceAsync(trace, 'sutro/isAuthorized', (0, _handleAsync.promisify)(endpoint.isAuthorized.bind(null, opt))));
  if (authorized !== true) throw new _errors.UnauthorizedError();
  if (req.timedout) return;

  let resultData;

  // check cache
  const cacheKey = endpoint.cache && endpoint.cache.key && (await traceAsync(trace, 'sutro/cache.key', (0, _handleAsync.promisify)(endpoint.cache.key.bind(null, opt))));
  if (req.timedout) return;

  const cachedData = endpoint.cache && endpoint.cache.get && (await traceAsync(trace, 'sutro/cache.get', (0, _handleAsync.promisify)(endpoint.cache.get.bind(null, opt, cacheKey))));
  if (req.timedout) return;

  // call execute
  if (!cachedData) {
    const executeFn = typeof endpoint === 'function' ? endpoint : endpoint.execute;
    const rawData = typeof executeFn === 'function' ? await traceAsync(trace, 'sutro/execute', (0, _handleAsync.promisify)(executeFn.bind(null, opt))) : executeFn || null;
    if (req.timedout) return;

    // call format on execute result
    resultData = endpoint.format ? await traceAsync(trace, 'sutro/format', (0, _handleAsync.promisify)(endpoint.format.bind(null, opt, rawData))) : rawData;
    if (req.timedout) return;
  } else {
    resultData = cachedData;
  }

  // call cacheControl
  const cacheHeaders = endpoint.cache && endpoint.cache.header ? typeof endpoint.cache.header === 'function' ? await traceAsync(trace, 'sutro/cache.header', (0, _handleAsync.promisify)(endpoint.cache.header.bind(null, opt, resultData))) : endpoint.cache.header : defaultCacheHeaders;
  if (req.timedout) return;
  if (cacheHeaders) res.set('Cache-Control', (0, _cacheControl2.default)(cacheHeaders));

  // send the data out
  sendResponse({ opt, successCode, resultData });

  // write to cache if we got a fresh response
  if (!cachedData && endpoint.cache && endpoint.cache.set) {
    await traceAsync(trace, 'sutro/cache.set', (0, _handleAsync.promisify)(endpoint.cache.set.bind(null, opt, resultData, cacheKey)));
  }
};

exports.default = (resource, { trace } = {}) => {
  // wrap it so it has a name
  const handleAPIRequest = async (req, res, next) => {
    if (req.timedout) return;
    try {
      await traceAsync(trace, 'sutro/handleAPIRequest', pipeline(req, res, Object.assign({}, resource, { trace })));
    } catch (err) {
      return next(err);
    }
  };
  return handleAPIRequest;
};

module.exports = exports.default;