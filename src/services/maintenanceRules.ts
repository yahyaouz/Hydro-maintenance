import { WORKORDER_STATUS, PRIORITY_LEVELS, UserRole, SiteID } from '../types';

// ====================================================================
// 1. STRENGTHENED DATA VALIDATION ENGINE
// ====================================================================

export interface ValidationResult {
  isValid: boolean;
  message: string;
  field?: string;
}

export const MaintenanceValidator = {
  /**
   * Validate Machine Code format and uniqueness
   */
  validateMachineCode(code: string, existingCodes: string[]): ValidationResult {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      return { isValid: false, message: "Le code de l'engin ne peut pas être vide.", field: "code" };
    }
    
    // Regular expression matching formats like ST7-01, JUMB-03, DUMP-04, LOC-05
    const codeFormatRegex = /^[A-Z0-9]+-[0-9]+$/i;
    if (!codeFormatRegex.test(trimmed)) {
      return { 
        isValid: false, 
        message: "Format d'engin invalide. Exemples valides : ST7-01, JUMB-03, DUMP-04, LOC-05", 
        field: "code" 
      };
    }

    if (existingCodes.map(c => c.toUpperCase()).includes(trimmed)) {
      return { isValid: false, message: `L'engin avec le code "${trimmed}" existe déjà. Doublon interdit.`, field: "code" };
    }

    return { isValid: true, message: "Code d'engin conforme." };
  },

  /**
   * Validate Work Order (BT) Input fields
   */
  validateWorkOrder(title: string, machineCode: string, category: string): ValidationResult {
    if (!title || title.trim().length < 5) {
      return { isValid: false, message: "La description du BT est obligatoire et doit faire au moins 5 caractères.", field: "title" };
    }
    if (!machineCode || !machineCode.trim()) {
      return { isValid: false, message: "Le choix de l'engin associé est obligatoire.", field: "machineCode" };
    }
    if (!category || !category.trim()) {
      return { isValid: false, message: "La catégorie technique de défaillance est requise.", field: "category" };
    }
    return { isValid: true, message: "Bon de travail validé." };
  },

  /**
   * Validate Stock parts quantities and values
   */
  validateStockQuantity(qty: number): ValidationResult {
    if (isNaN(qty) || qty <= 0) {
      return { isValid: false, message: "La quantité de pièces détachées doit être supérieure à zéro.", field: "qty" };
    }
    if (!Number.isInteger(qty)) {
      return { isValid: false, message: "La quantité doit être un nombre entier.", field: "qty" };
    }
    return { isValid: true, message: "Quantité valide." };
  },

  /**
   * Validate Downtime durations (prevent impossible/negative entries)
   */
  validateDowntime(durationHours: number, dateStr: string): ValidationResult {
    if (isNaN(durationHours) || durationHours < 0) {
      return { isValid: false, message: "La durée d'arrêt cumulée ne peut pas être négative.", field: "duration" };
    }
    if (durationHours > 720) { // More than 30 days of continuous downtime on a single shift record
      return { isValid: false, message: "Durée d'immobilisation anormalement élevée (> 720 heures). Veuillez scinder l'intervention.", field: "duration" };
    }

    // Check impossible future dates
    const inputDate = new Date(dateStr);
    const now = new Date();
    if (inputDate > now) {
      return { isValid: false, message: "La date d'intervention ne peut pas être positionnée dans le futur.", field: "date" };
    }

    return { isValid: true, message: "Downtime valide." };
  }
};

// ====================================================================
// 2. BT STATUS STATE-MACHINE TRANSITIONS Enforcement
// ====================================================================

export const TransitionRules = {
  /**
   * Checks if status transition from current to target is physically possible
   */
  isTransitionAllowed(
    current: WORKORDER_STATUS | 'OUVERT' | 'EN_COURS' | 'PIÈCES_ATTRIBUÉES' | 'RÉSOLU' | 'CLOS', 
    target: WORKORDER_STATUS | 'OUVERT' | 'EN_COURS' | 'PIÈCES_ATTRIBUÉES' | 'RÉSOLU' | 'CLOS',
    userRole: UserRole
  ): ValidationResult {
    // Normalizing characters string
    const currNorm = String(current).toUpperCase();
    const targetNorm = String(target).toUpperCase();

    if (currNorm === targetNorm) {
      return { isValid: true, message: "Aucun changement d'état requis." };
    }

    if (currNorm === 'CLOS') {
      return { isValid: false, message: "Impossible de modifier un Bon de Travail déjà CLOS et archivé réglementairement." };
    }

    // Standard sequence flow:
    // OUVERT -> EN_COURS -> PIÈCES_ATTRIBUÉES (or directly to RÉSOLU) -> RÉSOLU -> CLOS
    
    // 1. Progression validations
    if (currNorm === 'OUVERT' && !['EN_COURS', 'CLOS'].includes(targetNorm)) {
      return { isValid: false, message: "Un BT OUVERT doit d'abord passer 'EN_COURS' avant d'être résolu." };
    }

    if (targetNorm === 'CLOS') {
      // Security constraint: Only ADMIN and RESPONSABLE_MAINTENANCE can close a work order
      if (userRole !== 'ADMIN' && userRole !== 'RESPONSABLE_MAINTENANCE') {
        return { isValid: false, message: "Privilèges insuffisants : Seul le Responsable Maintenance ou l'Administrateur peut apposer le visa de CLÔTURE définitive d'un BT." };
      }
      if (currNorm !== 'RÉSOLU') {
        return { isValid: false, message: "Un BT doit être techniquement 'RÉSOLU' avant de pouvoir être définitivement validé et CLOS par la hiérarchie." };
      }
    }

    return { isValid: true, message: "Statut conforme aux exigences de l'exploitation souterraine." };
  }
};

// ====================================================================
// 3. CENTRALIZED AUDIT TRAIL FORMATTING
// ====================================================================

export interface UnifiedAuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  type: string;
  modifiedEntity?: string;
  oldValue?: string;
  newValue?: string;
  source: 'ONLINE' | 'OFFLINE';
  siteId: SiteID;
}

export const AuditTrailService = {
  createLog(
    username: string,
    role: string,
    action: string,
    type: string,
    siteId: SiteID,
    entity?: string,
    oldVal?: string,
    newVal?: string,
    isOfflineFlag: boolean = false
  ): UnifiedAuditLog {
    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 19);
    
    return {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: timestampStr,
      user: username || 'Opérateur Anonyme',
      role: role,
      action: action,
      type: type,
      modifiedEntity: entity,
      oldValue: oldVal,
      newValue: newVal,
      source: isOfflineFlag ? 'OFFLINE' : 'ONLINE',
      siteId: siteId
    };
  }
};
