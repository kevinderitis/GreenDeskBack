import { z } from 'zod'
import mongoose from 'mongoose'
import { ok, fail } from '../../utils/response.js'
import { StockMovement } from '../../models/StockMovement.js'
import { Product } from '../../models/Product.js'
import { paginate } from '../../utils/paginate.js'

const createSchema = z.object({
  type: z.enum(['in','out','adjustment']),
  productId: z.string(),
  quantity: z.number(),
  reason: z.string().optional(),
  location: z.string().optional(),
  reference: z.string().optional()
})

export async function listMovements (req, res) {
  const { page=1, limit=25, search, dateFrom, dateTo, sortBy='createdAt', sortDir='desc' } = req.query
  const q = {}
  if (search) q.$or = [{ productName: new RegExp(search, 'i') }, { reference: new RegExp(search, 'i') }]
  if (dateFrom || dateTo) {
    q.date = {}
    if (dateFrom) q.date.$gte = new Date(dateFrom)
    if (dateTo) q.date.$lte = new Date(dateTo)
  }
  const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 }
  const data = await paginate(StockMovement, q, { page, limit, sort })
  return ok(res, data)
}

export async function createMovement (req, res) {
  try {
    const payload = createSchema.parse(req.body)
    const session = await mongoose.startSession()
    let saved
    await session.withTransaction(async () => {
      const prod = await Product.findById(payload.productId).session(session)
      if (!prod) throw new Error('Product not found')
      const before = prod.currentStock
      if (payload.type === 'in') prod.currentStock = before + payload.quantity
      else if (payload.type === 'out') {
        if (before < payload.quantity) throw new Error('INSUFFICIENT_STOCK')
        prod.currentStock = before - payload.quantity
      } else if (payload.type === 'adjustment') {
        prod.currentStock = Math.max(0, payload.quantity)
      }
      await prod.save({ session })
      saved = await StockMovement.create([{
        ...payload,
        productName: prod.name,
        createdBy: req.user?.id
      }], { session })
      saved = saved[0]
    })
    session.endSession()
    return ok(res, saved, 201)
  } catch (e) {
    if (e.message === 'INSUFFICIENT_STOCK') return fail(res, 'INSUFFICIENT_STOCK', 'Not enough stock', 400)
    if (e.message === 'Product not found') return fail(res, 'NOT_FOUND', 'Product not found', 404)
    return fail(res, 'VALIDATION_ERROR', e.message, 400)
  }
}
