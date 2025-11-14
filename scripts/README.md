# DiskusiBisnis - Database Setup

## 🚀 Quick Start - Database Setup

### Metode 1: Via Node.js (Recommended)
```bash
# Setup database lengkap (semua table + triggers + seed data)
node scripts/run-sql.js setup-database.sql

# Atau lebih simple (default):
node scripts/run-sql.js
```

### Metode 2: Via Supabase SQL Editor
1. Buka Supabase Dashboard → SQL Editor
2. Copy-paste isi file `setup-database.sql`
3. Run script
4. Selesai! ✅

### Metode 3: Via psql (Command Line)
```bash
psql -h <host> -U <user> -d <database> -f scripts/setup-database.sql
```

---

## 📋 Apa yang Di-setup?

File **`setup-database.sql`** berisi SEMUA yang dibutuhkan:

✅ **Core Tables** (11 tables)
- Users, Questions, Answers, Comments, Votes
- Tags, Question_Tags, Communities, Community_Members
- Bookmarks, Notifications

✅ **Reputation System** (Complete & Fixed)
- Create question: +1 point
- Create answer: +2 points
- Question upvoted: +5 points
- Answer upvoted: +10 points
- Content downvoted: -2 points
- Answer accepted: +15 points (answer author) + 2 points (question author)
- Never goes below 0

✅ **Notification System**
- Answer posted → Question author notified
- Upvote → Content author notified (via API)

✅ **Auto Counting**
- Vote counts
- Community members count
- Community questions count
- Tag usage count

✅ **Seed Data**
- 10 default tags
- 5 sample communities

---

## 🚀 Apa yang Akan Di-Setup

### 📊 **Core Tables**
- **Users** - Sistem user dengan reputation points
- **Questions** - Pertanyaan dengan voting dan view count
- **Answers** - Jawaban dengan acceptance system
- **Comments** - Komentar untuk questions dan answers
- **Tags** - Tag system dengan usage tracking
- **Votes** - Enhanced voting system (question_id/answer_id)

### 🏘️ **Communities System**
- **Communities** - Komunitas UMKM dengan kategori
- **Community Members** - Member management dengan roles
- **Auto counting** - Members dan questions count otomatis

### 🔖 **Additional Features**
- **Bookmarks** - Save questions untuk dibaca nanti
- **Notifications** - Sistem notifikasi untuk users

### ⚡ **Auto Features**
- **Enhanced Reputation System**:
  - +1 poin untuk buat pertanyaan
  - +2 poin untuk buat jawaban
  - +5 poin untuk upvote pertanyaan
  - +10 poin untuk upvote jawaban
  - +15 poin untuk jawaban diterima
  - +2 poin untuk yang menerima jawaban
- **Auto Counting**: Vote counts, member counts, question counts
- **Auto Timestamps**: created_at dan updated_at otomatis
- **Tag Usage Tracking**: Hitung berapa kali tag digunakan

## 📦 **Seed Data Included**

### 🏷️ **Default Tags (10)**
- Pajak, Marketing, Legalitas, Keuangan
- SDM, Operasional, Digital, Modal
- Ekspor, Teknologi

### 🏘️ **Sample Communities (5)**
- UMKM Jakarta, Digital Marketing UMKM
- Kuliner Nusantara, Ekspor Import Indonesia
- Fintech untuk UMKM

---

## 📂 File Structure & Purpose

### Main Files

| File | Purpose | When to Use |
|------|---------|-------------|
| **setup-database.sql** | 🎯 Complete database setup (ALL-IN-ONE) | Fresh install or reset |
| **run-sql.js** | Script runner utility | Run any SQL file easily |
| **add-verified-users.sql** | Add verified badge to users | Admin task |
| **update-user-role.sql** | Update user roles | Admin task |

### Documentation Files

| File | Content |
|------|---------|
| **README.md** | Main documentation & quick start guide |
| **DATABASE-DOCUMENTATION.md** | Complete database schema documentation |

---

## 🎯 Recommended Workflow

### Fresh Installation
```bash
# 1. Setup database
node scripts/run-sql.js setup-database.sql

# 2. Verify
node scripts/verify-database.js  # (if available)

# 3. Start dev server
npm run dev
```

### If You Have Issues

**Vote not working?**
- Already fixed in setup-database.sql ✅
- Just re-run: `node scripts/run-sql.js`

**Reputation not updating?**
- Already fixed in setup-database.sql ✅
- Just re-run: `node scripts/run-sql.js`

**Notifications not showing?**
- Already fixed in setup-database.sql ✅
- Just re-run: `node scripts/run-sql.js`

### 🏘️ **Sample Communities (5)**
- UMKM Jakarta (Regional)
- Digital Marketing UMKM (Marketing)
- Kuliner Nusantara (Industri)
- Ekspor Import Indonesia (Perdagangan)
- Fintech untuk UMKM (Teknologi)

## 🛠️ **Setup Instructions**

### 1. **Prerequisites**
- PostgreSQL 12+ 
- Database sudah dibuat
- User dengan privileges untuk CREATE TABLE, FUNCTION, TRIGGER

### 2. **Run Setup**
```bash
# Connect ke database
psql -h localhost -U your_username -d your_database

# Jalankan setup script
\i scripts/setup-database.sql
```

### 3. **Verify Setup**
Script akan menampilkan pesan completion dengan summary:
- Tables yang dibuat
- Features yang diaktifkan  
- Seed data yang ditambahkan

## 🔧 **Environment Setup**

Pastikan file `.env.local` Anda memiliki:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# JWT Secret (generate yang baru untuk production)
JWT_SECRET="your-super-secret-jwt-key-here"
```

## 📁 **File Structure**

```
scripts/
├── setup-database.sql          # 🎯 Complete database setup (RUN THIS)
├── run-sql.js                  # 🔧 SQL runner utility
├── add-verified-users.sql      # 👤 Add verified badge to users
├── update-user-role.sql        # 🔐 Update user roles
├── build.js                    # 📦 Build script untuk production
├── README.md                   # 📖 Main documentation
└── DATABASE-DOCUMENTATION.md   # 📚 Complete schema docs
```

## ✅ **Post-Setup Checklist**

- [ ] Database tables created successfully
- [ ] Seed data inserted (tags & communities)
- [ ] Reputation system working
- [ ] Auto counting triggers active
- [ ] Environment variables configured
- [ ] Application can connect to database

## 🚨 **Important Notes**

1. **One-Time Setup**: Script ini aman dijalankan multiple kali (menggunakan IF NOT EXISTS)
2. **Production Ready**: Includes all optimizations dan indexes
3. **Complete Solution**: Tidak perlu file SQL tambahan lagi
4. **Auto Migration**: Handles struktur lama ke baru otomatis

## 🆘 **Troubleshooting**

### Error: "relation already exists"
✅ **Normal** - Script menggunakan `IF NOT EXISTS`, aman untuk dijalankan ulang

### Error: "permission denied"
❌ **Solution**: Pastikan user database memiliki privileges yang cukup

### Error: "uuid-ossp extension"
❌ **Solution**: Install PostgreSQL contrib package atau jalankan sebagai superuser

---

## 🎉 **Ready to Go!**

Setelah setup selesai, aplikasi DiskusiBisnis siap digunakan dengan:
- ✅ Complete database schema
- ✅ Enhanced reputation system  
- ✅ Communities system
- ✅ Bookmarks & notifications
- ✅ Sample data untuk testing

**Happy coding! 🚀**
