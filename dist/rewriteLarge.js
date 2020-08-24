"use strict";

exports.__esModule = true;
exports.default = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// allow people to send a POST and alias it into a GET
// this is a work-around for really large queries
// this is similar to how method-override works but more opinionated
var _default = (req, res, next) => {
  if (req.method.toLowerCase() !== 'post') return next();
  const override = req.get('x-http-method-override');
  if (!override || override.toLowerCase() !== 'get') return next(); // work

  req.originalMethod = req.originalMethod || req.method;
  req.method = 'GET';
  req.query = _objectSpread(_objectSpread({}, req.query), req.body);
  delete req.body;
  next();
};

exports.default = _default;
module.exports = exports.default;