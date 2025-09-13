import { Router } from 'express'
import { requireAuth, requireRole } from '../../middlewares/auth.js'
import { listClients, getClient, createClient, updateClient, deleteClient } from './clients.controller.js'

const router = Router()

router.get('/', requireAuth, listClients)
router.get('/:id', requireAuth, getClient)
router.post('/', requireAuth, requireRole('admin','sales'), createClient)
router.put('/:id', requireAuth, requireRole('admin','sales'), updateClient)
router.delete('/:id', requireAuth, requireRole('admin'), deleteClient)

export default router
