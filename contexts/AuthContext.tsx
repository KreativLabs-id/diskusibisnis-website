'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '@/lib/api';

interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
  reputationPoints: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
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
    // Check if user is logged in on mount
    const initAuth = () => {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }
      
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      setLoading(false);
    };

    initAuth();
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

  const register = async (email: string, password: string, displayName: string) => {
    const response = await authAPI.register({ email, password, displayName });
    const { user, token } = response.data.data;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    setUser(user);
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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
        avatarUrl: userData.avatarUrl || userData.avatar_url,
        role: userData.role,
        reputationPoints: userData.reputationPoints || userData.reputation_points || 0
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
        avatarUrl: userData.avatarUrl || userData.avatar_url,
        role: userData.role,
        reputationPoints: userData.reputationPoints || userData.reputation_points || 0
      };
      
      updateUser(updatedUser);
    } catch (error) {
      console.error('Error force refreshing user data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, refreshUser, forceRefreshUser }}>
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
