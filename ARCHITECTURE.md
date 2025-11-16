# Diskusi Bisnis - Architecture Guide

## 📁 Project Structure

Proyek ini menggunakan **monorepo** dengan arsitektur **Frontend-Backend terpisah**:

### 1. **Frontend** (Next.js Client)
- **Path**: `/frontend`
- **Tech**: Next.js 14 + TypeScript + Tailwind CSS
- **Arsitektur**: Client-side App (SSR/SSG)
- **API**: Berkomunikasi dengan Backend via HTTP
- **Port**: 3000

### 2. **Backend** (Express.js API)
- **Path**: `/backend`
- **Tech**: Express.js + TypeScript + PostgreSQL
- **Arsitektur**: REST API
- **Database**: Koneksi ke Supabase PostgreSQL
- **Port**: 5000

## 🔄 Arsitektur Aplikasi

### Client-Server Architecture (Current)
- **Frontend**: Next.js client yang berkomunikasi dengan backend
- **Backend**: Express.js REST API yang handle semua business logic
- Frontend dan Backend berjalan terpisah

### Kelebihan Arsitektur Ini:
- ✅ Backend dapat digunakan untuk web dan mobile app
- ✅ Lebih fleksibel untuk scaling
- ✅ Separation of concerns yang jelas
- ✅ Backend dapat dikembangkan independent dari frontend
- ✅ Mudah untuk add microservices

## 🗂️ File Structure

### Frontend (Client-Side)

```
frontend/
├── app/
│   ├── (auth)/              # Auth pages (login, register)
│   ├── (main)/              # Main app pages
│   └── components/          # Page-specific components
├── components/              # Shared components
│   ├── layout/              # Layout components
│   └── ui/                  # UI components
├── contexts/
│   └── AuthContext.tsx      # Auth state management
├── lib/
│   ├── api.ts               # Axios API client
│   ├── api-client.ts        # Fetch API client
│   └── supabase.ts          # Supabase client (Storage, Realtime)
└── .env.local               # Frontend env vars
```

### Backend (Server-Side)

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts      # PostgreSQL connection
│   ├── controllers/         # Business logic
│   ├── routes/              # API endpoints
│   ├── middlewares/         # Auth, validation, error handling
│   └── utils/               # Helper functions
├── scripts/                 # Database migrations
└── .env                     # Backend env vars
```

## 🚀 Cara Menjalankan

### 1. Setup Backend (Wajib)
```bash
cd backend
npm install
cp .env.example .env
# Edit .env dengan Supabase credentials
npm run dev
```

Backend akan jalan di: **http://localhost:5000**

### 2. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local dengan backend URL
npm run dev
```

Frontend akan jalan di: **http://localhost:3000**

### 3. Jalankan Database Migrations
```bash
cd backend
node scripts/run-sql.js setup-database.sql
```

## 🔐 Environment Variables

### Backend (.env)
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `JWT_SECRET` - JWT secret key (minimum 32 characters)
- `PORT` - Backend port (default: 5000)
- `CORS_ORIGIN` - Frontend URL untuk CORS (default: http://localhost:3000)

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:5000/api)
- `NEXT_PUBLIC_FRONTEND_URL` - Frontend URL (default: http://localhost:3000)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL (optional, untuk Storage/Realtime)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key (optional)

## ⚠️ Important Notes

1. **Backend HARUS jalan** - Frontend membutuhkan backend untuk semua operasi
2. **JWT_SECRET** tidak perlu di frontend, hanya di backend
3. **Database migrations** ada di `/backend/scripts`
4. **CORS** sudah dikonfigurasi di backend untuk terima request dari frontend

## 📚 Production Deployment

### Backend
Deploy ke salah satu:
- **Railway** (Recommended) - https://railway.app
- **Render** - https://render.com
- **Heroku** - https://heroku.com
- **VPS** (Digital Ocean, AWS, etc)

### Frontend
Deploy ke:
- **Vercel** (Recommended) - https://vercel.com
- **Netlify** - https://netlify.com

### Environment Variables Production

**Backend**:
```env
DATABASE_URL=postgresql://...supabase.com:6543/postgres
JWT_SECRET=your-production-secret-key
PORT=5000
CORS_ORIGIN=https://your-frontend-domain.vercel.app
NODE_ENV=production
```

**Frontend**:
```env
NEXT_PUBLIC_API_URL=https://your-backend-api.railway.app/api
NEXT_PUBLIC_FRONTEND_URL=https://your-frontend-domain.vercel.app
```

## 🔄 Development Workflow

1. Start Backend first: `cd backend && npm run dev`
2. Start Frontend: `cd frontend && npm run dev`
3. Frontend akan otomatis connect ke Backend
4. Semua API calls dari Frontend akan ke `http://localhost:5000/api`
