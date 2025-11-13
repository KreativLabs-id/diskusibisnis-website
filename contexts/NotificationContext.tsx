'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationAPI } from '@/lib/api';
import { Notification, NotificationContextType } from '@/types/notification';
import { useAuth } from './AuthContext';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.is_read).length : 0;

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await notificationAPI.getAll();
      const notificationData = response.data?.data?.notifications || response.data?.notifications || [];
      setNotifications(Array.isArray(notificationData) ? notificationData : []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => 
        Array.isArray(prev) ? prev.map(notification => 
          notification.id === id 
            ? { ...notification, is_read: true }
            : notification
        ) : []
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => 
        Array.isArray(prev) ? prev.map(notification => ({ ...notification, is_read: true })) : []
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => Array.isArray(prev) ? [notification, ...prev] : [notification]);
  };

  // Fetch notifications when user logs in
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [user]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      addNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
