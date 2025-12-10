# S0LSTICE_OS Server Setup Guide

Complete guide for setting up the WebSocket server for real-time multiplayer functionality.

> **Default Port: 5055** (S0-55 for S0lstice)

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Automated Setup](#automated-setup)
4. [Manual Production Setup](#manual-production-setup)
5. [Configuration](#configuration)
6. [Real-time Features](#real-time-features)
7. [Client Configuration](#client-configuration)
8. [Monitoring](#monitoring)
9. [Troubleshooting](#troubleshooting)
10. [Security](#security)

---

## Overview

The S0LSTICE_OS WebSocket server enables real-time synchronization between players and the Dungeon Master (DM). It handles:

- **Dice Rolls** - Live shared dice rolling visible to all players
- **Combat Encounters** - DM-controlled combat state synchronization
- **XP Awards** - DM can award XP to specific players in real-time
- **Codex/Bestiary** - Share lore and creature information
- **Quest Updates** - Synchronized quest progress
- **Map Pins** - Shared map markers and locations
- **Messages** - In-game messaging between players and NPCs
- **Initiative Tracking** - Combat turn order management

### Port Selection

The default port **5055** was chosen because:
- "S0-55" represents "S0lstice" (the app name)
- It's above 1024 (doesn't require root privileges)
- It's not used by common services
- It's easy to remember

---

## Quick Start

### Option 1: Local Development (Simplest)

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install ws

# Start the server (runs on port 5055)
node websocket-server.cjs
```

Verify it's running:
```bash
curl http://localhost:5055/health
```

Connect from the app: `ws://localhost:5055/ws`

### Option 2: Automated Production Setup

```bash
# Make the script executable
chmod +x server/setup-server.sh

# Run with sudo for full automation
sudo ./server/setup-server.sh

# Or with SSL for a domain:
sudo ./server/setup-server.sh --ssl your-domain.com
```

The script handles:
- ✅ Node.js installation
- ✅ PM2 process manager
- ✅ Firewall configuration (UFW/firewalld)
- ✅ Nginx reverse proxy
- ✅ SSL certificates (optional)
- ✅ Auto-start on boot

---

## Automated Setup

The `setup-server.sh` script provides plug-and-play installation:

```bash
# Usage
./setup-server.sh              # Local dev mode
sudo ./setup-server.sh         # Production with auto-detection
sudo ./setup-server.sh --ssl domain.com   # Production with SSL

# Options
--ssl [DOMAIN]   Enable SSL with Let's Encrypt
--domain DOMAIN  Set domain name
--port PORT      Override default port (5055)
--dev            Force development mode
--help           Show help
```

### What the Script Does

1. **Checks/Installs Node.js 18+**
2. **Sets up application directory** (`/opt/s0lstice-server`)
3. **Installs PM2** for process management
4. **Configures firewall** (opens ports 22, 80, 443, 5055)
5. **Sets up Nginx** as reverse proxy
6. **Obtains SSL certificate** via Let's Encrypt (if requested)
7. **Starts the server** and configures auto-start

---

## Manual Production Setup

If you prefer manual setup:

### Step 1: Install Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version  # Should be v18.x.x+
```

### Step 2: Deploy Server

```bash
# Create app directory
sudo mkdir -p /opt/s0lstice-server
sudo chown $USER:$USER /opt/s0lstice-server

# Copy server file
cp server/websocket-server.cjs /opt/s0lstice-server/

# Install dependencies
cd /opt/s0lstice-server
npm install ws
```

### Step 3: Install PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start server with PM2
pm2 start websocket-server.cjs --name s0lstice-ws

# Configure auto-start
pm2 startup
pm2 save
```

### Step 4: Configure Firewall

```bash
# Allow required ports
sudo ufw allow 22/tcp    # SSH (important!)
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 5055/tcp  # WebSocket (direct access)

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Step 5: Setup Nginx (Recommended)

```bash
# Install Nginx
sudo apt install -y nginx

# Copy configuration
sudo cp server/nginx.conf /etc/nginx/sites-available/s0lstice

# Edit domain name
sudo nano /etc/nginx/sites-available/s0lstice

# Enable site
sudo ln -s /etc/nginx/sites-available/s0lstice /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### Step 6: SSL Certificate

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5055` | WebSocket server port |

Examples:
```bash
# Direct
PORT=9000 node websocket-server.cjs

# With PM2
PORT=9000 pm2 start websocket-server.cjs --name s0lstice-ws
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
| `map_pin_add` | Add map pin | No |
| `map_pin_remove` | Remove map pin | No |
| `message` | Send message | No |
| `contact_sync` | Sync contact | No |
| `combat_update` | Update combat state | No |
| `encounter_sync` | Sync encounter | Yes |
| `xp_award` | Award XP to player | Yes |
| `initiative_update` | Update initiative order | Yes |
| `note_sync` | Sync notes | No |
| `shared_note` | Share note with players | Yes |
| `ping` | Ping for latency check | No |
| `get_users` | Request user list | No |
| `get_game_state` | Request game state | No |

### Message Types (Server → Client)

| Type | Description |
|------|-------------|
| `connected` | Connection confirmed |
| `user_joined` | New user connected |
| `user_left` | User disconnected |
| `user_updated` | User info changed |
| `user_list` | List of connected users |
| `dice_roll` | Dice roll broadcast |
| `codex_sync` | Codex data received |
| `bestiary_sync` | Bestiary data received |
| `quest_sync` | Quest update received |
| `map_sync` | Map pins received |
| `map_update` | Single pin update |
| `map_pin_add` | New pin added |
| `map_pin_remove` | Pin removed |
| `message` | Message received |
| `combat_update` | Combat state update |
| `encounter_sync` | Encounter data |
| `xp_award` | XP awarded (to target) |
| `xp_announcement` | XP award broadcast |
| `initiative_update` | Initiative order |
| `note_sync` | Note data received |
| `shared_note` | Shared note from DM |
| `game_state` | Full game state |
| `pong` | Ping response |
| `error` | Error message |
| `server_shutdown` | Server shutting down |

---

## Client Configuration

### In the S0LSTICE_OS App

1. Open the application
2. Navigate to **Settings** (gear icon)
3. Find **Multiplayer Server** section
4. Enter your server URL:
   - **Local**: `ws://localhost:5055/ws`
   - **Remote (no SSL)**: `ws://YOUR_IP:5055/ws`
   - **Remote (with SSL)**: `wss://your-domain.com/ws`
5. Click **Connect**

### Connection URLs

| Environment | WebSocket URL |
|-------------|---------------|
| Local Dev | `ws://localhost:5055/ws` |
| LAN (IP) | `ws://192.168.x.x:5055/ws` |
| Production (IP) | `ws://YOUR_PUBLIC_IP:5055/ws` |
| Production (Domain) | `wss://your-domain.com/ws` |

---

## Monitoring

### Health Check

```bash
curl http://localhost:5055/health
# or
curl https://your-domain.com/health
```

Response:
```json
{
  "status": "ok",
  "uptime": 3600.123,
  "connections": 5,
  "clients": [
    {
      "id": "client_abc123",
      "character": "Marcus",
      "isDM": false,
      "connectedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "timestamp": "2024-01-15T11:30:00.000Z"
}
```

### Statistics

```bash
curl http://localhost:5055/stats
```

Response:
```json
{
  "totalConnections": 150,
  "totalMessages": 5000,
  "totalDiceRolls": 1200,
  "currentConnections": 5,
  "uptime": 86400.5
}
```

### PM2 Commands

```bash
pm2 status              # View all processes
pm2 logs s0lstice-ws    # View logs
pm2 logs s0lstice-ws --lines 100  # Last 100 lines
pm2 monit               # Real-time monitoring
pm2 restart s0lstice-ws # Restart server
pm2 stop s0lstice-ws    # Stop server
pm2 flush s0lstice-ws   # Clear logs
```

### Nginx Logs

```bash
# Access logs
tail -f /var/log/nginx/s0lstice-access.log

# Error logs
tail -f /var/log/nginx/s0lstice-error.log
```

---

## Troubleshooting

### Connection Refused

1. **Check if server is running**:
   ```bash
   pm2 status
   curl http://localhost:5055/health
   ```

2. **Check firewall**:
   ```bash
   sudo ufw status
   # Port 5055 should be ALLOW
   ```

3. **Check Nginx** (if using):
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

### Port Already in Use

```bash
# Find what's using the port
sudo lsof -i :5055

# Kill the process if needed
sudo kill -9 <PID>

# Or use a different port
PORT=5056 pm2 start websocket-server.cjs --name s0lstice-ws
```

### SSL Errors

1. **Verify certificates**:
   ```bash
   sudo certbot certificates
   ls -la /etc/letsencrypt/live/your-domain.com/
   ```

2. **Renew if expired**:
   ```bash
   sudo certbot renew
   ```

### WebSocket Disconnections

1. **Check logs for timeout**:
   ```bash
   pm2 logs s0lstice-ws | grep "timed out"
   ```

2. **Increase Nginx timeouts** in `/etc/nginx/sites-available/s0lstice`:
   ```nginx
   proxy_read_timeout 86400s;  # 24 hours
   ```

3. **Restart services**:
   ```bash
   pm2 restart s0lstice-ws
   sudo systemctl reload nginx
   ```

---

## Security

### Best Practices

1. **Always use WSS (SSL) in production**
2. **Keep Node.js and dependencies updated**
3. **Use firewall** - only open necessary ports
4. **Monitor logs** for suspicious activity
5. **Use strong SSL configuration**

### Updating

```bash
cd /opt/s0lstice-server
npm update
pm2 restart s0lstice-ws
```

### SSL Auto-Renewal

Certbot sets up auto-renewal. Verify:
```bash
sudo systemctl status certbot.timer
```

---

## Quick Reference

### Default Ports

| Service | Port |
|---------|------|
| **WebSocket Server** | **5055** |
| HTTP (Nginx) | 80 |
| HTTPS (Nginx) | 443 |

### Essential Commands

```bash
# Start
pm2 start s0lstice-ws

# Stop
pm2 stop s0lstice-ws

# Restart
pm2 restart s0lstice-ws

# Logs
pm2 logs s0lstice-ws

# Status
pm2 status

# Health check
curl http://localhost:5055/health
```

### File Locations

| File | Path |
|------|------|
| Server script | `/opt/s0lstice-server/websocket-server.cjs` |
| PM2 ecosystem | `~/.pm2/` |
| Nginx config | `/etc/nginx/sites-available/s0lstice` |
| SSL certs | `/etc/letsencrypt/live/your-domain.com/` |
| Nginx logs | `/var/log/nginx/s0lstice-*.log` |

---

## Support

For issues or feature requests, please open an issue on the GitHub repository.
