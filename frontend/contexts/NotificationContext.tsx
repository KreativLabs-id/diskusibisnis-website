'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { notificationAPI } from '@/lib/api';
import { Notification, NotificationContextType } from '@/types/notification';
import { useAuth } from './AuthContext';
import { Bell } from 'lucide-react';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null);
  const prevUnreadCountRef = useRef(0);
  const isFirstLoad = useRef(true);

  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.is_read).length : 0;

  const fetchNotifications = async (isBackground = false) => {
    if (!user) return;

    try {
      if (!isBackground) setLoading(true);
      const response = await notificationAPI.getAll();
      const notificationData = response.data?.data?.notifications || response.data?.notifications || [];
      const newNotifications = Array.isArray(notificationData) ? notificationData : [];

      setNotifications(newNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  // Track unread changes for toast
  useEffect(() => {
    if (isFirstLoad.current) {
      if (notifications.length > 0) {
        prevUnreadCountRef.current = unreadCount;
        isFirstLoad.current = false;
      }
      return;
    }

    if (unreadCount > prevUnreadCountRef.current) {
      const diff = unreadCount - prevUnreadCountRef.current;
      setToast({
        message: diff === 1 ? 'Anda memiliki notifikasi baru!' : `Anda memiliki ${diff} notifikasi baru!`,
        visible: true
      });

      // Play notification sound
      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => { }); // Ignore autoplay errors
      } catch (e) { }

      setTimeout(() => setToast(null), 4000);
    }
    prevUnreadCountRef.current = unreadCount;
  }, [unreadCount, notifications]);

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

  // Initial Fetch
  useEffect(() => {
    let mounted = true;

    const initNotifications = async () => {
      if (!user) {
        if (mounted) setNotifications([]);
        return;
      }
      // Fetch immediately on mount
      await fetchNotifications();
    };

    initNotifications();

    return () => { mounted = false; };
  }, [user]);

  // Real-time Polling (10 seconds)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 10000); // 10 seconds for "instant feel"

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
      {/* Toast Notification */}
      {toast && toast.visible && (
        <div className="fixed bottom-20 right-4 sm:bottom-4 sm:right-4 bg-slate-900 dark:bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-2xl z-[100] animate-bounce-in flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform border border-slate-700 dark:border-emerald-500" onClick={() => {
          // Scroll to top or open notification dropdown logic could go here
          setToast(null);
        }}>
          <div className="p-1.5 bg-white/20 rounded-full">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold">Update Baru</p>
            <p className="text-xs text-slate-200">{toast.message}</p>
          </div>
        </div>
      )}
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
