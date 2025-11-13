# DiskusiBisnis - Forum Q&A UMKM Indonesia

Platform tanya jawab modern untuk pemilik UMKM Indonesia. Dibangun dengan Next.js 14, TypeScript, dan PostgreSQL.

![DiskusiBisnis](https://img.shields.io/badge/Status-MVP-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🎯 Tentang Project

DiskusiBisnis adalah platform forum Q&A yang dirancang khusus untuk komunitas UMKM Indonesia. Platform ini memungkinkan pemilik usaha untuk:

- 🤝 Bertanya dan berbagi pengalaman bisnis
- 💡 Mendapatkan solusi dari sesama entrepreneur
- 🏘️ Bergabung dengan komunitas UMKM lokal
- 🏆 Membangun reputasi melalui sistem poin
- 🔖 Menyimpan pertanyaan penting untuk referensi

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **UI Components**: Lucide React Icons, Custom Components
- **Database**: PostgreSQL dengan Supabase
- **Authentication**: JWT dengan bcryptjs
- **State Management**: React Context API
- **HTTP Client**: Axios dengan interceptors

## ✨ Fitur Utama

### 🔐 **Authentication System**
- Login/Register dengan email
- JWT token management
- Protected routes dan middleware

### ❓ **Q&A System**
- Buat pertanyaan dengan tags
- Sistem voting (upvote/downvote)
- Jawaban dengan acceptance system
- Bookmark pertanyaan favorit

### 🏘️ **Communities**
- Buat dan join komunitas UMKM
- Kategori: Regional, Marketing, Industri, dll
- Member management dengan roles
- Community-specific questions

### 🏆 **Reputation System**
- +1 poin untuk buat pertanyaan
- +2 poin untuk buat jawaban
- +5 poin untuk upvote pertanyaan
- +10 poin untuk upvote jawaban
- +15 poin untuk jawaban diterima

### 🔔 **Notifications**
- Real-time notifications
- Mark as read functionality
- Activity tracking

## 🛠️ Setup & Installation

### 1. **Clone Repository**
```bash
git clone <repository-url>
cd diskusi-bisnis
```

### 2. **Install Dependencies**
```bash
npm install
# atau
yarn install
```

### 3. **Environment Setup**
Buat file `.env.local`:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"

# Supabase (optional)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### 4. **Database Setup**
```bash
# Jalankan setup database (PostgreSQL)
psql -h localhost -U username -d database_name
\i scripts/setup-database.sql
```

### 5. **Run Development Server**
```bash
npm run dev
# atau
yarn dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📁 Struktur Project

```
diskusi-bisnis/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (main)/            # Main app pages
│   │   ├── communities/   # Communities pages
│   │   ├── questions/     # Questions pages
│   │   └── ask/          # Create question page
│   └── api/              # API routes
├── components/            # Reusable components
│   ├── layout/           # Layout components
│   ├── ui/               # UI components
│   └── questions/        # Question-specific components
├── contexts/             # React contexts
├── lib/                  # Utilities & API clients
├── scripts/              # Database setup scripts
└── types/               # TypeScript type definitions
```

## 🎨 Design System

### **Colors**
- **Primary**: Emerald (emerald-600, emerald-700)
- **Secondary**: Slate (slate-50 to slate-900)
- **Accent**: Yellow untuk popular items

### **Components**
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Emerald theme dengan hover effects
- **Forms**: Clean inputs dengan focus states
- **Loading**: Consistent spinners throughout

## 📱 Mobile-First Design

- Responsive layout untuk semua screen sizes
- Touch-friendly buttons dan navigation
- Optimized typography scaling
- Mobile-specific UI patterns

## 🔧 Development

### **Available Scripts**
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
```

### **Code Standards**
- TypeScript strict mode
- ESLint configuration
- Component-based architecture
- Custom hooks untuk logic reuse

## 🚀 Deployment

### **Vercel (Recommended)**
1. Connect repository ke Vercel
2. Set environment variables
3. Deploy otomatis dari branch master

### **Manual Deployment**
```bash
npm run build
npm run start
```

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - lihat file [LICENSE](LICENSE) untuk detail.

## 👥 Team

- **Developer**: KreativLabs
- **Project**: DiskusiBisnis MVP
- **Contact**: [GitHub](https://github.com/kreativlabs)

---

**Made with ❤️ for UMKM Indonesia** 🇮🇩
