import once from 'once'

// takes a function or a flat value and returns the resolved value to the callback
// if a fn, it must return a flat value, a promise, or pass something to a callback
export default (fn, cb) => {
  const wrapped = once(cb)
  if (typeof fn !== 'function') {
    return wrapped(null, fn)
  }
  let res
  try {
    res = fn(wrapped)
  } catch (err) {
    return wrapped(err)
  }

  // using a callback
  if (typeof res === 'undefined') return

  // using a promise
  if (typeof res.then === 'function') {
    return res.then((data) => {
      wrapped(null, data)
    }, (err) => {
      wrapped(err)
    })
  }

  // returned a plain value
  wrapped(null, res)
}
