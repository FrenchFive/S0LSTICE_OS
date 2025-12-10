#!/bin/bash
# S0LSTICE_OS - Automated Linux Server Setup Script
# This script sets up a complete Linux server for running the S0LSTICE_OS multiplayer server

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   log_error "This script should not be run as root. Run as a regular user with sudo privileges."
   exit 1
fi

# Check for sudo privileges
if ! sudo -v; then
    log_error "This script requires sudo privileges."
    exit 1
fi

log_info "Starting S0LSTICE_OS Server Setup..."
echo ""

# 1. Update system
log_info "Step 1/8: Updating system packages..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential
log_success "System updated successfully"
echo ""

# 2. Set timezone (optional, can be customized)
log_info "Step 2/8: Setting timezone..."
CURRENT_TZ=$(timedatectl show --value -p Timezone)
log_info "Current timezone: $CURRENT_TZ"
read -p "Do you want to change the timezone? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter timezone (e.g., America/New_York): " NEW_TZ
    sudo timedatectl set-timezone "$NEW_TZ"
    log_success "Timezone set to $NEW_TZ"
else
    log_info "Keeping current timezone"
fi
echo ""

# 3. Configure firewall
log_info "Step 3/8: Configuring firewall (UFW)..."
sudo apt install -y ufw

# Check if SSH is already allowed
if ! sudo ufw status | grep -q "22/tcp.*ALLOW"; then
    log_info "Allowing SSH (port 22)..."
    sudo ufw allow 22/tcp
    sudo ufw allow OpenSSH
fi

# Allow HTTP and HTTPS
log_info "Allowing HTTP (port 80) and HTTPS (port 443)..."
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall if not already enabled
if ! sudo ufw status | grep -q "Status: active"; then
    log_warning "Enabling firewall. Make sure SSH access is confirmed!"
    sudo ufw --force enable
fi

log_success "Firewall configured"
sudo ufw status verbose
echo ""

# 4. Install Node.js
log_info "Step 4/8: Installing Node.js 20.x LTS..."
if command -v node &> /dev/null; then
    CURRENT_NODE_VERSION=$(node --version)
    log_info "Node.js is already installed: $CURRENT_NODE_VERSION"
    read -p "Do you want to reinstall/upgrade? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Skipping Node.js installation"
    else
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt install -y nodejs
    fi
else
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

log_success "Node.js installed: $(node --version)"
log_success "npm installed: $(npm --version)"
echo ""

# 5. Install PM2
log_info "Step 5/8: Installing PM2 process manager..."
if command -v pm2 &> /dev/null; then
    log_info "PM2 is already installed: $(pm2 --version)"
else
    sudo npm install -g pm2
    log_success "PM2 installed: $(pm2 --version)"
fi
echo ""

# 6. Clone repository and setup WebSocket server
log_info "Step 6/8: Setting up WebSocket server..."
SERVER_DIR="/opt/s0lstice-os-server"

if [ -d "$SERVER_DIR" ]; then
    log_warning "Server directory already exists at $SERVER_DIR"
    read -p "Do you want to remove it and reinstall? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo rm -rf "$SERVER_DIR"
    else
        log_info "Skipping server setup"
        SERVER_DIR=""
    fi
fi

if [ -n "$SERVER_DIR" ]; then
    log_info "Creating server directory and cloning repository..."
    sudo mkdir -p "$SERVER_DIR"
    sudo chown $USER:$USER "$SERVER_DIR"
    cd "$SERVER_DIR"
    
    git clone https://github.com/FrenchFive/Role_Play.git .
    cd server
    
    log_info "Installing server dependencies..."
    npm install ws
    
    log_success "Server files installed at $SERVER_DIR"
    
    # Test server
    log_info "Testing WebSocket server..."
    timeout 3 node websocket-server.js || true
    
    # Start with PM2
    log_info "Starting server with PM2..."
    pm2 delete s0lstice-os 2>/dev/null || true
    pm2 start websocket-server.js --name s0lstice-os
    pm2 save
    
    # Setup PM2 startup
    log_info "Setting up PM2 to start on boot..."
    PM2_STARTUP=$(pm2 startup | tail -n 1)
    if [[ $PM2_STARTUP == sudo* ]]; then
        eval "$PM2_STARTUP"
    fi
    
    log_success "WebSocket server is running"
    pm2 status
fi
echo ""

# 7. Install and configure Nginx
log_info "Step 7/8: Installing and configuring Nginx..."
sudo apt install -y nginx

log_info "Nginx installed: $(nginx -v 2>&1)"

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Get domain or IP
echo ""
log_info "Nginx configuration:"
read -p "Enter your domain name (or press Enter to skip Nginx config): " DOMAIN

if [ -n "$DOMAIN" ]; then
    NGINX_CONFIG="/etc/nginx/sites-available/s0lstice-os"
    
    log_info "Creating Nginx configuration for $DOMAIN..."
    
    sudo tee "$NGINX_CONFIG" > /dev/null <<EOF
upstream websocket_backend {
    server localhost:8080;
}

server {
    listen 80;
    server_name $DOMAIN;

    location /ws {
        proxy_pass http://websocket_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    location /health {
        proxy_pass http://websocket_backend/health;
    }
}
EOF

    # Enable site
    sudo ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/
    
    # Remove default site
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload Nginx
    if sudo nginx -t; then
        sudo systemctl reload nginx
        log_success "Nginx configured for $DOMAIN"
    else
        log_error "Nginx configuration test failed"
    fi
    
    echo ""
    log_info "To secure your site with SSL, run:"
    echo "  sudo apt install -y certbot python3-certbot-nginx"
    echo "  sudo certbot --nginx -d $DOMAIN"
else
    log_info "Skipping Nginx domain configuration"
fi
echo ""

# 8. Install SSL certificate (optional)
read -p "Do you want to install SSL certificate with Let's Encrypt? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]] && [ -n "$DOMAIN" ]; then
    log_info "Step 8/8: Installing SSL certificate..."
    sudo apt install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d "$DOMAIN"
    log_success "SSL certificate installed"
else
    log_info "Step 8/8: Skipping SSL certificate installation"
fi
echo ""

# Final status check
log_info "=== Installation Summary ==="
echo ""
log_info "System Information:"
echo "  OS: $(lsb_release -d | cut -f2-)"
echo "  Node.js: $(node --version)"
echo "  npm: $(npm --version)"
echo "  PM2: $(pm2 --version)"
echo "  Nginx: $(nginx -v 2>&1 | cut -d'/' -f2)"
echo ""

log_info "Server Status:"
pm2 status
echo ""

log_info "Firewall Status:"
sudo ufw status
echo ""

if [ -n "$DOMAIN" ]; then
    log_success "Setup complete! Your server is ready."
    echo ""
    log_info "WebSocket URL: wss://$DOMAIN/ws"
    log_info "Health Check: https://$DOMAIN/health"
else
    SERVER_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')
    log_success "Setup complete! Your server is ready."
    echo ""
    log_info "WebSocket URL: ws://$SERVER_IP:8080"
    log_info "Health Check: http://$SERVER_IP:8080/health"
fi

echo ""
log_info "Useful commands:"
echo "  pm2 status              - Check server status"
echo "  pm2 logs s0lstice-os    - View server logs"
echo "  pm2 restart s0lstice-os - Restart server"
echo "  sudo systemctl status nginx - Check Nginx status"
echo "  sudo nginx -t           - Test Nginx configuration"
echo ""
log_success "Setup script completed successfully!"
