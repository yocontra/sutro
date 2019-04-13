'use strict';

exports.__esModule = true;

var _handleAsync = require('handle-async');

var _pump = require('pump');

var _pump2 = _interopRequireDefault(_pump);

var _errors = require('./errors');

var _parseIncludes = require('./parseIncludes');

var _parseIncludes2 = _interopRequireDefault(_parseIncludes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    _req: req,
    _res: res
    // check isAuthorized
  });const authorized = !endpoint.isAuthorized || (await traceAsync(trace, 'sutro/isAuthorized', (0, _handleAsync.promisify)(endpoint.isAuthorized.bind(null, opt))));
  if (authorized !== true) throw new _errors.UnauthorizedError();
  if (req.timedout) return;

  // call execute
  const executeFn = typeof endpoint === 'function' ? endpoint : endpoint.execute;
  const rawData = executeFn ? await traceAsync(trace, 'sutro/execute', (0, _handleAsync.promisify)(executeFn.bind(null, opt))) : null;
  if (req.timedout) return;

  // call format on execute result
  const resultData = endpoint.format ? await traceAsync(trace, 'sutro/format', (0, _handleAsync.promisify)(endpoint.format.bind(null, opt, rawData))) : rawData;
  if (req.timedout) return;

  // no response
  if (resultData == null) {
    if (req.method === 'GET') throw new _errors.NotFoundError();
    return res.status(successCode || 204).end();
  }

  // user asked for no body (low bandwidth)
  if (opt.noResponse) {
    return res.status(successCode || 204).end();
  }

  // some data, status code for it
  res.status(successCode || 200);

  // stream response
  if (resultData.pipe && resultData.on) {
    if (resultData.contentType) res.type(resultData.contentType);
    res.once('close', () => resultData.destroy()); // pump does not handle close properly!
    (0, _pump2.default)(resultData, res, err => {
      if (req.timedout) return;
      if (err) throw err;
    });
    return;
  }

  // json obj response
  res.type('json');
  if (Buffer.isBuffer(resultData)) {
    res.send(resultData);
  } else if (typeof resultData === 'string') {
    res.send(Buffer.from(resultData));
  } else {
    res.json(resultData);
  }

  res.end();
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