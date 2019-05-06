export default (opt) => {
  if (typeof opt === 'string') return opt // already formatted
  const stack = []

  if (opt.private) stack.push('private')
  if (opt.public) stack.push('public')
  if (opt.noStore) stack.push('no-store')
  if (opt.noCache) stack.push('no-cache')
  if (opt.noTransform) stack.push('no-transform')
  if (opt.proxyRevalidate) stack.push('proxy-revalidate')
  if (opt.mustRevalidate) stack.push('proxy-revalidate')
  if (opt.staleIfError) stack.push(`stale-if-error=${opt.staleIfError}`)
  if (opt.staleWhileRevalidate) stack.push(`stale-while-revalidate=${opt.staleWhileRevalidate}`)
  if (Number.isInteger(opt.maxAge)) stack.push(`max-age=${opt.maxAge}`)
  if (Number.isInteger(opt.sMaxAge)) stack.push(`s-maxage=${opt.sMaxAge}`)
  return stack.join(',')
}
