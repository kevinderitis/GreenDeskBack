import mongoose from 'mongoose'

const ConsumptionSchema = new mongoose.Schema({
  lotId: { type: mongoose.Types.ObjectId, ref: 'CultivationLot', required: true, index: true },
  productId: { type: mongoose.Types.ObjectId, ref: 'Product', required: true, index: true },
  productName: { type: String },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'unit' },
  date: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

export const Consumption = mongoose.model('Consumption', ConsumptionSchema)
