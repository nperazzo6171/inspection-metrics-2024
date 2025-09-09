import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from './queryClient';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<any>;
  logout: () => void;
  loading: boolean;
  user: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already authenticated (e.g., from localStorage)
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      setIsAuthenticated(true);
      setUser(authData.user);
    }
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiRequest('/api/login', 'POST', { username, password });
      const result = await response.json();
      
      if (result.success) {
        setIsAuthenticated(true);
        setUser(result.user);
        localStorage.setItem('auth', JSON.stringify(result));
        
        // Armazenar token de acesso para uploads administrativos
        if (result.accessToken) {
          localStorage.setItem('accessToken', result.accessToken);
        }
      }
      
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      return { success: false, message: 'Erro de conexão' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('auth');
    localStorage.removeItem('accessToken');
  };

  return React.createElement(
    AuthContext.Provider,
    { value: { isAuthenticated, login, logout, loading, user } },
    children
  );
};
