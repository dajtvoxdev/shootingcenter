# VPS Setup Scripts

## 📁 File Structure

```
scripts/
├── setup-vps.sh    # Script cài đặt Docker và cấu hình VPS
├── README.md       # Hướng dẫn này
```

## 🚀 Quick Start

### 1. SSH vào VPS

```bash
ssh username@34.124.192.94
```

### 2. Download và chạy setup script

```bash
# Cài đặt wget nếu chưa có
sudo apt-get update && sudo apt-get install -y wget

# Download script
wget https://raw.githubusercontent.com/dajtvoxdev/shootingcenter/master/scripts/setup-vps.sh

# Chạy script
chmod +x setup-vps.sh
./setup-vps.sh
```

### 3. Logout và login lại

```bash
exit
# SSH lại vào server
ssh username@34.124.192.94
```

### 4. Kiểm tra Docker

```bash
docker --version
docker-compose version
```

## 🔧 Manual Commands

Nếu không dùng script, bạn có thể chạy từng bước:

### Cài đặt Docker

```bash
# Update
sudo apt-get update

# Install prerequisites
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Add Docker GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Cấu hình Firewall

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

## 📊 Useful Commands

```bash
# Xem status containers
cd ~/shootingcenter && ./status.sh

# Xem logs
docker logs shootingcenter-frontend
docker logs shootingcenter-backend

# Restart containers
cd ~/shootingcenter && docker-compose restart

# Update và deploy mới
./deploy.sh

# Truy cập container backend
 docker exec -it shootingcenter-backend /bin/sh
```

## 🔒 Security Checklist

- [ ] Đổi SSH port (tùy chọn)
- [ ] Cấu hình SSH key authentication (bắt buộc)
- [ ] Tắt root login
- [ ] Cài đặt Fail2Ban (đã có trong script)
- [ ] Cấu hình UFW firewall (đã có trong script)
