import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin','operator','sales','readonly'], default: 'readonly', index: true },
  avatar: { type: String },
  deletedAt: { type: Date, default: null }
}, { timestamps: true })

export const User = mongoose.model('User', UserSchema)
