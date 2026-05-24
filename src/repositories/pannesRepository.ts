import { SiteID, PRIORITY_LEVELS } from '../types';

export interface PanneDocument {
  panneId: string;       // Standardized ID
  id: string;             // Backward compatibility
  machineCode: string;    // Engine ID associated
  enginId: string;        // Standardized associated engine reference
  reportedBy: string;     // Author of report
  reportedDate: string;   // ISO date string
  severity: PRIORITY_LEVELS; // "critique" | "majeur" | "mineur"
  category: 'HYDRAULIQUE' | 'MOTEUR' | 'PNEUMATIQUE' | 'ELECTRIQUE' | 'TRANSMISSION' | 'AUTRE' | string;
  reason: string;         // Diagnostic reason
  status: 'OUVERT' | 'REGLER' | 'RESOLU';
  resolvedDate?: string;
  isAwaitingParts: boolean;
  isAwaitingMechanic: boolean;
  isAwaitingProduction: boolean;
  idempotencyKey?: string;
}

export const pannesRepository = {
  loadAll(): PanneDocument[] {
    const raw = localStorage.getItem('sg_pannes_data');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      
      return parsed.map((item: any) => {
        const id = item.panneId || item.id || `PAN-${Math.floor(1000 + Math.random() * 9000)}`;
        return {
          panneId: id,
          id: id,
          machineCode: item.machineCode || item.enginId || '',
          enginId: item.enginId || item.machineCode || '',
          reportedBy: item.reportedBy || '',
          reportedDate: item.reportedDate || '',
          severity: item.severity || PRIORITY_LEVELS.MINEUR,
          category: item.category || 'HYDRAULIQUE',
          reason: item.reason || '',
          status: item.status || 'OUVERT',
          resolvedDate: item.resolvedDate,
          isAwaitingParts: !!item.isAwaitingParts,
          isAwaitingMechanic: !!item.isAwaitingMechanic,
          isAwaitingProduction: !!item.isAwaitingProduction,
          idempotencyKey: item.idempotencyKey
        };
      });
    } catch {
      return [];
    }
  },

  saveAll(list: PanneDocument[]): void {
    localStorage.setItem('sg_pannes_data', JSON.stringify(list));
  },

  getAll(siteId: SiteID = 'TOUS'): PanneDocument[] {
    // If we want filtering, we can check machine reference or site reference.
    const all = this.loadAll();
    return all;
  }
};
