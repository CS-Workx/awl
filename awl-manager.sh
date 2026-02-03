#!/bin/bash

# AWL Scanner Management Script
# Usage: ./awl-manager.sh [install|update|start|stop|restart|status|logs]

set -e

# Configuration
APP_DIR="/var/www/tools.superworker.be/html/awl"
APP_NAME="awl-scanner"
GIT_REPO="https://github.com/CS-Workx/awl.git"
NODE_VERSION="18"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root"
        exit 1
    fi
}

check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        print_info "Install Node.js ${NODE_VERSION}.x first:"
        echo "  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -"
        echo "  apt-get install -y nodejs"
        exit 1
    fi
    print_success "Node.js $(node -v) found"
}

check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        print_warning "PM2 is not installed. Installing globally..."
        npm install -g pm2
        print_success "PM2 installed"
    else
        print_success "PM2 $(pm2 -v) found"
    fi
}

# Installation function
install() {
    print_info "Starting AWL Scanner installation..."
    
    check_root
    check_node
    check_pm2
    
    # Check if directory exists
    if [ -d "$APP_DIR" ]; then
        print_warning "Directory $APP_DIR already exists"
        read -p "Remove and reinstall? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Stopping application if running..."
            pm2 delete $APP_NAME 2>/dev/null || true
            print_info "Removing existing directory..."
            rm -rf "$APP_DIR"
        else
            print_error "Installation cancelled"
            exit 1
        fi
    fi
    
    # Create parent directory if needed
    mkdir -p "$(dirname "$APP_DIR")"
    
    # Clone repository
    print_info "Cloning repository from $GIT_REPO..."
    git clone "$GIT_REPO" "$APP_DIR"
    cd "$APP_DIR"
    
    # Install dependencies
    print_info "Installing Node.js dependencies..."
    npm install --omit=dev
    
    # Create data directory
    mkdir -p data
    
    # Check for .env file
    if [ ! -f .env ]; then
        print_warning ".env file not found"
        print_info "Creating .env from example..."
        cp .env.example .env
        print_warning "Please edit .env with your configuration:"
        echo "  nano $APP_DIR/.env"
        print_warning "Required variables:"
        echo "  - GEMINI_API_KEY"
        echo "  - MICROSOFT_CLIENT_ID"
        echo "  - MICROSOFT_CLIENT_SECRET"
        echo "  - MICROSOFT_TENANT_ID"
        echo "  - SENDER_EMAIL"
    else
        print_success ".env file found"
    fi
    
    # Start application
    print_info "Starting application with PM2..."
    pm2 start src/server.js --name "$APP_NAME"
    pm2 save
    
    # Setup PM2 startup
    print_info "Setting up PM2 startup script..."
    pm2 startup systemd -u root --hp /root
    
    print_success "AWL Scanner installed successfully!"
    print_info "Application running at: http://localhost:3001/awl"
    print_info "Check status with: ./awl-manager.sh status"
}

# Update function
update() {
    print_info "Updating AWL Scanner..."
    
    check_root
    
    if [ ! -d "$APP_DIR" ]; then
        print_error "Application not installed at $APP_DIR"
        print_info "Run: ./awl-manager.sh install"
        exit 1
    fi
    
    cd "$APP_DIR"
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        print_warning "Uncommitted changes detected"
        git status --short
        read -p "Stash changes and continue? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git stash push -m "Auto-stash before update $(date +%Y%m%d_%H%M%S)"
            print_success "Changes stashed"
        else
            print_error "Update cancelled"
            exit 1
        fi
    fi
    
    # Pull latest changes
    print_info "Pulling latest changes from GitHub..."
    git fetch origin
    CURRENT_COMMIT=$(git rev-parse HEAD)
    LATEST_COMMIT=$(git rev-parse origin/main)
    
    if [ "$CURRENT_COMMIT" = "$LATEST_COMMIT" ]; then
        print_success "Already up to date ($(git rev-parse --short HEAD))"
    else
        print_info "Updating from $(git rev-parse --short HEAD) to $(git rev-parse --short origin/main)"
        git pull origin main
        
        # Check if package.json changed
        if git diff --name-only $CURRENT_COMMIT $LATEST_COMMIT | grep -q "package.json"; then
            print_info "package.json changed, updating dependencies..."
            npm install --omit=dev
        fi
        
        print_success "Update complete"
    fi
    
    # Restart application
    print_info "Restarting application..."
    pm2 restart "$APP_NAME"
    
    print_success "AWL Scanner updated successfully!"
}

# Start function
start() {
    print_info "Starting AWL Scanner..."
    
    check_root
    
    if pm2 describe "$APP_NAME" &> /dev/null; then
        STATUS=$(pm2 describe "$APP_NAME" | grep status | awk '{print $4}')
        if [ "$STATUS" = "online" ]; then
            print_warning "Application is already running"
        else
            pm2 start "$APP_NAME"
            print_success "Application started"
        fi
    else
        print_info "Starting application for the first time..."
        cd "$APP_DIR"
        pm2 start src/server.js --name "$APP_NAME"
        pm2 save
        print_success "Application started"
    fi
    
    pm2 status "$APP_NAME"
}

# Stop function
stop() {
    print_info "Stopping AWL Scanner..."
    
    check_root
    
    if pm2 describe "$APP_NAME" &> /dev/null; then
        pm2 stop "$APP_NAME"
        print_success "Application stopped"
    else
        print_warning "Application is not running"
    fi
}

# Restart function
restart() {
    print_info "Restarting AWL Scanner..."
    
    check_root
    
    if pm2 describe "$APP_NAME" &> /dev/null; then
        # Kill zombie processes on port 3001
        print_info "Checking for zombie processes on port 3001..."
        lsof -ti:3001 | xargs -r kill -9 2>/dev/null || true
        
        pm2 restart "$APP_NAME"
        print_success "Application restarted"
        pm2 status "$APP_NAME"
    else
        print_warning "Application is not managed by PM2, starting..."
        start
    fi
}

# Status function
status() {
    print_info "AWL Scanner Status"
    echo ""
    
    if pm2 describe "$APP_NAME" &> /dev/null; then
        pm2 status "$APP_NAME"
        echo ""
        pm2 describe "$APP_NAME"
    else
        print_warning "Application is not running or not managed by PM2"
    fi
    
    # Check if port 3001 is in use
    echo ""
    print_info "Port 3001 status:"
    if lsof -i:3001 &> /dev/null; then
        lsof -i:3001
    else
        echo "  No process listening on port 3001"
    fi
}

# Logs function
logs() {
    print_info "Showing AWL Scanner logs (Ctrl+C to exit)..."
    
    if pm2 describe "$APP_NAME" &> /dev/null; then
        pm2 logs "$APP_NAME" --lines 50
    else
        print_error "Application is not managed by PM2"
        exit 1
    fi
}

# Main script
case "$1" in
    install)
        install
        ;;
    update)
        update
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    logs)
        logs
        ;;
    *)
        echo "AWL Scanner Management Script"
        echo ""
        echo "Usage: $0 {install|update|start|stop|restart|status|logs}"
        echo ""
        echo "Commands:"
        echo "  install   - Fresh installation (clones repo, installs dependencies)"
        echo "  update    - Pull latest changes from GitHub and restart"
        echo "  start     - Start the application"
        echo "  stop      - Stop the application"
        echo "  restart   - Restart the application"
        echo "  status    - Show application status"
        echo "  logs      - Show application logs (real-time)"
        echo ""
        exit 1
        ;;
esac
