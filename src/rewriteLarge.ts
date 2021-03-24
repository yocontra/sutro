import { Response, NextFunction } from 'express'
import { SutroRequest } from './types'

// allow people to send a POST and alias it into a GET
// this is a work-around for really large queries
// this is similar to how method-override works but more opinionated
export default (req: SutroRequest, res: Response, next: NextFunction) => {
  if (req.method.toLowerCase() !== 'post') return next()
  const override = req.get('x-http-method-override')
  if (!override || override.toLowerCase() !== 'get') return next()

  // work
  req.originalMethod = req.originalMethod || req.method
  req.method = 'GET'
  req.query = {
    ...req.query,
    ...req.body
  }
  delete req.body
  next()
}
