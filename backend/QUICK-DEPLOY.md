# 🚀 Railway Deployment - Quick Reference

## Pre-Deploy Checklist

```bash
# 1. Test locally
npm run dev

# 2. Build test
npm run build

# 3. Production test
npm run start

# 4. Deployment readiness check
npm run check-deploy
```

## Railway Setup (5 minutes)

### Via Web Dashboard

1. **Create Project**
   - Go to [railway.app/new](https://railway.app/new)
   - Click "Deploy from GitHub repo"
   - Select `diskusibisnis-website`

2. **Configure Service**
   - Root Directory: `backend`
   - Start Command: (leave empty, uses Dockerfile CMD)

3. **Set Environment Variables**
   ```bash
   NODE_ENV=production
   PORT=${{PORT}}
   DATABASE_URL=<your-supabase-url>
   JWT_SECRET=<generate-random-32-chars>
   CORS_ORIGIN=<your-frontend-url>
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   SUPABASE_URL=<your-supabase-url>
   SUPABASE_ANON_KEY=<your-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-key>
   ```

4. **Generate Domain**
   - Settings > Networking > Generate Domain

5. **Deploy**
   - Railway auto-deploys after env vars set

### Via CLI (Faster)

```bash
# Install CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
cd backend
railway init

# Deploy
railway up

# Get domain
railway domain create
```

## Environment Variables - Copy Paste Template

```env
NODE_ENV=production
PORT=${{PORT}}
DATABASE_URL=postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
JWT_SECRET=YOUR_SECURE_RANDOM_32_CHAR_SECRET_HERE
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SUPABASE_URL=https://[PROJECT].supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
```

## Generate JWT Secret

**Windows PowerShell:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Output example:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

## Quick Verification

### 1. Health Check
```bash
curl https://your-app.up.railway.app/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345.67
}
```

### 2. Test API Endpoint
```bash
curl https://your-app.up.railway.app/api/questions
```

### 3. View Logs
```bash
railway logs --follow
```

## Common Commands

| Action | Command |
|--------|---------|
| View logs | `railway logs` |
| Real-time logs | `railway logs --follow` |
| Redeploy | `railway up` |
| View variables | `railway variables` |
| Set variable | `railway variables set KEY=value` |
| Get domain | `railway domain` |
| Open in browser | `railway open` |
| Check status | `railway status` |

## File Structure (What Railway Needs)

```
backend/
├── Dockerfile           ✅ Multi-stage build config
├── railway.json         ✅ Railway settings
├── .dockerignore        ✅ Optimize build
├── package.json         ✅ Dependencies & scripts
├── tsconfig.json        ✅ TypeScript config
└── src/                 ✅ Source code
    ├── server.ts        ✅ Entry point
    └── ...
```

## Deployment Flow

```
1. Push to GitHub
   ↓
2. Railway detects changes
   ↓
3. Build Docker image
   ↓
4. Run tests (if configured)
   ↓
5. Deploy container
   ↓
6. Health check
   ↓
7. Live! 🎉
```

## Troubleshooting (30 seconds)

| Issue | Solution |
|-------|----------|
| Build fails | Check `railway logs`, verify Dockerfile |
| Can't connect to DB | Check DATABASE_URL, test with `railway run node -e "..."` |
| 502 Bad Gateway | Service crashed, check logs |
| CORS error | Update CORS_ORIGIN variable |
| Port error | Railway auto-assigns, don't hardcode |

## Cost Estimate

**Free Tier:**
- $5 credit/month
- ~500 hours execution
- Perfect for testing

**Developer Plan ($5/month):**
- $5 credit + pay-as-you-go
- Production ready
- Custom domains

**Typical usage:**
- Small app: $0-5/month
- Medium traffic: $5-15/month

## Important URLs

- 🏠 Railway Dashboard: https://railway.app/dashboard
- 📚 Documentation: https://docs.railway.app
- 💬 Discord Support: https://discord.gg/railway
- 📊 Status Page: https://railway.statuspage.io

## Next Steps After Deployment

1. ✅ Test all API endpoints
2. ✅ Update frontend with new backend URL
3. ✅ Setup monitoring/alerts (optional)
4. ✅ Configure custom domain (optional)
5. ✅ Setup CI/CD pipeline (optional)

## Pro Tips 💡

- ⚡ Railway auto-redeploys on git push
- 🔒 Never commit .env files
- 📊 Monitor metrics tab regularly
- 🐛 Use `railway logs --follow` for debugging
- 💾 Supabase handles DB backups automatically
- 🚀 Test locally before deploy: `npm run check-deploy`

## Support

**Issues?** 
1. Check logs: `railway logs`
2. See: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
3. Railway Discord: Response dalam ~5 menit
4. Create issue di GitHub repo

---

**Total Time:** ~10 minutes from zero to deployed! ⚡
