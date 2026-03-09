#!/bin/bash

# ============================================
# Setup Script for Ubuntu 22.04 LTS
# Shooting Center Deployment
# ============================================

set -e

SERVER_IP="34.124.192.94"
APP_DIR="$HOME/shootingcenter"

echo "🚀 Setting up Shooting Center on Ubuntu 22.04..."

# ============================================
# 1. Update System
# ============================================
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# ============================================
# 2. Install Docker (Official Method)
# ============================================
echo "🐳 Installing Docker..."

# Remove old versions if exists
sudo apt-get remove -y docker docker-engine docker.io containerd runc || true

# Install prerequisites
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

# ============================================
# 3. Install Docker Compose v2
# ============================================
echo "🐳 Installing Docker Compose..."
# Docker Compose đã được cài cùng với docker-compose-plugin ở trên
# Tạo alias cho docker compose
echo 'alias docker-compose="docker compose"' >> ~/.bashrc

# ============================================
# 4. Create App Directory Structure
# ============================================
echo "📁 Creating app directory..."
mkdir -p $APP_DIR
mkdir -p $APP_DIR/backend-data
mkdir -p $APP_DIR/backend-uploads

# ============================================
# 5. Create Docker Compose File
# ============================================
echo "📝 Creating docker-compose.yml..."

cat > $APP_DIR/docker-compose.yml << 'EOF'
version: '3.8'

services:
  frontend:
    image: ghcr.io/dajtvoxdev/shootingcenter-frontend:latest
    container_name: shootingcenter-frontend
    ports:
      - "80:80"
    restart: unless-stopped
    depends_on:
      - backend
    networks:
      - shootingcenter-network

  backend:
    image: ghcr.io/dajtvoxdev/shootingcenter-backend:latest
    container_name: shootingcenter-backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - CORS_ORIGIN=http://34.124.192.94
    volumes:
      - ./backend-data:/app/data
      - ./backend-uploads:/app/public/uploads
    restart: unless-stopped
    networks:
      - shootingcenter-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  shootingcenter-network:
    driver: bridge
EOF

# ============================================
# 6. Configure Firewall (UFW)
# ============================================
echo "🔥 Configuring firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# ============================================
# 7. Install Fail2Ban (Security)
# ============================================
echo "🔒 Installing Fail2Ban..."
sudo apt-get install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# ============================================
# 8. Create Deploy Script
# ============================================
echo "📝 Creating deploy script..."

cat > $APP_DIR/deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Deploying Shooting Center..."

cd ~/shootingcenter

# Pull latest images
echo "📥 Pulling latest images..."
docker pull ghcr.io/dajtvoxdev/shootingcenter-frontend:latest
docker pull ghcr.io/dajtvoxdev/shootingcenter-backend:latest

# Stop and remove old containers
echo "🛑 Stopping old containers..."
docker-compose down || true

# Start new containers
echo "▶️ Starting new containers..."
docker-compose up -d

# Cleanup
echo "🧹 Cleaning up..."
docker system prune -f

echo "✅ Deployment completed!"
echo "🌐 Website: http://34.124.192.94"
echo "🔌 API: http://34.124.192.94/api/"
EOF

chmod +x $APP_DIR/deploy.sh

# ============================================
# 9. Create Monitoring Script
# ============================================
cat > $APP_DIR/status.sh << 'EOF'
#!/bin/bash
echo "📊 Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "💾 Disk Usage:"
df -h | grep -E "(Filesystem|/dev/)"

echo ""
echo "🧠 Memory Usage:"
free -h

echo ""
echo "🌐 Server IP: 34.124.192.94"
EOF

chmod +x $APP_DIR/status.sh

# ============================================
# 10. Auto-start Docker on Boot
# ============================================
sudo systemctl enable docker

# ============================================
# Complete
# ============================================
echo ""
echo "=========================================="
echo "✅ Setup completed!"
echo "=========================================="
echo ""
echo "📋 Next steps:"
echo "1. Logout và login lại để apply docker group:"
echo "   exit"
echo "   # SSH lại vào server"
echo ""
echo "2. Cấu hình GitHub Secrets:"
echo "   - VPS_HOST: 34.124.192.94"
echo "   - VPS_USERNAME: $USER"
echo "   - VPS_SSH_KEY: (copy private key của bạn)"
echo ""
echo "3. Sau khi push code lên GitHub, chạy thủ công lần đầu:"
echo "   cd ~/shootingcenter"
echo "   ./deploy.sh"
echo ""
echo "4. Kiểm tra status:"
echo "   ./status.sh"
echo ""
echo "🌐 Website sẽ chạy tại: http://34.124.192.94"
echo "=========================================="
