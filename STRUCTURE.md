# 📦 Project Structure - DiskusiBisnis

## 🏗️ Architecture Overview

\`\`\`
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│   Next.js 14    │────────▶│   Express.js     │────────▶│   PostgreSQL    │
│   Frontend      │  HTTP   │   Backend API    │  SQL    │   (Supabase)    │
│                 │         │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
        │                            │
        │                            │
        ▼                            ▼
┌─────────────────┐         ┌──────────────────┐
│                 │         │                  │
│  Tailwind CSS   │         │  Supabase Auth   │
│  Styling        │         │  Authentication  │
│                 │         │                  │
└─────────────────┘         └──────────────────┘
\`\`\`

## 📁 Complete Directory Structure

\`\`\`
diskusibisinis/
│
├── 📄 README.md                    # Main documentation
├── 📄 SETUP.md                     # Setup guide
├── 📄 API.md                       # API documentation
├── 📄 DEPLOYMENT.md                # Deployment guide
├── 📄 .gitignore                   # Git ignore rules
│
├── 📂 backend/                     # Express.js Backend
│   ├── 📂 src/
│   │   ├── 📂 controllers/         # Business logic
│   │   │   ├── auth.controller.ts
│   │   │   ├── question.controller.ts
│   │   │   ├── answer.controller.ts
│   │   │   ├── comment.controller.ts
│   │   │   ├── vote.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── tag.controller.ts
│   │   │   ├── notification.controller.ts
│   │   │   └── admin.controller.ts
│   │   │
│   │   ├── 📂 routes/              # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── question.routes.ts
│   │   │   ├── answer.routes.ts
│   │   │   ├── comment.routes.ts
│   │   │   ├── vote.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── tag.routes.ts
│   │   │   ├── notification.routes.ts
│   │   │   └── admin.routes.ts
│   │   │
│   │   ├── 📂 middleware/          # Express middleware
│   │   │   └── auth.middleware.ts  # JWT authentication
│   │   │
│   │   ├── 📂 config/              # Configuration
│   │   │   ├── database.ts         # PostgreSQL connection
│   │   │   └── supabase.ts         # Supabase client
│   │   │
│   │   └── 📄 server.ts            # Express server entry
│   │
│   ├── 📂 database/
│   │   └── 📄 schema.sql           # Complete database schema
│   │
│   ├── 📄 .env.example             # Environment template
│   ├── 📄 .gitignore
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   └── 📄 README.md
│
└── 📂 frontend/                    # Next.js 14 Frontend
    ├── 📂 app/                     # Next.js App Router
    │   ├── 📄 layout.tsx           # Root layout
    │   ├── 📄 page.tsx             # Homepage
    │   ├── 📄 globals.css          # Global styles
    │   │
    │   ├── 📂 login/
    │   │   └── page.tsx            # Login page
    │   │
    │   ├── 📂 register/
    │   │   └── page.tsx            # Register page
    │   │
    │   └── 📂 questions/
    │       └── 📂 [id]/
    │           └── page.tsx        # Question detail page
    │
    ├── 📂 components/
    │   ├── 📂 layout/
    │   │   ├── Navbar.tsx          # Main navigation
    │   │   └── Footer.tsx
    │   │
    │   ├── 📂 pages/
    │   │   └── HomePage.tsx        # Homepage component
    │   │
    │   └── 📂 questions/
    │       └── QuestionCard.tsx    # Question card component
    │
    ├── 📂 contexts/
    │   └── AuthContext.tsx         # Auth state management
    │
    ├── 📂 lib/
    │   ├── api.ts                  # API client & functions
    │   ├── supabase.ts             # Supabase client config
    │   └── utils.ts                # Utility functions
    │
    ├── 📂 public/                  # Static assets
    │
    ├── 📄 .env.local.example       # Environment template
    ├── 📄 .gitignore
    ├── 📄 package.json
    ├── 📄 tsconfig.json
    ├── 📄 tailwind.config.ts
    ├── 📄 next.config.ts
    └── 📄 README.md
\`\`\`

## 🎯 Key Features Implementation

### ✅ Completed Features

1. **Authentication System** ✓
   - Email/Password registration & login
   - JWT token-based auth
   - Protected routes
   - Auth context for state management

2. **Question Management** ✓
   - Create, read, update, delete questions
   - View questions with filters (newest, popular, unanswered)
   - Search functionality
   - Tags/categorization

3. **Answer System** ✓
   - Post answers to questions
   - Accept best answer
   - Edit/delete own answers

4. **Voting System** ✓
   - Upvote/downvote questions & answers
   - Reputation points calculation
   - Vote state management

5. **User Profiles** ✓
   - Public profile pages
   - Display user questions & answers
   - Reputation tracking

6. **Admin Panel** ✓
   - Content moderation (CRUD)
   - User management (ban/unban)
   - Tags management
   - Platform statistics

7. **UI/UX** ✓
   - Modern minimalist design
   - Responsive mobile-first layout
   - Clean typography & spacing
   - Smooth transitions & animations

### 🚧 To Be Implemented (Post-MVP)

- Rich text editor (Markdown)
- Real-time notifications (WebSocket)
- Image upload
- Email notifications
- Advanced search
- User badges & achievements
- Bookmarks/favorites
- Leaderboard
- Report system

## 🔧 Tech Stack Details

### Frontend Dependencies

\`\`\`json
{
  "next": "^15.x",
  "react": "^19.x",
  "typescript": "^5.x",
  "tailwindcss": "^4.x",
  "axios": "^1.x",
  "@supabase/supabase-js": "^2.x",
  "lucide-react": "latest",
  "clsx": "latest",
  "tailwind-merge": "latest"
}
\`\`\`

### Backend Dependencies

\`\`\`json
{
  "express": "^5.x",
  "pg": "^8.x",
  "bcryptjs": "^3.x",
  "jsonwebtoken": "^9.x",
  "cors": "^2.x",
  "dotenv": "^17.x",
  "@supabase/supabase-js": "^2.x",
  "express-validator": "^7.x"
}
\`\`\`

## 🗄️ Database Schema Summary

### Tables (8)

1. **users** - User accounts & profiles
2. **questions** - Questions posted by users
3. **answers** - Answers to questions
4. **comments** - Comments on questions/answers
5. **votes** - Upvotes/downvotes
6. **tags** - Category tags
7. **question_tags** - Many-to-many relationship
8. **notifications** - User notifications

### Key Features

- UUID primary keys
- Indexed columns for performance
- Foreign key constraints
- Cascading deletes
- Auto-updated timestamps
- Triggers for reputation system
- Default seed data (tags)

## 🚀 Getting Started Quick Guide

### 1. Clone & Install

\`\`\`bash
git clone <repo>
cd diskusibisinis

cd backend && npm install
cd ../frontend && npm install
\`\`\`

### 2. Setup Environment

Create `.env` files based on `.env.example` templates

### 3. Setup Database

\`\`\`bash
createdb diskusibisinis
psql -d diskusibisinis -f backend/database/schema.sql
\`\`\`

### 4. Run Development

\`\`\`bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
\`\`\`

### 5. Access Application

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API: http://localhost:5000/api

## 📊 API Endpoints Summary

- **Auth**: `/api/auth/*` (register, login, forgot-password)
- **Questions**: `/api/questions/*` (CRUD, filters)
- **Answers**: `/api/answers/*` (CRUD, accept)
- **Comments**: `/api/comments/*` (CRUD)
- **Votes**: `/api/votes/*` (cast, remove)
- **Users**: `/api/users/*` (profile, update)
- **Tags**: `/api/tags/*` (CRUD - admin only)
- **Notifications**: `/api/notifications/*` (get, mark read)
- **Admin**: `/api/admin/*` (moderation, management)

## 🎨 Design System

### Colors

- **Primary**: Blue 600 (#2563EB)
- **Secondary**: Indigo 600 (#4F46E5)
- **Success**: Green 600 (#16A34A)
- **Danger**: Red 600 (#DC2626)
- **Gray Scale**: Gray 50-900

### Typography

- **Font**: Inter (Google Fonts)
- **Headings**: Bold, tracking-tight
- **Body**: Regular, leading-relaxed

### Components

- Modern rounded corners (lg, xl)
- Subtle shadows
- Smooth transitions
- Hover states on all interactive elements
- Mobile-first responsive design

## 🔐 Security Features

- Password hashing (bcrypt)
- JWT authentication
- Protected API routes
- CORS configuration
- SQL injection prevention
- XSS protection
- Input validation
- Role-based access control

## 📈 Performance Optimizations

- Database indexes
- Connection pooling
- Query optimization
- Code splitting (Next.js)
- Image optimization
- Lazy loading
- CDN-ready static assets

## 🧪 Testing Strategy

### To Implement

- Unit tests (Jest)
- Integration tests (Supertest)
- E2E tests (Playwright)
- API tests (Postman/Newman)

## 📝 Documentation Files

1. **README.md** - Project overview & features
2. **SETUP.md** - Detailed setup instructions
3. **API.md** - Complete API documentation
4. **DEPLOYMENT.md** - Production deployment guide
5. **STRUCTURE.md** - This file, project structure

## 🤝 Contributing

See CONTRIBUTING.md for guidelines (to be created)

## 📞 Support & Resources

- **Documentation**: All `.md` files in root
- **Issues**: GitHub Issues
- **Community**: Discord (to be set up)

---

**Built with ❤️ for Indonesian UMKM**

Last Updated: 2025-01-12
Version: 1.0.0 (MVP)
\`\`\`
