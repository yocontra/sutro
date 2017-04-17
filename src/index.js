import { Router } from 'express'
import getRequestHandler from './getRequestHandler'
import getSwagger from './getSwagger'
import walkResources from './walkResources'

export default ({ swagger, path, resources }={}) => {
  if (!resources) throw new Error('Missing resources option')
  const router = Router({ mergeParams: true })
  router.swagger = getSwagger({ swagger, path, resources })
  router.path = path
  router.get('/swagger.json', (req, res) =>
    res.status(200).json(router.swagger).end()
  )

  walkResources(resources, ({ path, method, endpoint }) => {
    router[method](path, getRequestHandler(endpoint))
  })
  return router
}
