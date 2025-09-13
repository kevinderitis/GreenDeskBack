import { Router } from 'express'
import { requireAuth, requireRole } from '../../middlewares/auth.js'
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct, lowStock } from './products.controller.js'

const router = Router()

router.get('/', requireAuth, listProducts)
router.get('/low-stock', requireAuth, lowStock)
router.get('/:id', requireAuth, getProduct)
router.post('/', requireAuth, requireRole('admin','operator'), createProduct)
router.put('/:id', requireAuth, requireRole('admin','operator'), updateProduct)
router.delete('/:id', requireAuth, requireRole('admin'), deleteProduct)

export default router
