# DiskusiBisnis - Forum Q&A UMKM Indonesia

Platform tanya jawab modern untuk pemilik UMKM Indonesia. Dibangun dengan Next.js 14, Express.js, PostgreSQL, dan Supabase.

![DiskusiBisnis](https://img.shields.io/badge/Status-MVP-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 📋 Daftar Isi

- [Tentang Project](#tentang-project)
- [Tech Stack](#tech-stack)
- [Fitur Utama](#fitur-utama)
- [Cara Install](#cara-install)
- [Struktur Database](#struktur-database)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)

## 🎯 Tentang Project

**DiskusiBisnis** adalah platform Q&A yang dirancang khusus untuk komunitas UMKM Indonesia. Platform ini memungkinkan pemilik usaha untuk:

- ❓ Bertanya tentang masalah bisnis mereka
- 💡 Memberikan jawaban dan solusi praktis
- ⭐ Sistem voting untuk jawaban terbaik
- 🏆 Sistem reputasi untuk memotivasi kontribusi berkualitas
- 🏷️ Organisasi pertanyaan dengan tags/kategori

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework dengan App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Lucide React** - Icon library

### Backend
- **Express.js** - Node.js web framework
- **TypeScript** - Type-safe API development
- **PostgreSQL** - Relational database
- **Supabase** - Authentication & database hosting
- **JWT** - Token-based authentication
- **Bcrypt** - Password hashing

### Database
- **PostgreSQL** - Main database
- **Supabase** - Database hosting & auth

## ✨ Fitur Utama

### Untuk Semua Pengguna (Guest)
- ✅ Lihat homepage dengan daftar pertanyaan
- ✅ Lihat detail pertanyaan lengkap dengan jawaban
- ✅ Lihat halaman tags/kategori
- ✅ Pencarian pertanyaan
- ✅ Filter pertanyaan (terbaru, populer, belum terjawab)

### Untuk Member (Pengguna Terdaftar)
- ✅ Registrasi & Login (Email + Password)
- ✅ OAuth dengan Google (via Supabase)
- ✅ Buat pertanyaan baru dengan tags
- ✅ Tulis jawaban
- ✅ Tulis komentar pada pertanyaan/jawaban
- ✅ Upvote/Downvote pertanyaan & jawaban
- ✅ Terima jawaban sebagai "Jawaban Terbaik" (untuk penanya)
- ✅ Sistem reputasi poin:
  - +10 poin untuk jawaban di-upvote
  - +5 poin untuk pertanyaan di-upvote
  - +15 poin saat jawaban diterima sebagai terbaik
- ✅ Profil pengguna (public)
- ✅ Edit profil (foto, nama, bio)
- ✅ Notifikasi (jawaban baru, komentar, accepted answer)

### Untuk Admin
- ✅ Admin Dashboard
- ✅ Manajemen konten (edit/hapus pertanyaan, jawaban, komentar)
- ✅ Manajemen user (ban/unban, hapus user)
- ✅ Manajemen tags (CRUD)
- ✅ Analytics & statistik

## 🚀 Cara Install

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm atau yarn
- Akun Supabase (gratis)

### 1. Clone Repository

\`\`\`bash
git clone <repository-url>
cd diskusibisinis
\`\`\`

### 2. Setup Backend

\`\`\`bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env dan isi dengan kredensial Anda:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - DATABASE_URL
# - JWT_SECRET

# Jalankan database migration
# Buka file database/schema.sql dan execute di PostgreSQL Anda

# Start development server
npm run dev
\`\`\`

Backend akan running di `http://localhost:5000`

### 3. Setup Frontend

\`\`\`bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local dan isi dengan:
# - NEXT_PUBLIC_API_URL=http://localhost:5000/api
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY

# Start development server
npm run dev
\`\`\`

Frontend akan running di `http://localhost:3000`

### 4. Setup Database

Jalankan SQL script untuk membuat database schema:

\`\`\`bash
# Di PostgreSQL, execute file:
psql -U your_user -d your_database -f backend/database/schema.sql
\`\`\`

Database schema akan membuat:
- 8 Tables (users, questions, answers, comments, votes, tags, notifications, question_tags)
- Indexes untuk performa optimal
- Triggers untuk auto-update timestamps
- Functions untuk reputation system

## 📊 Struktur Database

### Tables

1. **users** - Data pengguna
2. **questions** - Pertanyaan
3. **answers** - Jawaban
4. **comments** - Komentar
5. **votes** - Vote (upvote/downvote)
6. **tags** - Kategori/tag
7. **question_tags** - Many-to-many relationship
8. **notifications** - Notifikasi pengguna

### Entity Relationship Diagram

\`\`\`
users (1) ──── (N) questions
users (1) ──── (N) answers
users (1) ──── (N) comments
users (1) ──── (N) votes
questions (N) ──── (N) tags (via question_tags)
questions (1) ──── (N) answers
questions (1) ──── (N) comments
answers (1) ──── (N) comments
\`\`\`

## 📡 API Documentation

### Authentication
- `POST /api/auth/register` - Registrasi user baru
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Reset password
- `POST /api/auth/reset-password` - Konfirmasi reset password

### Questions
- `GET /api/questions` - Get semua pertanyaan (dengan filter)
- `GET /api/questions/:id` - Get detail pertanyaan
- `POST /api/questions` - Buat pertanyaan baru (auth required)
- `PUT /api/questions/:id` - Update pertanyaan (author only)
- `DELETE /api/questions/:id` - Hapus pertanyaan (author/admin)

### Answers
- `POST /api/answers` - Buat jawaban (auth required)
- `PUT /api/answers/:id` - Update jawaban (author only)
- `DELETE /api/answers/:id` - Hapus jawaban (author/admin)
- `POST /api/answers/:id/accept` - Accept jawaban (question author only)

### Votes
- `POST /api/votes` - Cast vote (auth required)
- `DELETE /api/votes/:id` - Remove vote

### Users
- `GET /api/users/:id` - Get user profile (public)
- `PUT /api/users/:id` - Update profile (owner only)
- `GET /api/users/:id/questions` - Get user questions
- `GET /api/users/:id/answers` - Get user answers

### Tags
- `GET /api/tags` - Get semua tags
- `GET /api/tags/:slug` - Get tag detail & questions
- `POST /api/tags` - Create tag (admin only)
- `PUT /api/tags/:id` - Update tag (admin only)
- `DELETE /api/tags/:id` - Delete tag (admin only)

### Notifications
- `GET /api/notifications` - Get notifications (auth required)
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Admin
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users/:id/ban` - Ban user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stats` - Get platform statistics

## 🎨 Design Philosophy

DiskusiBisnis menggunakan design modern dan minimalis yang terinspirasi dari:
- **Linear** - Clean, fast, functional
- **Vercel** - Minimal, elegant, high contrast
- **Stack Overflow** - Organized, information-dense

### Design Principles:
1. **Clarity First** - Informasi mudah dibaca dan dipahami
2. **Performance** - Fast loading, optimized queries
3. **Mobile-First** - Responsive design untuk semua device
4. **Accessibility** - Semantic HTML, proper contrast ratios

## 🔐 Security Features

- ✅ Password hashing dengan bcrypt
- ✅ JWT token authentication
- ✅ Protected routes dengan middleware
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection
- ✅ CORS configuration
- ✅ Rate limiting (to be implemented)

## 🌐 Environment Variables

### Backend (.env)
\`\`\`env
PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
\`\`\`

### Frontend (.env.local)
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
\`\`\`

## 📝 To-Do List (Post-MVP)

- [ ] Real-time notifications dengan WebSocket
- [ ] Rich text editor (Markdown support)
- [ ] Image upload untuk pertanyaan/jawaban
- [ ] Email notifications
- [ ] Advanced search dengan filters
- [ ] User badges & achievements
- [ ] Question bookmarks/favorites
- [ ] Reputation leaderboard
- [ ] Report system untuk spam/abuse
- [ ] SEO optimization
- [ ] Rate limiting
- [ ] Analytics dashboard

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 👥 Team

Developed by DiskusiBisnis Team

---

**🚀 Happy Coding! Semoga UMKM Indonesia semakin maju!**
