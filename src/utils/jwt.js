import jwt from 'jsonwebtoken'
import { ENV } from '../config/env.js'

export function signAccess (payload) {
  return jwt.sign(payload, ENV.JWT_ACCESS_SECRET, { expiresIn: ENV.JWT_ACCESS_EXPIRES })
}
export function signRefresh (payload) {
  return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, { expiresIn: ENV.JWT_REFRESH_EXPIRES })
}
export function verifyAccess (token) {
  return jwt.verify(token, ENV.JWT_ACCESS_SECRET)
}
export function verifyRefresh (token) {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET)
}
