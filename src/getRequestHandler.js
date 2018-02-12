import { promisify } from 'handle-async'
import newrelic from 'newrelic'
import { NotFoundError, UnauthorizedError } from './errors'

const wrap = (name, fn) =>
  newrelic.createTracer(name, () => promisify(fn))()

const process = async ({ endpoint, successCode }, req, res) => {
  const opt = {
    ...req.params,
    ip: req.ip,
    url: req.url,
    protocol: req.protocol,
    method: req.method,
    subdomains: req.subdomains,
    path: req.path,
    cookies: req.cookies,
    user: req.user,
    data: req.body,
    options: req.query,
    session: req.session,
    noResponse: req.query.response === 'false',
    _req: req,
    _res: res
  }

  newrelic.addCustomAttributes({
    ...opt,
    _req: undefined,
    _res: undefined
  })

  // check isAuthorized
  const authorized = !endpoint.isAuthorized || await wrap('isAuthorized', endpoint.isAuthorized.bind(null, opt))
  if (authorized !== true) throw new UnauthorizedError()
  if (req.timedout) return

  // call process
  const processFn = typeof endpoint === 'function' ? endpoint : endpoint.process
  const rawData = processFn ? await wrap('process', processFn.bind(null, opt)) : null
  if (req.timedout) return

  // call format on process result
  const resultData = endpoint.format ? await wrap('format', endpoint.format.bind(null, opt, rawData)) : rawData
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
    resultData.pipe(res)
    return
  }

  // json obj response
  res.json(resultData).end()
}

export default (o) => {
  // wrap it so it has a name
  const handleAPIRequest = (req, res, next) => {
    if (req.timedout) return
    newrelic.startWebTransaction(o.hierarchy, () => process(o, req, res).catch(next))
  }
  return handleAPIRequest
}
