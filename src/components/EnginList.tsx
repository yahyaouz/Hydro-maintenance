import * as React from "react";
import { 
  Search, 
  Plus, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  History,
  Activity,
  Cpu,
  X,
  Truck,
  Car,
  Hammer,
  RotateCw,
  Wrench,
  AlertTriangle,
  Info,
  Disc,
  ClipboardList,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/lib/store";
import { collection, addDoc, updateDoc, doc, deleteDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { dbService } from "@/services/firestoreService";
import { toast } from "sonner";
import { useCollection } from "@/hooks/useCollection";
import { DataLoadError } from "@/components/shared/DataLoadError";
import { PageBanner } from "@/components/ui/PageBanner";
import { CarnetSante } from "@/components/CarnetSante";
import { SignalerPanne } from "./SignalerPanne";
import { BusinessRules } from "@/services/businessRules";

// Specs mappings for the three categories
export const ENGIN_SPECS: Record<string, { godet: string; reservoir: string; transmission: string; hauteur: string }> = {
  ST2G: { godet: "3,0 t", reservoir: "130 L", transmission: "Hydrostatique", hauteur: "1,85 m" },
  ST2D: { godet: "3,6 t", reservoir: "145 L", transmission: "Hydrostatique", hauteur: "1,90 m" },
  ST7:  { godet: "7,0 t", reservoir: "280 L", transmission: "Hydrostatique", hauteur: "2,20 m" },
};

export const PERF_SPECS: Record<string, { pression: string; debitFreq: string; poids: string; usage: string }> = {
  "MONTABERT T23": { pression: "160 bar", debitFreq: "23 L/min", poids: "23 kg", usage: "Boulonnage et perçage galeries" },
  "MONTABERT T28": { pression: "160 bar", debitFreq: "28 L/min", poids: "28 kg", usage: "Forage lourd et galeries dures" },
  "EPIROC COP 1638": { pression: "200 bar", debitFreq: "60 Hz", poids: "28 kg", usage: "Perçage souterrain" },
  "EPIROC COP 1838": { pression: "220 bar", debitFreq: "55 Hz", poids: "34 kg", usage: "Perçage longues couronnes" },
};

export const VEHI_SPECS: Record<string, { type: string; usage: string; carburant: string; traction: string }> = {
  HILUX: { type: "Toyota Hilux", usage: "Liaison + Transport Équipe", carburant: "Gasoil", traction: "4x4" },
  DUSTER: { type: "Dacia Duster", usage: "Supervision Terrain", carburant: "Gasoil", traction: "4x4" },
  MASTER: { type: "Renault Master (minibus)", usage: "Transport Équipe", carburant: "Gasoil", traction: "2x4 / Traction" },
};

const SITES = ["SMI", "OUMEJRANE", "KOUDIA", "OUANSIMI", "BOU-AZZER"];

interface Engin {
  id: string;
  matricule: string;
  type: string;
  marque: string;
  modele: string;
  site: string;
  statut: "actif" | "maintenance" | "panne" | "hors service" | "arrêté";
  heures: number;
  heuresMarche?: number;
  dispo: number;
}

interface EnginListProps {
  onOpenCarnet?: (engin: any) => void;
}

export function EnginList({ onOpenCarnet }: EnginListProps = {}) {
  const { user, activeSite } = useAuthStore();
  const canAddEngin = ["ADMIN", "SECRETAIRE", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER"].includes(user?.role || "");

  // Load equipements from Firestore
  const { data: allEquipements, loading, error: enginsError } = useCollection<any>("engins");
  const { data: allWorkorders, error: tasksError } = useCollection<any>("maintenanceTasks");
  const { data: allPannes, error: pannesError } = useCollection<any>("pannes");

  const hasLoadError = !!(enginsError || tasksError || pannesError);

  // State
  const [activeTab, setActiveTab] = React.useState<"LHD" | "VL" | "PERFORATEUR" | "CARNET">("LHD");
  const [carnetEnginId, setCarnetEnginId] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isSignalerPanneOpen, setIsSignalerPanneOpen] = React.useState(false);
  const [panneEnginPrefill, setPanneEnginPrefill] = React.useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState<"matricule" | "heures" | "dispo">("matricule");
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = React.useState(false);

  // LOTO Lock states
  const [lotoLocks, setLotoLocks] = React.useState<Record<string, { statutLOTO: "ACTIF" | "INACTIF"; lotoDetails?: string; details?: any }>>({});
  const [isLotoModalOpen, setIsLotoModalOpen] = React.useState(false);
  const [lotoMode, setLotoMode] = React.useState<"LOCK" | "UNLOCK">("LOCK");
  const [lotoTarget, setLotoTarget] = React.useState<any | null>(null);
  const [lotoDetailsInput, setLotoDetailsInput] = React.useState("");

  React.useEffect(() => {
    const siteId = activeSite || "SMI";
    const unsubscribe = dbService.lotoLocks.onSyncLocks(siteId, (locks) => {
      setLotoLocks(locks);
    });
    return () => unsubscribe();
  }, [activeSite]);

  // States for advanced mechanical diagnostics & reliability
  const [isAnalyticsOpen, setIsAnalyticsOpen] = React.useState(true); // Open by default for maximum visibility!
  const [selectedDiagnosticId, setSelectedDiagnosticId] = React.useState<string | null>(null);
  const [activeDiagTab, setActiveDiagTab] = React.useState<"dtr" | "preventif" | "organes">("dtr");

  // Form states inside modal
  const [category, setCategory] = React.useState<"LHD" | "VL" | "PERFORATEUR">("LHD");
  const [newMatricule, setNewMatricule] = React.useState("");
  const [newSite, setNewSite] = React.useState("SMI");
  const [newStatut, setNewStatut] = React.useState<"actif" | "maintenance" | "panne" | "hors service">("actif");

  // Sub-category LHD
  const [lhdType, setLhdType] = React.useState<"ST2G" | "ST2D" | "ST7">("ST2G");
  const [lhdHeures, setLhdHeures] = React.useState<number>(0);

  // Sub-category VL
  const [vlType, setVlType] = React.useState<"Hilux" | "Duster" | "Master">("Hilux");
  const [vlKm, setVlKm] = React.useState<number>(0);

  // Sub-category Perforateur
  const [perfModel, setPerfModel] = React.useState<"MONTABERT T23" | "MONTABERT T28" | "EPIROC COP 1638" | "EPIROC COP 1838">("MONTABERT T23");
  const [perfAssocie, setPerfAssocie] = React.useState("");

  // Edit states for ADMIN role
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editingEquip, setEditingEquip] = React.useState<any | null>(null);
  const [editMatricule, setEditMatricule] = React.useState("");
  const [editSite, setEditSite] = React.useState("SMI");
  const [editStatut, setEditStatut] = React.useState<"actif" | "maintenance" | "panne" | "hors service">("actif");
  const [editType, setEditType] = React.useState("");
  const [editHeures, setEditHeures] = React.useState<number>(0);
  const [editAssocie, setEditAssocie] = React.useState("");

  // Delete states for ADMIN role
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<any | null>(null);

  const handleStartEdit = (equip: any) => {
    setEditingEquip(equip);
    setEditMatricule(equip.matricule || "");
    setEditSite(equip.site || equip.siteId || "SMI");
    setEditStatut(equip.statut || "actif");
    setEditType(equip.type || "");
    setEditHeures(equip.heuresMarche || equip.heures || equip.km || 0);
    setEditAssocie(equip.associe || "");
    setIsEditModalOpen(true);
  };

  const handleStartDelete = (equip: any) => {
    setDeleteTarget(equip);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dbService.engines.delete(deleteTarget.id);
      toast.success(`Équipement ${deleteTarget.matricule} supprimé définitivement !`);
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error deleting equipment:", err);
      toast.error("Erreur lors de la suppression de l'équipement.");
    }
  };

  const handleOpenLotoLockModal = (equip: any) => {
    setLotoTarget(equip);
    setLotoMode("LOCK");
    setLotoDetailsInput("");
    setIsLotoModalOpen(true);
  };

  const handleOpenLotoUnlockModal = (equip: any) => {
    setLotoTarget(equip);
    setLotoMode("UNLOCK");
    setLotoDetailsInput("");
    setIsLotoModalOpen(true);
  };

  const handleLotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lotoTarget) return;

    setIsSubmitLoading(true);
    const currentUserDisplayName = user?.displayName || user?.email || "Agent de Maintenance";

    try {
      if (lotoMode === "LOCK") {
        await dbService.lotoLocks.createOrUpdateLock(lotoTarget.id, {
          machineCode: lotoTarget.matricule,
          lotoLocked: true,
          lotoOwner: currentUserDisplayName,
          lotoStartedAt: new Date().toISOString(),
          lotoReleasedAt: null,
          lotoWorkOrderId: "",
          lotoSupervisorValidation: ["RESPONSABLE_MAINTENANCE", "ADMIN"].includes(user?.role || ""),
          lotoDetails: lotoDetailsInput.trim() || "Cadenassage de sécurité standard.",
          siteId: lotoTarget.site || lotoTarget.siteId || "SMI"
        });
        toast.success(`Équipement ${lotoTarget.matricule} cadenassé avec succès (LOTO) !`);
      } else {
        await dbService.lotoLocks.releaseLock(lotoTarget.id, {
          lotoReleasedAt: new Date().toISOString(),
          lotoDetails: `Levé par ${currentUserDisplayName}. Motif: ${lotoDetailsInput.trim() || "Aucun motif spécifié"}`,
          siteId: lotoTarget.site || lotoTarget.siteId || "SMI"
        });
        toast.success(`Cadenas LOTO levé avec succès pour l'équipement ${lotoTarget.matricule} !`);
      }
      setIsLotoModalOpen(false);
      setLotoTarget(null);
      setLotoDetailsInput("");
    } catch (err) {
      console.error("Error submitting LOTO action:", err);
      toast.error("Erreur lors de la mise à jour de la sécurité LOTO.");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEquip) return;
    if (!editMatricule.trim()) {
      toast.error("Le code/matricule est obligatoire.");
      return;
    }

    setIsSubmitLoading(true);

    try {
      // LOTO lock check: Prevent manual status changes on locked equipment unless user is admin
      const isLotoLocked = editingEquip && lotoLocks[editingEquip.id]?.statutLOTO === "ACTIF";
      if (isLotoLocked && editStatut !== editingEquip.statut && user?.role !== "ADMIN") {
        toast.error("Modification refusée: Cet équipement est cadenassé (LOTO). Seul un administrateur peut modifier son statut.");
        setIsSubmitLoading(false);
        return;
      }

      // HSE Guard: Un engin ne peut pas être remis DISPONIBLE s'il possède au moins un BT actif de gravité CRITIQUE.
      if (editStatut === "actif") {
        const activeBTs = (allWorkorders || []).filter(
          w => (w.enginId === editingEquip.id || w.enginId === editingEquip.matricule) &&
          (w.statut === "NON_FAIT" || w.statut === "EN_COURS") && !w.deleted
        ).map(w => ({
          status: w.statut || w.status,
          severity: (w.priorite || w.severity || "").toLowerCase()
        }));

        const validation = BusinessRules.validateAvailabilityState(
          editingEquip.id,
          "DISPONIBLE",
          activeBTs
        );

        if (!validation.isValid) {
          toast.error(validation.message);
          setIsSubmitLoading(false);
          return;
        }
      }

      const docRef = doc(db, "engins", editingEquip.id);
      
      let mappedStatus = "DISPONIBLE";
      if (editStatut === "panne" || editStatut === "hors service") {
        mappedStatus = "EN_PANNE";
      } else if (editStatut === "maintenance") {
        mappedStatus = "EN_MAINTENANCE";
      }

      let updatedData: any = {
        matricule: editMatricule.toUpperCase().trim(),
        site: editSite,
        siteId: editSite,
        statut: editStatut,
        status: mappedStatus,
        dispo: editStatut === "actif" ? 100 : 0,
        type: editType,
        updatedAt: Timestamp.now()
      };

      if (editingEquip.categorie === "LHD") {
        const specs = ENGIN_SPECS[editType] || ENGIN_SPECS.ST2G;
        updatedData.heures = Number(editHeures) || 0;
        updatedData.heuresMarche = Number(editHeures) || 0;
        updatedData.specs = {
          godet: specs.godet,
          reservoir: specs.reservoir,
          transmission: specs.transmission,
          hauteur: specs.hauteur
        };
      } else if (editingEquip.categorie === "VL") {
        let brand = "Toyota";
        if (editType === "Duster") brand = "Dacia";
        if (editType === "Master") brand = "Renault";
        const specs = VEHI_SPECS[editType.toUpperCase()] || VEHI_SPECS.HILUX;

        updatedData.marque = brand;
        updatedData.heures = Number(editHeures) || 0;
        updatedData.heuresMarche = Number(editHeures) || 0;
        updatedData.km = Number(editHeures) || 0;
        updatedData.specs = {
          usage: specs.usage,
          carburant: specs.carburant,
          traction: specs.traction
        };
      } else if (editingEquip.categorie === "PERFORATEUR") {
        let brand = "EPIROC";
        if (editType.includes("MONTABERT")) brand = "MONTABERT";
        const specs = PERF_SPECS[editType] || PERF_SPECS["MONTABERT T23"];

        updatedData.marque = brand;
        updatedData.serie = editMatricule.toUpperCase().trim();
        updatedData.associe = editAssocie.trim() ? editAssocie.toUpperCase().trim() : "";
        updatedData.specs = {
          pression: specs.pression,
          debitFreq: specs.debitFreq,
          poids: specs.poids,
          usage: specs.usage
        };
      }

      await dbService.engines.update(editingEquip.id, updatedData);
      toast.success(`Équipement ${editMatricule.toUpperCase()} mis à jour avec succès !`);
      setIsEditModalOpen(false);
      setEditingEquip(null);
    } catch (err: any) {
      console.error("Error saving edits:", err);
      toast.error("Erreur lors de la mise à jour de l'équipement.");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // Sync modal site with active global site if activeSite is not TOUS
  React.useEffect(() => {
    if (activeSite && activeSite !== "TOUS") {
      setNewSite(activeSite);
    } else {
      setNewSite("SMI");
    }
  }, [activeSite]);

  // Handle modal submit
  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMatricule.trim()) {
      toast.error("Le code/matricule est obligatoire.");
      return;
    }

    setIsSubmitLoading(true);

    const matriculeUpper = newMatricule.toUpperCase().trim();
    
    // Check if the matricule/ID already exists (case-insensitive check)
    const exists = (allEquipements || []).some(
      (eq: any) =>
        eq.deleted !== true &&
        ((eq.matricule || "").toUpperCase().trim() === matriculeUpper ||
         (eq.id || "").toUpperCase().trim() === matriculeUpper)
    );

    if (exists) {
      toast.error(`Le N° de Parc / Matricule ${matriculeUpper} existe déjà.`);
      setIsSubmitLoading(false);
      return;
    }

    try {
      // Resolve status, dispo, and etat like Admin.tsx
      let resolvedStatut = "actif";
      let resolvedDispo = 100;
      let resolvedEtat = "Opérationnel";

      if (newStatut === "maintenance") {
        resolvedStatut = "maintenance";
        resolvedDispo = 50;
        resolvedEtat = "En maintenance";
      } else if (newStatut === "panne" || newStatut === "hors service") {
        resolvedStatut = "panne";
        resolvedDispo = 0;
        resolvedEtat = "Hors service";
      }

      let mappedStatus = "DISPONIBLE";
      if (resolvedStatut === "panne") {
        mappedStatus = "EN_PANNE";
      } else if (resolvedStatut === "maintenance") {
        mappedStatus = "EN_MAINTENANCE";
      }

      let docData: any = {
        id: matriculeUpper,
        matricule: matriculeUpper,
        site: newSite,
        siteId: newSite,
        statut: resolvedStatut,
        status: mappedStatus,
        dispo: resolvedDispo,
        etat: resolvedEtat,
        categorie: category,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        deleted: false
      };

      if (category === "LHD") {
        const specs = ENGIN_SPECS[lhdType];
        docData.type = lhdType;
        docData.marque = "EPIROC";
        docData.heures = Number(lhdHeures) || 0;
        docData.heuresMarche = Number(lhdHeures) || 0;
        docData.specs = {
          godet: specs.godet,
          reservoir: specs.reservoir,
          transmission: specs.transmission,
          hauteur: specs.hauteur
        };
      } else if (category === "VL") {
        let brand = "Toyota";
        if (vlType === "Duster") brand = "Dacia";
        if (vlType === "Master") brand = "Renault";
        const specs = VEHI_SPECS[vlType.toUpperCase()] || VEHI_SPECS.HILUX;

        docData.type = vlType;
        docData.marque = brand;
        docData.heures = Number(vlKm) || 0;
        docData.heuresMarche = Number(vlKm) || 0;
        docData.km = Number(vlKm) || 0;
        docData.specs = {
          usage: specs.usage,
          carburant: specs.carburant,
          traction: specs.traction
        };
      } else if (category === "PERFORATEUR") {
        let brand = "EPIROC";
        if (perfModel.includes("MONTABERT")) brand = "MONTABERT";
        const specs = PERF_SPECS[perfModel] || PERF_SPECS["MONTABERT T23"];

        docData.type = perfModel;
        docData.marque = brand;
        docData.serie = matriculeUpper;
        docData.associe = perfAssocie.trim() ? perfAssocie.toUpperCase().trim() : "";
        docData.specs = {
          pression: specs.pression,
          debitFreq: specs.debitFreq,
          poids: specs.poids,
          usage: specs.usage
        };
      }

      await dbService.engines.create(matriculeUpper, docData);
      toast.success(`Équipement ${matriculeUpper} ajouté avec succès !`);

      // Reset
      setNewMatricule("");
      setLhdHeures(0);
      setVlKm(0);
      setPerfAssocie("");
      setNewStatut("actif");
      setIsAddModalOpen(false);
    } catch (err: any) {
      console.error("Error adding equipment:", err);
      toast.error("Erreur lors de l'enregistrement de l'équipement.");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // Declare extreme failure (panne)
  const handleDeclarePanne = async (id: string, matricule: string) => {
    try {
      await dbService.engines.update(id, { 
        statut: "panne", 
        status: "EN_PANNE",
        dispo: 0
      });
      toast.success(`Panne déclarée avec succès pour l'équipement ${matricule}.`);
    } catch (err) {
      console.error("Error declaring panne:", err);
      toast.error("Erreur lors de la déclaration de la panne.");
    }
  };

  // Helper utility for statuses styling
  const getRefinedStatusBadge = (statut: string) => {
    const norm = (statut || "").toLowerCase();
    if (norm === "actif") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Actif
        </span>
      );
    }
    if (norm === "maintenance") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Maintenance
        </span>
      );
    }
    if (norm === "panne") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          En Panne
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-550 border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        Hors Service
      </span>
    );
  };

  // Memoized filters
  const filteredEquipements = React.useMemo(() => {
    let list = (allEquipements || []).filter((e) => {
      // 1. Site Match
      let siteMatch = true;
      if (activeSite && activeSite !== "TOUS") {
        const eSite = (e.siteId || e.site || "").toUpperCase();
        siteMatch = eSite === activeSite.toUpperCase();
      }

      // 2. Category Match
      const eCat = e.categorie || "LHD";
      const catMatch = eCat === activeTab;

      // 3. Search Match
      const query = (searchTerm || "").toLowerCase().trim();
      const searchMatch = !query || 
        (e.matricule || "").toLowerCase().includes(query) ||
        (e.type || "").toLowerCase().includes(query) ||
        (e.marque || "").toLowerCase().includes(query) ||
        (e.site || "").toLowerCase().includes(query);

      // 4. Status Match
      const eStatut = (e.statut || "").toLowerCase();
      const statusMatch = !statusFilter || eStatut === (statusFilter || "").toLowerCase();

      return siteMatch && catMatch && searchMatch && statusMatch;
    });

    // Apply sorting
    if (sortBy === "heures") {
      list = [...list].sort((a, b) => {
        const valA = a.heuresMarche || a.heures || a.km || 0;
        const valB = b.heuresMarche || b.heures || b.km || 0;
        return valB - valA;
      });
    } else if (sortBy === "dispo") {
      list = [...list].sort((a, b) => {
        const valA = typeof a.dispo === "number" ? a.dispo : 100;
        const valB = typeof b.dispo === "number" ? b.dispo : 100;
        return valA - valB;
      });
    } else {
      list = [...list].sort((a, b) => (a.matricule || "").localeCompare(b.matricule || ""));
    }

    return list;
  }, [allEquipements, activeSite, activeTab, searchTerm, statusFilter, sortBy]);

  // Memoized KPIs calculated from filteredEquipements (before status filter to keep indicators stable and responsive)
  const kpis = React.useMemo(() => {
    const baseList = (allEquipements || []).filter((e) => {
      let siteMatch = true;
      if (activeSite && activeSite !== "TOUS") {
        const eSite = (e.siteId || e.site || "").toUpperCase();
        siteMatch = eSite === activeSite.toUpperCase();
      }
      const eCat = e.categorie || "LHD";
      const catMatch = eCat === activeTab;

      const query = (searchTerm || "").toLowerCase().trim();
      const searchMatch = !query || 
        (e.matricule || "").toLowerCase().includes(query) ||
        (e.type || "").toLowerCase().includes(query) ||
        (e.marque || "").toLowerCase().includes(query) ||
        (e.site || "").toLowerCase().includes(query);

      return siteMatch && catMatch && searchMatch;
    });

    const activeCount = baseList.filter((e) => (e.statut || "").toLowerCase() === "actif").length;
    const maintCount = baseList.filter((e) => (e.statut || "").toLowerCase() === "maintenance").length;
    const panneCount = baseList.filter((e) => (e.statut || "").toLowerCase() === "panne").length;
    
    const enginsAvecDispo = baseList.filter(e => typeof e.dispo === "number");
    const dispoSum = enginsAvecDispo.reduce((sum, e) => sum + e.dispo, 0);
    const dispoMoy = enginsAvecDispo.length > 0 ? (dispoSum / enginsAvecDispo.length).toFixed(1) : null;
    const sansDispoCount = baseList.length - enginsAvecDispo.length;
    
    return { activeCount, maintCount, panneCount, dispoMoy, sansDispoCount };
  }, [allEquipements, activeSite, activeTab, searchTerm]);

  // Memoized advanced mechanics data for diagnostics & reliability (3 expert features)
  const advancedMechanics = React.useMemo(() => {
    // Filtered by site only to see general site analytics
    const siteEqs = (allEquipements || []).filter((e) => {
      if (activeSite && activeSite !== "TOUS") {
        const eSite = (e.siteId || e.site || "").toUpperCase();
        return eSite === activeSite.toUpperCase();
      }
      return true;
    });

    // 1. DTR details (Taux de Disponibilité Technique Réelle)
    const lhdEqs = siteEqs.filter(e => (e.categorie || "LHD") === "LHD");
    const vlEqs = siteEqs.filter(e => e.categorie === "VL");
    const perfEqs = siteEqs.filter(e => e.categorie === "PERFORATEUR");

    const getAvgDispo = (list: any[]) => {
      if (list.length === 0) return null;
      const withDispo = list.filter(e => typeof e.dispo === "number");
      if (withDispo.length === 0) return null;
      const sum = withDispo.reduce((s, e) => s + e.dispo, 0);
      return Math.round(sum / withDispo.length);
    };

    const dtrLhd = getAvgDispo(lhdEqs);
    const dtrVl = getAvgDispo(vlEqs);
    const dtrPerf = getAvgDispo(perfEqs);

    // 2. Urgent Preventive Maintenance Alerts (Prochaines Échéances d'Heures/KM)
    const alerts: Array<{
      id: string;
      matricule: string;
      category: "LHD" | "VL" | "PERFORATEUR";
      type: string;
      current: number;
      next: number;
      remaining: number;
      urgency: "CRITIQUE" | "ÉLEVÉ" | "MODÉRÉ";
    }> = [];

    siteEqs.forEach(e => {
      const cat = (e.categorie || "LHD") as "LHD" | "VL" | "PERFORATEUR";
      const val = e.heuresMarche || e.km || 0;
      
      if (cat === "LHD") {
        const nextT = Math.ceil((val + 0.1) / 250) * 250;
        const rem = nextT - val;
        if (rem <= 50) {
          alerts.push({
            id: e.id,
            matricule: e.matricule,
            category: "LHD",
            type: e.type || "ST2G",
            current: val,
            next: nextT,
            remaining: parseFloat(rem.toFixed(1)),
            urgency: rem <= 15 ? "CRITIQUE" : rem <= 30 ? "ÉLEVÉ" : "MODÉRÉ"
          });
        }
      } else if (cat === "VL") {
        const nextT = Math.ceil((val + 0.1) / 10000) * 10000;
        const rem = nextT - val;
        if (rem <= 1500) {
          alerts.push({
            id: e.id,
            matricule: e.matricule,
            category: "VL",
            type: e.type || "HILUX",
            current: val,
            next: nextT,
            remaining: Math.round(rem),
            urgency: rem <= 400 ? "CRITIQUE" : rem <= 800 ? "ÉLEVÉ" : "MODÉRÉ"
          });
        }
      } else if (cat === "PERFORATEUR") {
        const nextT = Math.ceil((val + 0.1) / 100) * 100;
        const rem = nextT - val;
        if (rem <= 20) {
          alerts.push({
            id: e.id,
            matricule: e.matricule,
            category: "PERFORATEUR",
            type: e.type || "MONTABERT T23",
            current: val,
            next: nextT,
            remaining: parseFloat(rem.toFixed(1)),
            urgency: rem <= 5 ? "CRITIQUE" : rem <= 10 ? "ÉLEVÉ" : "MODÉRÉ"
          });
        }
      }
    });

    // Sort alerts by urgency: CRITIQUE first, then ELEVE, then MODERE
    const urgencyWeight = { CRITIQUE: 3, ÉLEVÉ: 2, MODÉRÉ: 1 };
    alerts.sort((a, b) => urgencyWeight[b.urgency] - urgencyWeight[a.urgency] || a.remaining - b.remaining);

    return {
      siteEqs,
      dtrLhd,
      dtrVl,
      dtrPerf,
      alerts
    };
  }, [allEquipements, activeSite]);

  // Selected engine for diagnostic details
  const activeDiagEngin = React.useMemo(() => {
    const list = advancedMechanics.siteEqs;
    if (list.length === 0) return null;
    
    // Default to first item or selected item
    const found = list.find(e => e.id === selectedDiagnosticId) || list[0];
    return found;
  }, [advancedMechanics.siteEqs, selectedDiagnosticId]);

  // Selected engine's real diagnostic details (breakdown, intervention, status, horas)
  const realDiagnostics = React.useMemo(() => {
    if (!activeDiagEngin) return null;

    // 1. Get current status
    const currentStatus = activeDiagEngin.statut || "actif";

    // 2. Find the last declared panne for this engine
    const enginePannes = (allPannes || [])
      .filter((p: any) => p.enginId === activeDiagEngin.id && !p.deleted)
      .sort((a: any, b: any) => {
        const dateA = a.dateDeclaration ? new Date(a.dateDeclaration).getTime() : 0;
        const dateB = b.dateDeclaration ? new Date(b.dateDeclaration).getTime() : 0;
        return dateB - dateA;
      });
    const lastPanne = enginePannes[0] || null;

    // 3. Find the last intervention (workorder) for this engine
    const engineWorkorders = (allWorkorders || [])
      .filter((w: any) => (w.enginId === activeDiagEngin.id || w.enginId === activeDiagEngin.matricule) && !w.deleted)
      .sort((a: any, b: any) => {
        const dateA = a.datePlanifiee ? new Date(a.datePlanifiee).getTime() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        const dateB = b.datePlanifiee ? new Date(b.datePlanifiee).getTime() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return dateB - dateA;
      });
    const lastIntervention = engineWorkorders[0] || null;

    return {
      currentStatus,
      lastPanne,
      lastIntervention,
      heuresMarche: activeDiagEngin.heuresMarche || activeDiagEngin.heures || activeDiagEngin.km || 0
    };
  }, [activeDiagEngin, allPannes, allWorkorders]);

  // Tab specs list
  const tabItems = [
    { id: "LHD" as const, label: "ENGINS LHD", icon: Truck },
    { id: "VL" as const, label: "VÉHICULES LÉGERS", icon: Car },
    { id: "PERFORATEUR" as const, label: "PERFORATEURS", icon: Hammer },
    { id: "CARNET" as const, label: "CARNET DE SANTÉ", icon: ClipboardList },
  ];

  // Specific spec getters mapping for VL & PERF
  const getVehiSpec = (model: string) => {
    const norm = (model || "").toUpperCase();
    if (norm.includes("HILUX")) return VEHI_SPECS.HILUX;
    if (norm.includes("DUSTER")) return VEHI_SPECS.DUSTER;
    if (norm.includes("MASTER")) return VEHI_SPECS.MASTER;
    return { type: model || "Véhicule Léger", usage: "Liaison & Services", carburant: "Gasoil", traction: "4x4" };
  };

  const getPerfSpec = (model: string) => {
    const norm = (model || "").toUpperCase();
    if (norm.includes("T23") || norm.includes("MONTABERT")) return PERF_SPECS["MONTABERT T23"];
    if (norm.includes("1638")) return PERF_SPECS["EPIROC COP 1638"];
    if (norm.includes("1838")) return PERF_SPECS["EPIROC COP 1838"];
    return { pression: "N/A", debitFreq: "N/A", poids: "N/A", usage: "Perforateur" };
  };

  const isCarnetActive = typeof onOpenCarnet === "function";

  const handleOpenCarnetLocal = (equip: any) => {
    setCarnetEnginId(equip.id || equip.matricule);
    setActiveTab("CARNET");
    if (onOpenCarnet) {
      onOpenCarnet(equip);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 select-none bg-white text-slate-900 font-sans min-h-screen">
      {hasLoadError && <DataLoadError />}
      
      {/* 1. Page Banner - Hide when Carnet de Sante is active */}
      {activeTab !== "CARNET" && (
        <PageBanner
          icon={Truck}
          badgeLabel="Parc Équipements — 5 Chantiers Miniers"
          title="Parc Matériel"
          subtitle="État et disponibilité de la flotte"
          siteLabel={activeSite === "TOUS" ? "TOUS LES SITES" : activeSite}
        >
          {canAddEngin ? (
            <Button 
              className="bg-amber-500 hover:bg-amber-600 text-white shadow-md font-bold h-11 uppercase px-4 rounded-xl cursor-pointer"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="mr-1.5 h-4 w-4" /> Ajouter Équipement
            </Button>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <Button disabled className="bg-slate-100 text-slate-400 cursor-not-allowed h-11 px-4 rounded-xl">
                <Plus className="mr-1.5 h-4 w-4" /> Ajouter Équipement
              </Button>
              <span className="text-[9px] text-[#9E1A1A] font-bold uppercase font-mono">Lecture seule</span>
            </div>
          )}
        </PageBanner>
      )}

      {/* KPI BAR */}
      {activeTab !== "CARNET" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          <button
            onClick={() => setStatusFilter(statusFilter === "actif" ? null : "actif")}
            title="Filtrer pour afficher uniquement les équipements actifs"
            className={`px-4 py-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer ${
              statusFilter === "actif"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100 scale-102"
                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70"
            }`}
          >
            <span className={`text-xl font-black leading-none mb-1 ${statusFilter === "actif" ? "text-white" : "text-emerald-800"}`}>
              {kpis.activeCount}
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Actifs</span>
          </button>
          
          <button
            onClick={() => setStatusFilter(statusFilter === "maintenance" ? null : "maintenance")}
            title="Filtrer pour afficher uniquement les équipements en maintenance"
            className={`px-4 py-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer ${
              statusFilter === "maintenance"
                ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-100 scale-102"
                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/70"
            }`}
          >
            <span className={`text-xl font-black leading-none mb-1 ${statusFilter === "maintenance" ? "text-white" : "text-amber-800"}`}>
              {kpis.maintCount}
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider">En Maintenance</span>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === "panne" ? null : "panne")}
            title="Filtrer pour afficher uniquement les équipements en panne"
            className={`px-4 py-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer ${
              statusFilter === "panne"
                ? "bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-100 scale-102"
                : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/70"
            }`}
          >
            <span className={`text-xl font-black leading-none mb-1 ${statusFilter === "panne" ? "text-white" : "text-rose-850"}`}>
              {kpis.panneCount}
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider">En Panne</span>
          </button>

          <div className="px-4 py-3 rounded-xl border bg-slate-50 text-slate-700 border-slate-200 flex flex-col items-center justify-center text-center select-none">
            <span className="text-xl font-black leading-none mb-1 text-slate-800">
              {kpis.dispoMoy !== null ? `${kpis.dispoMoy}%` : "—"}
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Dispo Moy.</span>
            {kpis.sansDispoCount > 0 && (
              <span className="text-[9px] font-bold text-amber-600 mt-1 block max-w-full truncate" title={`${kpis.sansDispoCount} engin(s) sans donnée de disponibilité`}>
                ⚠️ {kpis.sansDispoCount} sans donnée
              </span>
            )}
          </div>
        </div>
      )}

      {/* 🔧 ADVANCED MECHANICAL DIAGNOSTICS & RELIABILITY PANEL */}
      {activeTab !== "CARNET" && (
        <Card className="relative overflow-hidden border border-[#D4AF37]/50 rounded-2xl shadow-sm bg-slate-50/30">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
          {/* Panel Header */}
          <div 
            onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
            className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between cursor-pointer select-none hover:from-slate-900 hover:to-slate-850 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 text-slate-950 p-1.5 rounded-lg flex-shrink-0">
                <Wrench className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-xs md:text-sm font-black uppercase tracking-wider">Centre de Diagnostic & Fiabilité Mécanique</h3>
                <p className="text-[10px] text-slate-300 font-medium">Analyse temps réel de la DTR, échéances préventives imminentes & organes sensibles</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black uppercase tracking-widest hidden sm:inline-flex px-2 py-0.5">
                Expert Mode
              </Badge>
              {isAnalyticsOpen ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </div>
          </div>

          {/* Panel Body (Collapsible) */}
          {isAnalyticsOpen && (
            <CardContent className="p-4 md:p-6 bg-white space-y-6">
              {/* Internal Tab Selectors */}
              <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-3">
                <button
                  onClick={() => setActiveDiagTab("dtr")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeDiagTab === "dtr"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  📊 DTR & Taux de Disponibilité
                </button>
                <button
                  onClick={() => setActiveDiagTab("preventif")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeDiagTab === "preventif"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  ⏱️ Échéances Préventives Imminentes
                  {advancedMechanics.alerts.length > 0 && (
                    <span className="inline-flex items-center justify-center bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full leading-none animate-pulse">
                      {advancedMechanics.alerts.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveDiagTab("organes")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeDiagTab === "organes"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  🎛️ Diagnostic des Organes Critiques
                </button>
              </div>

              {/* TAB 1: DTR */}
              {activeDiagTab === "dtr" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Explanatory intro */}
                  <div className="lg:col-span-1 space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs uppercase tracking-wider">
                      <Info className="h-4 w-4 text-slate-500" />
                      <span>Comprendre la DTR</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      La **Disponibilité Technique Réelle (DTR)** mesure la capacité opérationnelle du parc à produire sur le chantier mine. 
                      Elle prend en compte le temps de bon fonctionnement par rapport au temps d'arrêt pour **maintenance systématique** ou **panne curative**.
                    </p>
                    <div className="space-y-1 text-[10px] uppercase font-mono text-slate-400 font-bold">
                      <div>🎯 Objectif Mine : &gt; 85%</div>
                      <div>⚡ Risque Opérationnel : &lt; 70%</div>
                    </div>
                  </div>

                  {/* Gauges & Indicators */}
                  <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Gauge 1: LHD */}
                    <div className="border border-slate-100 rounded-xl p-4 flex flex-col justify-between space-y-4 bg-white shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">FLOTTE LHD</span>
                        <Truck className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                            {advancedMechanics.dtrLhd !== null ? `${advancedMechanics.dtrLhd}%` : "—"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">Disponibilité Technique Réelle</p>
                      </div>
                      <div className="bg-slate-100 h-2 w-full rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            advancedMechanics.dtrLhd === null
                              ? "bg-slate-200"
                              : advancedMechanics.dtrLhd >= 80 ? "bg-emerald-500" : advancedMechanics.dtrLhd >= 65 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${advancedMechanics.dtrLhd !== null ? advancedMechanics.dtrLhd : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Gauge 2: VL */}
                    <div className="border border-slate-100 rounded-xl p-4 flex flex-col justify-between space-y-4 bg-white shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">VEHICULES LEGERS</span>
                        <Car className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                            {advancedMechanics.dtrVl !== null ? `${advancedMechanics.dtrVl}%` : "—"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">Disponibilité Technique Réelle</p>
                      </div>
                      <div className="bg-slate-100 h-2 w-full rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            advancedMechanics.dtrVl === null
                              ? "bg-slate-200"
                              : advancedMechanics.dtrVl >= 80 ? "bg-emerald-500" : advancedMechanics.dtrVl >= 65 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${advancedMechanics.dtrVl !== null ? advancedMechanics.dtrVl : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Gauge 3: Perforateurs */}
                    <div className="border border-slate-100 rounded-xl p-4 flex flex-col justify-between space-y-4 bg-white shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">PERFORATEURS</span>
                        <Hammer className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                            {advancedMechanics.dtrPerf !== null ? `${advancedMechanics.dtrPerf}%` : "—"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">Disponibilité Technique Réelle</p>
                      </div>
                      <div className="bg-slate-100 h-2 w-full rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            advancedMechanics.dtrPerf === null
                              ? "bg-slate-200"
                              : advancedMechanics.dtrPerf >= 80 ? "bg-emerald-500" : advancedMechanics.dtrPerf >= 65 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${advancedMechanics.dtrPerf !== null ? advancedMechanics.dtrPerf : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MAINTENANCE PREVENTIVE */}
              {activeDiagTab === "preventif" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                        Planificateur Opérationnel des Interventions
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Liste automatique des engins approchant de leur seuil de révision périodique systématique (Cycles 100h / 250h / 10000 km).
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 text-[10px] px-2.5 py-1 rounded-lg border-none w-fit font-bold font-mono">
                      Intervalle LHD: 250h | VL: 10000km | Perf: 100h
                    </Badge>
                  </div>

                  {advancedMechanics.alerts.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center space-y-2">
                      <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                      <p className="text-xs text-slate-600 font-extrabold uppercase tracking-wide">Excellente planification du parc !</p>
                      <p className="text-[10px] text-slate-400">Aucun matériel n'est à échéance critique imminente pour le site sélectionné.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {advancedMechanics.alerts.map((alert) => {
                        const isCrit = alert.urgency === "CRITIQUE";
                        const bgCol = isCrit ? "bg-rose-50/40 border-rose-200" : alert.urgency === "ÉLEVÉ" ? "bg-amber-50/40 border-amber-200" : "bg-slate-50/50 border-slate-200";
                        const textBadge = isCrit ? "bg-rose-600 text-white" : alert.urgency === "ÉLEVÉ" ? "bg-amber-600 text-white" : "bg-slate-500 text-white";

                        return (
                          <div 
                            key={alert.id} 
                            className={`border ${bgCol} rounded-xl p-4 flex flex-col justify-between space-y-3.5 relative overflow-hidden transition-all hover:shadow-md`}
                          >
                            {/* Urgent ribbon */}
                            <div className="absolute top-0 right-0">
                              <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-bl-lg ${textBadge}`}>
                                {alert.urgency}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">{alert.category} • {alert.type}</span>
                              <div className="text-sm font-black text-slate-900 font-mono flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-slate-500" />
                                {alert.matricule}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 border-t border-b border-slate-100 py-2 text-center bg-white/70 rounded-lg">
                              <div>
                                <span className="text-[8px] text-slate-400 font-bold uppercase block">Compteur Actuel</span>
                                <span className="text-xs font-black text-slate-800 font-mono">
                                  {alert.current} {alert.category === "VL" ? "km" : "h"}
                                </span>
                              </div>
                              <div>
                                <span className="text-[8px] text-slate-400 font-bold uppercase block">Échéance Révision</span>
                                <span className="text-xs font-black text-slate-800 font-mono text-amber-700">
                                  {alert.next} {alert.category === "VL" ? "km" : "h"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px] pt-0.5">
                              <span className="text-slate-400 font-bold uppercase">Marge opérationnelle</span>
                              <span className={`font-black font-mono ${isCrit ? "text-rose-600" : "text-amber-700"}`}>
                                Reste: {alert.remaining} {alert.category === "VL" ? "km" : "h"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: DIAGNOSTIC DES ORGANES */}
              {activeDiagTab === "organes" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                        Sonde Virtuelle d'Analyse par Organe Critique
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Sélectionnez un équipement ci-dessous pour sonder l'intégrité de ses composants internes majeurs.
                      </p>
                    </div>

                    {/* Machine Selector */}
                    {advancedMechanics.siteEqs.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-slate-400">Équipement:</span>
                        <select
                          value={selectedDiagnosticId || activeDiagEngin?.id || ""}
                          onChange={(e) => setSelectedDiagnosticId(e.target.value)}
                          className="h-10 px-3 border border-slate-200 rounded-lg text-xs font-extrabold text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer w-full sm:w-60"
                        >
                          {advancedMechanics.siteEqs.map(e => (
                            <option key={e.id} value={e.id}>
                              [{e.matricule}] {e.type} ({e.site})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {!activeDiagEngin ? (
                    <div className="text-center py-8 text-xs text-slate-400 font-semibold uppercase">
                      Aucun équipement disponible sur ce site pour lancer le diagnostic.
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* Engine Details Header card */}
                      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 border border-slate-100 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-amber-100 text-amber-800 p-2.5 rounded-xl font-black text-sm font-mono">
                            {activeDiagEngin.matricule}
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-extrabold uppercase block">{activeDiagEngin.marque || "EPIROC"} • {activeDiagEngin.categorie || "LHD"}</span>
                            <span className="text-xs font-extrabold text-slate-800 uppercase">{activeDiagEngin.type || "MINE LOADER"}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-center">
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase block">Compteur heures</span>
                            <span className="text-xs font-black text-slate-800 font-mono">{activeDiagEngin.heuresMarche || activeDiagEngin.heures || activeDiagEngin.km || 0} h</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase block">Disponibilité</span>
                            <span className="text-xs font-black text-amber-700 font-mono">{activeDiagEngin.dispo || 100}%</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase block">Statut Actuel</span>
                            <span className="block mt-0.5">{getRefinedStatusBadge(activeDiagEngin.statut)}</span>
                          </div>
                        </div>
                      </div>

                      {/* IoT Warning Banner */}
                      <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50 text-slate-700 flex flex-col sm:flex-row items-start sm:items-center gap-3 shadow-xs">
                        <div className="p-2 rounded-lg bg-slate-200/60 text-slate-600">
                          <Info className="h-4 w-4" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">INFO SYSTÈME • CAPTEURS IoT</span>
                          <p className="text-[11px] font-extrabold text-slate-700 leading-normal">
                            Diagnostic détaillé par sous-système non disponible — nécessite une intégration capteurs IoT non installée sur cette flotte
                          </p>
                        </div>
                      </div>

                      {/* Real Engine Diagnostics / Overview */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Box 1: Dernière Panne Réelle */}
                        <div className="border border-slate-200/80 rounded-xl p-4 bg-white flex flex-col justify-between space-y-3">
                          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                                <AlertTriangle className="h-3.5 w-3.5" />
                              </div>
                              <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">DERNIÈRE PANNE DÉCLARÉE</span>
                            </div>
                            {realDiagnostics?.lastPanne && (
                              <Badge className="bg-rose-500 text-white font-mono text-[8px] tracking-wider px-1.5">
                                {realDiagnostics.lastPanne.gravite || "MOYENNE"}
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-2 min-h-[60px] flex flex-col justify-center">
                            {realDiagnostics?.lastPanne ? (
                              <>
                                <p className="text-xs font-black text-slate-800 uppercase">
                                  {realDiagnostics.lastPanne.description || "Pas de description"}
                                </p>
                                <div className="flex items-center gap-2 text-[9px] text-slate-400 font-mono">
                                  <span>Numéro: {realDiagnostics.lastPanne.numero || "N/A"}</span>
                                  <span>•</span>
                                  <span>Statut: {realDiagnostics.lastPanne.statut || "N/A"}</span>
                                  <span>•</span>
                                  <span>Déclaré le: {realDiagnostics.lastPanne.dateDeclaration ? realDiagnostics.lastPanne.dateDeclaration.split('T')[0] : "N/A"}</span>
                                </div>
                              </>
                            ) : (
                              <p className="text-xs font-medium text-slate-500 italic text-center py-2">
                                Aucune panne déclarée enregistrée pour cet engin.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Box 2: Dernière Intervention Réelle */}
                        <div className="border border-slate-200/80 rounded-xl p-4 bg-white flex flex-col justify-between space-y-3">
                          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                                <Wrench className="h-3.5 w-3.5" />
                              </div>
                              <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">DERNIÈRE INTERVENTION (BT)</span>
                            </div>
                            {realDiagnostics?.lastIntervention && (
                              <Badge className="bg-amber-500 text-slate-950 font-mono text-[8px] tracking-wider px-1.5">
                                {realDiagnostics.lastIntervention.statut || "PLANIFIÉ"}
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-2 min-h-[60px] flex flex-col justify-center">
                            {realDiagnostics?.lastIntervention ? (
                              <>
                                <p className="text-xs font-black text-slate-800 uppercase line-clamp-2">
                                  {realDiagnostics.lastIntervention.label || "Pas de libellé"}
                                </p>
                                <div className="flex items-center gap-2 text-[9px] text-slate-400 font-mono">
                                  <span>Type: {realDiagnostics.lastIntervention.type || "N/A"}</span>
                                  <span>•</span>
                                  <span>Priorité: {realDiagnostics.lastIntervention.priorite || "N/A"}</span>
                                  {realDiagnostics.lastIntervention.mecanicienNom && (
                                    <>
                                      <span>•</span>
                                      <span>Par: {realDiagnostics.lastIntervention.mecanicienNom}</span>
                                    </>
                                  )}
                                </div>
                              </>
                            ) : (
                              <p className="text-xs font-medium text-slate-500 italic text-center py-2">
                                Aucune intervention enregistrée pour cet engin.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* 2. Custom horizontal tabs - styled like Suivi Magasinier */}
      <div className="flex flex-wrap gap-2 justify-center border-b border-slate-100 pb-3">
        {tabItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setStatusFilter(null); // Reset status filter on tab change
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-amber-50 text-amber-700 border border-amber-500/15 shadow-sm"
                  : "text-slate-500 hover:text-amber-600 hover:bg-slate-50"
              }`}
            >
              <IconComponent className="w-4 h-4 text-amber-600" />
              {item.label}
            </button>
          );
        })}
      </div>

      {activeTab === "CARNET" ? (
        <CarnetSante enginId={carnetEnginId} allEngins={allEquipements || []} />
      ) : (
        <>
          {/* 3. Search and Counter layer */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border border-slate-200 rounded-xl bg-white shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:max-w-xl">
              <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Rechercher par matricule, type, marque, site..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10 border-slate-200 focus-visible:ring-amber-500 text-xs font-medium"
                />
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-10 px-3 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 w-full sm:w-48 cursor-pointer"
              >
                <option value="matricule">Tri: Matricule</option>
                <option value="heures">Tri: Heures/KM (Décroissant)</option>
                <option value="dispo">Tri: Disponibilité (Croissant)</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {statusFilter && (
                <div className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-2 rounded-lg text-xs font-extrabold text-slate-700 uppercase tracking-wider leading-none">
                  <span>Filtré: {statusFilter}</span>
                  <button 
                    onClick={() => setStatusFilter(null)} 
                    className="text-rose-600 hover:text-rose-800 font-black cursor-pointer ml-1 text-sm"
                    title="Supprimer le filtre de statut"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5 leading-none whitespace-nowrap">
                📋 {filteredEquipements.length} Équipement(s) trouvé(s)
              </div>
            </div>
          </div>

      {/* 4. Equipment Grid layout */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RotateCw className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-xs font-bold font-mono text-slate-500 uppercase tracking-widest">
            Chargement de la flotte...
          </p>
        </div>
      ) : filteredEquipements.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-200 rounded-2xl bg-white space-y-4 flex flex-col items-center justify-center">
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-full">
            <Search className="h-6 w-6 text-slate-400" />
          </div>
          <div className="space-y-1 max-w-sm">
            <p className="text-slate-700 text-sm font-extrabold uppercase tracking-wider">Aucun équipement disponible</p>
            <p className="text-xs text-slate-400">
              Aucun matériel ne correspond à votre recherche ou à vos filtres actifs pour le site sélectionné.
            </p>
          </div>
          {(searchTerm || statusFilter) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter(null);
              }}
              className="px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-black text-amber-700 uppercase tracking-wider transition-colors cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* LHD Grid Render */}
          {activeTab === "LHD" && filteredEquipements.map((equip) => {
            const spec = ENGIN_SPECS[equip.type as string] || ENGIN_SPECS.ST2G;
            const isPanne = equip.statut === "panne";
            const isLotoLocked = lotoLocks[equip.id]?.statutLOTO === "ACTIF";
            const lockDetails = lotoLocks[equip.id]?.details;

            const borderCol = isLotoLocked 
              ? "border-rose-400 bg-rose-50/10" 
              : isPanne 
                ? "border-rose-200" 
                : equip.statut === "maintenance" 
                  ? "border-amber-200" 
                  : "border-slate-200/80";

            const glowCol = isLotoLocked 
              ? "hover:border-rose-500 hover:shadow-rose-50" 
              : isPanne 
                ? "hover:border-rose-455 hover:shadow-rose-50" 
                : equip.statut === "maintenance" 
                  ? "hover:border-amber-455 hover:shadow-amber-50" 
                  : "hover:border-amber-500/30 hover:shadow-amber-50/50";
            
            const dispoValue = typeof equip.dispo === "number" ? equip.dispo : 100;
            const dispoColor = dispoValue >= 80 ? "text-emerald-500" : dispoValue >= 50 ? "text-amber-500" : "text-rose-500";
            const dispoBg = dispoValue >= 80 ? "bg-emerald-500" : dispoValue >= 50 ? "bg-amber-500" : "bg-rose-500";

            return (
              <Card key={equip.id} className={`border ${borderCol} bg-white ${glowCol} hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden flex flex-col justify-between group`}>
                <div className="p-5 space-y-4">
                  
                  {/* Header metadata */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-1">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-2 flex-shrink-0">
                        <Truck className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-extrabold text-slate-900 tracking-tight font-mono leading-none mb-1">{equip.matricule}</span>
                        <Badge className="bg-amber-100/50 hover:bg-amber-100/70 text-amber-900 border-none text-[9px] font-black uppercase tracking-wider px-2 py-0.5 w-fit">{equip.site}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {getRefinedStatusBadge(equip.statut)}
 
                      {/* Admin Controls */}
                      {user?.role === "ADMIN" && (
                        <div className="flex items-center gap-1 border-l border-slate-200 pl-2 ml-1">
                          <button
                            onClick={() => handleStartEdit(equip)}
                            className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Modifier l'équipement"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleStartDelete(equip)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Supprimer définitivement"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
 
                  {/* Brand info */}
                  <div>
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">{equip.marque || "EPIROC"}</p>
                    <p className="text-sm text-slate-800 font-black uppercase tracking-wide">
                      {equip.type || "LHD"} • Chargeuse Mine
                    </p>
                  </div>

                  {/* LOTO Lock Details */}
                  {isLotoLocked && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-rose-700 uppercase tracking-widest flex items-center gap-1">
                          🔐 CADENASSÉ (LOTO)
                        </span>
                      </div>
                      <p className="text-[10px] text-rose-800 font-bold uppercase tracking-wider">
                        Responsable: <span className="font-mono text-rose-900 font-black">{lockDetails?.lotoOwner}</span>
                      </p>
                      <p className="text-[10px] text-rose-800 font-bold uppercase tracking-wider">
                        Date de pose: <span className="font-mono text-rose-900 font-black">{lockDetails?.lotoStartedAt ? new Date(lockDetails.lotoStartedAt).toLocaleString('fr-FR') : 'N/A'}</span>
                      </p>
                      {lockDetails?.lotoDetails && (
                        <p className="text-[10px] text-rose-700/85 italic font-bold leading-normal border-t border-rose-100 pt-1 mt-1">
                          Motif: {lockDetails.lotoDetails}
                        </p>
                      )}
                    </div>
                  )}
 
                  {/* Feature badges */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl flex flex-col text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">🪣 Godet</span>
                      <span className="text-sm text-slate-800 font-extrabold font-mono mt-0.5">{spec.godet}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl flex flex-col text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">⛽ Réservoir</span>
                      <span className="text-sm text-slate-800 font-extrabold font-mono mt-0.5">{spec.reservoir}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl flex flex-col text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">⏱️ Heures</span>
                      <span className="text-sm text-amber-700 font-black font-mono mt-0.5">{equip.heuresMarche || equip.heures || 0} h</span>
                    </div>
                  </div>

                  {/* Availability Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-bold uppercase">Disponibilité</span>
                      <span className={`font-black ${dispoColor}`}>{dispoValue}%</span>
                    </div>
                    <div className="bg-slate-100 rounded-full h-1.5 w-full overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full ${dispoBg}`} 
                        style={{ width: `${dispoValue}%` }} 
                      />
                    </div>
                  </div>

                  {/* LOTO Actions block inside the card */}
                  {["MECANICIEN", "RESPONSABLE_MAINTENANCE", "ADMIN"].includes(user?.role || "") && (
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      {!isLotoLocked ? (
                        <button
                          onClick={() => handleOpenLotoLockModal(equip)}
                          className="w-full text-[10px] font-extrabold uppercase tracking-widest py-1.5 rounded-lg border bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 cursor-pointer shadow-sm flex items-center justify-center gap-1 transition-all"
                        >
                          🔒 Cadenasser (LOTO)
                        </button>
                      ) : (
                        ["RESPONSABLE_MAINTENANCE", "ADMIN"].includes(user?.role || "") && (
                          <button
                            onClick={() => handleOpenLotoUnlockModal(equip)}
                            className="w-full text-[10px] font-extrabold uppercase tracking-widest py-1.5 rounded-lg border bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 cursor-pointer shadow-sm flex items-center justify-center gap-1 transition-all"
                          >
                            🔓 Lever le cadenas
                          </button>
                        )
                      )}
                    </div>
                  )}

                </div>

                {/* Footer contextual actions */}
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
                  <button
                    onClick={() => handleOpenCarnetLocal(equip)}
                    className="text-xs font-black uppercase tracking-wider text-amber-700 hover:text-amber-800 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    Carnet de Santé →
                  </button>
                  <button
                    onClick={() => { setPanneEnginPrefill(equip.id); setIsSignalerPanneOpen(true); }}
                    className="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100/55 cursor-pointer shadow-sm flex items-center gap-1 transition-all"
                  >
                    <AlertTriangle className="h-3 w-3 text-rose-600 animate-pulse" /> Signaler Panne
                  </button>
                </div>
              </Card>
            );
          })}

          {/* Véhicules Légers Grid Render */}
          {activeTab === "VL" && filteredEquipements.map((equip) => {
            const spec = getVehiSpec(equip.type);
            const isPanne = equip.statut === "panne";
            const kmReading = equip.heuresMarche ? `${equip.heuresMarche} km` : (equip.heures ? `${equip.heures} km` : (equip.km ? `${equip.km} km` : "0 km"));
            const isLotoLocked = lotoLocks[equip.id]?.statutLOTO === "ACTIF";
            const lockDetails = lotoLocks[equip.id]?.details;

            const borderCol = isLotoLocked 
              ? "border-rose-400 bg-rose-50/10" 
              : isPanne 
                ? "border-rose-200" 
                : equip.statut === "maintenance" 
                  ? "border-amber-200" 
                  : "border-slate-200/80";

            const glowCol = isLotoLocked 
              ? "hover:border-rose-500 hover:shadow-rose-50" 
              : isPanne 
                ? "hover:border-rose-455 hover:shadow-rose-50" 
                : equip.statut === "maintenance" 
                  ? "hover:border-amber-455 hover:shadow-amber-50" 
                  : "hover:border-amber-500/30 hover:shadow-amber-50/50";
            
            const dispoValue = typeof equip.dispo === "number" ? equip.dispo : 100;
            const dispoColor = dispoValue >= 80 ? "text-emerald-500" : dispoValue >= 50 ? "text-amber-500" : "text-rose-500";
            const dispoBg = dispoValue >= 80 ? "bg-emerald-500" : dispoValue >= 50 ? "bg-amber-500" : "bg-rose-500";

            return (
              <Card key={equip.id} className={`border ${borderCol} bg-white ${glowCol} hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden flex flex-col justify-between group`}>
                <div className="p-5 space-y-4">
                  
                  {/* Header metadata */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-1">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-2 flex-shrink-0">
                        <Car className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-extrabold text-slate-900 tracking-tight font-mono leading-none mb-1">{equip.matricule}</span>
                        <Badge className="bg-amber-100/50 hover:bg-amber-100/70 text-amber-900 border-none text-[9px] font-black uppercase tracking-wider px-2 py-0.5 w-fit">{equip.site}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {getRefinedStatusBadge(equip.statut)}
 
                      {/* Admin Controls */}
                      {user?.role === "ADMIN" && (
                        <div className="flex items-center gap-1 border-l border-slate-200 pl-2 ml-1">
                          <button
                            onClick={() => handleStartEdit(equip)}
                            className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Modifier l'équipement"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleStartDelete(equip)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Supprimer définitivement"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
 
                  {/* Brand & Type */}
                  <div>
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">{equip.marque || "TOYOTA"}</p>
                    <p className="text-sm text-slate-800 font-black uppercase tracking-wide">
                      {spec.type}
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold tracking-wider mt-0.5 leading-none bg-slate-100 py-1 px-1.5 w-fit rounded">
                      📋 Usage: {spec.usage}
                    </p>
                  </div>

                  {/* LOTO Lock Details */}
                  {isLotoLocked && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-rose-700 uppercase tracking-widest flex items-center gap-1">
                          🔐 CADENASSÉ (LOTO)
                        </span>
                      </div>
                      <p className="text-[10px] text-rose-800 font-bold uppercase tracking-wider">
                        Responsable: <span className="font-mono text-rose-900 font-black">{lockDetails?.lotoOwner}</span>
                      </p>
                      <p className="text-[10px] text-rose-800 font-bold uppercase tracking-wider">
                        Date de pose: <span className="font-mono text-rose-900 font-black">{lockDetails?.lotoStartedAt ? new Date(lockDetails.lotoStartedAt).toLocaleString('fr-FR') : 'N/A'}</span>
                      </p>
                      {lockDetails?.lotoDetails && (
                        <p className="text-[10px] text-rose-700/85 italic font-bold leading-normal border-t border-rose-100 pt-1 mt-1">
                          Motif: {lockDetails.lotoDetails}
                        </p>
                      )}
                    </div>
                  )}
 
                  {/* Feature badges */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl flex flex-col text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">🚜 Traction</span>
                      <span className="text-sm text-slate-800 font-extrabold font-mono mt-0.5">{spec.traction}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl flex flex-col text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">⛽ Carburant</span>
                      <span className="text-sm text-slate-800 font-extrabold font-mono mt-0.5">{spec.carburant}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl flex flex-col text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">⏱️ Distance</span>
                      <span className="text-sm text-amber-700 font-black font-mono mt-0.5">{kmReading}</span>
                    </div>
                  </div>

                  {/* Availability Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-bold uppercase">Disponibilité</span>
                      <span className={`font-black ${dispoColor}`}>{dispoValue}%</span>
                    </div>
                    <div className="bg-slate-100 rounded-full h-1.5 w-full overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full ${dispoBg}`} 
                        style={{ width: `${dispoValue}%` }} 
                      />
                    </div>
                  </div>

                  {/* LOTO Actions block inside the card */}
                  {["MECANICIEN", "RESPONSABLE_MAINTENANCE", "ADMIN"].includes(user?.role || "") && (
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      {!isLotoLocked ? (
                        <button
                          onClick={() => handleOpenLotoLockModal(equip)}
                          className="w-full text-[10px] font-extrabold uppercase tracking-widest py-1.5 rounded-lg border bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 cursor-pointer shadow-sm flex items-center justify-center gap-1 transition-all"
                        >
                          🔒 Cadenasser (LOTO)
                        </button>
                      ) : (
                        ["RESPONSABLE_MAINTENANCE", "ADMIN"].includes(user?.role || "") && (
                          <button
                            onClick={() => handleOpenLotoUnlockModal(equip)}
                            className="w-full text-[10px] font-extrabold uppercase tracking-widest py-1.5 rounded-lg border bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 cursor-pointer shadow-sm flex items-center justify-center gap-1 transition-all"
                          >
                            🔓 Lever le cadenas
                          </button>
                        )
                      )}
                    </div>
                  )}

                </div>

                {/* Footer actions */}
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
                  <button
                    onClick={() => handleOpenCarnetLocal(equip)}
                    className="text-xs font-black uppercase tracking-wider text-amber-700 hover:text-amber-800 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    Carnet de Santé →
                  </button>
                  <button
                    onClick={() => { setPanneEnginPrefill(equip.id); setIsSignalerPanneOpen(true); }}
                    className="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100/55 cursor-pointer shadow-sm flex items-center gap-1 transition-all"
                  >
                    <AlertTriangle className="h-3 w-3 text-rose-600 animate-pulse" /> Signaler Panne
                  </button>
                </div>
              </Card>
            );
          })}

          {/* Perforateurs Grid Render */}
          {activeTab === "PERFORATEUR" && filteredEquipements.map((equip) => {
            const spec = getPerfSpec(equip.type);
            const isPanne = equip.statut === "panne";
            const serieNo = equip.serie || equip.matricule || "N/A";
            const isLotoLocked = lotoLocks[equip.id]?.statutLOTO === "ACTIF";
            const lockDetails = lotoLocks[equip.id]?.details;

            const borderCol = isLotoLocked 
              ? "border-rose-400 bg-rose-50/10" 
              : isPanne 
                ? "border-rose-200" 
                : equip.statut === "maintenance" 
                  ? "border-amber-200" 
                  : "border-slate-200/80";

            const glowCol = isLotoLocked 
              ? "hover:border-rose-500 hover:shadow-rose-50" 
              : isPanne 
                ? "hover:border-rose-455 hover:shadow-rose-50" 
                : equip.statut === "maintenance" 
                  ? "hover:border-amber-455 hover:shadow-amber-50" 
                  : "hover:border-amber-500/30 hover:shadow-amber-50/50";
            
            const dispoValue = typeof equip.dispo === "number" ? equip.dispo : 100;
            const dispoColor = dispoValue >= 80 ? "text-emerald-500" : dispoValue >= 50 ? "text-amber-500" : "text-rose-500";
            const dispoBg = dispoValue >= 80 ? "bg-emerald-500" : dispoValue >= 50 ? "bg-amber-500" : "bg-rose-500";

            return (
              <Card key={equip.id} className={`border ${borderCol} bg-white ${glowCol} hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden flex flex-col justify-between group`}>
                <div className="p-5 space-y-4">
                  
                  {/* Header metadata */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-1">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-2 flex-shrink-0">
                        <Hammer className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-extrabold text-slate-900 tracking-tight font-mono leading-none mb-1">{equip.matricule}</span>
                        <Badge className="bg-amber-100/50 hover:bg-amber-100/70 text-amber-900 border-none text-[9px] font-black uppercase tracking-wider px-2 py-0.5 w-fit">{equip.site}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {getRefinedStatusBadge(equip.statut)}
 
                      {/* Admin Controls */}
                      {user?.role === "ADMIN" && (
                        <div className="flex items-center gap-1 border-l border-slate-200 pl-2 ml-1">
                          <button
                            onClick={() => handleStartEdit(equip)}
                            className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Modifier l'équipement"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleStartDelete(equip)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Supprimer définitivement"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
 
                  {/* Type */}
                  <div>
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">{equip.marque || "EPIROC"}</p>
                    <p className="text-sm text-slate-800 font-black uppercase tracking-wide">
                      {equip.type || "MONTABERT T23"}
                    </p>
                    {equip.associe ? (
                      <p className="text-[9.5px] text-[#b8860b] font-bold uppercase tracking-wider mt-1.5 font-mono bg-amber-50/50 w-fit px-2 py-0.5 rounded border border-amber-200/20 shadow-sm">
                        🔗 Engin Associé: {equip.associe}
                      </p>
                    ) : (
                      <p className="text-[9.5px] text-slate-400 font-semibold tracking-wider mt-1.5">
                        ⚪ Aucun engin hôte associé
                      </p>
                    )}
                  </div>

                  {/* LOTO Lock Details */}
                  {isLotoLocked && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-rose-700 uppercase tracking-widest flex items-center gap-1">
                          🔐 CADENASSÉ (LOTO)
                        </span>
                      </div>
                      <p className="text-[10px] text-rose-800 font-bold uppercase tracking-wider">
                        Responsable: <span className="font-mono text-rose-900 font-black">{lockDetails?.lotoOwner}</span>
                      </p>
                      <p className="text-[10px] text-rose-800 font-bold uppercase tracking-wider">
                        Date de pose: <span className="font-mono text-rose-900 font-black">{lockDetails?.lotoStartedAt ? new Date(lockDetails.lotoStartedAt).toLocaleString('fr-FR') : 'N/A'}</span>
                      </p>
                      {lockDetails?.lotoDetails && (
                        <p className="text-[10px] text-rose-700/85 italic font-bold leading-normal border-t border-rose-100 pt-1 mt-1">
                          Motif: {lockDetails.lotoDetails}
                        </p>
                      )}
                    </div>
                  )}
 
                  {/* Feature badges */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex flex-col">
                      <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">💨 Pression</span>
                      <span className="text-sm text-slate-800 font-extrabold font-mono mt-0.5">{spec.pression}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex flex-col">
                      <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">📊 Débit & Freq</span>
                      <span className="text-sm text-slate-800 font-extrabold font-mono mt-0.5">{spec.debitFreq}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex flex-col">
                      <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">⚖️ Poids</span>
                      <span className="text-sm text-slate-800 font-extrabold font-mono mt-0.5">{spec.poids}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex flex-col">
                      <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">🔢 S/N Série</span>
                      <span className="text-sm text-amber-700 font-black font-mono mt-0.5 truncate">{serieNo}</span>
                    </div>
                  </div>

                  {/* Availability Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-bold uppercase">Disponibilité</span>
                      <span className={`font-black ${dispoColor}`}>{dispoValue}%</span>
                    </div>
                    <div className="bg-slate-100 rounded-full h-1.5 w-full overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full ${dispoBg}`} 
                        style={{ width: `${dispoValue}%` }} 
                      />
                    </div>
                  </div>

                  {/* LOTO Actions block inside the card */}
                  {["MECANICIEN", "RESPONSABLE_MAINTENANCE", "ADMIN"].includes(user?.role || "") && (
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      {!isLotoLocked ? (
                        <button
                          onClick={() => handleOpenLotoLockModal(equip)}
                          className="w-full text-[10px] font-extrabold uppercase tracking-widest py-1.5 rounded-lg border bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 cursor-pointer shadow-sm flex items-center justify-center gap-1 transition-all"
                        >
                          🔒 Cadenasser (LOTO)
                        </button>
                      ) : (
                        ["RESPONSABLE_MAINTENANCE", "ADMIN"].includes(user?.role || "") && (
                          <button
                            onClick={() => handleOpenLotoUnlockModal(equip)}
                            className="w-full text-[10px] font-extrabold uppercase tracking-widest py-1.5 rounded-lg border bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 cursor-pointer shadow-sm flex items-center justify-center gap-1 transition-all"
                          >
                            🔓 Lever le cadenas
                          </button>
                        )
                      )}
                    </div>
                  )}

                </div>

                {/* Footer action */}
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
                  <button
                    onClick={() => handleOpenCarnetLocal(equip)}
                    className="text-xs font-black uppercase tracking-wider text-amber-700 hover:text-amber-800 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    Carnet de Santé →
                  </button>
                  <button
                    onClick={() => { setPanneEnginPrefill(equip.id); setIsSignalerPanneOpen(true); }}
                    className="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100/55 cursor-pointer shadow-sm flex items-center gap-1 transition-all"
                  >
                    <AlertTriangle className="h-3 w-3 text-rose-600 animate-pulse" /> Signaler Panne
                  </button>
                </div>
              </Card>
            );
          })}

        </div>
      )}
        </>
      )}

      {/* 5. ADD EQUIPMENT MODAL (Polished, category-driven layout) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            
            {/* Modal header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="space-y-0.5">
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-1.5">
                  <Truck className="h-5 w-5 text-amber-500" /> Ajouter un Équipement
                </h3>
                <p className="text-xs text-slate-500 font-medium">Enregistrement réglementaire de l'actif opérationnel</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddEquipment} className="space-y-5">
              
              {/* Category picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">
                  Catégorie de Matériel *
                </label>
                <select
                  className="w-full bg-white border border-slate-200 h-10 px-3 rounded-xl text-xs text-slate-800 font-bold focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-550 cursor-pointer"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                >
                  <option value="LHD">Chargeuse Souterraine (LHD)</option>
                  <option value="VL">Véhicule Léger (VL)</option>
                  <option value="PERFORATEUR">Perforateur de Galerie</option>
                </select>
              </div>

              {/* Shared parameters layer */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Matricule code */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">
                    Code / Matricule *
                  </label>
                  <Input 
                    placeholder="Ex: ST7-01, H-124"
                    className="h-10 border-slate-200 text-xs font-bold focus-visible:ring-amber-500 uppercase font-mono"
                    value={newMatricule}
                    onChange={(e) => setNewMatricule(e.target.value)}
                    required
                  />
                </div>

                {/* Site picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">
                    Chantier / Site *
                  </label>
                  <select
                    className="w-full bg-white border border-slate-200 h-10 px-3 rounded-xl text-xs text-slate-800 font-bold focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-550 cursor-pointer"
                    value={newSite}
                    onChange={(e) => setNewSite(e.target.value)}
                  >
                    {SITES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Dynamic Sub-Category parameter lists */}
              
              {/* Category 1: LHD Specific */}
              {category === "LHD" && (
                <div className="p-4 bg-amber-50/30 border border-amber-200/20 rounded-xl space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    
                    {/* LHD models selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-755 uppercase tracking-widest">
                        Modèle (EPIROC) *
                      </label>
                      <select
                        className="w-full bg-white border border-slate-200 h-10 px-3 rounded-xl text-xs text-slate-800 font-bold focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-550 cursor-pointer"
                        value={lhdType}
                        onChange={(e) => setLhdType(e.target.value as any)}
                      >
                        <option value="ST2G">ST2G (Bucket 3.0t)</option>
                        <option value="ST2D">ST2D (Bucket 3.6t)</option>
                        <option value="ST7">ST7 (Bucket 7.0t)</option>
                      </select>
                    </div>

                    {/* Engine Hours */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-755 uppercase tracking-widest font-mono">
                        Heures Compteur *
                      </label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        className="h-10 border-slate-200 text-xs font-bold focus-visible:ring-amber-550 font-mono"
                        value={lhdHeures || ""}
                        onChange={(e) => setLhdHeures(Math.max(0, Number(e.target.value) || 0))}
                        required
                      />
                    </div>

                  </div>

                  {/* Read-only specs pre-filled banner */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white/70 p-3 rounded-lg border border-slate-100">
                    <div>🪣 Godet: <span className="text-amber-800 font-extrabold font-mono">{ENGIN_SPECS[lhdType].godet}</span></div>
                    <div>⛽ Réservoir: <span className="text-amber-800 font-extrabold font-mono">{ENGIN_SPECS[lhdType].reservoir}</span></div>
                    <div>⚙️ Trans: <span className="text-slate-700 font-mono">{ENGIN_SPECS[lhdType].transmission}</span></div>
                    <div>📏 Hauteur Max: <span className="text-slate-700 font-mono">{ENGIN_SPECS[lhdType].hauteur}</span></div>
                  </div>
                </div>
              )}

              {/* Category 2: VL (Véhicule Léger) Specific */}
              {category === "VL" && (
                <div className="p-4 bg-amber-50/30 border border-amber-200/20 rounded-xl space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    
                    {/* Models selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-755 uppercase tracking-widest">
                        Modèle Véhicule *
                      </label>
                      <select
                        className="w-full bg-white border border-slate-200 h-10 px-3 rounded-xl text-xs text-slate-800 font-bold focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-550 cursor-pointer"
                        value={vlType}
                        onChange={(e) => setVlType(e.target.value as any)}
                      >
                        <option value="Hilux">Toyota Hilux (4x4)</option>
                        <option value="Duster">Dacia Duster (Supervision)</option>
                        <option value="Master">Renault Master (Minibus)</option>
                      </select>
                    </div>

                    {/* Kilometers reading */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-755 uppercase tracking-widest font-mono">
                        Kilométrage *
                      </label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0 km"
                        className="h-10 border-slate-200 text-xs font-bold focus-visible:ring-amber-555 font-mono"
                        value={vlKm || ""}
                        onChange={(e) => setVlKm(Math.max(0, Number(e.target.value) || 0))}
                        required
                      />
                    </div>

                  </div>

                  {/* Read-only specs pre-filled banner */}
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white/70 p-3 rounded-lg border border-slate-100 flex flex-col gap-1.5">
                    <div>🚗 Modèle Recommandé : <span className="text-amber-800 font-extrabold font-mono">{VEHI_SPECS[vlType.toUpperCase()]?.type}</span></div>
                    <div>🛡️ Usage Habituel : <span className="text-slate-700 font-mono">{VEHI_SPECS[vlType.toUpperCase()]?.usage}</span></div>
                    <div>⚡ Traction : <span className="text-slate-700 font-extrabold font-mono">{VEHI_SPECS[vlType.toUpperCase()]?.traction}</span></div>
                  </div>
                </div>
              )}

              {/* Category 3: Perforateur Specific */}
              {category === "PERFORATEUR" && (
                <div className="p-4 bg-amber-50/30 border border-amber-200/20 rounded-xl space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    
                    {/* Models selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-755 uppercase tracking-widest">
                        Modèle de Foreuse *
                      </label>
                      <select
                        className="w-full bg-white border border-slate-200 h-10 px-3 rounded-xl text-xs text-slate-800 font-bold focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-550 cursor-pointer"
                        value={perfModel}
                        onChange={(e) => setPerfModel(e.target.value as any)}
                      >
                        <option value="MONTABERT T23">MONTABERT T23 (23 kg)</option>
                        <option value="MONTABERT T28">MONTABERT T28 (28 kg)</option>
                        <option value="EPIROC COP 1638">EPIROC COP 1638 (28 kg)</option>
                        <option value="EPIROC COP 1838">EPIROC COP 1838 (34 kg)</option>
                      </select>
                    </div>

                    {/* Associated engin code */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-755 uppercase tracking-widest font-mono">
                        Engin Associé (Opt.)
                      </label>
                      <Input
                        placeholder="Ex: ST7-02"
                        className="h-10 border-slate-200 text-xs font-bold focus-visible:ring-amber-555 font-mono uppercase"
                        value={perfAssocie}
                        onChange={(e) => setPerfAssocie(e.target.value)}
                      />
                    </div>

                  </div>

                  {/* Read-only specs banner */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white/70 p-3 rounded-lg border border-slate-100">
                    <div>💨 Pression d'exercice: <span className="text-amber-800 font-extrabold font-mono">{PERF_SPECS[perfModel]?.pression}</span></div>
                    <div>📊 Débit/Fréquence: <span className="text-amber-800 font-extrabold font-mono">{PERF_SPECS[perfModel]?.debitFreq}</span></div>
                    <div>⚖️ Poids unitaire: <span className="text-slate-700 font-mono">{PERF_SPECS[perfModel]?.poids}</span></div>
                    <div className="col-span-2 text-slate-700 normal-case leading-tight italic">
                      🎯 Usage: {PERF_SPECS[perfModel]?.usage}
                    </div>
                  </div>
                </div>
              )}

              {/* Operational status picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">
                  Statut Opérationnel Initial *
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {[
                    { val: "actif", label: "🟢 En service / Actif" },
                    { val: "maintenance", label: "🟡 Planifié / Maintenance" },
                    { val: "panne", label: "🔴 Diagnostic / En Panne" },
                    { val: "hors service", label: "⚪ Arrêté / Hors Service" }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setNewStatut(opt.val as any)}
                      className={`h-10 px-3 text-xs font-bold rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        newStatut === opt.val
                          ? "bg-amber-50 border-amber-500/30 text-amber-800"
                          : "bg-slate-50 border-slate-200/70 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Informative footer text */}
              <div className="p-3 bg-amber-50/50 rounded-xl text-[10px] leading-relaxed text-amber-900 border border-amber-200/40 font-semibold uppercase tracking-wider flex items-start gap-1.5">
                <Info className="h-4 w-4 shrink-0 -mt-0.5 text-amber-700" />
                <span>Tout actif enregistré est rattaché à son carnet de maintenance légal et traçabilité de défauts d'ateliers (HSE-CFR MSHA).</span>
              </div>

              {/* Actions footer */}
              <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 mt-6">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitLoading}
                  className="h-10 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold uppercase tracking-widest text-xs cursor-pointer shadow-sm"
                >
                  {isSubmitLoading ? "Enregistrement..." : "Créer l'actif"}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 5.1. EDIT EQUIPMENT MODAL (Polished, role: ADMIN only) */}
      {isEditModalOpen && editingEquip && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            
            {/* Modal header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="space-y-0.5">
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-1.5 animate-pulse">
                  <Pencil className="h-5 w-5 text-amber-500" /> Modifier l'Équipement
                </h3>
                <p className="text-xs text-slate-500 font-bold">Modification de l'actif opérationnel • {editingEquip.categorie}</p>
              </div>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingEquip(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="space-y-5">
              
              {/* Shared parameters layer */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Matricule code */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">
                    Code / Matricule *
                  </label>
                  <Input 
                    placeholder="Ex: ST7-01, H-124"
                    className="h-10 border-slate-200 text-xs font-bold focus-visible:ring-amber-500 uppercase font-mono"
                    value={editMatricule}
                    onChange={(e) => setEditMatricule(e.target.value)}
                    required
                  />
                </div>

                {/* Site picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">
                    Chantier / Site *
                  </label>
                  <select
                    className="w-full bg-white border border-slate-200 h-10 px-3 rounded-xl text-xs text-slate-800 font-bold focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-550 cursor-pointer"
                    value={editSite}
                    onChange={(e) => setEditSite(e.target.value)}
                  >
                    {SITES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Dynamic inputs based on Categorie */}
              <div className="p-4 bg-amber-50/30 border border-amber-200/20 rounded-xl space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Model / Type field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-755 uppercase tracking-widest">
                      Modèle de l'équipement *
                    </label>
                    {editingEquip.categorie === "LHD" ? (
                      <select
                        className="w-full bg-white border border-slate-200 h-10 px-3 rounded-xl text-xs text-slate-800 font-bold focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-550 cursor-pointer"
                        value={editType}
                        onChange={(e) => setEditType(e.target.value)}
                      >
                        <option value="ST2G">ST2G (Bucket 3.0t)</option>
                        <option value="ST2D">ST2D (Bucket 3.6t)</option>
                        <option value="ST7">ST7 (Bucket 7.0t)</option>
                      </select>
                    ) : editingEquip.categorie === "VL" ? (
                      <select
                        className="w-full bg-white border border-slate-200 h-10 px-3 rounded-xl text-xs text-slate-800 font-bold focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-550 cursor-pointer"
                        value={editType}
                        onChange={(e) => setEditType(e.target.value)}
                      >
                        <option value="Hilux">Toyota Hilux (4x4)</option>
                        <option value="Duster">Dacia Duster (Supervision)</option>
                        <option value="Master">Renault Master (Minibus)</option>
                      </select>
                    ) : (
                      <select
                        className="w-full bg-white border border-slate-200 h-10 px-3 rounded-xl text-xs text-slate-800 font-bold focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-550 cursor-pointer"
                        value={editType}
                        onChange={(e) => setEditType(e.target.value)}
                      >
                        <option value="MONTABERT T23">MONTABERT T23 (23 kg)</option>
                        <option value="MONTABERT T28">MONTABERT T28 (28 kg)</option>
                        <option value="EPIROC COP 1638">EPIROC COP 1638 (28 kg)</option>
                        <option value="EPIROC COP 1838">EPIROC COP 1838 (34 kg)</option>
                      </select>
                    )}
                  </div>

                  {/* Heures counter or Km counter */}
                  {editingEquip.categorie !== "PERFORATEUR" ? (
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-755 uppercase tracking-widest font-mono">
                        {editingEquip.categorie === "VL" ? "Kilométrage *" : "Heures Compteur *"}
                      </label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        className="h-10 border-slate-200 text-xs font-bold focus-visible:ring-amber-550 font-mono"
                        value={editHeures || ""}
                        onChange={(e) => setEditHeures(Math.max(0, Number(e.target.value) || 0))}
                        required
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-755 uppercase tracking-widest font-mono">
                        Engin Associé
                      </label>
                      <Input
                        placeholder="Ex: ST7-02"
                        className="h-10 border-slate-200 text-xs font-bold focus-visible:ring-amber-555 font-mono uppercase"
                        value={editAssocie}
                        onChange={(e) => setEditAssocie(e.target.value)}
                      />
                    </div>
                  )}

                </div>
              </div>

              {/* Operational status picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">
                  Statut Opérationnel *
                </label>
                {editingEquip && lotoLocks[editingEquip.id]?.statutLOTO === "ACTIF" && user?.role !== "ADMIN" && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[10px] leading-relaxed text-rose-850 font-extrabold uppercase tracking-wider flex items-center gap-1.5 mb-2 shadow-sm">
                    <AlertTriangle className="h-4 w-4 text-rose-600 animate-pulse shrink-0" />
                    <span>Cet équipement est cadenassé (LOTO). Le statut ne peut être modifié que par un administrateur.</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {[
                    { val: "actif", label: "🟢 En service / Actif" },
                    { val: "maintenance", label: "🟡 Planifié / Maintenance" },
                    { val: "panne", label: "🔴 Diagnostic / En Panne" },
                    { val: "hors service", label: "⚪ Arrêté / Hors Service" }
                  ].map((opt) => {
                    const isLotoLockedAndNotAdmin = editingEquip && lotoLocks[editingEquip.id]?.statutLOTO === "ACTIF" && user?.role !== "ADMIN";
                    return (
                      <button
                        key={opt.val}
                        type="button"
                        disabled={isLotoLockedAndNotAdmin}
                        onClick={() => setEditStatut(opt.val as any)}
                        className={`h-10 px-3 text-xs font-bold rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isLotoLockedAndNotAdmin
                            ? "opacity-60 bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                            : editStatut === opt.val
                              ? "bg-amber-50 border-amber-500/30 text-amber-800"
                              : "bg-slate-50 border-slate-200/70 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Informative footer text */}
              <div className="p-3 bg-amber-50/50 rounded-xl text-[10px] leading-relaxed text-amber-900 border border-amber-200/40 font-semibold uppercase tracking-wider flex items-start gap-1.5">
                <Info className="h-4 w-4 shrink-0 -mt-0.5 text-amber-700" />
                <span>La modification de cet actif est tracée dans le grand registre de la flotte minière.</span>
              </div>

              {/* Actions footer */}
              <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 mt-6">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingEquip(null);
                  }}
                  className="h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitLoading}
                  className="h-10 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold uppercase tracking-widest text-xs cursor-pointer shadow-sm"
                >
                  {isSubmitLoading ? "Mise à jour..." : "Enregistrer les modifications"}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 5.2. DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-base font-black uppercase text-slate-950 tracking-tight">
                  Supprimer l'Équipement ?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Êtes-vous absolument sûr de vouloir supprimer définitivement l'équipement <span className="font-extrabold text-slate-900 font-mono">{deleteTarget.matricule}</span> ?
                </p>
                <p className="text-[10px] text-rose-700 font-bold uppercase tracking-wider mt-2 bg-rose-50 p-2.5 rounded-xl border border-rose-100/40">
                  ⚠️ Attention : Cette action supprimera définitivement l'engin de la flotte ainsi que tout son carnet d'entretien associé.
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 mt-6">
              <Button 
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteTarget(null);
                }}
                className="h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleConfirmDelete}
                className="h-10 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold uppercase tracking-widest text-xs cursor-pointer shadow-sm"
              >
                Confirmer la suppression
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* 5.3. LOTO ACTION MODAL */}
      {isLotoModalOpen && lotoTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-amber-100 animate-in fade-in zoom-in-95 duration-150">
            
            <form onSubmit={handleLotoSubmit}>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                  {lotoMode === "LOCK" ? (
                    <span className="text-xl">🔒</span>
                  ) : (
                    <span className="text-xl">🔓</span>
                  )}
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="text-base font-black uppercase text-slate-950 tracking-tight">
                    {lotoMode === "LOCK" ? "Cadenasser l'Équipement (LOTO)" : "Lever le Cadenas (LOTO)"}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    {lotoMode === "LOCK" 
                      ? `Verrouillage de sécurité haute-criticité pour l'équipement `
                      : `Validation superviseur pour lever le cadenas de l'équipement `}
                    <span className="font-extrabold text-slate-900 font-mono">{lotoTarget.matricule}</span>.
                  </p>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">
                    {lotoMode === "LOCK" ? "Motif / Détails du cadenassage *" : "Motif / Détails de la levée *"}
                  </label>
                  <textarea
                    required
                    value={lotoDetailsInput}
                    onChange={(e) => setLotoDetailsInput(e.target.value)}
                    placeholder={lotoMode === "LOCK" 
                      ? "Ex: Remplacement du flexible de direction principal en cours. Interdiction formelle de démarrer le moteur."
                      : "Ex: Travaux terminés, pression hydraulique purgée, essais à blanc concluants."}
                    className="w-full min-h-[100px] p-3 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium focus:bg-white focus:outline-none focus:border-amber-500/50 transition-all"
                  />
                </div>

                <div className="p-3 bg-rose-50/50 rounded-xl text-[10px] leading-relaxed text-rose-950 border border-rose-200/40 font-extrabold uppercase tracking-wider flex items-start gap-1.5">
                  <Info className="h-4 w-4 shrink-0 mt-0.5 text-rose-700" />
                  <span>
                    {lotoMode === "LOCK"
                      ? "ATTENTION : Le cadenassage LOTO bloque toute modification de statut de cet équipement sur l'ensemble de l'application."
                      : "ATTENTION : La levée du cadenas LOTO confirme que l'équipement est sécurisé pour reprendre du service ou retourner en maintenance normale."}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 mt-6">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsLotoModalOpen(false);
                    setLotoTarget(null);
                    setLotoDetailsInput("");
                  }}
                  className="h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitLoading}
                  className={`h-10 px-6 rounded-xl text-white font-extrabold uppercase tracking-widest text-xs cursor-pointer shadow-sm ${
                    lotoMode === "LOCK" ? "bg-rose-600 hover:bg-rose-700 animate-pulse" : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {isSubmitLoading ? "Traitement..." : lotoMode === "LOCK" ? "Activer le verrou LOTO" : "Confirmer la levée"}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

      <SignalerPanne 
        isOpen={isSignalerPanneOpen} 
        onClose={() => setIsSignalerPanneOpen(false)}
        enginIdPrefill={panneEnginPrefill}
      />

    </div>
  );
}
