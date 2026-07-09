import { SiteID } from "../types";

export interface MachineDowntime {
  id: string;
  startHour: string;       // e.g. "2026-05-20 08:30"
  endHour?: string;        // empty if active
  durationMinutes?: number; // computed once resolved
  reason: string;
  category: "HYDRAULIQUE" | "MOTEUR" | "TRANSMISSION" | "FREINAGE" | "ÉLECTRIQUE" | "PNEUMATIQUE" | "STRUCTURE" | "SÉCURITÉ";
  severity: "critique" | "majeur" | "mineur";
  isAwaitingParts: boolean;
  isAwaitingMechanic: boolean;
  isAwaitingProduction: boolean;
  assignedMechanic?: string;
  remedyAction?: string;
}

export interface MiniMachine {
  code: string;
  type: "Scooptram" | "Foreuse Jumbo" | "Dumper Souterrain" | "Locomotive";
  model: string;
  status: "DISPONIBLE" | "EN PANNE" | "EN MAINTENANCE" | "EN ATTENTE PIÈCES" | "RESTREINTE";
  hours: number;
  currentWorksite: string;
  activeDowntimeId?: string;
  downtimes: MachineDowntime[];
  siteId: SiteID; // Added for multi-site isolation
}

export interface WorkOrderBT {
  id: string;
  machineCode: string;
  title: string;
  category: string;
  severity: "critique" | "majeur" | "mineur";
  status: "OUVERT" | "PLANIFIÉ" | "EN_COURS" | "PIÈCES_ATTRIBUÉES" | "RÉSOLU" | "SUSPENDU" | "TEST" | "CLOS" | "ATTENTE_PIÈCES";
  assignedTech: string;
  creationDate: string;
  checklist: Array<{ task: string; done: boolean }>;
  actionsHistory: Array<{
    timestamp: string;
    role: string;
    action: string;
    user: string;
  }>;
  replacedParts: Array<{ name: string; qty: number; costUSD: number }>;
  siteId: SiteID; // Added for multi-site isolation
  diId?: string; // Linked DI
  durationPlannedHours?: number;
  durationRealHours?: number;
  notes?: string;
  isMachineStopped?: boolean;
  lotoRequired?: boolean;
  priority?: "HAUTE" | "MOYENNE" | "BASSE";
}

export interface DemandeInterventionDI {
  id: string;
  machineCode: string;
  siteId: SiteID;
  zone: string;
  symptom: string;
  severity: "critique" | "majeur" | "mineur";
  urgency: "bloquant" | "urgent" | "normal" | "faible";
  createdAt: string;
  createdBy: string;
  createdByRole: string;
  status: "NOUVELLE" | "EN_ANALYSE" | "ACCEPTÉE" | "REJETÉE" | "CONVERTIE_OT" | "TRANSFORMED";
  convertedToOtId?: string;
  comment?: string;
  workOrderId?: string;
}

export interface RapportFinInterventionRFI {
  id: string;
  workOrderId: string;
  machineCode: string;
  rootCause: string;
  subSystem: string;
  component: string;
  remedyAction: string;
  replacedParts: Array<{ name: string; qty: number; costUSD: number }>;
  durationRealHours: number;
  techValidation: boolean;
  supervisorValidation: boolean;
  createdAt: string;
  signedBy: string;
  siteId: SiteID;
}

export interface CarnetSanteProfile {
  id: string;
  enginId: string;
  siteId: SiteID;
  healthScore: number;
  lastChecked: string;
  notes?: string;
}

export interface RootCauseAnalysis {
  id: string;
  workOrderId: string;
  machineCode: string;
  title: string;
  status: "BROUILLON" | "COMPLÉTÉ" | "APPROUVÉ";
  team: string[];
  problemDescription: string;
  fiveWhys: string[];
  rootCause: string;
  preventiveActions: string[];
  siteId: SiteID;
  createdAt: string;
  updatedAt: string;
}

