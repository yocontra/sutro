import { Request, Response, NextFunction } from 'express'
import { MethodVerbs } from './types'

// allow people to send a POST and alias it into a GET
// this is a work-around for really large queries
// this is similar to how method-override works but more opinionated
export default (req: Request, res: Response, next: NextFunction) => {
  if (req.method.toLowerCase() !== 'post') return next()
  const override = req.get('x-http-method-override')
  if (!override || override.toLowerCase() !== 'get') return next()

  // work
  req.method = 'GET'
  req.query = {
    ...req.query,
    ...req.body
  }
  delete req.body
  next()
}
