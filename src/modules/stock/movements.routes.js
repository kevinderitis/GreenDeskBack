import { Router } from 'express'
import { requireAuth, requireRole } from '../../middlewares/auth.js'
import { listMovements, createMovement } from './movements.controller.js'

const router = Router()

router.get('/', requireAuth, listMovements)
router.post('/', requireAuth, requireRole('admin','operator'), createMovement)

export default router
