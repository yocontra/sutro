import { Router } from 'express'
import { promisify } from 'handle-async'
import { finished } from 'stream'
import { NotFoundError } from './errors'
import getRequestHandler from './getRequestHandler'
import getSwagger from './getSwagger'
import getMeta from './getMeta'
import walkResources from './walkResources'
import rewriteLarge from './rewriteLarge'
import { MethodVerbs, SutroArgs, SutroRouter, PathParams } from './types'

export const rewriteLargeRequests = rewriteLarge

export * from './errors'

export default ({
  swagger,
  base,
  resources,
  pre,
  post,
  augmentContext,
  trace
}: SutroArgs) => {
  if (!resources) throw new Error('Missing resources option')
  const router: SutroRouter = Router({ mergeParams: true })
  router.swagger = getSwagger({ swagger, base, resources })
  router.meta = getMeta({ base, resources })
  router.base = base

  router.get('/', (req, res) => res.status(200).json(router.meta).end())
  router.get('/swagger', (req, res) =>
    res.status(200).json(router.swagger).end()
  )

  walkResources(resources, (resource) => {
    const handlers = [getRequestHandler(resource, { augmentContext, trace })]
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
  router.use((req, res, next) => next(new NotFoundError()))
  return router
}
