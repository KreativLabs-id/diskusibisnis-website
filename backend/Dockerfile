# Dockerfile for Diskusi Bisnis backend (Fly.io)
# Multi-stage build for optimized production image

FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files from backend folder
COPY backend/package.json ./
COPY backend/package-lock.json* ./

# Install all dependencies (including devDependencies for build)
RUN if [ -f package-lock.json ]; then npm ci --only=production=false; else npm install; fi

# Copy source code from backend folder
COPY backend/ ./

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN if [ -f package-lock.json ]; then npm ci --only=production; else npm install --only=production; fi

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Environment
ENV NODE_ENV=production
ENV PORT=8080

# Expose port (Fly.io will use internal_port from fly.toml)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:'+(process.env.PORT||5000)+'/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server
CMD ["node", "dist/server.js"]