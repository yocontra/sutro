export const codes = {
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  serverError: 500
}

export class UnauthorizedError extends Error {
  constructor(message='Unauthorized', status=codes.unauthorized) {
    super(message)
    this.message = message
    this.status = status
  }
}

export class BadRequestError extends Error {
  constructor(message='Bad Request', status=codes.badRequest) {
    super(message)
    this.message = message
    this.status = status
  }
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
  }
}

export class NotFoundError extends Error {
  constructor(message='Not Found', status=codes.notFound) {
    super(message)
    this.message = message
    this.status = status
  }
}
