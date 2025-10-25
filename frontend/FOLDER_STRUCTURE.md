# Frontend Folder Structure

This document explains the organized folder structure following React best practices with a feature-based architecture.

## Overview

```
src/
├── api/                           # API layer
│   ├── services/
│   │   └── mockApi.ts            # Mock API implementation
│   ├── api.ts                     # Main API service
│   └── index.ts                   # Barrel export
│
├── assets/                        # Static assets
│   └── react.svg
│
├── components/                    # Shared/Common components
│   ├── common/                    # Generic reusable components
│   │   ├── ErrorMessage/
│   │   │   ├── ErrorMessage.tsx
│   │   │   ├── ErrorMessage.module.css
│   │   │   └── index.ts
│   │   ├── LoadingSpinner/
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── LoadingSpinner.module.css
│   │   │   └── index.ts
│   │   └── index.ts
│   └── layout/                    # Layout components
│       ├── Header/
│       │   ├── Header.tsx
│       │   ├── Header.module.css
│       │   └── index.ts
│       └── index.ts
│
├── features/                      # Feature-based organization
│   ├── grants/                    # Grant management feature
│   │   ├── components/
│   │   │   ├── GrantCard/
│   │   │   │   ├── GrantCard.tsx
│   │   │   │   ├── GrantCard.module.css
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useGrants.ts      # Custom hooks for grant data
│   │   │   └── index.ts
│   │   ├── pages/
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Dashboard.module.css
│   │   │   │   └── index.ts
│   │   │   ├── GrantDetail/
│   │   │   │   ├── GrantDetail.tsx
│   │   │   │   ├── GrantDetail.module.css
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   └── index.ts              # Feature barrel export
│   │
│   └── expenses/                  # Expense management feature
│       ├── components/
│       │   ├── ApprovalQueue/
│       │   │   ├── ApprovalQueue.tsx
│       │   │   ├── ApprovalQueue.module.css
│       │   │   └── index.ts
│       │   ├── ComplianceCheck/
│       │   │   ├── ComplianceCheck.tsx
│       │   │   ├── ComplianceCheck.module.css
│       │   │   └── index.ts
│       │   ├── ExpenseForm/
│       │   │   ├── ExpenseForm.tsx
│       │   │   ├── ExpenseForm.module.css
│       │   │   └── index.ts
│       │   └── index.ts
│       ├── hooks/
│       │   ├── useExpenses.ts    # Custom hooks for expense data
│       │   └── index.ts
│       └── index.ts              # Feature barrel export
│
├── styles/                        # Global styles
│   ├── global.css
│   └── index.css
│
├── types/                         # TypeScript type definitions
│   └── index.ts                   # All type exports
│
├── config.ts                      # App configuration
├── App.tsx                        # Main app component
├── App.module.css                 # App styles
└── main.tsx                       # Entry point
```

## Architecture Principles

### 1. **Feature-Based Organization**

Features are self-contained modules with their own:
- Components
- Hooks
- Pages
- Types (if feature-specific)

**Benefits:**
- Easy to locate related code
- Simple to add/remove features
- Clear boundaries between features
- Scales well with team size

### 2. **Barrel Exports (index.ts)**

Each folder has an `index.ts` that exports its public API:

```typescript
// Instead of:
import GrantCard from '../../../../features/grants/components/GrantCard/GrantCard';

// You can write:
import { GrantCard } from '@/features/grants';
```

**Benefits:**
- Cleaner imports
- Easier refactoring
- Clear public API
- Better encapsulation

### 3. **Colocation**

Related files are kept together:
```
GrantCard/
├── GrantCard.tsx          # Component logic
├── GrantCard.module.css   # Component styles
└── index.ts               # Export
```

**Benefits:**
- Easy to find related files
- Simple to move/delete features
- Logical grouping

### 4. **Separation of Concerns**

- **`components/common`**: Truly reusable UI components (buttons, spinners, modals)
- **`components/layout`**: Layout components (header, footer, sidebar)
- **`features/`**: Business logic and feature-specific components
- **`api/`**: All API communication logic
- **`types/`**: Shared TypeScript types

## Import Patterns

### Importing from Features

```typescript
// Import pages
import { Dashboard, GrantDetail } from '@/features/grants';

// Import components
import { ApprovalQueue, ExpenseForm } from '@/features/expenses';

// Import hooks
import { useGrants, useGrant } from '@/features/grants';
import { usePendingExpenses } from '@/features/expenses';
```

### Importing Common Components

```typescript
// Common UI components
import { LoadingSpinner, ErrorMessage } from '@/components/common';

// Layout components
import { Header } from '@/components/layout';
```

### Importing API & Types

```typescript
// API service
import { apiService } from '@/api';

// Types
import type { Grant, Expense, User } from '@/types';
```

## Adding New Features

To add a new feature (e.g., "reports"):

1. **Create folder structure:**
```bash
src/features/reports/
├── components/
│   └── ReportCard/
├── hooks/
│   └── useReports.ts
├── pages/
│   └── ReportList/
└── index.ts
```

2. **Create barrel exports:**
```typescript
// src/features/reports/index.ts
export * from './components';
export * from './hooks';
export * from './pages';
```

3. **Use in app:**
```typescript
import { ReportList } from '@/features/reports';
```

## Adding New Shared Components

To add a new shared component (e.g., "Modal"):

1. **Create component:**
```bash
src/components/common/Modal/
├── Modal.tsx
├── Modal.module.css
└── index.ts
```

2. **Export from common:**
```typescript
// src/components/common/index.ts
export { default as Modal } from './Modal';
```

3. **Use anywhere:**
```typescript
import { Modal } from '@/components/common';
```

## Benefits of This Structure

✅ **Scalability**: Easy to add new features without cluttering existing code
✅ **Maintainability**: Related code is grouped together
✅ **Discoverability**: Clear naming and organization
✅ **Team Collaboration**: Multiple developers can work on different features
✅ **Testing**: Easy to test features in isolation
✅ **Code Splitting**: Simple to implement lazy loading per feature

## Migration Notes

If you're coming from the old structure:
- `src/components/*` → Moved to `src/features/*/components/` or `src/components/common/`
- `src/pages/*` → Moved to `src/features/*/pages/`
- `src/hooks/*` → Moved to `src/features/*/hooks/`
- `src/types.ts` → Now `src/types/index.ts`
- `src/api.ts` → Now `src/api/api.ts`
- Imports updated to use barrel exports

## Tips

1. **Keep features independent**: Avoid importing from one feature into another. Use shared components instead.
2. **Use barrel exports**: Always export through `index.ts` files
3. **Colocate styles**: Keep CSS modules next to their components
4. **Small, focused components**: Each component should have a single responsibility
5. **Custom hooks for data fetching**: Encapsulate API logic in hooks

