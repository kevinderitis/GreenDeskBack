import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 80, index: true },
  sku: { type: String, required: true, unique: true, index: true },
  category: { type: String, default: 'general', index: true },
  unit: { type: String, default: 'unit' },
  currentStock: { type: Number, default: 0, min: 0 },
  reorderPoint: { type: Number, default: 0, min: 0 },
  locations: [{ type: String }],
  cost: { type: Number, default: 0, min: 0 },
  price: { type: Number, default: 0, min: 0 },
  active: { type: Boolean, default: true },
  deletedAt: { type: Date, default: null }
}, { timestamps: true })

export const Product = mongoose.model('Product', ProductSchema)
