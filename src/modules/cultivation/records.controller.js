import { z } from 'zod'
import { ok, fail } from '../../utils/response.js'
import { CultivationRecord } from '../../models/CultivationRecord.js'
import { CultivationLot } from '../../models/CultivationLot.js'
import { paginate } from '../../utils/paginate.js'

const schema = z.object({
  lotId: z.string(),
  type: z.enum(['watering','fertilization','pruning','health','reading']),
  values: z.record(z.any()).default({}),
  attachments: z.array(z.string().url()).optional()
})

export async function listRecords (req, res) {
  const { page=1, limit=25, lotId, dateFrom, dateTo, sortBy='createdAt', sortDir='desc' } = req.query
  const q = {}
  if (lotId) q.lotId = lotId
  if (dateFrom || dateTo) {
    q.date = {}
    if (dateFrom) q.date.$gte = new Date(dateFrom)
    if (dateTo) q.date.$lte = new Date(dateTo)
  }
  const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 }
  const data = await paginate(CultivationRecord, q, { page, limit, sort })
  return ok(res, data)
}

export async function createRecord (req, res) {
  try {
    const payload = schema.parse(req.body)
    const lot = await CultivationLot.findById(payload.lotId)
    if (!lot) return fail(res, 'NOT_FOUND', 'Lot not found', 404)
    const doc = await CultivationRecord.create({ ...payload, createdBy: req.user?.id })
    return ok(res, doc, 201)
  } catch (e) {
    return fail(res, 'VALIDATION_ERROR', e.message, 400)
  }
}
