import React, { type ReactNode } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { LoginForm } from '../LoginForm';

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: string;
  role?: string;
  fallback?: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  permission, 
  role, 
  fallback 
}) => {
  const { user, hasPermission, hasRole } = useAuth();

  // If no user is logged in, show login form
  if (!user) {
    return <LoginForm />;
  }

  // Check permission if specified
  if (permission && !hasPermission(permission)) {
    return fallback || (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        color: 'var(--color-text)',
        fontFamily: 'Space Mono, monospace'
      }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  // Check role if specified
  if (role && !hasRole(role)) {
    return fallback || (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        color: 'var(--color-text)',
        fontFamily: 'Space Mono, monospace'
      }}>
        <h2>Access Denied</h2>
        <p>This page is restricted to {role} users only.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
