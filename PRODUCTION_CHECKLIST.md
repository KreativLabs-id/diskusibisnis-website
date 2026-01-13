# 🚀 PRODUCTION DEPLOYMENT CHECKLIST

## Pre-Deployment Checks

### ✅ Code Quality
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] All security checks pass (`node scripts/security-check.js`)
- [ ] No console.log with sensitive data in production code

### ✅ Environment Variables (Vercel Dashboard)

**WAJIB di-set untuk Production:**

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | WAJIB! Enables strict security |
| `DATABASE_URL` | `postgresql://...` | Supabase connection string |
| `JWT_SECRET` | 64+ random chars | Generate dengan: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `CORS_ORIGIN` | `https://yourdomain.com` | Domain production, JANGAN * |
| `DB_SSL_REJECT_UNAUTHORIZED` | `true` | Wajib true di production |

**RECOMMENDED:**

| Variable | Value | Notes |
|----------|-------|-------|
| `REDIS_URL` | `redis://...` | Untuk rate limiting distributed |
| `CSRF_SECRET` | 64+ random chars | Jika tidak diset, pakai JWT_SECRET |

### ✅ Database

- [ ] Run migration: `psql -d $DATABASE_URL -f migrations/003_create_audit_logs.sql`
- [ ] Verify tables exist: `users`, `questions`, `answers`, `audit_logs`
- [ ] SSL enabled untuk database connection

### ✅ Security Headers Test

After deployment, test di: https://securityheaders.com
- Target: Grade A atau A+

### ✅ Frontend (Vercel Environment Variables)

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-url.com` |
| `NEXT_PUBLIC_FRONTEND_URL` | `https://your-frontend-url.com` |

---

## Deployment Commands

### Backend (Railway/Render/VPS)
```bash
# Build
npm run build

# Start production
npm start
```

### Frontend (Vercel)
```bash
# Auto-deployed via git push
git push origin main
```

---

## Post-Deployment Verification

### 1. Health Check
```bash
curl https://your-backend-url.com/health
# Should return: {"status":"ok","database":"connected",...}
```

### 2. Security Headers
```bash
curl -I https://your-frontend-url.com
# Verify headers:
# - X-Frame-Options: SAMEORIGIN
# - X-Content-Type-Options: nosniff
# - Content-Security-Policy: ...
# - Strict-Transport-Security: max-age=...
```

### 3. CSRF Token
```bash
curl -c cookies.txt https://your-backend-url.com/api/csrf-token
# Should return: {"success":true,"data":{"token":"..."}}
```

### 4. Rate Limiting
```bash
# Try 100+ requests quickly - should get 429 after limit
for i in {1..150}; do curl -s -o /dev/null -w "%{http_code}\n" https://your-backend-url.com/api/questions; done
```

---

## ⚠️ CRITICAL REMINDERS

1. **NEVER** commit `.env` files to git
2. **NEVER** use `NEXT_PUBLIC_` prefix for secrets
3. **NEVER** use `*` for CORS_ORIGIN in production
4. **ALWAYS** use HTTPS in production
5. **ALWAYS** generate new JWT_SECRET for production (don't reuse dev secret)

---

## Troubleshooting

### Error: Environment validation failed
1. Check all required env vars are set in Vercel dashboard
2. Ensure JWT_SECRET is 32+ characters
3. Ensure DATABASE_URL starts with `postgresql://`

### Error: CSRF validation failed
1. Frontend must call `/api/csrf-token` first
2. Frontend must include `X-CSRF-Token` header in POST/PUT/DELETE requests
3. Make sure cookies are enabled (sameSite, secure flags)

### Error: Rate limit exceeded
1. This is working as intended
2. If legitimate, increase limits in environment or wait

### Error: Database connection failed
1. Check DATABASE_URL is correct
2. Check DB_SSL_REJECT_UNAUTHORIZED=true
3. Check IP whitelist on Supabase if applicable
