# AstraFund Backend API

A FastAPI-based backend for the AstraFund financial compliance co-pilot for non-profits. This backend provides AI-powered expense compliance checking using Google's Gemini API and a collaborative approval system.

## 🏗️ Architecture Overview

The backend follows a **layered architecture** pattern with clear separation of concerns:

```
backend/
├── app/
│   ├── core/           # Core infrastructure (config, database, security)
│   ├── models/         # Data models (SQLAlchemy ORM + Pydantic schemas)
│   ├── services/       # Business logic services
│   ├── api/           # API endpoints (FastAPI routers)
│   └── main.py        # Application entry point
├── scripts/           # Database seeding and utilities
├── requirements.txt   # Python dependencies
├── Dockerfile        # Container configuration
└── alembic.ini       # Database migration config
```

## 🚀 Current Features

### ✅ Implemented Features

- **User Management**: Create and manage users with roles (admin, manager, user)
- **Grant Management**: CRUD operations for grants with compliance rules
- **Expense Tracking**: Submit and track expenses with AI compliance checks
- **AI Compliance Checking**: Integration with Google Gemini API for automated compliance validation
- **Approval Workflow**: Collaborative approval system with co-sign functionality
- **Database Management**: SQLite with SQLAlchemy ORM and Alembic migrations
- **Security**: Password hashing, JWT tokens, and secure API endpoints
- **Monitoring**: Request/response logging and performance tracking
- **Error Handling**: Comprehensive exception handling with structured responses
- **CORS Support**: Cross-origin resource sharing for frontend integration

### 🔄 API Endpoints

#### Grants

- `GET /grants` - List all grants
- `GET /grants/{id}` - Get grant details with expenses
- `POST /grants` - Create new grant

#### Expenses

- `POST /grants/{id}/expenses` - Submit new expense
- `GET /expenses/queue` - Get pending expenses for approval
- `POST /expenses/{id}/approve` - Approve expense
- `POST /expenses/{id}/reject` - Reject expense

#### Compliance

- `POST /compliance/check` - AI-powered compliance checking

#### Users

- `GET /users` - List all users
- `GET /users/{id}` - Get user details
- `POST /users` - Create new user

#### Approvals

- `GET /approvals` - List all approvals
- `POST /approvals` - Create new approval
- `GET /approvals/expense/{id}` - Get approvals for specific expense

## 🛠️ Technology Stack

### Core Framework

- **FastAPI** - Modern, fast web framework for building APIs
- **Uvicorn** - ASGI server for production deployment
- **Pydantic** - Data validation and settings management

### Database

- **SQLAlchemy** - Python SQL toolkit and ORM
- **SQLite** - Lightweight database (development)
- **Alembic** - Database migration tool

### AI Integration

- **Google Gemini API** - AI-powered compliance checking
- **google-genai** - Official Google GenAI Python SDK

### Security & Authentication

- **python-jose** - JWT token handling
- **passlib[bcrypt]** - Password hashing
- **CORS** - Cross-origin resource sharing

### Development & Deployment

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Environment Variables** - Configuration management

## 📊 Database Schema

### Core Entities

#### Users

```sql
- id (Primary Key)
- username (Unique)
- role (admin/manager/user)
- hashed_password
- created_at
```

#### Grants

```sql
- id (Primary Key)
- name
- total_amount
- rules_text (Compliance rules)
- created_at
```

#### Expenses

```sql
- id (Primary Key)
- description
- amount
- grant_id (Foreign Key)
- submitter_id (Foreign Key)
- status (pending/approved/rejected)
- ai_compliance_check (JSON)
- created_at
```

#### Approvals

```sql
- id (Primary Key)
- expense_id (Foreign Key)
- approver_id (Foreign Key)
- timestamp
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Application
APP_NAME="AstraFund API"
APP_VERSION="1.0.0"
DEBUG=false
ENVIRONMENT=development

# Database
DATABASE_URL="sqlite:///./astrafund.db"

# AI Integration
GEMINI_API_KEY="your_gemini_api_key_here"

# CORS
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]

# Logging
LOG_LEVEL="INFO"
```

### Default Configuration

The application uses sensible defaults and can run without environment variables for development:

- **Database**: SQLite file (`astrafund.db`)
- **CORS**: Allows localhost:5173 and localhost:3000
- **Logging**: INFO level
- **AI**: Demo mode when no API key provided

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Docker (optional)
- Google Gemini API key (optional for demo mode)

### Local Development

1. **Install Dependencies**

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Set Environment Variables**

   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Run Database Migrations**

   ```bash
   alembic upgrade head
   ```

4. **Seed Database (Optional)**

   ```bash
   python scripts/seed_database.py
   ```

5. **Start Development Server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Docker Development

1. **Build and Run**

   ```bash
   docker compose -f docker-compose.dev.yml up backend
   ```

2. **Seed Database**
   ```bash
   docker compose -f docker-compose.dev.yml exec backend python seed_docker.py
   ```

## 📝 API Documentation

### Interactive Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Example API Calls

#### Create a Grant

```bash
curl -X POST "http://localhost:8000/grants" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "STEM Education Grant",
    "total_amount": 50000,
    "rules_text": "Funds for educational technology and STEM materials"
  }'
```

#### Check Compliance

```bash
curl -X POST "http://localhost:8000/compliance/check" \
  -H "Content-Type: application/json" \
  -d '{
    "grant_rules": "STEM education funding",
    "expense_description": "10 Raspberry Pi computers",
    "expense_amount": 3500
  }'
```

## 🔍 Monitoring & Logging

### Request Monitoring

- All API requests are logged with timing information
- Performance metrics tracked automatically
- Error responses include structured error details

### Log Levels

- **INFO**: Normal application flow
- **WARNING**: Non-critical issues
- **ERROR**: Application errors
- **DEBUG**: Detailed debugging information

## 🧪 Testing

### Health Check

```bash
curl http://localhost:8000/health
```

### Database Status

The application automatically creates database tables on startup if they don't exist.

## 🚀 Production Deployment

### Docker Production

```bash
docker compose up
```

### Environment Considerations

- Set `DEBUG=false` in production
- Use PostgreSQL for production database
- Configure proper CORS origins
- Set up proper logging and monitoring
- Use environment-specific API keys

## 🔧 Development Guidelines

### Code Organization

- **Core**: Infrastructure and configuration
- **Models**: Data layer (SQLAlchemy + Pydantic)
- **Services**: Business logic
- **API**: HTTP endpoints and request/response handling

### Adding New Features

1. Create database models in `models/database.py`
2. Add Pydantic schemas in `models/schemas.py`
3. Implement business logic in `services/`
4. Create API endpoints in `api/v1/`
5. Add tests and documentation

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head
```

## 🐛 Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all dependencies are installed
2. **Database Issues**: Check database URL and permissions
3. **CORS Issues**: Verify CORS origins configuration
4. **AI Integration**: Check Gemini API key and quota

### Debug Mode

Set `DEBUG=true` in environment variables for detailed error information.

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Google Gemini API](https://ai.google.dev/)
- [Docker Documentation](https://docs.docker.com/)

---

**Status**: ✅ Production Ready MVP  
**Last Updated**: October 2024  
**Version**: 1.0.0
