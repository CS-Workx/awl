#!/bin/bash

# Navigate to project root (two levels up from scripts/launchers/)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1

echo "🚀 Starting Syntra Bizz Offer Generator..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
cd backend
pip install -q -r requirements.txt

# Check for .env file
if [ ! -f "../.env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Please create a .env file based on env.template"
    echo "Make sure to add your GEMINI_API_KEY"
    echo ""
fi

# Start backend in background
echo "Starting backend server on http://localhost:8765..."
python app.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting frontend server on http://localhost:8766..."
cd ../frontend
python3 -m http.server 8766 &
FRONTEND_PID=$!

echo ""
echo "✅ Servers started successfully!"
echo ""
echo "📱 Open your browser and go to: http://localhost:8766"
echo "📚 API documentation available at: http://localhost:8765/docs"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
