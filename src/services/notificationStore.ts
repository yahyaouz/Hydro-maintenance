import { create } from 'zustand';

export interface IndustrialNotification {
  id: string;
  type: 'CRITIQUE' | 'MAJEUR' | 'AVERTISSEMENT' | 'INFORMATION';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  triggerSource: string;
  siteId?: string;
  lineageId?: string;
  enginId?: string;
}

interface NotificationState {
  notifications: IndustrialNotification[];
  addNotification: (notification: Omit<IndustrialNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const STORAGE_KEY = 'sg_notifications_all';

const getInitialNotifications = (): IndustrialNotification[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return parsed.filter((n: IndustrialNotification) =>
        new Date(n.timestamp).getTime() > cutoff
      );
    }
  } catch { /* suppress */ }
  return [];
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: getInitialNotifications(),
  addNotification: (item) => {
    const newNotif: IndustrialNotification = {
      ...item,
      id: `notif-${Date.now()}-${Math.floor(10 + Math.random() * 90)}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    const updated = [newNotif, ...get().notifications];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ notifications: updated });
  },
  markAsRead: (id) => {
    const updated = get().notifications.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ notifications: updated });
  },
  markAllAsRead: () => {
    const updated = get().notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ notifications: updated });
  },
  clearAll: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    set({ notifications: [] });
  }
}));
