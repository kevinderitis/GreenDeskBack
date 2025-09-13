import { Router } from 'express'
import { requireAuth, requireRole } from '../../middlewares/auth.js'
import { listLots, getLot, createLot, updateLot, updateLotStage, deleteLot } from './lots.controller.js'

const router = Router()

router.get('/', requireAuth, listLots)
router.get('/:id', requireAuth, getLot)
router.post('/', requireAuth, requireRole('admin','operator'), createLot)
router.put('/:id', requireAuth, requireRole('admin','operator'), updateLot)
router.put('/:id/stage', requireAuth, requireRole('admin','operator'), updateLotStage)
router.delete('/:id', requireAuth, requireRole('admin'), deleteLot)

export default router
