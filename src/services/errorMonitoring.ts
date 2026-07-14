import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export interface AppError {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'CRITICAL' | 'FATAL';
  message: string;
  stack?: string;
  source: string;
  userId?: string;
  siteId?: string;
  deviceInfo: string;
  metadata?: any;
}

const STORAGE_KEY = 'sg_error_logs';

export class ErrorMonitoringService {
  private static logs: AppError[] = [];

  static initialize() {
    if (typeof window === 'undefined') return;

    // Load existing logs from local storage
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        this.logs = JSON.parse(raw);
      } catch {
        this.logs = [];
      }
    }

    // Intercept uncaught javascript exceptions
    window.addEventListener('error', (event) => {
      this.captureError({
        level: 'FATAL',
        message: event.message || 'Error Inconnu',
        stack: event.error?.stack || 'Pas de trace',
        source: 'WINDOW_ON_ERROR',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    // Intercept unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        level: 'CRITICAL',
        message: `Unhandled promise rejection: ${event.reason?.message || event.reason}`,
        stack: event.reason?.stack || 'Pas de trace',
        source: 'WINDOW_ON_REJECTION',
        metadata: {
          reason: String(event.reason)
        }
      });
    });

    console.log('✅ Système d\'Alerteurs HYDROMINES - Espace Maintenance Error Monitoring armé et actif.');
  }

  static captureError(params: {
    level: AppError['level'];
    message: string;
    stack?: string;
    source: string;
    metadata?: any;
  }) {
    // Collect active user credentials
    const rawUser = localStorage.getItem('sg_current_user');
    let userId = 'system';
    let siteId = 'TOUS';
    if (rawUser) {
      try {
        const u = JSON.parse(rawUser);
        if (u) {
          userId = u.uid || u.email || userId;
          siteId = u.siteId || siteId;
        }
      } catch { /* suppress */ }
    }

    const deviceName = navigator.userAgent ? (navigator.userAgent.includes('Android') ? 'Tablette Mine Android' : 'Poste Supervision') : 'Appareil Inconnu';

    const newError: AppError = {
      id: `ERR-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      level: params.level,
      message: params.message,
      stack: params.stack,
      source: params.source,
      userId,
      siteId,
      deviceInfo: `${deviceName} (${navigator.platform || 'Inconnu'})`,
      metadata: params.metadata || {}
    };

    // Store in local file buffer
    this.logs.unshift(newError);
    if (this.logs.length > 150) {
      this.logs = this.logs.slice(0, 150); // Hard limit memory consumption
    }

    // Save to storage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs));
    } catch { /* suppress limit overflows */ }

    // Silently notify background administrators or push to Firestore if critical
    if (navigator.onLine && (params.level === 'CRITICAL' || params.level === 'FATAL')) {
      addDoc(collection(db, 'systemLogs'), {
        ...newError,
        createdAt: Timestamp.now(),
        dbTimestamp: Timestamp.now()
      }).catch((err) => {
        console.warn('Silent fallback: failure logging telemetry error to cloud Firestore', err);
      });
    }

    // Print standard console tracking for debuggers
    console.error(`[${params.level}] HYDROMINES - Espace Maintenance Core Interceptor (${params.source}): ${params.message}`);
  }

  static getLogs(): AppError[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }
    return this.logs;
  }

  static clearLogs() {
    this.logs = [];
    localStorage.removeItem(STORAGE_KEY);
    this.captureError({
      level: 'INFO',
      message: 'Registre de diagnostics techniques réinitialisé manuellement par l\'opérateur.',
      source: 'DIAGNOSTICS_CLEANER'
    });
  }
}
