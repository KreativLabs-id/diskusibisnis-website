'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, MessageSquare, ThumbsUp, User, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification } from '@/types/notification';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'answer':
      return <MessageSquare className="w-5 h-5 text-green-600" />;
    case 'comment':
      return <MessageSquare className="w-5 h-5 text-blue-600" />;
    case 'vote':
      return <ThumbsUp className="w-5 h-5 text-orange-600" />;
    case 'mention':
      return <User className="w-5 h-5 text-purple-600" />;
    case 'system':
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    default:
      return <Bell className="w-5 h-5 text-gray-600" />;
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
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
  };

  const content = (
    <div 
      className={`p-6 hover:bg-slate-50 transition-colors cursor-pointer border-l-4 ${
        notification.is_read 
          ? 'border-transparent bg-white' 
          : 'border-blue-500 bg-blue-50/30'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h3 className={`text-base font-semibold ${
              notification.is_read ? 'text-slate-700' : 'text-slate-900'
            }`}>
              {notification.title}
            </h3>
            {!notification.is_read && (
              <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0 ml-3 mt-1"></div>
            )}
          </div>
          {notification.message && (
            <p className={`text-sm mt-2 ${
              notification.is_read ? 'text-slate-500' : 'text-slate-600'
            }`}>
              {notification.message}
            </p>
          )}
          <p className="text-sm text-slate-400 mt-3">
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

export default function NotificationsPage() {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead,
    fetchNotifications 
  } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link 
              href="/"
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Notifikasi</h1>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-slate-600">
              {unreadCount > 0 
                ? `${unreadCount} notifikasi belum dibaca dari ${notifications.length} total`
                : `${notifications.length} notifikasi`
              }
            </p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Tandai semua dibaca</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-500 mt-4">Memuat notifikasi...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Tidak ada notifikasi</h3>
              <p className="text-slate-500">
                Notifikasi baru akan muncul di sini ketika ada aktivitas terkait akun Anda
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>
          )}
        </div>

        {/* Load More Button (for future pagination) */}
        {notifications.length > 0 && notifications.length >= 50 && (
          <div className="mt-8 text-center">
            <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">
              Muat lebih banyak
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
