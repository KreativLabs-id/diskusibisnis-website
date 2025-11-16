# Deployment Guide: Fly.io untuk Diskusi Bisnis Backend

## Prerequisites

1. Install Fly.io CLI:
```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Verify installation
fly version
```

2. Login ke Fly.io:
```bash
fly auth login
```

## Setup & Deployment Steps

### 1. Create Fly.io App

```bash
cd backend
fly launch --no-deploy
```

Pilih options:
- App name: `diskusi-bisnis-backend` (atau nama yang tersedia)
- Region: Singapore (sin) - terdekat dengan Indonesia
- PostgreSQL: No (karena sudah pakai Supabase)
- Redis: No (optional, jika tidak diperlukan)

### 2. Set Environment Variables (Secrets)

```bash
# Database credentials
fly secrets set DATABASE_URL="postgresql://user:password@host:port/database"

# JWT Secret
fly secrets set JWT_SECRET="your-jwt-secret-key"

# Supabase credentials
fly secrets set SUPABASE_URL="https://your-project.supabase.co"
fly secrets set SUPABASE_KEY="your-supabase-anon-key"
fly secrets set SUPABASE_JWT_SECRET="your-supabase-jwt-secret"

# Optional: Additional secrets sesuai kebutuhan
fly secrets set CORS_ORIGIN="https://your-frontend-domain.com"
```

### 3. Deploy

```bash
fly deploy
```

### 4. Verify Deployment

```bash
# Check app status
fly status

# View logs
fly logs

# Check health endpoint
fly open /health
```

## Useful Fly.io Commands

```bash
# Scale app
fly scale count 1  # Set number of instances

# Scale VM resources
fly scale vm shared-cpu-1x --memory 512

# View current configuration
fly config display

# SSH into the app
fly ssh console

# Restart app
fly restart

# View secrets
fly secrets list

# Remove a secret
fly secrets unset SECRET_NAME

# Monitor in real-time
fly logs -f

# Check app info
fly info
```

## Environment Variables Required

Pastikan environment variables berikut sudah di-set:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key untuk JWT authentication
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase anon/public key
- `SUPABASE_JWT_SECRET` - Supabase JWT secret
- `CORS_ORIGIN` (optional) - Frontend domain untuk CORS

## Troubleshooting

### App tidak start:
```bash
fly logs
```

### Database connection error:
```bash
# Pastikan DATABASE_URL correct
fly secrets set DATABASE_URL="postgresql://..."
fly restart
```

### Port issues:
- Fly.io menggunakan port 8080 internal (sudah dikonfigurasi)
- External port adalah 443 (HTTPS) dan 80 (HTTP redirect)

### Health check failing:
- Pastikan endpoint `/health` ada dan respond dengan status 200
- Check logs: `fly logs`

## Performance Optimization

### Auto-scaling (sudah configured di fly.toml):
- `auto_stop_machines = true` - Stop when idle
- `auto_start_machines = true` - Start on request
- `min_machines_running = 0` - No minimum (cost optimization)

### Change if needed:
```bash
# Always keep 1 machine running
fly scale count 1 --max-per-region 3
```

## Cost Optimization

Konfigurasi saat ini dioptimalkan untuk biaya minimal:
- 512MB RAM, 1 shared CPU
- Auto-stop when idle
- Min machines = 0

Free tier Fly.io mencakup:
- Up to 3 shared-cpu-1x VMs with 256MB RAM each
- 3GB persistent volume storage
- 160GB outbound data transfer

## Custom Domain

```bash
# Add custom domain
fly certs add api.yourdomain.com

# Check certificate status
fly certs show api.yourdomain.com
```

Kemudian add CNAME record di DNS:
```
CNAME api yourdomain.com -> diskusi-bisnis-backend.fly.dev
```

## Monitoring

```bash
# Real-time logs
fly logs -f

# App metrics
fly dashboard

# Health checks
fly checks list
```

## Production Checklist

- [ ] All secrets set via `fly secrets`
- [ ] Database connection tested
- [ ] Health endpoint responding
- [ ] CORS configured for production domain
- [ ] Logs monitored (no errors)
- [ ] Custom domain configured (optional)
- [ ] Backup strategy for database
- [ ] Monitoring/alerting setup

## Support

- Fly.io Docs: https://fly.io/docs/
- Community: https://community.fly.io/
- Status: https://status.fly.io/
