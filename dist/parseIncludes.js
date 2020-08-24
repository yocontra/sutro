"use strict";

exports.__esModule = true;
exports.default = void 0;

const toArray = i => {
  if (!i) return [];
  if (Array.isArray(i)) return i;
  return [i];
};

const toStringArray = i => toArray(i).map(s => String(s));

const parseIncludes = include => {
  const inp = toArray(include);
  return inp.map((i, idx) => {
    if (typeof i === 'string') i = {
      resource: i
    };
    if (!i || typeof i !== 'object') throw new Error(`Invalid include: ${idx}`);
    if (typeof i.resource !== 'string') throw new Error(`Invalid include resource: ${idx}`); // tack on to keep it minimal

    const out = {
      resource: i.resource
    };
    if (i.includes) out.includes = parseIncludes(i.includes);
    if (i.attributes) out.attributes = toStringArray(i.attributes);

    if (i.limit) {
      const limit = parseInt(i.limit);
      if (!isNaN(limit)) out.limit = limit;
    }

    return out;
  });
};

var _default = parseIncludes;
exports.default = _default;
module.exports = exports.default;