import join from 'url-join'
import dp from 'dot-prop'
import walkResources from './walkResources'
import { getMetaArgs, Meta } from './types'

// TODO: handle nesting correctly
export default ({ base, resources }: getMetaArgs): Meta => {
  const paths = {}
  walkResources(
    resources,
    ({ hierarchy, path, method, instance, endpoint }) => {
      if (endpoint.hidden) return // skip
      const descriptor = {
        path: base ? join(base, path) : path,
        method,
        instance
      }
      dp.set(paths, hierarchy, descriptor)
    }
  )
  return paths
}
