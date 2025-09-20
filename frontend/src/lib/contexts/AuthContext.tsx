import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { TokenResponse } from '../api';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_superuser: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          await fetchUserInfo();
        } catch (error) {
          // If token is expired, try to refresh
          const refreshed = await refreshToken();
          if (!refreshed) {
            logout();
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const fetchUserInfo = async () => {
    try {
      // Use the full URL with API prefix
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005/api/v1';
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${apiBaseUrl}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }
      
      const userData = await response.json();
      setUser(userData);
      setError(null);
      return userData;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use FormData for OAuth2 password flow
      const formData = new FormData();
      formData.append('username', email); // OAuth2 uses 'username' field
      formData.append('password', password);
      
      // Make the login request
      // We need to use the full URL with API prefix
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005/api/v1';
      const loginUrl = `${apiBaseUrl}/auth/login`;
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid email or password');
        }
        try {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Login failed');
        } catch (jsonError) {
          throw new Error('Login failed. Please try again.');
        }
      }
      
      const tokenData: TokenResponse = await response.json();
      
      // Store tokens
      localStorage.setItem('auth_token', tokenData.access_token);
      if (tokenData.refresh_token) {
        localStorage.setItem('refresh_token', tokenData.refresh_token);
      }
      
      // Fetch user info
      await fetchUserInfo();
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    const refreshTokenValue = localStorage.getItem('refresh_token');
    if (!refreshTokenValue) return false;
    
    try {
      // Use the full URL with API prefix
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005/api/v1';
      const refreshUrl = `${apiBaseUrl}/auth/refresh`;
      
      const response = await fetch(refreshUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${refreshTokenValue}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
      
      const tokenData: TokenResponse = await response.json();
      
      localStorage.setItem('auth_token', tokenData.access_token);
      if (tokenData.refresh_token) {
        localStorage.setItem('refresh_token', tokenData.refresh_token);
      }
      
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
        refreshToken,
      }}
    >
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
