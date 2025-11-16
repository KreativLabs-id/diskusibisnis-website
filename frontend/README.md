# Frontend - Diskusi Bisnis

Frontend application untuk platform diskusi bisnis menggunakan Next.js 14 dengan App Router.

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Environment Setup

File `.env.local` sudah dikonfigurasi untuk development:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

### Run Development Server
```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

## 📁 Struktur Folder

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (main)/            # Main application pages
│   │   ├── page.tsx       # Homepage
│   │   ├── questions/     # Questions pages
│   │   ├── communities/   # Communities pages
│   │   ├── users/         # Users pages
│   │   └── admin/         # Admin panel
│   └── api/               # (DEPRECATED - moved to backend)
│
├── components/            # React Components
│   ├── layout/           # Layout components (Navbar, Sidebar)
│   ├── pages/            # Page-specific components
│   ├── questions/        # Question components
│   └── ui/               # UI components (Button, Modal, etc)
│
├── lib/                  # Libraries & Utilities
│   ├── api-client.ts    # 🔥 Main API client
│   ├── auth-middleware.ts
│   ├── database.ts      # (DEPRECATED - now in backend)
│   └── utils.ts
│
├── contexts/             # React Contexts
│   ├── AuthContext.tsx
│   └── NotificationContext.tsx
│
├── public/               # Static files
│   ├── icons/
│   ├── manifest.json
│   └── sw.js            # Service Worker (PWA)
│
└── styles/              # CSS files
```

## 🔌 API Integration

Frontend berkomunikasi dengan backend Express API melalui `lib/api-client.ts`.

### Cara Menggunakan API Client

```typescript
import api from '@/lib/api-client';

// Login
const response = await api.auth.login(email, password);
localStorage.setItem('token', response.token);

// Get questions
const questions = await api.questions.getAll({ page: 1, limit: 10 });

// Create question
const newQuestion = await api.questions.create({
  title: 'How to...',
  content: 'I need help with...',
  tags: ['javascript', 'react']
});
```

### Available API Methods

#### Authentication
- `api.auth.login(email, password)`
- `api.auth.register(data)`
- `api.auth.logout()`
- `api.auth.me()`

#### Questions
- `api.questions.getAll(params)`
- `api.questions.getById(id)`
- `api.questions.create(data)`
- `api.questions.update(id, data)`
- `api.questions.delete(id)`

#### Answers
- `api.answers.getByQuestion(questionId)`
- `api.answers.create(data)`
- `api.answers.update(id, data)`
- `api.answers.delete(id)`
- `api.answers.accept(id)`

#### Communities
- `api.communities.getAll(params)`
- `api.communities.getBySlug(slug)`
- `api.communities.create(data)`
- `api.communities.join(id)`
- `api.communities.leave(id)`

#### Votes & Bookmarks
- `api.votes.vote(targetType, targetId, voteType)`
- `api.bookmarks.getAll()`
- `api.bookmarks.toggle(questionId)`

#### Comments
- `api.comments.create(data)`
- `api.comments.update(id, content)`
- `api.comments.delete(id)`

#### Users
- `api.users.getAll(params)`
- `api.users.getById(id)`
- `api.users.updateProfile(data)`

#### Tags
- `api.tags.getAll(params)`
- `api.tags.getBySlug(slug)`

#### Notifications
- `api.notifications.getAll()`
- `api.notifications.markAsRead(id)`
- `api.notifications.markAllAsRead()`

#### Admin
- `api.admin.getStats()`
- `api.admin.users.getAll()`
- `api.admin.users.updateRole(userId, role)`
- `api.admin.communities.getAll()`
- `api.admin.questions.getAll()`

## 🔐 Authentication

Token JWT disimpan di localStorage:

```typescript
// After login
localStorage.setItem('token', response.token);

// API client automatically adds token to all requests
// Authorization: Bearer <token>

// Logout
localStorage.removeItem('token');
```

## 📦 Scripts

```bash
# Development
npm run dev          # Start development server (port 3000)

# Production
npm run build        # Build for production
npm start           # Start production server

# Linting
npm run lint        # Run ESLint
```

## 🎨 Styling

Frontend menggunakan:
- **Tailwind CSS** - Utility-first CSS framework
- **CSS Modules** - Component-scoped styles
- **Global CSS** - Di `app/globals.css`

## 🔄 PWA Support

Frontend mendukung Progressive Web App:
- Service Worker: `public/sw.js`
- Manifest: `public/manifest.json`
- Offline support
- Install prompt

## 🚀 Deployment

### Deploy ke Vercel (Recommended)

```bash
npm run build
vercel --prod
```

### Environment Variables di Vercel

Set di dashboard Vercel:
```
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXT_PUBLIC_FRONTEND_URL=https://your-domain.com
```

### Build Output

```bash
npm run build
# Output: .next/
# Static files: out/ (if using export)
```

## 🔧 Configuration

### next.config.mjs

```javascript
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};
```

### tailwind.config.js

Custom theme configuration untuk design system.

## 📱 Responsive Design

Frontend fully responsive:
- Desktop: 1024px+
- Tablet: 768px - 1023px
- Mobile: < 768px

## 🐛 Debugging

```bash
# Enable debug mode
DEBUG=* npm run dev

# Check build
npm run build

# Analyze bundle
npm run analyze
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Backend API Documentation](../backend/README.md)

## ⚠️ Important Notes

1. **API Routes Moved**: Semua API routes yang ada di `app/api/` sudah deprecated dan diganti dengan backend Express API
2. **Database Access**: Frontend tidak lagi direct access ke database, semua melalui backend API
3. **Authentication**: Token JWT dari backend disimpan di localStorage
4. **CORS**: Backend sudah dikonfigurasi untuk accept requests dari `http://localhost:3000`

## 🔄 Migration from Old Structure

Jika ada component yang masih menggunakan old API routes:

**Before:**
```typescript
const response = await fetch('/api/questions');
```

**After:**
```typescript
import api from '@/lib/api-client';
const response = await api.questions.getAll();
```

## 💡 Best Practices

1. **Always use api-client.ts** - Jangan direct fetch ke backend
2. **Error handling** - Wrap API calls dalam try-catch
3. **Loading states** - Show loading indicator saat fetch data
4. **Optimistic updates** - Update UI immediately, sync dengan backend
5. **Token refresh** - Handle token expiration gracefully

---

**Frontend Ready! 🎉**

Backend API: http://localhost:5000  
Frontend App: http://localhost:3000
