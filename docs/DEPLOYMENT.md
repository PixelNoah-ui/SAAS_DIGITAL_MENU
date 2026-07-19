# Deployment Guide

## Frontend Deployment

The frontend is a Next.js application and is compatible with Vercel deployment. The live demo URL is currently hosted at https://pixelshops.vercel.app/.

### Recommended steps

1. Set the frontend environment variable:
   - `NEXT_PUBLIC_API_URL=<backend-url>`
2. Build the app:
   - `cd frontend && npm run build`
3. Deploy to Vercel or another Node.js-compatible host.

## Backend Deployment

The backend is an Express + TypeScript service that can be deployed to any Node.js host with PostgreSQL access.

### Recommended steps

1. Build the backend:
   - `cd backend && npm run build`
2. Start the compiled server:
   - `node dist/server.js`
3. Set production environment variables from [.env.example](../.env.example).

## Database

The repository expects a PostgreSQL database. Configure the connection string in `DATABASE_URL` and run:

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

## Environment Variables for Production

Required variables include:

- `DATABASE_URL`
- `JWT_SECRET`
- `NODE_ENV=production`
- `PORT`
- `CLIENT_URL`
- `FRONTEND_URL`
- `EMAIL_HOST`, `EMAIL_USERNAME`, `EMAIL_PASSWORD`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## Production Build Notes

- The server uses `dist/server.js` after TypeScript compilation.
- The frontend should be built before deployment.
- The backend relies on the database and external mail/storage services being configured correctly.
