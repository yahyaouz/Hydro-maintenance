import { SiteID } from '../types';

export interface OfflineTransaction {
  id: string; // Uniformized transaction ID
  idempotencyKey: string;
  actionType: 'DECLARE_STOP' | 'REMETTRE_EN_SERVICE' | 'CREATE_BT' | 'UPDATE_BT' | 'STOCK_MOVEMENT' | 'PILOT_FEEDBACK' | string;
  payload: any;
  label: string;
  timestamp: string; // ISO string for chronological replay
  siteId: SiteID;
  userId?: string;
  retryCount: number;
  errorStatus?: string;
  rollbackPayload?: any; // For safe rollback recovery
  status: 'PENDING' | 'FAILED' | 'REPLAYED';
  sequenceNumber?: number; // Monotonic sequence index
  lineageId?: string; // Transaction Lineage Tracking
}

export interface SyncConflict {
  id: string;
  transactionId: string;
  entityName: 'engins' | 'workorders' | 'pannes' | string;
  entityId: string;
  serverState: any;
  localState: any;
  resolved: boolean;
  resolutionStrategy?: 'CLIENT' | 'SERVER' | 'MANUAL';
  timestamp: string;
}

export interface OfflineDiagnostics {
  totalItemsEnqueued: number;
  totalItemsReplayed: number;
  replayFailureCount: number;
  conflictArbitratedCount: number;
  actionsRejectedCount: number;
  lastSyncTimestamp: string | null;
  history: Array<{
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR';
    message: string;
  }>;
}

// --------------------------------------------------------------------------------
// OFFLINE QUEUE MANAGER (Objective 3)
// --------------------------------------------------------------------------------
export class OfflineQueueManager {
  private static STORAGE_KEY = 'sg_offline_queue_all';
  private static BACKUP_KEY = 'sg_offline_queue_all_backup';
  private static REPLAYED_REGISTRY_KEY = 'sg_offline_replayed_ids';
  private static DIAGNOSTICS_KEY = 'sg_offline_diagnostics';
  private static SEQ_KEY = 'sg_offline_last_seq';

  /**
   * Safe parser with automated fallback and redundancy recovery, including Auto-Repair
   */
  static getQueue(): OfflineTransaction[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    let rawQueue: any = null;

    if (!raw) {
      // Try restoring from redundant auto-backup if primary registry was cleared or corrupted
      const backup = localStorage.getItem(this.BACKUP_KEY);
      if (backup) {
        console.warn("⚠️ Primary offline storage missing, recovering from backup mirror registry.");
        try {
          rawQueue = JSON.parse(backup);
        } catch { /* suppress backup read failure */ }
      }
    } else {
      try {
        rawQueue = JSON.parse(raw);
      } catch (error) {
        console.error("⚠️ Local storage corrupt. Loading redundant backup partition...", error);
        this.logDiagnostic('ERROR', 'Primary queue corrupted, attempting recovery.');
        
        const backup = localStorage.getItem(this.BACKUP_KEY);
        if (backup) {
          try {
            rawQueue = JSON.parse(backup);
          } catch { /* backup corrupted too */ }
        }
      }
    }

    if (!Array.isArray(rawQueue)) {
      localStorage.removeItem(this.STORAGE_KEY);
      return [];
    }

    // QUEUE CORRUPTION AUTO-REPAIR (Phase 2): filter and auto-reconcile incomplete records
    const repairedQueue: OfflineTransaction[] = [];
    let repairedCounter = 0;

    for (const item of rawQueue) {
      if (item && typeof item === 'object' && item.actionType) {
        const repairedItem: OfflineTransaction = {
          id: item.id || `TX-REPAIRED-${Date.now()}-${repairedCounter++}`,
          idempotencyKey: item.idempotencyKey || `idemp-${Math.random().toString(36).substring(2, 9)}`,
          actionType: item.actionType,
          payload: item.payload || {},
          label: item.label || 'Action d\'atelier souterraine',
          timestamp: item.timestamp || new Date().toISOString(),
          siteId: item.siteId || 'SMI',
          userId: item.userId,
          retryCount: typeof item.retryCount === 'number' ? item.retryCount : 0,
          errorStatus: item.errorStatus,
          rollbackPayload: item.rollbackPayload,
          status: item.status || 'PENDING',
          sequenceNumber: typeof item.sequenceNumber === 'number' ? item.sequenceNumber : 1,
          lineageId: item.lineageId || item.id
        };
        repairedQueue.push(repairedItem);
      } else {
        repairedCounter++;
      }
    }

    if (repairedCounter > 0) {
      console.warn(`[Auto-Repair] Core detected and purged/rebuilt ${repairedCounter} corrupted offline logs.`);
      this.logDiagnostic('WARN', `Auto-Repair module reconstructed ${repairedCounter} corrupted logs.`);
      this.saveQueue(repairedQueue);
    }

    return repairedQueue;
  }

  static saveQueue(queue: OfflineTransaction[]): void {
    try {
      const rawString = JSON.stringify(queue);
      localStorage.setItem(this.STORAGE_KEY, rawString);
      // Mirrored cold data backup for recovery on physical tablet crash or hard reset
      localStorage.setItem(this.BACKUP_KEY, rawString);
    } catch (e) {
      console.error("Failed to commit offline queue to LocalStorage. Disk full / quota overflow?", e);
      this.logDiagnostic('ERROR', `Quota overflow or storage failure when saving queue.`);
    }
  }

  /**
   * Monotonically registers and increments globally to maintain execution order regardless of device clock jumps
   */
  private static getNextSequence(): number {
    const rawSec = localStorage.getItem(this.SEQ_KEY);
    const newSeq = (rawSec ? parseInt(rawSec, 10) : 0) + 1;
    localStorage.setItem(this.SEQ_KEY, newSeq.toString());
    return newSeq;
  }

  /**
   * Registry to block multiple synchronous replays of identical item codes
   */
  static getReplayedRegistry(): string[] {
    const raw = localStorage.getItem(this.REPLAYED_REGISTRY_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static markReplayIDRegistered(id: string): void {
    try {
      const ids = this.getReplayedRegistry();
      if (!ids.includes(id)) {
        ids.push(id);
        // limit size of history registry to 500 items for memory safety
        if (ids.length > 500) ids.shift();
        localStorage.setItem(this.REPLAYED_REGISTRY_KEY, JSON.stringify(ids));
      }
    } catch { /* safety */ }
  }

  /**
   * REPLAY PRIORITIZATION (Phase 2): Evaluates transaction importance scoring
   * Critical status changes occur FIRST (e.g. EN_PANNE locks, CRITIQUE priorities)
   */
  static getTransactionPriority(tx: OfflineTransaction): number {
    const act = tx.actionType;
    const payload = tx.payload || {};
    const status = (payload.status || payload.statut || '').toString().toUpperCase();
    const severity = (payload.severity || payload.gravite || '').toString().toUpperCase();

    if (act === 'DECLARE_STOP' || status === 'EN_PANNE' || severity === 'CRITIQUE') {
      return 100; // Urgent Lock Priority
    }
    if (status === 'EN_MAINTENANCE' || severity === 'ÉLEVÉE' || severity === 'MAJEUR') {
      return 85; // High priority active interventions
    }
    if (act === 'STOCK_MOVEMENT') {
      return 60; // Consumable safety tracking
    }
    return 30; // Standard logs
  }

  /**
   * Enqueue a transaction with timestamp, strict chronological indexing and lineage tracking
   */
  static enqueue(transaction: Omit<OfflineTransaction, 'id' | 'status' | 'retryCount' | 'timestamp' | 'lineageId'>): OfflineTransaction {
    const queue = this.getQueue();
    
    // Hash transaction validation & anti-replay checks
    const existing = queue.find(t => t.idempotencyKey === transaction.idempotencyKey);
    if (existing) {
      console.warn(`[Anti-Replay] Transaction already exists in queue: ${transaction.idempotencyKey}`);
      return existing;
    }

    // Capture safety parameters
    const nextSeq = this.getNextSequence();
    
    // Safety check clock drift (Verify system clock isn't set to 1970 or has leaped backwards)
    let safeISOString = new Date().toISOString();
    if (queue.length > 0) {
      const prevTx = queue[queue.length - 1];
      if (new Date(safeISOString).getTime() < new Date(prevTx.timestamp).getTime()) {
        // Drifting clock detected: Force sequential timestamp ordering by adding 1 second to previous entry
        const adjustedTime = new Date(new Date(prevTx.timestamp).getTime() + 1000);
        safeISOString = adjustedTime.toISOString();
        console.warn(`⚠️ Clock drift detected! Device clock is older than previous queue entries. Normalized to ${safeISOString}`);
        this.logDiagnostic('WARN', 'Clock drift detected. Sequential timestamp was auto-compensated.');
      }
    }

    const txId = `TX-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const newTx: OfflineTransaction = {
      ...transaction,
      id: txId,
      timestamp: safeISOString,
      retryCount: 0,
      status: 'PENDING',
      sequenceNumber: nextSeq,
      lineageId: txId // Track original lineage index
    };

    queue.push(newTx);
    
    // Sort queue with prioritization: high priority values first, then chronological order
    queue.sort((a, b) => {
      const prioA = this.getTransactionPriority(a);
      const prioB = this.getTransactionPriority(b);
      if (prioA !== prioB) {
        return prioB - prioA; // Higher priority executes first
      }
      if (a.sequenceNumber && b.sequenceNumber) {
        return a.sequenceNumber - b.sequenceNumber;
      }
      return a.timestamp.localeCompare(b.timestamp);
    });

    this.saveQueue(queue);
    this.updateConfigDiagnostics(d => {
      d.totalItemsEnqueued += 1;
    });

    this.logDiagnostic('INFO', `Enqueued new active payload: ${transaction.label} (Prio: ${this.getTransactionPriority(newTx)})`);
    return newTx;
  }

  /**
   * Filter and retrieve pending actions chronological with priority ranking
   */
  static getPending(siteId: SiteID = 'TOUS'): OfflineTransaction[] {
    const q = this.getQueue().filter(t => t.status === 'PENDING');
    const filtered = siteId === 'TOUS' ? q : q.filter(t => t.siteId === siteId);
    return filtered.sort((a, b) => {
      if (a.sequenceNumber !== undefined && b.sequenceNumber !== undefined) {
        return a.sequenceNumber - b.sequenceNumber;
      }
      return a.timestamp.localeCompare(b.timestamp);
    });
  }

  /**
   * Mark a transaction as completed or failed with error status
   */
  static updateStatus(transactionId: string, status: 'PENDING' | 'FAILED' | 'REPLAYED', errorStatus?: string): void {
    const queue = this.getQueue();
    let replayedIncrement = 0;
    let failureIncrement = 0;

    const updated = queue.map(t => {
      if (t.id === transactionId) {
        if (status === 'REPLAYED' && t.status !== 'REPLAYED') {
          replayedIncrement = 1;
          this.markReplayIDRegistered(t.id);
        }
        if (status === 'FAILED') {
          failureIncrement = 1;
        }

        return {
          ...t,
          status,
          errorStatus,
          retryCount: status === 'FAILED' ? t.retryCount + 1 : t.retryCount
        };
      }
      return t;
    });

    this.saveQueue(updated);
    
    this.updateConfigDiagnostics(d => {
      d.totalItemsReplayed += replayedIncrement;
      d.replayFailureCount += failureIncrement;
      d.lastSyncTimestamp = new Date().toISOString();
    });

    if (replayedIncrement > 0) {
      this.logDiagnostic('INFO', `Successfully replayed TX ${transactionId}`);
    } else if (failureIncrement > 0) {
      this.logDiagnostic('ERROR', `Transaction ${transactionId} failed with: ${errorStatus}`);
    }
  }

  /**
   * Remove a transaction from the queue (Manual operator arbitration)
   */
  static remove(transactionId: string): void {
    const queue = this.getQueue();
    this.saveQueue(queue.filter(t => t.id !== transactionId));
    this.logDiagnostic('INFO', `Removed TX ${transactionId} by manual operator command.`);
  }

  /**
   * Clear all replayed transcations to keep Cache clean and slim
   */
  static clearReplayed(): void {
    const queue = this.getQueue();
    this.saveQueue(queue.filter(t => t.status !== 'REPLAYED'));
  }

  // ----------------------------------------------------
  // CONFLICT ARBITRATION & WORKFLOW PRIORITIES (Phase 2 Upgrade)
  // ----------------------------------------------------
  /**
   * Analyzes state updates to protect against regression or losing 'CLOS' milestones
   * High priority critical states ("EN PANNE", "EN MAINTENANCE", "CRITIQUE") always override
   * Stale Writes are explicitly rejected if older than 48 hours.
   */
  static arbitrateConflict(
    localState: any, 
    remoteState: any, 
    entityType: 'engin' | 'workorder' | string
  ): { resolvedPayload: any; message: string; strategy: 'LOCAL_OPERATOR' | 'SYSTEM_RECONCILIATION' | 'REJECTED_STALE_WRITE' } {
    
    this.updateConfigDiagnostics(d => {
      d.conflictArbitratedCount += 1;
    });

    // Helper to safely parse Date from string, timestamp object or timestamp numbers
    const parseToMs = (field: any): number => {
      if (!field) return 0;
      if (typeof field === 'object') {
        if (typeof field.toDate === 'function') {
          return field.toDate().getTime();
        }
        if (field.seconds !== undefined) {
          return field.seconds * 1000;
        }
      }
      const t = new Date(field).getTime();
      return isNaN(t) ? 0 : t;
    };

    // 1. STALE WRITE REJECTION (Phase 2): Stale local writes older than 48h are automatically rejected
    const localTimeStr = localState?.updatedAt || localState?.date || '';
    const remoteTimeStr = remoteState?.updatedAt || remoteState?.date || '';
    const now = Date.now();
    const fortyEightHoursMs = 48 * 60 * 60 * 1000;

    if (localTimeStr) {
      const localAge = now - parseToMs(localTimeStr);
      if (localAge > fortyEightHoursMs) {
        this.updateConfigDiagnostics(d => { d.actionsRejectedCount += 1; });
        return {
          resolvedPayload: remoteState,
          message: 'Arbitrage : Écriture locale rejetée car périmée (>48h par rapport au serveur).',
          strategy: 'REJECTED_STALE_WRITE'
        };
      }
    }

    // Assigning conflict arbitration severity scoring for critical overrides
    const getStatusScore = (status: string) => {
      const s = String(status).toUpperCase();
      if (s === 'EN_PANNE' || s === 'CRITIQUE') return 100;
      if (s === 'EN_MAINTENANCE') return 90;
      if (s === 'CLOS' || s === 'RÉSOLU') return 80;
      return 10;
    };

    if (entityType === 'workorder') {
      const localStatus = localState?.status || '';
      const remoteStatus = remoteState?.status || '';
      const localSev = localState?.severity || '';
      const remoteSev = remoteState?.severity || '';

      // High priority values override
      const localScore = Math.max(getStatusScore(localStatus), getStatusScore(localSev));
      const remoteScore = Math.max(getStatusScore(remoteStatus), getStatusScore(remoteSev));

      if (remoteScore > localScore) {
        return {
          resolvedPayload: { ...localState, ...remoteState },
          message: `Arbitrage : La version distante prédomine suite à un score de criticité plus élevé (${remoteScore} > ${localScore}).`,
          strategy: 'SYSTEM_RECONCILIATION'
        };
      } else if (localScore > remoteScore) {
        return {
          resolvedPayload: { ...remoteState, ...localState },
          message: `Arbitrage : Écriture locale prioritaire suite à un score de criticité plus élevé (${localScore} > ${remoteScore}).`,
          strategy: 'LOCAL_OPERATOR'
        };
      }

      // Preserve permanent CLOS status
      if (remoteStatus === 'CLOS' && localStatus !== 'CLOS') {
        return {
          resolvedPayload: { ...localState, status: 'CLOS' },
          message: 'Arbitrage : Préservation réglementaire du statut CLOS distant.',
          strategy: 'SYSTEM_RECONCILIATION'
        };
      }
      if (localStatus === 'CLOS' && remoteStatus !== 'CLOS') {
        return {
          resolvedPayload: { ...localState, status: 'CLOS' },
          message: 'Arbitrage : Verrouillage local réglementaire CLOS appliqué par le visa du chef.',
          strategy: 'LOCAL_OPERATOR'
        };
      }
    }

    if (entityType === 'engin') {
      const localStatus = localState?.status || '';
      const remoteStatus = remoteState?.status || '';

      const localScore = getStatusScore(localStatus);
      const remoteScore = getStatusScore(remoteStatus);

      if (remoteScore > localScore) {
        return {
          resolvedPayload: { ...localState, status: remoteStatus },
          message: `Consigne d'état prioritaire : Statut distant '${remoteStatus}' de criticité supérieure conservé.`,
          strategy: 'SYSTEM_RECONCILIATION'
        };
      } else if (localScore > remoteScore) {
        return {
          resolvedPayload: { ...localState, status: localStatus },
          message: `Verrouillage LOTO local prioritaire : Statut '${localStatus}' imposé par le mécanicien terrain.`,
          strategy: 'LOCAL_OPERATOR'
        };
      }
    }

    // Default to progressive chronology - Last Writer Wins via ISO clock verification
    const localTime = parseToMs(localTimeStr);
    const remoteTime = parseToMs(remoteTimeStr);
    
    if (localTime >= remoteTime) {
      return {
        resolvedPayload: localState,
        message: 'Mise à jour locale plus récente conservée.',
        strategy: 'LOCAL_OPERATOR'
      };
    } else {
      return {
        resolvedPayload: remoteState,
        message: 'Collision résolue : Données distantes prioritaires (plus récentes).',
        strategy: 'SYSTEM_RECONCILIATION'
      };
    }
  }

  // ----------------------------------------------------
  // DIAGNOSTICS STORAGE
  // ----------------------------------------------------
  static getDiagnostics(): OfflineDiagnostics {
    const raw = localStorage.getItem(this.DIAGNOSTICS_KEY);
    if (!raw) {
      const defaultDiag: OfflineDiagnostics = {
        totalItemsEnqueued: 0,
        totalItemsReplayed: 0,
        replayFailureCount: 0,
        conflictArbitratedCount: 0,
        actionsRejectedCount: 0,
        lastSyncTimestamp: null,
        history: []
      };
      this.saveDiagnostics(defaultDiag);
      return defaultDiag;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return {
        totalItemsEnqueued: 0,
        totalItemsReplayed: 0,
        replayFailureCount: 0,
        conflictArbitratedCount: 0,
        actionsRejectedCount: 0,
        lastSyncTimestamp: null,
        history: []
      };
    }
  }

  private static saveDiagnostics(d: OfflineDiagnostics): void {
    localStorage.setItem(this.DIAGNOSTICS_KEY, JSON.stringify(d));
  }

  private static updateConfigDiagnostics(fn: (diag: OfflineDiagnostics) => void): void {
    const d = this.getDiagnostics();
    fn(d);
    this.saveDiagnostics(d);
  }

  static logDiagnostic(level: 'INFO' | 'WARN' | 'ERROR', message: string): void {
    this.updateConfigDiagnostics(d => {
      d.history.push({
        timestamp: new Date().toISOString(),
        level,
        message
      });
      if (d.history.length > 100) d.history.shift(); // Max 100 entries memory footprint limit
    });
  }
}
