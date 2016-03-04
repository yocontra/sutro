import { screenDeep } from 'palisade'
import async from 'async'
import once from 'once'
import changeStream from 'rethinkdb-change-stream'
import pipeSSE from './pipeSSE'

const extractChanged = (res) => {
  if (!res.changes) return
  if (!res.changes[0]) return
  if (res.changes[0].new_val) return res.changes[0].new_val
  if (res.changes[0].old_val) return res.changes[0].old_val
}

const createCustomHandlerFunction = (handler) => {
  return (opt, cb) => {
    let stream
    const done = once(cb)
    try {
      stream = handler(opt, (err, data) =>
        done(err, {
          result: screenDeep(opt.user, data)
        })
      )
    } catch (err) {
      return done(err)
    }
    if (opt.tail) {
      if (stream && stream.pipe) return done(null, { stream: stream })
      done(new Error('Endpoint did not return a stream'))
    }
  }
}

const handleAsync = (fn, cb) => {
  const wrapped = once(cb)
  let res
  try {
    res = fn(wrapped)
  } catch (err) {
    return wrapped(err, false)
  }
  if (typeof res !== 'undefined') wrapped(null, res)
}

const createHandlerFunction = (handler, { name, resourceName }) => {
  if (!!handler.default || typeof handler === 'function') {
    return createCustomHandlerFunction(handler.default || handler)
  }

  return (opt, cb) => {
    if (opt.tail && !handler.tailable) {
      cb(new Error('Endpoint not capable of SSE'))
    }

    const tasks = {
      isAuthorized: (done) => {
        const handleResult = (err, allowed) => {
          if (err) {
            return done(new Error(`${resourceName}.${name}.isAuthorized threw an error: ${err.stack || err.message || err}`), false)
          }
          if (typeof allowed !== 'boolean') {
            return done(new Error(`${resourceName}.${name}.isAuthorized did not return a boolean!`))
          }
          if (!allowed) return done({ status: 401 }, false)
          done(null, true)
        }

        handleAsync(handler.isAuthorized.bind(null, opt), handleResult)
      },
      rawData: [ 'isAuthorized', (done, { isAuthorized }) => {
        const handleResult = (err, res) => {
          // bad shit happened
          if (err) {
            return done(new Error(`${resourceName}.${name}.fetch threw an error: ${err.stack || err.message || err}`))
          }

          // no results
          if (!res) return done()

          // array of docs
          if (Array.isArray(res)) return done(null, res)

          // changes came back
          if (res.changes) return done(null, extractChanged(res))

          // one document instance
          done(null, res)
        }

        if (!isAuthorized) return handleResult()
        if (opt.tail) return handleResult()
        handleAsync(handler.fetch.bind(null, opt), handleResult)
      } ],
      formattedData: [ 'rawData', (done, { rawData }) => {
        const handleResult = (err, data) => {
          if (err) {
            return done(new Error(`${resourceName}.${name}.format threw an error: ${err.stack || err.message || err}`))
          }
          done(null, data)
        }

        if (typeof rawData === 'undefined') return handleResult()
        handleAsync(handler.format.bind(null, opt, rawData), handleResult)
      } ]
    }

    async.auto(tasks, (err, { formattedData, rawData }) =>
      cb(err, {
        result: formattedData,
        stream: opt.tail && rawData ? rawData : null
      })
    )
  }
}

export default ({ handler, name, successCode }, resourceName) => {
  const processor = createHandlerFunction(handler, { name, resourceName })
  return (req, res, next) => {
    const opt = {
      id: req.params.id,
      user: req.user,
      data: req.body,
      options: req.query,
      session: req.session,
      tail: req.get('accept') === 'text/event-stream',
      _req: req,
      _res: res
    }
    const formatter = handler.formatResponse
      ? handler.formatResponse.bind(null, opt)
      : () => screenDeep(opt.user, ...arguments)

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
