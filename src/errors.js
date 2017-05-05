export const codes = {
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  serverError: 500
}

export class BadRequestError extends Error {
  constructor(message='Bad Request', status=codes.badRequest) {
    super(message)
    this.message = message
    this.status = status
  }
}

export class NotFoundError extends Error {
  constructor(message='Not Found', status=codes.notFound) {
    super(message)
    this.message = message
    this.status = status
  }
}
