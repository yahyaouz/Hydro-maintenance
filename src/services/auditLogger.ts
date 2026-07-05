import { db, auth } from '@/lib/firebase';
import { collection, addDoc, getDocs, limit, query, orderBy, Timestamp } from 'firebase/firestore';
import { SiteID, UserRole } from '../types';

export interface AuditLogDocument {
  id: string;
  actionType: 'CREATE_BT' | 'CLOSE_BT' | 'ENGINE_STATUS_CHANGE' | 'PART_OUTPUT' | 'MAINTENANCE_VALIDATION' | 'USER_CHANGE' | 'APPROVAL' | 'SOFT_DELETE' | 'OFFLINE_SYNC' | 'CONFLICT_RESOLUTION' | 'STOCK_MODIFICATION' | 'CRITICAL_STATUS_CHANGE';
  userId: string;
  userName: string;
  userRole: UserRole;
  siteId: SiteID | 'TOUS';
  timestamp: string; // ISO String
  oldValue: string;
  newValue: string;
  enginId: string;
  workOrderId?: string;
  device: string;
  source: 'ONLINE' | 'OFFLINE';
  lineageId: string;
  priority: 'BASSE' | 'MOYENNE' | 'CRITIQUE';
}

const LOCAL_STORAGE_KEY = 'sg_audit_logs';

export const auditLogger = {
  // Hardened, offline-first generation
  async log(action: Omit<AuditLogDocument, 'id' | 'timestamp' | 'userId' | 'userName' | 'userRole' | 'device' | 'source' | 'lineageId'> & {
    source?: 'ONLINE' | 'OFFLINE';
    lineageId?: string;
    userId?: string;
    userName?: string;
    userRole?: UserRole;
  }): Promise<AuditLogDocument> {
    const rawUser = localStorage.getItem('sg_current_user');
    let actUser = { uid: 'system', displayName: 'Automate SOU-GMAO', role: 'ADMIN' as UserRole };
    if (rawUser) {
      try {
        const u = JSON.parse(rawUser);
        if (u && u.uid) actUser = u;
      } catch { /* proceed */ }
    }

    const deviceName = navigator.userAgent ? (navigator.userAgent.includes('Android') ? 'Tablette Mine Android' : 'Poste Supervision') : 'Appareil Inconnu';
    const isOnline = navigator.onLine;

    const newLog: AuditLogDocument = {
      id: `LOG-${Date.now()}-${Math.floor(100+Math.random()*900)}`,
      actionType: action.actionType,
      userId: action.userId || actUser.uid,
      userName: action.userName || actUser.displayName || 'Agent Mine',
      userRole: action.userRole || actUser.role as UserRole,
      siteId: action.siteId || 'SMI',
      timestamp: new Date().toISOString(),
      oldValue: action.oldValue || '∅',
      newValue: action.newValue || '∅',
      enginId: action.enginId || 'N/A',
      workOrderId: action.workOrderId,
      device: deviceName,
      source: action.source || (isOnline ? 'ONLINE' : 'OFFLINE'),
      lineageId: action.lineageId || `lin-${Math.random().toString(36).substring(2, 10)}`,
      priority: action.priority || 'BASSE',
    };

    // Save to local registry instantly
    const localLogs = this.getLocalLogs();
    localLogs.unshift(newLog);
    // Limit to last 500 logs locally to prevent DOM sluggishness
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localLogs.slice(0, 500)));

    // Push asynchronously to Firestore if online
    if (newLog.source === 'ONLINE') {
      try {
        await addDoc(collection(db, 'auditLogs'), {
          ...newLog,
          dbTimestamp: Timestamp.now()
        });
      } catch (err) {
        console.warn('Sync registration of auditLog deferred inside local replica registry.', err);
      }
    }

    return newLog;
  },

  getLocalLogs(): AuditLogDocument[] {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      const seeded: AuditLogDocument[] = [];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
};
