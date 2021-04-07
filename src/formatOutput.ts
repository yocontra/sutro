import JSONStream from 'jsonstream-next'

const isTypeORM = (inp: any) =>
  Array.isArray(inp) &&
  inp.length === 2 &&
  Array.isArray(inp[0]) &&
  typeof inp[1] === 'number'
const isSequelize = (inp: any) => inp.rows && typeof inp.count !== 'undefined'

export const format = (inp: any, meta: object) => {
  let rows: any[]
  let count: number
  if (isSequelize(inp)) {
    rows = inp.rows
    count = inp.count
  } else if (isTypeORM(inp)) {
    rows = inp[0]
    count = inp[1]
  } else if (Array.isArray(inp)) {
    rows = inp
  } else {
    throw new Error('Invalid response! Could not format.')
  }
  return {
    results: rows,
    meta: {
      results: rows.length,
      total:
        typeof count === 'undefined'
          ? rows.length
          : Math.max(rows.length, count), // count should never be below results
      ...meta
    }
  }
}

export const stream = (counter: Promise<number>, meta: object) => {
  let results = 0
  const tail = JSONStream.stringify('{"results":[', ',', (cb) => {
    const fin = (res: number, total: number) => {
      const outMeta = {
        results: res,
        total,
        ...meta
      }
      cb(null, `],"meta":${JSON.stringify(outMeta)}}`)
    }
    if (!counter) return fin(results, results)
    counter
      .then((total) => {
        const totalConstrained = Math.max(results, total) // count should never be below results
        fin(results, totalConstrained)
      })
      .catch((err) => cb(err))
  })
  const origWrite = tail.write
  tail.write = (...a) => {
    ++results
    return origWrite.call(tail, ...a)
  }
  return tail
}
stream.contentType = 'application/json'
