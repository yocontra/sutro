import plural from 'pluralize'
import methods from './methods'

export default ({ resource, endpoint, instance }) => {
  let path = ''
  if (resource) path += `/${plural(resource)}`
  if (resource && instance) path += `/:${resource}Id`
  if (endpoint && !methods[endpoint]) path += `/${endpoint}`
  return path
}
