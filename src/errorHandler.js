/* eslint no-unused-vars:0 */
import _debug from 'debug'
import mapValues from 'lodash.mapvalues'
import getErrorMessage from './getErrorMessage'
const debug = _debug('sutro:errors')

const getErrorFields = (err) => {
  if (!err.errors) return
  return mapValues(err.errors, getErrorMessage)
}

const sendError = (err, res) => {
  res.status(err.status || 500)
  res.json({
    error: getErrorMessage(err),
    fields: getErrorFields(err)
  })
  res.end()
}

export const createHandler = (custom) =>
  (err, req, res, next) => {
    sendError(err, res)
    custom(getErrorMessage(err, true))
  }

export default createHandler(debug)
