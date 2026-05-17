'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '@/lib/api';

// Helper function to set user_role cookie for middleware access
const setUserRoleCookie = (role: string) => {
  if (typeof document !== 'undefined') {
    // Set cookie that expires in 7 days
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `user_role=${role}; path=/; expires=${expires}; SameSite=Lax${secure}`;
  }
};

// Helper function to clear user_role cookie
const clearUserRoleCookie = () => {
  if (typeof document !== 'undefined') {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secure}`;
  }
};

interface User {
  id: string;
  email: string;
  displayName: string;
  username?: string;
  avatarUrl?: string;
  bio?: string;
  role: string;
  reputationPoints: number;
  isVerified: boolean;
  googleId?: string; // For detecting Google-authenticated users
  hasPassword?: boolean; // For detecting if user has a password set
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
  forceRefreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeUser = (userData: any, fallback?: Partial<User>): User => ({
  id: userData.id ?? fallback?.id ?? '',
  email: userData.email ?? fallback?.email ?? '',
  displayName: userData.displayName || userData.display_name || fallback?.displayName || 'User',
  username: userData.username ?? fallback?.username,
  avatarUrl: userData.avatarUrl || userData.avatar_url || fallback?.avatarUrl,
  bio: userData.bio ?? fallback?.bio ?? '',
  role: userData.role ?? fallback?.role ?? 'member',
  reputationPoints: userData.reputationPoints || userData.reputation_points || fallback?.reputationPoints || 0,
  isVerified: userData.isVerified ?? userData.is_verified ?? fallback?.isVerified ?? userData.role === 'admin',
  googleId: userData.googleId || userData.google_id || fallback?.googleId,
  hasPassword: userData.hasPassword ?? userData.has_password ?? fallback?.hasPassword,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Check if user is logged in on mount
    const initAuth = async () => {
      if (typeof window === 'undefined') {
        if (mounted) setLoading(false);
        return;
      }

      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        if (mounted) setToken(savedToken);
        try {
          const parsedUser = JSON.parse(savedUser);
          if (mounted) {
            setUser(parsedUser);
            // Ensure user_role cookie is set for middleware
            setUserRoleCookie(parsedUser.role);
          }

          // Debounce user refresh to avoid duplicate requests (React Strict Mode)
          const lastRefresh = localStorage.getItem('lastUserRefresh');
          const now = Date.now();
          const shouldRefresh = !lastRefresh || (now - parseInt(lastRefresh)) > 30000; // 30 seconds

          if (shouldRefresh) {
            try {
              const response = await userAPI.getProfile(parsedUser.id);
              const userData = response.data.data.user || response.data.user;

              const updatedUser = normalizeUser(userData, parsedUser);

              if (mounted) {
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                localStorage.setItem('lastUserRefresh', now.toString());
                // Update user_role cookie for middleware
                setUserRoleCookie(updatedUser.role);
              }
            } catch (error) {
              console.error('Error refreshing user on init:', error);
            }
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          clearUserRoleCookie();
        }
      }

      if (mounted) setLoading(false);
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    const { user, token: newToken } = response.data.data;

    if (typeof window !== 'undefined') {
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(user));
      // Set user_role cookie for middleware to check admin access
      setUserRoleCookie(user.role);
    }
    const normalizedUser = normalizeUser(user);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);
    setToken(newToken);

    // Refresh user data from server to get latest role
    setTimeout(() => {
      refreshUser();
    }, 1000);
  };

  const googleLogin = async (credential: string) => {
    const response = await authAPI.googleLogin(credential);
    const { user, token: newToken } = response.data.data;

    if (typeof window !== 'undefined') {
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(user));
      // Set user_role cookie for middleware to check admin access
      setUserRoleCookie(user.role);
    }
    const normalizedUser = normalizeUser(user);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);
    setToken(newToken);

    // Refresh user data from server to get latest info
    setTimeout(() => {
      refreshUser();
    }, 1000);
  };

  const register = async (email: string, password: string, displayName: string) => {
    const response = await authAPI.register({ email, password, displayName });
    const { user, token: newToken } = response.data.data;

    if (typeof window !== 'undefined') {
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(user));
      // Set user_role cookie for middleware to check admin access
      setUserRoleCookie(user.role);
    }
    const normalizedUser = normalizeUser(user);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);
    setToken(newToken);
  };

  const logout = async () => {
    if (typeof window !== 'undefined') {
      try {
        // Call logout API to clear HttpOnly cookie
        await authAPI.logout();
      } catch (error) {
        console.error('Logout API error:', error);
      }
      // Always clear local storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('lastUserRefresh');
      // Clear user_role cookie
      clearUserRoleCookie();
      setUser(null);
      setToken(null);
      window.location.href = '/';
    }
  };

  const updateUser = (updatedUser: User) => {
    const normalizedUser = normalizeUser(updatedUser, user ?? undefined);
    setUser(normalizedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      // Update user_role cookie for middleware to check admin access
      setUserRoleCookie(normalizedUser.role);
    }
  };

  const refreshUser = async () => {
    if (!user) return;

    try {
      const response = await userAPI.getProfile(user.id);
      const userData = response.data.data.user || response.data.user;

      const updatedUser = normalizeUser(userData, user);

      updateUser(updatedUser);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const forceRefreshUser = async () => {
    if (!user) return;

    try {
      const response = await userAPI.getProfile(user.id);
      const userData = response.data.data.user || response.data.user;

      const updatedUser = normalizeUser(userData, user);

      updateUser(updatedUser);
    } catch (error) {
      console.error('Error force refreshing user data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, googleLogin, register, logout, updateUser, refreshUser, forceRefreshUser }}>
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
