import mongoose from 'mongoose'
import { ENV } from './env.js'

export async function connectDB () {
  if (!ENV.MONGODB_URI) {
    console.warn('[db] MONGODB_URI is empty')
  }
  mongoose.set('strictQuery', true)
  await mongoose.connect(ENV.MONGODB_URI, { autoIndex: true })
  console.log('[db] connected')
  return mongoose.connection
}
