import { Router } from 'express'
import { requireAuth, requireRole } from '../../middlewares/auth.js'
import { listConsumptions, createConsumption } from './consumptions.controller.js'

const router = Router()

router.get('/', requireAuth, listConsumptions)
router.post('/', requireAuth, requireRole('admin','operator'), createConsumption)

export default router
