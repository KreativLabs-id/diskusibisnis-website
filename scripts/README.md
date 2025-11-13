# DiskusiBisnis - Database Setup

## 📋 Quick Setup

Untuk setup database DiskusiBisnis, cukup jalankan satu file SQL ini:

```sql
-- Jalankan file ini di PostgreSQL database Anda
\i setup-database.sql
```

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
├── setup-database.sql    # Complete database setup (RUN THIS)
├── build.js             # Build script untuk production
└── README.md            # Documentation ini
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
