# Hunters RPG Server Setup Guide

Complete guide for setting up the WebSocket server for real-time multiplayer functionality in Hunters RPG.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Production Deployment](#production-deployment)
5. [Configuration](#configuration)
6. [Real-time Features](#real-time-features)
7. [Client Configuration](#client-configuration)
8. [Monitoring](#monitoring)
9. [Troubleshooting](#troubleshooting)
10. [Security](#security)

---

## Overview

The Hunters RPG WebSocket server enables real-time synchronization between multiple players and the Dungeon Master (DM). It handles:

- **Dice Rolls** - Live shared dice rolling visible to all players
- **Combat Encounters** - DM-controlled combat state synchronization
- **XP Awards** - DM can award XP to specific players in real-time
- **Codex/Bestiary** - Share lore and creature information
- **Quest Updates** - Synchronized quest progress
- **Map Pins** - Shared map markers and locations
- **Messages** - In-game messaging between players and NPCs
- **Initiative Tracking** - Combat turn order management

---

## Prerequisites

- **Node.js** v18.0.0 or higher
- **npm** (comes with Node.js)
- **A server** with a public IP or domain (for remote play)
- **Optional**: Nginx (for SSL/reverse proxy)
- **Optional**: PM2 (for process management)
- **Optional**: SSL certificate (Let's Encrypt recommended)

---

## Quick Start

### Local Development

1. **Navigate to the server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install ws
   ```

3. **Start the server**:
   ```bash
   node websocket-server.cjs
   ```

4. **Verify it's running**:
   ```bash
   curl http://localhost:8080/health
   ```

   Expected response:
   ```json
   {"status":"ok","uptime":5.123,"connections":0,"clients":[],"timestamp":"..."}
   ```

5. **Connect from the app**:
   - Open Hunters RPG
   - Go to Settings
   - Enter server URL: `ws://localhost:8080/ws`
   - Click "Connect"

---

## Production Deployment

### Step 1: Server Setup

```bash
# SSH into your server
ssh user@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v18.x.x or higher
npm --version
```

### Step 2: Deploy the Server

```bash
# Create app directory
sudo mkdir -p /opt/hunters-rpg
sudo chown $USER:$USER /opt/hunters-rpg

# Copy server files
cd /opt/hunters-rpg
# Copy websocket-server.cjs to this directory

# Install dependencies
npm install ws

# Test run
node websocket-server.cjs
```

### Step 3: Install PM2 for Process Management

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the server with PM2
pm2 start websocket-server.cjs --name hunters-rpg

# Configure PM2 to start on boot
pm2 startup
pm2 save

# Useful PM2 commands:
pm2 status              # View running processes
pm2 logs hunters-rpg    # View logs
pm2 restart hunters-rpg # Restart server
pm2 stop hunters-rpg    # Stop server
```

### Step 4: Setup Nginx (Recommended)

```bash
# Install Nginx
sudo apt install -y nginx

# Create configuration file
sudo nano /etc/nginx/sites-available/hunters-rpg
```

Copy this configuration (replace `your-domain.com`):

```nginx
upstream websocket_backend {
    server 127.0.0.1:8080;
    keepalive 64;
}

server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration (update paths after running certbot)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # WebSocket endpoint
    location /ws {
        proxy_pass http://websocket_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket timeout settings
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
        proxy_connect_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://websocket_backend/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Stats endpoint
    location /stats {
        proxy_pass http://websocket_backend/stats;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Logs
    access_log /var/log/nginx/hunters-rpg-access.log;
    error_log /var/log/nginx/hunters-rpg-error.log;
}
```

Enable the configuration:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/hunters-rpg /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 5: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 6: Firewall Configuration

```bash
# Allow HTTP, HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# If running without Nginx, allow direct WebSocket port
sudo ufw allow 8080/tcp

# Enable firewall
sudo ufw enable
```

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | WebSocket server port |

Example:
```bash
PORT=9000 node websocket-server.cjs
```

Or with PM2:
```bash
PORT=9000 pm2 start websocket-server.cjs --name hunters-rpg
```

### Server Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ws` | WebSocket | Main WebSocket connection |
| `/health` | GET | Health check with connection info |
| `/stats` | GET | Server statistics |

---

## Real-time Features

### Message Types (Client → Server)

| Type | Description | DM Only |
|------|-------------|---------|
| `set_character` | Set character info | No |
| `set_dm_mode` | Enable/disable DM mode | No |
| `dice_roll` | Send a dice roll | No |
| `codex_sync` | Sync codex pages | No |
| `bestiary_sync` | Sync bestiary entries | No |
| `quest_sync` | Sync quest updates | No |
| `map_sync` | Sync map pins | No |
| `map_update` | Update single pin | No |
| `message` | Send message | No |
| `contact_sync` | Sync contact | No |
| `combat_update` | Update combat state | No |
| `encounter_sync` | Sync encounter | Yes |
| `xp_award` | Award XP to player | Yes |
| `initiative_update` | Update initiative order | Yes |
| `ping` | Ping for latency check | No |

### Message Types (Server → Client)

| Type | Description |
|------|-------------|
| `connected` | Connection confirmed |
| `user_joined` | New user connected |
| `user_left` | User disconnected |
| `user_updated` | User info changed |
| `dice_roll` | Dice roll broadcast |
| `codex_sync` | Codex data received |
| `bestiary_sync` | Bestiary data received |
| `quest_sync` | Quest update received |
| `map_sync` | Map pins received |
| `map_update` | Single pin update |
| `message` | Message received |
| `combat_update` | Combat state update |
| `encounter_sync` | Encounter data |
| `xp_award` | XP awarded (to target) |
| `initiative_update` | Initiative order |
| `pong` | Ping response |
| `error` | Error message |

---

## Client Configuration

### In the App

1. Open Hunters RPG application
2. Navigate to **Settings**
3. Find the **Multiplayer** section
4. Enter your server URL:
   - Local: `ws://localhost:8080/ws`
   - Production (no SSL): `ws://your-server-ip:8080/ws`
   - Production (with SSL): `wss://your-domain.com/ws`
5. Click **Connect**
6. Status should show "Connected" with ping time

### Connection States

- **Disconnected** - Not connected to server
- **Connecting** - Attempting to connect
- **Connected** - Successfully connected (shows ping)
- **Reconnecting** - Lost connection, attempting to reconnect

---

## Monitoring

### Health Check

```bash
# Basic health check
curl https://your-domain.com/health

# Response:
{
  "status": "ok",
  "uptime": 3600.123,
  "connections": 5,
  "clients": [
    {
      "id": "client_abc123_xyz789",
      "character": "Sir Galahad",
      "isDM": false,
      "connectedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "timestamp": "2024-01-15T11:30:00.000Z"
}
```

### Statistics

```bash
curl https://your-domain.com/stats

# Response:
{
  "totalConnections": 150,
  "totalMessages": 5000,
  "totalDiceRolls": 1200,
  "currentConnections": 5,
  "uptime": 86400.5
}
```

### PM2 Logs

```bash
# View live logs
pm2 logs hunters-rpg

# View last 100 lines
pm2 logs hunters-rpg --lines 100

# Clear logs
pm2 flush hunters-rpg
```

### Nginx Logs

```bash
# Access logs
tail -f /var/log/nginx/hunters-rpg-access.log

# Error logs
tail -f /var/log/nginx/hunters-rpg-error.log
```

---

## Troubleshooting

### Connection Refused

1. **Check if server is running**:
   ```bash
   pm2 status
   # or
   curl http://localhost:8080/health
   ```

2. **Check firewall**:
   ```bash
   sudo ufw status
   ```

3. **Check Nginx** (if using):
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

### SSL Errors

1. **Verify certificates exist**:
   ```bash
   ls -la /etc/letsencrypt/live/your-domain.com/
   ```

2. **Check certificate validity**:
   ```bash
   sudo certbot certificates
   ```

3. **Renew if expired**:
   ```bash
   sudo certbot renew
   ```

### High Latency

1. **Check server resources**:
   ```bash
   htop
   ```

2. **Check network**:
   ```bash
   ping your-domain.com
   ```

3. **Check PM2 memory usage**:
   ```bash
   pm2 monit
   ```

### Disconnections

1. **Check heartbeat in logs**:
   ```bash
   pm2 logs hunters-rpg | grep "timed out"
   ```

2. **Increase Nginx timeouts** (if applicable):
   ```nginx
   proxy_read_timeout 7200s;  # 2 hours
   ```

3. **Check for memory leaks**:
   ```bash
   pm2 restart hunters-rpg  # Restart if memory is growing
   ```

---

## Security

### Best Practices

1. **Always use WSS (SSL) in production**
2. **Keep Node.js and dependencies updated**
3. **Use firewall to restrict access**
4. **Monitor logs for suspicious activity**
5. **Implement rate limiting** (future feature)
6. **Use strong SSL configuration**

### Updating Dependencies

```bash
cd /opt/hunters-rpg
npm update
pm2 restart hunters-rpg
```

### SSL Certificate Auto-Renewal

Certbot sets up auto-renewal automatically. Verify:

```bash
sudo systemctl status certbot.timer
```

---

## Quick Reference

### Start/Stop Commands

```bash
# Start server
pm2 start hunters-rpg

# Stop server
pm2 stop hunters-rpg

# Restart server
pm2 restart hunters-rpg

# View status
pm2 status

# View logs
pm2 logs hunters-rpg
```

### URLs

| Environment | WebSocket URL |
|-------------|--------------|
| Local Dev | `ws://localhost:8080/ws` |
| Production (IP) | `ws://YOUR_IP:8080/ws` |
| Production (Domain) | `wss://your-domain.com/ws` |

### Default Ports

| Service | Port |
|---------|------|
| WebSocket Server | 8080 |
| HTTP | 80 |
| HTTPS | 443 |

---

## Support

For issues or feature requests, please open an issue on the GitHub repository.
