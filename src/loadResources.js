import pluralize from 'pluralize'
import mapValues from 'lodash.mapvalues'
import map from 'lodash.map'
import omit from 'lodash.omit'
import methods from './methods'

const blacklist = [ 'model' ]
const getDefaultFn = (m) => m.__esModule ? m.default : m

export default (resources) => {
  const getPath = (resourceName, methodName, methodInfo) => {
    let path = `/${pluralize.plural(resourceName)}`
    if (!methods[methodName]) {
      path += `/${methodName}`
    }
    if (methodInfo.instance) {
      path += '/:id'
    }

    return path
  }

  const getEndpoints = (handlers, resourceName) =>
    map(omit(handlers, blacklist), (handler, methodName) => {
      let fn = getDefaultFn(handler)
      if (typeof fn !== 'function') {
        throw new Error(`"${resourceName}" handler "${methodName}" did not export a function`)
      }
      let methodInfo = handler.http ? handler.http : methods[methodName]
      if (!methodInfo) {
        throw new Error(`"${resourceName}" handler "${methodName}" did not export a HTTP config object`)
      }
      if (typeof methodInfo.method === 'undefined') {
        throw new Error(`"${resourceName}" handler "${methodName}" did not export a HTTP config object containing "method"`)
      }
      if (typeof methodInfo.instance === 'undefined') {
        throw new Error(`"${resourceName}" handler "${methodName}" did not export a HTTP config object containing "instance"`)
      }

      return {
        name: methodName,
        method: methodInfo.method.toLowerCase(),
        path: getPath(resourceName, methodName, methodInfo),
        instance: !!methodInfo.instance,
        handler: fn,
        model: handlers.model
      }
    })

  return mapValues(resources, getEndpoints)
}
