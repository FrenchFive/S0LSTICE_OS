#!/bin/bash

#############################################
# Hunters RPG Server Setup Script
# 
# This script automates the setup of the
# WebSocket server for Hunters RPG multiplayer
#
# Usage: sudo ./setup-server.sh [OPTIONS]
#
# Options:
#   --domain DOMAIN    Set your domain name
#   --port PORT        Set WebSocket port (default: 8080)
#   --ssl              Setup SSL with Let's Encrypt
#   --no-nginx         Skip Nginx installation
#   --dev              Development mode (local only)
#############################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DOMAIN=""
PORT=8080
SETUP_SSL=false
INSTALL_NGINX=true
DEV_MODE=false
APP_DIR="/opt/hunters-rpg"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --domain)
            DOMAIN="$2"
            shift 2
            ;;
        --port)
            PORT="$2"
            shift 2
            ;;
        --ssl)
            SETUP_SSL=true
            shift
            ;;
        --no-nginx)
            INSTALL_NGINX=false
            shift
            ;;
        --dev)
            DEV_MODE=true
            shift
            ;;
        --help)
            echo "Usage: sudo ./setup-server.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --domain DOMAIN    Set your domain name"
            echo "  --port PORT        Set WebSocket port (default: 8080)"
            echo "  --ssl              Setup SSL with Let's Encrypt"
            echo "  --no-nginx         Skip Nginx installation"
            echo "  --dev              Development mode (local only)"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Functions
print_header() {
    echo -e "\n${BLUE}============================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}============================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

check_root() {
    if [[ $DEV_MODE == false && $EUID -ne 0 ]]; then
        print_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Check if running as root for production
if [[ $DEV_MODE == false ]]; then
    check_root
fi

print_header "Hunters RPG Server Setup"

echo "Configuration:"
echo "  Domain:       ${DOMAIN:-'(none - IP only)'}"
echo "  Port:         $PORT"
echo "  SSL:          $SETUP_SSL"
echo "  Nginx:        $INSTALL_NGINX"
echo "  Dev Mode:     $DEV_MODE"
echo ""

# Confirm
read -p "Continue with setup? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

#############################################
# Step 1: Install Node.js
#############################################
print_header "Step 1: Installing Node.js"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js already installed: $NODE_VERSION"
    
    # Check version is 18+
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [[ $MAJOR_VERSION -lt 18 ]]; then
        print_warning "Node.js version is less than 18. Upgrading..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    fi
else
    echo "Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    print_success "Node.js installed: $(node --version)"
fi

#############################################
# Step 2: Setup Application Directory
#############################################
print_header "Step 2: Setting up Application"

if [[ $DEV_MODE == true ]]; then
    APP_DIR="$SCRIPT_DIR"
    print_success "Using development directory: $APP_DIR"
else
    mkdir -p $APP_DIR
    
    # Copy server file
    if [[ -f "$SCRIPT_DIR/websocket-server.cjs" ]]; then
        cp "$SCRIPT_DIR/websocket-server.cjs" "$APP_DIR/"
        print_success "Copied websocket-server.cjs to $APP_DIR"
    else
        print_error "websocket-server.cjs not found in $SCRIPT_DIR"
        exit 1
    fi
fi

cd $APP_DIR

# Install dependencies
echo "Installing npm dependencies..."
npm install ws
print_success "Dependencies installed"

#############################################
# Step 3: Install PM2
#############################################
print_header "Step 3: Installing PM2"

if command -v pm2 &> /dev/null; then
    print_success "PM2 already installed"
else
    echo "Installing PM2..."
    npm install -g pm2
    print_success "PM2 installed"
fi

#############################################
# Step 4: Start the Server
#############################################
print_header "Step 4: Starting WebSocket Server"

# Stop existing instance if running
pm2 stop hunters-rpg 2>/dev/null || true
pm2 delete hunters-rpg 2>/dev/null || true

# Start server with PM2
PORT=$PORT pm2 start websocket-server.cjs --name hunters-rpg

# Configure PM2 to start on boot (production only)
if [[ $DEV_MODE == false ]]; then
    pm2 startup systemd -u root --hp /root
    pm2 save
    print_success "PM2 configured for startup"
fi

print_success "Server started on port $PORT"

#############################################
# Step 5: Install Nginx (Optional)
#############################################
if [[ $INSTALL_NGINX == true && $DEV_MODE == false ]]; then
    print_header "Step 5: Installing Nginx"
    
    if command -v nginx &> /dev/null; then
        print_success "Nginx already installed"
    else
        apt-get install -y nginx
        print_success "Nginx installed"
    fi
    
    # Create Nginx configuration
    NGINX_CONF="/etc/nginx/sites-available/hunters-rpg"
    
    if [[ -n "$DOMAIN" ]]; then
        SERVER_NAME="$DOMAIN"
    else
        SERVER_NAME="_"
    fi
    
    cat > $NGINX_CONF << EOF
upstream websocket_backend {
    server 127.0.0.1:$PORT;
    keepalive 64;
}

server {
    listen 80;
    server_name $SERVER_NAME;

    location /ws {
        proxy_pass http://websocket_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
        proxy_connect_timeout 60s;
    }

    location /health {
        proxy_pass http://websocket_backend/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location /stats {
        proxy_pass http://websocket_backend/stats;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    access_log /var/log/nginx/hunters-rpg-access.log;
    error_log /var/log/nginx/hunters-rpg-error.log;
}
EOF

    # Enable site
    ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
    
    # Test and reload Nginx
    nginx -t
    systemctl reload nginx
    
    print_success "Nginx configured"
fi

#############################################
# Step 6: Setup SSL (Optional)
#############################################
if [[ $SETUP_SSL == true && -n "$DOMAIN" && $DEV_MODE == false ]]; then
    print_header "Step 6: Setting up SSL"
    
    # Install Certbot
    if ! command -v certbot &> /dev/null; then
        apt-get install -y certbot python3-certbot-nginx
    fi
    
    # Obtain certificate
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    
    print_success "SSL certificate installed"
else
    if [[ $SETUP_SSL == true && -z "$DOMAIN" ]]; then
        print_warning "Skipping SSL: No domain specified"
    fi
fi

#############################################
# Step 7: Configure Firewall
#############################################
if [[ $DEV_MODE == false ]]; then
    print_header "Step 7: Configuring Firewall"
    
    if command -v ufw &> /dev/null; then
        ufw allow 80/tcp
        ufw allow 443/tcp
        
        if [[ $INSTALL_NGINX == false ]]; then
            ufw allow $PORT/tcp
        fi
        
        print_success "Firewall configured"
    else
        print_warning "UFW not installed, skipping firewall configuration"
    fi
fi

#############################################
# Complete
#############################################
print_header "Setup Complete!"

echo -e "${GREEN}Server is running!${NC}\n"

echo "Connection URLs:"
if [[ $DEV_MODE == true ]]; then
    echo "  WebSocket: ws://localhost:$PORT/ws"
    echo "  Health:    http://localhost:$PORT/health"
else
    if [[ -n "$DOMAIN" ]]; then
        if [[ $SETUP_SSL == true ]]; then
            echo "  WebSocket: wss://$DOMAIN/ws"
            echo "  Health:    https://$DOMAIN/health"
        else
            echo "  WebSocket: ws://$DOMAIN/ws"
            echo "  Health:    http://$DOMAIN/health"
        fi
    else
        IP=$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_SERVER_IP")
        echo "  WebSocket: ws://$IP:$PORT/ws"
        echo "  Health:    http://$IP:$PORT/health"
    fi
fi

echo ""
echo "Useful commands:"
echo "  pm2 status              # View server status"
echo "  pm2 logs hunters-rpg    # View logs"
echo "  pm2 restart hunters-rpg # Restart server"
echo "  pm2 stop hunters-rpg    # Stop server"
echo ""
echo "To verify the server is working:"
echo "  curl http://localhost:$PORT/health"
echo ""

# Quick health check
echo "Running health check..."
sleep 2
if curl -s http://localhost:$PORT/health | grep -q "ok"; then
    print_success "Health check passed!"
else
    print_warning "Health check failed - server may still be starting"
fi

echo ""
print_success "Setup completed successfully!"
