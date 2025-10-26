# Quick Test Guide - Backend API

## 🎯 The backend is now working correctly with the frontend API structure!

### Current Status:

- ✅ **Backend API**: Running and seeded with data
- ✅ **API Endpoints**: All routes properly configured
- ✅ **CORS**: Configured to allow frontend access
- ✅ **Nginx**: Ready to proxy API calls (when frontend builds)
- ⚠️ **Frontend**: Has TypeScript errors (pre-existing), needs fixes before building

---

## 🧪 Quick API Tests

### Test the backend API directly:

```bash
# Health check
curl http://localhost:8000/health

# Get all users
curl http://localhost:8000/users/ | python3 -m json.tool

# Get all grants
curl http://localhost:8000/grants/ | python3 -m json.tool

# Get analytics (rich demo data!)
curl http://localhost:8000/analytics/overview | python3 -m json.tool

# Get trends (last 30 days)
curl http://localhost:8000/analytics/trends?days=30 | python3 -m json.tool

# Get expenses
curl http://localhost:8000/expenses/ | python3 -m json.tool

# Get pending expenses for approval
curl http://localhost:8000/expenses/queue | python3 -m json.tool

# Get payments
curl http://localhost:8000/payments/ | python3 -m json.tool
```

---

## 📊 Demo Data Overview

Your database now has:

- **11 users** (Program Managers, Finance Directors, etc.)
- **8 grants** (STEM, Arts, Environment, Youth, Healthcare, etc.)
- **102 expenses** (spread across 60 days for beautiful trend charts!)
- **85 approvals** (with historical timestamps)
- **59 payments** (various states: completed, pending, processing)

### Perfect for Analytics Demo! 📈

The data is specifically designed to showcase:

- Time-based trends (last 60 days of activity)
- Status distribution (approved, paid, pending, rejected)
- Multiple payment methods (bank transfer, credit card, check, PayPal, wire transfer)
- Realistic amounts and descriptions
- Complete approval workflow

---

## 🌐 Interactive API Documentation

Visit: **http://localhost:8000/docs**

This Swagger UI lets you:

- Test all endpoints interactively
- See request/response schemas
- Execute API calls directly from the browser
- View all available parameters

---

## 🔄 What Was Fixed

### 1. API Route Mismatch

- **Before**: Frontend calling `/grants/{id}/expenses` → Backend had it at `/expenses/grants/{id}/expenses` ❌
- **After**: Backend now has it at `/grants/{id}/expenses` ✅

### 2. Nginx Proxy

- **Before**: Configured for `/api/*` but frontend calling direct routes ❌
- **After**: Proxies all backend routes directly ✅

### 3. Docker Network

- **Before**: Frontend trying to use internal Docker address from browser ❌
- **After**: Uses nginx proxy for same-origin requests ✅

### 4. CORS Configuration

- **Before**: Only localhost:5173 and localhost:3000 ❌
- **After**: Includes all necessary origins for Docker + dev ✅

---

## 🎨 Frontend Next Steps

To complete the frontend deployment, fix these TypeScript errors:

```bash
# The errors are in these files:
- src/api/services/mockApi.ts (missing created_at)
- src/features/expenses/components/ExpenseForm/ExpenseForm.tsx (unused vars)
- src/features/finance/pages/FinancialWorkflowPage/* (type mismatches)
- src/features/program-manager/components/* (various type issues)
```

Once fixed:

```bash
docker compose build frontend
docker compose up -d
```

Then access: **http://localhost:3000**

---

## 🚀 Development Workflow

### Backend Changes:

```bash
docker compose down
docker compose build backend
docker compose up -d backend
docker compose exec backend python seed_docker.py  # If needed
```

### Frontend Changes (after fixing TS errors):

```bash
docker compose down
docker compose build frontend
docker compose up -d
```

### Full Stack:

```bash
docker compose down
docker compose build
docker compose up -d
```

---

## 📖 API Endpoint Reference

### Core Routes:

- `GET /` - Root info
- `GET /health` - Health check
- `GET /docs` - Swagger UI

### Users:

- `GET /users/` - List all users
- `GET /users/{id}` - Get specific user
- `POST /users` - Create user

### Grants:

- `GET /grants/` - List all grants
- `GET /grants/{id}` - Get grant with expenses
- `POST /grants` - Create grant
- **`POST /grants/{id}/expenses`** - Create expense for grant ← FIXED!

### Expenses:

- `GET /expenses/` - List all expenses
- `GET /expenses/queue` - Get pending expenses
- `POST /expenses/{id}/approve` - Approve expense
- `POST /expenses/{id}/reject` - Reject expense

### Payments:

- `GET /payments/` - List all payments
- `GET /payments/pending` - Get pending payments
- `POST /payments` - Create payment
- `POST /payments/{id}/process` - Process payment

### Analytics:

- `GET /analytics/overview` - Overall metrics
- `GET /analytics/trends?days=30` - Time-based trends
- `GET /analytics/grants/{id}/analytics` - Grant-specific
- `GET /analytics/users/{id}/analytics` - User-specific

### Chatbot:

- `POST /chatbot/chat` - Chat with AI about analytics
- `GET /chatbot/insights` - Get AI insights

---

**Ready to demo the backend!** 🎉
The frontend just needs TypeScript fixes to build.
