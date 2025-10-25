#!/bin/bash

# AstraFund Backend Startup Script

echo "🚀 Starting AstraFund Backend..."

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "📦 Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    cd ..
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source backend/venv/bin/activate

# Install dependencies
echo "📥 Installing Python dependencies..."
cd backend
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Creating .env file from template..."
    cp env.example .env
    echo "📝 Please edit backend/.env and add your GEMINI_API_KEY"
    echo "   Get your API key from: https://makersuite.google.com/app/apikey"
fi

# Run database seeding
echo "🌱 Seeding database with sample data..."
python seed_data.py

# Start the server
echo "🌟 Starting FastAPI server..."
echo "   Backend will be available at: http://localhost:8000"
echo "   API docs will be available at: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

uvicorn main:app --reload --host 0.0.0.0 --port 8000
