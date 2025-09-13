import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { ENV } from './config/env.js'
import apiRoutes from './routes/index.js'

const app = express()
app.use(helmet())
app.use(cors({ origin: ENV.CORS_ORIGIN.split(','), credentials: true }))
app.use(compression())
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use(morgan('dev'))

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
app.use(limiter)

app.get('/', (_req, res) => res.json({ ok: true, name: 'greendesk-api' }))

app.use(ENV.BASE_PATH, apiRoutes)

export default app
