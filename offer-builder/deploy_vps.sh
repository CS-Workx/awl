#!/bin/bash
# VPS Deployment Script for Offer Builder
# Usage: bash deploy_vps.sh (run on VPS as user with sudo access)

set -e

echo "🚀 Deploying Offer Builder to VPS..."

# Ensure we're in the right directory
DEPLOY_DIR="/var/www/tools.superworker.be/html/offer-builder"

if [ ! -d "$DEPLOY_DIR" ]; then
    echo "❌ Error: Directory $DEPLOY_DIR does not exist"
    exit 1
fi

cd "$DEPLOY_DIR"
echo "📍 Working directory: $(pwd)"

# Pull latest code from GitHub
echo "📥 Pulling latest code from GitHub..."
git pull origin master

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install/update dependencies
echo "📦 Installing/updating Python dependencies..."
cd backend
pip install -q --upgrade pip
pip install -q -r requirements.txt

# Ensure Playwright browsers are installed
echo "🎭 Checking Playwright browsers..."
playwright install chromium --with-deps 2>&1 | grep -v "Downloading" || true

# Create required directories
echo "📁 Creating/verifying required directories..."
cd ..
mkdir -p output
mkdir -p uploads
mkdir -p templates
mkdir -p templates/user_uploads
mkdir -p generated_offers

# Set proper permissions
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data output/ uploads/ templates/ generated_offers/ || true
sudo chmod -R 755 output/ uploads/ templates/ generated_offers/ || true

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Creating from template..."
    cp env.template .env
    echo "⚠️  Please edit .env file with production values before starting the service"
fi

# Verify .env has BASE_PATH set
if ! grep -q "BASE_PATH=/offer-builder" .env; then
    echo "⚠️  Warning: BASE_PATH not set to /offer-builder in .env"
    echo "   You may need to add: BASE_PATH=/offer-builder"
fi

# Restart systemd service
echo "🔄 Restarting offer-builder service..."
sudo systemctl daemon-reload
sudo systemctl restart offer-builder

# Wait a moment for service to start
sleep 2

# Check status
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Service Status:"
sudo systemctl status offer-builder --no-pager --lines=10

echo ""
echo "🧪 Testing endpoints..."
echo "   Local health check:"
curl -s http://localhost:3002/offer-builder/health | python3 -m json.tool || echo "   ❌ Health check failed"

echo ""
echo "📝 Recent logs (last 20 lines):"
sudo journalctl -u offer-builder -n 20 --no-pager

echo ""
echo "✨ Deployment finished!"
echo "   Frontend: https://tools.superworker.be/offer-builder/"
echo "   API Status: https://tools.superworker.be/offer-builder/api/status"
