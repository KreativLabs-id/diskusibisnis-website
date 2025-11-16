# Dockerfile for Diskusi Bisnis backend (Railway)

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (better cache)
COPY package*.json ./
RUN npm install --production=false

# Copy source code
COPY . .

# Build TypeScript to dist
RUN npm run build

# Environment
ENV NODE_ENV=production

# Expose app port (Railway will override, but good practice)
EXPOSE 5000

# Start the server
CMD ["npm", "run", "start"]
