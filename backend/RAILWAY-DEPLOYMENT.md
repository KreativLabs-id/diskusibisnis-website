# 🚀 Deployment Guide - Railway

Panduan lengkap untuk deploy backend Diskusi Bisnis ke Railway.

## 📋 Prasyarat

- Akun [Railway](https://railway.app)
- Database Supabase yang sudah di-setup
- Git repository yang sudah di-push ke GitHub/GitLab

## 🎯 Langkah-langkah Deployment

### 1. Persiapan Railway

1. Login ke [Railway Dashboard](https://railway.app/dashboard)
2. Klik **"New Project"**
3. Pilih **"Deploy from GitHub repo"**
4. Pilih repository `diskusibisnis-website`
5. Railway akan mendeteksi Dockerfile secara otomatis

### 2. Konfigurasi Service

1. Setelah project dibuat, klik service backend
2. Pilih tab **"Settings"**
3. Pada **"Root Directory"**, set ke: `backend`
4. Pada **"Start Command"**, biarkan kosong (akan menggunakan CMD dari Dockerfile)

### 3. Setup Environment Variables

Di tab **"Variables"**, tambahkan environment variables berikut:

```bash
# Server
NODE_ENV=production
PORT=${{PORT}}  # Railway akan auto-assign port

# Database (dari Supabase)
DATABASE_URL=postgresql://postgres.[YOUR-PROJECT]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres

# JWT
JWT_SECRET=generate-random-secret-minimum-32-characters
JWT_EXPIRES_IN=7d

# CORS (ganti dengan URL frontend production)
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Supabase (dari Dashboard > Project Settings > API)
SUPABASE_URL=https://[YOUR-PROJECT].supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### 🔐 Cara Generate JWT Secret

Jalankan di terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Deploy

1. Railway akan otomatis build dan deploy setelah environment variables di-set
2. Tunggu proses build selesai (~2-5 menit)
3. Jika berhasil, status akan berubah menjadi **"Active"**

### 5. Verifikasi Deployment

1. Di Railway Dashboard, klik service backend
2. Klik tab **"Settings"**
3. Scroll ke **"Networking"**, klik **"Generate Domain"**
4. Railway akan memberikan URL seperti: `https://your-app.up.railway.app`
5. Test endpoint health check:
   ```
   https://your-app.up.railway.app/health
   ```

### 6. Update Frontend

Update URL backend di frontend (`frontend/.env.production`):
```bash
NEXT_PUBLIC_API_URL=https://your-app.up.railway.app
```

## 🔧 Troubleshooting

### Build Gagal

1. Cek logs di Railway Dashboard
2. Pastikan `package.json` memiliki script `build` dan `start`
3. Pastikan `tsconfig.json` ada dan valid

### Database Connection Error

1. Cek `DATABASE_URL` sudah benar
2. Pastikan Supabase database aktif
3. Cek IP whitelist di Supabase (Railway menggunakan dynamic IPs)
4. Di Supabase Dashboard > Project Settings > Database > Connection Pooling, pastikan **Pooling mode** set ke **Transaction** atau **Session**

### Port Issues

Railway secara otomatis assign port. Pastikan:
- Code menggunakan `process.env.PORT`
- Tidak hardcode port number

### CORS Issues

Update `CORS_ORIGIN` dengan domain frontend production yang benar.

## 📊 Monitoring

### Logs
- Railway Dashboard > Service > **"Deployments"** tab
- Klik deployment untuk melihat real-time logs

### Metrics
- Railway Dashboard > Service > **"Metrics"** tab
- Monitor CPU, Memory, Network usage

### Health Check
Railway akan otomatis restart service jika health check gagal.

## 🔄 Update & Redeploy

Railway akan otomatis redeploy ketika:
1. Push commit baru ke branch yang connected
2. Update environment variables
3. Manual redeploy dari dashboard

### Manual Redeploy
1. Railway Dashboard > Service
2. Klik **"..."** (three dots)
3. Pilih **"Redeploy"**

## 💰 Pricing

Railway Free Tier:
- $5 credit per month
- 500 hours execution time
- 1GB RAM, 1 vCPU shared

Untuk production, pertimbangkan upgrade ke Developer atau Team plan.

## 🔗 Links Penting

- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Supabase Documentation](https://supabase.com/docs)

## 📝 Checklist Deployment

- [ ] Repository di-push ke GitHub/GitLab
- [ ] Supabase database sudah setup & running
- [ ] Environment variables sudah di-set di Railway
- [ ] Domain generated & health check success
- [ ] Frontend updated dengan backend URL baru
- [ ] Test semua API endpoints
- [ ] Monitor logs untuk errors

## 🎉 Selesai!

Backend Diskusi Bisnis sekarang live di Railway! 

Next steps:
1. Deploy frontend ke Vercel/Netlify
2. Setup custom domain (opsional)
3. Setup monitoring & alerts
4. Configure CDN untuk static assets

---

**Need help?** Contact: [support email/discord]
