import join from 'url-join'
import getPath from './getPath'
import methods from './methods'

const walkResource = ({ base, name, resource, hierarchy, handler }) => {
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
      walkResource({
        base: base ? join(base, newBase) : newBase,
        name: endpointName,
        resource: endpoint,
        hierarchy: hierarchy ? `${hierarchy}.${name}` : name,
        handler
      })
      return
    }
    const path = endpoint.path || getPath({
      resource: name,
      endpoint: endpointName,
      instance: methodInfo.instance
    })
    const fullPath = base ? join(base, path) : path
    handler({
      hierarchy: hierarchy
        ? `${hierarchy}.${name}.${endpointName}`
        : `${name}.${endpointName}`,
      path: fullPath,
      endpoint,
      ...methodInfo
    })
  })
}

export default (resources, handler) => {
  Object.keys(resources).forEach((resourceName) => {
    walkResource({
      name: resourceName,
      resource: resources[resourceName],
      handler
    })
  })
}
