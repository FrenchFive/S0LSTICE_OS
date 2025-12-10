#!/bin/bash

#############################################
# S0LSTICE_OS Server - Plug & Play Setup
# 
# Automated setup script for the WebSocket server
# Default Port: 5055 (S0-55 for S0lstice)
#
# Usage: 
#   ./setup-server.sh              # Local dev mode
#   sudo ./setup-server.sh         # Production mode
#   sudo ./setup-server.sh --ssl mydomain.com
#
#############################################

set -e

# ==========================================
# CONFIGURATION
# ==========================================

# Default port: 5055 = "S0-55" (S0lstice)
DEFAULT_PORT=5055
PORT=${PORT:-$DEFAULT_PORT}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="/opt/s0lstice-server"
SERVICE_NAME="s0lstice-ws"

# Options
DOMAIN=""
SETUP_SSL=false
DEV_MODE=false

# ==========================================
# PARSE ARGUMENTS
# ==========================================

while [[ $# -gt 0 ]]; do
    case $1 in
        --ssl)
            SETUP_SSL=true
            if [[ -n "$2" && ! "$2" =~ ^-- ]]; then
                DOMAIN="$2"
                shift
            fi
            shift
            ;;
        --domain)
            DOMAIN="$2"
            shift 2
            ;;
        --port)
            PORT="$2"
            shift 2
            ;;
        --dev)
            DEV_MODE=true
            shift
            ;;
        --help|-h)
            echo "S0LSTICE_OS WebSocket Server Setup"
            echo ""
            echo "Usage:"
            echo "  ./setup-server.sh              # Local development"
            echo "  sudo ./setup-server.sh         # Production (auto-detect)"
            echo "  sudo ./setup-server.sh --ssl domain.com"
            echo ""
            echo "Options:"
            echo "  --ssl [DOMAIN]   Enable SSL with Let's Encrypt"
            echo "  --domain DOMAIN  Set domain name"
            echo "  --port PORT      Set port (default: 5055)"
            echo "  --dev            Development mode (local only)"
            echo "  --help           Show this help"
            echo ""
            echo "Default Port: 5055 (S0-55 for S0lstice)"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# ==========================================
# HELPER FUNCTIONS
# ==========================================

print_banner() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════╗"
    echo "║     S0LSTICE_OS WebSocket Server Setup    ║"
    echo "║         Port: $PORT (S0-55)               ║"
    echo "╚═══════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "\n${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}  ✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}  ⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}  ✗ $1${NC}"
}

print_info() {
    echo -e "${CYAN}  ℹ $1${NC}"
}

check_command() {
    command -v "$1" &> /dev/null
}

# ==========================================
# DETECT ENVIRONMENT
# ==========================================

print_banner

# Check if running as root for production
if [[ $EUID -eq 0 ]]; then
    print_info "Running as root - production mode"
    DEV_MODE=false
elif [[ $DEV_MODE == false ]]; then
    print_warning "Not running as root - switching to development mode"
    DEV_MODE=true
fi

echo ""
echo "Configuration:"
echo "  Mode:    $([ $DEV_MODE == true ] && echo 'Development' || echo 'Production')"
echo "  Port:    $PORT"
echo "  Domain:  ${DOMAIN:-'(auto-detect)'}"
echo "  SSL:     $SETUP_SSL"
echo ""

# ==========================================
# STEP 1: INSTALL NODE.JS
# ==========================================

print_step "Step 1: Checking Node.js"

if check_command node; then
    NODE_VERSION=$(node --version)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    
    if [[ $MAJOR_VERSION -ge 18 ]]; then
        print_success "Node.js $NODE_VERSION installed"
    else
        print_warning "Node.js $NODE_VERSION is too old (need v18+)"
        if [[ $DEV_MODE == false ]]; then
            print_info "Installing Node.js 18..."
            curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
            apt-get install -y nodejs
            print_success "Node.js $(node --version) installed"
        else
            print_error "Please install Node.js 18+ manually"
            exit 1
        fi
    fi
else
    if [[ $DEV_MODE == false ]]; then
        print_info "Installing Node.js 18..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
        print_success "Node.js $(node --version) installed"
    else
        print_error "Node.js not found. Please install Node.js 18+"
        exit 1
    fi
fi

# ==========================================
# STEP 2: SETUP APPLICATION
# ==========================================

print_step "Step 2: Setting up application"

if [[ $DEV_MODE == true ]]; then
    APP_DIR="$SCRIPT_DIR"
    print_info "Using local directory: $APP_DIR"
else
    mkdir -p "$APP_DIR"
    
    # Copy server file
    if [[ -f "$SCRIPT_DIR/websocket-server.cjs" ]]; then
        cp "$SCRIPT_DIR/websocket-server.cjs" "$APP_DIR/"
        print_success "Server files copied to $APP_DIR"
    else
        print_error "websocket-server.cjs not found!"
        exit 1
    fi
fi

cd "$APP_DIR"

# Install dependencies
if [[ ! -d "node_modules" ]] || [[ ! -d "node_modules/ws" ]]; then
    print_info "Installing dependencies..."
    npm install ws --save 2>/dev/null || npm install ws
fi
print_success "Dependencies ready"

# ==========================================
# STEP 3: INSTALL PM2
# ==========================================

print_step "Step 3: Setting up PM2 process manager"

if check_command pm2; then
    print_success "PM2 already installed"
else
    print_info "Installing PM2..."
    npm install -g pm2
    print_success "PM2 installed"
fi

# ==========================================
# STEP 4: CONFIGURE FIREWALL
# ==========================================

if [[ $DEV_MODE == false ]]; then
    print_step "Step 4: Configuring firewall"
    
    if check_command ufw; then
        # Check if ufw is active
        if ufw status | grep -q "Status: active"; then
            print_info "Configuring UFW firewall..."
            
            # Allow SSH (important!)
            ufw allow 22/tcp >/dev/null 2>&1 || true
            
            # Allow HTTP/HTTPS
            ufw allow 80/tcp >/dev/null 2>&1
            ufw allow 443/tcp >/dev/null 2>&1
            
            # Allow WebSocket port
            ufw allow $PORT/tcp >/dev/null 2>&1
            
            print_success "Firewall configured (ports: 22, 80, 443, $PORT)"
        else
            print_warning "UFW is installed but not active"
            print_info "To enable: sudo ufw enable"
        fi
    elif check_command firewall-cmd; then
        print_info "Configuring firewalld..."
        firewall-cmd --permanent --add-port=80/tcp >/dev/null 2>&1
        firewall-cmd --permanent --add-port=443/tcp >/dev/null 2>&1
        firewall-cmd --permanent --add-port=$PORT/tcp >/dev/null 2>&1
        firewall-cmd --reload >/dev/null 2>&1
        print_success "Firewall configured (ports: 80, 443, $PORT)"
    else
        print_warning "No firewall detected (ufw/firewalld)"
        print_info "Make sure port $PORT is accessible"
    fi
else
    print_step "Step 4: Skipping firewall (dev mode)"
fi

# ==========================================
# STEP 5: INSTALL NGINX (Production only)
# ==========================================

if [[ $DEV_MODE == false ]]; then
    print_step "Step 5: Setting up Nginx reverse proxy"
    
    if ! check_command nginx; then
        print_info "Installing Nginx..."
        apt-get install -y nginx >/dev/null 2>&1
    fi
    print_success "Nginx installed"
    
    # Determine server_name
    if [[ -n "$DOMAIN" ]]; then
        SERVER_NAME="$DOMAIN"
    else
        # Try to get public IP
        PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "_")
        SERVER_NAME="$PUBLIC_IP"
    fi
    
    # Create Nginx config
    NGINX_CONF="/etc/nginx/sites-available/s0lstice"
    
    cat > "$NGINX_CONF" << EOF
# S0LSTICE_OS WebSocket Server
# Port: $PORT

upstream s0lstice_ws {
    server 127.0.0.1:$PORT;
    keepalive 64;
}

server {
    listen 80;
    server_name $SERVER_NAME;

    # WebSocket endpoint
    location /ws {
        proxy_pass http://s0lstice_ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeouts for long-lived connections
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
        proxy_connect_timeout 60s;
    }

    # Health check
    location /health {
        proxy_pass http://s0lstice_ws/health;
    }

    # Stats
    location /stats {
        proxy_pass http://s0lstice_ws/stats;
    }

    access_log /var/log/nginx/s0lstice-access.log;
    error_log /var/log/nginx/s0lstice-error.log;
}
EOF

    # Enable site
    ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/ 2>/dev/null || true
    
    # Remove default site if exists
    rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
    
    # Test and reload
    nginx -t >/dev/null 2>&1
    systemctl reload nginx
    
    print_success "Nginx configured for $SERVER_NAME"
else
    print_step "Step 5: Skipping Nginx (dev mode)"
fi

# ==========================================
# STEP 6: SSL CERTIFICATE (Optional)
# ==========================================

if [[ $SETUP_SSL == true && -n "$DOMAIN" && $DEV_MODE == false ]]; then
    print_step "Step 6: Setting up SSL certificate"
    
    if ! check_command certbot; then
        print_info "Installing Certbot..."
        apt-get install -y certbot python3-certbot-nginx >/dev/null 2>&1
    fi
    
    print_info "Obtaining SSL certificate for $DOMAIN..."
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email || {
        print_warning "Certbot failed - you may need to set up DNS first"
        print_info "Run manually: sudo certbot --nginx -d $DOMAIN"
    }
    
    print_success "SSL configured"
else
    print_step "Step 6: Skipping SSL"
fi

# ==========================================
# STEP 7: START SERVER
# ==========================================

print_step "Step 7: Starting WebSocket server"

cd "$APP_DIR"

# Stop existing if running
pm2 stop $SERVICE_NAME 2>/dev/null || true
pm2 delete $SERVICE_NAME 2>/dev/null || true

# Start with PM2
PORT=$PORT pm2 start websocket-server.cjs --name $SERVICE_NAME

# Save PM2 config
pm2 save >/dev/null 2>&1

# Setup startup (production only)
if [[ $DEV_MODE == false ]]; then
    pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true
    print_success "PM2 startup configured"
fi

print_success "Server started on port $PORT"

# ==========================================
# VERIFY
# ==========================================

print_step "Verifying installation"

sleep 2

if curl -s "http://localhost:$PORT/health" | grep -q "ok"; then
    print_success "Health check passed!"
else
    print_warning "Health check pending - server may still be starting"
fi

# ==========================================
# COMPLETE
# ==========================================

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Setup Complete!                   ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}Connection URLs:${NC}"
if [[ $DEV_MODE == true ]]; then
    echo "  Local:  ws://localhost:$PORT/ws"
else
    if [[ -n "$DOMAIN" ]]; then
        if [[ $SETUP_SSL == true ]]; then
            echo "  Secure: wss://$DOMAIN/ws"
        else
            echo "  Domain: ws://$DOMAIN/ws"
        fi
    fi
    if [[ -n "$PUBLIC_IP" && "$PUBLIC_IP" != "_" ]]; then
        echo "  IP:     ws://$PUBLIC_IP/ws"
    fi
    echo "  Direct: ws://YOUR_IP:$PORT/ws"
fi

echo ""
echo -e "${CYAN}Test the server:${NC}"
echo "  curl http://localhost:$PORT/health"

echo ""
echo -e "${CYAN}PM2 Commands:${NC}"
echo "  pm2 status              # View status"
echo "  pm2 logs $SERVICE_NAME    # View logs"
echo "  pm2 restart $SERVICE_NAME # Restart"

echo ""
echo -e "${CYAN}In S0LSTICE_OS App:${NC}"
echo "  1. Go to Settings"
echo "  2. Enter: ws://localhost:$PORT/ws (or your server URL)"
echo "  3. Click Connect"

echo ""
