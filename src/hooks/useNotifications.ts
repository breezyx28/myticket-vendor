import { NotificationContext } from '@/contexts/notificationContext';
import { useContext } from 'react';

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return ctx;
}
