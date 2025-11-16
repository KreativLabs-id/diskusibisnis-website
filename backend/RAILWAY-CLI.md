# Railway CLI Deployment (Alternative Method)

Jika Anda lebih suka deploy via CLI daripada web dashboard.

## Install Railway CLI

### Windows (PowerShell)
```powershell
iwr https://railway.app/install.ps1 -useb | iex
```

### macOS/Linux
```bash
curl -fsSL https://railway.app/install.sh | sh
```

## Login to Railway

```bash
railway login
```

Browser akan terbuka untuk autentikasi.

## Initialize Project

Di direktori `backend/`:

```bash
cd backend
railway init
```

Pilih:
- "Create a new project" atau pilih existing project
- Beri nama project: `diskusi-bisnis-backend`

## Link to Project

Jika sudah ada project:

```bash
railway link
```

Pilih project yang sudah dibuat.

## Set Environment Variables

### Method 1: Via File
Buat file `.env.railway`:

```bash
NODE_ENV=production
DATABASE_URL=your-supabase-connection-string
JWT_SECRET=your-generated-secret-here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Lalu:
```bash
railway variables --load .env.railway
```

### Method 2: Satu per satu
```bash
railway variables set NODE_ENV=production
railway variables set DATABASE_URL=your-connection-string
railway variables set JWT_SECRET=your-secret
# ... dst
```

## Deploy

### Auto-deploy dari Git
```bash
railway up
```

Railway akan:
1. Detect Dockerfile
2. Build image
3. Deploy container
4. Generate domain

### Manual deploy (detached)
```bash
railway up --detach
```

## View Logs

```bash
railway logs
```

Real-time logs:
```bash
railway logs --follow
```

## Get Domain

```bash
railway domain
```

Generate domain jika belum ada:
```bash
railway domain create
```

## Open in Browser

```bash
railway open
```

## Useful Commands

### Check status
```bash
railway status
```

### List all variables
```bash
railway variables
```

### Run commands in Railway environment
```bash
railway run node dist/server.js
```

### Connect to service shell
```bash
railway shell
```

### Delete deployment
```bash
railway down
```

## Environment Management

### List environments
```bash
railway environment
```

### Switch environment
```bash
railway environment production
railway environment staging
```

## CI/CD Integration

Railway CLI bisa diintegrasikan dengan GitHub Actions, GitLab CI, dll.

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Railway

on:
  push:
    branches: [main, master]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Railway
        run: npm i -g @railway/cli
      
      - name: Deploy to Railway
        run: railway up --detach
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        working-directory: ./backend
```

Get RAILWAY_TOKEN:
```bash
railway tokens create
```

Add to GitHub Secrets.

## Troubleshooting

### CLI not found after install
Restart terminal atau tambahkan ke PATH.

### Login issues
```bash
railway logout
railway login
```

### Build fails
Check logs:
```bash
railway logs --deployment
```

### Variables not loading
```bash
railway variables --service <service-name>
```

## Advantages of CLI

- ✅ Faster deployment workflow
- ✅ Better for CI/CD pipelines
- ✅ Script automation
- ✅ Team collaboration
- ✅ Version control for deployment configs

## Documentation

- [Railway CLI Docs](https://docs.railway.app/develop/cli)
- [Railway API Reference](https://docs.railway.app/reference/api-reference)

---

**Tip:** Railway CLI sangat cocok untuk developer yang prefer command line daripada web UI!
