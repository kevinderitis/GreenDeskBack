import { z } from 'zod'
import { ok, fail } from '../../utils/response.js'
import { Product } from '../../models/Product.js'
import { paginate } from '../../utils/paginate.js'

const createSchema = z.object({
  name: z.string().min(3).max(80),
  sku: z.string().min(1),
  category: z.string().optional(),
  unit: z.string().optional(),
  currentStock: z.number().min(0).default(0),
  reorderPoint: z.number().min(0).default(0),
  locations: z.array(z.string()).default([]),
  cost: z.number().min(0).default(0),
  price: z.number().min(0).default(0),
  active: z.boolean().default(true)
})

export async function listProducts (req, res) {
  const { page=1, limit=25, search, category, location, status, sortBy='createdAt', sortDir='desc' } = req.query
  const q = { deletedAt: null }
  if (search) q.$or = [{ name: new RegExp(search, 'i') }, { sku: new RegExp(search, 'i') }]
  if (category) q.category = category
  if (location) q.locations = location
  if (status === 'active') q.active = true
  if (status === 'inactive') q.active = false
  if (status === 'low_stock') q.$expr = { $lt: ['$currentStock', '$reorderPoint'] }
  const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 }
  const data = await paginate(Product, q, { page, limit, sort })
  return ok(res, data)
}

export async function getProduct (req, res) {
  const prod = await Product.findOne({ _id: req.params.id, deletedAt: null })
  if (!prod) return fail(res, 'NOT_FOUND', 'Product not found', 404)
  return ok(res, prod)
}

export async function createProduct (req, res) {
  try {
    const payload = createSchema.parse(req.body)
    const exists = await Product.findOne({ sku: payload.sku, deletedAt: null })
    if (exists) return fail(res, 'CONFLICT', 'Duplicate SKU', 409)
    const prod = await Product.create(payload)
    return ok(res, prod, 201)
  } catch (e) {
    return fail(res, 'VALIDATION_ERROR', e.message, 400)
  }
}

export async function updateProduct (req, res) {
  try {
    const payload = createSchema.partial().parse(req.body)
    const prod = await Product.findOneAndUpdate({ _id: req.params.id, deletedAt: null }, { $set: payload }, { new: true })
    if (!prod) return fail(res, 'NOT_FOUND', 'Product not found', 404)
    return ok(res, prod)
  } catch (e) {
    return fail(res, 'VALIDATION_ERROR', e.message, 400)
  }
}

export async function deleteProduct (req, res) {
  const prod = await Product.findOneAndUpdate({ _id: req.params.id, deletedAt: null }, { $set: { deletedAt: new Date() } })
  if (!prod) return fail(res, 'NOT_FOUND', 'Product not found', 404)
  return ok(res, null)
}

export async function lowStock (req, res) {
  const list = await Product.find({ deletedAt: null, $expr: { $lt: ['$currentStock', '$reorderPoint'] } })
  return ok(res, list)
}
