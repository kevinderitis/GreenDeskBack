import { ENV } from './config/env.js'
import app from './app.js'
import { notFound } from './middlewares/notFound.js'
import { errorHandler } from './middlewares/errorHandler.js'
import { connectDB } from './config/db.js'

app.use(notFound)
app.use(errorHandler)

await connectDB()
app.listen(ENV.PORT, () => {
  console.log(`[server] running on port ${ENV.PORT} (env: ${ENV.NODE_ENV})`)
})
