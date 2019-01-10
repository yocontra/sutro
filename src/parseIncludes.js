const toArray = (i) => {
  if (!i) return []
  if (Array.isArray(i)) return i
  return [ i ]
}

const parseIncludes = (include) => {
  const inp = toArray(include)
  return inp.map((i, idx) => {
    if (typeof i === 'string') i = { resource: i }
    if (!i || typeof i !== 'object') throw new Error(`Invalid include: ${idx}`)

    return {
      resource: i.resource,
      includes: i.includes && parseIncludes(i.includes),
      attributes: i.attributes && toArray(i.attributes),
      limit: parseInt(i.limit)
    }
  })
}

export default parseIncludes
