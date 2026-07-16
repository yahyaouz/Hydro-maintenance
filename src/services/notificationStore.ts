import { create } from 'zustand';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, writeBatch } from 'firebase/firestore';

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
      addDoc(collection(db, "systemLogs"), {
        level: "ERROR",
        message: `Échec d'envoi de notification : ${item.title}`,
        source: "NotificationStore",
        createdAt: serverTimestamp(),
        dbTimestamp: serverTimestamp(),
        timestamp: Date.now(),
        siteId: item.siteId || null,
        stack: err instanceof Error ? err.stack : String(err)
      }).catch((logErr) => {
        console.warn("Failed to log notification error to systemLogs:", logErr);
      });
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

    if (unread.length === 0) return;

    try {
      const batch = writeBatch(db);
      for (const notif of unread) {
        const docRef = doc(db, "notifications", notif.id);
        batch.update(docRef, {
          lueParUid: arrayUnion(currentUserId)
        });
      }
      await batch.commit();
    } catch (err) {
      console.error("Failed to batch mark notifications as read:", err);
    }
  },
  clearAll: async () => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) {
      set({ notifications: [] });
      return;
    }
    const allNotifs = get().notifications;
    if (allNotifs.length === 0) return;

    try {
      const batch = writeBatch(db);
      for (const notif of allNotifs) {
        const docRef = doc(db, "notifications", notif.id);
        batch.update(docRef, {
          lueParUid: arrayUnion(currentUserId)
        });
      }
      await batch.commit();
    } catch (err) {
      console.error("Failed to batch clear notifications:", err);
    }
    set({ notifications: [] });
  }
}));
