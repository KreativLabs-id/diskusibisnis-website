# 🚀 Setup Guide - DiskusiBisnis

Panduan lengkap untuk setup development environment DiskusiBisnis.

## 📋 Prerequisites

Pastikan Anda sudah install:
- Node.js 18+ ([Download](https://nodejs.org/))
- PostgreSQL 14+ ([Download](https://www.postgresql.org/download/))
- npm (included with Node.js)
- Git

## 🎯 Quick Start

### 1. Clone & Install

\`\`\`powershell
# Clone repository
git clone <repository-url>
cd diskusibisinis

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
\`\`\`

### 2. Setup Supabase

1. Buka [Supabase Dashboard](https://app.supabase.com/)
2. Buat project baru
3. Tunggu hingga database ready (~2 menit)
4. Copy credentials:
   - Project URL
   - anon/public key
   - service_role key
5. Dari Settings > Database, copy connection string

### 3. Setup Database

\`\`\`powershell
# Di PostgreSQL, create database
createdb diskusibisnis

# Atau via psql:
psql -U postgres
CREATE DATABASE diskusibisinis;
\q

# Run migration script
cd backend
psql -U postgres -d diskusibisinis -f database/schema.sql
\`\`\`

### 4. Environment Variables

#### Backend (.env)

\`\`\`powershell
cd backend
copy .env.example .env
# Edit .env dengan editor favorit Anda
\`\`\`

Isi dengan:
\`\`\`env
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (dari Supabase Settings > Database)
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# JWT
JWT_SECRET=ganti-dengan-random-string-panjang-dan-aman
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:3000
\`\`\`

#### Frontend (.env.local)

\`\`\`powershell
cd frontend
copy .env.local.example .env.local
# Edit .env.local
\`\`\`

Isi dengan:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
\`\`\`

### 5. Run Development Servers

#### Terminal 1 - Backend
\`\`\`powershell
cd backend
npm run dev
\`\`\`
Backend akan running di **http://localhost:5000**

#### Terminal 2 - Frontend
\`\`\`powershell
cd frontend
npm run dev
\`\`\`
Frontend akan running di **http://localhost:3000**

### 6. Test Application

1. Buka browser ke **http://localhost:3000**
2. Klik "Daftar" untuk membuat akun
3. Login dengan akun yang sudah dibuat
4. Coba buat pertanyaan pertama!

## 🔧 Development Tips

### Hot Reload

- Backend: Menggunakan `nodemon` - auto restart saat file berubah
- Frontend: Next.js Fast Refresh - instant reload

### Database Management

\`\`\`powershell
# Connect ke database
psql -U postgres -d diskusibisinis

# Useful commands:
\dt              # List tables
\d users         # Describe table
\q               # Quit
\`\`\`

### Reset Database

\`\`\`powershell
# Drop dan re-create database
dropdb diskusibisinis
createdb diskusibisinis
psql -U postgres -d diskusibisinis -f backend/database/schema.sql
\`\`\`

## 🎨 Struktur Project

\`\`\`
diskusibisinis/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth middleware
│   │   ├── config/          # Database & Supabase config
│   │   └── server.ts        # Express server
│   ├── database/
│   │   └── schema.sql       # Database schema
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── app/                 # Next.js 14 App Router
    │   ├── layout.tsx       # Root layout
    │   ├── page.tsx         # Homepage
    │   ├── login/
    │   ├── register/
    │   └── questions/
    ├── components/
    │   ├── layout/          # Navbar, Footer
    │   ├── pages/           # Page components
    │   └── questions/       # Question components
    ├── contexts/
    │   └── AuthContext.tsx  # Auth state management
    ├── lib/
    │   ├── api.ts           # API client
    │   ├── supabase.ts      # Supabase client
    │   └── utils.ts         # Utilities
    ├── .env.local
    ├── package.json
    └── tailwind.config.ts
\`\`\`

## 🧪 Testing

### Test API Endpoints

\`\`\`powershell
# Install httpie atau gunakan Postman
# Test health check
curl http://localhost:5000

# Test register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","displayName":"Test User"}'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
\`\`\`

## 🐛 Troubleshooting

### Port Already in Use

\`\`\`powershell
# Backend (port 5000)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Frontend (port 3000)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
\`\`\`

### Database Connection Error

1. Pastikan PostgreSQL service running
2. Check DATABASE_URL di .env
3. Test connection: `psql -U postgres -d diskusibisinis`

### Module Not Found

\`\`\`powershell
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
\`\`\`

### Supabase Connection Error

1. Check SUPABASE_URL dan keys di .env
2. Pastikan Supabase project active
3. Check network connection

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🆘 Need Help?

- Check [GitHub Issues](https://github.com/your-repo/issues)
- Join Discord community
- Email: support@diskusibisnis.com

---

Happy coding! 🚀
