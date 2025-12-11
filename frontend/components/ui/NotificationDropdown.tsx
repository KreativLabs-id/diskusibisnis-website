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
        return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const content = (
    <div
      className={`px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer border-l-3 ${notification.is_read
          ? 'border-transparent bg-white'
          : 'border-emerald-500 bg-emerald-50/30'
        }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <p className={`text-sm leading-relaxed ${notification.is_read ? 'text-slate-600' : 'text-slate-700'
                }`}>
                {formatMessage(notification.message || notification.title)}
              </p>
            </div>
            {!notification.is_read && (
              <div className="w-2 h-2 bg-emerald-500 rounded-full shrink-0 mt-1.5"></div>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            {formatTimeAgo(notification.created_at)}
          </p>
        </div>
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} className="block border-b border-slate-100 last:border-0">
        {content}
      </Link>
    );
  }

  return <div className="border-b border-slate-100 last:border-0">{content}</div>;
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
        className="relative p-2 hover:bg-slate-50 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] rounded-full min-w-4 h-4 flex items-center justify-center font-bold leading-none px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu - Responsive with Max Height */}
      {isOpen && (
        <div className="fixed sm:absolute right-0 top-14 sm:top-auto sm:mt-2 w-full sm:w-96 max-h-[70vh] sm:max-h-[600px] bg-white rounded-b-xl sm:rounded-xl shadow-2xl border-t sm:border border-slate-200 flex flex-col z-50 overflow-hidden">
          {/* Header - Clean & Minimal */}
          <div className="px-4 py-3 border-b border-slate-200 bg-white shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Pemberitahuan</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-emerald-600 font-medium mt-0.5">
                    {unreadCount} belum dibaca
                  </p>
                )}
              </div>
              {/* Action Menu Button */}
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Tandai semua dibaca"
                >
                  <CheckCheck className="w-5 h-5 text-emerald-600" />
                </button>
              )}
            </div>
          </div>

          {/* Notifications List - Scrollable */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="text-sm text-slate-500 mt-3">Memuat pemberitahuan...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-base text-slate-700 font-semibold">Tidak ada pemberitahuan</p>
                <p className="text-sm text-slate-500 mt-1">
                  Pemberitahuan baru akan muncul di sini
                </p>
              </div>
            ) : (
              <>
                {/* Unread Section */}
                {notifications.some(n => !n.is_read) && (
                  <div>
                    <div className="px-4 py-2 bg-slate-50 sticky top-0 z-10">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Belum Dibaca</p>
                    </div>
                    <div>
                      {notifications.filter(n => !n.is_read).map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={markAsRead}
                          onClose={() => setIsOpen(false)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Read Section */}
                {notifications.some(n => n.is_read) && (
                  <div>
                    {notifications.some(n => !n.is_read) && (
                      <div className="px-4 py-2 bg-slate-50 sticky top-0 z-10">
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Sudah Dibaca</p>
                      </div>
                    )}
                    <div>
                      {notifications.filter(n => n.is_read).map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={markAsRead}
                          onClose={() => setIsOpen(false)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer - Full Width Button */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-200 bg-white shrink-0">
              <Link
                href="/notifications"
                className="block w-full px-4 py-3 text-center text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Lihat Semua Pemberitahuan
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
