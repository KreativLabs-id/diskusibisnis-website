'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Check, CheckCheck, MessageSquare, ThumbsUp, User, AlertCircle, X } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification } from '@/types/notification';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'answer':
      return <MessageSquare className="w-4 h-4 text-green-600" />;
    case 'comment':
      return <MessageSquare className="w-4 h-4 text-emerald-600" />;
    case 'vote':
      return <ThumbsUp className="w-4 h-4 text-orange-600" />;
    case 'mention':
      return <User className="w-4 h-4 text-purple-600" />;
    case 'system':
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    default:
      return <Bell className="w-4 h-4 text-gray-600" />;
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Baru saja';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
  
  return date.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onMarkAsRead, 
  onClose 
}) => {
  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    onClose();
  };

  const content = (
    <div 
      className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer border-l-4 ${
        notification.is_read 
          ? 'border-transparent bg-white' 
          : 'border-emerald-500 bg-emerald-50/30'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h4 className={`text-sm font-medium ${
              notification.is_read ? 'text-slate-700' : 'text-slate-900'
            }`}>
              {notification.title}
            </h4>
            {!notification.is_read && (
              <div className="w-2 h-2 bg-emerald-600 rounded-full flex-shrink-0 ml-2 mt-1"></div>
            )}
          </div>
          {notification.message && (
            <p className={`text-sm mt-1 ${
              notification.is_read ? 'text-slate-500' : 'text-slate-600'
            }`}>
              {notification.message}
            </p>
          )}
          <p className="text-xs text-slate-400 mt-2">
            {formatTimeAgo(notification.created_at)}
          </p>
        </div>
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} className="block">
        {content}
      </Link>
    );
  }

  return content;
};

export default function NotificationDropdown() {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead,
    fetchNotifications 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={handleToggle}
        className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-slate-200 z-50 max-h-[500px] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Notifikasi</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center space-x-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Tandai semua dibaca</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-200 rounded"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-slate-600 mt-1">
                {unreadCount} notifikasi belum dibaca
              </p>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="text-sm text-slate-500 mt-2">Memuat notifikasi...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Tidak ada notifikasi</p>
                <p className="text-sm text-slate-400 mt-1">
                  Notifikasi baru akan muncul di sini
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onClose={() => setIsOpen(false)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
              <Link
                href="/notifications"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Lihat semua notifikasi
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
