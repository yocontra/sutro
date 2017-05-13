import { Router } from 'express'
import getRequestHandler from './getRequestHandler'
import getSwagger from './getSwagger'
import getMeta from './getMeta'
import walkResources from './walkResources'

export default ({ swagger, base, resources }={}) => {
  if (!resources) throw new Error('Missing resources option')
  const router = Router({ mergeParams: true })
  router.swagger = getSwagger({ swagger, base, resources })
  router.meta = getMeta({ base, resources })
  router.base = base
  router.get('/swagger.json', (req, res) =>
    res.status(200).json(router.swagger).end()
  )
  router.get('/meta.json', (req, res) =>
    res.status(200).json(router.meta).end()
  )

  walkResources(resources, (o) => {
    router[o.method](o.path, getRequestHandler(o))
  })
  return router
}
