import join from 'url-join'
import dp from 'dot-prop'
import walkResources from './walkResources'

// TODO: handle nesting correctly
export default ({ base, resources }) => {
  const paths = {}
  walkResources(resources, ({ hierarchy, path, method, instance }) => {
    const descriptor = {
      path: base ? join(base, path) : path,
      method,
      instance
    }
    dp.set(paths, hierarchy, descriptor)
  })
  return paths
}
