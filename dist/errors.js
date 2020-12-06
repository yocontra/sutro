"use strict";

exports.__esModule = true;
exports.NotFoundError = exports.ValidationError = exports.BadRequestError = exports.UnauthorizedError = exports.codes = void 0;

var _util = require("util");

const inspectOptions = {
  depth: 100,
  breakLength: Infinity
};

function _ref(f) {
  return `\n - ${(0, _util.inspect)(f, inspectOptions)}`;
}

const serializeIssues = fields => fields.map(_ref);

const codes = {
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  serverError: 500
};
exports.codes = codes;

class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized', status = codes.unauthorized) {
    super(message);

    this.toString = () => `${super.toString()} (HTTP ${this.status})`;

    this.message = message;
    this.status = status;
    Error.captureStackTrace(this, UnauthorizedError);
  }

}

exports.UnauthorizedError = UnauthorizedError;

class BadRequestError extends Error {
  constructor(message = 'Bad Request', status = codes.badRequest) {
    super(message);

    this.toString = () => `${super.toString()} (HTTP ${this.status})`;

    this.message = message;
    this.status = status;
    Error.captureStackTrace(this, BadRequestError);
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

    this.toString = () => `${super.toString()} (HTTP ${this.status})`;

    this.message = message;
    this.status = status;
    Error.captureStackTrace(this, NotFoundError);
  }

}

exports.NotFoundError = NotFoundError;