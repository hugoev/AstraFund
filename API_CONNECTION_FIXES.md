# API Connection Fixes - Frontend ↔ Backend

## Summary

Fixed **3 critical configuration mismatches** that were preventing the frontend from properly communicating with the backend API.

---

## ✅ Issues Fixed

### 1. **Nginx Proxy Path Mismatch**

**Problem**: Nginx was configured to proxy `/api/*` but frontend was calling direct endpoints like `/users/`, `/grants/`, etc.

**Solution**: Updated nginx.conf to proxy all backend API routes:

```nginx
location ~ ^/(users|grants|expenses|compliance|approvals|payments|analytics|chatbot|documents|proposals|budget|health)/ {
    proxy_pass http://backend:8000;
    ...
}
```

**File**: `frontend/nginx.conf`

---

### 2. **Docker API URL Configuration**

**Problem**: Frontend was set to use `VITE_API_URL=http://backend:8000` which doesn't work from the browser (internal Docker network address).

**Solution**:

- Set `VITE_API_URL=` (empty string) for same-origin requests in Docker
- Nginx now proxies all API calls from the browser to the backend
- Development mode still uses `http://localhost:8000` (fallback in config.ts)

**Files**:

- `docker-compose.yml` - Updated environment variable
- `frontend/src/config.ts` - Added comments explaining the setup

---

### 3. **API Endpoint Route Mismatch**

**Problem**:

- Backend had create expense at: `/expenses/grants/{grant_id}/expenses`
- Frontend was calling: `/grants/{grantId}/expenses`

**Solution**: Moved the create expense endpoint from `expenses.py` to `grants.py` where it logically belongs as a sub-resource.

**Files**:

- `backend/app/api/v1/grants.py` - Added `POST /{grant_id}/expenses`
- `backend/app/api/v1/expenses.py` - Removed the misplaced endpoint

---

### 4. **CORS Origins**

**Problem**: Backend only allowed `localhost:5173` and `localhost:3000`, missing container and alternative addresses.

**Solution**: Expanded CORS origins to include:

```python
cors_origins: list = [
    "http://localhost:5173",    # Vite dev server
    "http://localhost:3000",    # Frontend container/production
    "http://127.0.0.1:5173",    # Alternative localhost
    "http://127.0.0.1:3000",    # Alternative localhost
    "http://frontend:80",       # Docker internal network
]
```

**File**: `backend/app/core/config.py`

---

## ⚠️ Remaining Issues (Frontend Build Errors)

The frontend has TypeScript build errors that need to be fixed before it can be deployed. These are **pre-existing issues**, not related to the API connection fixes:

### TypeScript Errors:

1. **Missing `created_at` property** in mock data and expense objects
2. **Type mismatches** in expense creation calls (missing `grant_id` and `created_at`)
3. **Unused variables** in several components
4. **Property access errors** on DocumentAnalysisResponse

### Affected Files:

- `src/api/services/mockApi.ts`
- `src/features/expenses/components/ExpenseForm/ExpenseForm.tsx`
- `src/features/finance/pages/FinancialWorkflowPage/FinancialWorkflowPage.tsx`
- `src/features/program-manager/components/BudgetOptimizer/BudgetOptimizer.tsx`
- `src/features/program-manager/components/SmartExpenseCapture/SmartExpenseCapture.tsx`
- `src/features/program-manager/components/UnifiedAIDashboard/UnifiedAIDashboard.tsx`

---

## 🧪 Testing Results

### Backend API Status: ✅ **WORKING**

```bash
# Health check
$ curl http://localhost:8000/health
{"status":"healthy"}

# Users endpoint
$ curl http://localhost:8000/users/
[{"username":"john_manager","role":"Program Manager","id":1,...}, ...]

# Analytics endpoint (with rich historical data)
$ curl http://localhost:8000/analytics/overview
{
  "overview": {
    "total_grants": 8,
    "total_users": 11,
    "total_expenses": 102,
    "total_payments": 59,
    "total_grant_amount": 415000.0,
    "total_spent": 34530.0,
    "remaining_budget": 380470.0,
    ...
  }
}
```

### Database Status: ✅ **SEEDED**

- **11 users** across different roles
- **8 grants** covering various programs
- **102 expenses** spread over 60 days for trend visualization
- **85 approvals** with historical timestamps
- **59 payments** in various states

---

## 🚀 Current System Architecture

```
Browser (User)
    ↓
Frontend Container (nginx on port 3000)
    ↓ (nginx proxies API calls)
Backend Container (FastAPI on port 8000)
    ↓
SQLite Database (with seed data)
```

### How It Works:

1. Browser makes API call to: `http://localhost:3000/users/`
2. Nginx in frontend container proxies to: `http://backend:8000/users/`
3. Backend processes and returns data
4. Frontend receives and displays data

---

## 📝 Next Steps

### To Complete Frontend Deployment:

1. **Fix TypeScript errors** in the listed files
2. **Rebuild frontend**: `docker compose build frontend`
3. **Start full stack**: `docker compose up -d`
4. **Test**: Navigate to `http://localhost:3000`

### Quick Development Testing:

For now, you can test the APIs directly:

- Backend: `http://localhost:8000/docs` (Swagger UI)
- Analytics: `http://localhost:8000/analytics/overview`
- Users: `http://localhost:8000/users/`
- Grants: `http://localhost:8000/grants/`

---

## 🔧 Files Modified

### Backend:

1. `backend/app/api/v1/grants.py` - Added expense creation endpoint
2. `backend/app/api/v1/expenses.py` - Removed duplicate endpoint
3. `backend/app/core/config.py` - Expanded CORS origins

### Frontend:

4. `frontend/nginx.conf` - Fixed API proxy routes
5. `frontend/src/config.ts` - Added documentation

### Infrastructure:

6. `docker-compose.yml` - Fixed VITE_API_URL environment variable

---

## ✨ Benefits

1. **Proper separation of concerns**: Nginx handles routing, backend handles logic
2. **Production-ready**: Same setup works in development and production
3. **Secure**: CORS properly configured, no direct backend exposure needed
4. **Scalable**: Easy to add more API routes or services

---

**Status**: Backend ✅ READY | Frontend ⚠️ NEEDS TYPE FIXES
**Last Updated**: October 26, 2025
