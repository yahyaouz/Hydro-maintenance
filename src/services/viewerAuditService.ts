import { db } from "@/lib/firebase";
import { collection, doc, setDoc, getDocs, Timestamp, query, orderBy, limit } from "firebase/firestore";

export interface ViewerAuditLog {
  id: string;
  sessionId: string;
  timestamp: string;
  activeTab: string;
  navigationHistory: string[];
  scrollDepth: number;
  timeOnPage: number; // in seconds
  clickCount: number;
  tactileCount: number;
  isOnline: boolean;
  device: string;
  browser: string;
  os: string;
  screenResolution: string;
  language: string;
  timezone: string;
  ipAddress: string;
  location: {
    country: string;
    city: string;
  };
  forbiddenAttempts: number;
  sessionDuration: number; // in seconds
  mouseActivityScore: number;
  tactileActivityScore: number;
  navigationFrequency: number; // transitions per minute
  behavioralAnomalies: string[];
  riskScore: "NORMAL" | "SURVEILLANCE" | "SUSPECT" | "CRITIQUE";
  synced?: boolean;
  writeError?: boolean;
}

const STORAGE_KEY = "sg_viewer_audit_logs";

// Safe local recovery
export const getLocalViewerLogs = (): ViewerAuditLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read local viewer logs:", e);
    return [];
  }
};

export const saveLocalViewerLogs = (logs: ViewerAuditLog[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error("Failed to save local viewer logs:", e);
  }
};

class ViewerAuditService {
  private currentLogsQueue: ViewerAuditLog[] = getLocalViewerLogs();
  private batchTimeout: any = null;

  public async logEvent(log: Omit<ViewerAuditLog, "id" | "timestamp">) {
    const freshLog: ViewerAuditLog = {
      ...log,
      id: "val-" + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };

    // 1. Keep locally (Harden to max 50 entries of latest states to avoid RAM/Cache bloat)
    this.currentLogsQueue.push(freshLog);
    if (this.currentLogsQueue.length > 50) {
      this.currentLogsQueue = this.currentLogsQueue.slice(-50);
    }
    saveLocalViewerLogs(this.currentLogsQueue);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sg_new_viewer_log", { detail: freshLog }));
    }

    // 2. Rugged debounce delay (Wait 8 seconds of silence to conserve bandwidth and CPU)
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(async () => {
      await this.syncLogsToFirestore();
    }, 8000);
  }

  public async syncLogsToFirestore() {
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    const unSynced = this.currentLogsQueue.filter((l: any) => !l.synced);
    if (unSynced.length === 0) return;

    try {
      for (const logToSync of unSynced) {
        try {
          const formattedTimestamp = Timestamp.fromDate(new Date(logToSync.timestamp));
          
          // Collection A: Consolidated Sessions (One document per unique Viewer Session, reducing small write costs)
          const sessionDocRef = doc(db, "viewerSessions", logToSync.sessionId);
          await setDoc(sessionDocRef, {
            sessionId: logToSync.sessionId,
            activeTab: logToSync.activeTab,
            navigationHistory: logToSync.navigationHistory,
            scrollDepth: logToSync.scrollDepth,
            clickCount: logToSync.clickCount,
            tactileCount: logToSync.tactileCount,
            device: logToSync.device,
            browser: logToSync.browser,
            os: logToSync.os,
            screenResolution: logToSync.screenResolution,
            language: logToSync.language,
            timezone: logToSync.timezone,
            ipAddress: logToSync.ipAddress,
            location: logToSync.location,
            forbiddenAttempts: logToSync.forbiddenAttempts,
            sessionDuration: logToSync.sessionDuration,
            navigationFrequency: logToSync.navigationFrequency,
            behavioralAnomalies: logToSync.behavioralAnomalies,
            riskScore: logToSync.riskScore,
            timestamp: formattedTimestamp,
            lastUpdated: Timestamp.now()
          });

          // Collection B: Security Events (Only written if suspect/critical activity or forbidden actions are intercepted)
          const hasSecurityRisk = logToSync.riskScore === "SUSPECT" || logToSync.riskScore === "CRITIQUE" || logToSync.forbiddenAttempts > 0;
          if (hasSecurityRisk) {
            const securityDocRef = doc(db, "viewerSecurityEvents", logToSync.id);
            await setDoc(securityDocRef, {
              eventId: logToSync.id,
              sessionId: logToSync.sessionId,
              timestamp: formattedTimestamp,
              activeTab: logToSync.activeTab,
              forbiddenAttempts: logToSync.forbiddenAttempts,
              behavioralAnomalies: logToSync.behavioralAnomalies,
              riskScore: logToSync.riskScore,
              device: logToSync.device,
              os: logToSync.os
            });
          }

          // Collection C: Daily Consolidated Telemetry (Daily aggregate metrics to avoid spam queries)
          const dateStr = logToSync.timestamp.split("T")[0];
          const dailyDocRef = doc(db, "viewerAnalyticsDaily", `day-${dateStr}`);
          await setDoc(dailyDocRef, {
            dayId: `day-${dateStr}`,
            date: dateStr,
            lastUpdated: Timestamp.now()
          }, { merge: true });

          logToSync.synced = true;
        } catch (perItemError) {
          console.warn("Write deferred or rejected by rules:", perItemError);
          logToSync.synced = true;
          logToSync.writeError = true;
        }
      }
      saveLocalViewerLogs(this.currentLogsQueue);
    } catch (batchError) {
      console.warn("Batch syncer deferred:", batchError);
    }
  }

  public async fetchHistoricalLogs(): Promise<ViewerAuditLog[]> {
    try {
      // Query compiled session summaries directly
      const q = query(collection(db, "viewerSessions"), orderBy("lastUpdated", "desc"), limit(50));
      const snapshot = await getDocs(q);
      const fsLogs: ViewerAuditLog[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        fsLogs.push({
          ...data,
          id: doc.id,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : data.timestamp,
        } as ViewerAuditLog);
      });

      if (fsLogs.length > 0) return fsLogs;
    } catch (err) {
      console.warn("Firestore sessions fetch deferred. Querying local cache fallback.");
    }

    return this.getLocalLogs().sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  public getLocalLogs(): ViewerAuditLog[] {
    return getLocalViewerLogs();
  }

  public clearLogs() {
    this.currentLogsQueue = [];
    saveLocalViewerLogs([]);
  }
}

export const viewerAuditService = new ViewerAuditService();

