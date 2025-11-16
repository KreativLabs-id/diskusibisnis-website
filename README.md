# Diskusi Bisnis Platform

Platform diskusi bisnis dengan arsitektur frontend dan backend terpisah.

## 📁 Struktur Project

```
diskusi-bisnis/
├── frontend/          # Next.js Frontend Application
│   ├── app/          # Next.js App Router
│   ├── components/   # React Components
│   ├── lib/          # Frontend utilities & API client
│   ├── public/       # Static assets
│   └── styles/       # CSS files
│
└── backend/          # Express.js Backend API
    ├── src/
    │   ├── controllers/  # Business logic
    │   ├── routes/       # API routes
    │   ├── middlewares/  # Auth, validation, error handling
    │   ├── utils/        # Helper functions
    │   ├── config/       # Database & environment config
    │   └── types/        # TypeScript types
    └── dist/            # Compiled JavaScript (production)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ dan npm/yarn
- PostgreSQL database (Supabase recommended)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/KreativLabs-id/diskusibisnis-website.git
cd diskusibisnis-website
```

### 2. Setup Backend (Wajib Jalan Dulu!)

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development

# Supabase Database URL
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:3000

FRONTEND_URL=http://localhost:3000
```

Jalankan database migration:
```bash
node scripts/run-sql.js setup-database.sql
```

Jalankan backend:
```bash
npm run dev
```

Backend akan berjalan di: **http://localhost:5000**

### 3. Setup Frontend

```bash
cd ../frontend
npm install
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

Jalankan frontend:
```bash
npm run dev
```

Frontend akan berjalan di: **http://localhost:3000**

### 4. Akses Aplikasi
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## 📚 Dokumentasi Lengkap

- **[Backend Documentation](backend/README.md)** - Setup, API endpoints, dan arsitektur backend
- **[Migration Guide](backend/MIGRATION.md)** - Detail migrasi dari Next.js ke Express
- **[Frontend Update Guide](FRONTEND-UPDATE-GUIDE.md)** - Cara update frontend untuk connect ke backend baru

## 🔧 Development

### Menjalankan Keduanya Sekaligus

**Windows:**
```bash
start-dev.bat
```

**Linux/Mac:**
```bash
./start-dev.sh
```

### Testing API

Backend menyediakan 66+ endpoints termasuk:
- Authentication & User Management
- Questions & Answers
- Communities
- Tags & Search
- Votes & Bookmarks
- Comments
- Notifications
- Admin Panel

Test dengan cURL atau Postman:
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get questions
curl http://localhost:5000/api/questions
```

## 🏗️ Teknologi Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **PWA** - Progressive Web App capabilities

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Express Validator** - Input validation

### DevOps
- **ts-node-dev** - Development hot reload
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security headers
- **Morgan** - HTTP logging
- **Compression** - Response compression

## 📖 API Documentation

Backend API mengikuti RESTful conventions:

- `GET /api/questions` - List pertanyaan
- `POST /api/questions` - Buat pertanyaan baru
- `GET /api/questions/:id` - Detail pertanyaan
- `PUT /api/questions/:id` - Update pertanyaan
- `DELETE /api/questions/:id` - Hapus pertanyaan

Semua endpoint terdokumentasi lengkap di [Backend README](backend/README.md).

## 🔐 Authentication

Backend menggunakan JWT authentication:

1. Login via `POST /api/auth/login`
2. Dapatkan token JWT
3. Kirim token di header: `Authorization: Bearer <token>`

Frontend menyimpan token di localStorage dan otomatis menambahkan ke semua request.

## 🛠️ Production Deployment

### Backend (Express)
```bash
cd backend
npm run build
npm start
```

Deploy ke:
- Vercel (dengan vercel.json configuration)
- Railway
- Heroku
- VPS (PM2)

### Frontend (Next.js)
```bash
cd frontend
npm run build
npm start
```

Deploy ke:
- Vercel (recommended)
- Netlify
- Railway

### Environment Variables

Jangan lupa set environment variables di platform hosting:
- Backend: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`
- Frontend: `NEXT_PUBLIC_API_URL`

## 📝 Development Notes

- Backend API sudah production-ready dengan error handling lengkap
- Frontend menggunakan `lib/api-client.ts` untuk semua API calls
- Database migrations ada di `backend/scripts/`
- Semua endpoints sudah ada input validation
- Security: Helmet, CORS, Rate limiting sudah aktif

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

## 📄 License

MIT License - feel free to use this project for learning and commercial purposes.

## 💬 Support

Jika ada pertanyaan atau issue:
1. Check dokumentasi di `backend/README.md`
2. Check migration guide di `backend/MIGRATION.md`
3. Create GitHub issue

---

**Happy Coding! 🚀**
