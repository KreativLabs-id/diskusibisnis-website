'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, MessageSquare, ThumbsUp, User, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification } from '@/types/notification';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'answer':
      return (
        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
          <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
      );
    case 'comment':
      return (
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
          <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
      );
    case 'vote':
      return (
        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
          <ThumbsUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
      );
    case 'mention':
      return (
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
          <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
      );
    case 'system':
      return (
        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
      );
    default:
      return (
        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </div>
      );
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

// Fix legacy notification messages with wrong format
const fixLegacyMessage = (text: string): string => {
  if (!text) return '';

  // Fix patterns like 'in "title"' to 'di pertanyaan: "title"'
  let fixed = text.replace(/^in "([^"]+)"$/i, 'Seseorang menyebut Anda di pertanyaan: **$1**');
  fixed = fixed.replace(/^in '([^']+)'$/i, 'Seseorang menyebut Anda di pertanyaan: **$1**');

  // Fix other English patterns
  fixed = fixed.replace(/mentioned you in/gi, 'menyebut Anda di');
  fixed = fixed.replace(/answered your question/gi, 'menjawab pertanyaan Anda');
  fixed = fixed.replace(/commented on/gi, 'mengomentari');
  fixed = fixed.replace(/upvoted your/gi, 'menyukai');
  fixed = fixed.replace(/liked your/gi, 'menyukai');

  return fixed;
};

// Parse bold text patterns like **name** or **title**
const formatMessage = (text: string) => {
  const fixedText = fixLegacyMessage(text);
  const parts = fixedText.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-slate-900 dark:text-slate-100">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
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
      className={`p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0 ${notification.is_read
        ? 'bg-white dark:bg-slate-900'
        : 'bg-emerald-50/40 dark:bg-emerald-900/20'
        }`}
      onClick={handleClick}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={`text-sm sm:text-base font-semibold leading-snug ${notification.is_read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-slate-100'
              }`}>
              {notification.title}
            </h3>
            <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0 flex items-center gap-1">
              {formatTimeAgo(notification.created_at)}
              {!notification.is_read && (
                <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block ml-1"></span>
              )}
            </span>
          </div>

          {notification.message && (
            <p className={`text-sm leading-relaxed line-clamp-2 ${notification.is_read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-600 dark:text-slate-300'
              }`}>
              {formatMessage(notification.message)}
            </p>
          )}
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Mobile Header - Sticky */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 sm:hidden flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="hidden p-1 -ml-1 text-slate-600 dark:text-slate-400">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Notifikasi</h1>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs font-medium text-emerald-600 dark:text-emerald-400 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg"
          >
            Tandai dibaca
          </button>
        )}
      </div>

      <div className="w-full max-w-3xl mx-auto sm:px-4 sm:py-8">
        {/* Desktop Header */}
        <div className="hidden sm:flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Notifikasi</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                {unreadCount > 0
                  ? `${unreadCount} notifikasi baru`
                  : 'Tidak ada notifikasi baru'
                }
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl transition-colors font-medium text-sm"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Tandai semua dibaca</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-slate-900 sm:rounded-2xl shadow-sm border-b sm:border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[50vh]">
          {loading ? (
            <div className="animate-pulse divide-y divide-slate-100 dark:divide-slate-800">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="p-4 sm:p-5 flex gap-4">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full shrink-0"></div>
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Belum ada notifikasi</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-sm">
                Kami akan memberi tahu Anda ketika ada aktivitas penting terkait akun Anda.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
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

        {/* Load More Button */}
        {notifications.length > 0 && notifications.length >= 50 && (
          <div className="mt-6 text-center px-4">
            <button className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm shadow-sm">
              Muat lebih banyak
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
