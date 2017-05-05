export const codes = {
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  serverError: 500
}

export class BadRequestError extends Error {
  constructor(message, status) {
    super(message)
    this.message = message
    this.status = status || codes.badRequest
  }
}

export class NotFoundError extends Error {
  constructor(message, status) {
    super(message)
    this.message = message
    this.status = status || codes.notFound
  }
}
