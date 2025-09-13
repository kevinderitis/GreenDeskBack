import { Router } from 'express'
import { postLogin, postRegister, postLogout, getMe, postRefresh } from './auth.controller.js'
import { requireAuth, requireRole } from '../../middlewares/auth.js'

const router = Router()

router.post('/login', postLogin)
router.post('/register', requireAuth, requireRole('admin'), postRegister)
router.post('/logout', requireAuth, postLogout)
router.get('/me', requireAuth, getMe)
router.post('/refresh', postRefresh)

export default router
