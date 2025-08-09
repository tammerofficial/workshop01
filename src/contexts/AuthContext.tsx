import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/laravel';

interface User {
  id: number;
  name: string;
  email: string;
  role: {
    id: number;
    name: string;
    display_name: string;
    permissions: string[];
  };
  permissions: string[];
  department?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // ⚠️ مؤقت: إلغاء صفحة الدخول - المستخدم معتمد تلقائياً
  // TEMPORARY: Disable login page - User automatically authenticated
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>({
    id: 1,
    name: 'علي العليوي',
    email: 'alalawi310@gmail.com',
    role: {
      id: 1,
      name: 'admin',
      display_name: 'مدير النظام',
      permissions: ['*']
    },
    permissions: ['*'],
    department: 'الإدارة'
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // ⚠️ مؤقت: تخطي فحص المصادقة
    // TEMPORARY: Skip authentication check
    const checkAuth = () => {
      // Always set as authenticated temporarily
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: 'علي العليوي',
        email: 'alalawi310@gmail.com',
        role: {
          id: 1,
          name: 'admin',
          display_name: 'مدير النظام',
          permissions: ['*']
        },
        permissions: ['*'],
        department: 'الإدارة'
      }));
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const response = await authApi.login({ email, password });
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Store token for API requests
        localStorage.setItem('auth_token', token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(user));
        
        setIsAuthenticated(true);
        setUser(user);
        setLoading(false);
        return true;
      } else {
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    setUser(null);
    // Use window.location instead of navigate to avoid hook dependencies
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};