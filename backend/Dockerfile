# Dockerfile for Diskusi Bisnis backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY backend/package.json ./
COPY backend/package-lock.json* ./

# Install dependencies (fallback ke npm install jika package-lock.json bermasalah)
RUN if [ -f package-lock.json ]; then npm ci --only=production --no-audit || npm install --only=production --no-audit; else npm install --only=production --no-audit; fi

# Copy source code
COPY backend/ ./

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY --from=builder /app/package*.json ./

# Install production dependencies only
RUN if [ -f package-lock.json ]; then npm ci --only=production --no-audit || npm install --only=production --no-audit; else npm install --only=production --no-audit; fi

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Security setup
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

# Environment
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:'+(process.env.PORT||5000)+'/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server
CMD ["node", "dist/server.js"]