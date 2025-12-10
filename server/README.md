# Hunters RPG WebSocket Server

Real-time multiplayer server for the Hunters RPG application.

## Quick Start

### Development (Local)

```bash
# Install dependencies
npm install ws

# Start server
node websocket-server.cjs

# Or with custom port
PORT=9000 node websocket-server.cjs
```

### Production (Automated)

```bash
# Run the setup script (as root)
sudo ./setup-server.sh --domain your-domain.com --ssl
```

## Manual Setup

See the complete [SERVER_SETUP.md](../SERVER_SETUP.md) guide for detailed instructions.

## Files

| File | Description |
|------|-------------|
| `websocket-server.cjs` | Main WebSocket server |
| `nginx.conf` | Example Nginx configuration |
| `setup-server.sh` | Automated setup script |

## Endpoints

| Endpoint | Type | Description |
|----------|------|-------------|
| `/ws` | WebSocket | Main connection endpoint |
| `/health` | HTTP GET | Health check with connection info |
| `/stats` | HTTP GET | Server statistics |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server port |

## Real-time Message Types

### Client → Server

| Type | Description |
|------|-------------|
| `set_character` | Set character info for this connection |
| `set_dm_mode` | Enable/disable DM mode |
| `dice_roll` | Broadcast a dice roll |
| `codex_sync` | Sync codex pages |
| `bestiary_sync` | Sync bestiary entries |
| `quest_sync` | Sync quest updates |
| `map_sync` | Sync all map pins |
| `map_update` | Update single map pin |
| `message` | Send chat message |
| `combat_update` | Update combat state |
| `encounter_sync` | Sync encounter (DM only) |
| `xp_award` | Award XP to player (DM only) |
| `ping` | Latency check |

### Server → Client

| Type | Description |
|------|-------------|
| `connected` | Connection successful |
| `user_joined` | New user connected |
| `user_left` | User disconnected |
| `user_updated` | User info changed |
| `dice_roll` | Dice roll from any player |
| `codex_sync` | Codex data synced |
| `bestiary_sync` | Bestiary data synced |
| `quest_sync` | Quest update |
| `map_sync` | Map pins synced |
| `map_update` | Single pin updated |
| `message` | Chat message received |
| `combat_update` | Combat state changed |
| `encounter_sync` | Encounter data from DM |
| `xp_award` | XP awarded to you |
| `pong` | Latency response |
| `error` | Error message |

## PM2 Commands

```bash
pm2 start websocket-server.cjs --name hunters-rpg  # Start
pm2 stop hunters-rpg                               # Stop
pm2 restart hunters-rpg                            # Restart
pm2 logs hunters-rpg                               # View logs
pm2 status                                         # View status
pm2 monit                                          # Monitor resources
```

## Nginx Setup

1. Copy `nginx.conf` to `/etc/nginx/sites-available/hunters-rpg`
2. Update `your-server-domain.com` to your domain
3. Update SSL certificate paths (if using HTTPS)
4. Enable: `ln -s /etc/nginx/sites-available/hunters-rpg /etc/nginx/sites-enabled/`
5. Test: `nginx -t`
6. Reload: `systemctl reload nginx`

## SSL with Let's Encrypt

```bash
# Install certbot
apt install certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

## Health Check

```bash
curl http://localhost:8080/health
```

Response:
```json
{
  "status": "ok",
  "uptime": 3600.5,
  "connections": 3,
  "clients": [
    {"id": "client_abc", "character": "Sir Galahad", "isDM": false}
  ],
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

## Troubleshooting

### Server won't start
- Check if port is in use: `lsof -i :8080`
- Check Node.js version: `node --version` (needs v18+)
- Check logs: `pm2 logs hunters-rpg`

### Connection refused
- Verify server is running: `pm2 status`
- Check firewall: `ufw status`
- Verify Nginx config: `nginx -t`

### SSL errors
- Check certificate: `certbot certificates`
- Renew if needed: `certbot renew`

## License

Part of the Hunters RPG project.
