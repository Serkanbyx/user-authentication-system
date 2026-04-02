import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const clearAuthState = useCallback(() => {
    setUser(null);
    localStorage.removeItem('accessToken');
    delete api.defaults.headers.common.Authorization;
  }, []);

  // Validate existing session on mount by fetching profile
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/api/users/profile');
        setUser(data.user);
      } catch {
        clearAuthState();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [clearAuthState]);

  // Listen for session-expired events dispatched by axios interceptor
  useEffect(() => {
    const handleSessionExpired = () => clearAuthState();
    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, [clearAuthState]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });

    localStorage.setItem('accessToken', data.accessToken);
    api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
    setUser(data.user);

    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/api/auth/register', { name, email, password });
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      clearAuthState();
    }
  }, [clearAuthState]);

  const value = useMemo(
    () => ({ user, isAuthenticated, isLoading, login, register, logout, setUser }),
    [user, isAuthenticated, isLoading, login, register, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
