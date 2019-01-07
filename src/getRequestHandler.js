import { promisify } from 'handle-async'
import pump from 'pump'
import { NotFoundError, UnauthorizedError } from './errors'

const parseIncludes = (include) => {
  const out = include.reduce((prev, key) => {
    const [ relation, ...keys ] = key.split('.')
    if (keys.length === 0) return prev // no sub-attrs specified, just ignore it
    if (!prev[relation]) prev[relation] = {}
    const nKey = keys.join('.')
    prev[relation].attributes = [
      ...prev[relation].attributes || [],
      nKey
    ]
    if (nKey === '*') delete prev[relation].attributes
    return prev
  }, {})

  return Object.entries(out).map(([ k, v ]) => ({ resource: k, attributes: v.attributes }))
}

const toArray = (i) => {
  if (!i) return []
  if (Array.isArray(i)) return i.map((i) => String(i))
  return [ String(i) ]
}

const pipeline = async ({ endpoint, successCode }, req, res) => {
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
    includes: parseIncludes(toArray(req.query.includes)),
    noResponse: req.query.response === 'false',
    _req: req,
    _res: res
  }
  // check isAuthorized
  const authorized = !endpoint.isAuthorized || await promisify(endpoint.isAuthorized.bind(null, opt))
  if (authorized !== true) throw new UnauthorizedError()
  if (req.timedout) return

  // call execute
  const executeFn = typeof endpoint === 'function' ? endpoint : endpoint.execute
  const rawData = executeFn ? await promisify(executeFn.bind(null, opt)) : null
  if (req.timedout) return

  // call format on execute result
  const resultData = endpoint.format ? await promisify(endpoint.format.bind(null, opt, rawData)) : rawData
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
    pump(resultData, res, (err) => {
      if (req.timedout) return
      if (err) throw err
    })
    return
  }

  // json obj response
  res.json(resultData).end()
}

export default (o) => {
  // wrap it so it has a name
  const handleAPIRequest = (req, res, next) => {
    if (req.timedout) return
    try {
      pipeline(o, req, res).catch(next)
    } catch (err) {
      return next(err)
    }
  }
  return handleAPIRequest
}
