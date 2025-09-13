import mongoose from 'mongoose'

const StockMovementSchema = new mongoose.Schema({
  type: { type: String, enum: ['in','out','adjustment'], required: true },
  productId: { type: mongoose.Types.ObjectId, ref: 'Product', required: true, index: true },
  productName: { type: String },
  quantity: { type: Number, required: true },
  reason: { type: String },
  location: { type: String },
  reference: { type: String },
  date: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

export const StockMovement = mongoose.model('StockMovement', StockMovementSchema)
