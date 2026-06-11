import { createContext } from 'react';

export interface UiNotification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  kind: string;
  href?: string;
}

export type NotificationContextValue = {
  items: UiNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  isLoading: boolean;
};

export const NotificationContext = createContext<NotificationContextValue | null>(null);
