// allow people to send a POST and alias it into a GET
// this is a work-around for really large queries
// this is similar to how method-override works but more opinionated
export default (req, res, next) => {
  if (req.method.toLowerCase() !== 'post') return next()
  const override = req.get('x-http-method-override')
  if (!override || override.toLowerCase() !== 'get') return next()

  console.log('rewriting')
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
