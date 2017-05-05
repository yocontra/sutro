import { promisify } from 'handle-async'
import { NotFoundError } from './errors'

const process = async (endpoint, req, res) => {
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
    _req: req,
    _res: res
  }

  // check isAuthorized
  const authorized = !endpoint.isAuthorized || await promisify(endpoint.isAuthorized.bind(null, opt))
  if (authorized !== true) {
    const err = new Error('Unauthorized')
    err.status = 401
    throw err
  }

  // call process
  const rawData = endpoint.process ? await promisify(endpoint.process.bind(null, opt)) : null

  // call format on process result
  const resultData = endpoint.format ? await promisify(endpoint.format.bind(null, opt, rawData)) : rawData

  // no response
  if (resultData == null) {
    if (req.method === 'POST') return res.status(201).end()
    if (req.method === 'GET') throw new NotFoundError()
    return res.status(204).end()
  }

  // some data, status code for it
  res.status(req.method === 'POST' ? 201 : 200)

  // stream response
  if (resultData.pipe && resultData.on) {
    resultData.pipe(res)
    return
  }

  // json obj response
  res.json(resultData).end()
}

export default (endpoint) => {
  if (typeof endpoint === 'function') endpoint = { process: endpoint }
  return (req, res, next) =>
    process(endpoint, req, res).catch(next)
}
