import mongoose from 'mongoose'

const CultivationRecordSchema = new mongoose.Schema({
  lotId: { type: mongoose.Types.ObjectId, ref: 'CultivationLot', required: true, index: true },
  type: { type: String, enum: ['watering','fertilization','pruning','health','reading'], required: true },
  values: { type: Object, default: {} },
  attachments: [{ type: String }],
  date: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

export const CultivationRecord = mongoose.model('CultivationRecord', CultivationRecordSchema)
