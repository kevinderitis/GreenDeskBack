import mongoose from 'mongoose'

const RefreshTokenSchema = new mongoose.Schema({
  jti: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true, index: true },
  valid: { type: Boolean, default: true },
  expiresAt: { type: Date, required: true }
}, { timestamps: true })

export const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema)
