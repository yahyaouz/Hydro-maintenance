export const DAILY_TASKS_COMMON = [
  { label: "Vérification niveau huile moteur", duree: "15min" as const, priorite: "QUOTIDIENNE" as const },
  { label: "Vérification niveau hydraulique", duree: "15min" as const, priorite: "QUOTIDIENNE" as const },
  { label: "Vérification niveau eau de refroidissement", duree: "15min" as const, priorite: "QUOTIDIENNE" as const },
  { label: "Inspection visuelle fuites (huile, carburant, hydraulique)", duree: "15min" as const, priorite: "QUOTIDIENNE" as const },
  { label: "Vérification pression pneus", duree: "15min" as const, priorite: "QUOTIDIENNE" as const },
  { label: "Test freins de service et de parc", duree: "15min" as const, priorite: "QUOTIDIENNE" as const },
  { label: "Inspection éclairage et klaxon", duree: "15min" as const, priorite: "QUOTIDIENNE" as const },
  { label: "Nettoyage filtre à air (dépoussiérage)", duree: "30min" as const, priorite: "NORMALE" as const },
];

export const DAILY_TASKS_BY_MODEL: Record<string, Array<{label: string, duree: '15min' | '30min' | '1h' | '2h' | '4h' | '6h' | '1j', priorite: 'QUOTIDIENNE' | 'NORMALE'}>> = {
  ST2G: [
    { label: "Graissage pivots articulation centrale ST2G", duree: "30min" as const, priorite: "QUOTIDIENNE" as const },
    { label: "Graissage axe godet et vérins ST2G", duree: "15min" as const, priorite: "QUOTIDIENNE" as const },
    { label: "Vérification étanchéité circuit hydraulique godet", duree: "15min" as const, priorite: "NORMALE" as const },
  ],
  ST2D: [
    { label: "Graissage pivots articulation centrale ST2D", duree: "30min" as const, priorite: "QUOTIDIENNE" as const },
    { label: "Graissage paliers moteur Deutz F6L912W", duree: "15min" as const, priorite: "QUOTIDIENNE" as const },
    { label: "Vérification tension courroie ventilateur Deutz", duree: "15min" as const, priorite: "NORMALE" as const },
  ],
  ST7: [
    { label: "Graissage pivots articulation ST7 (plan 22 points)", duree: "30min" as const, priorite: "QUOTIDIENNE" as const },
    { label: "Vérification niveau huile transmission Dana R32000", duree: "15min" as const, priorite: "QUOTIDIENNE" as const },
    { label: "Inspection freins SAHR et accumulateur pression", duree: "30min" as const, priorite: "QUOTIDIENNE" as const },
    { label: "Vérification câbles et connexions électriques cabine", duree: "15min" as const, priorite: "NORMALE" as const },
  ],
};

export const DAILY_TASKS_GENERIC = [
  { label: "Graissage points de lubrification", duree: "30min" as const, priorite: "QUOTIDIENNE" as const },
  { label: "Inspection visuelle générale et carrosserie", duree: "15min" as const, priorite: "NORMALE" as const },
];

export function getDureeByOperation(operation: string): "15min" | "30min" | "1h" | "2h" | "4h" | "6h" | "1j" {
  const op = operation.toLowerCase();
  if (op.includes('vidange moteur')) return '2h';
  if (op.includes('vidange hydraulique')) return '4h';
  if (op.includes('vidange transmission')) return '6h';
  if (op.includes('filtre air')) return '1h';
  if (op.includes('graissage')) return '30min';
  if (op.includes('frein')) return '2h';
  return '1h';
}
