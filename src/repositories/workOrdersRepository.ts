import { SiteID, WORKORDER_STATUS, PRIORITY_LEVELS } from '../types';

export interface WorkOrderDocument {
  workOrderId: string;      // Standard standardized ID
  id: string;               // For backward compatibility
  title: string;            // Description of work
  machineCode: string;      // Associated engine ID code
  enginId: string;          // Normalized associated engine reference
  severity: PRIORITY_LEVELS; // "critique" | "majeur" | "mineur"
  status: WORKORDER_STATUS;  // "OUVERT" | "EN_COURS" | "PIÈCES_ATTRIBUÉES" | "RÉSOLU" | "CLOS"
  assignedTech: string;      // Technician in charge
  creationDate: string;      // ISO/readable date
  createdBy: string;         // Name of shift lead
  durationHours: number;     // Hours spent
  costEst: number;           // Cost in USD
  siteId: SiteID;            // Associated mine site
  replacedParts: Array<{
    ref: string;
    name: string;
    qty: number;
    costUSD: number;
  }>;
  checklist: Array<{
    task: string;
    completed: boolean;
    checkedBy?: string;
  }>;
  idempotencyKey?: string;
  updatedAt?: string;
}

export const workOrdersRepository = {
  loadAll(): WorkOrderDocument[] {
    const raw = localStorage.getItem('sg_work_orders');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      
      return parsed.map((item: any) => {
        const id = item.workOrderId || item.id || `BT-${Math.floor(1000 + Math.random() * 9000)}`;
        return {
          workOrderId: id,
          id: id,
          title: item.title || '',
          machineCode: item.machineCode || item.enginId || '',
          enginId: item.enginId || item.machineCode || '',
          severity: item.severity || PRIORITY_LEVELS.MINEUR,
          status: item.status || WORKORDER_STATUS.OUVERT,
          assignedTech: item.assignedTech || '',
          creationDate: item.creationDate || '',
          createdBy: item.createdBy || '',
          durationHours: Number(item.durationHours || 0),
          costEst: Number(item.costEst || 0),
          siteId: item.siteId || 'SMI',
          replacedParts: Array.isArray(item.replacedParts) ? item.replacedParts : [],
          checklist: Array.isArray(item.checklist) ? item.checklist : [
            { task: "Vérifier l'isolement électrique & cadenassage", completed: false },
            { task: "Inspecter les fuites d'huile hydraulique", completed: false },
            { task: "Contrôler le serrage des flexibles", completed: false },
            { task: "Faire l'essai dynamique réglementaire sous terre", completed: false }
          ],
          idempotencyKey: item.idempotencyKey,
          updatedAt: item.updatedAt
        };
      });
    } catch {
      return [];
    }
  },

  saveAll(list: WorkOrderDocument[]): void {
    localStorage.setItem('sg_work_orders', JSON.stringify(list));
  },

  getAll(siteId: SiteID = 'TOUS'): WorkOrderDocument[] {
    const all = this.loadAll();
    if (siteId === 'TOUS') return all;
    return all.filter(w => w.siteId === siteId);
  },

  getById(workOrderId: string): WorkOrderDocument | null {
    const found = this.loadAll().find(w => w.workOrderId === workOrderId);
    return found || null;
  },

  create(doc: Omit<WorkOrderDocument, 'workOrderId' | 'id'> & { id?: string }): WorkOrderDocument {
    const all = this.loadAll();
    
    // Check idempotency duplication first
    if (doc.idempotencyKey) {
      const existing = all.find(w => w.idempotencyKey === doc.idempotencyKey);
      if (existing) return existing;
    }

    const id = doc.id || `BT-${Date.now().toString().slice(-6)}`;
    const newBT: WorkOrderDocument = {
      ...doc,
      workOrderId: id,
      id,
      updatedAt: new Date().toISOString()
    };

    all.unshift(newBT);
    this.saveAll(all);
    return newBT;
  }
};
