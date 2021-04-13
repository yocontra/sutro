import { Router } from 'express'
import { promisify } from 'handle-async'
import { finished } from 'stream'
import { format, stream } from './formatResults'
import { NotFoundError } from './errors'
import cacheControl from './cacheControl'
import getRequestHandler from './getRequestHandler'
import getSwagger from './getSwagger'
import getMeta from './getMeta'
import walkResources from './walkResources'
import rewriteLarge from './rewriteLarge'
import {
  MethodVerbs,
  SutroArgs,
  SutroRouter,
  PathParams,
  EndpointIsAuthorized,
  EndpointExecute,
  EndpointFormat,
  EndpointCache,
  EndpointHTTP,
  SutroRequest,
  SutroStream
} from './types'

// other exports
export const rewriteLargeRequests = rewriteLarge
export type {
  EndpointIsAuthorized,
  EndpointExecute,
  EndpointFormat,
  EndpointCache,
  EndpointHTTP,
  SutroRequest,
  SutroStream
}
export * from './errors'
export { format as formatResults, stream as formatResultsStream }
export { cacheControl }

export default ({
  swagger,
  base,
  resources,
  pre,
  post,
  augmentContext,
  formatResults,
  trace
}: SutroArgs) => {
  if (!resources) throw new Error('Missing resources option')
  const router: SutroRouter = Router({ mergeParams: true })
  router.swagger = getSwagger({ swagger, base, resources })
  router.meta = getMeta({ base, resources })
  router.base = base

  router.get('/', (_req, res) => res.status(200).json(router.meta).end())
  router.get('/swagger', (_req, res) =>
    res.status(200).json(router.swagger).end()
  )

  walkResources(resources, (resource) => {
    const handlers = [
      getRequestHandler(resource, { augmentContext, formatResults, trace })
    ]
    if (pre) {
      handlers.unshift(async (req, res, next) => {
        const ourTrace = trace && trace.start('sutro/pre')
        try {
          await promisify(pre.bind(null, resource, req, res))
        } catch (err) {
          if (ourTrace) ourTrace.end()
          return next(err)
        }
        if (ourTrace) ourTrace.end()
        next()
      })
    }
    if (post) {
      handlers.unshift(async (req, res, next) => {
        finished(res, async (err) => {
          const ourTrace = trace && trace.start('sutro/post')
          try {
            await promisify(post.bind(null, resource, req, res, err))
          } catch (err) {
            if (ourTrace) ourTrace.end()
          }
          if (ourTrace) ourTrace.end()
        })
        next()
      })
    }
    router[resource.method as MethodVerbs](
      resource.path as PathParams,
      ...handlers
    )
  })

  // handle 404s
  router.use((_req, _res, next) => next(new NotFoundError()))
  return router
}
