import { plural } from 'pluralize'
import mapValues from 'lodash.mapvalues'
import map from 'lodash.map'
import omit from 'lodash.omit'
import sort from 'lodash.sortby'
import methods from './methods'

const blacklist = [ 'model' ]
export default (resources) => {
  const getPath = (resourceName, methodName, methodInfo) => {
    let path = `/${plural(resourceName)}`
    if (methodInfo.instance) {
      path += '/:id'
    }
    if (!methods[methodName]) {
      path += `/${methodName}`
    }

    return path
  }

  const getEndpoints = (handlers, resourceName) => {
    const handlerNames = omit(handlers, blacklist)

    const meta = map(handlerNames, (handler, methodName) => {
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
        successCode: methodInfo.successCode || 200,
        emptyCode: methodInfo.emptyCode || 204,
        path: getPath(resourceName, methodName, methodInfo),
        instance: !!methodInfo.instance,
        handler: handler,
        custom: !methods[methodName],
        model: handlers.model
      }

    })

    // float custom endpoints to the top, they take precedence
    return sort(meta, (endpoint) => !endpoint.custom)
  }

  return mapValues(resources, getEndpoints)
}
