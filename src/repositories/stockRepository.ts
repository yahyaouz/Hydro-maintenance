import { SiteID } from '../types';

export interface StockDocument {
  partId: string;       // Standardized standardized ID (e.g. "FILT-500")
  id: string;           // Backward compatibility
  ref: string;          // Manufacturer reference
  name: string;         // Item name description
  nom: string;          // Backward compatibility
  category: string;     // Technical category (filter, hydraulic, etc.)
  stock: number;        // Current stock qty
  min: number;          // Safe safety threshold qty
  prix: number;         // Unit cost price in MAD or USD
  siteId: SiteID;       // Site code
}

export const stockRepository = {
  loadAll(): StockDocument[] {
    const raw = localStorage.getItem('sg_stock_pieces');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      
      return parsed.map((item: any) => {
        const id = item.partId || item.ref || item.id || `PART-${Math.floor(1000 + Math.random() * 9000)}`;
        return {
          partId: id,
          id,
          ref: item.ref || id,
          name: item.name || item.nom || '',
          nom: item.nom || item.name || '',
          category: item.category || '',
          stock: Number(item.stock !== undefined ? item.stock : 0),
          min: Number(item.min !== undefined ? item.min : 2),
          prix: Number(item.prix !== undefined ? item.prix : 0),
          siteId: item.siteId || 'SMI'
        };
      });
    } catch {
      return [];
    }
  },

  saveAll(list: StockDocument[]): void {
    localStorage.setItem('sg_stock_pieces', JSON.stringify(list));
  },

  getAll(siteId: SiteID = 'TOUS'): StockDocument[] {
    const all = this.loadAll();
    if (siteId === 'TOUS') return all;
    return all.filter(s => s.siteId === siteId);
  },

  updateQty(partId: string, diff: number): boolean {
    const all = this.loadAll();
    let updated = false;
    const newList = all.map(p => {
      if (p.partId === partId || p.ref === partId) {
        const targetStock = p.stock + diff;
        if (targetStock >= 0) {
          updated = true;
          return {
            ...p,
            stock: targetStock
          };
        }
      }
      return p;
    });
    if (updated) {
      this.saveAll(newList);
    }
    return updated;
  }
};
