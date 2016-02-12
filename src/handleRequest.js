import { screenDeep } from 'palisade'
import async from 'async'
import once from 'once'
import mapValues from 'lodash.mapvalues'
import changeStream from 'rethinkdb-change-stream'
import pipeSSE from './pipeSSE'

const getError = (err) => {
  if (err.message) return err.message
  if (err.error) {
    if (err.error.message) return err.error.message
    return err.error
  }
  return err
}

const getErrorFields = (err) => {
  if (!err.errors) return
  return mapValues(err.errors, getError)
}

const sendError = (err, res) => {
  res.status(err.status || 500)
  res.json({
    error: getError(err),
    fields: getErrorFields(err)
  })
  res.end()
}

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
        try {
          handler.isAuthorized(opt, (err, allowed) => {
            if (err) return done(err, false)
            if (typeof allowed !== 'boolean') {
              return done(new Error(`${resourceName}.${name}.isAuthorized did not return a boolean!`))
            }
            if (!allowed) return done({ status: 401 }, false)
            done(null, true)
          })
        } catch (err) {
          return done(new Error(`${resourceName}.${name}.isAuthorized threw an error: ${err.stack || err.message || err}`))
        }
      },
      query: [ 'isAuthorized', (done, res) => {
        if (!res.isAuthorized) return done()
        try {
          handler.createQuery(opt, (err, query) => {
            if (err) return done(err)
            if (!query) return done(new Error(`${resourceName}.${name}.createQuery did not return a query`))
            if (!query.execute) return done(new Error(`${resourceName}.${name}.createQuery did not return a valid query`))
            done(null, query)
          })
        } catch (err) {
          return done(new Error(`${resourceName}.${name}.createQuery threw an error: ${err.stack || err.message || err}`))
        }
      } ],
      rawResults: [ 'query', (done, res) => {
        if (opt.tail) return done()
        res.query.execute((err, res) => {
          // bad shit happened
          if (err) return done(err)

          // no results
          if (!res) return done()

          // array of docs
          if (Array.isArray(res)) return done(null, res)

          // changes came back
          if (res.changes) return done(null, extractChanged(res))

          // one document instance
          done(null, res)
        })
      } ],
      formatResponse: [ 'rawResults', (done, res) => {
        if (!res.rawResults) return done()
        try {
          done(null, handler.formatResponse(opt, res.rawResults))
        } catch (err) {
          return done(new Error(`${resourceName}.${name}.formatResponse threw an error: ${err.stack || err.message || err}`))
        }
      } ]
    }

    async.auto(tasks, (err, res) =>
      cb(err, {
        result: res.formatResponse,
        stream: opt.tail && res.query ? changeStream(res.query) : null
      })
    )
  }
}

export default ({ handler, name, successCode }, resourceName) => {
  const processor = createHandlerFunction(handler, { name, resourceName })
  return (req, res) => {
    const opt = {
      id: req.params.id,
      user: req.user,
      data: req.body,
      options: req.query,
      tail: req.get('accept') === 'text/event-stream',
      _req: req,
      _res: res
    }
    const formatter = handler.formatResponse
      ? handler.formatResponse.bind(null, opt)
      : screenDeep.bind(null, opt.user)

    processor(opt, (err, { result, stream }) => {
      if (err) return sendError(err, res)
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
