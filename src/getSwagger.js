import walkResources from './walkResources'

const param = /:(\w+)/gi

const getResponses = (method, endpoint) => {
  const out = {
    '404': {
      description: 'Not found'
    },
    '500': {
      description: 'Server error'
    },
    default: {
      description: 'Unexpected error'
    }
  }

  if (method === 'post') {
    out['201'] = {
      description: 'Success, created'
    }
  } else {
    out['200'] = {
      description: 'Success'
    }
    out['204'] = {
      description: 'Success, no data return necessary'
    }
  }

  if (endpoint.isAuthorized) {
    out['401'] = {
      description: 'Unauthorized'
    }
  }
  return out
}

const getPaths = (resources) => {
  const paths = {}
  walkResources(resources, ({ path, method, endpoint }) => {
    if (endpoint.swagger === false) return // skip if set to false
    const swaggerMeta = endpoint.swagger || {}
    const params = path.match(param)
    const descriptor = {
      consumes: method !== 'get' && [ 'application/json' ] || undefined,
      produces: [ 'application/json' ],
      parameters: params && params.map((name) => ({
        name: name.slice(1),
        in: 'path',
        required: true
      })) || undefined,
      responses: getResponses(method, endpoint),
      ...swaggerMeta
    }

    const fixedPath = path.replace(param, '{$1}')
    if (!paths[fixedPath]) paths[fixedPath] = {}
    paths[fixedPath][method] = descriptor
  })
  return paths
}

export default ({ swagger={}, base, resources }) => {
  const out = {
    swagger: '2.0',
    info: {
      title: 'Sutro API',
      version: '1.0.0'
    },
    basePath: base,
    schemes: [ 'http' ],
    paths: getPaths(resources),
    ...swagger
  }
  return out
}
