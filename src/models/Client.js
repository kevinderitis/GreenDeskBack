import mongoose from 'mongoose'

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  notes: { type: String },
  deletedAt: { type: Date, default: null }
}, { timestamps: true })

export const Client = mongoose.model('Client', ClientSchema)
