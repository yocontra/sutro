import exportSchema from 'thinky-export-schema'
import mapValues from 'lodash.mapvalues'
import map from 'lodash.map'

export default (prefix = '', resources) =>
  mapValues(resources, (endpoints) => ({
    model: endpoints[0] && endpoints[0].model
      ? exportSchema(endpoints[0].model)
      : undefined,
    endpoints: map(endpoints, (endpoint) => ({
      name: endpoint.name,
      method: endpoint.method.toUpperCase(),
      path: prefix ? `${prefix}${endpoint.path}` : endpoint.path,
      instance: endpoint.instance
    }))
  })
)
