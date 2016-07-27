import { Router } from 'express'
import each from 'lodash.foreach'
import requireDir from 'require-dir'
import loadResources from './loadResources'
import getRequestHandler from './getRequestHandler'
import displayResources from './displayResources'
import _debug from 'debug'
const debug = _debug('sutro:loader')

const wireEndpoint = (router, endpoint, resourceName) => {
  debug(`  - ${endpoint.name} (${endpoint.method.toUpperCase()} ${endpoint.path})`)
  router[endpoint.method](endpoint.path, getRequestHandler(endpoint, resourceName))
}

const wireResource = (router) => (endpoints, resourceName) => {
  const number = endpoints.length > 1 ? 'endpoints' : 'endpoint'
  const actualName = resourceName.toLowerCase()
  debug(`Loaded ${endpoints.length} ${number} for "${actualName}"`)
  each(endpoints, (endpoint) =>
    wireEndpoint(router, endpoint, actualName)
  )
}

export const load = (path) => requireDir(path, { recurse: true })

export default ({ prefix, resources }) => {
  if (!resources) throw new Error('Missing resources option')
  let loadedResources = loadResources(resources)
  let meta = displayResources(prefix, loadedResources)
  let router = Router({ mergeParams: true })
  router.meta = meta
  router.prefix = prefix

  each(loadedResources, wireResource(router))
  router.get('/_resources', (req, res) => res.json(meta))

  return router
}
