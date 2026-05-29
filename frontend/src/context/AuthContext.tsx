'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '../services/api';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if session is already active (via cookie validation)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const data = await fetchApi('/api/auth/me');
        if (data.user) {
          setUser({
            id: data.user._id,
            email: data.user.email
          });
        }
      } catch (err) {
        // Silently fail: user is simply not logged in
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();

    // Listen for global 401 unauthorized events
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth-unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email
        });
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchApi('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email
        });
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetchApi('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (err: any) {
      setError(err.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, register, logout, clearError }}>
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
