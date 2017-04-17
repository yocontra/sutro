import getPath from './getPath'
import methods from './methods'

const getPaths = (resources) => {
  const out = {}
  Object.keys(resources).forEach((resourceName) => {
    const resource = resources[resourceName]
    Object.keys(resource).forEach((endpointName) => {
      const endpoint = resource[endpointName]
      const methodInfo = endpoint.http || methods[endpointName]
      if (!methodInfo) {
        // TODO: recurse
        return
      }
      const path = getPath({
        resource: resourceName,
        endpoint: endpointName,
        instance: methodInfo.instance
      })
      // TODO: replace path params w/ swagger params
      const swaggerMeta = endpoint.swagger || {}
      const descriptor = {
        consumes: [ 'application/json' ],
        produces: [ 'application/json' ],
        ...swaggerMeta
      }
      // TODO: add path parameters

      if (!out[path]) out[path] = {}
      out[path][methodInfo.method] = descriptor
    })
  })

  return out
}

export default ({ swagger={}, path, resources }) => {
  const out = {
    swagger: '2.0',
    basePath: path,
    schemes: [ 'http' ],
    paths: getPaths(resources),
    ...swagger
  }

  return out
}
