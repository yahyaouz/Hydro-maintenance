import { SiteID } from '../../types';

export type TaskType = 'PREVENTIF' | 'CORRECTIF' | 'QUOTIDIEN';

export type TaskStatus = 'FAIT' | 'EN_COURS' | 'NON_FAIT' | 'REPORTE' | 'VALIDE';

export type TaskPriority = 'CRITIQUE' | 'HAUTE' | 'NORMALE' | 'BASSE' | 'QUOTIDIENNE';

export interface MaintenanceTask {
  id: string;
  type: TaskType;
  label: string;
  enginId: string;
  enginModele: string;
  mecanicienId: string;
  mecanicienNom: string;
  poste: 'Poste 1' | 'Poste 2' | 'Poste 3';
  siteId: SiteID;
  datePlanifiee: string; // YYYY-MM-DD
  dureeEstimee: '15min' | '30min' | '1h' | '2h' | '4h' | '6h' | '1j';
  priorite: TaskPriority;
  statut: TaskStatus;
  commentaire?: string;
  photo?: string;
  motifReport?: string;
  heuresEnginAuMoment?: number;
  echeanceHeures?: number;
  generationType?: 'AUTO_QUOTIDIEN' | 'AUTO_PM' | 'MANUEL';
  deleted?: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface Engin {
  id: string;
  modele: string;
  siteId: SiteID;
  heuresMarche: number;
  etat: string;
  deleted?: boolean;
}

export interface Mecanicien {
  id: string;
  nomComplet: string;
  poste?: 'Poste 1' | 'Poste 2' | 'Poste 3';
  specialite?: string;
  siteId: SiteID;
  statut: string;
  deleted?: boolean;
}

export interface PmIntervalle {
  id: string;
  typeEngin: string;
  operation: string;
  intervalleHeures: number;
  priorite: string;
  produitHuile?: string;
  quantite?: string;
}
