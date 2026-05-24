import { SiteID, ENGIN_STATUS } from '../types';

export interface EnginDocument {
  enginId: string;         // Standardized uniformized primary key (e.g. "ST7-01")
  id: string;              // For backward compatibility
  code: string;            // Standard ID/matricule reference
  matricule: string;       // Secondary label
  type: string;            // e.g. "ST2G", "JUMBO", "DUMPER"
  marque: string;          // e.g. "Sandvik", "Epiroc"
  modele: string;          // e.g. "T-800"
  siteId: SiteID;          // Site ID code
  site: string;            // Name matching the site
  status: ENGIN_STATUS;    // "DISPONIBLE" | "EN_PANNE" | "EN_MAINTENANCE" | "RESTREINT"
  statut: string;          // For backward compatibility (converted to lowercase)
  hours: number;           // Total accumulated service hours
  heures: number;          // Backward compatibility
  dispo: number;           // Calculated percentage availability
  latestFuelLevel: number; // 0-100% fuel tank level
  lastInspectionDate: string;
  activeDowntimeId?: string; // Links to active breakdown if in panne
  downtimes: Array<{
    id: string;
    date: string;
    reason: string;
    category: string;
    severity: 'critique' | 'majeur' | 'mineur';
    durationMinutes?: number;
    endHour?: string;
    remedyAction?: string;
  }>;
}

export const enginsRepository = {
  /**
   * Helper to deserialize local storage cache or database mocks
   */
  loadAll(): EnginDocument[] {
    const raw = localStorage.getItem('sg_mini_machines');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      
      // Map and normalise the layout
      return parsed.map((item: any) => {
        const enginId = item.enginId || item.code || item.matricule || item.id;
        return {
          enginId,
          id: enginId,
          code: item.code || enginId,
          matricule: item.matricule || item.code || enginId,
          type: item.type || '',
          marque: item.marque || '',
          modele: item.modele || '',
          siteId: item.siteId || item.site || 'SMI',
          site: item.site || item.siteId || 'SMI',
          status: item.status || item.statut?.toUpperCase() || ENGIN_STATUS.DISPONIBLE,
          statut: item.statut || item.status?.toLowerCase() || 'actif',
          hours: Number(item.hours || item.heures || 0),
          heures: Number(item.heures || item.hours || 0),
          dispo: Number(item.dispo !== undefined ? item.dispo : 100),
          latestFuelLevel: Number(item.latestFuelLevel || 100),
          lastInspectionDate: item.lastInspectionDate || '',
          activeDowntimeId: item.activeDowntimeId,
          downtimes: Array.isArray(item.downtimes) ? item.downtimes : []
        };
      });
    } catch {
      return [];
    }
  },

  saveAll(list: EnginDocument[]): void {
    localStorage.setItem('sg_mini_machines', JSON.stringify(list));
  },

  getAll(siteId: SiteID = 'TOUS'): EnginDocument[] {
    const all = this.loadAll();
    if (siteId === 'TOUS') return all;
    return all.filter(e => e.siteId === siteId || e.site === siteId);
  },

  getById(enginId: string): EnginDocument | null {
    const found = this.loadAll().find(e => e.enginId === enginId || e.code === enginId);
    return found || null;
  },

  updateStatus(enginId: string, status: ENGIN_STATUS, activeDowntimeId?: string): void {
    const all = this.loadAll();
    const updated = all.map(e => {
      if (e.enginId === enginId || e.code === enginId) {
        return {
          ...e,
          status,
          statut: status === ENGIN_STATUS.DISPONIBLE ? 'actif' : status === ENGIN_STATUS.EN_PANNE ? 'panne' : status.toLowerCase(),
          activeDowntimeId
        };
      }
      return e;
    });
    this.saveAll(updated);
  }
};
