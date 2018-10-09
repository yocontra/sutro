'use strict';

exports.__esModule = true;

var _handleAsync = require('handle-async');

var _pump = require('pump');

var _pump2 = _interopRequireDefault(_pump);

var _errors = require('./errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const pipeline = async ({ endpoint, successCode }, req, res) => {
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
    noResponse: req.query.response === 'false',
    _req: req,
    _res: res
    // check isAuthorized
  });const authorized = !endpoint.isAuthorized || (await (0, _handleAsync.promisify)(endpoint.isAuthorized.bind(null, opt)));
  if (authorized !== true) throw new _errors.UnauthorizedError();
  if (req.timedout) return;

  // call execute
  const executeFn = typeof endpoint === 'function' ? endpoint : endpoint.execute;
  const rawData = executeFn ? await (0, _handleAsync.promisify)(executeFn.bind(null, opt)) : null;
  if (req.timedout) return;

  // call format on execute result
  const resultData = endpoint.format ? await (0, _handleAsync.promisify)(endpoint.format.bind(null, opt, rawData)) : rawData;
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
    (0, _pump2.default)(resultData, res, err => {
      if (req.timedout) return;
      if (err) throw err;
    });
    return;
  }

  // json obj response
  res.json(resultData).end();
};

exports.default = o => {
  // wrap it so it has a name
  const handleAPIRequest = (req, res, next) => {
    if (req.timedout) return;
    try {
      pipeline(o, req, res).catch(next);
    } catch (err) {
      return next(err);
    }
  };
  return handleAPIRequest;
};

module.exports = exports.default;