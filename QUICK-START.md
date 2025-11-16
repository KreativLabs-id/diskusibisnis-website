# Setup Cepat - Diskusi Bisnis

> ⚠️ **PENTING**: Backend HARUS jalan dulu sebelum frontend!

## 🚀 Start Development

### Option 1: Start Both Servers (Recommended)

**Windows:**
```bash
start-dev.bat
```

**Linux/Mac:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### Option 2: Start Manually

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend  
npm run dev
```

## 📍 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api/health

## ✅ First Time Setup

### 1. Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@host:port/database
DATABASE_SSL=true
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

File `frontend/.env.local` sudah otomatis dibuat dengan nilai yang benar.

### 3. Database Setup
```bash
cd backend
npm run migrate  # Jika ada migration script
```

## 🧪 Testing

### Test Backend API
```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get questions
curl http://localhost:5000/api/questions
```

### Test Frontend
1. Open http://localhost:3000
2. Register new account
3. Login
4. Create question
5. Test all features

## 📂 Project Structure

```
diskusi-bisnis/
├── frontend/          # Next.js (Port 3000)
│   ├── app/          # Pages & routing
│   ├── components/   # React components
│   ├── lib/          # API client & utilities
│   └── .env.local    # Frontend environment
│
├── backend/          # Express.js (Port 5000)
│   ├── src/
│   │   ├── controllers/  # Business logic
│   │   ├── routes/       # API endpoints
│   │   ├── middlewares/  # Auth & validation
│   │   └── config/       # Database config
│   └── .env          # Backend environment
│
├── README.md         # Main documentation
├── start-dev.bat     # Windows startup script
└── start-dev.sh      # Linux/Mac startup script
```

## 🔧 Common Tasks

### Install New Package

**Backend:**
```bash
cd backend
npm install package-name
```

**Frontend:**
```bash
cd frontend
npm install package-name
```

### Create New API Endpoint

1. Create controller in `backend/src/controllers/`
2. Create route in `backend/src/routes/`
3. Add validation in route
4. Register route in `backend/src/routes/index.ts`
5. Update `frontend/lib/api-client.ts`

### Create New Page

1. Create page in `frontend/app/(main)/page-name/page.tsx`
2. Create components in `frontend/components/pages/`
3. Use API client for data fetching

## 🐛 Troubleshooting

### Port Already in Use

**Backend (5000):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

**Frontend (3000):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### CORS Error

Pastikan `backend/.env` memiliki:
```env
FRONTEND_URL=http://localhost:3000
```

Dan `frontend/.env.local` memiliki:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Database Connection Error

1. Check DATABASE_URL di `backend/.env`
2. Test koneksi: `psql "your_database_url"`
3. Check firewall/network
4. Verify SSL settings

### Token Expired

1. Clear localStorage: `localStorage.clear()`
2. Login ulang
3. Check JWT_EXPIRES_IN di backend

## 📊 Key Endpoints

### Authentication
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Questions
- `GET /api/questions` - List questions
- `POST /api/questions` - Create question
- `GET /api/questions/:id` - Get question detail
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

### Answers
- `GET /api/answers/question/:id` - Get answers
- `POST /api/answers` - Create answer
- `POST /api/answers/:id/accept` - Accept answer

### Communities
- `GET /api/communities` - List communities
- `POST /api/communities` - Create community
- `POST /api/communities/:id/join` - Join community

Full API documentation: [backend/README.md](backend/README.md)

## 🚀 Production Build

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

## 📝 Environment Variables

### Backend Required
- `PORT` - Server port (default: 5000)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend Required
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_FRONTEND_URL` - Frontend URL

## 🔗 Useful Links

- [Backend Documentation](backend/README.md)
- [Frontend Documentation](frontend/README.md)
- [Migration Guide](backend/MIGRATION.md)
- [Frontend Update Guide](FRONTEND-UPDATE-GUIDE.md)

## 💡 Tips

1. **Hot Reload**: Both servers support hot reload
2. **Parallel Development**: Work on frontend & backend simultaneously
3. **API First**: Design API endpoints before frontend
4. **Type Safety**: Use TypeScript interfaces from backend in frontend
5. **Error Handling**: Always wrap API calls in try-catch

## 🎯 Next Steps

1. ✅ Servers running
2. ✅ Database connected
3. ✅ Test authentication
4. ✅ Create first question
5. ✅ Join community
6. ✅ Vote & comment
7. ✅ Explore admin panel

---

**Happy Coding! 🎉**

Jika ada pertanyaan, check dokumentasi lengkap di README.md
