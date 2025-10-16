FROM node:18-alpine

WORKDIR /app

# Install curl for health check
RUN apk add --no-cache curl

# Package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Install dev dependencies for build
RUN npm install typescript ts-node-dev

# Copy source
COPY server/ ./server/
COPY public/ ./public/
COPY config/ ./config/
COPY data/ ./data/

# Build TypeScript
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start
CMD ["node", "dist/index.js"]