import { Router } from 'express'
import each from 'lodash.foreach'
import requireDir from 'require-dir'
import loadResources from './loadResources'
import handleRequest from './handleRequest'
import displayResources from './displayResources'
import _debug from 'debug'
const debug = _debug('sutro:loader')

const wireEndpoint = (router, endpoint, resourceName) => {
  debug(`  - ${endpoint.name} (${endpoint.method.toUpperCase()} ${endpoint.path})`)
  router[endpoint.method](endpoint.path, handleRequest(endpoint, resourceName))
}

const wireResource = (router) => (endpoints, resourceName) => {
  debug(`Loaded ${endpoints.length} endpoints for "${resourceName}"`)
  each(endpoints, (endpoint) =>
    wireEndpoint(router, endpoint, resourceName)
  )
}

export const load = (path) => requireDir(path, { recurse: true })

export default ({ prefix, resources }) => {
  if (!resources) throw new Error('Missing resources option')
  let loadedResources = loadResources(resources)
  let meta = displayResources(prefix, loadedResources)
  let router = Router({ mergeParams: true })
  router.meta = meta

  each(loadedResources, wireResource(router))
  router.get('/_resources', (req, res) => res.json(meta))
  return router
}
