import dotenv from 'dotenv'
dotenv.config()

export const ENV = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parseInt(process.env.PORT ?? '4000', 10),
  BASE_PATH: process.env.BASE_PATH ?? '/api/v1',
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? '*',
  MONGODB_URI: process.env.MONGODB_URI ?? '',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? 'change_me_access',
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES ?? '15m',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? 'change_me_refresh',
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES ?? '30d',
  SESSION_COOKIE: process.env.SESSION_COOKIE ?? 'sid',
  COOKIE_SECURE: (process.env.COOKIE_SECURE ?? 'false') === 'true'
}
