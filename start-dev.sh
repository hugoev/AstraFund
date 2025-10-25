#!/bin/bash

# AstraFund Development Startup Script
echo "🚀 Starting AstraFund Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker compose -f docker-compose.dev.yml down

# Build and start services
echo "🔨 Building and starting services..."
docker compose -f docker-compose.dev.yml up --build

echo "✅ AstraFund is now running!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
