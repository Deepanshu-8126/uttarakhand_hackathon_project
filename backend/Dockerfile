# ==============================================================================
# DISCOVERY UTTARAKHAND — BACKEND PRODUCTION DOCKERFILE
# Multi-stage production container for Node.js Express API
# ==============================================================================

FROM node:20-alpine AS deps

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies only with legacy peer deps support
# Resolves peer dependency conflict between multer-storage-cloudinary and cloudinary@2.x
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force

# ==============================================================================
# Production Runner Stage
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install curl for docker healthcheck
RUN apk add --no-cache curl

# Create non-root application user
RUN addgroup -S nodejs -g 1001 && \
    adduser -S nodeapp -u 1001 -G nodejs

# Copy package manifests and production node_modules from deps stage
COPY --chown=nodeapp:nodejs package*.json ./
COPY --from=deps --chown=nodeapp:nodejs /app/node_modules ./node_modules

# Copy source code (respecting .dockerignore)
COPY --chown=nodeapp:nodejs . .

# Ensure uploads directory exists with correct write permissions
RUN mkdir -p /app/uploads && chown -R nodeapp:nodejs /app/uploads

# Switch to non-root user
USER nodeapp

# Expose backend port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start production server
CMD ["node", "server.js"]
