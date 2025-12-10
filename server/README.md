# Hunters RPG Multiplayer Server

This directory contains the WebSocket server configuration for multiplayer dice rolling functionality.

## Setup

### Installing the Server

1. **Install Node.js** on your server (v18 or higher recommended)

2. **Install dependencies**:
```bash
cd server
npm install ws
```

3. **Run the WebSocket server**:
```bash
node websocket-server.js
```

Or with PM2 for production:
```bash
npm install -g pm2
pm2 start websocket-server.js --name hunters-rpg-server
pm2 save
pm2 startup
```

### Nginx Configuration

1. **Install Nginx** on your server:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

2. **Copy the nginx configuration**:
```bash
sudo cp nginx.conf /etc/nginx/sites-available/hunters-rpg
sudo ln -s /etc/nginx/sites-available/hunters-rpg /etc/nginx/sites-enabled/
```

3. **Update the configuration**:
   - Replace `your-server-domain.com` with your actual domain
   - Update SSL certificate paths
   - Adjust the upstream port if needed

4. **Test and reload Nginx**:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-server-domain.com
```

## Firewall Configuration

Open the necessary ports:
```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# If running WebSocket server directly (not behind nginx)
sudo ufw allow 8080/tcp
```

## Environment Variables

You can configure the server using environment variables:

- `PORT`: WebSocket server port (default: 8080)

Example:
```bash
PORT=9000 node websocket-server.js
```

## Monitoring

### Check server status
```bash
# With PM2
pm2 status
pm2 logs hunters-rpg-server

# Check health endpoint
curl http://localhost:8080/health
```

### Nginx logs
```bash
tail -f /var/log/nginx/hunters-rpg-access.log
tail -f /var/log/nginx/hunters-rpg-error.log
```

## Client Configuration

In the Hunters RPG app:
1. Go to Settings
2. Enter your server IP/domain: `wss://your-server-domain.com/ws`
3. Click "Connect"

## Security Notes

- Always use WSS (WebSocket Secure) in production
- Keep your SSL certificates up to date
- Consider implementing rate limiting
- Use a firewall to restrict access if needed
- Monitor logs for suspicious activity

## Troubleshooting

### Connection refused
- Check if the WebSocket server is running
- Verify firewall rules
- Check Nginx configuration

### SSL errors
- Verify certificate paths in nginx.conf
- Ensure certificates are valid and not expired
- Check certificate permissions

### High latency
- Check server resources (CPU, RAM, network)
- Consider using a CDN or edge locations
- Optimize WebSocket message size
