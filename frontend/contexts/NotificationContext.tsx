'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { notificationAPI } from '@/lib/api';
import { Notification, NotificationContextType } from '@/types/notification';
import { useAuth } from './AuthContext';
import { Bell } from 'lucide-react';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const prevUnreadCountRef = useRef(0);
  const isFirstLoad = useRef(true);
  const socketRef = useRef<Socket | null>(null);

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

  // Handle new notification from WebSocket
  const handleNewNotification = useCallback((notification: Notification) => {
    console.log('[WebSocket] New notification received:', notification);
    setNotifications(prev => {
      // Check if notification already exists
      if (Array.isArray(prev) && prev.some(n => n.id === notification.id)) {
        return prev;
      }
      return Array.isArray(prev) ? [notification, ...prev] : [notification];
    });
  }, []);

  // WebSocket Connection
  useEffect(() => {
    if (!user || !token) {
      // Disconnect if no user
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Connect to WebSocket
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const wsUrl = apiUrl.replace('/api', ''); // Remove /api suffix for WebSocket

    console.log('[WebSocket] Connecting to:', wsUrl);

    const socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[WebSocket] Connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error.message);
      setIsConnected(false);
    });

    // Listen for new notifications
    socket.on('notification:new', handleNewNotification);

    // Listen for notification deleted
    socket.on('notification:deleted', (data: { id: string }) => {
      console.log('[WebSocket] Notification deleted:', data.id);
      setNotifications(prev =>
        Array.isArray(prev) ? prev.filter(n => n.id !== data.id) : []
      );
    });

    // Cleanup
    return () => {
      console.log('[WebSocket] Cleaning up...');
      socket.off('notification:new', handleNewNotification);
      socket.off('notification:deleted');
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [user, token, handleNewNotification]);

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

  const deleteNotification = async (id: string) => {
    try {
      await notificationAPI.delete(id);
      setNotifications(prev =>
        Array.isArray(prev) ? prev.filter(notification => notification.id !== id) : []
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
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

  // Fallback Polling (60 seconds) - only if WebSocket is not connected
  useEffect(() => {
    if (!user || isConnected) return;

    console.log('[Polling] WebSocket not connected, using fallback polling...');
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 60000); // 60 seconds fallback

    return () => clearInterval(interval);
  }, [user, isConnected]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      addNotification,
      deleteNotification
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
