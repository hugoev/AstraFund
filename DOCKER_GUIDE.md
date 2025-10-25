# Docker Compose Guide for AstraFund

## 🐳 Quick Start

### Start the Application
```bash
docker-compose up
```

This will start both frontend and backend services:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:8000

### Start in Detached Mode (Background)
```bash
docker-compose up -d
```

### Stop the Application
```bash
docker-compose down
```

### Rebuild After Code Changes
```bash
docker-compose up --build
```

### View Logs
```bash
# All services
docker-compose logs -f

# Frontend only
docker-compose logs -f frontend

# Backend only
docker-compose logs -f backend
```

---

## 📋 Service Details

### Frontend Service
- **Container Name:** astrafund-frontend
- **Port:** 5173:5173
- **Technology:** React + Vite + TypeScript
- **Hot Reload:** Enabled via volume mounting
- **Health Check:** Curl to http://localhost:5173

### Backend Service
- **Container Name:** astrafund-backend
- **Port:** 8000:8000
- **Technology:** Python + FastAPI
- **Auto Reload:** Enabled via uvicorn --reload
- **Health Check:** Curl to http://localhost:8000/health

---

## 🔧 Useful Commands

### Check Service Status
```bash
docker-compose ps
```

### Restart a Single Service
```bash
docker-compose restart frontend
# or
docker-compose restart backend
```

### Execute Commands in Running Container
```bash
# Frontend
docker-compose exec frontend npm install <package-name>

# Backend
docker-compose exec backend pip install <package-name>
```

### View Container Logs
```bash
# Last 100 lines
docker-compose logs --tail=100 frontend

# Follow logs in real-time
docker-compose logs -f backend
```

### Remove All Containers and Volumes
```bash
docker-compose down -v
```

---

## 🔍 Troubleshooting

### Port Already in Use
If you get a "port already in use" error:

**Windows PowerShell:**
```powershell
# Find process using port 5173
netstat -ano | findstr :5173

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Find process using port 5173
lsof -i :5173

# Kill the process
kill -9 <PID>
```

### Container Won't Start
```bash
# View detailed logs
docker-compose logs frontend
docker-compose logs backend

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Frontend Changes Not Reflecting
```bash
# Restart frontend service
docker-compose restart frontend

# Or rebuild
docker-compose up --build frontend
```

### Backend Dependency Issues
```bash
# Rebuild backend with fresh dependencies
docker-compose down
docker-compose build --no-cache backend
docker-compose up
```

---

## 🌐 Environment Variables

### Current Setup
The `docker-compose.yml` includes:

**Backend:**
- `GEMINI_API_KEY`: Your Gemini API key (defaults to dummy_key_for_demo)
- `DATABASE_URL`: SQLite database location
- `ENVIRONMENT`: development
- `DEBUG`: true

**Frontend:**
- `VITE_API_URL`: Backend API URL (http://localhost:8000)

### Using .env File
Create a `.env` file in the root directory:

```env
# Backend
GEMINI_API_KEY=your_actual_api_key_here
DATABASE_URL=sqlite:///./astrafund.db
ENVIRONMENT=development
DEBUG=true

# Frontend
VITE_API_URL=http://localhost:8000
```

Docker Compose will automatically read this file.

---

## 🚀 Development Workflow

### 1. Start Services
```bash
docker-compose up
```

### 2. Make Code Changes
- Frontend: Edit files in `frontend/src/`
- Backend: Edit files in `backend/`
- Changes will hot-reload automatically

### 3. Install New Dependencies

**Frontend:**
```bash
# Stop containers
docker-compose down

# Add to package.json or run:
cd frontend
npm install <package-name>

# Rebuild and restart
docker-compose up --build
```

**Backend:**
```bash
# Stop containers
docker-compose down

# Add to requirements.txt or run:
docker-compose run backend pip install <package-name>

# Rebuild and restart
docker-compose up --build
```

### 4. View Logs
```bash
docker-compose logs -f
```

---

## 📦 Production Deployment

### Build Production Images
```bash
# Frontend production build
docker build -f frontend/Dockerfile.prod -t astrafund-frontend:prod frontend/

# Backend production build
docker build -t astrafund-backend:prod backend/
```

### Production docker-compose.yml
Create a separate `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    image: astrafund-backend:prod
    ports:
      - "8000:8000"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - ENVIRONMENT=production
      - DEBUG=false
    restart: always

  frontend:
    image: astrafund-frontend:prod
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always
```

### Run Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** with real API keys
2. **Use secrets management** in production (e.g., Docker secrets, AWS Secrets Manager)
3. **Run containers as non-root** (already configured)
4. **Keep base images updated** regularly
5. **Scan images for vulnerabilities** using Docker Scout or Trivy

---

## 📊 Health Checks

Both services have health checks configured:

### Frontend Health Check
```bash
curl http://localhost:5173
```

### Backend Health Check
```bash
curl http://localhost:8000/health
```

### Check Health Status
```bash
docker-compose ps
```

Look for "(healthy)" status.

---

## 🎯 Quick Reference

| Command | Description |
|---------|-------------|
| `docker-compose up` | Start all services |
| `docker-compose up -d` | Start in background |
| `docker-compose down` | Stop all services |
| `docker-compose ps` | View running containers |
| `docker-compose logs -f` | Follow logs |
| `docker-compose restart <service>` | Restart a service |
| `docker-compose build` | Rebuild images |
| `docker-compose up --build` | Rebuild and start |

---

## 💡 Tips

- Use `docker-compose up -d` for background running
- Use `docker-compose logs -f` to debug issues
- Volume mounting enables hot-reload without rebuilding
- Health checks ensure services are ready before accepting traffic
- Use `--build` flag when dependencies change

---

## 🤝 Support

For issues with:
- **Docker setup:** Check this guide
- **Frontend issues:** See `frontend/README.md`
- **Backend issues:** See `backend/README.md`
- **UX improvements:** See `UX_IMPROVEMENTS.md`

