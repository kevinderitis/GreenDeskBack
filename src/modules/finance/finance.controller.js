import { z } from 'zod'
import mongoose from 'mongoose'
import { ok, fail } from '../../utils/response.js'
import { paginate } from '../../utils/paginate.js'
import { Account } from '../../models/Account.js'
import { CashTransaction } from '../../models/CashTransaction.js'

// Schemas
const accountSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['cash','bank','wallet']).default('cash'),
  currency: z.string().default('USD'),
  active: z.boolean().default(true)
})

const baseTx = {
  accountId: z.string(),
  amount: z.number().positive(),
  currency: z.string().optional(),
  reference: z.string().optional(),
  category: z.string().optional(),
  counterparty: z.string().optional()
}
const depositSchema = z.object(baseTx)
const withdrawSchema = z.object(baseTx)

const transferSchema = z.object({
  fromAccountId: z.string(),
  toAccountId: z.string(),
  amount: z.number().positive(),
  currency: z.string().optional(),
  reference: z.string().optional(),
  category: z.string().optional()
})

// Accounts
export async function listAccounts (_req, res) {
  const docs = await Account.find({})
  return ok(res, docs)
}
export async function createAccount (req, res) {
  try {
    const payload = accountSchema.parse(req.body)
    const exists = await Account.findOne({ name: payload.name })
    if (exists) return fail(res, 'CONFLICT', 'Account already exists', 409)
    const doc = await Account.create(payload)
    return ok(res, doc, 201)
  } catch (e) {
    return fail(res, 'VALIDATION_ERROR', e.message, 400)
  }
}

// Balance
export async function getBalance (_req, res) {
  const accounts = await Account.find({ active: true })
  const total = accounts.reduce((sum, a) => sum + a.balance, 0)
  return ok(res, { total, accounts })
}

// Listado de transacciones
export async function listTransactions (req, res) {
  const { page=1, limit=25, accountId, kind, dateFrom, dateTo, search, sortBy='date', sortDir='desc' } = req.query
  const q = {}
  if (accountId) q.accountId = accountId
  if (kind) q.kind = kind
  if (dateFrom || dateTo) {
    q.date = {}
    if (dateFrom) q.date.$gte = new Date(dateFrom)
    if (dateTo) q.date.$lte = new Date(dateTo)
  }
  if (search) q.$or = [{ reference: new RegExp(search, 'i') }, { category: new RegExp(search, 'i') }, { counterparty: new RegExp(search, 'i') }]
  const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 }
  const data = await paginate(CashTransaction, q, { page, limit, sort })
  return ok(res, data)
}

// Mutaciones
export async function deposit (req, res) {
  try {
    const payload = depositSchema.parse(req.body)
    const session = await mongoose.startSession()
    let saved
    await session.withTransaction(async () => {
      const acc = await Account.findById(payload.accountId).session(session)
      if (!acc) throw new Error('Account not found')
      acc.balance = acc.balance + payload.amount
      await acc.save({ session })
      saved = (await CashTransaction.create([{
        kind: 'deposit',
        accountId: acc._id,
        amount: payload.amount,
        currency: payload.currency || acc.currency,
        reference: payload.reference,
        category: payload.category,
        counterparty: payload.counterparty,
        createdBy: req.user?.id
      }], { session }))[0]
    })
    session.endSession()
    return ok(res, saved, 201)
  } catch (e) {
    if (e.message === 'Account not found') return fail(res, 'NOT_FOUND', 'Account not found', 404)
    return fail(res, 'VALIDATION_ERROR', e.message, 400)
  }
}

export async function withdraw (req, res) {
  try {
    const payload = withdrawSchema.parse(req.body)
    const session = await mongoose.startSession()
    let saved
    await session.withTransaction(async () => {
      const acc = await Account.findById(payload.accountId).session(session)
      if (!acc) throw new Error('Account not found')
      if (acc.balance < payload.amount) throw new Error('INSUFFICIENT_FUNDS')
      acc.balance = acc.balance - payload.amount
      await acc.save({ session })
      saved = (await CashTransaction.create([{
        kind: 'withdraw',
        accountId: acc._id,
        amount: payload.amount,
        currency: payload.currency || acc.currency,
        reference: payload.reference,
        category: payload.category,
        counterparty: payload.counterparty,
        createdBy: req.user?.id
      }], { session }))[0]
    })
    session.endSession()
    return ok(res, saved, 201)
  } catch (e) {
    if (e.message === 'INSUFFICIENT_FUNDS') return fail(res, 'INSUFFICIENT_FUNDS', 'Not enough balance', 400)
    if (e.message === 'Account not found') return fail(res, 'NOT_FOUND', 'Account not found', 404)
    return fail(res, 'VALIDATION_ERROR', e.message, 400)
  }
}

export async function transfer (req, res) {
  try {
    const payload = transferSchema.parse(req.body)
    const session = await mongoose.startSession()
    let savedOut, savedIn
    await session.withTransaction(async () => {
      const from = await Account.findById(payload.fromAccountId).session(session)
      const to = await Account.findById(payload.toAccountId).session(session)
      if (!from || !to) throw new Error('Account not found')
      if (from._id.equals(to._id)) throw new Error('SAME_ACCOUNT')
      if (from.balance < payload.amount) throw new Error('INSUFFICIENT_FUNDS')

      from.balance -= payload.amount
      to.balance += payload.amount
      await from.save({ session })
      await to.save({ session })

      savedOut = (await CashTransaction.create([{
        kind: 'transfer',
        accountId: from._id,
        toAccountId: to._id,
        amount: payload.amount,
        currency: payload.currency || from.currency,
        reference: payload.reference,
        category: payload.category || 'transfer_out',
        createdBy: req.user?.id
      }], { session }))[0]

      savedIn = (await CashTransaction.create([{
        kind: 'transfer',
        accountId: to._id,
        toAccountId: from._id,
        amount: payload.amount,
        currency: payload.currency || to.currency,
        reference: payload.reference,
        category: payload.category || 'transfer_in',
        createdBy: req.user?.id
      }], { session }))[0]
    })
    session.endSession()
    return ok(res, { out: savedOut, in: savedIn }, 201)
  } catch (e) {
    if (e.message === 'INSUFFICIENT_FUNDS') return fail(res, 'INSUFFICIENT_FUNDS', 'Not enough balance', 400)
    if (e.message === 'Account not found') return fail(res, 'NOT_FOUND', 'Account not found', 404)
    if (e.message === 'SAME_ACCOUNT') return fail(res, 'VALIDATION_ERROR', 'Source and target accounts must differ', 400)
    return fail(res, 'VALIDATION_ERROR', e.message, 400)
  }
}