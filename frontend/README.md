# AstraFund Frontend

A modern React application for the AstraFund financial compliance co-pilot for non-profits. Built with TypeScript, Vite, and a "Space Cowboy" themed design system.

## 🏗️ Architecture Overview

The frontend follows a **feature-based architecture** with clear separation of concerns:

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── common/        # Shared components (LoadingSpinner, ErrorMessage, etc.)
│   │   └── layout/        # Layout components (Header, Navigation)
│   ├── features/          # Feature-specific modules
│   │   ├── grants/        # Grant management features
│   │   └── expenses/      # Expense and approval features
│   ├── api/              # API service layer
│   ├── types/            # TypeScript type definitions
│   ├── styles/           # Global styles and themes
│   └── config.ts         # Application configuration
├── public/               # Static assets
├── Dockerfile           # Development container
├── Dockerfile.prod      # Production container
└── nginx.conf           # Production web server config
```

## 🚀 Current Features

### ✅ Implemented Features

- **Modern React Architecture**: React 19 with TypeScript and Vite
- **Client-Side Routing**: React Router for seamless navigation
- **Responsive Design**: Mobile-first approach with CSS Modules
- **Space Cowboy Theme**: Custom "AstraFund" design system
- **Real-time Notifications**: Toast notifications for user feedback
- **API Integration**: Both mock and real backend support
- **Form Management**: Comprehensive expense submission forms
- **AI Compliance Display**: Visual compliance check results
- **Approval Workflow**: Collaborative expense approval system
- **Error Handling**: Graceful error states and loading indicators
- **Accessibility**: Keyboard navigation and screen reader support

### 🎨 Design System

#### Color Palette

```css
--color-primary: #0D0D2B    /* Midnight Blue */
--color-secondary: #6E44FF  /* Cosmic Purple */
--color-accent: #FFB800     /* Sandy Gold */
--color-text: #F0F0F0       /* Starlight White */
```

#### Typography

- **UI Text**: Inter (sans-serif) for clean readability
- **Headers**: Space Mono for "space cowboy" aesthetic
- **Code**: Monospace for technical content

#### Components

- **GalaxyBackground**: Animated starfield background
- **Glassmorphism**: Frosted glass effects with backdrop blur
- **Neon Accents**: Glowing borders and highlights
- **Smooth Animations**: CSS transitions and transforms

## 🛠️ Technology Stack

### Core Framework

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server

### Routing & State

- **React Router DOM** - Client-side routing
- **React Hooks** - State management and side effects
- **Custom Hooks** - Reusable stateful logic

### Styling

- **CSS Modules** - Scoped component styles
- **CSS Custom Properties** - Theme variables
- **Responsive Design** - Mobile-first approach

### UI/UX

- **React Hot Toast** - Toast notifications
- **Loading States** - Skeleton screens and spinners
- **Error Boundaries** - Graceful error handling
- **Confirmation Dialogs** - User action confirmations

### Development

- **ESLint** - Code linting and formatting
- **TypeScript** - Static type checking
- **Vite HMR** - Hot module replacement

## 📱 User Interface

### 🏠 Dashboard

- **Grant Overview**: Visual cards showing grant details
- **Quick Actions**: Easy navigation to grant details
- **Status Indicators**: Clear visual feedback
- **Responsive Grid**: Adapts to different screen sizes

### 📋 Grant Detail

- **Grant Information**: Complete grant details and rules
- **Expense Form**: Submit new expenses with validation
- **Compliance Check**: Real-time AI compliance checking
- **Expense History**: List of submitted expenses with status
- **AI Feedback**: Visual compliance results

### ✅ Approval Queue

- **Pending Expenses**: List of expenses awaiting approval
- **AI Recommendations**: Compliance check results
- **Approval Actions**: Approve/reject with confirmation
- **Bulk Operations**: Handle multiple approvals

### 🎨 Visual Design

- **Space Theme**: Cosmic background with animated stars
- **Glassmorphism**: Frosted glass components
- **Neon Accents**: Glowing borders and highlights
- **Smooth Animations**: CSS transitions and micro-interactions

## 🔧 Configuration

### Environment Variables

The application supports environment-based configuration:

```env
# API Configuration
VITE_API_URL=http://localhost:8000

# Development Settings
VITE_DEBUG=true
VITE_MOCK_API=false
```

### API Configuration

```typescript
// config.ts
export const config = {
  USE_MOCK_API: false, // Toggle mock/real API
  API_BASE_URL: "http://localhost:8000", // Backend URL
  MOCK_DELAY: 500, // Mock response delay
};
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (required for Vite)
- npm or yarn
- Docker (optional)

### Local Development

1. **Install Dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**

   ```bash
   npm run dev
   ```

3. **Build for Production**

   ```bash
   npm run build
   ```

4. **Preview Production Build**
   ```bash
   npm run preview
   ```

### Docker Development

1. **Build and Run**

   ```bash
   docker compose -f docker-compose.dev.yml up frontend
   ```

2. **Production Build**
   ```bash
   docker compose up frontend
   ```

## 📁 Project Structure

### 🧩 Components

#### Common Components

- **LoadingSpinner**: Animated loading indicator
- **ErrorMessage**: Error display with retry functionality
- **ConfirmDialog**: Modal confirmation dialogs
- **GalaxyBackground**: Animated space background

#### Layout Components

- **Header**: Navigation and branding
- **App**: Main application wrapper with routing

#### Feature Components

- **GrantCard**: Grant overview cards
- **ExpenseForm**: Expense submission form
- **ComplianceCheck**: AI compliance results
- **ApprovalQueue**: Expense approval interface

### 🎯 Features

#### Grants Feature

```
features/grants/
├── components/
│   └── GrantCard/          # Grant display cards
├── hooks/
│   └── useGrants.ts       # Grant data management
└── pages/
    ├── Dashboard/          # Main dashboard
    └── GrantDetail/        # Individual grant view
```

#### Expenses Feature

```
features/expenses/
├── components/
│   ├── ExpenseForm/        # Expense submission
│   ├── ComplianceCheck/    # AI compliance display
│   └── ApprovalQueue/      # Approval interface
├── hooks/
│   └── useExpenses.ts     # Expense data management
└── pages/
    └── ApprovalsPage/      # Approval dashboard
```

### 🔌 API Layer

#### Service Architecture

```typescript
// api/api.ts - Main API service
class RealApiService {
  // User endpoints
  async createUser(user: User): Promise<User>;
  async getUsers(): Promise<User[]>;

  // Grant endpoints
  async getGrants(): Promise<Grant[]>;
  async getGrant(id: number): Promise<GrantWithExpenses>;

  // Expense endpoints
  async createExpense(grantId: number, expense: Expense): Promise<Expense>;
  async getPendingExpenses(): Promise<Expense[]>;
  async approveExpense(id: number, approverId: number): Promise<Approval>;
  async rejectExpense(id: number, approverId: number): Promise<Approval>;

  // Compliance
  async checkCompliance(
    request: ComplianceCheckRequest
  ): Promise<ComplianceCheckResponse>;
}
```

#### Mock API

- **Realistic Data**: Pre-populated with sample grants and expenses
- **Simulated Delays**: Network latency simulation
- **Error Scenarios**: Various error conditions for testing

## 🎨 Styling System

### CSS Modules

Each component has its own CSS module for scoped styling:

```css
/* Component.module.css */
.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
}
```

### Global Styles

```css
/* styles/global.css */
:root {
  --color-primary: #0d0d2b;
  --color-secondary: #6e44ff;
  --color-accent: #ffb800;
  --color-text: #f0f0f0;
}

body {
  font-family: "Inter", sans-serif;
  background: linear-gradient(135deg, var(--color-primary), #1a1a2e);
}
```

### Responsive Design

- **Mobile First**: Base styles for mobile devices
- **Breakpoints**: Tablet and desktop adaptations
- **Flexible Layouts**: CSS Grid and Flexbox
- **Touch Friendly**: Appropriate touch targets

## 🔄 State Management

### Custom Hooks

```typescript
// useGrants.ts
export function useGrants() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrants = useCallback(async () => {
    // API call logic
  }, []);

  return { grants, loading, error, refetch: fetchGrants };
}
```

### Data Flow

1. **API Calls**: Service layer handles backend communication
2. **State Updates**: Hooks manage component state
3. **Error Handling**: Graceful error states and retry logic
4. **Loading States**: Visual feedback during async operations

## 🧪 Testing & Quality

### Code Quality

- **TypeScript**: Static type checking
- **ESLint**: Code linting and formatting
- **React Hooks**: Proper hook usage patterns

### Error Handling

- **Error Boundaries**: Catch and display errors gracefully
- **Retry Logic**: Automatic retry for failed requests
- **User Feedback**: Clear error messages and actions

### Performance

- **Code Splitting**: Route-based code splitting
- **Lazy Loading**: Dynamic imports for better performance
- **Optimized Builds**: Vite's optimized production builds

## 🚀 Deployment

### Development

```bash
# Local development
npm run dev

# Docker development
docker compose -f docker-compose.dev.yml up frontend
```

### Production

```bash
# Build for production
npm run build

# Docker production
docker compose up frontend
```

### Environment Configuration

- **Development**: Hot reload, debug mode
- **Production**: Optimized builds, Nginx serving
- **Docker**: Multi-stage builds for efficiency

## 🔧 Development Guidelines

### Component Structure

```typescript
// Component.tsx
interface ComponentProps {
  // Props interface
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Component logic
  return <div className={styles.container}>{/* JSX content */}</div>;
};

export default Component;
```

### Styling Guidelines

- Use CSS Modules for component styles
- Follow the design system color palette
- Implement responsive design patterns
- Use CSS custom properties for theming

### API Integration

- Use the service layer for all API calls
- Implement proper error handling
- Add loading states for async operations
- Use TypeScript interfaces for data types

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**: Check TypeScript types and imports
2. **Styling Issues**: Verify CSS module imports
3. **API Errors**: Check backend connection and CORS
4. **Routing Issues**: Verify React Router configuration

### Debug Mode

Set `VITE_DEBUG=true` for additional logging and error information.

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Router](https://reactrouter.com/)
- [CSS Modules](https://github.com/css-modules/css-modules)

---

**Status**: ✅ Production Ready MVP  
**Last Updated**: October 2024  
**Version**: 1.0.0
