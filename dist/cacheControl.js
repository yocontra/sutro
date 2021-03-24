"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parse_duration_1 = __importDefault(require("parse-duration"));
const parseNumber = (v) => {
    const n = (typeof v === 'number' ? v : parse_duration_1.default(v));
    if (isNaN(n))
        throw new Error(`Invalid number: ${v}`);
    return n / 1000;
};
exports.default = (opt) => {
    if (typeof opt === 'string')
        return opt; // already formatted
    const stack = [];
    if (opt.private)
        stack.push('private');
    if (opt.public)
        stack.push('public');
    if (opt.noStore)
        stack.push('no-store');
    if (opt.noCache)
        stack.push('no-cache');
    if (opt.noTransform)
        stack.push('no-transform');
    if (opt.proxyRevalidate)
        stack.push('proxy-revalidate');
    if (opt.mustRevalidate)
        stack.push('proxy-revalidate');
    if (opt.staleIfError)
        stack.push(`stale-if-error=${parseNumber(opt.staleIfError)}`);
    if (opt.staleWhileRevalidate)
        stack.push(`stale-while-revalidate=${parseNumber(opt.staleWhileRevalidate)}`);
    if (opt.maxAge)
        stack.push(`max-age=${parseNumber(opt.maxAge)}`);
    if (opt.sMaxAge)
        stack.push(`s-maxage=${parseNumber(opt.sMaxAge)}`);
    return stack.join(', ');
};
//# sourceMappingURL=cacheControl.js.map