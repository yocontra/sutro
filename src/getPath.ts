import plural from 'pluralize'
import methods from './methods'
import { getPathArgs, MethodKeys } from './types'

export default ({ resource, endpoint, instance }: getPathArgs) => {
  let path = ''
  if (resource) path += `/${plural(resource)}`
  if (resource && instance) path += `/:${resource}Id`
  // TODO REVIEW THIS TYPE ASSERTION
  if (endpoint && !methods[endpoint as MethodKeys]) path += `/${endpoint}`
  return path
}
