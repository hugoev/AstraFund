# AstraFund Frontend Development Guide

## Getting Started

### Installation
```bash
npm install
```

### Running the Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Switching Between Mock and Real Backend

The frontend is configured to work with **mock data by default**, making it easy to develop without a backend running.

### Using Mock API (Default)

The mock API simulates all backend endpoints with realistic data and behavior:
- Mock data persists in memory during the session
- Simulated network delays for realistic UX testing
- AI compliance checks with random but realistic responses

**To use mock API:**
1. Open `src/config.ts`
2. Ensure `USE_MOCK_API` is set to `true`:

```typescript
export const config = {
  USE_MOCK_API: true,  // ← Set to true for mock data
  API_BASE_URL: 'http://localhost:8000',
  MOCK_DELAY: 500,
};
```

### Switching to Real Backend

When your backend is ready:

**Step 1:** Start the backend server
```bash
cd ../backend
python main.py
```

**Step 2:** Update the config
Open `src/config.ts` and set:
```typescript
export const config = {
  USE_MOCK_API: false,  // ← Set to false for real backend
  API_BASE_URL: 'http://localhost:8000',
  MOCK_DELAY: 500,
};
```

That's it! The app will now use the real backend API.

## Project Structure

```
frontend/
├── src/
│   ├── api.ts              # API service layer (auto-switches mock/real)
│   ├── config.ts           # Configuration (toggle mock API here)
│   ├── types.ts            # TypeScript type definitions
│   ├── components/         # Reusable React components
│   ├── hooks/              # Custom React hooks
│   │   ├── useGrants.ts    # Grant data fetching
│   │   └── useExpenses.ts  # Expense data fetching
│   ├── pages/              # Page components
│   ├── services/
│   │   └── mockApi.ts      # Mock API implementation
│   └── ...
```

## Best Practices Implemented

### 1. **Custom Hooks for Data Fetching**
Instead of duplicating fetch logic, use custom hooks:

```typescript
import { useGrants } from './hooks/useGrants';

function MyComponent() {
  const { grants, loading, error, refetch } = useGrants();
  // ...
}
```

### 2. **Separation of Concerns**
- `api.ts`: API interface definition
- `mockApi.ts`: Mock implementation
- `config.ts`: Configuration management
- Components focus on UI, hooks handle data

### 3. **Loading and Error States**
Use the provided components:

```typescript
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';

if (loading) return <LoadingSpinner message="Loading..." />;
if (error) return <ErrorMessage message={error} onRetry={refetch} />;
```

### 4. **TypeScript for Type Safety**
All data types are defined in `types.ts` and used throughout the app.

### 5. **CSS Modules for Styling**
Scoped styles prevent naming conflicts:
```typescript
import styles from './Component.module.css';
<div className={styles.container}>...</div>
```

## Mock Data

The mock API includes:
- **3 sample grants** with different rules and budgets
- **3 sample expenses** in various states
- **3 sample users** with different roles
- AI compliance checks with realistic responses

You can modify mock data in `src/services/mockApi.ts`.

## Environment Variables

Create a `.env` file (optional):
```
VITE_API_URL=http://localhost:8000
```

The app will use `config.ts` settings by default.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Adding New API Endpoints

When adding new features:

1. **Update types** in `src/types.ts`
2. **Add to mock API** in `src/services/mockApi.ts`
3. **Add to real API** in `src/api.ts` (RealApiService class)
4. **Create custom hook** if needed (optional but recommended)

Example:
```typescript
// 1. Add type
export interface Report {
  id: number;
  name: string;
}

// 2. Mock implementation
async getReports(): Promise<Report[]> {
  await this.simulateDelay();
  return mockReports;
}

// 3. Real implementation
async getReports(): Promise<Report[]> {
  return this.request<Report[]>('/reports');
}

// 4. Custom hook (optional)
export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  // ... fetch logic
  return { reports, loading, error };
}
```

## Tips

1. **Mock Delay**: Adjust `MOCK_DELAY` in `config.ts` to test loading states
2. **Reset Mock Data**: Refresh the page to reset in-memory mock data
3. **Console Logging**: Check browser console for API call information
4. **Hot Reload**: The dev server supports hot module replacement

## Troubleshooting

**Issue: Changes in config.ts not reflecting**
- Solution: Hard refresh the page (Ctrl+Shift+R / Cmd+Shift+R)

**Issue: "Module not found" errors**
- Solution: Ensure you ran `npm install` and restart dev server

**Issue: Mock API not working**
- Solution: Check `config.ts` has `USE_MOCK_API: true`

**Issue: Real backend not connecting**
- Solution: Ensure backend is running and `API_BASE_URL` is correct

