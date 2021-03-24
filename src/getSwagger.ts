import omit from 'lodash.omit'
import walkResources from './walkResources'
import {
  getSwaggerArgs,
  MethodVerbs,
  Resources,
  Responses,
  Swagger,
  ResourceRoot,
  SwaggerConfig,
  Paths
} from './types'

const param = /:(\w+)/gi

const getResponses = (method: MethodVerbs, endpoint: ResourceRoot) => {
  const out: Responses = {
    404: {
      description: 'Not found'
    },
    500: {
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

const flattenConfig = (
  base: SwaggerConfig,
  override: SwaggerConfig
): SwaggerConfig => {
  const filtered = omit(override, [
    'consumes',
    'produces',
    'responses',
    'parameters'
  ])
  return {
    consumes: override.consumes || base.consumes,
    produces: override.produces || base.produces,
    responses: override.responses
      ? {
          ...base.responses,
          ...override.responses
        }
      : base.responses,
    parameters: override.parameters
      ? [...(base.parameters || []), ...override.parameters]
      : base.parameters,
    ...filtered
  }
}

const getPaths = (resources: Resources): Paths => {
  const paths: Paths = {}
  walkResources(resources, ({ path, method, endpoint }) => {
    if (endpoint?.hidden || endpoint?.swagger === false) return // skip
    const params = (path as string)?.match(param)
    const base: SwaggerConfig = {
      consumes: (method !== 'get' && ['application/json']) || undefined,
      produces: ['application/json'],
      parameters:
        (params &&
          params.map((name: string) => ({
            name: name.slice(1),
            in: 'path',
            required: true,
            type: 'string'
          }))) ||
        undefined,
      responses: getResponses(method as MethodVerbs, endpoint as ResourceRoot)
    }
    const fixedPath = (path as string).replace(param, '{$1}')
    if (!paths[fixedPath]) paths[fixedPath] = {}
    paths[fixedPath][method as MethodVerbs] = flattenConfig(
      base,
      endpoint?.swagger
    )
  })
  return paths
}

export default ({ swagger = {}, base, resources }: getSwaggerArgs): Swagger => {
  const out = {
    swagger: '2.0',
    info: {
      title: 'Sutro API',
      version: '1.0.0'
    },
    basePath: base,
    schemes: ['http'],
    paths: getPaths(resources),
    ...swagger
  }
  return out
}
