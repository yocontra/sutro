import { promisify } from 'handle-async'
import pump from 'pump'
import { NotFoundError, UnauthorizedError } from './errors'
import parseIncludes from './parseIncludes'

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
    _req: req,
    _res: res
  }
  // check isAuthorized
  const authorized = !endpoint.isAuthorized || await traceAsync(trace, 'sutro/isAuthorized', promisify(endpoint.isAuthorized.bind(null, opt)))
  if (authorized !== true) throw new UnauthorizedError()
  if (req.timedout) return

  // call execute
  const executeFn = typeof endpoint === 'function' ? endpoint : endpoint.execute
  const rawData = executeFn
    ? await traceAsync(trace, 'sutro/execute', promisify(executeFn.bind(null, opt)))
    : null
  if (req.timedout) return

  // call format on execute result
  const resultData = endpoint.format
    ? await traceAsync(trace, 'sutro/format', promisify(endpoint.format.bind(null, opt, rawData)))
    : rawData
  if (req.timedout) return

  // no response
  if (resultData == null) {
    if (req.method === 'GET') throw new NotFoundError()
    return res.status(successCode || 204).end()
  }

  // user asked for no body (low bandwidth)
  if (opt.noResponse) {
    return res.status(successCode || 204).end()
  }

  // some data, status code for it
  res.status(successCode || 200)

  // stream response
  if (resultData.pipe && resultData.on) {
    if (resultData.contentType) res.type(resultData.contentType)
    pump(resultData, res, (err) => {
      if (req.timedout) return
      if (err) throw err
    })
    return
  }

  // json obj response
  res.type('json')
  if (Buffer.isBuffer(resultData)) {
    res.send(resultData)
  } else if (typeof resultData === 'string') {
    res.send(Buffer.from(resultData))
  } else {
    res.json(resultData)
  }

  res.end()
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
