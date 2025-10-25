# AstraFund Frontend

> 🌌 Financial Compliance Co-Pilot with Space Cowboy Theme

A modern React + TypeScript frontend featuring a stunning galaxy background, cowboy-themed UI elements, and seamless mock/real backend switching.

## Quick Start

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
App runs at `http://localhost:5173`

## Features

### 🎨 Space Cowboy Theme
- **Galaxy Background**: Animated stars, nebula clouds, and cosmic gradients
- **Cowboy Aesthetics**: Western fonts, angled badge-style borders, and rope decorations
- **Purple Color Scheme**: Cosmic purples and blues throughout
- **Glassmorphism UI**: Modern frosted glass effects on cards and navbar

### 🔄 Mock API Mode
Frontend works independently with mock data - no backend required!

**Toggle in `src/config.ts`:**
```typescript
export const config = {
  USE_MOCK_API: true,  // true = mock, false = real backend
  API_BASE_URL: 'http://localhost:8000',
};
```

### 🏗️ Architecture

**Feature-Based Structure:**
```
src/
├── api/              # API layer with mock/real switching
├── components/       # Shared UI components
│   ├── common/      # Generic (LoadingSpinner, ErrorMessage, etc.)
│   └── layout/      # Layout (Header, Footer, etc.)
├── features/        # Business features
│   ├── grants/      # Grant management
│   └── expenses/    # Expense tracking
├── styles/          # Global styles
└── types/           # TypeScript definitions
```

**Design Principles:**
- ✅ Feature-based organization
- ✅ Custom hooks for data fetching
- ✅ Barrel exports (clean imports)
- ✅ CSS Modules (scoped styling)
- ✅ TypeScript for type safety
- ✅ Separation of concerns

## Project Structure

### Key Files

| File | Purpose |
|------|---------|
| `src/config.ts` | Configuration (toggle mock API here) |
| `src/api/api.ts` | API service layer |
| `src/api/services/mockApi.ts` | Mock API implementation |
| `src/types/index.ts` | TypeScript type definitions |
| `src/components/common/GalaxyBackground/` | Animated space background |
| `src/components/layout/Header/` | Navbar with cowboy styling |

### Features

**Grants Feature** (`src/features/grants/`)
- Dashboard page
- Grant detail page
- Grant cards
- Custom hooks: `useGrants`, `useGrant`

**Expenses Feature** (`src/features/expenses/`)
- Approval queue
- Expense form
- Compliance checks
- Custom hooks: `useExpenses`, `usePendingExpenses`

## Development Tips

### Adding New Features

1. Create feature folder: `src/features/[feature-name]/`
2. Add components, hooks, pages as needed
3. Export via `index.ts` (barrel export)
4. Import cleanly: `import { Component } from '@/features/[feature-name]'`

### Using Custom Hooks

```typescript
import { useGrants } from '@/features/grants';

function MyComponent() {
  const { grants, loading, error, refetch } = useGrants();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  
  return <div>{/* render grants */}</div>;
}
```

### Styling Guidelines

**Use CSS Modules:**
```typescript
import styles from './Component.module.css';
<div className={styles.container}>...</div>
```

**Follow Theme Colors:**
```css
/* Cosmic Purple (primary) */
--color-primary: #8b5cf6

/* Nebula Blue (secondary) */
--color-secondary: #3b82f6

/* Light Purple (accent) */
--color-accent: #a78bfa
```

**Cowboy Elements:**
- Angled corners via `clip-path` polygons
- Cowboy fonts: `var(--font-cowboy)`
- Star symbols (★) for accents
- Rope borders with dashed gradients

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Performance Features

- Canvas-based star animations (200 stars at 60fps)
- GPU-accelerated CSS transforms
- Efficient `requestAnimationFrame` rendering
- Code splitting ready
- Optimized bundle size

## Browser Support

- Modern browsers with ES6+ support
- Backdrop-filter support recommended
- Hardware-accelerated transforms
- Canvas API required for galaxy background

## Documentation

- `DEVELOPMENT.md` - Detailed development guide
- `FOLDER_STRUCTURE.md` - Architecture explanation

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **CSS Modules** - Scoped styling

## Contributing

1. Follow feature-based structure
2. Use TypeScript for all new code
3. Write CSS Modules for styles
4. Create custom hooks for data fetching
5. Export via barrel exports (`index.ts`)

---

**Built with ❤️ for hackathons** 🚀
