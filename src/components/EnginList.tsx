import * as React from "react";
import { 
  Search, 
  Plus, 
  ChevronRight,
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
  Trash2
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
import { collection, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { useCollection } from "@/hooks/useCollection";
import { PageBanner } from "@/components/ui/PageBanner";
import { CarnetSante } from "@/components/CarnetSante";

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
  dispo: number;
}

interface EnginListProps {
  onOpenCarnet?: (engin: any) => void;
}

export function EnginList({ onOpenCarnet }: EnginListProps = {}) {
  const { user, activeSite } = useAuthStore();
  const canAddEngin = ["ADMIN", "SECRETAIRE", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER"].includes(user?.role || "");

  // Load equipements from Firestore
  const { data: allEquipements, loading } = useCollection<any>("engins");

  // State
  const [activeTab, setActiveTab] = React.useState<"LHD" | "VL" | "PERFORATEUR" | "CARNET">("LHD");
  const [carnetEnginId, setCarnetEnginId] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = React.useState(false);

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
    setEditHeures(equip.heures || equip.km || 0);
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
      const docRef = doc(db, "engins", deleteTarget.id);
      await deleteDoc(docRef);
      toast.success(`Équipement ${deleteTarget.matricule} supprimé définitivement !`);
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error deleting equipment:", err);
      toast.error("Erreur lors de la suppression de l'équipement.");
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
      const docRef = doc(db, "engins", editingEquip.id);
      
      let updatedData: any = {
        matricule: editMatricule.toUpperCase().trim(),
        site: editSite,
        siteId: editSite,
        statut: editStatut,
        dispo: editStatut === "actif" ? 100 : 0,
        type: editType,
        updatedAt: new Date().toISOString()
      };

      if (editingEquip.categorie === "LHD") {
        const specs = ENGIN_SPECS[editType] || ENGIN_SPECS.ST2G;
        updatedData.heures = Number(editHeures) || 0;
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

      await updateDoc(docRef, updatedData);
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

    try {
      let docData: any = {
        matricule: newMatricule.toUpperCase().trim(),
        site: newSite,
        siteId: newSite,
        statut: newStatut,
        dispo: newStatut === "actif" ? 100 : 0,
        categorie: category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false
      };

      if (category === "LHD") {
        const specs = ENGIN_SPECS[lhdType];
        docData.type = lhdType;
        docData.marque = "EPIROC";
        docData.heures = Number(lhdHeures) || 0;
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
        docData.serie = newMatricule.toUpperCase().trim();
        docData.associe = perfAssocie.trim() ? perfAssocie.toUpperCase().trim() : "";
        docData.specs = {
          pression: specs.pression,
          debitFreq: specs.debitFreq,
          poids: specs.poids,
          usage: specs.usage
        };
      }

      await addDoc(collection(db, "engins"), docData);
      toast.success(`Équipement ${newMatricule.toUpperCase()} ajouté avec succès !`);

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
      const docRef = doc(db, "engins", id);
      await updateDoc(docRef, { statut: "panne", dispo: 0 });
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
    return (allEquipements || []).filter((e) => {
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
      const query = searchTerm.toLowerCase().trim();
      const searchMatch = !query || 
        (e.matricule || "").toLowerCase().includes(query) ||
        (e.type || "").toLowerCase().includes(query) ||
        (e.marque || "").toLowerCase().includes(query) ||
        (e.site || "").toLowerCase().includes(query);

      return siteMatch && catMatch && searchMatch;
    });
  }, [allEquipements, activeSite, activeTab, searchTerm]);

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
      
      {/* 1. Page Banner - Hide when Carnet de Sante is active */}
      {activeTab !== "CARNET" && (
        <PageBanner
          icon={Truck}
          badgeLabel="Parc Équipements — 5 Chantiers Miniers"
          title="État de la Flotte"
          subtitle="Surveillance opérationnelle des engins, véhicules et perforateurs souterrains"
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

      {/* 2. Custom horizontal tabs - styled like Suivi Magasinier */}
      <div className="flex flex-wrap gap-2 justify-center border-b border-slate-100 pb-3">
        {tabItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-slate-200 rounded-xl bg-white shadow-sm">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher par matricule, type, marque, site..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 border-slate-200 focus-visible:ring-amber-500 text-xs font-medium"
              />
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 leading-none whitespace-nowrap">
              📋 {filteredEquipements.length} Équipement(s) trouvé(s)
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
        <div className="text-center py-24 border border-dashed border-slate-200 rounded-2xl bg-white space-y-2">
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Aucun équipement disponible</p>
          <p className="text-xs text-slate-400">Essayez de modifier vos critères de recherche ou de site.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* LHD Grid Render */}
          {activeTab === "LHD" && filteredEquipements.map((equip) => {
            const spec = ENGIN_SPECS[equip.type as string] || ENGIN_SPECS.ST2G;
            const isPanne = equip.statut === "panne";
            const borderCol = isPanne ? "border-rose-200" : equip.statut === "maintenance" ? "border-amber-200" : "border-slate-200/80";
            const glowCol = isPanne ? "hover:border-rose-455 hover:shadow-rose-50" : equip.statut === "maintenance" ? "hover:border-amber-455 hover:shadow-amber-50" : "hover:border-amber-500/30 hover:shadow-amber-50/50";
            return (
              <Card key={equip.id} className={`border ${borderCol} bg-white ${glowCol} hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden flex flex-col justify-between group`}>
                <div className="p-5 space-y-4">
                  
                  {/* Header metadata */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-slate-900 tracking-tight font-mono">{equip.matricule}</span>
                      <Badge className="bg-amber-100/50 hover:bg-amber-100/70 text-amber-900 border-none text-[9px] font-black uppercase tracking-wider px-2 py-0.5">{equip.site}</Badge>
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

                  {/* Feature badges */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl flex flex-col text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">🪣 Godet</span>
                      <span className="text-[11px] text-slate-800 font-extrabold font-mono mt-0.5">{spec.godet}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl flex flex-col text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">⛽ Réservoir</span>
                      <span className="text-[11px] text-slate-800 font-extrabold font-mono mt-0.5">{spec.reservoir}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl flex flex-col text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">⏱️ Heures</span>
                      <span className="text-[11px] text-amber-700 font-black font-mono mt-0.5">{equip.heures || 0} h</span>
                    </div>
                  </div>
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
                    disabled={isPanne}
                    onClick={() => handleDeclarePanne(equip.id, equip.matricule)}
                    className={`text-xs font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all duration-155 ${
                      isPanne
                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                        : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100/55 cursor-pointer shadow-sm"
                    }`}
                  >
                    {isPanne ? "En Panne" : "Déclarer Panne"}
                  </button>
                </div>
              </Card>
            );
          })}

          {/* Véhicules Légers Grid Render */}
          {activeTab === "VL" && filteredEquipements.map((equip) => {
            const spec = getVehiSpec(equip.type);
            const isPanne = equip.statut === "panne";
            const kmReading = equip.heures ? `${equip.heures} km` : (equip.km ? `${equip.km} km` : "0 km");
            const borderCol = isPanne ? "border-rose-200" : equip.statut === "maintenance" ? "border-amber-200" : "border-slate-200/80";
            const glowCol = isPanne ? "hover:border-rose-455 hover:shadow-rose-50" : equip.statut === "maintenance" ? "hover:border-amber-455 hover:shadow-amber-50" : "hover:border-amber-500/30 hover:shadow-amber-50/50";
            return (
              <Card key={equip.id} className={`border ${borderCol} bg-white ${glowCol} hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden flex flex-col justify-between group`}>
                <div className="p-5 space-y-4">
                  
                  {/* Header metadata */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-slate-900 tracking-tight font-mono">{equip.matricule}</span>
                      <Badge className="bg-amber-100/50 hover:bg-amber-100/70 text-amber-900 border-none text-[9px] font-black uppercase tracking-wider px-2 py-0.5">{equip.site}</Badge>
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

                  {/* Feature badges */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl flex flex-col text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">🚜 Traction</span>
                      <span className="text-[11px] text-slate-800 font-extrabold font-mono mt-0.5">{spec.traction}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl flex flex-col text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">⛽ Carburant</span>
                      <span className="text-[11px] text-slate-800 font-extrabold font-mono mt-0.5">{spec.carburant}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl flex flex-col text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">⏱️ Distance</span>
                      <span className="text-[11px] text-amber-700 font-black font-mono mt-0.5">{kmReading}</span>
                    </div>
                  </div>
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
                    disabled={isPanne}
                    onClick={() => handleDeclarePanne(equip.id, equip.matricule)}
                    className={`text-xs font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all duration-155 ${
                      isPanne
                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                        : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100/55 cursor-pointer shadow-sm"
                    }`}
                  >
                    {isPanne ? "En Panne" : "Déclarer Panne"}
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
            const borderCol = isPanne ? "border-rose-200" : equip.statut === "maintenance" ? "border-amber-200" : "border-slate-200/80";
            const glowCol = isPanne ? "hover:border-rose-455 hover:shadow-rose-50" : equip.statut === "maintenance" ? "hover:border-amber-455 hover:shadow-amber-50" : "hover:border-amber-500/30 hover:shadow-amber-50/50";
            return (
              <Card key={equip.id} className={`border ${borderCol} bg-white ${glowCol} hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden flex flex-col justify-between group`}>
                <div className="p-5 space-y-4">
                  
                  {/* Header metadata */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-slate-900 tracking-tight font-mono">{equip.matricule}</span>
                      <Badge className="bg-amber-100/50 hover:bg-amber-100/70 text-amber-900 border-none text-[9px] font-black uppercase tracking-wider px-2 py-0.5">{equip.site}</Badge>
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

                  {/* Feature badges */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex flex-col">
                      <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">💨 Pression</span>
                      <span className="text-[11px] text-slate-800 font-extrabold font-mono mt-0.5">{spec.pression}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex flex-col">
                      <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">📊 Débit & Freq</span>
                      <span className="text-[11px] text-slate-800 font-extrabold font-mono mt-0.5">{spec.debitFreq}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex flex-col">
                      <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">⚖️ Poids</span>
                      <span className="text-[11px] text-slate-800 font-extrabold font-mono mt-0.5">{spec.poids}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex flex-col">
                      <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">🔢 S/N Série</span>
                      <span className="text-[11px] text-amber-700 font-black font-mono mt-0.5 truncate">{serieNo}</span>
                    </div>
                  </div>
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
                    disabled={isPanne}
                    onClick={() => handleDeclarePanne(equip.id, equip.matricule)}
                    className={`text-xs font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all duration-155 ${
                      isPanne
                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                        : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100/55 cursor-pointer shadow-sm"
                    }`}
                  >
                    {isPanne ? "En Panne" : "Déclarer Panne"}
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
                      onClick={() => setEditStatut(opt.val as any)}
                      className={`h-10 px-3 text-xs font-bold rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        editStatut === opt.val
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

    </div>
  );
}

// ════════════════════════════════════
// PARTIE 9 — COMPOSANT ENGIN DETAIL CONSERVÉ TEL QUEL
// ════════════════════════════════════
function EnginDetail({ engin, onBack }: { engin: Engin; onBack: () => void }) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground">
          Engins
        </Button>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{engin.matricule}</span>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-hydro flex items-center justify-center text-white shadow-lg shadow-hydro/20">
             <Truck className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{engin.matricule}</h2>
            <p className="text-muted-foreground">{engin.marque} {engin.modele} • {engin.site}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline">Générer Rapport</Button>
           <Button className="bg-mines hover:bg-mines/90">Signaler Panne</Button>
        </div>
      </div>

      <Tabs defaultValue="resume" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="resume">Résumé</TabsTrigger>
          <TabsTrigger value="conso">Conso</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="pannes">Pannes</TabsTrigger>
          <TabsTrigger value="pneus">Pneus</TabsTrigger>
          <TabsTrigger value="historique">Historique</TabsTrigger>
          <TabsTrigger value="docs">Docs</TabsTrigger>
          <TabsTrigger value="ia" className="text-hydro font-bold">IA Analyse</TabsTrigger>
        </TabsList>
        <TabsContent value="resume" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm font-medium">Disponibilité</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-ok-green">{engin.dispo}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm font-medium">Heures Travail</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{engin.heures} h</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm font-medium">Cout Total</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.4 M F CFA</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm font-medium">Statut</CardTitle></CardHeader>
              <CardContent>
                <Badge className={engin.statut === 'actif' ? 'bg-ok-green' : 'bg-alert-orange'}>{engin.statut}</Badge>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
             <Card>
               <CardHeader><CardTitle>Dernières Activités</CardTitle></CardHeader>
               <CardContent>
                  <div className="space-y-4">
                     {[1, 2, 3].map(i => (
                       <div key={i} className="flex gap-4 items-start">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                             <History className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Saisie d'heures - Poste Jour</p>
                            <p className="text-xs text-muted-foreground">Il y a 3 heures par Alice (Secrétaire)</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </CardContent>
             </Card>
             <Card>
               <CardHeader><CardTitle>Entretien Proche (IA)</CardTitle></CardHeader>
               <CardContent>
                  <div className="p-4 rounded-xl bg-hydro/5 border border-hydro/20 flex flex-col gap-3">
                     <div className="flex items-center gap-2 text-hydro font-bold">
                        <Cpu className="h-5 w-5" />
                        <span>Suggestion IA</span>
                     </div>
                     <p className="text-sm">L'engin atteint bientôt les 5000h. Prévoir une vidange complète et vérification du système hydraulique.</p>
                     <Button size="sm" className="w-fit bg-hydro">Planifier</Button>
                  </div>
               </CardContent>
             </Card>
          </div>
        </TabsContent>
        {/* Fill other tabs as needed or with placeholders */}
        <TabsContent value="ia" className="pt-4">
           <Card className="border-hydro/30 shadow-lg shadow-hydro/10">
              <CardHeader className="bg-hydro text-white rounded-t-xl">
                 <CardTitle className="flex items-center gap-2">
                   <Cpu className="h-6 w-6" />
                   Analyse Prédictive IA - {engin.matricule}
                 </CardTitle>
                 <CardDescription className="text-hydro-foreground/80">Diagnostic avancé basé sur l'historique et les capteurs</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                 <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-xl space-y-2">
                       <h4 className="font-bold flex items-center gap-2 text-alert-orange">
                          <Activity className="h-4 w-4" /> Risques Détectés
                       </h4>
                       <p className="text-sm text-muted-foreground">Surconsommation de 5% observée sur les 3 derniers postes. Possible encrassement filtres.</p>
                    </div>
                    <div className="p-4 border rounded-xl space-y-2">
                       <h4 className="font-bold flex items-center gap-2 text-ok-green">
                          <Disc className="h-4 w-4" /> État Pneus
                       </h4>
                       <p className="text-sm text-muted-foreground">Usure uniforme. Fin de vie estimée dans 800h.</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                     <label className="text-sm font-medium">Poser une question spécifique à l'IA :</label>
                     <div className="flex gap-2">
                        <Input placeholder="Pourquoi la consommation a augmenté ?" />
                        <Button className="bg-hydro">Analyser</Button>
                     </div>
                  </div>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
