import { Router } from 'express'
import { requireAuth, requireRole } from '../../middlewares/auth.js'
import { listRecords, createRecord } from './records.controller.js'

const router = Router()

router.get('/', requireAuth, listRecords)
router.post('/', requireAuth, requireRole('admin','operator'), createRecord)

export default router
