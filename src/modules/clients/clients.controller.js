import { z } from 'zod'
import { ok, fail } from '../../utils/response.js'
import { Client } from '../../models/Client.js'
import { paginate } from '../../utils/paginate.js'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  notes: z.string().optional()
})

export async function listClients (req, res) {
  const { page=1, limit=25, search, sortBy='createdAt', sortDir='desc' } = req.query
  const q = { deletedAt: null }
  if (search) q.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }, { phone: new RegExp(search, 'i') }]
  const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 }
  const data = await paginate(Client, q, { page, limit, sort })
  return ok(res, data)
}

export async function getClient (req, res) {
  const doc = await Client.findOne({ _id: req.params.id, deletedAt: null })
  if (!doc) return fail(res, 'NOT_FOUND', 'Client not found', 404)
  return ok(res, doc)
}

export async function createClient (req, res) {
  try {
    const payload = schema.parse(req.body)
    const doc = await Client.create(payload)
    return ok(res, doc, 201)
  } catch (e) {
    return fail(res, 'VALIDATION_ERROR', e.message, 400)
  }
}

export async function updateClient (req, res) {
  try {
    const payload = schema.partial().parse(req.body)
    const doc = await Client.findOneAndUpdate({ _id: req.params.id, deletedAt: null }, { $set: payload }, { new: true })
    if (!doc) return fail(res, 'NOT_FOUND', 'Client not found', 404)
    return ok(res, doc)
  } catch (e) {
    return fail(res, 'VALIDATION_ERROR', e.message, 400)
  }
}

export async function deleteClient (req, res) {
  const doc = await Client.findOneAndUpdate({ _id: req.params.id, deletedAt: null }, { $set: { deletedAt: new Date() } })
  if (!doc) return fail(res, 'NOT_FOUND', 'Client not found', 404)
  return ok(res, null)
}
