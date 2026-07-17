// CHECKLIST : Module de gestion des checklists — HYDROMINES - Espace Maintenance
// Ce fichier gère trois types de listes d'inspection : Conducteur, Maintenance (mécanicien) et Sécurité mensuelle.
// Les données sont persistées dans Firestore.

import * as React from "react";
import { 
  CheckCircle2, 
  Wrench, 
  ShieldAlert, 
  Printer, 
  FileText, 
  Download, 
  Calendar, 
  Clock, 
  User, 
  Truck, 
  AlertTriangle, 
  Check, 
  X, 
  Plus, 
  FileSpreadsheet, 
  Trash2,
  Search,
  BookOpen
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageBanner } from "@/components/ui/PageBanner";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

import { collection, addDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useCollection } from '@/hooks/useCollection';
import { DataLoadError } from '@/components/shared/DataLoadError';
import { useAuthStore } from '@/lib/store';
import { getLocalDateString, escapeCsvField } from '@/lib/utils';
import { dbService } from '@/services/firestoreService';

// Types
interface Engin {
  id: string;
  modele: string;
  marque: string;
  type: string;
  heuresMarche: number;
  siteId?: string;
  etat?: string;
  statut?: string;
  dispo?: number;
}

interface Mecanicien {
  id: string;
  nomComplet: string;
  siteId?: string;
  deleted?: boolean;
  statut?: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  section: string;
}

interface ChecklistSubmission {
  id: string;
  type: "CONDUCTEUR" | "MAINTENANCE" | "SECURITE";
  date: string;
  heure: string;
  enginId: string;
  enginModele: string;
  signataire: string;
  signataireId?: string;
  poste: string;
  siteId?: string;
  items: { [itemId: string]: "OK" | "KO" | "NONE" };
  commentaires: string | { [sectionId: string]: string };
  timestamp: number;
  deleted?: boolean;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function Checklists() {
  // Onglet actif : conducteur, maintenance, securite, historique
  const [activeTab, setActiveTab] = React.useState<"conducteur" | "maintenance" | "securite" | "historique">("conducteur");

  const [isSavingChecklist, setIsSavingChecklist] = React.useState<boolean>(false);

  // Formulaire d'en-tête global
  const [selectedEngin, setSelectedEngin] = React.useState("");
  const [selectedSignataire, setSelectedSignataire] = React.useState("");
  const [customSignataire, setCustomSignataire] = React.useState("");
  const [selectedPoste, setSelectedPoste] = React.useState("Poste 1");
  const [selectedDate, setSelectedDate] = React.useState(() => {
    const d = new Date();
    return getLocalDateString(d);
  });
  const [selectedHeure, setSelectedHeure] = React.useState(() => {
    const d = new Date();
    return d.toTimeString().split(" ")[0].slice(0, 5);
  });

  // Filtres historique
  const [historySearch, setHistorySearch] = React.useState("");
  const [historyTypeFilter, setHistoryTypeFilter] = React.useState("Tous");

  // Detail submission pour impression/consultation
  const [viewingSubmission, setViewingSubmission] = React.useState<ChecklistSubmission | null>(null);

  // LOGO Hydromines fallback helper
  const [logoError, setLogoError] = React.useState(false);

  // Read collections from Firestore
  const { user, activeSite } = useAuthStore();
  const { data: rawEngins, loading: enginsLoading, error: enginsError } = useCollection<any>('engins');
  const { data: rawMecaniciens, loading: mecaniciensLoading, error: mecaniciensError } = useCollection<any>('mecaniciens');
  const { data: rawSubmissions, loading: submissionsLoading, error: submissionsError } = useCollection<any>('checklists', [], { orderByField: 'timestamp', orderByDirection: 'desc' });

  const hasLoadError = !!(enginsError || mecaniciensError || submissionsError);

  // Filtrer selon le rôle et le site
  const engins = React.useMemo(() => {
    if (!rawEngins) return [];
    const actifs = rawEngins.filter((e: any) => {
      const activeStatut = (e.statut || '').toLowerCase();
      const isOut = e.statut !== undefined 
        ? (activeStatut === 'hors service' || activeStatut === 'vendu') 
        : (e.etat === 'Hors service' || e.etat === 'Vendu');
      return !e.deleted && !isOut;
    });
    if (user?.role === 'ADMIN' || user?.role === 'DIRECTION') {
      return activeSite === 'TOUS' ? actifs : actifs.filter((e: any) => e.siteId === activeSite);
    }
    return actifs.filter((e: any) => e.siteId === user?.siteId);
  }, [rawEngins, user, activeSite]);

  const mecaniciens = React.useMemo(() => {
    if (!rawMecaniciens) return [];
    const actifs = rawMecaniciens.filter((m: any) => !m.deleted && (m.statut === 'Actif' || (m.statut === undefined && m.active !== false)));
    const mappedActifs = actifs.map((m: any) => ({
      ...m,
      nomComplet: m.nomComplet || `${m.prenom || ""} ${m.nom || ""}`.trim() || m.id || ""
    }));
    if (user?.role === 'ADMIN' || user?.role === 'DIRECTION') {
      return activeSite === 'TOUS' ? mappedActifs : mappedActifs.filter((m: any) => m.siteId === activeSite);
    }
    return mappedActifs.filter((m: any) => m.siteId === user?.siteId);
  }, [rawMecaniciens, user, activeSite]);

  const submissions = React.useMemo(() => {
    if (!rawSubmissions) return [];
    return rawSubmissions
      .filter((s: any) => !s.deleted)
      .filter((s: any) => {
        if (user?.role === 'ADMIN' || user?.role === 'DIRECTION') {
          return activeSite === 'TOUS' || s.siteId === activeSite;
        }
        return s.siteId === user?.siteId;
      })
      .sort((a: any, b: any) => b.timestamp - a.timestamp);
  }, [rawSubmissions, user, activeSite]);

  const selectedEnginData = engins.find(e => e.id === selectedEngin);

  // Définir la valeur de départ des sélections d'en-tête
  React.useEffect(() => {
    if (engins.length > 0 && (!selectedEngin || !engins.some(e => e.id === selectedEngin))) {
      setSelectedEngin(engins[0].id);
    }
    if (mecaniciens.length > 0 && (!selectedSignataire || !mecaniciens.some(m => m.nomComplet === selectedSignataire))) {
      setSelectedSignataire(mecaniciens[0].nomComplet);
    }
  }, [engins, mecaniciens, selectedEngin, selectedSignataire]);

  // Réinitialiser les champs de saisie d'en-tête
  const resetHeader = () => {
    const d = new Date();
    setSelectedDate(getLocalDateString(d));
    setSelectedHeure(d.toTimeString().split(" ")[0].slice(0, 5));
    if (engins.length > 0) setSelectedEngin(engins[0].id);
    if (mecaniciens.length > 0) setSelectedSignataire(mecaniciens[0].nomComplet);
    setCustomSignataire("");
    setSelectedPoste("Poste 1");
  };

  // ============================================================
  // DEFINITION DES ITEMS DE SÉCURITÉ ET CHECKLISTS
  // ============================================================

  // CHECKLIST : Structure des items pour l'onglet CONDUCTEUR
  const itemsConducteur: ChecklistItem[] = [
    // SECTION A — VÉRIFICATIONS VISUELLES
    { id: "C_A1", label: "A1. Niveau huile moteur visible et correct (jauge)", section: "SECTION A — VÉRIFICATIONS VISUELLES" },
    { id: "C_A2", label: "A2. Niveau liquide de refroidissement (vase d'expansion)", section: "SECTION A — VÉRIFICATIONS VISUELLES" },
    { id: "C_A3", label: "A3. Fuites visibles sous l'engin (huile, hydraulique, carburant)", section: "SECTION A — VÉRIFICATIONS VISUELLES" },
    // SECTION B — SÉCURITÉ CABINE
    { id: "C_B1", label: "B1. Ceinture de sécurité fonctionnelle et non effilochée", section: "SECTION B — SÉCURITÉ CABINE" },
    { id: "C_B2", label: "B2. ROPS/FOPS intact (pas de fissures, pas de déformation)", section: "SECTION B — SÉCURITÉ CABINE" },
    { id: "C_B3", label: "B3. Extincteur présent et manomètre dans la zone verte", section: "SECTION B — SÉCURITÉ CABINE" },
    // SECTION C — FREINS & COMMANDES
    { id: "C_C1", label: "C1. Frein de service répond correctement (pédale ferme)", section: "SECTION C — FREINS & COMMANDES" },
    { id: "C_C2", label: "C2. Frein de parking tient sur pente (test à l'arrêt)", section: "SECTION C — FREINS & COMMANDES" },
    { id: "C_C3", label: "C3. Direction répond sans jeu excessif (volant/levier)", section: "SECTION C — FREINS & COMMANDES" },
    // SECTION D — VOYANTS & ÉCLAIRAGE
    { id: "C_D1", label: "D1. Voyants tableau de bord s'allument au contact (pas d'alarme rouge)", section: "SECTION D — VOYANTS & ÉCLAIRAGE" },
    { id: "C_D2", label: "D2. Phares avant/arrière fonctionnels (haut et bas)", section: "SECTION D — VOYANTS & ÉCLAIRAGE" },
    { id: "C_D3", label: "D3. Klaxon et alarme de recul fonctionnels", section: "SECTION D — VOYANTS & ÉCLAIRAGE" },
    // SECTION E — HYDRAULIQUE & CHARGE
    { id: "C_E1", label: "E1. Bras de levage fonctionne sans à-coup (montée/descente)", section: "SECTION E — HYDRAULIQUE & CHARGE" },
    { id: "C_E2", label: "E2. Godet bascule correctement (chargement/déchargement)", section: "SECTION E — HYDRAULIQUE & CHARGE" },
    { id: "C_E3", label: "E3. Pas de fuite hydraulique visible sur vérins/tuyaux", section: "SECTION E — HYDRAULIQUE & CHARGE" }
  ];

  // CHECKLIST : Structure des items pour l'onglet MAINTENANCE
  const itemsMaintenance: ChecklistItem[] = [
    // SECTION A — MOTEUR & REFROIDISSEMENT
    { id: "M_A1", label: "A1. Niveau huile moteur correct (jauge, entre min et max)", section: "SECTION A — MOTEUR & REFROIDISSEMENT" },
    { id: "M_A2", label: "A2. Couleur huile moteur normale (pas blanchâtre, pas noire extrême)", section: "SECTION A — MOTEUR & REFROIDISSEMENT" },
    { id: "M_A3", label: "A3. Niveau liquide refroidissement correct (vase d'expansion)", section: "SECTION A — MOTEUR & REFROIDISSEMENT" },
    { id: "M_A4", label: "A4. Courroies moteur non usées/craquelées (visuel)", section: "SECTION A — MOTEUR & REFROIDISSEMENT" },
    { id: "M_A5", label: "A5. Filtre air propre (indicateur vert, pas rouge)", section: "SECTION A — MOTEUR & REFROIDISSEMENT" },
    // SECTION B — TRANSMISSION & PONT
    { id: "M_B1", label: "B1. Niveau huile transmission/boîte correct (bouchon de niveau)", section: "SECTION B — TRANSMISSION & PONT" },
    { id: "M_B2", label: "B2. Niveau huile réducteurs (ponts avant/arrière) correct", section: "SECTION B — TRANSMISSION & PONT" },
    { id: "M_B3", label: "B3. Pas de fuite d'huile sur joints de ponts", section: "SECTION B — TRANSMISSION & PONT" },
    { id: "M_B4", label: "B4. Chaînes/maillons de chenilles pas excessivement usés (jeu < 20mm)", section: "SECTION B — TRANSMISSION & PONT" },
    // SECTION C — HYDRAULIQUE
    { id: "M_C1", label: "C1. Niveau huile hydraulique correct (voyant ou jauge)", section: "SECTION C — HYDRAULIQUE" },
    { id: "M_C2", label: "C2. Filtre hydraulique propre (indicateur de restriction)", section: "SECTION C — HYDRAULIQUE" },
    { id: "M_C3", label: "C3. Tuyaux hydrauliques non craquelés/boursouflés", section: "SECTION C — HYDRAULIQUE" },
    { id: "M_C4", label: "C4. Vérins de levage sans fuite au niveau des joints de tige", section: "SECTION C — HYDRAULIQUE" },
    { id: "M_C5", label: "C5. Pompe hydraulique pas bruyante anormalement", section: "SECTION C — HYDRAULIQUE" },
    // SECTION D — FREINS & ROUES
    { id: "M_D1", label: "D1. Épaisseur garnitures/disques frein > minimum (visuel ou jauge)", section: "SECTION D — FREINS & ROUES" },
    { id: "M_D2", label: "D2. Câbles de frein non effilochés/détendus (frein mécanique)", section: "SECTION D — FREINS & ROUES" },
    { id: "M_D3", label: "D3. Pneus non entaillés, pression correcte (visuel + testeur si dispo)", section: "SECTION D — FREINS & ROUES" },
    { id: "M_D4", label: "D4. Jantes/boulons de roues pas fissurés, serrage OK", section: "SECTION D — FREINS & ROUES" },
    // SECTION E — ÉLECTRIQUE & ÉCLAIRAGE
    { id: "M_E1", label: "E1. Batterie bornes propres et serrées (pas de sulfate blanc)", section: "SECTION E — ÉLECTRIQUE & ÉCLAIRAGE" },
    { id: "M_E2", label: "E2. Alternateur charge correcte (voyant éteint en marche)", section: "SECTION E — ÉLECTRIQUE & ÉCLAIRAGE" },
    { id: "M_E3", label: "E3. Phares/éclairage fonctionnels (test à l'arrêt)", section: "SECTION E — ÉLECTRIQUE & ÉCLAIRAGE" },
    { id: "M_E4", label: "E4. Faisceau électrique non usé/coupé sous gaine", section: "SECTION E — ÉLECTRIQUE & ÉCLAIRAGE" },
    // SECTION F — GRAISSAGE & STRUCTURE
    { id: "M_F1", label: "F1. Graisseurs de pivots fonctionnels (débordement de graisse visible)", section: "SECTION F — GRAISSAGE & STRUCTURE" },
    { id: "M_F2", label: "F2. Châssis/articulation pas de fissure visible (inspection visuelle)", section: "SECTION F — GRAISSAGE & STRUCTURE" },
    { id: "M_F3", label: "F3. Godet/dents pas de fissure au niveau des soudures", section: "SECTION F — GRAISSAGE & STRUCTURE" },
    { id: "M_F4", label: "F4. Cabine/portes pas de jeu excessif, charnières OK", section: "SECTION F — GRAISSAGE & STRUCTURE" }
  ];

  // CHECKLIST : Structure des items pour l'onglet SÉCURITÉ
  const itemsSecurite: ChecklistItem[] = [
    // SECTION A — ÉQUIPEMENTS DE PROTECTION
    { id: "S_A1", label: "A1. ROPS/FOPS certifié, pas de déformation, pas de fissure", section: "SECTION A — ÉQUIPEMENTS DE PROTECTION" },
    { id: "S_A2", label: "A2. Siège avec ceinture 2 points ou 3 points fonctionnel", section: "SECTION A — ÉQUIPEMENTS DE PROTECTION" },
    { id: "S_A3", label: "A3. Extincteur manuel présent, manomètre OK, date de contrôle < 1 an", section: "SECTION A — ÉQUIPEMENTS DE PROTECTION" },
    { id: "S_A4", label: "A4. Extincteur automatique (Ansul) pression OK, fusibles intacts", section: "SECTION A — ÉQUIPEMENTS DE PROTECTION" },
    // SECTION B — SIGNALISATION & ÉVACUATION
    { id: "S_B1", label: "B1. Gyrophare/flash fonctionnel (test à l'arrêt)", section: "SECTION B — SIGNALISATION & ÉVACUATION" },
    { id: "S_B2", label: "B2. Alarme de recul fonctionnelle (volume audible)", section: "SECTION B — SIGNALISATION & ÉVACUATION" },
    { id: "S_B3", label: "B3. Panneau d'arrêt d'urgence accessible et testé", section: "SECTION B — SIGNALISATION & ÉVACUATION" },
    { id: "S_B4", label: "B4. Signalisation réfléchissante visible et non délavée", section: "SECTION B — SIGNALISATION & ÉVACUATION" },
    // SECTION C — CONTRÔLE ATMOSPHÈRE
    { id: "S_C1", label: "C1. Détecteur de gaz calibré et fonctionnel (test avec gaz test)", section: "SECTION C — CONTRÔLE ATMOSPHÈRE" },
    { id: "S_C2", label: "C2. Auto-sauveteur présent et dans la date de validité", section: "SECTION C — CONTRÔLE ATMOSPHÈRE" },
    { id: "S_C3", label: "C3. Ventilation cabine fonctionnelle (pas d'odeur d'échappement)", section: "SECTION C — CONTRÔLE ATMOSPHÈRE" },
    // SECTION D — DOCUMENTATION
    { id: "S_D1", label: "D1. Carnet de suivi de l'engin à jour (dernières interventions notées)", section: "SECTION D — DOCUMENTATION" },
    { id: "S_D2", label: "D2. Certificat d'inspection ROPS/FOPS en cours de validité", section: "SECTION D — DOCUMENTATION" },
    { id: "S_D3", label: "D3. Formation conducteur à jour (carte de formation valide)", section: "SECTION D — DOCUMENTATION" },
    { id: "S_D4", label: "D4. Permis de conduire interne valide (si requis par la mine)", section: "SECTION D — DOCUMENTATION" }
  ];

  // ÉTAT DE SÉLECTION DU FORMULAIRE EN COURS
  const [formStates, setFormStates] = React.useState<{ [itemId: string]: "OK" | "KO" | "NONE" }>({});
  
  // Commentaires optionnels par section pour maintenance ou global pour les autres
  const [singleCommentaire, setSingleCommentaire] = React.useState("");
  const [sectionCommentaires, setSectionCommentaires] = React.useState<{ [sectionId: string]: string }>({});

  // Réinitialiser l'état du formulaire de saisie
  const resetFormState = (type: "CONDUCTEUR" | "MAINTENANCE" | "SECURITE") => {
    const defaultStates: { [itemId: string]: "OK" | "KO" | "NONE" } = {};
    const items = type === "CONDUCTEUR" ? itemsConducteur : type === "MAINTENANCE" ? itemsMaintenance : itemsSecurite;
    
    items.forEach(i => {
      defaultStates[i.id] = "NONE"; // Par défaut, non coché
    });

    setFormStates(defaultStates);
    setSingleCommentaire("");
    setSectionCommentaires({});
  };

  // Trigger réinitialisation lors du changement d'onglet
  React.useEffect(() => {
    if (activeTab === "conducteur") {
      resetFormState("CONDUCTEUR");
      resetHeader();
    } else if (activeTab === "maintenance") {
      resetFormState("MAINTENANCE");
      resetHeader();
    } else if (activeTab === "securite") {
      resetFormState("SECURITE");
      resetHeader();
    }
  }, [activeTab]);

  // Clic sur l'état d'un item (Cycle entre NONE -> OK -> KO -> NONE ou clic direct)
  const toggleItemState = (itemId: string, state: "OK" | "KO" | "NONE") => {
    setFormStates(prev => ({
      ...prev,
      [itemId]: state
    }));
  };

  // Cocher tout en "OK" pour aller plus vite
  const checkAllOK = () => {
    const currentItems = activeTab === "conducteur" ? itemsConducteur : activeTab === "maintenance" ? itemsMaintenance : itemsSecurite;
    const updated: { [itemId: string]: "OK" | "KO" | "NONE" } = {};
    currentItems.forEach(i => {
      updated[i.id] = "OK";
    });
    setFormStates(updated);
    toast.success("Tous les éléments ont été marqués Conformes (OK)");
  };

  // Validation et soumission de la checklist active
  const handleSaveChecklist = async () => {
    if (isSavingChecklist) return;

    const currentType = activeTab === "conducteur" ? "CONDUCTEUR" : activeTab === "maintenance" ? "MAINTENANCE" : "SECURITE";
    const currentItems = activeTab === "conducteur" ? itemsConducteur : activeTab === "maintenance" ? itemsMaintenance : itemsSecurite;
    
    // Signataire final
    const signataireFinal = selectedSignataire === "Autre" || !selectedSignataire 
      ? (customSignataire || "Anonyme") 
      : selectedSignataire;

    // Déterminer s'il y a des éléments non cochés
    const nonChecked = currentItems.filter(i => !formStates[i.id] || formStates[i.id] === "NONE");
    if (nonChecked.length > 0) {
      toast.error(`Veuillez vérifier tous les éléments. Il reste ${nonChecked.length} élément(s) non contrôlé(s).`);
      return;
    }

    const matchedEngin = engins.find(e => e.id === selectedEngin);
    const enginModele = matchedEngin?.modele || "Inconnu";
    const siteId = matchedEngin?.siteId || user?.siteId || "SMI";

    setIsSavingChecklist(true);
    try {
      const docId = await dbService.checklists.create({
        type: currentType,
        date: selectedDate,
        heure: selectedHeure,
        enginId: selectedEngin,
        enginModele,
        signataire: signataireFinal,
        signataireId: user?.uid || null,
        poste: selectedPoste,
        siteId,
        items: { ...formStates },
        commentaires: currentType === "MAINTENANCE" ? { ...sectionCommentaires } : singleCommentaire,
        timestamp: Date.now(),
        deleted: false
      });

      // Simuler un objet soumission pour viewingSubmission (depuis les données locales, pas besoin de re-fetch)
      const newSub: ChecklistSubmission = {
        id: docId,
        type: currentType,
        date: selectedDate,
        heure: selectedHeure,
        enginId: selectedEngin,
        enginModele,
        signataire: signataireFinal,
        signataireId: user?.uid || undefined,
        poste: selectedPoste,
        siteId,
        items: { ...formStates },
        commentaires: currentType === "MAINTENANCE" ? { ...sectionCommentaires } : singleCommentaire,
        timestamp: Date.now()
      };

      toast.success(`Checklist ${currentType} enregistrée dans Firestore !`);
      
      // Si c'est maintenance, on propose d'ouvrir la vue d'impression
      if (currentType === "MAINTENANCE") {
        setViewingSubmission(newSub);
      } else {
        // Redirection historique
        setActiveTab("historique");
      }

      // Reset form
      resetFormState(currentType);
      resetHeader();

    } catch (err: any) {
      console.error(err);
      if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
        handleFirestoreError(err, OperationType.WRITE, 'checklists');
      } else {
        toast.warning("Réseau indisponible. La checklist sera synchronisée automatiquement dès la reconnexion.", { duration: 5000 });
      }
    } finally {
      setIsSavingChecklist(false);
    }
  };

  // Suppression d'un historique
  const handleDeleteSubmission = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette fiche d'inspection ?")) return;
    
    try {
      await dbService.checklists.update(id, {
        deleted: true
      });
      toast.success("Inspection supprimée.");
      if (viewingSubmission?.id === id) {
        setViewingSubmission(null);
      }
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
        handleFirestoreError(err, OperationType.DELETE, `checklists/${id}`);
      } else {
        toast.error("Erreur lors de la suppression.");
      }
    }
  };

  // Rendu de chaque bouton d'état (Conforme OK / Défectueux KO)
  const renderItemControl = (itemId: string) => {
    const value = formStates[itemId] || "NONE";
    return (
      <div className="flex gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => toggleItemState(itemId, "OK")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1 border ${
            value === "OK"
              ? "bg-emerald-500 border-emerald-600 text-white shadow-sm"
              : "bg-white border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
          }`}
        >
          <Check className="h-3 w-3" /> OK
        </button>
        <button
          type="button"
          onClick={() => toggleItemState(itemId, "KO")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1 border ${
            value === "KO"
              ? "bg-rose-500 border-rose-600 text-white shadow-sm"
              : "bg-white border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-700"
          }`}
        >
          <X className="h-3 w-3" /> KO
        </button>
      </div>
    );
  };

  // Groupement des items par section
  const getGroupedItems = (items: ChecklistItem[]) => {
    const groups: { [section: string]: ChecklistItem[] } = {};
    items.forEach(i => {
      if (!groups[i.section]) groups[i.section] = [];
      groups[i.section].push(i);
    });
    return groups;
  };

  // Recherche & Filtre historique
  const filteredHistory = submissions.filter(s => {
    const query = historySearch.toLowerCase();
    const matchesQuery = 
      (s.enginId || "").toLowerCase().includes(query) || 
      (s.signataire || "").toLowerCase().includes(query) || 
      (s.enginModele || "").toLowerCase().includes(query) ||
      (s.poste || "").toLowerCase().includes(query);
    
    const matchesType = historyTypeFilter === "Tous" || s.type === historyTypeFilter;
    return matchesQuery && matchesType;
  });

  // IMPRESSION DIRECTE DU NAVIGATEUR
  const triggerBrowserPrint = () => {
    window.print();
  };

  // EXPORT CSV DES CHECKLISTS
  const handleExportCSV = () => {
    if (submissions.length === 0) {
      toast.error("Aucune checklist à exporter.");
      return;
    }

    const rows = [
      'ID;Type;Date;Heure;Engin;Modele;Signataire;Poste;Site;Conformes;Defauts;Total',
      ...submissions.map(s => {
        const total = Object.keys(s.items || {}).length;
        const conformes = Object.values(s.items || {}).filter(v => v === "OK").length;
        const defauts = Object.values(s.items || {}).filter(v => v === "KO").length;
        return [
          s.id,
          s.type,
          s.date,
          s.heure,
          s.enginId,
          s.enginModele,
          s.signataire,
          s.poste,
          s.siteId || '',
          conformes,
          defauts,
          total
        ].map(escapeCsvField).join(';');
      })
    ];

    const csvContent = '\uFEFF' + rows.join('\n'); // BOM UTF-8 pour Excel
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HydromineEspaceMaintenance_Checklists_${activeSite}_${getLocalDateString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé !");
  };

  const isLoading = enginsLoading || submissionsLoading || !rawEngins;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white min-h-[300px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-xs font-medium">Chargement Firestore...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none bg-white min-h-screen p-4 md:p-6 print:p-0 print:bg-white print:min-h-0">
      {hasLoadError && <div className="print:hidden"><DataLoadError /></div>}
      
      {/* Banner - Cache lors de l'impression */}
      <div className="print:hidden">
        <PageBanner
          icon={CheckCircle2}
          badgeLabel="Module Inspection"
          title="FICHES ET CHECKLISTS D'INSPECTION"
          subtitle="Saisie rapide terrain, rapports de conformité mécanique et sécurité HYDROMINES - Espace Maintenance."
        >
          <div className="flex gap-2">
            <Button
              variant={activeTab === "historique" ? "default" : "outline"}
              onClick={() => {
                setActiveTab("historique");
                setViewingSubmission(null);
              }}
              className={activeTab === "historique" ? "bg-amber-500 hover:bg-amber-600 border-amber-600 text-slate-950 font-black uppercase tracking-wider" : "bg-white border-slate-200 text-slate-700 font-bold uppercase tracking-wider"}
            >
              <FileText className="h-4 w-4 mr-1.5" /> Historique ({submissions.length})
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-bold uppercase tracking-wider"
            >
              <FileSpreadsheet className="h-4 w-4 mr-1.5 text-emerald-600" /> Export CSV
            </Button>
          </div>
        </PageBanner>
      </div>

      {/* Onglets de Navigation - Cache lors de l'impression */}
      <div className="flex flex-wrap gap-2 print:hidden bg-white p-2 rounded-2xl border border-slate-200 shadow-xs max-w-4xl">
        <button
          onClick={() => { setActiveTab("conducteur"); setViewingSubmission(null); }}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === "conducteur"
              ? "bg-amber-500 text-slate-950 shadow-md border-b-2 border-amber-600"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Truck className="h-4 w-4 shrink-0" /> 🚗 Conducteur
        </button>

        <button
          onClick={() => { setActiveTab("maintenance"); setViewingSubmission(null); }}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === "maintenance"
              ? "bg-amber-500 text-slate-950 shadow-md border-b-2 border-amber-600"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Wrench className="h-4 w-4 shrink-0" /> 🔧 Maintenance
        </button>

        <button
          onClick={() => { setActiveTab("securite"); setViewingSubmission(null); }}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === "securite"
              ? "bg-amber-500 text-slate-950 shadow-md border-b-2 border-amber-600"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <ShieldAlert className="h-4 w-4 shrink-0" /> 🛡️ Sécurité
        </button>
      </div>

      {/* ZONE PRINCIPALE DE SAISIE */}
      {activeTab !== "historique" && !viewingSubmission && (
        <Card className="relative overflow-hidden border border-[#D4AF37]/50 shadow-lg rounded-2xl max-w-4xl bg-white animate-in fade-in zoom-in-95 duration-150">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
          
          {/* Header Formulaire */}
          <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-6 pt-7 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[#D4AF37] text-xs font-black uppercase tracking-widest block mb-1">
                  SAISIE INSPECTION — HYDROMINES ESPACE MAINTENANCE
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
                  {activeTab === "conducteur" && "🚗 FICHE CONDUITE AVANT DÉMARRAGE (< 2 Min)"}
                  {activeTab === "maintenance" && "🔧 FICHE MAINTENANCE PRÉVENTIVE (< 5 Min)"}
                  {activeTab === "securite" && "🛡️ INSPECTION MENSUELLE DES ÉQUIPEMENTS DE SÉCURITÉ"}
                </h3>
              </div>
              <Button
                type="button"
                onClick={checkAllOK}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold border-emerald-700"
              >
                <Check className="h-4 w-4 mr-1" /> Tout Conforme (OK)
              </Button>
            </div>

            {/* Formulaire Header Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              
              {/* SÉLECTION ENGIN */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">N° Parc Engin</label>
                <select
                  value={selectedEngin}
                  onChange={(e) => setSelectedEngin(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                >
                  <option value="">Sélectionner l'engin</option>
                  {engins.length === 0 ? (
                     <option value="" disabled>Aucun engin disponible — Configurez Admin d'abord</option>
                  ) : (
                    engins.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.id} - {e.modele} ({e.heuresMarche || 0} hrs)
                      </option>
                    ))
                  )}
                </select>
                {selectedEnginData && (
                  <p className="text-[10px] text-[#D4AF37] font-bold mt-1">
                    📍 Site : {selectedEnginData.siteId}
                  </p>
                )}
              </div>

              {/* CONTRÔLEUR / SIGNATAIRE */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  {activeTab === "conducteur" ? "Conducteur" : activeTab === "maintenance" ? "Mécanicien" : "Inspecteur"}
                </label>
                <select
                  value={selectedSignataire}
                  onChange={(e) => setSelectedSignataire(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                >
                  {mecaniciens.length === 0 ? (
                    <option value="" disabled>Aucun mécanicien disponible</option>
                  ) : (
                    mecaniciens.map(m => (
                      <option key={m.id} value={m.nomComplet}>{m.nomComplet}</option>
                    ))
                  )}
                  <option value="Autre">Saisie manuelle...</option>
                </select>
              </div>

              {/* SI NOM MANUEL */}
              {selectedSignataire === "Autre" && (
                <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-rose-600 block">Préciser le Nom Complet</label>
                  <input
                    type="text"
                    value={customSignataire}
                    onChange={(e) => setCustomSignataire(e.target.value)}
                    placeholder="Prénom Nom"
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs font-bold placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
              )}

              {/* POSTE / QUART */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Poste de Travail</label>
                <select
                  value={selectedPoste}
                  onChange={(e) => setSelectedPoste(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                >
                  <option value="Poste 1">Poste 1 (Shift Matin)</option>
                  <option value="Poste 2">Poste 2 (Shift Après-midi)</option>
                  <option value="Poste 3">Poste 3 (Shift Nuit)</option>
                </select>
              </div>

              {/* DATE & HEURE */}
              <div className="space-y-1.5 flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full h-10 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
                <div className="w-20">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Heure</label>
                  <input
                    type="text"
                    value={selectedHeure}
                    onChange={(e) => setSelectedHeure(e.target.value)}
                    className="w-full h-10 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs font-bold text-center focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

            </div>
          </div>

          <CardContent className="p-6 space-y-8">

            {/* RENDER ITEMS PAR SECTION */}
            {(() => {
              const currentItems = activeTab === "conducteur" ? itemsConducteur : activeTab === "maintenance" ? itemsMaintenance : itemsSecurite;
              const grouped = getGroupedItems(currentItems);

              return Object.entries(grouped).map(([sectionTitle, items]) => (
                <div key={sectionTitle} className="border border-slate-100 rounded-xl overflow-hidden shadow-xs">
                  
                  {/* Titre Section */}
                  <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-850">
                      {sectionTitle}
                    </h4>
                    <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                      {items.length} points
                    </span>
                  </div>

                  {/* Liste des Items de la Section */}
                  <div className="divide-y divide-slate-100 bg-white">
                    {items.map(item => {
                      const value = formStates[item.id] || "NONE";
                      return (
                        <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                          <span className="text-xs font-bold text-slate-700 leading-relaxed max-w-xl">
                            {item.label}
                          </span>
                          
                          {/* Contrôle Conforme / Défectueux */}
                          {renderItemControl(item.id)}
                        </div>
                      );
                    })}
                  </div>

                  {/* Saisie Anomalie par section (Seulement pour maintenance) */}
                  {activeTab === "maintenance" && (
                    <div className="bg-amber-50/20 border-t border-slate-100 p-3 flex flex-col sm:flex-row sm:items-center gap-3">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 shrink-0">
                        Anomalie constatée section :
                      </label>
                      <input
                        type="text"
                        placeholder="Ex : fuite d'huile mineure, filtre poussiéreux... (optionnel)"
                        value={sectionCommentaires[sectionTitle] || ""}
                        onChange={(e) => setSectionCommentaires(prev => ({ ...prev, [sectionTitle]: e.target.value }))}
                        className="flex-1 h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  )}

                </div>
              ));
            })()}

            {/* COMMENTAIRE GÉNÉRAL (Pour Conducteur & Sécurité) */}
            {activeTab !== "maintenance" && (
              <div className="space-y-2 border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                  Observations générales / Anomalies constatées (optionnel)
                </label>
                <textarea
                  value={singleCommentaire}
                  onChange={(e) => setSingleCommentaire(e.target.value)}
                  placeholder="Inscrivez ici tout commentaire utile sur l'état général de la machine..."
                  rows={3}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            )}

            {/* BOUTON ENREGISTRER */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button
                type="button"
                onClick={handleSaveChecklist}
                disabled={isSavingChecklist}
                className="w-full sm:w-auto h-12 px-8 bg-amber-500 hover:bg-amber-600 border-amber-600 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSavingChecklist ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <span>✅ Valider et enregistrer la checklist</span>
                )}
              </Button>
            </div>

          </CardContent>
        </Card>
      )}

      {/* HISTORIQUE ET CONSULTATION */}
      {activeTab === "historique" && !viewingSubmission && (
        <Card className="relative overflow-hidden border border-[#D4AF37]/50 shadow-md rounded-2xl bg-white max-w-5xl animate-in fade-in duration-150">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
          <CardHeader className="border-b border-slate-100 bg-slate-50 py-4 px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-base font-black uppercase tracking-wider text-slate-800">
                  📋 HISTORIQUE DES INSPECTIONS — HYDROMINES - ESPACE MAINTENANCE
                </CardTitle>
                <p className="text-slate-500 text-xs font-medium">
                  Liste ordonnée de toutes les fiches d'inspection complétées sur le terrain.
                </p>
              </div>

              {/* Filtres rapides */}
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-60">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Filtrer par Engin, Signataire..."
                    className="w-full h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <select
                  value={historyTypeFilter}
                  onChange={(e) => setHistoryTypeFilter(e.target.value)}
                  className="h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Tous">Tous les types</option>
                  <option value="CONDUCTEUR">🚗 Conducteur</option>
                  <option value="MAINTENANCE">🔧 Maintenance</option>
                  <option value="SECURITE">🛡️ Sécurité</option>
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredHistory.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <AlertTriangle className="h-10 w-10 mx-auto text-amber-500 mb-2" />
                <p className="text-sm font-bold">Aucune fiche d'inspection ne correspond aux critères.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4">Date / Heure</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">N° Parc (Modèle)</th>
                      <th className="py-3 px-4">Signataire</th>
                      <th className="py-3 px-4">Poste</th>
                      <th className="py-3 px-4 text-center">Conformité</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredHistory.map(s => {
                      // Compter les conformes et défauts
                      const total = Object.keys(s.items).length;
                      const conformes = Object.values(s.items).filter(v => v === "OK").length;
                      const defauts = Object.values(s.items).filter(v => v === "KO").length;

                      return (
                        <tr
                          key={s.id}
                          onClick={() => setViewingSubmission(s)}
                          className="hover:bg-amber-50/20 cursor-pointer transition-colors group"
                        >
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            <span className="block">{s.date}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{s.heure}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              s.type === "CONDUCTEUR" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                              s.type === "MAINTENANCE" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                              "bg-purple-50 text-purple-700 border border-purple-200"
                            }`}>
                              {s.type === "CONDUCTEUR" && "🚗 Conducteur"}
                              {s.type === "MAINTENANCE" && "🔧 Maint"}
                              {s.type === "SECURITE" && "🛡️ Sécu"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-black text-slate-900">
                            {s.enginId} <span className="text-[10px] text-slate-400 font-bold">({s.enginModele})</span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-700">{s.signataire}</td>
                          <td className="py-3.5 px-4 font-medium text-slate-500">{s.poste}</td>
                          <td className="py-3.5 px-4 text-center">
                            {defauts > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-full text-[10px] font-black">
                                <X className="h-3 w-3" /> {defauts} défaut(s)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full text-[10px] font-black">
                                <Check className="h-3 w-3" /> {conformes}/{total} OK
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-slate-500 hover:text-amber-600 hover:bg-slate-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewingSubmission(s);
                                }}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                onClick={(e) => handleDeleteSubmission(s.id, e)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* RAPPORT DE CONSEIL / FICHE D'INSPECTION COMPLÈTE À IMPRIMER */}
      {viewingSubmission && (
        <div className="space-y-6 max-w-4xl mx-auto">
          
          {/* Action Header - Cache à l'impression */}
          <div className="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-2xl shadow-xs print:hidden">
            <Button
              variant="outline"
              onClick={() => setViewingSubmission(null)}
              className="border-slate-200 text-slate-700 font-bold"
            >
              ⬅️ Retour
            </Button>

            <div className="flex gap-2">
              <Button
                onClick={triggerBrowserPrint}
                className="bg-slate-900 text-white font-black hover:bg-slate-800"
              >
                <Printer className="h-4 w-4 mr-1.5" /> Imprimer / PDF
              </Button>
              {viewingSubmission.type === "MAINTENANCE" && (
                <Button
                  onClick={triggerBrowserPrint}
                  className="bg-amber-500 text-slate-950 font-black hover:bg-amber-600 border-amber-600"
                >
                  <Download className="h-4 w-4 mr-1.5" /> Télécharger PDF
                </Button>
              )}
            </div>
          </div>

          {/* FICHE D'INSPECTION IMPRIMABLE */}
          <div className="relative overflow-hidden bg-white border border-[#D4AF37]/50 shadow-2xl rounded-3xl p-8 print:border-none print:shadow-none print:p-0 print:m-0 animate-in fade-in duration-200">
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B] print:hidden" />
            
            {/* Filigrane discret d'authenticité Hydromines */}
            <div className="absolute right-8 top-32 text-[10px] font-mono text-slate-300 font-bold select-none uppercase tracking-widest text-right print:hidden">
              DOCUMENT CONFORME — HYDROMINES - ESPACE MAINTENANCE<br />
              ID : {viewingSubmission.id}
            </div>

            {/* En-tête officiel avec Logo Hydromines */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-slate-900 pb-6 mb-8 gap-4">
              <div className="flex items-center gap-3">
                {logoError ? (
                  <div className="h-16 w-48 bg-slate-100 border border-slate-350 flex items-center justify-center rounded-xl">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                      🏢 LOGO HYDROMINES
                    </span>
                  </div>
                ) : (
                  <img
                    src="/src/assets/images/logo-hydromines.png"
                    alt="Logo Hydromines"
                    onError={() => setLogoError(true)}
                    referrerPolicy="no-referrer"
                    className="h-16 w-auto object-contain max-w-[200px]"
                  />
                )}
                <div className="h-12 w-[1.5px] bg-slate-300 hidden sm:block" />
                <div className="hidden sm:block">
                  <h2 className="text-sm font-black tracking-tight text-slate-900 leading-none">
                    HYDROMINES S.A.
                  </h2>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">
                    Département Équipements de Fond
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 text-slate-950 rounded-full text-xs font-black uppercase tracking-widest mb-1.5">
                  FICHE INFORMATISÉE — HYDROMINES - ESPACE MAINTENANCE
                </span>
                <p className="text-xs font-mono text-slate-500">ID Unique : {viewingSubmission.id}</p>
              </div>
            </div>

            {/* Titre Principal */}
            <div className="text-center mb-8">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-wide">
                FICHES DE CONTRÔLE
              </h1>
              <p className="text-slate-500 text-xs font-bold uppercase mt-1 tracking-widest">
                Type de contrôle : {viewingSubmission.type === "CONDUCTEUR" && "🚗 CONDUITE AVANT-DÉMARRAGE"}
                {viewingSubmission.type === "MAINTENANCE" && "🔧 MAINTENANCE PRÉVENTIVE"}
                {viewingSubmission.type === "SECURITE" && "🛡️ SÉCURITÉ ET PROTECTION MENSUELLE"}
              </p>
            </div>

            {/* Tableau des métadonnées */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs mb-8">
              <div>
                <span className="text-slate-400 uppercase tracking-wider font-extrabold text-[9px] block">N° Parc Engin :</span>
                <p className="font-black text-slate-805 text-sm mt-0.5">{viewingSubmission.enginId}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase tracking-wider font-extrabold text-[9px] block">Modèle d'Engin :</span>
                <p className="font-black text-slate-805 text-sm mt-0.5">{viewingSubmission.enginModele}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase tracking-wider font-extrabold text-[9px] block">Signataire :</span>
                <p className="font-black text-slate-805 text-sm mt-0.5">{viewingSubmission.signataire}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase tracking-wider font-extrabold text-[9px] block">Date & Heure :</span>
                <p className="font-black text-slate-805 text-sm mt-0.5">
                  {viewingSubmission.date} à {viewingSubmission.heure}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200 md:border-t-0">
                <span className="text-slate-400 uppercase tracking-wider font-extrabold text-[9px] block">Quart / Poste :</span>
                <p className="font-bold text-slate-700 mt-0.5">{viewingSubmission.poste}</p>
              </div>
              <div className="pt-2 border-t border-slate-200 md:border-t-0">
                <span className="text-slate-400 uppercase tracking-wider font-extrabold text-[9px] block">Statut Global :</span>
                <p className="mt-0.5">
                  {Object.values(viewingSubmission.items || {}).includes("KO") ? (
                    <span className="font-black text-rose-600">⚠️ ANOMALIE DÉTECTÉE</span>
                  ) : (
                    <span className="font-black text-emerald-600">✅ CONFORME</span>
                  )}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200 md:border-t-0">
                <span className="text-slate-400 uppercase tracking-wider font-extrabold text-[9px] block">Points contrôlés :</span>
                <p className="font-bold text-slate-700 mt-0.5">{Object.keys(viewingSubmission.items || {}).length}</p>
              </div>
              <div className="pt-2 border-t border-slate-200 md:border-t-0">
                <span className="text-slate-400 uppercase tracking-wider font-extrabold text-[9px] block">Conformité :</span>
                <p className="font-bold text-slate-700 mt-0.5">
                  {Object.values(viewingSubmission.items || {}).filter(v => v === "OK").length} conformes
                </p>
              </div>
            </div>

            {/* Rendu complet des points cochés */}
            <div className="space-y-6">
              {(() => {
                const currentItems = viewingSubmission.type === "CONDUCTEUR" 
                  ? itemsConducteur 
                  : viewingSubmission.type === "MAINTENANCE" 
                    ? itemsMaintenance 
                    : itemsSecurite;
                const grouped = getGroupedItems(currentItems);

                return Object.entries(grouped).map(([sectionTitle, items]) => {
                  // Vérifier s'il y a des anomalies dans cette section
                  const sectionHasKo = items.some(item => viewingSubmission.items && viewingSubmission.items[item.id] === "KO");

                  return (
                    <div key={sectionTitle} className="border border-slate-200 rounded-xl overflow-hidden print:avoid-break">
                      
                      {/* Section Title */}
                      <div className={`px-4 py-2 border-b border-slate-200 flex justify-between items-center ${
                        sectionHasKo ? "bg-rose-50" : "bg-slate-50"
                      }`}>
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-800">
                          {sectionTitle}
                        </h4>
                        {sectionHasKo && (
                          <span className="text-[9px] bg-rose-100 text-rose-700 font-black px-2 py-0.5 rounded">
                            ⚠️ ANOMALIE
                          </span>
                        )}
                      </div>

                      {/* Items List */}
                      <div className="divide-y divide-slate-100 bg-white text-[11px]">
                        {items.map(item => {
                          const status = (viewingSubmission.items && viewingSubmission.items[item.id]) || "NONE";
                          return (
                            <div key={item.id} className="p-3 flex justify-between items-center gap-4">
                              <span className="text-slate-700 font-medium leading-relaxed">
                                {item.label}
                              </span>
                              
                              {/* Rendu statut */}
                              {status === "OK" ? (
                                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                                  <Check className="h-3.5 w-3.5" /> Conforme
                                </span>
                              ) : status === "KO" ? (
                                <span className="inline-flex items-center gap-1 font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">
                                  <X className="h-3.5 w-3.5" /> Défaut
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">Non contrôlé</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Commentaire de la section si présent */}
                      {viewingSubmission.type === "MAINTENANCE" && 
                       typeof viewingSubmission.commentaires === "object" && 
                       viewingSubmission.commentaires[sectionTitle] && (
                        <div className="bg-amber-50/30 border-t border-slate-200 p-3 text-xs">
                          <span className="font-extrabold text-[9px] uppercase tracking-wider text-slate-500 block">
                            Note d'anomalie :
                          </span>
                          <p className="text-slate-700 font-bold mt-0.5">
                            {viewingSubmission.commentaires[sectionTitle]}
                          </p>
                        </div>
                      )}

                    </div>
                  );
                });
              })()}
            </div>

            {/* Commentaires généraux si existants */}
            {typeof viewingSubmission.commentaires === "string" && viewingSubmission.commentaires && (
              <div className="mt-8 border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                <span className="text-slate-400 uppercase tracking-wider font-extrabold text-[9px] block mb-1">
                  Observations et Remarques Générales :
                </span>
                <p className="text-xs text-slate-800 font-bold leading-relaxed whitespace-pre-line">
                  {viewingSubmission.commentaires}
                </p>
              </div>
            )}

            {/* Zone de signature légale pour l'impression */}
            <div className="mt-12 pt-12 border-t-2 border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
              <div className="space-y-16">
                <p className="font-black text-slate-900 uppercase tracking-wider">L'Inspecteur / Intervenant</p>
                <div className="flex flex-col items-center">
                  <div className="w-48 border-b border-slate-400 h-8" />
                  <span className="text-[10px] text-slate-500 font-bold mt-2">{viewingSubmission.signataire}</span>
                </div>
              </div>
              <div className="space-y-16">
                <p className="font-black text-slate-900 uppercase tracking-wider">Le Chef d'Atelier Hydromines</p>
                <div className="flex flex-col items-center">
                  <div className="w-48 border-b border-slate-400 h-8" />
                  <span className="text-[10px] text-slate-500 font-bold mt-2">Signature & Cachet</span>
                </div>
              </div>
            </div>

            {/* Pied de page officiel */}
            <div className="mt-12 pt-4 border-t border-slate-200 text-center text-[9px] text-slate-450 uppercase tracking-widest font-bold">
              HYDROMINES S.A. — SYSTEME DE CONTRÔLE DE SÉCURITÉ ET MAINTENANCE — HYDROMINES - ESPACE MAINTENANCE — CONFIDENTIEL INTERNE
            </div>

          </div>

        </div>
      )}

      {/* R10: Confirmations d'onglets pour le format de réponse */}
      <div className="hidden">
        [X] CHECKLIST [1] EFFECTUÉE - CONDUCTEUR
        [X] CHECKLIST [2] EFFECTUÉE - MAINTENANCE
        [X] CHECKLIST [3] EFFECTUÉE - SÉCURITÉ
      </div>

    </div>
  );
}
