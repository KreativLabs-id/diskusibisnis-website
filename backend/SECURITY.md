# 🔐 Security Documentation

This document outlines the security measures implemented in the Diskusi Bisnis application.

## Table of Contents

1. [Environment Security](#environment-security)
2. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [Input Validation](#input-validation)
5. [Security Middleware](#security-middleware)
6. [Audit Logging](#audit-logging)
7. [File Upload Security](#file-upload-security)
8. [Security Checklist](#security-checklist)

---

## Environment Security

### Environment Variables

All sensitive configuration is stored in environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (NEVER prefix with NEXT_PUBLIC_) |
| `JWT_SECRET` | Yes | JWT signing secret (min 32 characters) |
| `REDIS_URL` | Recommended | Redis for distributed rate limiting |
| `CORS_ORIGIN` | Yes | Allowed CORS origins (comma-separated) |

### Security Validations

The application validates at startup:
- All required environment variables are present
- No sensitive data is exposed via `NEXT_PUBLIC_` prefix
- JWT secret meets minimum strength requirements
- Database URL is not publicly accessible

**Location:** `src/lib/env.ts`

---

## Authentication

### Password Policy

Enforced password requirements:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*)
- Not a commonly used password
- No sequential characters (abc, 123)
- No keyboard patterns (qwerty)

**Location:** `src/lib/password-policy.ts`

### JWT Configuration

- Tokens are signed with a strong secret
- Default expiration: 7 days
- Tokens are stored in HttpOnly cookies (secure in production)
- Support for both cookie and header-based authentication

---

## Rate Limiting

### Protection Levels

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| General API | 100-1000 | 15 min | DDoS protection |
| Login (IP) | 10 attempts | 15 min | Brute force protection |
| Login (Email) | 5 attempts | 15 min | Account protection |
| Password Reset | 3 attempts | 1 hour | Abuse prevention |
| OTP Request | 5 attempts | 10 min | Spam prevention |

### Implementation

- In-memory storage (development)
- Redis storage (production, recommended)
- Automatic IP blocking after excessive failed attempts

**Location:** 
- `src/middlewares/rate-limit.middleware.ts`
- `src/config/redis.ts`

---

## Input Validation

### Zod Schemas

All user inputs are validated using Zod schemas:

- **Email**: Format validation, length limits, XSS prevention
- **Password**: Strength requirements
- **Text content**: XSS pattern detection
- **Slugs**: Alphanumeric + hyphens only
- **URLs**: HTTP/HTTPS only, length limits
- **UUIDs**: Format validation

**Location:** `src/lib/validations.ts`

### XSS Protection

Multiple layers of XSS protection:

1. **Input sanitization**: Remove dangerous patterns
2. **Event handler removal**: Strip onclick, onmouseover, etc.
3. **Script tag removal**: Block `<script>` tags
4. **Protocol sanitization**: Block javascript:, data: URLs

**Location:** `src/lib/security.ts`

---

## Security Middleware

### Applied Middleware (in order)

1. **Security Headers**: HSTS, X-Frame-Options, CSP, etc.
2. **Helmet**: Comprehensive security headers
3. **User-Agent Blocking**: Block security scanners
4. **Path Blocking**: Block common attack paths
5. **HPP**: Prevent HTTP Parameter Pollution
6. **XSS-Clean**: Data sanitization
7. **Path Traversal Detection**: Block `../` patterns
8. **SQL Injection Detection**: Block SQL patterns
9. **XSS Detection**: Log XSS attempts

### Blocked User-Agents

The following tools are automatically blocked:
- sqlmap, nikto, burp suite
- nmap, acunetix, nessus
- dirbuster, gobuster, ffuf
- Python scripts (requests, urllib)
- wget, curl (raw)

### Blocked Paths

Common attack paths are blocked:
- `.env`, `.git`, `.svn`
- `wp-admin`, `phpmyadmin`
- `shell.php`, `c99.php`
- Path traversal patterns

**Location:** `src/middlewares/security.middleware.ts`

---

## Audit Logging

### Logged Events

| Event Type | Severity | Description |
|------------|----------|-------------|
| `login_success` | info | Successful login |
| `login_failure` | warning | Failed login attempt |
| `logout` | info | User logout |
| `registration` | info | New user registration |
| `password_change` | info | Password changed |
| `blocked_request` | warning | Request blocked by security |
| `sql_injection_attempt` | error | SQL injection detected |
| `xss_attempt` | warning | XSS pattern detected |
| `path_traversal_attempt` | error | Path traversal detected |
| `rate_limit_exceeded` | warning | Rate limit hit |
| `admin_action` | info | Admin performed action |

### Storage

- Primary: PostgreSQL `audit_logs` table
- Fallback: In-memory buffer (if DB unavailable)
- Console logging for immediate visibility

**Location:** `src/middlewares/audit.middleware.ts`

---

## File Upload Security

### Validation Checks

1. **MIME Type Verification**: Check declared MIME type
2. **Extension Validation**: Match extension to MIME type
3. **Magic Bytes Check**: Verify file content headers
4. **Size Limits**: Enforce maximum file sizes
5. **Dangerous Extension Block**: Block executables, scripts

### Allowed File Types

| Type | Extensions | Max Size |
|------|------------|----------|
| Images | .jpg, .png, .gif, .webp | 10 MB |
| Documents | .pdf, .doc, .docx | 25 MB |
| Videos | .mp4, .webm | 100 MB |

### Blocked Extensions

Automatically blocked:
`.exe, .php, .js, .bat, .sh, .dll, .jar, .py, .rb, .vbs`

**Location:** `src/lib/file-security.ts`

---

## Security Checklist

### Pre-Deployment

- [ ] All environment variables set correctly
- [ ] `NODE_ENV=production` is set
- [ ] `DATABASE_URL` is NOT prefixed with NEXT_PUBLIC_
- [ ] Strong `JWT_SECRET` (32+ characters)
- [ ] `REDIS_URL` configured for distributed rate limiting
- [ ] `CORS_ORIGIN` set to specific domains (not *)
- [ ] SSL/TLS enabled (HTTPS only)

### Database

- [ ] Connection uses SSL
- [ ] Connection pooling configured
- [ ] Audit logs table created
- [ ] Regular backup schedule

### Monitoring

- [ ] Audit logs reviewed regularly
- [ ] Rate limit alerts configured
- [ ] Error tracking enabled (Sentry/similar)
- [ ] Uptime monitoring active

---

## Testing Security

### Manual Tests

1. **SQL Injection**: Try `' OR 1=1 --` in search fields
2. **XSS**: Try `<script>alert('xss')</script>` in inputs
3. **Rate Limiting**: Attempt 20 rapid login attempts
4. **Path Traversal**: Try `../../etc/passwd` in URLs
5. **Auth Bypass**: Access admin routes without login

### Expected Results

- SQL injection → 400 Bad Request + logged
- XSS → sanitized or blocked + logged
- Rate limiting → 429 Too Many Requests
- Path traversal → 400 Bad Request + logged
- Auth bypass → 401 Unauthorized

---

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** open a public issue
2. Email: security@diskusibisnis.com
3. Include detailed reproduction steps
4. Allow 48 hours for initial response

---

*Last updated: January 2026*
