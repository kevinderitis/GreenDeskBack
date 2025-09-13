import { z } from 'zod'
import { ok, fail } from '../../utils/response.js'
import { CultivationLot } from '../../models/CultivationLot.js'
import { paginate } from '../../utils/paginate.js'

const schema = z.object({
  code: z.string().min(1),
  species: z.string().min(1),
  variety: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string(),
  currentStage: z.enum(['seedling','vegetative','flowering','harvest','drying','cured']),
  responsible: z.string().optional(),
  notes: z.string().optional()
})

export async function listLots (req, res) {
  const { page=1, limit=25, search, stage, sortBy='createdAt', sortDir='desc' } = req.query
  const q = { deletedAt: null }
  if (search) q.$or = [{ code: new RegExp(search, 'i') }, { species: new RegExp(search, 'i') }, { variety: new RegExp(search, 'i') }]
  if (stage) q.currentStage = stage
  const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 }
  const data = await paginate(CultivationLot, q, { page, limit, sort })
  return ok(res, data)
}

export async function getLot (req, res) {
  const doc = await CultivationLot.findOne({ _id: req.params.id, deletedAt: null })
  if (!doc) return fail(res, 'NOT_FOUND', 'Lot not found', 404)
  return ok(res, doc)
}

export async function createLot (req, res) {
  try {
    const payload = schema.parse(req.body)
    const exists = await CultivationLot.findOne({ code: payload.code, deletedAt: null })
    if (exists) return fail(res, 'CONFLICT', 'Duplicate code', 409)
    const doc = await CultivationLot.create({ ...payload, startDate: new Date(payload.startDate), stageChangeDate: new Date() })
    return ok(res, doc, 201)
  } catch (e) {
    return fail(res, 'VALIDATION_ERROR', e.message, 400)
  }
}

export async function updateLot (req, res) {
  try {
    const payload = schema.partial().parse(req.body)
    if (payload.startDate) payload.startDate = new Date(payload.startDate)
    const doc = await CultivationLot.findOneAndUpdate({ _id: req.params.id, deletedAt: null }, { $set: payload }, { new: true })
    if (!doc) return fail(res, 'NOT_FOUND', 'Lot not found', 404)
    return ok(res, doc)
  } catch (e) {
    return fail(res, 'VALIDATION_ERROR', e.message, 400)
  }
}

export async function updateLotStage (req, res) {
  try {
    const payload = z.object({ stage: z.enum(['seedling','vegetative','flowering','harvest','drying','cured']) }).parse(req.body)
    const doc = await CultivationLot.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { $set: { currentStage: payload.stage, stageChangeDate: new Date() } },
      { new: true }
    )
    if (!doc) return fail(res, 'NOT_FOUND', 'Lot not found', 404)
    return ok(res, doc)
  } catch (e) {
    return fail(res, 'VALIDATION_ERROR', e.message, 400)
  }
}

export async function deleteLot (req, res) {
  const doc = await CultivationLot.findOneAndUpdate({ _id: req.params.id, deletedAt: null }, { $set: { deletedAt: new Date() } })
  if (!doc) return fail(res, 'NOT_FOUND', 'Lot not found', 404)
  return ok(res, null)
}
