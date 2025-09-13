import mongoose from 'mongoose'

const CultivationLotSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, index: true },
  species: { type: String, required: true },
  variety: { type: String },
  location: { type: String },
  startDate: { type: Date, required: true },
  currentStage: { type: String, enum: ['seedling','vegetative','flowering','harvest','drying','cured'], required: true },
  stageChangeDate: { type: Date },
  responsible: { type: String },
  notes: { type: String },
  deletedAt: { type: Date, default: null }
}, { timestamps: true })

export const CultivationLot = mongoose.model('CultivationLot', CultivationLotSchema)
