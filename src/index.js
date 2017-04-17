import { Router } from 'express'
import join from 'url-join'
import getRequestHandler from './getRequestHandler'
import getSwagger from './getSwagger'
import methods from './methods'
import getPath from './getPath'

const wireResource = ({ base, name, resource, router }) => {
  // sort custom stuff first
  const endpointNames = []
  Object.keys(resource).forEach((k) =>
    methods[k] ? endpointNames.push(k) : endpointNames.unshift(k)
  )

  endpointNames.forEach((endpointName) => {
    const endpoint = resource[endpointName]
    const methodInfo = endpoint.http || methods[endpointName]
    if (!methodInfo) {
      // TODO: error if still nothing found
      const newBase = getPath({ resource: name, instance: true })
      wireResource({
        base: base ? join(base, newBase) : newBase,
        name: endpointName,
        resource: endpoint,
        router
      })
      return
    }
    const path = endpoint.path || getPath({
      resource: name,
      endpoint: endpointName,
      instance: methodInfo.instance
    })
    const fullPath = base ? join(base, path) : path
    router[methodInfo.method](fullPath, getRequestHandler(endpoint))
  })
}

const wireResources = (resources, router) => {
  Object.keys(resources).forEach((resourceName) => {
    wireResource({
      name: resourceName,
      resource: resources[resourceName],
      router
    })
  })
}

export default ({ swagger, path, resources }={}) => {
  if (!resources) throw new Error('Missing resources option')
  const router = Router({ mergeParams: true })
  router.swagger = getSwagger({ swagger, path, resources })
  router.path = path
  router.get('/swagger.json', (req, res) =>
    res.status(200).json(router.swagger).end()
  )

  wireResources(resources, router)
  return router
}
