# Hunters RPG Multiplayer Server Setup Guide

Complete guide to setting up a Linux server for Hunters RPG multiplayer functionality.

## Table of Contents
1. [Server Requirements](#server-requirements)
2. [Initial Server Setup](#initial-server-setup)
3. [Firewall Configuration](#firewall-configuration)
4. [Node.js Installation](#nodejs-installation)
5. [WebSocket Server Setup](#websocket-server-setup)
6. [Nginx Installation & Configuration](#nginx-installation--configuration)
7. [SSL Certificate Setup](#ssl-certificate-setup)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Server Requirements

### Minimum Specifications
- **OS**: Ubuntu 20.04 LTS or newer
- **RAM**: 1GB minimum, 2GB recommended
- **CPU**: 1 vCPU minimum
- **Storage**: 20GB
- **Network**: Static IP or domain name

---

## Initial Server Setup

### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential
```

### 2. Set Timezone

```bash
sudo timedatched set-timezone America/New_York
timedatectl
```

---

## Firewall Configuration

```bash
# Install and configure UFW
sudo apt install -y ufw

# IMPORTANT: Allow SSH first!
sudo ufw allow 22/tcp
sudo ufw allow OpenSSH

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status verbose
```

---

## Node.js Installation

```bash
# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version

# Install PM2
sudo npm install -g pm2
```

---

## WebSocket Server Setup

```bash
# Create directory
sudo mkdir -p /opt/hunters-rpg-server
cd /opt/hunters-rpg-server

# Clone repository
sudo git clone https://github.com/FrenchFive/Role_Play.git .
cd server

# Install dependencies
npm install ws

# Test server
node websocket-server.js
# Press Ctrl+C to stop

# Start with PM2
pm2 start websocket-server.js --name hunters-rpg
pm2 save
pm2 startup
# Follow the instructions shown
```

---

## Nginx Installation & Configuration

```bash
# Install Nginx
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Create Configuration

```bash
sudo nano /etc/nginx/sites-available/hunters-rpg
```

Paste this configuration (replace `your-domain.com`):

```nginx
upstream websocket_backend {
    server localhost:8080;
}

server {
    listen 80;
    server_name your-domain.com;

    location /ws {
        proxy_pass http://websocket_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    location /health {
        proxy_pass http://websocket_backend/health;
    }
}
```

### Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/hunters-rpg /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL Certificate Setup

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## Testing

```bash
# Check server health
curl https://your-domain.com/health

# View logs
pm2 logs hunters-rpg

# Monitor server
pm2 monit
```

---

## Troubleshooting

### Server not starting
```bash
pm2 logs hunters-rpg --err
sudo lsof -i :8080
```

### Nginx errors
```bash
sudo nginx -t
sudo tail -100 /var/log/nginx/error.log
```

### Firewall issues
```bash
sudo ufw status
sudo netstat -tlnp
```

---

## Quick Commands

```bash
# PM2
pm2 restart hunters-rpg
pm2 stop hunters-rpg
pm2 logs hunters-rpg

# Nginx
sudo systemctl restart nginx
sudo systemctl reload nginx
sudo nginx -t

# Firewall
sudo ufw status
sudo ufw enable/disable
```

---

## Connection URL

**Use in app:** `wss://your-domain.com/ws`

Enter this in Settings → Server Configuration.

---

For detailed documentation, see the full guide in the repository.
