import mongoose from 'mongoose'

const CashTransactionSchema = new mongoose.Schema({
  kind: { type: String, enum: ['deposit','withdraw','transfer'], required: true, index: true },
  accountId: { type: mongoose.Types.ObjectId, ref: 'Account', required: true, index: true },
  toAccountId: { type: mongoose.Types.ObjectId, ref: 'Account' }, // solo para transfer
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD' },
  reference: { type: String },
  category: { type: String },     // ej: sale|purchase|expense|income
  counterparty: { type: String }, // opcional: cliente/proveedor
  date: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

export const CashTransaction = mongoose.model('CashTransaction', CashTransactionSchema)