import { promisify } from 'handle-async'
import pump from 'pump'
import { NotFoundError, UnauthorizedError } from './errors'
import parseIncludes from './parseIncludes'
import cacheControl from './cacheControl'

const defaultCacheHeaders = {
  private: true,
  noCache: true
}

const traceAsync = async (trace, name, promise) => {
  if (!trace) return promise // no tracing, just return
  const ourTrace = trace.start(name)
  try {
    const res = await promise
    ourTrace.end()
    return res
  } catch (err) {
    ourTrace.end()
    throw err
  }
}

const sendResponse = ({ opt, successCode, resultData }) => {
  const { _res, _req, method, noResponse } = opt
  // no response
  if (resultData == null) {
    if (method === 'GET') throw new NotFoundError()
    return _res.status(successCode || 204).end()
  }

  // user asked for no body (low bandwidth)
  if (noResponse) {
    return _res.status(successCode || 204).end()
  }

  // some data, status code for it
  _res.status(successCode || 200)

  // stream response
  if (resultData.pipe && resultData.on) {
    if (resultData.contentType) _res.type(resultData.contentType)
    _res.once('close', () => resultData.destroy()) // pump does not handle close properly!
    pump(resultData, _res, (err) => {
      if (_req.timedout) return
      if (err) throw err
    })
    return
  }

  // json obj response
  _res.type('json')
  if (Buffer.isBuffer(resultData)) {
    _res.send(resultData)
  } else if (typeof resultData === 'string') {
    _res.send(Buffer.from(resultData))
  } else {
    _res.json(resultData)
  }

  _res.end()
}

const pipeline = async (req, res, { endpoint, successCode, trace }) => {
  const opt = {
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
    includes: parseIncludes(req.query.includes),
    noResponse: req.query.response === 'false',
    onFinish: (fn) => { res.once('finish', fn.bind(null, res)) },
    withMutation: (fn) => { fn(res) },
    _req: req,
    _res: res
  }

  // check isAuthorized
  const authorized = !endpoint.isAuthorized || await traceAsync(trace, 'sutro/isAuthorized', promisify(endpoint.isAuthorized.bind(null, opt)))
  if (authorized !== true) throw new UnauthorizedError()
  if (req.timedout) return

  let resultData

  // check cache
  const cacheKey = endpoint.cache && endpoint.cache.key && await traceAsync(trace, 'sutro/cache.key', promisify(endpoint.cache.key.bind(null, opt)))
  if (req.timedout) return

  const cachedData = endpoint.cache && endpoint.cache.get && await traceAsync(trace, 'sutro/cache.get', promisify(endpoint.cache.get.bind(null, opt, cacheKey)))
  if (req.timedout) return

  // call execute
  if (!cachedData) {
    const executeFn = typeof endpoint === 'function' ? endpoint : endpoint.execute
    const rawData = typeof executeFn === 'function'
      ? await traceAsync(trace, 'sutro/execute', promisify(executeFn.bind(null, opt)))
      : executeFn || null
    if (req.timedout) return

    // call format on execute result
    resultData = endpoint.format
      ? await traceAsync(trace, 'sutro/format', promisify(endpoint.format.bind(null, opt, rawData)))
      : rawData
    if (req.timedout) return
  } else {
    resultData = cachedData
  }

  // call cacheControl
  const cacheHeaders = endpoint.cache && endpoint.cache.header
    ? typeof endpoint.cache.header === 'function'
      ? await traceAsync(trace, 'sutro/cache.header', promisify(endpoint.cache.header.bind(null, opt, resultData)))
      : endpoint.cache.header
    : defaultCacheHeaders
  if (req.timedout) return
  if (cacheHeaders) res.set('Cache-Control', cacheControl(cacheHeaders))

  // send the data out
  sendResponse({ opt, successCode, resultData })

  // write to cache if we got a fresh response
  if (!cachedData && endpoint.cache && endpoint.cache.set) {
    await traceAsync(trace, 'sutro/cache.set', promisify(endpoint.cache.set.bind(null, opt, resultData, cacheKey)))
  }
}

export default (resource, { trace } = {}) => {
  // wrap it so it has a name
  const handleAPIRequest = async (req, res, next) => {
    if (req.timedout) return
    try {
      await traceAsync(trace, 'sutro/handleAPIRequest', pipeline(req, res, { ...resource, trace }))
    } catch (err) {
      return next(err)
    }
  }
  return handleAPIRequest
}
