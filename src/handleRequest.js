import async from 'async'
import handleAsync from './handleAsync'
import pipeSSE from './pipeSSE'
import getErrorMessage from './getErrorMessage'

const extractChanged = (res) => {
  if (!res.changes[0]) return
  if (res.changes[0].new_val) return res.changes[0].new_val
  if (res.changes[0].old_val) return res.changes[0].old_val
}

const createHandlerFunction = (handler, { name, resourceName }) => {
  if (typeof handler === 'function') {
    handler = {
      process: handler
    }
  }
  if (!handler.process) throw new Error(`${resourceName}.${name} missing process function`)

  return (opt, cb) => {
    if (opt.tail && !handler.tailable) {
      cb(new Error('Endpoint not capable of SSE'))
    }

    const tasks = {
      isAuthorized: (done) => {
        const handleResult = (err, allowed) => {
          if (err) {
            return done(new Error(`${resourceName}.${name}.isAuthorized threw an error: ${getErrorMessage(err)}`), false)
          }
          if (typeof allowed !== 'boolean') {
            return done(new Error(`${resourceName}.${name}.isAuthorized did not return a boolean!`))
          }
          if (!allowed) return done({ status: 401 }, false)
          done(null, true)
        }

        if (!handler.isAuthorized) return handleResult(null, true)
        handleAsync(handler.isAuthorized.bind(null, opt), handleResult)
      },
      rawData: [ 'isAuthorized', (done) => {
        const handleResult = (err, res) => {
          // bad shit happened
          if (err) {
            return done(new Error(`${resourceName}.${name}.process threw an error: ${getErrorMessage(err)}`))
          }

          // no results
          if (!res) return done()

          // array of docs
          if (Array.isArray(res)) return done(null, res)

          // changes came back
          if (res.changes) return done(null, extractChanged(res))

          // one document instance, or stream
          done(null, res)
        }

        handleAsync(handler.process.bind(null, opt), handleResult)
      } ],
      formattedData: [ 'rawData', (done, { rawData }) => {
        const handleResult = (err, data) => {
          if (err) {
            return done(new Error(`${resourceName}.${name}.format threw an error: ${getErrorMessage(err)}`))
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
        return cb(new Error(`${resourceName}.${name}.process didn't return a stream`))
      }
      cb(err, {
        result: formattedData,
        stream: opt.tail && rawData
      })
    })
  }
}

export default ({ handler, name, successCode }, resourceName) => {
  const processor = createHandlerFunction(handler, { name, resourceName })
  return (req, res, next) => {
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
}
