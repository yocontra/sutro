'use strict';

exports.__esModule = true;

var _parseDuration = require('parse-duration');

var _parseDuration2 = _interopRequireDefault(_parseDuration);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const parseNumber = v => {
  const n = typeof v === 'number' ? v : (0, _parseDuration2.default)(v);
  if (isNaN(n)) throw new Error(`Invalid number: ${v}`);
  return n / 1000;
};

exports.default = opt => {
  if (typeof opt === 'string') return opt; // already formatted
  const stack = [];

  if (opt.private) stack.push('private');
  if (opt.public) stack.push('public');
  if (opt.noStore) stack.push('no-store');
  if (opt.noCache) stack.push('no-cache');
  if (opt.noTransform) stack.push('no-transform');
  if (opt.proxyRevalidate) stack.push('proxy-revalidate');
  if (opt.mustRevalidate) stack.push('proxy-revalidate');
  if (opt.staleIfError) stack.push(`stale-if-error=${parseNumber(opt.staleIfError)}`);
  if (opt.staleWhileRevalidate) stack.push(`stale-while-revalidate=${parseNumber(opt.staleWhileRevalidate)}`);
  if (opt.maxAge) stack.push(`max-age=${parseNumber(opt.maxAge)}`);
  if (opt.sMaxAge) stack.push(`s-maxage=${parseNumber(opt.sMaxAge)}`);
  return stack.join(', ');
};

module.exports = exports.default;