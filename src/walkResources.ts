import join from 'url-join'
import getPath from './getPath'
import methods from './methods'
import { Resources, walkResourceArgs, Handler, MethodKeys } from './types'

const idxd = (o) => o.index || o

const walkResource = ({
  base,
  name,
  resource,
  hierarchy,
  handler
}: walkResourceArgs) => {
  const res = idxd(resource)

  // sort custom stuff first
  const endpointNames: string[] = []
  Object.keys(res).forEach((k) =>
    // TODO REVIEW THIS TYPE ASSERTION
    methods[k as MethodKeys] ? endpointNames.push(k) : endpointNames.unshift(k)
  )

  endpointNames.forEach((endpointName) => {
    const endpoint = res[endpointName]
    const methodInfo = endpoint.http || methods[endpointName as MethodKeys]
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
    const path =
      endpoint.path ||
      getPath({
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

export default (resources: Resources, handler: Handler) => {
  Object.keys(idxd(resources)).forEach((resourceName) => {
    walkResource({
      name: resourceName,
      resource: resources[resourceName],
      handler
    })
  })
}
