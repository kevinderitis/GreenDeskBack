# GreenDesk Backend API

API para GreenDesk con Express + MongoDB (Atlas) + JWT (access/refresh), RBAC y validaciones con Zod.

## Quick Start (Local)
```bash
npm install
cp .env.example .env
# Edita MONGODB_URI y secretos JWT
npm run dev
```

Base URL local: `http://localhost:4000/api/v1`

## Deploy en Heroku
```bash
heroku login
heroku create greendesk-api
heroku config:set NODE_ENV=production BASE_PATH=/api/v1 SESSION_COOKIE=sid COOKIE_SECURE=true
heroku config:set MONGODB_URI="mongodb+srv://..." JWT_ACCESS_SECRET="..." JWT_REFRESH_SECRET="..."
heroku config:set JWT_ACCESS_EXPIRES="15m" JWT_REFRESH_EXPIRES="30d"
git init && git add . && git commit -m "deploy"
heroku git:remote -a greendesk-api
git push heroku HEAD:main
```
