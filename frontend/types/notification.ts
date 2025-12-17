export interface Notification {
  id: string;
  user_id: string;
  type: 'answer' | 'comment' | 'vote' | 'mention' | 'system' | 'accepted_answer';
  title: string;
  message?: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  deleteNotification: (id: string) => Promise<void>;
}
