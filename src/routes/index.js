import { Router } from 'express'
import authRoutes from '../modules/auth/auth.routes.js'
import productsRoutes from '../modules/stock/products.routes.js'
import movementsRoutes from '../modules/stock/movements.routes.js'
import clientsRoutes from '../modules/clients/clients.routes.js'
import lotsRoutes from '../modules/cultivation/lots.routes.js'
import recordsRoutes from '../modules/cultivation/records.routes.js'
import consumptionsRoutes from '../modules/cultivation/consumptions.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/stock/products', productsRoutes)
router.use('/stock/movements', movementsRoutes)
router.use('/clients', clientsRoutes)
router.use('/cultivation/lots', lotsRoutes)
router.use('/cultivation/records', recordsRoutes)
router.use('/cultivation/consumptions', consumptionsRoutes)

export default router
