import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Define user roles and their permissions
const ROLE_PERMISSIONS = {
  'Finance Director': [
    'view_grants',
    'view_expenses', 
    'approve_expenses',
    'reject_expenses',
    'view_payments',
    'process_payments',
    'view_users',
    'view_analytics'
  ],
  'Program Manager': [
    'view_grants',
    'create_grants',
    'view_expenses',
    'create_expenses',
    'view_payments',
    'create_payments',
    'view_documents'
  ],
  'Executive Director': [
    'view_grants',
    'create_grants',
    'view_expenses',
    'approve_expenses',
    'reject_expenses',
    'view_payments',
    'process_payments',
    'view_users',
    'create_users',
    'view_analytics',
    'view_documents'
  ],
  'Administrator': [
    'view_grants',
    'create_grants',
    'view_expenses',
    'create_expenses',
    'approve_expenses',
    'reject_expenses',
    'view_payments',
    'process_payments',
    'view_users',
    'create_users',
    'view_analytics',
    'view_documents'
  ]
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('astrafund_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('astrafund_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // For demo purposes, we'll use simple username/password validation
      // In a real app, this would call the backend authentication API
      const validCredentials = {
        'john_manager': { password: 'password123', role: 'Program Manager' },
        'sarah_finance': { password: 'password123', role: 'Finance Director' },
        'mike_coordinator': { password: 'password123', role: 'Program Manager' },
        'admin': { password: 'admin123', role: 'Administrator' }
      };

      const credentials = validCredentials[username as keyof typeof validCredentials];
      
      if (credentials && credentials.password === password) {
        const userData: User = {
          id: Math.floor(Math.random() * 1000),
          username,
          role: credentials.role,
          created_at: new Date().toISOString()
        };
        
        setUser(userData);
        localStorage.setItem('astrafund_user', JSON.stringify(userData));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('astrafund_user');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    const userPermissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [];
    return userPermissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    hasPermission,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
