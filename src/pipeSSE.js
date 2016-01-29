import through from 'through2'

const getEvent = ({ type, data }, fmt) =>
  `event:${type}\ndata:${JSON.stringify(fmt ? fmt(data) : data)}\n\n`

export default (stream, res, fmt) => {
  res.status(200)
  res.type('text/event-stream')
  res.set('Cache-control', 'no-cache')
  res.write('\n')
  res.flush()

  stream.pipe(through.obj((o, _, cb) => {
    res.write(getEvent(o, fmt))
    res.flush()
    cb()
  }))

  res.once('close', () => stream.end())
}
