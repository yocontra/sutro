import thinky from 'thinky'

const db = thinky({
  silent: true
})
db.r.getPoolMaster()._flushErrors = () => {}

export default (name, schema) =>
  db.createModel(name, schema)
