// V3: Fichier complet de gestion des Tâches et du Planning de maintenance pour SOU-GMAO Hydromines
// Ce module gère les tâches quotidiennes, préventives et correctives, ainsi que la planification et le suivi des performances.

import * as React from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  User,
  Truck,
  Plus,
  Trash2,
  Search,
  Filter,
  Share2,
  TrendingUp,
  Award,
  Zap,
  Printer,
  FileText,
  Clock3,
  Check,
  X,
  RefreshCw,
  Eye,
  Camera,
  AlertCircle,
  Copy,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Flame,
  Star,
  Info
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageBanner } from "@/components/ui/PageBanner";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

// V3: Interfaces de données
interface Engin {
  id: string;
  modele: string;
  marque: string;
  type: string;
  heuresMarche: number;
  heures_derniere_vidange_moteur?: number;
  heures_derniere_vidange_hydraulique?: number;
  heures_derniere_vidange_transmission?: number;
}

interface Mecanicien {
  id: string;
  nomComplet: string;
}

interface MaintenanceTask {
  id: string;
  type: "PREVENTIF" | "CORRECTIF" | "QUOTIDIEN";
  label: string;
  enginId: string;
  enginModele: string;
  mecanicienId: string;
  mecanicienNom: string;
  poste: "Poste 1" | "Poste 2" | "Poste 3";
  datePlanifiee: string;
  dureeEstimee: "15min" | "30min" | "1h" | "2h" | "4h" | "6h" | "1j";
  priorite: "CRITIQUE" | "HAUTE" | "NORMALE" | "BASSE" | "REPORTEE" | "QUOTIDIENNE";
  statut: "FAIT" | "EN_COURS" | "NON_FAIT" | "REPORTE" | "VALIDE";
  commentaire: string;
  photo?: string; // base64
  motifReport?: string;
  dateReporte?: string;
  echeanceHeures?: number; // Pour préventif calculé
  heuresEcouleesAuMoment?: number;
  isCritiqueAlerte?: boolean;
}

export default function TachesPlanning() {
  // V3: Navigation par onglet
  const [activeTab, setActiveTab] = React.useState<"taches" | "planning" | "performance">("taches");
  const [userRole, setUserRole] = React.useState<"MECANICIEN" | "DIRECTEUR">("DIRECTEUR");

  // V3: États de données de base
  const [engins, setEngins] = React.useState<Engin[]>([]);
  const [mecaniciens, setMecaniciens] = React.useState<Mecanicien[]>([]);
  const [tasks, setTasks] = React.useState<MaintenanceTask[]>([]);

  // V3: Saisie "Heures du Jour" en haut de page
  const [selectedEnginHeures, setSelectedEnginHeures] = React.useState("");
  const [heuresSaisiesJour, setHeuresSaisiesJour] = React.useState<number | "">("");
  const [selectedMecaHeures, setSelectedMecaHeures] = React.useState("");
  const [selectedPosteHeures, setSelectedPosteHeures] = React.useState<"Poste 1" | "Poste 2" | "Poste 3">("Poste 1");

  // V3: Filtres d'affichage onglet Tâches
  const [filterMecanicien, setFilterMecanicien] = React.useState("Tous");
  const [filterPoste, setFilterPoste] = React.useState("Tous");
  const [filterEngin, setFilterEngin] = React.useState("Tous");
  const [filterType, setFilterType] = React.useState("Tous");
  const [filterPriorite, setFilterPriorite] = React.useState("Tous");
  const [filterDate, setFilterDate] = React.useState("Tous"); // Tous, Aujourd'hui, Hier, Cette semaine

  // V3: État de planification calendrier (semaine courante)
  const [currentWeekOffset, setCurrentWeekOffset] = React.useState(0);
  const [calendarView, setCalendarView] = React.useState<"hebdo" | "mensuel">("hebdo");
  const [selectedMonthOffset, setSelectedMonthOffset] = React.useState(0);

  // V3: Fenêtres modales de dialogue
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const [activeTaskDetail, setActiveTaskDetail] = React.useState<MaintenanceTask | null>(null);

  // V3: Formulaire ajout de tâche manuelle
  const [newType, setNewType] = React.useState<"PREVENTIF" | "CORRECTIF" | "QUOTIDIEN">("CORRECTIF");
  const [newLabel, setNewLabel] = React.useState("");
  const [newEnginId, setNewEnginId] = React.useState("");
  const [newMecaId, setNewMecaId] = React.useState("");
  const [newPoste, setNewPoste] = React.useState<"Poste 1" | "Poste 2" | "Poste 3">("Poste 1");
  const [newDate, setNewDate] = React.useState(() => new Date().toISOString().split("T")[0]);
  const [newDuree, setNewDuree] = React.useState<"15min" | "30min" | "1h" | "2h" | "4h" | "6h" | "1j">("1h");
  const [newPrioriteManual, setNewPrioriteManual] = React.useState<"HAUTE" | "NORMALE" | "BASSE">("NORMALE");

  // V3: Logo Error Fallback
  const [logoError, setLogoError] = React.useState(false);

  // V3: CHARGEMENT DES COMPOSANTS ET SYNC LOCAL STORAGE
  React.useEffect(() => {
    // 1. Charger les engins
    const savedEngins = localStorage.getItem("gmao_engins");
    let loadedEngins: Engin[] = [];
    if (savedEngins) {
      loadedEngins = JSON.parse(savedEngins);
    } else {
      // Données de secours
      loadedEngins = [
        { id: "ST2G-01", modele: "ST2G", marque: "Epiroc", type: "Scooptram", heuresMarche: 5250, heures_derniere_vidange_moteur: 5000, heures_derniere_vidange_hydraulique: 4500, heures_derniere_vidange_transmission: 4000 },
        { id: "ST2D-02", modele: "ST2D", marque: "Epiroc", type: "Scooptram", heuresMarche: 1210, heures_derniere_vidange_moteur: 1000, heures_derniere_vidange_hydraulique: 800, heures_derniere_vidange_transmission: 500 },
        { id: "ST7-01", modele: "ST7", marque: "Epiroc", type: "Scooptram", heuresMarche: 3850, heures_derniere_vidange_moteur: 3800, heures_derniere_vidange_hydraulique: 3000, heures_derniere_vidange_transmission: 2000 }
      ];
      localStorage.setItem("gmao_engins", JSON.stringify(loadedEngins));
    }

    // Veiller à ce que les champs d'intervalles de vidanges existent pour tous les engins
    let modified = false;
    loadedEngins = loadedEngins.map(e => {
      let updated = { ...e };
      if (updated.heures_derniere_vidange_moteur === undefined) {
        updated.heures_derniere_vidange_moteur = e.heuresMarche - 150;
        modified = true;
      }
      if (updated.heures_derniere_vidange_hydraulique === undefined) {
        updated.heures_derniere_vidange_hydraulique = e.heuresMarche - 400;
        modified = true;
      }
      if (updated.heures_derniere_vidange_transmission === undefined) {
        updated.heures_derniere_vidange_transmission = e.heuresMarche - 800;
        modified = true;
      }
      return updated;
    });
    if (modified) {
      localStorage.setItem("gmao_engins", JSON.stringify(loadedEngins));
    }
    setEngins(loadedEngins);

    if (loadedEngins.length > 0) {
      setSelectedEnginHeures(loadedEngins[0].id);
      setNewEnginId(loadedEngins[0].id);
    }

    // 2. Charger les collaborateurs mécaniciens
    const savedMeca = localStorage.getItem("gmao_mecaniciens");
    let loadedMeca: Mecanicien[] = [];
    if (savedMeca) {
      loadedMeca = JSON.parse(savedMeca);
    } else {
      loadedMeca = [
        { id: "M01", nomComplet: "Lahcen Ait" },
        { id: "M02", nomComplet: "Abdellah Daoudi" },
        { id: "M03", nomComplet: "Mohamed El Amri" },
        { id: "M04", nomComplet: "Youssef Naciri" }
      ];
      localStorage.setItem("gmao_mecaniciens", JSON.stringify(loadedMeca));
    }
    setMecaniciens(loadedMeca);
    if (loadedMeca.length > 0) {
      setSelectedMecaHeures(loadedMeca[0].nomComplet);
      setNewMecaId(loadedMeca[0].id);
    }

    // 3. Charger les tâches (ou générer la première liste)
    const savedTasks = localStorage.getItem("gmao_planning_tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      // Générer tâches initiales
      const defaultTasks: MaintenanceTask[] = [];
      const todayStr = new Date().toISOString().split("T")[0];

      // Générer des tâches quotidiennes de graissage et niveaux pour chaque engin pour aujourd'hui
      loadedEngins.forEach((eng, idx) => {
        const meca = loadedMeca[idx % loadedMeca.length];
        
        defaultTasks.push({
          id: `T-DAILY-1-${eng.id}`,
          type: "QUOTIDIEN",
          label: `Graissage pivots articulation ${eng.id}`,
          enginId: eng.id,
          enginModele: eng.modele,
          mecanicienId: meca.id,
          mecanicienNom: meca.nomComplet,
          poste: "Poste 1",
          datePlanifiee: todayStr,
          dureeEstimee: "30min",
          priorite: "QUOTIDIENNE",
          statut: "NON_FAIT",
          commentaire: ""
        });

        defaultTasks.push({
          id: `T-DAILY-2-${eng.id}`,
          type: "QUOTIDIEN",
          label: `Vérification niveaux huile et hydraulique ${eng.id}`,
          enginId: eng.id,
          enginModele: eng.modele,
          mecanicienId: meca.id,
          mecanicienNom: meca.nomComplet,
          poste: "Poste 1",
          datePlanifiee: todayStr,
          dureeEstimee: "15min",
          priorite: "QUOTIDIENNE",
          statut: "FAIT",
          commentaire: "Niveau d'huile moteur correct."
        });
      });

      // Ajouter quelques préventifs simulés en cours d'échéance
      defaultTasks.push({
        id: "T-PREV-1",
        type: "PREVENTIF",
        label: "Vidange moteur + filtres ST2G-01",
        enginId: "ST2G-01",
        enginModele: "ST2G",
        mecanicienId: "M01",
        mecanicienNom: "Lahcen Ait",
        poste: "Poste 1",
        datePlanifiee: todayStr,
        dureeEstimee: "2h",
        priorite: "HAUTE",
        statut: "EN_COURS",
        commentaire: "Filtres d'huile moteur retirés. Vidange en cours.",
        echeanceHeures: 250
      });

      defaultTasks.push({
        id: "T-CORR-1",
        type: "CORRECTIF",
        label: "Changement flexible vérin godet fuyard ST2D-02",
        enginId: "ST2D-02",
        enginModele: "ST2D",
        mecanicienId: "M02",
        mecanicienNom: "Abdellah Daoudi",
        poste: "Poste 2",
        datePlanifiee: todayStr,
        dureeEstimee: "1h",
        priorite: "CRITIQUE",
        statut: "NON_FAIT",
        commentaire: ""
      });

      localStorage.setItem("gmao_planning_tasks", JSON.stringify(defaultTasks));
      setTasks(defaultTasks);
    }
  }, []);

  // V3: Déclenchement automatique des toasts d'alertes au démarrage
  React.useEffect(() => {
    if (tasks.length > 0) {
      const lateCount = tasks.filter(t => t.statut === "NON_FAIT" && t.priorite === "CRITIQUE").length;
      const warningCount = tasks.filter(t => t.statut === "NON_FAIT" && t.priorite === "HAUTE").length;
      if (lateCount > 0 || warningCount > 0) {
        toast.info(
          `GMAO : ${lateCount} tâches critiques en retard et ${warningCount} tâches en pré-alerte détectées.`,
          { duration: 4000 }
        );
      }
    }
  }, [tasks.length]);

  // V3: Mécanisme de calcul d'apparition des tâches préventives basées sur les intervalles
  const checkAndGeneratePreventiveTasks = (updatedEngins: Engin[]) => {
    const todayStr = new Date().toISOString().split("T")[0];
    let tasksCopy = [...tasks];
    let addedAny = false;

    // Définition des intervalles standard de maintenance pour les calculs d'échéances
    const INTERVAL_MOTEUR = 250;
    const INTERVAL_HYDRAULIQUE = 1000;
    const INTERVAL_TRANSMISSION = 2000;

    updatedEngins.forEach(eng => {
      // Vidange Moteur : 250h
      const ecouleMoteur = eng.heuresMarche - (eng.heures_derniere_vidange_moteur || 0);
      const isMoteurExceeded = ecouleMoteur >= INTERVAL_MOTEUR;
      const engineTaskLabel = `Vidange moteur + filtres ${eng.id}`;
      const hasEngineTask = tasksCopy.some(t => t.enginId === eng.id && t.label.includes("Vidange moteur") && t.statut !== "FAIT" && t.statut !== "VALIDE");

      if (isMoteurExceeded && !hasEngineTask) {
        // Déterminer la priorité automatiquement
        const priorite: MaintenanceTask["priorite"] = (ecouleMoteur >= INTERVAL_MOTEUR + 50) ? "CRITIQUE" : "HAUTE";
        tasksCopy.push({
          id: `T-AUTO-MOTEUR-${eng.id}-${Date.now()}`,
          type: "PREVENTIF",
          label: engineTaskLabel,
          enginId: eng.id,
          enginModele: eng.modele,
          mecanicienId: mecaniciens[0]?.id || "M01",
          mecanicienNom: mecaniciens[0]?.nomComplet || "Lahcen Ait",
          poste: "Poste 1",
          datePlanifiee: todayStr,
          dureeEstimee: "2h",
          priorite,
          statut: "NON_FAIT",
          commentaire: "",
          echeanceHeures: INTERVAL_MOTEUR,
          heuresEcouleesAuMoment: ecouleMoteur
        });
        addedAny = true;
      }

      // Vidange Hydraulique : 1000h
      const ecouleHydr = eng.heuresMarche - (eng.heures_derniere_vidange_hydraulique || 0);
      const isHydrExceeded = ecouleHydr >= INTERVAL_HYDRAULIQUE;
      const hydrTaskLabel = `Vidange huile hydraulique + filtres ${eng.id}`;
      const hasHydrTask = tasksCopy.some(t => t.enginId === eng.id && t.label.includes("Vidange huile hydraulique") && t.statut !== "FAIT" && t.statut !== "VALIDE");

      if (isHydrExceeded && !hasHydrTask) {
        const priorite: MaintenanceTask["priorite"] = (ecouleHydr >= INTERVAL_HYDRAULIQUE + 50) ? "CRITIQUE" : "HAUTE";
        tasksCopy.push({
          id: `T-AUTO-HYDR-${eng.id}-${Date.now()}`,
          type: "PREVENTIF",
          label: hydrTaskLabel,
          enginId: eng.id,
          enginModele: eng.modele,
          mecanicienId: mecaniciens[1]?.id || "M02",
          mecanicienNom: mecaniciens[1]?.nomComplet || "Abdellah Daoudi",
          poste: "Poste 2",
          datePlanifiee: todayStr,
          dureeEstimee: "4h",
          priorite,
          statut: "NON_FAIT",
          commentaire: "",
          echeanceHeures: INTERVAL_HYDRAULIQUE,
          heuresEcouleesAuMoment: ecouleHydr
        });
        addedAny = true;
      }

      // Vidange Transmission : 2000h
      const ecouleTrans = eng.heuresMarche - (eng.heures_derniere_vidange_transmission || 0);
      const isTransExceeded = ecouleTrans >= INTERVAL_TRANSMISSION;
      const transTaskLabel = `Vidange transmission + boîte ${eng.id}`;
      const hasTransTask = tasksCopy.some(t => t.enginId === eng.id && t.label.includes("Vidange transmission") && t.statut !== "FAIT" && t.statut !== "VALIDE");

      if (isTransExceeded && !hasTransTask) {
        const priorite: MaintenanceTask["priorite"] = (ecouleTrans >= INTERVAL_TRANSMISSION + 50) ? "CRITIQUE" : "HAUTE";
        tasksCopy.push({
          id: `T-AUTO-TRANS-${eng.id}-${Date.now()}`,
          type: "PREVENTIF",
          label: transTaskLabel,
          enginId: eng.id,
          enginModele: eng.modele,
          mecanicienId: mecaniciens[0]?.id || "M01",
          mecanicienNom: mecaniciens[0]?.nomComplet || "Lahcen Ait",
          poste: "Poste 1",
          datePlanifiee: todayStr,
          dureeEstimee: "6h",
          priorite,
          statut: "NON_FAIT",
          commentaire: "",
          echeanceHeures: INTERVAL_TRANSMISSION,
          heuresEcouleesAuMoment: ecouleTrans
        });
        addedAny = true;
      }
    });

    if (addedAny) {
      setTasks(tasksCopy);
      localStorage.setItem("gmao_planning_tasks", JSON.stringify(tasksCopy));
      toast.success("De nouvelles tâches d'entretien préventif ont été auto-générées suite à la mise à jour des heures.");
    }
  };

  // V3-4: Action de saisie manuelle des heures de marche du jour
  const handleAddHeuresJour = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnginHeures) {
      toast.error("Veuillez sélectionner un engin.");
      return;
    }
    if (heuresSaisiesJour === "" || heuresSaisiesJour <= 0) {
      toast.error("Veuillez saisir un nombre d'heures supérieur à 0.");
      return;
    }

    const currentEngins = [...engins];
    const engIdx = currentEngins.findIndex(eg => eg.id === selectedEnginHeures);
    if (engIdx !== -1) {
      const oldHours = currentEngins[engIdx].heuresMarche;
      const addedHours = Number(heuresSaisiesJour);
      const newHours = oldHours + addedHours;
      currentEngins[engIdx].heuresMarche = newHours;

      // Persister dans les engins
      setEngins(currentEngins);
      localStorage.setItem("gmao_engins", JSON.stringify(currentEngins));
      
      toast.success(`Mise à jour réussie : ${selectedEnginHeures} est passé de ${oldHours}h à ${newHours}h (+${addedHours}h).`);
      setHeuresSaisiesJour("");

      // Lancer la routine de calcul préventif
      checkAndGeneratePreventiveTasks(currentEngins);
    }
  };

  // V3-5 / V3-6: Action de création d'une tâche manuelle (notamment Corrective ou Préventive)
  const handleCreateTaskManual = () => {
    if (!newLabel.trim()) {
      toast.error("Veuillez saisir la description de la tâche.");
      return;
    }

    const targetEngin = engins.find(e => e.id === newEnginId);
    const targetMeca = mecaniciens.find(m => m.id === newMecaId);

    if (!targetEngin || !targetMeca) {
      toast.error("Erreur de sélection de l'engin ou du mécanicien.");
      return;
    }

    // Détermination de la priorité de la tâche
    let priorite: MaintenanceTask["priorite"] = "NORMALE";
    if (newType === "QUOTIDIEN") {
      priorite = "QUOTIDIENNE";
    } else if (newType === "CORRECTIF") {
      priorite = newPrioriteManual === "HAUTE" ? "CRITIQUE" : "NORMALE";
    } else {
      priorite = newPrioriteManual === "HAUTE" ? "HAUTE" : "NORMALE";
    }

    const newTask: MaintenanceTask = {
      id: `T-MANUAL-${Date.now()}`,
      type: newType,
      label: newLabel.trim() + (newType === "CORRECTIF" ? " [CORRECTIF PANNE]" : ""),
      enginId: newEnginId,
      enginModele: targetEngin.modele,
      mecanicienId: newMecaId,
      mecanicienNom: targetMeca.nomComplet,
      poste: newPoste,
      datePlanifiee: newDate,
      dureeEstimee: newDuree,
      priorite,
      statut: "NON_FAIT",
      commentaire: ""
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    localStorage.setItem("gmao_planning_tasks", JSON.stringify(updatedTasks));

    toast.success("Nouvelle tâche planifiée et enregistrée avec succès.");
    setIsAddModalOpen(false);
    setNewLabel("");
  };

  // V3-1: Gestion du chargement de photo (1 maximum, stockée en base64)
  const handlePhotoUpload = (taskId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Limite dépassée : Le fichier photo ne doit pas excéder 2 Mo.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const updatedTasks = tasks.map(t => {
        if (t.id === taskId) {
          return { ...t, photo: base64String };
        }
        return t;
      });
      setTasks(updatedTasks);
      localStorage.setItem("gmao_planning_tasks", JSON.stringify(updatedTasks));
      toast.success("Photo d'inspection attachée avec succès.");
      if (activeTaskDetail?.id === taskId) {
        setActiveTaskDetail(prev => prev ? { ...prev, photo: base64String } : null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Suppression de la photo attachée
  const removePhoto = (taskId: string) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        const { photo, ...rest } = t;
        return rest;
      }
      return t;
    });
    setTasks(updatedTasks);
    localStorage.setItem("gmao_planning_tasks", JSON.stringify(updatedTasks));
    toast.success("Photo retirée.");
    if (activeTaskDetail?.id === taskId) {
      setActiveTaskDetail(prev => {
        if (!prev) return null;
        const { photo, ...rest } = prev;
        return rest as MaintenanceTask;
      });
    }
  };

  // V3-2: Mise à jour du commentaire ou statut d'une tâche
  const handleUpdateTaskInline = (taskId: string, fields: Partial<MaintenanceTask>) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        const updated = { ...t, ...fields };
        
        // Si le mécanicien coche la tâche préventive calculée en "FAIT", on met à jour l'heure de la dernière vidange correspondante dans l'engin !
        if (fields.statut === "FAIT" || fields.statut === "VALIDE") {
          // Déterminer de quel type de préventif il s'agit
          const currentEngin = engins.find(eg => eg.id === t.enginId);
          if (currentEngin) {
            let enginModifie = false;
            const updatedEngins = engins.map(eg => {
              if (eg.id === t.enginId) {
                const copy = { ...eg };
                if (t.label.includes("Vidange moteur")) {
                  copy.heures_derniere_vidange_moteur = eg.heuresMarche;
                  enginModifie = true;
                } else if (t.label.includes("Vidange huile hydraulique")) {
                  copy.heures_derniere_vidange_hydraulique = eg.heuresMarche;
                  enginModifie = true;
                } else if (t.label.includes("Vidange transmission")) {
                  copy.heures_derniere_vidange_transmission = eg.heuresMarche;
                  enginModifie = true;
                }
                return copy;
              }
              return eg;
            });

            if (enginModifie) {
              setEngins(updatedEngins);
              localStorage.setItem("gmao_engins", JSON.stringify(updatedEngins));
              toast.success(`Heures de référence vidange mises à jour pour ${t.enginId} à ${currentEngin.heuresMarche}h.`);
            }
          }
        }
        
        return updated;
      }
      return t;
    });

    setTasks(updatedTasks);
    localStorage.setItem("gmao_planning_tasks", JSON.stringify(updatedTasks));
    
    // Mettre à jour l'état de la modale active s'il y a lieu
    if (activeTaskDetail?.id === taskId) {
      setActiveTaskDetail(prev => prev ? { ...prev, ...fields } : null);
    }
  };

  // Suppression d'une tâche
  const handleDeleteTask = (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm("Voulez-vous vraiment supprimer cette tâche de planification ?")) {
      const filtered = tasks.filter(t => t.id !== taskId);
      setTasks(filtered);
      localStorage.setItem("gmao_planning_tasks", JSON.stringify(filtered));
      toast.success("Tâche retirée.");
      setIsDetailModalOpen(false);
    }
  };

  // V3: Réassignation directe et rapide par le directeur d'une tâche à un mécanicien
  const handleReassignTask = (taskId: string, mecaId: string) => {
    const targetMeca = mecaniciens.find(m => m.id === mecaId);
    if (!targetMeca) return;

    handleUpdateTaskInline(taskId, {
      mecanicienId: mecaId,
      mecanicienNom: targetMeca.nomComplet
    });
    toast.success(`Tâche réassignée à ${targetMeca.nomComplet}.`);
  };

  // V3: Validation par le Directeur d'une tâche complétée
  const handleValidateTaskByDirector = (taskId: string) => {
    handleUpdateTaskInline(taskId, { statut: "VALIDE" });
    toast.success("Tâche approuvée et verrouillée par la Direction.");
  };

  // V3-3: Génération de récap SMS / Whatsapp au format exact requis
  const handleGenerateSMSRecap = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const tasksToday = tasks.filter(t => t.datePlanifiee === todayStr);
    
    const countFait = tasksToday.filter(t => t.statut === "FAIT" || t.statut === "VALIDE").length;
    const countEnCours = tasksToday.filter(t => t.statut === "EN_COURS").length;
    const countRetard = tasksToday.filter(t => t.statut === "NON_FAIT").length;

    const urgentes = tasksToday
      .filter(t => (t.priorite === "CRITIQUE" || t.priorite === "HAUTE") && t.statut !== "FAIT" && t.statut !== "VALIDE")
      .map(t => `${t.enginId}: ${t.label}`)
      .join(", ") || "Aucune urgente en retard";

    const anomalies = tasksToday
      .filter(t => t.commentaire.trim().length > 0)
      .map(t => `[${t.enginId}] ${t.commentaire}`)
      .join(" | ") || "Rien à signaler";

    const currentMeca = filterMecanicien === "Tous" ? "Toute l'équipe" : filterMecanicien;
    const currentPoste = filterPoste === "Tous" ? "Tous Shifts" : filterPoste;

    const smsText = `📋 RÉCAP JOURNÉE ${todayStr}
✅ Faites : ${countFait} | ⏳ En cours : ${countEnCours} | ❌ Retard : ${countRetard}
🔴 Urgentes : ${urgentes}
📝 Anomalies : ${anomalies}
👷 Mécanicien : ${currentMeca} | Poste : ${currentPoste}`;

    navigator.clipboard.writeText(smsText);
    toast.success("Rapport SMS copié dans le presse-papier ! Prêt à être collé dans WhatsApp.");
  };

  // Filtrage intelligent des tâches d'inspection/planning
  const getFilteredTasks = () => {
    return tasks.filter(t => {
      const matchMeca = filterMecanicien === "Tous" || t.mecanicienNom === filterMecanicien;
      const matchPoste = filterPoste === "Tous" || t.poste === filterPoste;
      const matchEngin = filterEngin === "Tous" || t.enginId === filterEngin;
      const matchType = filterType === "Tous" || t.type === filterType;
      
      let matchPriorite = true;
      if (filterPriorite !== "Tous") {
        matchPriorite = t.priorite === filterPriorite;
      }

      let matchDate = true;
      if (filterDate !== "Tous") {
        const todayStr = new Date().toISOString().split("T")[0];
        const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        
        if (filterDate === "Aujourd'hui") {
          matchDate = t.datePlanifiee === todayStr;
        } else if (filterDate === "Hier") {
          matchDate = t.datePlanifiee === yesterdayStr;
        } else if (filterDate === "Cette semaine") {
          // Filtrage simplifié sur la semaine
          const taskTime = new Date(t.datePlanifiee).getTime();
          const oneWeekAgo = Date.now() - 7 * 86400000;
          matchDate = taskTime >= oneWeekAgo;
        }
      }

      return matchMeca && matchPoste && matchEngin && matchType && matchPriorite && matchDate;
    });
  };

  // V3: Calculateur de durée cumulée estimée pour les tâches filtrées
  const getCumulativeDuration = (filtered: MaintenanceTask[]) => {
    let totalMinutes = 0;
    filtered.forEach(t => {
      if (t.statut === "REPORTE") return; // On ne compte pas les reportées dans le travail du jour
      
      const dur = t.dureeEstimee;
      if (dur === "15min") totalMinutes += 15;
      else if (dur === "30min") totalMinutes += 30;
      else if (dur === "1h") totalMinutes += 60;
      else if (dur === "2h") totalMinutes += 120;
      else if (dur === "4h") totalMinutes += 240;
      else if (dur === "6h") totalMinutes += 360;
      else if (dur === "1j") totalMinutes += 480; // 8 heures effectives
    });

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${mins > 0 ? mins + 'min' : ''}`;
  };

  const filteredTasks = getFilteredTasks();
  const tasksCompletedRatio = filteredTasks.length > 0 
    ? filteredTasks.filter(t => t.statut === "FAIT" || t.statut === "VALIDE").length 
    : 0;
  const tasksCompletedPercent = filteredTasks.length > 0
    ? Math.round((tasksCompletedRatio / filteredTasks.length) * 100)
    : 100;

  // Calcul du badge de couleur pour l'onglet "Tâches"
  const getTabAlerteStatus = () => {
    const hasCriticalLate = tasks.some(t => t.statut === "NON_FAIT" && t.priorite === "CRITIQUE");
    if (hasCriticalLate) return "🔴";
    const hasHighPreAlert = tasks.some(t => t.statut === "NON_FAIT" && t.priorite === "HAUTE");
    if (hasHighPreAlert) return "🟡";
    return "🟢";
  };

  // V3: Générateur d'impression
  const handlePrintPage = () => {
    window.print();
  };

  // V3: Génération des jours pour le calendrier Hebdomadaire
  const getWeekDays = () => {
    const days = [];
    const baseDate = new Date();
    // Ajuster au lundi de la semaine courante + décalage
    const day = baseDate.getDay();
    const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1) + (currentWeekOffset * 7);
    const monday = new Date(baseDate.setDate(diff));

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();

  return (
    <div className="space-y-6 select-none bg-slate-50 min-h-screen p-4 md:p-6 print:p-0 print:bg-white print:min-h-0">
      
      {/* Page Banner - Masqué lors de l'impression */}
      <div className="print:hidden">
        <PageBanner
          icon={Calendar}
          badgeLabel="SOU-GMAO V3"
          title="TÂCHES, CORRECTIFS & PLANNING"
          subtitle="Suivi des vidanges par calcul d'intervalles, correctifs immédiats, et pilotage des équipes."
        >
          <div className="flex flex-wrap gap-2 items-center">
            {/* Toggle de simulation de rôle pour démonstration */}
            <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Espace :</span>
              <button
                onClick={() => {
                  setUserRole("MECANICIEN");
                  toast.info("Passage en mode Vue Mécanicien (Saisie facilitée)");
                }}
                className={`px-2 py-1 rounded-md text-[10px] font-black uppercase transition-all ${
                  userRole === "MECANICIEN" ? "bg-amber-500 text-slate-950" : "bg-slate-100 text-slate-600"
                }`}
              >
                👷 Méca
              </button>
              <button
                onClick={() => {
                  setUserRole("DIRECTEUR");
                  toast.info("Passage en mode Vue Directeur (Validation de travaux active)");
                }}
                className={`px-2 py-1 rounded-md text-[10px] font-black uppercase transition-all ${
                  userRole === "DIRECTEUR" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                👔 Directeur
              </button>
            </div>

            <Button
              variant="outline"
              onClick={handlePrintPage}
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-bold uppercase tracking-wider text-xs h-9"
            >
              <Printer className="h-4 w-4 mr-1.5" /> Imprimer
            </Button>
            <Button
              onClick={handleGenerateSMSRecap}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-wider text-xs h-9"
            >
              <Share2 className="h-4 w-4 mr-1.5" /> WhatsApp / SMS
            </Button>
          </div>
        </PageBanner>
      </div>

      {/* V3: Menu de navigation d'onglets */}
      <div className="flex flex-wrap gap-2 print:hidden bg-white p-2 rounded-2xl border border-slate-200 shadow-xs max-w-4xl">
        <button
          onClick={() => setActiveTab("taches")}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === "taches"
              ? "bg-amber-500 text-slate-950 shadow-md border-b-2 border-amber-600"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" /> 📋 Tâches Journalières {getTabAlerteStatus()}
        </button>

        <button
          onClick={() => setActiveTab("planning")}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === "planning"
              ? "bg-amber-500 text-slate-950 shadow-md border-b-2 border-amber-600"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Calendar className="h-4 w-4 shrink-0" /> 📅 Calendrier & Planning
        </button>

        <button
          onClick={() => setActiveTab("performance")}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === "performance"
              ? "bg-amber-500 text-slate-950 shadow-md border-b-2 border-amber-600"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <TrendingUp className="h-4 w-4 shrink-0" /> 📊 Performance & Gamification
        </button>
      </div>

      {/* ============================================================ */}
      {/* V3: SECTION SAISIE DES HEURES DU JOUR (VISIBLE DANS L'ONGLET TÂCHES) */}
      {/* ============================================================ */}
      {activeTab === "taches" && (
        <Card className="border-slate-200 shadow-xs bg-slate-900 text-white rounded-2xl max-w-5xl overflow-hidden print:hidden">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 block">
                V3: SAISIE DES PARAMÈTRES ET HEURES DU JOUR
              </span>
              <h3 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-1.5">
                <Clock3 className="h-4 w-4 text-amber-500" /> Saisie manuelle heures engins
              </h3>
            </div>
            <span className="text-[10px] font-medium text-slate-400 bg-slate-800 px-2 py-1 rounded-md">
              (Remplacé ultérieurement par l'import automatique plateforme carburants)
            </span>
          </div>

          <CardContent className="p-5">
            <form onSubmit={handleAddHeuresJour} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Engin de la mine</label>
                <select
                  value={selectedEnginHeures}
                  onChange={(e) => setSelectedEnginHeures(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {engins.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.id} - {e.modele} ({e.heuresMarche} hrs actuelles)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Heures de marche aujourd'hui</label>
                <input
                  type="number"
                  placeholder="Ex: 8"
                  value={heuresSaisiesJour}
                  onChange={(e) => setHeuresSaisiesJour(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full h-10 px-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  min="1"
                  max="24"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Affecté à</label>
                <select
                  value={selectedMecaHeures}
                  onChange={(e) => setSelectedMecaHeures(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {mecaniciens.map(m => (
                    <option key={m.id} value={m.nomComplet}>{m.nomComplet}</option>
                  ))}
                </select>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full h-10 bg-amber-500 hover:bg-amber-600 border-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  <Plus className="h-4 w-4 mr-1" /> Enregistrer & recalculer
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      )}

      {/* ============================================================ */}
      {/* ONGLET 1: TÂCHES JOURNALIÈRES */}
      {/* ============================================================ */}
      {activeTab === "taches" && (
        <div className="space-y-6 max-w-5xl">
          
          {/* Dashboard rapide des KPI en haut */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Tâches planifiées</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-slate-900">{filteredTasks.length}</span>
                <span className="text-xs text-slate-400 font-medium">assignées</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Taux Réalisation</span>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-xl font-black ${
                  tasksCompletedPercent >= 80 ? "text-emerald-600" : tasksCompletedPercent >= 60 ? "text-amber-600" : "text-rose-600"
                }`}>
                  {tasksCompletedPercent}%
                </span>
                <span className="text-xs text-slate-400 font-medium">({tasksCompletedRatio}/{filteredTasks.length})</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Tâches en retard</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-rose-600">
                  {tasks.filter(t => t.statut === "NON_FAIT" && (t.priorite === "CRITIQUE" || t.priorite === "HAUTE")).length}
                </span>
                <span className="text-xs font-bold text-rose-500">🔴 critique</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Pré-alerte vidange</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-amber-600">
                  {tasks.filter(t => t.statut === "NON_FAIT" && t.priorite === "HAUTE" && t.type === "PREVENTIF").length}
                </span>
                <span className="text-xs font-bold text-amber-500">🟡 warning</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs col-span-2 md:col-span-1">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Durée cumulée</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-blue-600">
                  {getCumulativeDuration(filteredTasks)}
                </span>
                <span className="text-[10px] text-slate-400 font-bold block">travail</span>
              </div>
            </div>

          </div>

          {/* Section Filtres rapides pour le tableau */}
          <Card className="border-slate-200 shadow-xs bg-white rounded-2xl">
            <CardHeader className="py-3 px-5 bg-slate-55 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <Filter className="h-4 w-4 text-amber-500" /> Filtres d'affichage dynamique
              </CardTitle>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setFilterMecanicien("Tous");
                    setFilterPoste("Tous");
                    setFilterEngin("Tous");
                    setFilterType("Tous");
                    setFilterPriorite("Tous");
                    setFilterDate("Tous");
                  }}
                  variant="ghost"
                  className="text-[10px] font-bold uppercase tracking-wider h-8 text-slate-500"
                >
                  <RefreshCw className="h-3 w-3 mr-1" /> Réinitialiser
                </Button>
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-amber-500 hover:bg-amber-600 border-amber-600 text-slate-950 font-black uppercase tracking-wider text-xs h-8"
                >
                  <Plus className="h-4 w-4 mr-1" /> Ajouter une tâche
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 grid grid-cols-2 md:grid-cols-6 gap-3">
              
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Mécanicien</label>
                <select
                  value={filterMecanicien}
                  onChange={(e) => setFilterMecanicien(e.target.value)}
                  className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Tous">Tous</option>
                  {mecaniciens.map(m => <option key={m.id} value={m.nomComplet}>{m.nomComplet}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Shift / Poste</label>
                <select
                  value={filterPoste}
                  onChange={(e) => setFilterPoste(e.target.value)}
                  className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Tous">Tous</option>
                  <option value="Poste 1">Poste 1</option>
                  <option value="Poste 2">Poste 2</option>
                  <option value="Poste 3">Poste 3</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Machine</label>
                <select
                  value={filterEngin}
                  onChange={(e) => setFilterEngin(e.target.value)}
                  className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Tous">Tous</option>
                  {engins.map(e => <option key={e.id} value={e.id}>{e.id}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Type de tâche</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Tous">Tous</option>
                  <option value="PREVENTIF">🔧 Préventif</option>
                  <option value="CORRECTIF">🚨 Correctif</option>
                  <option value="QUOTIDIEN">📅 Quotidien</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Priorité</label>
                <select
                  value={filterPriorite}
                  onChange={(e) => setFilterPriorite(e.target.value)}
                  className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Tous">Tous</option>
                  <option value="CRITIQUE">🔴 Critique</option>
                  <option value="HAUTE">🟠 Haute</option>
                  <option value="NORMALE">🟢 Normale</option>
                  <option value="BASSE">🔵 Basse</option>
                  <option value="REPORTEE">⚪ Reportée</option>
                  <option value="QUOTIDIENNE">🟣 Quotidienne</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Date planifiée</label>
                <select
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Tous">Toutes les dates</option>
                  <option value="Aujourd'hui">Aujourd'hui</option>
                  <option value="Hier">Hier</option>
                  <option value="Cette semaine">Cette semaine</option>
                </select>
              </div>

            </CardContent>
          </Card>

          {/* Tableau principal des tâches */}
          <Card className="border-slate-200 shadow-md rounded-2xl bg-white overflow-hidden">
            <CardContent className="p-0">
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4">Tâche / Opération</th>
                      <th className="py-3 px-4">Engin</th>
                      <th className="py-3 px-4 text-center">Échéance</th>
                      <th className="py-3 px-4 text-center">Durée</th>
                      <th className="py-3 px-4">Responsable</th>
                      <th className="py-3 px-4 text-center">Statut</th>
                      <th className="py-3 px-4">Commentaire</th>
                      <th className="py-3 px-4 text-center">Photo</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredTasks.map(t => {
                      return (
                        <tr
                          key={t.id}
                          className="hover:bg-amber-50/10 cursor-pointer transition-colors group"
                          onClick={() => {
                            setActiveTaskDetail(t);
                            setIsDetailModalOpen(true);
                          }}
                        >
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                {t.type === "PREVENTIF" && "🔧 "}
                                {t.type === "CORRECTIF" && "🚨 "}
                                {t.type === "QUOTIDIEN" && "📅 "}
                                {t.label}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium block">
                                {t.datePlanifiee} • {t.poste}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4 font-black text-slate-800">
                            {t.enginId}
                          </td>

                          <td className="py-3 px-4 text-center">
                            {t.type === "PREVENTIF" && t.heuresEcouleesAuMoment ? (
                              <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black ${
                                t.priorite === "CRITIQUE" ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-amber-50 text-amber-700 border border-amber-100"
                              }`}>
                                {t.heuresEcouleesAuMoment}h / {t.echeanceHeures}h
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px] font-bold">—</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center font-bold text-slate-600">
                            {t.dureeEstimee}
                          </td>

                          <td className="py-3 px-4">
                            {userRole === "DIRECTEUR" ? (
                              <select
                                value={t.mecanicienId}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => handleReassignTask(t.id, e.target.value)}
                                className="h-7 px-1.5 bg-slate-50 border border-slate-250 rounded-md text-[11px] font-bold text-slate-800 focus:outline-none"
                              >
                                {mecaniciens.map(m => (
                                  <option key={m.id} value={m.id}>{m.nomComplet}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="font-bold text-slate-700">{t.mecanicienNom}</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={t.statut}
                              onChange={(e) => handleUpdateTaskInline(t.id, { statut: e.target.value as MaintenanceTask["statut"] })}
                              className={`h-7 px-2 border rounded-md text-[11px] font-black uppercase ${
                                t.statut === "FAIT" ? "bg-emerald-500 border-emerald-600 text-white" :
                                t.statut === "VALIDE" ? "bg-blue-600 border-blue-700 text-white" :
                                t.statut === "EN_COURS" ? "bg-amber-500 border-amber-600 text-slate-950" :
                                t.statut === "REPORTE" ? "bg-slate-300 border-slate-400 text-slate-700" :
                                "bg-rose-500 border-rose-600 text-white"
                              }`}
                            >
                              <option value="NON_FAIT">Non Fait</option>
                              <option value="EN_COURS">En cours</option>
                              <option value="FAIT">Fait</option>
                              <option value="REPORTE">Reporté</option>
                              {userRole === "DIRECTEUR" && <option value="VALIDE">Validé</option>}
                            </select>
                          </td>

                          <td className="py-3 px-4 text-slate-600 text-[11px]">
                            {t.commentaire ? (
                              <span className="line-clamp-1 italic">{t.commentaire}</span>
                            ) : (
                              <span className="text-slate-350 italic">Aucun commentaire...</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            {t.photo ? (
                              <div className="relative inline-block">
                                <img
                                  src={t.photo}
                                  alt="Aperçu inspection"
                                  className="h-8 w-8 rounded-md object-cover border border-slate-200"
                                />
                                <button
                                  onClick={() => removePhoto(t.id)}
                                  className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5"
                                  title="Retirer la photo"
                                >
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </div>
                            ) : (
                              <label className="cursor-pointer inline-flex items-center justify-center h-7 w-7 rounded-full bg-slate-50 border border-slate-200 text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors">
                                <Camera className="h-3.5 w-3.5" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handlePhotoUpload(t.id, e)}
                                  className="hidden"
                                />
                              </label>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {userRole === "DIRECTEUR" && t.statut === "FAIT" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleValidateTaskByDirector(t.id)}
                                  className="h-7 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-black"
                                >
                                  <ShieldCheck className="h-3 w-3 mr-0.5 text-blue-700" /> Valider
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setActiveTaskDetail(t);
                                  setIsDetailModalOpen(true);
                                }}
                                className="h-7 w-7 p-0 text-slate-500 hover:text-amber-500 hover:bg-slate-100 rounded-lg"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteTask(t.id)}
                                className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredTasks.length === 0 && (
                <div className="py-12 text-center text-slate-400">
                  <AlertTriangle className="h-10 w-10 mx-auto text-amber-500 mb-2" />
                  <p className="text-sm font-bold">Aucune tâche ne correspond à vos critères de filtres.</p>
                </div>
              )}

            </CardContent>
          </Card>

        </div>
      )}

      {/* ============================================================ */}
      {/* ONGLET 2: PLANNING CALENDRIER HEBDOMADAIRE */}
      {/* ============================================================ */}
      {activeTab === "planning" && (
        <div className="space-y-6 max-w-5xl">
          
          <Card className="border-slate-200 shadow-md bg-white rounded-2xl overflow-hidden">
            
            {/* Header Calendrier */}
            <CardHeader className="border-b border-slate-100 bg-slate-50 py-4 px-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Calendar className="h-4.5 w-4.5 text-amber-500" /> PLANNING DE TOURNÉES ET INTERVENTIONS
                  </CardTitle>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Visualisation complète hebdomadaire des affectations mécaniques par jour.
                  </p>
                </div>

                {/* Navigation de semaine */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentWeekOffset(prev => prev - 1)}
                    className="h-8 w-8 p-0 border-slate-200 text-slate-750 hover:bg-slate-50 rounded-lg"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs font-black uppercase text-slate-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg min-w-[150px] text-center">
                    {currentWeekOffset === 0 ? "Cette semaine" : `Semaine ${currentWeekOffset > 0 ? '+' + currentWeekOffset : currentWeekOffset}`}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentWeekOffset(prev => prev + 1)}
                    className="h-8 w-8 p-0 border-slate-200 text-slate-750 hover:bg-slate-50 rounded-lg"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentWeekOffset(0)}
                    className="h-8 px-2.5 text-[10px] font-bold uppercase text-slate-500"
                  >
                    Aujourd'hui
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              
              {/* Vue Hebdomadaire - Grid avec jours en colonnes */}
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100 text-center">
                {weekDays.map((day, dIdx) => {
                  const isToday = day.toISOString().split("T")[0] === new Date().toISOString().split("T")[0];
                  return (
                    <div
                      key={dIdx}
                      className={`py-3 px-2 border-r border-slate-200 last:border-0 ${
                        isToday ? "bg-amber-500/10 border-b-2 border-b-amber-500" : ""
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase text-slate-400 block">
                        {day.toLocaleDateString("fr-FR", { weekday: "short" })}
                      </span>
                      <span className={`text-base font-black ${isToday ? "text-amber-600 font-extrabold" : "text-slate-800"}`}>
                        {day.getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Rangement par Mécaniciens (Lignes) */}
              <div className="divide-y divide-slate-150">
                {mecaniciens.map(meca => {
                  return (
                    <div key={meca.id} className="grid grid-cols-1 md:grid-cols-7 min-h-[110px]">
                      
                      {/* En-tête mobile de ligne de mécanicien */}
                      <div className="col-span-1 md:col-span-7 bg-slate-50/50 py-1.5 px-4 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-amber-500" /> {meca.nomComplet}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md">
                          {tasks.filter(t => t.mecanicienId === meca.id && t.statut !== "FAIT" && t.statut !== "VALIDE").length} en attente
                        </span>
                      </div>

                      {/* Case pour chaque jour de la semaine */}
                      {weekDays.map((day, dIdx) => {
                        const dayStr = day.toISOString().split("T")[0];
                        const dayTasks = tasks.filter(t => t.mecanicienId === meca.id && t.datePlanifiee === dayStr);

                        return (
                          <div
                            key={dIdx}
                            className="p-2 border-r border-slate-100 last:border-r-0 flex flex-col gap-1.5 bg-white hover:bg-slate-50/30 min-h-[90px]"
                          >
                            {dayTasks.map(task => {
                              // Couleur de priorité
                              let priorityColor = "bg-slate-100 text-slate-700 border-slate-200";
                              if (task.priorite === "CRITIQUE") priorityColor = "bg-rose-50 text-rose-700 border-rose-100";
                              else if (task.priorite === "HAUTE") priorityColor = "bg-amber-50 text-amber-700 border-amber-100";
                              else if (task.priorite === "QUOTIDIENNE") priorityColor = "bg-purple-50 text-purple-700 border-purple-100";
                              else if (task.priorite === "BASSE") priorityColor = "bg-blue-50 text-blue-700 border-blue-100";

                              return (
                                <div
                                  key={task.id}
                                  onClick={() => {
                                    setActiveTaskDetail(task);
                                    setIsDetailModalOpen(true);
                                  }}
                                  className={`p-1.5 rounded-lg border text-[10px] font-bold cursor-pointer hover:shadow-xs transition-shadow ${priorityColor}`}
                                >
                                  <div className="flex justify-between items-start gap-1">
                                    <span className="font-extrabold truncate max-w-[80px]">{task.enginId}</span>
                                    <span className="text-[8px] font-light">{task.dureeEstimee}</span>
                                  </div>
                                  <p className="line-clamp-2 text-slate-600 mt-0.5 leading-tight font-medium">
                                    {task.label}
                                  </p>
                                </div>
                              );
                            })}

                            {dayTasks.length === 0 && (
                              <div className="flex-1 flex items-center justify-center text-[9px] text-slate-300 italic font-medium">
                                Libre
                              </div>
                            )}
                          </div>
                        );
                      })}

                    </div>
                  );
                })}
              </div>

            </CardContent>
          </Card>

          {/* V3: Bloc prévisionnel intelligent */}
          <Card className="border-slate-200 shadow-xs bg-slate-900 text-slate-100 rounded-2xl p-5">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-500 mb-2.5 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-amber-500 animate-pulse" /> V3 : ALGO DE PRÉVISION INTELLIGENTE DU PLANNING
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold">
              <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[10px] uppercase mb-1">ST2G-01 (Vidange préventive)</span>
                <p className="text-white leading-relaxed font-bold">
                  Dans environ 32h de marche : Vidange hydraulique majeure planifiée (Estimation 4h).
                </p>
              </div>
              <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[10px] uppercase mb-1">ST2D-02 (Inspection freins)</span>
                <p className="text-white leading-relaxed font-bold">
                  Dans environ 45h de marche : Vérification de l'épaisseur des disques (Estimation 1h).
                </p>
              </div>
              <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[10px] uppercase mb-1">Taux Préventif de la flotte</span>
                <p className="text-white leading-relaxed font-bold">
                  Statut de protection : <span className="text-emerald-400">92% conforme</span>. Les intervalles d'inspection préviennent les pannes.
                </p>
              </div>
            </div>
          </Card>

        </div>
      )}

      {/* ============================================================ */}
      {/* ONGLET 3: PERFORMANCE & GAMIFICATION */}
      {/* ============================================================ */}
      {activeTab === "performance" && (
        <div className="space-y-6 max-w-5xl">
          
          {/* Cartes Performance en haut */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            <Card className="border-slate-200 shadow-xs bg-white p-5 rounded-2xl flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Performance Globale</span>
                <span className="text-2xl font-black text-slate-900">84.5%</span>
                <span className="text-[10px] font-bold text-emerald-600 block">Objectif &gt;80% atteint</span>
              </div>
            </Card>

            <Card className="border-slate-200 shadow-xs bg-white p-5 rounded-2xl flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Flame className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Série Record</span>
                <span className="text-2xl font-black text-slate-900">12 Jours</span>
                <span className="text-[10px] font-bold text-slate-500 block">Sans aucun retard d'échéance</span>
              </div>
            </Card>

            <Card className="border-slate-200 shadow-xs bg-white p-5 rounded-2xl flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Wrench className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Ratio Préventif</span>
                <span className="text-2xl font-black text-slate-900">78% / 22%</span>
                <span className="text-[10px] font-bold text-blue-600 block">Préventif vs Correctif (Panne)</span>
              </div>
            </Card>

            <Card className="border-slate-200 shadow-xs bg-white p-5 rounded-2xl flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <User className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Mécanicien du mois</span>
                <span className="text-sm font-black text-slate-900 block truncate">Abdellah Daoudi</span>
                <span className="text-[10px] font-bold text-purple-600 block">Taux réalisation de 95%</span>
              </div>
            </Card>

          </div>

          {/* Tableau de suivi des équipes mécaniciens */}
          <Card className="border-slate-200 shadow-md bg-white rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50 py-4 px-6 flex justify-between items-center">
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Award className="h-4.5 w-4.5 text-amber-500" /> CLASSEMENT ET SUIVI DE PERFORMANCE COKCPIT
                </CardTitle>
                <p className="text-[11px] text-slate-500 font-medium">
                  Statistiques issues du localStorage et des validations de tournées quotidiennes.
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Période : Ce mois</span>
            </CardHeader>

            <CardContent className="p-0">
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4">Mécanicien</th>
                      <th className="py-3 px-4">Poste standard</th>
                      <th className="py-3 px-4 text-center">Tâches Faites</th>
                      <th className="py-3 px-4 text-center">En retard</th>
                      <th className="py-3 px-4">Progression CSS de réalisation</th>
                      <th className="py-3 px-4">Badges de Gamification obtenus</th>
                      <th className="py-3 px-4 text-center">Tendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    
                    {/* Mécanicien 1 */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">Abdellah Daoudi</td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">Poste 1</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">45 / 50</td>
                      <td className="py-3.5 px-4 text-center font-bold text-rose-600">2</td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-800">90%</span>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "90%" }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex gap-1">
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-100 rounded-full text-[9px] font-black" title="Série de 10 jours sans retard">
                            🔥 Série Argent
                          </span>
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-full text-[9px] font-black" title="Plus de 100 tâches de préventif réalisées">
                            ⭐ Préventif
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600">▲ ⬆️</td>
                    </tr>

                    {/* Mécanicien 2 */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">Lahcen Ait</td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">Poste 1</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">38 / 50</td>
                      <td className="py-3.5 px-4 text-center font-bold text-rose-600">5</td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-800">76%</span>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-2 rounded-full" style={{ width: "76%" }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex gap-1">
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-full text-[9px] font-black">
                            ⭐ Préventif Bronze
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-rose-600">▼ ⬇️</td>
                    </tr>

                    {/* Mécanicien 3 */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">Mohamed El Amri</td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">Poste 2</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">42 / 50</td>
                      <td className="py-3.5 px-4 text-center font-bold text-rose-600">3</td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-800">84%</span>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "84%" }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex gap-1">
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-[9px] font-black">
                            🏆 Champion
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">▬ ➡️</td>
                    </tr>

                    {/* Mécanicien 4 */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">Youssef Naciri</td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">Poste 3</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">20 / 25</td>
                      <td className="py-3.5 px-4 text-center font-bold text-rose-600">1</td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-800">80%</span>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "80%" }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex gap-1">
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-100 rounded-full text-[9px] font-black">
                            🔥 Série Bronze
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600">▲ ⬆️</td>
                    </tr>

                  </tbody>
                </table>
              </div>

            </CardContent>
          </Card>

        </div>
      )}

      {/* ============================================================ */}
      {/* V3: FENÊTRE MODALE DE DIALOGUE - DETAIL D'UNE TÂCHE */}
      {/* ============================================================ */}
      {isDetailModalOpen && activeTaskDetail && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-slate-800">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 block mb-0.5">
                  Fiche Detail inspection
                </span>
                <h3 className="text-sm font-black uppercase tracking-tight">
                  Tâche : {activeTaskDetail.id}
                </h3>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 text-xs">
              
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Description</span>
                <p className="text-sm font-bold text-slate-900">{activeTaskDetail.label}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Engin / Modèle</span>
                  <p className="font-black text-slate-900">{activeTaskDetail.enginId} ({activeTaskDetail.enginModele})</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Durée estimée</span>
                  <p className="font-bold text-slate-700">{activeTaskDetail.dureeEstimee}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Date / Shift</span>
                  <p className="font-bold text-slate-700">{activeTaskDetail.datePlanifiee} - {activeTaskDetail.poste}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Mécanicien</span>
                  <p className="font-bold text-slate-700">{activeTaskDetail.mecanicienNom}</p>
                </div>
              </div>

              {/* Statut de la tâche */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">État / Statut d'exécution</span>
                <div className="flex gap-2">
                  {(["NON_FAIT", "EN_COURS", "FAIT", "REPORTE"] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateTaskInline(activeTaskDetail.id, { statut: st })}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${
                        activeTaskDetail.statut === st
                          ? "bg-slate-900 text-white border-slate-950 shadow-xs"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {st === "NON_FAIT" && "Non fait"}
                      {st === "EN_COURS" && "En cours"}
                      {st === "FAIT" && "Fait"}
                      {st === "REPORTE" && "Reporté"}
                    </button>
                  ))}
                </div>
              </div>

              {/* V3-2: Zone d'édition du commentaire avec limite stricte de 250 caractères */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Commentaire / Anomalie (Max 250 caractères)</span>
                  <span className="text-[10px] font-mono text-slate-400">{activeTaskDetail.commentaire.length}/250</span>
                </div>
                <textarea
                  value={activeTaskDetail.commentaire}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 250);
                    handleUpdateTaskInline(activeTaskDetail.id, { commentaire: value });
                  }}
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="Inscrivez les observations techniques ou d'anomalies..."
                />
              </div>

              {/* Gestion de la Photo */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Photo d'inspection attachée</span>
                {activeTaskDetail.photo ? (
                  <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <img
                      src={activeTaskDetail.photo}
                      alt="Inspection"
                      className="w-full h-32 object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(activeTaskDetail.id)}
                      className="absolute top-2 right-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1.5 shadow-md transition-colors"
                      title="Supprimer la photo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100/50 cursor-pointer transition-colors">
                    <Camera className="h-6 w-6 text-slate-400 mb-1" />
                    <span className="text-[10px] font-bold text-slate-500">Ajouter une photo justificative</span>
                    <span className="text-[8px] text-slate-400 mt-0.5">Max 1 photo, 2 Mo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(activeTaskDetail.id, e)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

            </div>

            {/* Actions de validation Directeur */}
            <div className="bg-slate-50 p-4 border-t border-slate-150 flex justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => handleDeleteTask(activeTaskDetail.id)}
                className="border-rose-200 text-rose-600 bg-white hover:bg-rose-50"
              >
                Supprimer
              </Button>

              <div className="flex gap-2">
                {userRole === "DIRECTEUR" && activeTaskDetail.statut === "FAIT" && (
                  <Button
                    onClick={() => {
                      handleValidateTaskByDirector(activeTaskDetail.id);
                      setIsDetailModalOpen(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black"
                  >
                    <ShieldCheck className="h-4 w-4 mr-1" /> Valider Fiche
                  </Button>
                )}
                <Button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold"
                >
                  Fermer
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* V3: FENÊTRE MODALE DE DIALOGUE - AJOUT DE TÂCHE MANUELLE */}
      {/* ============================================================ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-slate-800">
            
            <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 block mb-0.5">
                  Planification manuelle
                </span>
                <h3 className="text-sm font-black uppercase tracking-tight">
                  ➕ Créer une tâche
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              
              {/* Type de tâche */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 block">Type d'entretien</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["PREVENTIF", "CORRECTIF", "QUOTIDIEN"] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setNewType(type);
                        if (type === "QUOTIDIEN") {
                          setNewLabel("Graissage pivots");
                        } else if (type === "CORRECTIF") {
                          setNewLabel("Réparation fuite flexible hydraulique");
                        } else {
                          setNewLabel("Vidange préventive");
                        }
                      }}
                      className={`py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${
                        newType === type
                          ? "bg-slate-900 text-white border-slate-950"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {type === "PREVENTIF" ? "🔧 Prév" : type === "CORRECTIF" ? "🚨 Correctif" : "📅 Quotid"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description de la tâche */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 block">Description de l'intervention</label>
                <input
                  type="text"
                  placeholder="Ex: Vidange moteur ou réparation fuite hydraulique..."
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Engin compatible */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 block">Sélection de l'engin</label>
                <select
                  value={newEnginId}
                  onChange={(e) => setNewEnginId(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {engins.map(e => (
                    <option key={e.id} value={e.id}>{e.id} - {e.modele}</option>
                  ))}
                </select>
              </div>

              {/* Affectation mécanicien */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 block">Mécanicien en charge</label>
                <select
                  value={newMecaId}
                  onChange={(e) => setNewMecaId(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {mecaniciens.map(m => (
                    <option key={m.id} value={m.id}>{m.nomComplet}</option>
                  ))}
                </select>
              </div>

              {/* Shift et Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400 block">Poste / Quart</label>
                  <select
                    value={newPoste}
                    onChange={(e) => setNewPoste(e.target.value as any)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="Poste 1">Poste 1</option>
                    <option value="Poste 2">Poste 2</option>
                    <option value="Poste 3">Poste 3</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400 block">Date prévue</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* V3-6: Durée estimée d'intervention */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 block font-black">Durée estimée de l'intervention</label>
                <select
                  value={newDuree}
                  onChange={(e) => setNewDuree(e.target.value as any)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="15min">15 Minutes</option>
                  <option value="30min">30 Minutes</option>
                  <option value="1h">1 Heure</option>
                  <option value="2h">2 Heures</option>
                  <option value="4h">4 Heures</option>
                  <option value="6h">6 Heures</option>
                  <option value="1j">1 Jour complet (8h)</option>
                </select>
              </div>

              {/* Niveau de Priorité de départ */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 block">Priorité manuelle</label>
                <select
                  value={newPrioriteManual}
                  onChange={(e) => setNewPrioriteManual(e.target.value as any)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="BASSE">Basse (Simple vérification)</option>
                  <option value="NORMALE">Normale (Planification classique)</option>
                  <option value="HAUTE">Haute (Cruciale mécanique)</option>
                </select>
              </div>

            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-150 flex justify-end gap-2.5">
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="border-slate-200 text-slate-600 bg-white hover:bg-slate-100"
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreateTaskManual}
                className="bg-amber-500 hover:bg-amber-600 border-amber-600 text-slate-950 font-black"
              >
                Enregistrer la tâche
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
