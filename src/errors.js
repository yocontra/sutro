import { inspect } from 'util'

const inspectOptions = {
  depth: 100,
  breakLength: Infinity
}

const serializeIssues = (fields) =>
  fields.map((f) => `\n - ${inspect(f, inspectOptions)}`)

export const codes = {
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  serverError: 500
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized', status = codes.unauthorized) {
    super(message)
    this.message = message
    this.status = status
    Error.captureStackTrace(this, UnauthorizedError)
  }
  toString = () => `${super.toString()} (HTTP ${this.status})`;
}

export class BadRequestError extends Error {
  constructor(message = 'Bad Request', status = codes.badRequest) {
    super(message)
    this.message = message
    this.status = status
    Error.captureStackTrace(this, BadRequestError)
  }
  toString = () => `${super.toString()} (HTTP ${this.status})`;
}

export class ValidationError extends BadRequestError {
  constructor(message, fields) {
    super()
    if (message && fields) {
      this.message = message
      this.fields = fields
    }
    if (message && !fields) {
      this.fields = message
    }
    Error.captureStackTrace(this, ValidationError)
  }
  toString() {
    const original = super.toString()
    if (!this.fields) return original // no custom validation
    return `${original}\nIssues:${serializeIssues(this.fields)}`
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Not Found', status = codes.notFound) {
    super(message)
    this.message = message
    this.status = status
    Error.captureStackTrace(this, NotFoundError)
  }
  toString = () => `${super.toString()} (HTTP ${this.status})`;
}
