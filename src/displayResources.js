import exportSchema from 'thinky-export-schema'
import mapValues from 'lodash.mapvalues'
import map from 'lodash.map'

export default (resources, opt) =>
  mapValues(resources, (endpoints) => ({
    model: exportSchema(endpoints[0].model),
    endpoints: map(endpoints, (endpoint) => ({
      name: endpoint.name,
      method: endpoint.method.toUpperCase(),
      path: opt.prefix ? `${opt.prefix}${endpoint.path}` : endpoint.path,
      instance: endpoint.instance
    }))
  })
)
