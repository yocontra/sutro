import join from 'url-join'
import getPath from './getPath'
import methods from './methods'


const wireResource = ({ base, name, resource, paths }) => {
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
        paths
      })
      return
    }
    const path = endpoint.path || getPath({
      resource: name,
      endpoint: endpointName,
      instance: methodInfo.instance
    })
    // TODO: replace path params w/ swagger params
    const fullPath = base ? join(base, path) : path
    const swaggerMeta = endpoint.swagger || {}
    const descriptor = {
      consumes: methodInfo.method !== 'get' && [ 'application/json' ],
      produces: [ 'application/json' ],
      // TODO: add path parameters
      ...swaggerMeta
    }

    if (!paths[fullPath]) paths[fullPath] = {}
    paths[fullPath][methodInfo.method] = descriptor
  })
}

const getPaths = (resources) => {
  const paths = {}
  Object.keys(resources).forEach((resourceName) => {
    wireResource({
      name: resourceName,
      resource: resources[resourceName],
      paths
    })
  })
  return paths
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
