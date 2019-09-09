'use strict';

exports.__esModule = true;
exports.NotFoundError = exports.ValidationError = exports.BadRequestError = exports.UnauthorizedError = exports.codes = undefined;

var _util = require('util');

const inspectOptions = {
  depth: 100,
  breakLength: Infinity
};

const serializeIssues = fields => fields.map(f => `\n - ${(0, _util.inspect)(f, inspectOptions)}`);

const codes = exports.codes = {
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  serverError: 500
};

class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized', status = codes.unauthorized) {
    super(message);
    this.message = message;
    this.status = status;
    Error.captureStackTrace(this, UnauthorizedError);
  }
  toString() {
    return `${super.toString()} (HTTP ${this.status})`;
  }
}

exports.UnauthorizedError = UnauthorizedError;
class BadRequestError extends Error {
  constructor(message = 'Bad Request', status = codes.badRequest) {
    super(message);
    this.message = message;
    this.status = status;
    Error.captureStackTrace(this, BadRequestError);
  }
  toString() {
    return `${super.toString()} (HTTP ${this.status})`;
  }
}

exports.BadRequestError = BadRequestError;
class ValidationError extends BadRequestError {
  constructor(message, fields) {
    super();
    if (message && fields) {
      this.message = message;
      this.fields = fields;
    }
    if (message && !fields) {
      this.fields = message;
    }
    Error.captureStackTrace(this, ValidationError);
  }
  toString() {
    const original = super.toString();
    if (!this.fields) return original; // no custom validation
    return `${original}\nIssues:${serializeIssues(this.fields)}`;
  }
}

exports.ValidationError = ValidationError;
class NotFoundError extends Error {
  constructor(message = 'Not Found', status = codes.notFound) {
    super(message);
    this.message = message;
    this.status = status;
    Error.captureStackTrace(this, NotFoundError);
  }
  toString() {
    return `${super.toString()} (HTTP ${this.status})`;
  }
}
exports.NotFoundError = NotFoundError;