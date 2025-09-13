import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { User } from '../../models/User.js'
import { RefreshToken } from '../../models/RefreshToken.js'
import { signAccess, signRefresh, verifyRefresh } from '../../utils/jwt.js'
import { ENV } from '../../config/env.js'

export async function createUser ({ name, email, password, role='readonly' }) {
  const exists = await User.findOne({ email })
  if (exists) throw new Error('User already exists')
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email, passwordHash, role })
  return user
}

export async function validateCredentials ({ email, password }) {
  const user = await User.findOne({ email, deletedAt: null })
  if (!user) return null
  const ok = await bcrypt.compare(password, user.passwordHash)
  return ok ? user : null
}

export function tokensForUser (user) {
  const jti = crypto.randomUUID()
  const access = signAccess({ sub: user.id, role: user.role, email: user.email, name: user.name, jti })
  const refresh = signRefresh({ sub: user.id, jti })
  const expiresAt = new Date(Date.now() + parseExpiryMs(ENV.JWT_REFRESH_EXPIRES))
  return { access, refresh, jti, expiresAt }
}

export async function storeRefresh ({ jti, userId, expiresAt }) {
  await RefreshToken.create({ jti, userId, expiresAt, valid: true })
}

export async function invalidateRefresh (jti) {
  await RefreshToken.updateOne({ jti }, { $set: { valid: false } })
}

export async function refreshTokens (token) {
  const payload = verifyRefresh(token)
  const doc = await RefreshToken.findOne({ jti: payload.jti, valid: true })
  if (!doc) throw new Error('Invalid refresh')
  const user = await User.findById(doc.userId)
  if (!user) throw new Error('User not found')
  const { access, refresh, jti, expiresAt } = tokensForUser(user)
  // rotate
  await RefreshToken.updateOne({ jti: doc.jti }, { $set: { valid: false } })
  await storeRefresh({ jti, userId: user.id, expiresAt })
  return { access, refresh, user }
}

function parseExpiryMs (exp) {
  // supports m,h,d
  const m = /^([0-9]+)([smhd])$/.exec(exp)
  if (!m) return 1000 * 60 * 60 * 24 * 30
  const n = parseInt(m[1], 10)
  const unit = m[2]
  if (unit === 's') return n * 1000
  if (unit === 'm') return n * 60 * 1000
  if (unit === 'h') return n * 60 * 60 * 1000
  if (unit === 'd') return n * 24 * 60 * 60 * 1000
  return n
}
