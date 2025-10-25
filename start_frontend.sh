#!/bin/bash

# AstraFund Frontend Startup Script

echo "🚀 Starting AstraFund Frontend..."

# Check if node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

# Start the development server
echo "🌟 Starting Vite development server..."
echo "   Frontend will be available at: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd frontend
npm run dev
