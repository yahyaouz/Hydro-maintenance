export enum USER_ROLES {
  ADMIN = 'ADMIN',
  DIRECTION = 'DIRECTION',
  RESPONSABLE_MAINTENANCE = 'RESPONSABLE_MAINTENANCE',
  RESPONSABLE_CHANTIER = 'RESPONSABLE_CHANTIER',
  MECANICIEN = 'MECANICIEN',
  SECRETAIRE = 'SECRETAIRE'
}

export type UserRole = 
  | 'ADMIN' 
  | 'DIRECTION' 
  | 'RESPONSABLE_MAINTENANCE' 
  | 'RESPONSABLE_CHANTIER' 
  | 'MECANICIEN' 
  | 'SECRETAIRE';

export type SiteID = 'SMI' | 'OUMEJRANE' | 'KOUDIA' | 'OUANSIMI' | 'BOU-AZZER' | 'TOUS';

export enum ENGIN_STATUS {
  DISPONIBLE = 'DISPONIBLE',
  EN_PANNE = 'EN_PANNE',
  EN_MAINTENANCE = 'EN_MAINTENANCE',
  RESTREINT = 'RESTREINT'
}

export enum WORKORDER_STATUS {
  OUVERT = 'OUVERT',
  EN_COURS = 'EN_COURS',
  PIECES_ATTRIBUES = 'PIÈCES_ATTRIBUÉES',
  RESOLU = 'RÉSOLU',
  CLOS = 'CLOS'
}

export enum PRIORITY_LEVELS {
  CRITIQUE = 'critique',
  MAJEUR = 'majeur',
  MINEUR = 'mineur'
}

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  siteId: SiteID;
  speciality?: string;
  active?: boolean;
  requestedRole?: UserRole;
}

export interface Site {
  id: SiteID;
  name: string;
}

export interface Mechanic {
  id: string; // mecanicienId
  mecanicienId?: string; // normalized
  name: string;
  siteId: SiteID;
  speciality: string;
  level: string;
  score: number;
  interventionsCount: number;
  status: 'ACTIF' | 'INACTIF' | 'ABSENT';
  avatar?: string;
  joinedDate: string;
  averageSpeed: number;
  qualityRate: number;
}

export interface Documents {
  contrat?: string;
  diplome?: string;
  attestationFormation?: string;
  caces?: string;
}

export interface MecanicienStats {
  totalInterventions: number;
  interventionsCeMois: number;
  derniereIntervention: string;
  scoreMensuel: number | null;
  mttrMoyen: number | null;
  tauxResolutionPremiereFois: number | null;
  tauxTournéesCompletes: number | null;
  heuresInterventionCeMois: number;
}

export interface Mecanicien {
  id?: string; // Firestore document ID
  uid: string;
  userUid?: string | null; // Lien vers users.uid si le mécano a un compte GMAO, null si technicien de fond
  matricule: string;
  nom: string;
  prenom: string;
  nomComplet?: string;
  photo: string; // URL Firebase Storage ou base64
  siteId: SiteID;
  poste: string; // "Poste 1" | "Poste 2" | "Poste 3"
  equipe?: string; // Shift (A, B, C...)
  competences: string[];
  telephone: string;
  telephoneUrgence?: string;
  email: string;
  adresse?: string;
  dateNaissance?: string;
  dateEmbauche: string;
  documents?: Documents;
  stats: MecanicienStats;
  active: boolean;
  statut?: string;
  source: "MIGRATION_SPRINT6" | "PRODUCTION_IMPORT" | "ADMIN_CREATION" | "IMPORT_PLANIFICATION" | "MOCK_SPRINT4";
  updatedAt?: string;
}

export interface Intervention {
  id: string; // workOrderId / panneId reference
  enginId?: string; // normalized engine reference
  date: string;
  startTime: string;
  endTime: string;
  engin: string;
  type: 'VIDANGE' | 'REPARATION' | 'REMPLACEMENT' | 'INSPECTION' | 'GRAISSAGE' | 'REGLAGE' | 'AUTRE';
  description: string;
  pieces: { name: string; quantity: number }[];
  duration: number; // in hours
  status: 'EN_ATTENTE' | 'VALIDE' | 'REJETE';
  mecanicienId: string;
  siteId: SiteID;
  observations?: string;
}

export interface OfflineAction<TPayload = any> {
  id: string;
  idempotencyKey: string;
  actionType: 'DECLARE_STOP' | 'REMETTRE_EN_SERVICE' | 'CREATE_BT' | 'PILOT_FEEDBACK' | string;
  payload: TPayload;
  label: string;
  timestamp: string;
  siteId: SiteID;
  userId?: string;
}


export const SITES: Site[] = [
  { id: 'SMI', name: 'SMI' },
  { id: 'OUMEJRANE', name: 'OUMEJRANE' },
  { id: 'KOUDIA', name: 'KOUDIA AICHA' },
  { id: 'OUANSIMI', name: 'OUANSIMI' },
  { id: 'BOU-AZZER', name: 'BOU-AZZER' },
];
