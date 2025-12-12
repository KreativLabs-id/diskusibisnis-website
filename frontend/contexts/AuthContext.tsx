'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '@/lib/api';

interface User {
  id: string;
  email: string;
  displayName: string;
  username?: string;
  avatarUrl?: string;
  role: string;
  reputationPoints: number;
  isVerified: boolean;
  googleId?: string; // For detecting Google-authenticated users
  hasPassword?: boolean; // For detecting if user has a password set
}

interface AuthContextType {
  user: User | null;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Check if user is logged in on mount
    const initAuth = async () => {
      if (typeof window === 'undefined') {
        if (mounted) setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          if (mounted) setUser(parsedUser);

          // Debounce user refresh to avoid duplicate requests (React Strict Mode)
          const lastRefresh = localStorage.getItem('lastUserRefresh');
          const now = Date.now();
          const shouldRefresh = !lastRefresh || (now - parseInt(lastRefresh)) > 30000; // 30 seconds

          if (shouldRefresh) {
            try {
              const response = await userAPI.getProfile(parsedUser.id);
              const userData = response.data.data.user || response.data.user;

              const updatedUser = {
                id: userData.id,
                email: userData.email || parsedUser.email,
                displayName: userData.displayName || userData.display_name,
                username: userData.username,
                avatarUrl: userData.avatarUrl || userData.avatar_url,
                role: userData.role || parsedUser.role,
                reputationPoints: userData.reputationPoints || userData.reputation_points || 0,
                isVerified: userData.isVerified || userData.is_verified || (userData.role === 'admin'),
                googleId: userData.googleId || userData.google_id || parsedUser.googleId,
                hasPassword: userData.hasPassword ?? userData.has_password ?? parsedUser.hasPassword
              };

              if (mounted) {
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                localStorage.setItem('lastUserRefresh', now.toString());
              }
            } catch (error) {
              console.error('Error refreshing user on init:', error);
            }
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
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
    const { user, token } = response.data.data;

    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    setUser(user);

    // Refresh user data from server to get latest role
    setTimeout(() => {
      refreshUser();
    }, 1000);
  };

  const googleLogin = async (credential: string) => {
    const response = await authAPI.googleLogin(credential);
    const { user, token } = response.data.data;

    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    setUser(user);

    // Refresh user data from server to get latest info
    setTimeout(() => {
      refreshUser();
    }, 1000);
  };

  const register = async (email: string, password: string, displayName: string) => {
    const response = await authAPI.register({ email, password, displayName });
    const { user, token } = response.data.data;

    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    setUser(user);
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
      setUser(null);
      window.location.href = '/';
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const refreshUser = async () => {
    if (!user) return;

    try {
      const response = await userAPI.getProfile(user.id);
      const userData = response.data.data.user || response.data.user;

      const updatedUser = {
        id: userData.id,
        email: userData.email,
        displayName: userData.displayName || userData.display_name,
        username: userData.username,
        avatarUrl: userData.avatarUrl || userData.avatar_url,
        role: userData.role,
        reputationPoints: userData.reputationPoints || userData.reputation_points || 0,
        isVerified: userData.isVerified || userData.is_verified || (userData.role === 'admin'),
        googleId: userData.googleId || userData.google_id,
        hasPassword: userData.hasPassword ?? userData.has_password
      };

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

      const updatedUser = {
        id: userData.id,
        email: userData.email,
        displayName: userData.displayName || userData.display_name,
        username: userData.username,
        avatarUrl: userData.avatarUrl || userData.avatar_url,
        role: userData.role,
        reputationPoints: userData.reputationPoints || userData.reputation_points || 0,
        isVerified: userData.isVerified || userData.is_verified || (userData.role === 'admin'),
        googleId: userData.googleId || userData.google_id,
        hasPassword: userData.hasPassword ?? userData.has_password
      };

      updateUser(updatedUser);
    } catch (error) {
      console.error('Error force refreshing user data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, googleLogin, register, logout, updateUser, refreshUser, forceRefreshUser }}>
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
