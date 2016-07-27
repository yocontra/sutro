import async from 'async'
import makeError from 'make-error-cause'
import handleAsync from './handleAsync'
import pipeSSE from './pipeSSE'

const EndpointError = makeError('EndpointError')

const createHandlerFunction = (handler, { name, resourceName }) => {
  if (typeof handler === 'function') {
    handler = {
      process: handler
    }
  }
  if (!handler.process) throw new Error(`${resourceName}.${name} missing process function!`)

  return (opt, cb) => {
    if (opt.tail && !handler.tailable) {
      cb(new EndpointError('Endpoint not capable of SSE!'))
    }

    const tasks = {
      isAuthorized: (done) => {
        const handleResult = (err, allowed) => {
          if (err) {
            return done(new EndpointError(`${resourceName}.${name}.isAuthorized returned an error!`, err))
          }
          if (typeof allowed !== 'boolean') {
            return done(new EndpointError(`${resourceName}.${name}.isAuthorized did not return a boolean!`))
          }
          if (!allowed) {
            return done({ status: 401 })
          }
          done(null, true)
        }

        if (!handler.isAuthorized) return handleResult(null, true)
        handleAsync(handler.isAuthorized.bind(null, opt), handleResult)
      },
      rawData: [ 'isAuthorized', (done) => {
        const handleResult = (err, res) => {
          // bad shit happened
          if (err) {
            return done(new EndpointError(`${resourceName}.${name}.process returned an error!`, err))
          }

          // no results
          if (!res) return done()

          done(null, res)
        }

        handleAsync(handler.process.bind(null, opt), handleResult)
      } ],
      formattedData: [ 'rawData', (done, { rawData }) => {
        const handleResult = (err, data) => {
          if (err) {
            return done(new EndpointError(`${resourceName}.${name}.format returned an error!`, err))
          }
          done(null, data)
        }

        if (typeof rawData === 'undefined') return handleResult()
        if (!handler.format) return handleResult(null, rawData)
        handleAsync(handler.format.bind(null, opt, rawData), handleResult)
      } ]
    }

    async.auto(tasks, (err, { formattedData, rawData }) => {
      if (opt.tail && rawData && !rawData.pipe) {
        return cb(new EndpointError(`${resourceName}.${name}.process didn't return a stream!`))
      }
      cb(err, {
        result: formattedData,
        stream: opt.tail && rawData
      })
    })
  }
}

const getRequestHandler = ({ handler, name, successCode }, resourceName) => {
  const processor = createHandlerFunction(handler, { name, resourceName })
  const handleSutroRequest = (req, res, next) => {
    const opt = {
      ...req.params,
      user: req.user,
      data: req.body,
      options: req.query,
      session: req.session,
      tail: req.get('accept') === 'text/event-stream',
      _req: req,
      _res: res
    }

    // TODO: get rid of plain function syntax
    // and handle this somewhere else!
    const formatter = handler.format
      ? handler.format.bind(null, opt)
      : null

    processor(opt, (err, { result, stream } = {}) => {
      if (err) return next(err)
      if (stream) return pipeSSE(stream, res, formatter)

      if (result) {
        res.status(successCode)
        res.json(result)
      } else {
        res.status(204)
      }
      res.end()
    })
  }

  return handleSutroRequest
}


export default getRequestHandler
