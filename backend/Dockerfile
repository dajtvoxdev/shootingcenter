FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create directories
RUN mkdir -p /app/data /app/public/uploads /app/seed-data

# Copy seed data to seed-data directory (will be synced to data on startup)
COPY data/*.json /app/seed-data/
COPY public/images /app/public/images

# List seed data for debugging
RUN ls -la /app/seed-data/ && echo "--- Seed data copied ---"

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Use entrypoint to sync data before starting
ENTRYPOINT ["docker-entrypoint.sh"]
