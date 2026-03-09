FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code (bao gồm cả public/images)
COPY . .

# Create data và uploads directories
RUN mkdir -p /app/data /app/public/uploads

# List để debug
RUN ls -la /app/public/ && ls -la /app/public/images/ | head -10

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Start the server
CMD ["node", "server.js"]
