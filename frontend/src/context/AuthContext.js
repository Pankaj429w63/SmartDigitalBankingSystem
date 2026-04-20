/**
 * AuthContext — Global authentication state management
 * Provides user info and auth actions to the entire app
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('bankingToken'));
  const [loading, setLoading] = useState(true);

  // On mount, rehydrate user from stored token
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('bankingToken');
      if (storedToken) {
        try {
          const { data } = await authService.getMe();
          if (data.success) setUser(data.user);
        } catch {
          localStorage.removeItem('bankingToken');
          localStorage.removeItem('bankingUser');
          setToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await authService.login(credentials);
    if (data.success) {
      localStorage.setItem('bankingToken', data.token);
      localStorage.setItem('bankingUser', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    const { data } = await authService.register(userData);
    if (data.success) {
      localStorage.setItem('bankingToken', data.token);
      localStorage.setItem('bankingUser', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('bankingToken');
    localStorage.removeItem('bankingUser');
    setToken(null);
    setUser(null);
  }, []);

  const updateUserData = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('bankingUser', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUserData, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
