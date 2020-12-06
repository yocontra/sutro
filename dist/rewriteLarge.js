"use strict";

exports.__esModule = true;
exports.default = void 0;

// allow people to send a POST and alias it into a GET
// this is a work-around for really large queries
// this is similar to how method-override works but more opinionated
var _default = (req, res, next) => {
  if (req.method.toLowerCase() !== 'post') return next();
  const override = req.get('x-http-method-override');
  if (!override || override.toLowerCase() !== 'get') return next(); // work

  req.originalMethod = req.originalMethod || req.method;
  req.method = 'GET';
  req.query = { ...req.query,
    ...req.body
  };
  delete req.body;
  next();
};

exports.default = _default;
module.exports = exports.default;