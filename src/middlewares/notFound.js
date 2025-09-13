import { fail } from '../utils/response.js'
export function notFound (_req, res, _next) {
  return fail(res, 'NOT_FOUND', 'Not Found', 404)
}
