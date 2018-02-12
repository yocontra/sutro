import { Router } from 'express'
import { promisify } from 'handle-async'
import { NotFoundError } from './errors'
import getRequestHandler from './getRequestHandler'
import getSwagger from './getSwagger'
import getMeta from './getMeta'
import walkResources from './walkResources'

export default ({ swagger, base, resources, pre }={}) => {
  if (!resources) throw new Error('Missing resources option')
  const router = Router({ mergeParams: true })
  router.swagger = getSwagger({ swagger, base, resources })
  router.meta = getMeta({ base, resources })
  router.base = base

  router.get('/', (req, res) =>
    res.status(200).json(router.meta).end()
  )
  router.get('/swagger', (req, res) =>
    res.status(200).json(router.swagger).end()
  )

  walkResources(resources, (o) => {
    const handlers = [ getRequestHandler(o) ]
    if (pre) {
      handlers.unshift((req, res, next) => {
        promisify(pre.bind(null, o, req, res))
          .catch(next)
          .then(() => next())
      })
    }
    router[o.method](o.path, ...handlers)
  })

  // handle 404s
  router.use((req, res, next) => next(new NotFoundError()))
  return router
}
