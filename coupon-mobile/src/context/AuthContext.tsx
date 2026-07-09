import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi } from '../api/auth';
import { getApiErrorMessage, setUnauthorizedHandler } from '../api/client';
import { authStorage } from '../services/authStorage';
import { getFcmToken, syncFcmTokenWithBackend } from '../services/notifications';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(async () => {
    await authStorage.clear();
    setUser(null);
    setToken(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
    });

    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          authStorage.getToken(),
          authStorage.getUser(),
        ]);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          syncFcmTokenWithBackend().catch(() => {});
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [clearSession]);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const fcmToken = await getFcmToken();
      const response = await authApi.login(username, password, fcmToken);

      if (!response.success || !response.data) {
        return response.message || 'Identifiants invalides';
      }

      const { token: newToken, user: newUser } = response.data;
      await authStorage.saveAuth(newToken, newUser);
      setToken(newToken);
      setUser(newUser);
      await syncFcmTokenWithBackend();
      return null;
    } catch (error) {
      return getApiErrorMessage(error);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore network errors on logout
    }
    await clearSession();
  }, [clearSession]);

  const refreshProfile = useCallback(async () => {
    const response = await authApi.getProfile();
    if (response.success && response.data?.user) {
      setUser(response.data.user);
      const currentToken = await authStorage.getToken();
      if (currentToken) {
        await authStorage.saveAuth(currentToken, response.data.user);
      }
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!token && !!user,
      login,
      logout,
      refreshProfile,
    }),
    [user, token, isLoading, login, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
