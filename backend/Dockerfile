# Dockerfile for Diskusi Bisnis backend (Railway)
# Multi-stage build for optimized production image

FROM node:20-alpine@sha256:2d5e8a8a51bc341fd5f2eed6d91455c3a3d147e91a14298fc564b5dc519c1666 AS builder

# Set working directory
WORKDIR /app

# Copy backend package files (Railway build context is repo root)
COPY backend/package.json backend/package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy backend source code into /app
COPY backend/. ./

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine@sha256:2d5e8a8a51bc341fd5f2eed6d91455c3a3d147e91a14298fc564b5dc519c1666

WORKDIR /app

# Copy package files
COPY --from=builder /app/package.json /app/package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev

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

# Expose port (Railway will assign PORT dynamically)
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:'+(process.env.PORT||5000)+'/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server
CMD ["node", "dist/server.js"]
