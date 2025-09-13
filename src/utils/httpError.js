export class HttpError extends Error {
  constructor (status = 500, code = 'INTERNAL_ERROR', message = 'Internal Server Error') {
    super(message)
    this.status = status
    this.code = code
  }
}
