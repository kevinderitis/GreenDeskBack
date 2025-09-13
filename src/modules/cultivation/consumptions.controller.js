import { z } from 'zod'
import mongoose from 'mongoose'
import { ok, fail } from '../../utils/response.js'
import { Consumption } from '../../models/Consumption.js'
import { CultivationLot } from '../../models/CultivationLot.js'
import { Product } from '../../models/Product.js'
import { paginate } from '../../utils/paginate.js'

const schema = z.object({
  lotId: z.string(),
  productId: z.string(),
  quantity: z.number(),
  unit: z.string().min(1)
})

export async function listConsumptions (req, res) {
  const { page=1, limit=25, lotId, sortBy='createdAt', sortDir='desc' } = req.query
  const q = {}
  if (lotId) q.lotId = lotId
  const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 }
  const data = await paginate(Consumption, q, { page, limit, sort })
  return ok(res, data)
}

export async function createConsumption (req, res) {
  try {
    const payload = schema.parse(req.body)
    const session = await mongoose.startSession()
    let saved
    await session.withTransaction(async () => {
      const lot = await CultivationLot.findById(payload.lotId).session(session)
      if (!lot) throw new Error('Lot not found')
      const prod = await Product.findById(payload.productId).session(session)
      if (!prod) throw new Error('Product not found')
      if (prod.currentStock < payload.quantity) throw new Error('INSUFFICIENT_STOCK')
      prod.currentStock = prod.currentStock - payload.quantity
      await prod.save({ session })
      saved = await Consumption.create([{
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
    if (e.message === 'Lot not found') return fail(res, 'NOT_FOUND', 'Lot not found', 404)
    return fail(res, 'VALIDATION_ERROR', e.message, 400)
  }
}
