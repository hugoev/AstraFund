# 🐳 AstraFund - Docker Development Setup

This guide shows how to run AstraFund using Docker and Docker Compose for development.

## 🚀 Quick Start

### 1. Prerequisites

- Docker Desktop installed
- Docker Compose v2.0+
- Git

### 2. Clone and Setup

```bash
git clone <your-repo-url>
cd AstraFund
```

### 3. Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit .env file and add your Gemini API key
# Get your API key from: https://makersuite.google.com/app/apikey
```

### 4. Start Development Environment

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up --build

# Or run in background
docker-compose -f docker-compose.dev.yml up -d --build
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🛠 Development Commands

### Start Services

```bash
# Development mode with hot reload
docker-compose -f docker-compose.dev.yml up

# Production mode
docker-compose up
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Database Operations

```bash
# Seed database with sample data
docker-compose exec backend python seed_docker.py

# Access database shell
docker-compose exec backend python -c "from app.main import SessionLocal; print('Database connected')"
```

### Rebuild Services

```bash
# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Rebuild all services
docker-compose build
```

## 📁 Project Structure

```
AstraFund/
├── docker-compose.yml          # Production compose
├── docker-compose.dev.yml      # Development compose
├── .env.example               # Environment template
├── .dockerignore              # Docker ignore file
├── backend/
│   ├── Dockerfile             # Backend container
│   ├── requirements.txt       # Python dependencies
│   └── app/
│       ├── main.py            # FastAPI application
│       └── seed_docker.py     # Database seeding
└── frontend/
    ├── Dockerfile             # Frontend container
    ├── package.json           # Node dependencies
    └── src/                   # React source code
```

## 🔧 Configuration

### Environment Variables

```bash
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional
DATABASE_URL=sqlite:///./astrafund.db
ENVIRONMENT=development
DEBUG=true
```

### Port Configuration

- **Frontend**: 5173 (Vite dev server)
- **Backend**: 8000 (FastAPI)
- **Database**: 5432 (PostgreSQL, if enabled)

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Check what's using the port
lsof -i :8000
lsof -i :5173

# Kill processes
sudo kill -9 <PID>
```

#### 2. Permission Issues

```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

#### 3. Container Won't Start

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up
```

#### 4. Database Issues

```bash
# Reset database
docker-compose down -v
docker-compose up --build
docker-compose exec backend python seed_docker.py
```

### Health Checks

```bash
# Check service health
curl http://localhost:8000/health
curl http://localhost:5173

# Check container status
docker-compose ps
```

## 🚀 Production Deployment

### Build Production Images

```bash
# Build optimized images
docker-compose build --no-cache
```

### Run Production

```bash
# Start production services
docker-compose up -d
```

### Environment Variables for Production

```bash
# .env.production
GEMINI_API_KEY=your_production_api_key
DATABASE_URL=postgresql://user:pass@postgres:5432/astrafund
ENVIRONMENT=production
DEBUG=false
```

## 📊 Monitoring

### View Resource Usage

```bash
# Container stats
docker stats

# Service logs
docker-compose logs --tail=100 -f
```

### Database Backup

```bash
# Backup SQLite database
docker-compose exec backend cp astrafund.db /app/backup-$(date +%Y%m%d).db
```

## 🔄 Development Workflow

### 1. Make Changes

- Edit code in your IDE
- Changes are automatically reflected (hot reload)

### 2. Test Changes

- Frontend: http://localhost:5173
- Backend: http://localhost:8000/docs

### 3. Debug Issues

```bash
# View logs
docker-compose logs -f

# Access container shell
docker-compose exec backend bash
docker-compose exec frontend sh
```

### 4. Commit Changes

```bash
git add .
git commit -m "Your changes"
git push
```

## 🎯 Demo Features

The application comes pre-loaded with:

- **3 Sample Grants**: STEM Education, Community Arts, Environmental Conservation
- **3 Sample Users**: Program Managers and Finance Director
- **3 Sample Expenses**: Mix of compliant and non-compliant examples

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker
5. Submit a pull request

## 📝 License

MIT License - Feel free to use this project as a starting point for your own applications!
