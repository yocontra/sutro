import { Router } from 'express'
import each from 'lodash.foreach'
import loadResources from './loadResources'
import handleRequest from './handleRequest'
import displayResources from './displayResources'
import _debug from 'debug'
const debug = _debug('sutro:loader')

const wireEndpoint = (router) => (endpoint) => {
  debug(`  - ${endpoint.name} (${endpoint.method.toUpperCase()} ${endpoint.path})`)
  router[endpoint.method](endpoint.path, handleRequest(endpoint.handler))
}

const wireResource = (router) => (endpoints, resourceName) => {
  debug(`Loaded ${endpoints.length} endpoints for "${resourceName}"`)
  each(endpoints, wireEndpoint(router))
}

export default (opt) => {
  let resources = loadResources(opt)
  let meta = displayResources(resources, opt)

  // construct the router
  let router = Router({ mergeParams: true })
  router.meta = meta
  each(resources, wireResource(router))
  router.get('/_resources', (req, res) => res.json(meta))
  return router
}
