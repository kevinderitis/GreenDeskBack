import { z } from 'zod'
import { ok, fail } from '../../utils/response.js'
import { createUser, validateCredentials, tokensForUser, storeRefresh, refreshTokens, invalidateRefresh } from './auth.service.js'
import { ENV } from '../../config/env.js'

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) })
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin','operator','sales','readonly']).default('operator')
})

export async function postLogin (req, res) {
  try {
    const { email, password } = loginSchema.parse(req.body)
    const user = await validateCredentials({ email, password })
    if (!user) return fail(res, 'INVALID_CREDENTIALS', 'Login failed', 401)
    const { access, refresh, jti, expiresAt } = tokensForUser(user)
    await storeRefresh({ jti, userId: user.id, expiresAt })
    setRefreshCookie(res, refresh)
    return ok(res, { user: sanitizeUser(user), token: access })
  } catch (e) {
    return fail(res, 'VALIDATION_ERROR', e.message, 400)
  }
}

export async function postRegister (req, res) {
  try {
    const { name, email, password, role } = registerSchema.parse(req.body)
    const user = await createUser({ name, email, password, role })
    const { access, refresh, jti, expiresAt } = tokensForUser(user)
    await storeRefresh({ jti, userId: user.id, expiresAt })
    setRefreshCookie(res, refresh)
    return ok(res, { user: sanitizeUser(user), token: access }, 201)
  } catch (e) {
    const msg = e.message.includes('exists') ? 'User already exists' : e.message
    const code = e.message.includes('exists') ? 'CONFLICT' : 'VALIDATION_ERROR'
    const status = e.message.includes('exists') ? 409 : 400
    return fail(res, code, msg, status)
  }
}

export async function postLogout (_req, res) {
  const token = getRefreshCookie(res.req)
  if (token) {
    try {
      const [_, payloadB64] = token.split('.')
      const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'))
      if (payload?.jti) await invalidateRefresh(payload.jti)
    } catch {}
  }
  clearRefreshCookie(res)
  return ok(res, null)
}

export async function getMe (req, res) {
  return ok(res, sanitizeUser(req.user))
}

export async function postRefresh (req, res) {
  try {
    const token = getRefreshCookie(req)
    if (!token) return fail(res, 'UNAUTHORIZED', 'No refresh token', 401)
    const { access, refresh, user } = await refreshTokens(token)
    setRefreshCookie(res, refresh)
    return ok(res, { token: access })
  } catch (e) {
    return fail(res, 'TOKEN_EXPIRED', 'Invalid or expired token', 401)
  }
}

function sanitizeUser (user) {
  if (!user) return null
  const obj = user.toObject ? user.toObject() : user
  return {
    id: obj._id?.toString?.() ?? obj.id,
    email: obj.email,
    name: obj.name,
    role: obj.role,
    avatar: obj.avatar,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  }
}

function setRefreshCookie (res, token) {
  res.cookie(ENV.SESSION_COOKIE, token, {
    httpOnly: true,
    secure: ENV.COOKIE_SECURE,
    sameSite: 'lax',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 30
  })
}
function clearRefreshCookie (res) {
  res.clearCookie(ENV.SESSION_COOKIE, { httpOnly: true, secure: ENV.COOKIE_SECURE, sameSite: 'lax', path: '/' })
}
function getRefreshCookie (req) {
  return req.cookies?.[ENV.SESSION_COOKIE]
}
