'use strict';

exports.__esModule = true;
const toArray = i => {
  if (!i) return [];
  if (Array.isArray(i)) return i.map(i => String(i));
  return [String(i)];
};

exports.default = include => {
  const inp = toArray(include);
  const out = inp.reduce((prev, key) => {
    const [relation, ...keys] = key.split('.');
    if (keys.length === 0) return prev; // no sub-attrs specified, just ignore it
    if (!prev[relation]) prev[relation] = {};
    const nKey = keys.join('.');
    prev[relation].attributes = [...(prev[relation].attributes || []), nKey];
    if (nKey === '*') delete prev[relation].attributes;
    return prev;
  }, {});

  return Object.entries(out).map(([k, v]) => ({ resource: k, attributes: v.attributes }));
};

module.exports = exports.default;