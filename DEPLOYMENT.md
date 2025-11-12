# 🌐 Deployment Guide - DiskusiBisnis

Panduan untuk deploy aplikasi DiskusiBisnis ke production.

## 📋 Deployment Options

### Recommended Stack
- **Frontend**: Vercel (optimal untuk Next.js)
- **Backend**: Railway / Render / Heroku
- **Database**: Supabase PostgreSQL (sudah included)
- **CDN**: Cloudflare (optional)

---

## 🚀 Deploy Frontend (Vercel)

### Langkah 1: Persiapan

\`\`\`powershell
cd frontend

# Build test locally
npm run build
npm run start

# Test di http://localhost:3000
\`\`\`

### Langkah 2: Deploy ke Vercel

1. Install Vercel CLI:
\`\`\`powershell
npm install -g vercel
\`\`\`

2. Login ke Vercel:
\`\`\`powershell
vercel login
\`\`\`

3. Deploy:
\`\`\`powershell
cd frontend
vercel
\`\`\`

4. Set environment variables di Vercel Dashboard:
   - `NEXT_PUBLIC_API_URL`: URL backend production
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key

5. Deploy production:
\`\`\`powershell
vercel --prod
\`\`\`

### Via Vercel Dashboard

1. Buka [vercel.com](https://vercel.com)
2. Import Git repository
3. Configure:
   - Framework Preset: **Next.js**
   - Root Directory: **frontend**
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Add Environment Variables
5. Deploy!

---

## 🚂 Deploy Backend (Railway)

### Option 1: Railway CLI

1. Install Railway CLI:
\`\`\`powershell
npm install -g @railway/cli
\`\`\`

2. Login:
\`\`\`powershell
railway login
\`\`\`

3. Initialize project:
\`\`\`powershell
cd backend
railway init
\`\`\`

4. Add environment variables:
\`\`\`powershell
railway variables set PORT=5000
railway variables set NODE_ENV=production
railway variables set SUPABASE_URL=your_url
railway variables set SUPABASE_ANON_KEY=your_key
railway variables set DATABASE_URL=your_db_url
railway variables set JWT_SECRET=your_secret
railway variables set FRONTEND_URL=https://your-frontend.vercel.app
\`\`\`

5. Deploy:
\`\`\`powershell
railway up
\`\`\`

### Option 2: Railway Dashboard

1. Buka [railway.app](https://railway.app)
2. New Project > Deploy from GitHub
3. Select repository
4. Configure:
   - Root Directory: **backend**
   - Build Command: `npm run build`
   - Start Command: `npm start`
5. Add Environment Variables
6. Deploy!

### Tambahan untuk Railway

Create `railway.json`:
\`\`\`json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
\`\`\`

---

## 🎯 Deploy Backend (Render)

### Via Render Dashboard

1. Buka [render.com](https://render.com)
2. New > Web Service
3. Connect repository
4. Configure:
   - **Name**: diskusibisnis-api
   - **Root Directory**: backend
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add Environment Variables
6. Create Web Service

### render.yaml (Optional)

\`\`\`yaml
services:
  - type: web
    name: diskusibisnis-api
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
\`\`\`

---

## 🗄️ Database Setup (Supabase)

Database sudah production-ready di Supabase!

### Additional Setup

1. Enable Row Level Security (RLS) for sensitive tables:
\`\`\`sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);
\`\`\`

2. Set up Database Backups:
   - Supabase Pro: Automatic daily backups
   - Free tier: Manual backups via Dashboard

3. Connection Pooling:
   - Use connection pooler for production
   - Supabase provides this out of the box

---

## 🔒 Security Checklist

### Backend

- [ ] Change JWT_SECRET to strong random string
- [ ] Enable CORS only for your frontend domain
- [ ] Use HTTPS only in production
- [ ] Enable rate limiting:

\`\`\`typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
\`\`\`

- [ ] Sanitize user inputs
- [ ] Enable helmet for security headers:

\`\`\`typescript
import helmet from 'helmet';
app.use(helmet());
\`\`\`

### Frontend

- [ ] Remove console.logs
- [ ] Enable Content Security Policy
- [ ] Use environment variables for sensitive data
- [ ] Enable HTTPS

### Database

- [ ] Enable SSL connections
- [ ] Regular backups
- [ ] Monitor query performance
- [ ] Set up alerts for errors

---

## 📊 Monitoring & Analytics

### Backend Monitoring

**Recommended Tools:**
- **Sentry** - Error tracking
- **Logtail** - Log management
- **Datadog** - APM

Setup Sentry:
\`\`\`powershell
npm install @sentry/node
\`\`\`

\`\`\`typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
\`\`\`

### Frontend Monitoring

Vercel Analytics (free):
\`\`\`typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
\`\`\`

---

## 🚨 Health Checks

### Backend Health Endpoint

\`\`\`typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
\`\`\`

### Database Health Check

\`\`\`typescript
app.get('/health/db', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});
\`\`\`

---

## 📈 Performance Optimization

### Frontend

1. **Image Optimization**
   - Use Next.js Image component
   - Use WebP format
   - Lazy loading

2. **Code Splitting**
   - Already handled by Next.js
   - Use dynamic imports for heavy components

3. **Caching**
   - Enable CDN caching
   - Set proper Cache-Control headers

### Backend

1. **Database Indexing**
   - Already added in schema.sql
   - Monitor slow queries

2. **API Caching**
\`\`\`typescript
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

app.get('/api/questions', (req, res) => {
  const cached = cache.get('questions');
  if (cached) return res.json(cached);
  
  // Fetch from database
  // ...
  cache.set('questions', data);
});
\`\`\`

3. **Connection Pooling**
   - Already configured in database.ts
   - Monitor pool size

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

\`\`\`yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd frontend && npm install
      - run: cd frontend && npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./frontend

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd backend && npm install
      - run: cd backend && npm run build
      # Railway deployment
      - uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: diskusibisnis-api
\`\`\`

---

## 📝 Post-Deployment Checklist

- [ ] Test all endpoints in production
- [ ] Verify database connections
- [ ] Test authentication flow
- [ ] Check CORS settings
- [ ] Monitor error logs
- [ ] Set up monitoring alerts
- [ ] Test performance
- [ ] Verify SSL certificates
- [ ] Test mobile responsiveness
- [ ] Run security audit
- [ ] Set up backup strategy
- [ ] Document production URLs

---

## 🆘 Troubleshooting

### "Cannot connect to database"
- Check DATABASE_URL environment variable
- Verify Supabase database is running
- Check SSL settings

### "CORS error"
- Verify FRONTEND_URL in backend .env
- Check CORS configuration in server.ts

### "Build failed"
- Check Node.js version (18+)
- Verify all dependencies installed
- Check TypeScript errors

### "504 Gateway Timeout"
- Increase timeout limits
- Optimize database queries
- Check server resources

---

## 📞 Support

- **Documentation**: See README.md
- **API Docs**: See API.md
- **Setup Guide**: See SETUP.md
- **Issues**: GitHub Issues

---

**🎉 Congratulations! Your app is now live!**
