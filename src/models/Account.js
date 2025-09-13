import mongoose from 'mongoose'

const AccountSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, index: true },
  type: { type: String, enum: ['cash','bank','wallet'], default: 'cash', index: true },
  currency: { type: String, default: 'USD' },
  balance: { type: Number, default: 0, min: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true })

export const Account = mongoose.model('Account', AccountSchema)