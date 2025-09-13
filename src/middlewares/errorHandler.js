import { fail } from '../utils/response.js'
export function errorHandler (err, _req, res, _next) {
  const status = err.status || 500
  const code = err.code || 'INTERNAL_ERROR'
  const message = err.message || 'Internal Server Error'
  if (process.env.NODE_ENV !== 'production') console.error('[errorHandler]', err)
  return fail(res, code, message, status)
}
