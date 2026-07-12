import { create } from 'zustand';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, arrayUnion } from 'firebase/firestore';

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
  lueParUid?: string[];
}

interface NotificationState {
  notifications: IndustrialNotification[];
  setNotifications: (notifications: IndustrialNotification[]) => void;
  addNotification: (notification: Omit<IndustrialNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  setNotifications: (notifications) => {
    set({ notifications });
  },
  addNotification: async (item) => {
    try {
      await addDoc(collection(db, "notifications"), {
        type: item.type,
        title: item.title,
        message: item.message,
        triggerSource: item.triggerSource,
        siteId: item.siteId || null,
        enginId: item.enginId || null,
        lineageId: item.lineageId || null,
        createdAt: serverTimestamp(),
        lue: false,
        lueParUid: []
      });
    } catch (err) {
      console.error("Failed to add notification to Firestore:", err);
    }
  },
  markAsRead: async (id) => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;
    try {
      const docRef = doc(db, "notifications", id);
      await updateDoc(docRef, {
        lueParUid: arrayUnion(currentUserId)
      });
    } catch (err) {
      console.error("Failed to mark notification as read in Firestore:", err);
    }
  },
  markAllAsRead: async () => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;
    
    const unread = get().notifications.filter(n => {
      const alreadyRead = n.lueParUid?.includes(currentUserId) || n.read;
      return !alreadyRead;
    });

    for (const notif of unread) {
      try {
        const docRef = doc(db, "notifications", notif.id);
        await updateDoc(docRef, {
          lueParUid: arrayUnion(currentUserId)
        });
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }
  },
  clearAll: async () => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) {
      set({ notifications: [] });
      return;
    }
    const allNotifs = get().notifications;
    for (const notif of allNotifs) {
      try {
        const docRef = doc(db, "notifications", notif.id);
        await updateDoc(docRef, {
          lueParUid: arrayUnion(currentUserId)
        });
      } catch (err) {
        console.error("Failed to mark notification as read during clear:", err);
      }
    }
    set({ notifications: [] });
  }
}));
