# Railway Deployment Checklist

## Pre-deployment

- [ ] Test aplikasi lokal dengan `npm run dev`
- [ ] Build berhasil dengan `npm run build`
- [ ] Test production mode dengan `npm run start`
- [ ] Semua environment variables sudah dicatat
- [ ] Database Supabase sudah ready

## Railway Setup

- [ ] Project created di Railway
- [ ] Repository connected
- [ ] Root directory set ke `backend`
- [ ] Environment variables sudah di-set lengkap
- [ ] Domain generated

## Post-deployment

- [ ] Health check endpoint response 200 OK
- [ ] Test API endpoints via Postman/Thunder Client
- [ ] Check logs untuk errors
- [ ] Update frontend dengan backend URL baru
- [ ] Monitor metrics (CPU, Memory, Network)

## Production Ready

- [ ] CORS origin set ke frontend production domain
- [ ] JWT secret menggunakan random secure key
- [ ] Rate limiting configured properly
- [ ] Database indexes sudah optimal
- [ ] Backup strategy di Supabase

## Environment Variables Template

Copy paste ini ke Railway Variables:

```
NODE_ENV=production
PORT=${{PORT}}
DATABASE_URL=your-supabase-connection-string
JWT_SECRET=your-generated-secret-here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
