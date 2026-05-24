import { MiniMachine, WorkOrderBT, UserProfile, HandoverReport } from '../components/IndustrialDeployment';
import { UnifiedAuditLog } from './maintenanceRules';
import { SiteID } from '../types';

// Custom error recovery for local storage cache validation & corruption checking
const safeJSONParse = <T>(key: string, defaultValue: T): T => {
  const value = localStorage.getItem(key);
  if (!value) return defaultValue;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`⚠️ Corruption de cache détectée pour la clé "${key}". Réinitialisation aux valeurs d'usine...`, error);
    // Remove corrupt item to prevent further crashes
    localStorage.removeItem(key);
    return defaultValue;
  }
};

// ----------------------------------------------------
// 1. MACHINE REPOSITORY
// ----------------------------------------------------
export const machineRepository = {
  getAll: (siteFilter: SiteID = "TOUS"): MiniMachine[] => {
    const all = safeJSONParse<MiniMachine[]>("sg_mini_machines", []);
    if (siteFilter === "TOUS") return all;
    return all.filter(m => m.siteId === siteFilter);
  },

  saveAll: (machines: MiniMachine[]): void => {
    try {
      localStorage.setItem("sg_mini_machines", JSON.stringify(machines));
    } catch (e) {
      console.error("Failed to save machines to local cache", e);
    }
  },

  getByCode: (code: string): MiniMachine | undefined => {
    const all = machineRepository.getAll();
    return all.find(m => m.code === code);
  },

  updateMachine: (code: string, updater: (m: MiniMachine) => MiniMachine): void => {
    const all = machineRepository.getAll();
    const updated = all.map(m => m.code === code ? updater(m) : m);
    machineRepository.saveAll(updated);
  },

  resetToDefault: (defaultData: MiniMachine[]): void => {
    machineRepository.saveAll(defaultData);
  }
};

// ----------------------------------------------------
// 2. WORK ORDER (BT) REPOSITORY
// ----------------------------------------------------
export const workOrderRepository = {
  getAll: (siteFilter: SiteID = "TOUS"): WorkOrderBT[] => {
    const all = safeJSONParse<WorkOrderBT[]>("sg_work_orders", []);
    if (siteFilter === "TOUS") return all;
    return all.filter(wo => wo.siteId === siteFilter);
  },

  saveAll: (workOrders: WorkOrderBT[]): void => {
    try {
      localStorage.setItem("sg_work_orders", JSON.stringify(workOrders));
    } catch (e) {
      console.error("Failed to save work orders to local cache", e);
    }
  },

  getById: (id: string): WorkOrderBT | undefined => {
    const all = workOrderRepository.getAll();
    return all.find(wo => wo.id === id);
  },

  updateWorkOrder: (id: string, updater: (wo: WorkOrderBT) => WorkOrderBT): void => {
    const all = workOrderRepository.getAll();
    const updated = all.map(wo => wo.id === id ? updater(wo) : wo);
    workOrderRepository.saveAll(updated);
  }
};

// ----------------------------------------------------
// 3. AUDIT REPOSITORY
// ----------------------------------------------------
export const auditRepository = {
  getAll: (siteFilter: SiteID = "TOUS"): UnifiedAuditLog[] => {
    const all = safeJSONParse<UnifiedAuditLog[]>("sg_audit_logs", []);
    if (siteFilter === "TOUS") return all;
    return all.filter(log => log.siteId === siteFilter);
  },

  saveAll: (logs: UnifiedAuditLog[]): void => {
    try {
      localStorage.setItem("sg_audit_logs", JSON.stringify(logs));
    } catch (e) {
      console.error("Failed to save audit logs to local cache", e);
    }
  },

  addLog: (log: UnifiedAuditLog): void => {
    const all = auditRepository.getAll();
    auditRepository.saveAll([log, ...all]);
  }
};

// ----------------------------------------------------
// 4. USER SESSION REPOSITORY
// ----------------------------------------------------
export const userRepository = {
  getCurrentUser: (): UserProfile | null => {
    return safeJSONParse<UserProfile | null>("sg_current_user", null);
  },

  setCurrentUser: (user: UserProfile): void => {
    try {
      localStorage.setItem("sg_current_user", JSON.stringify(user));
    } catch (e) {
      console.error("Failed to persist user session", e);
    }
  },

  clearSession: (): void => {
    localStorage.removeItem("sg_current_user");
    localStorage.removeItem("sg_selected_site_filter");
  }
};

// ----------------------------------------------------
// 5. HANDOVER REPORT REPOSITORY
// ----------------------------------------------------
export const handoverRepository = {
  getAll: (siteFilter: SiteID = "TOUS"): HandoverReport[] => {
    const all = safeJSONParse<HandoverReport[]>("sg_handover_reports", []);
    if (siteFilter === "TOUS") return all;
    return all.filter(h => h.siteId === siteFilter);
  },

  saveAll: (reports: HandoverReport[]): void => {
    try {
      localStorage.setItem("sg_handover_reports", JSON.stringify(reports));
    } catch (e) {
      console.error("Failed to save handover reports", e);
    }
  }
};
