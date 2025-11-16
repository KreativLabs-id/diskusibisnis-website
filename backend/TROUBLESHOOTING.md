# Railway Deployment - Common Issues & Solutions

## 🔧 Troubleshooting Guide

### 1. Build Failures

#### Error: "Cannot find module 'typescript'"
**Penyebab**: TypeScript tidak terinstall

**Solusi**:
```json
// Pastikan di package.json devDependencies ada:
"typescript": "^5.3.3"
```

Railway akan install devDependencies saat build.

#### Error: "tsc: command not found"
**Penyebab**: TypeScript compiler tidak ada di PATH

**Solusi**: Dockerfile sudah handle ini. Pastikan menggunakan Dockerfile yang sudah diperbaiki.

#### Error: "ENOENT: no such file or directory, open 'dist/server.js'"
**Penyebab**: Build gagal atau dist folder tidak ada

**Solusi**:
1. Check build script: `"build": "tsc"`
2. Check tsconfig.json:
```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

### 2. Database Connection Issues

#### Error: "ECONNREFUSED" atau "Connection timeout"
**Penyebab**: 
- DATABASE_URL salah
- Supabase tidak allow Railway IPs
- Network issue

**Solusi**:
1. Verify DATABASE_URL format:
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

2. Di Supabase Dashboard:
   - Project Settings > Database > Connection String
   - Pastikan menggunakan **Connection Pooling** (port 6543)
   - Mode: **Transaction** atau **Session**

3. Test connection manual:
```bash
railway run node -e "const pg = require('pg'); const pool = new pg.Pool({connectionString: process.env.DATABASE_URL}); pool.query('SELECT NOW()', console.log);"
```

#### Error: "password authentication failed"
**Penyebab**: Password salah di DATABASE_URL

**Solusi**:
1. Reset database password di Supabase
2. Update DATABASE_URL di Railway variables
3. Redeploy

#### Error: "too many connections"
**Penyebab**: Connection pool tidak di-close atau terlalu banyak instances

**Solusi**:
```typescript
// Di database.ts, set pool limit:
const pool = new Pool({
  connectionString: config.database.url,
  max: 10, // Tambahkan ini
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 3. Port Issues

#### Error: "Port 5000 is already in use"
**Solusi**: Railway auto-assign port. Pastikan code menggunakan:
```typescript
const PORT = process.env.PORT || 5000;
```

#### Service tidak accessible
**Penyebab**: Domain belum di-generate

**Solusi**:
1. Railway Dashboard > Service > Settings > Networking
2. Klik "Generate Domain"

### 4. Environment Variables

#### Error: "JWT_SECRET is not defined"
**Penyebab**: Environment variable tidak di-set

**Solusi**:
1. Railway Dashboard > Service > Variables
2. Add semua required variables dari `.env.example`
3. Redeploy service

#### CORS Error di Frontend
**Penyebab**: CORS_ORIGIN tidak match dengan frontend domain

**Solusi**:
```bash
# Set di Railway:
CORS_ORIGIN=https://your-frontend.vercel.app

# Atau allow multiple:
CORS_ORIGIN=https://your-frontend.vercel.app,https://www.your-domain.com
```

Update `app.ts`:
```typescript
app.use(cors({
  origin: config.cors.origin.split(','),
  credentials: true,
}));
```

### 5. Dockerfile Issues

#### Error: "failed to solve: failed to compute cache key"
**Penyebab**: File referenced di Dockerfile tidak ada

**Solusi**: Check `.dockerignore` tidak exclude file penting:
```
# .dockerignore
node_modules
.env
dist
*.log

# JANGAN exclude ini:
# package.json ❌
# tsconfig.json ❌
# src/ ❌
```

#### Build sangat lambat
**Penyebab**: Tidak ada layer caching

**Solusi**: Dockerfile sudah optimized dengan multi-stage build. Pastikan struktur:
```dockerfile
# Copy package.json first
COPY package*.json ./
RUN npm ci

# Then copy source (better caching)
COPY . .
RUN npm run build
```

### 6. Runtime Issues

#### Service crash setelah deploy
**Check Logs**:
```bash
railway logs
```

**Common causes**:
1. Uncaught exception
2. Database connection failed
3. Missing environment variable
4. Port binding issue

**Solution**: Add error handling:
```typescript
// server.ts
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});
```

#### High memory usage
**Penyebab**: Memory leak atau tidak efficient

**Solusi**:
1. Railway Dashboard > Metrics > Check memory graph
2. Optimize queries
3. Close database connections properly
4. Use connection pooling

#### Health check failing
**Penyebab**: `/health` endpoint tidak response 200

**Solusi**:
```typescript
// Test health endpoint
app.get('/health', async (req, res) => {
  try {
    // Test DB connection
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'OK',
      database: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      database: 'disconnected',
      error: error.message,
    });
  }
});
```

### 7. Performance Issues

#### Slow API responses
**Check**:
1. Database indexes
2. N+1 query problem
3. Large JSON responses

**Solution**:
```sql
-- Add indexes di Supabase
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_votes_target ON votes(target_type, target_id);
```

#### High CPU usage
**Penyebab**: 
- Inefficient code
- Too many concurrent requests

**Solusi**:
1. Add caching (Redis)
2. Optimize algorithms
3. Use pagination
4. Add rate limiting (already implemented)

### 8. Deployment Issues

#### Deployment stuck/timeout
**Solusi**:
1. Cancel deployment
2. Check Railway status: https://railway.statuspage.io
3. Try redeploy
4. Contact Railway support

#### Old version still running
**Solusi**:
1. Check active deployment di Railway
2. Force redeploy:
   - Dashboard > Service > ... > Redeploy

#### Multiple instances running
**Solusi**:
- Railway free tier: 1 instance only
- Scale settings: Dashboard > Service > Settings > Scale

### 9. Logging & Monitoring

#### Can't see logs
**Solusi**:
```typescript
// Add structured logging
import morgan from 'morgan';

if (config.nodeEnv === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}
```

#### Monitor errors
**Integrate error tracking**:
- Sentry
- LogRocket
- Datadog

```typescript
// Example with Sentry
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: config.nodeEnv,
});

app.use(Sentry.Handlers.errorHandler());
```

### 10. Security Issues

#### API accessible without auth
**Check middleware**:
```typescript
// routes/questions.routes.ts
router.post('/', authMiddleware, validateQuestion, createQuestion);
//              ^^^^^^^^^^^^^^ Must have this
```

#### Rate limit not working
**Check**:
```typescript
// app.ts
app.use('/api/', limiter); // Apply to all /api/* routes
```

## 📞 Getting Help

1. **Railway Logs**: Primary source of truth
   ```bash
   railway logs --follow
   ```

2. **Railway Discord**: https://discord.gg/railway
   - Very active community
   - Railway team responds quickly

3. **Railway Docs**: https://docs.railway.app

4. **Supabase Support**: https://supabase.com/support
   - For database issues

## 🔍 Debug Checklist

When deployment fails:

- [ ] Check Railway deployment logs
- [ ] Verify all environment variables set
- [ ] Test health endpoint
- [ ] Check Supabase database status
- [ ] Verify Dockerfile syntax
- [ ] Test build locally: `npm run build`
- [ ] Test production locally: `npm run start`
- [ ] Check Railway service status
- [ ] Review recent code changes
- [ ] Check .dockerignore not excluding critical files

## 💡 Pro Tips

1. **Test locally first**: Always test production build locally
   ```bash
   npm run build
   NODE_ENV=production npm run start
   ```

2. **Use Railway CLI**: Faster iteration
   ```bash
   railway logs --follow
   ```

3. **Monitor metrics**: Set up alerts for:
   - High error rate
   - High response time
   - Memory/CPU spikes

4. **Gradual rollout**: Test in staging environment first

5. **Keep dependencies updated**: Security & performance

6. **Database backups**: Supabase provides daily backups (verify in dashboard)

---

**Still stuck?** Check Railway Discord or create GitHub issue di repository project.
