import { SiteID } from '../types';

export interface HandoverDocument {
  handoverId: string;   // Standardized shift handover report ID
  id: string;           // Backward compatibility
  date: string;         // Calendar date
  timestamp: string;    // Creation timestamp
  shift: 'JOUR' | 'NUIT'; 
  author: string;       // Author shift lead
  role: string;         // Position role
  siteId: SiteID;       // Site code
  incidentsCount: number;
  criticalRisks: string;
  urgentPartsRequest: string;
  observations: Array<{
    id: string;
    text: string;
    user: string;
    isUrgent: boolean;
  }>;
  generalComments: string;
  signatures: Array<{
    id: string;
    user: string;
    role: string;
    timestamp: string;
  }>;
}

export const handoverRepository = {
  loadAll(): HandoverDocument[] {
    const raw = localStorage.getItem('sg_handover_reports');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      
      return parsed.map((item: any) => {
        const id = item.handoverId || item.id || `HO-${Math.floor(1000 + Math.random() * 9000)}`;
        return {
          handoverId: id,
          id: id,
          date: item.date || '',
          timestamp: item.timestamp || '',
          shift: item.shift || 'JOUR',
          author: item.author || '',
          role: item.role || '',
          siteId: item.siteId || 'SMI',
          incidentsCount: Number(item.incidentsCount || 0),
          criticalRisks: item.criticalRisks || '',
          urgentPartsRequest: item.urgentPartsRequest || '',
          observations: Array.isArray(item.observations) ? item.observations : [],
          generalComments: item.generalComments || '',
          signatures: Array.isArray(item.signatures) ? item.signatures : []
        };
      });
    } catch {
      return [];
    }
  },

  saveAll(list: HandoverDocument[]): void {
    localStorage.setItem('sg_handover_reports', JSON.stringify(list));
  },

  getAll(siteId: SiteID = 'TOUS'): HandoverDocument[] {
    const all = this.loadAll();
    if (siteId === 'TOUS') return all;
    return all.filter(h => h.siteId === siteId);
  },

  create(doc: Omit<HandoverDocument, 'handoverId' | 'id'> & { id?: string }): HandoverDocument {
    const all = this.loadAll();
    const id = doc.id || `HO-${Date.now().toString().slice(-6)}`;
    const newDoc: HandoverDocument = {
      ...doc,
      handoverId: id,
      id
    };
    all.unshift(newDoc);
    this.saveAll(all);
    return newDoc;
  }
};
