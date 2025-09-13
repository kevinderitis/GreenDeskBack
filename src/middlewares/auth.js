import { verifyAccess } from '../utils/jwt.js'

export async function requireAuth (req, res, next) {
  try {
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) return res.status(401).json({ ok: false, error: { code:'UNAUTHORIZED', message:'Authentication required' } })
    const payload = verifyAccess(token)
    req.user = { id: payload.sub, role: payload.role, email: payload.email, name: payload.name }
    next()
  } catch (e) {
    return res.status(401).json({ ok:false, error:{ code:'TOKEN_EXPIRED', message:'Invalid or expired token' }})
  }
}

export function requireRole (...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ ok:false, error:{ code:'UNAUTHORIZED', message:'Authentication required' }})
    if (!roles.includes(req.user.role)) return res.status(403).json({ ok:false, error:{ code:'FORBIDDEN', message:'Insufficient permissions' }})
    next()
  }
}
