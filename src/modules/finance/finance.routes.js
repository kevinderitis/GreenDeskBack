import { Router } from 'express'
import { requireAuth, requireRole } from '../../middlewares/auth.js'
import {
  listAccounts, createAccount, getBalance,
  listTransactions, deposit, withdraw, transfer
} from './finance.controller.js'

const router = Router()

// Accounts
router.get('/accounts', requireAuth, listAccounts)
router.post('/accounts', requireAuth, requireRole('admin'), createAccount)

// Balance
router.get('/balance', requireAuth, getBalance)

// Transactions
router.get('/transactions', requireAuth, listTransactions)
router.post('/transactions/deposit', requireAuth, requireRole('admin','sales'), deposit)
router.post('/transactions/withdraw', requireAuth, requireRole('admin'), withdraw)
router.post('/transactions/transfer', requireAuth, requireRole('admin'), transfer)

export default router