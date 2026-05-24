import { create } from 'zustand';

export interface IndustrialNotification {
  id: string;
  type: 'CRITIQUE' | 'MAJEUR' | 'AVERTISSEMENT' | 'INFORMATION';
  title: string;
  message: string;
  timestamp: string; // ISO String
  read: boolean;
  triggerSource: string; // e.g. 'GMAO', 'STOCK', 'OFFLINE', 'COGNITIVE'
  siteId?: string;
  lineageId?: string;
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
    if (raw) return JSON.parse(raw);
  } catch { /* suppress */ }

  // Generate dynamic, realistic industrial-grade alert backlog for rich out-of-the-box appearance
  const now = new Date();
  const seed: IndustrialNotification[] = [
    {
      id: 'notif-1',
      type: 'CRITIQUE',
      title: 'BT CRITIQUE OUVERT • ST14-04',
      message: 'Alerte de surchauffe moteur détectée lors de l\'ascension en galerie profonde. BT-4542 ouvert en urgence.',
      timestamp: new Date(now.getTime() - 10 * 60000).toISOString(),
      read: false,
      triggerSource: 'GMAO',
      siteId: 'SMI'
    },
    {
      id: 'notif-2',
      type: 'MAJEUR',
      title: 'ECHEANCE DE VIDANGE DÉPASSÉE • DUM-03',
      message: 'Compteur moteur à 12,450h (intervalle 250h dépassé de +48h). Risque d\'usure mécanique accru.',
      timestamp: new Date(now.getTime() - 45 * 60000).toISOString(),
      read: false,
      triggerSource: 'MAINTENANCE_ENGINE',
      siteId: 'OUMEJRANE'
    },
    {
      id: 'notif-3',
      type: 'AVERTISSEMENT',
      title: 'STOCK CRITIQUE • FILTRE HUILE CAT',
      message: 'Quantité disponible au magasin centrale descendue sous le seuil d\'alerte de sécurité (Disponible: 2 | Seuil: 5).',
      timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(),
      read: false,
      triggerSource: 'STOCK',
      siteId: 'TOUS'
    },
    {
      id: 'notif-4',
      type: 'MAJEUR',
      title: 'DÉTECTION DE RÉCIDIVE DE PANNE',
      message: 'L\'engin chargeur LHD ST7-01 a subi 3 pannes électriques successives sur l\'alternateur en moins de 10 jours.',
      timestamp: new Date(now.getTime() - 4 * 3600000).toISOString(),
      read: true,
      triggerSource: 'COGNITIVE_AI',
      siteId: 'KOUDIAT AICHA'
    },
    {
      id: 'notif-5',
      type: 'AVERTISSEMENT',
      title: 'SURCHARGE ATELIER DE MAINTENANCE',
      message: 'Le taux d\'occupation de l\'ateliers de SMI a franchi 75% avec 6 BT correctifs ouverts simultanément.',
      timestamp: new Date(now.getTime() - 6 * 3600000).toISOString(),
      read: true,
      triggerSource: 'ATELIER',
      siteId: 'SMI'
    },
    {
      id: 'notif-6',
      type: 'INFORMATION',
      title: 'SYNCHRONISATION OFFLINE VALIDÉE',
      message: 'Replay effectué avec succès de 4 fiches d\'ateliers en attente sans aucun diagnostic de conflit.',
      timestamp: new Date(now.getTime() - 12 * 3600000).toISOString(),
      read: true,
      triggerSource: 'OFFLINE_REPLAY',
      siteId: 'BOU-AZZER'
    }
  ];
  return seed;
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
