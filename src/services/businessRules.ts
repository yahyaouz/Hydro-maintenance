import { UserRole, SiteID } from '../types';

export enum EnginStatus {
  DISPONIBLE = 'DISPONIBLE',
  EN_PANNE = 'EN_PANNE',
  EN_MAINTENANCE = 'EN_MAINTENANCE',
  RESTREINT = 'RESTREINT'
}

export enum WorkOrderStatus {
  OUVERT = 'OUVERT',
  EN_COURS = 'EN_COURS',
  PIECES_ATTRIBUEES = 'PIÈCES_ATTRIBUÉES',
  RESOLU = 'RÉSOLU',
  CLOS = 'CLOS'
}

export interface BusinessRuleValidation {
  isValid: boolean;
  message: string;
}

/**
 * ----------------------------------------------------
 * CENTRALIZED MINING BUSINESS AND HSE SAFETY RULES (Objective 6)
 * ----------------------------------------------------
 */
export const BusinessRules = {
  /**
   * Role-based access control checking with strict compliance logs
   */
  canPerformAction(role: UserRole, action: string): boolean {
    const permissions: Record<UserRole, string[]> = {
      ADMIN: ['ANY', 'DELETE_BT', 'RESET_DATA', 'CLOSE_BT', 'CREATE_BT', 'EDIT_STOCK', 'SIGN_HANDOVER'],
      DIRECTION: ['VIEW_KPI', 'SIGN_HANDOVER', 'VIEW_REPORTS'],
      RESPONSABLE_MAINTENANCE: ['CREATE_BT', 'EDIT_BT', 'CLOSE_BT', 'EDIT_STOCK', 'SIGN_HANDOVER', 'DECLARATION_PANNE'],
      RESPONSABLE_CHANTIER: ['CREATE_BT', 'EDIT_BT', 'DECLARATION_PANNE', 'SIGN_HANDOVER'],
      MECANICIEN: ['EDIT_BT', 'UPDATE_PROGRESS', 'DECLARATION_PANNE'],
      SECRETAIRE: ['CREATE_BT', 'DECLARATION_PANNE', 'RECORD_HOURS']
    };

    const userPerms = permissions[role] || [];
    if (userPerms.includes('ANY')) return true;
    return userPerms.includes(action);
  },

  /**
   * Ensures machines are never inappropriately marked DISPONIBLE while open critical BTs are active
   */
  validateAvailabilityState(
    enginId: string, 
    targetStatus: string, 
    activeWorkOrdersForEngin: { status: string; severity: string }[]
  ): BusinessRuleValidation {
    if (targetStatus === EnginStatus.DISPONIBLE) {
      const activeCriticalBT = activeWorkOrdersForEngin.some(
        wo => wo.status !== 'CLOS' && wo.status !== 'RÉSOLU' && wo.severity === 'critique'
      );
      if (activeCriticalBT) {
        return {
          isValid: false,
          message: `🔴 [RÈGLE HSE] Un engin ne peut pas être remis DISPONIBLE s'il possède au moins un Bon de Travail actif de gravité CRITIQUE.`
        };
      }
    }
    return { isValid: true, message: 'État machine réglementaire.' };
  },

  /**
   * Enforces sequence of transitions for work orders on industrial equipment
   */
  validateWorkOrderTransition(
    currentStatus: string,
    targetStatus: string,
    checklistComplete: boolean,
    userRole: UserRole
  ): BusinessRuleValidation {
    const cur = currentStatus.toUpperCase();
    const tgt = targetStatus.toUpperCase();

    if (cur === tgt) {
      return { isValid: true, message: 'Aucun changement réclamé' };
    }

    if (cur === 'CLOS') {
      return { isValid: false, message: 'Impossible de modifier un Bon de Travail déjà archivé réglementairement (CLOS).' };
    }

    // Standard chronological progression: OUVERT -> EN_COURS -> PIÈCES_ATTRIBUÉES -> RÉSOLU -> CLOS
    if (tgt === 'CLOS') {
      if (userRole !== 'ADMIN' && userRole !== 'RESPONSABLE_MAINTENANCE') {
        return {
          isValid: false,
          message: 'Habilitation insuffisante : Seul le Responsable de la Maintenance ou l\'Administrateur peut CLÔTURER définitivement le BT.'
        };
      }
      if (cur !== 'RÉSOLU') {
        return {
          isValid: false,
          message: 'Interdit : Un Bon de Travail doit être déclaré techniquement RÉSOLU avant de pouvoir être clôturé.'
        };
      }
      if (!checklistComplete) {
        return {
          isValid: false,
          message: 'Erreur technique : Veuillez valider toutes les lignes de la checklist et de contre-visite avant la clôture finale.'
        };
      }
    }

    return { isValid: true, message: 'Transition validée.' };
  },

  /**
   * Prevent deleting high-priority work orders to maintain audit trace integrity
   */
  canDeleteWorkOrder(status: string, severity: string, role: UserRole): BusinessRuleValidation {
    if (role !== 'ADMIN') {
      return { isValid: false, message: 'Seul l\'Administrateur système est autorisé à supprimer un Bon de Travail.' };
    }
    if (status === 'CLOS' || severity === 'critique') {
      return {
        isValid: false,
        message: 'Suppression rejetée : Les Bons de Travaux d\'interventions critiques ou déjà CLOTURÉS doivent être conservés pour l\'historique d\'inspection réglementaire.'
      };
    }
    return { isValid: true, message: 'Autorisé.' };
  }
};
