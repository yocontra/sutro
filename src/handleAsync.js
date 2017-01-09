import once from 'once'

// takes a function or a flat value and returns the resolved value to the callback
// if a fn, it must return a flat value, a promise, or pass something to a callback
const handleAsync = (fn, cb) => {
  // flat value
  if (typeof fn !== 'function') return cb(null, fn)

  const wrapped = once(cb)

  // call fn w callback
  let res
  try {
    res = fn(wrapped)
  } catch (err) {
    return wrapped(err)
  }

  // using a callback, itll call with a response
  if (typeof res === 'undefined') return

  // using a promise
  if (typeof res.then === 'function') {
    res.then((data) => {
      wrapped(null, data)
      return null
    }).catch((err) => {
      wrapped(err)
    })
    return
  }

  // returned a plain value
  wrapped(null, res)
}

export default handleAsync
