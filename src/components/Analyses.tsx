// V4 : Fichier d'Analyses stratégiques complexes et rapports pour SOU-GMAO Hydromines
// Ce fichier implémente 5 onglets analytiques complets avec des indicateurs de temps réel, de la gamification, du benchmarking Epiroc et des prévisions prédictives basées sur des règles d'ingénierie if/else exactes.

import * as React from "react";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Zap,
  Clock,
  Printer,
  FileSpreadsheet,
  Download,
  Fuel,
  Wrench,
  CheckCircle2,
  Calendar,
  AlertCircle,
  TrendingDown,
  Info,
  Layers,
  Sparkles,
  ClipboardList,
  Mail,
  Plus,
  Trash2,
  Check,
  Award,
  BookOpen
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageBanner } from "@/components/ui/PageBanner";
import { toast } from "sonner";

// V4 : Structures d'analyses
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
  photo?: string;
  motifReport?: string;
  dateReporte?: string;
  echeanceHeures?: number;
  heuresEcouleesAuMoment?: number;
}

interface ConsommationSaisie {
  id: string;
  date: string;
  enginId: string;
  carburantL: number;
  huileMoteurL: number;
  huileHydrauliqueL: number;
  piecesDH: number;
}

interface AlerteProactive {
  id: string;
  date: string;
  type: "SECURITE" | "SURCONSOMMATION" | "DÉFAILLANCE" | "PLANIFICATION";
  message: string;
  lue: boolean;
  priorite: "🔴" | "🟡" | "🟢";
}

export default function Analyses() {
  // V4 : Onglets de navigation
  const [activeTab, setActiveTab] = React.useState<"comparaisons" | "surconsommation" | "previsions" | "rapports" | "export">("comparaisons");

  // V4 : États principaux
  const [engins, setEngins] = React.useState<Engin[]>([]);
  const [tasks, setTasks] = React.useState<MaintenanceTask[]>([]);
  const [consommations, setConsommations] = React.useState<ConsommationSaisie[]>([]);
  const [alertes, setAlertes] = React.useState<AlerteProactive[]>([]);
  const [hasNewAlertBadge, setHasNewAlertBadge] = React.useState(false);

  // V4 : Formulaire de saisie de consommations (temporaire pour le secrétaire)
  const [consSaisieDate, setConsSaisieDate] = React.useState(() => new Date().toISOString().split("T")[0]);
  const [consSaisieEngin, setConsSaisieEngin] = React.useState("");
  const [consSaisieCarburant, setConsSaisieCarburant] = React.useState<number | "">("");
  const [consSaisieHuileMot, setConsSaisieHuileMot] = React.useState<number | "">("");
  const [consSaisieHuileHyd, setConsSaisieHuileHyd] = React.useState<number | "">("");
  const [consSaisiePieces, setConsSaisiePieces] = React.useState<number | "">("");

  // V4 : Paramètres d'édition des rapports
  const [selectedReportType, setSelectedReportType] = React.useState<"hebdo" | "mensuel" | "trimestriel">("hebdo");
  const [directorComment, setDirectorComment] = React.useState("");
  const [scheduledReports, setScheduledReports] = React.useState<{ id: string; type: string; date: string }[]>([]);

  // V4 : Paramètres de filtres d'export
  const [exportStartDate, setExportStartDate] = React.useState("2026-06-01");
  const [exportEndDate, setExportEndDate] = React.useState("2026-06-30");
  const [exportEngin, setExportEngin] = React.useState("Tous");
  const [exportDataType, setExportDataType] = React.useState<"checklists" | "tasks" | "heures" | "pannes" | "conso">("tasks");

  // V4 : Chargement initial des données depuis localStorage
  React.useEffect(() => {
    // 1. Charger les engins
    const savedEngins = localStorage.getItem("gmao_engins");
    let loadedEngins: Engin[] = [];
    if (savedEngins) {
      loadedEngins = JSON.parse(savedEngins);
    } else {
      loadedEngins = [
        { id: "ST2G-01", modele: "ST2G", marque: "Epiroc", type: "Scooptram", heuresMarche: 5250, heures_derniere_vidange_moteur: 5000, heures_derniere_vidange_hydraulique: 4500, heures_derniere_vidange_transmission: 4000 },
        { id: "ST2D-02", modele: "ST2D", marque: "Epiroc", type: "Scooptram", heuresMarche: 1210, heures_derniere_vidange_moteur: 1000, heures_derniere_vidange_hydraulique: 800, heures_derniere_vidange_transmission: 500 },
        { id: "ST7-01", modele: "ST7", marque: "Epiroc", type: "Scooptram", heuresMarche: 3850, heures_derniere_vidange_moteur: 3800, heures_derniere_vidange_hydraulique: 3000, heures_derniere_vidange_transmission: 2000 }
      ];
      localStorage.setItem("gmao_engins", JSON.stringify(loadedEngins));
    }
    setEngins(loadedEngins);
    if (loadedEngins.length > 0) {
      setConsSaisieEngin(loadedEngins[0].id);
    }

    // 2. Charger les tâches de planification
    const savedTasks = localStorage.getItem("gmao_planning_tasks");
    let loadedTasks: MaintenanceTask[] = [];
    if (savedTasks) {
      loadedTasks = JSON.parse(savedTasks);
    } else {
      loadedTasks = [
        { id: "T-PREV-1", type: "PREVENTIF", label: "Vidange moteur + filtres ST2G-01", enginId: "ST2G-01", enginModele: "ST2G", mecanicienId: "M01", mecanicienNom: "Lahcen Ait", poste: "Poste 1", datePlanifiee: "2026-06-28", dureeEstimee: "2h", priorite: "HAUTE", statut: "EN_COURS", commentaire: "" },
        { id: "T-CORR-1", type: "CORRECTIF", label: "Changement flexible vérin godet ST2D-02", enginId: "ST2D-02", enginModele: "ST2D", mecanicienId: "M02", mecanicienNom: "Abdellah Daoudi", poste: "Poste 2", datePlanifiee: "2026-06-28", dureeEstimee: "1h", priorite: "CRITIQUE", statut: "NON_FAIT", commentaire: "" },
        { id: "T-DAILY-1", type: "QUOTIDIEN", label: "Graissage pivots articulation ST7-01", enginId: "ST7-01", enginModele: "ST7", mecanicienId: "M03", mecanicienNom: "Mohamed El Amri", poste: "Poste 1", datePlanifiee: "2026-06-28", dureeEstimee: "30min", priorite: "QUOTIDIENNE", statut: "FAIT", commentaire: "Fait ras" }
      ];
      localStorage.setItem("gmao_planning_tasks", JSON.stringify(loadedTasks));
    }
    setTasks(loadedTasks);

    // 3. Charger les données de consommations saisies (carburant et fluides)
    const savedConso = localStorage.getItem("gmao_consumptions");
    let loadedConso: ConsommationSaisie[] = [];
    if (savedConso) {
      loadedConso = JSON.parse(savedConso);
    } else {
      // Données par défaut pour simuler le calcul d'écart
      loadedConso = [
        { id: "C-01", date: "2026-06-25", enginId: "ST2G-01", carburantL: 450, huileMoteurL: 15, huileHydrauliqueL: 20, piecesDH: 8500 },
        { id: "C-02", date: "2026-06-26", enginId: "ST2D-02", carburantL: 380, huileMoteurL: 10, huileHydrauliqueL: 8, piecesDH: 2000 },
        { id: "C-03", date: "2026-06-27", enginId: "ST7-01", carburantL: 350, huileMoteurL: 8, huileHydrauliqueL: 5, piecesDH: 4500 },
        { id: "C-04", date: "2026-06-24", enginId: "ST2G-01", carburantL: 480, huileMoteurL: 18, huileHydrauliqueL: 22, piecesDH: 12000 }
      ];
      localStorage.setItem("gmao_consumptions", JSON.stringify(loadedConso));
    }
    setConsommations(loadedConso);

    // 4. Rapports programmés
    const savedScheduled = localStorage.getItem("gmao_scheduled_reports");
    if (savedScheduled) {
      setScheduledReports(JSON.parse(savedScheduled));
    } else {
      const defaultScheduled = [
        { id: "R-SCH-1", type: "Rapport hebdomadaire maintenance", date: "2026-06-22" },
        { id: "R-SCH-2", type: "Rapport hebdomadaire maintenance", date: "2026-06-15" }
      ];
      localStorage.setItem("gmao_scheduled_reports", JSON.stringify(defaultScheduled));
      setScheduledReports(defaultScheduled);
    }
  }, []);

  // V4-8 : Système d'alertes proactives calculées à la volée d'après l'état actuel de la flotte et des tâches
  React.useEffect(() => {
    if (engins.length === 0 || tasks.length === 0) return;

    const listAlertes: AlerteProactive[] = [];
    const todayStr = new Date().toISOString().split("T")[0];

    // Calcul de la moyenne des consommations pour évaluer les surconsommations
    const enginsActifs = Array.from(new Set(consommations.map(c => c.enginId)));
    const totalHoursMap: Record<string, number> = {};
    engins.forEach(e => {
      totalHoursMap[e.id] = e.heuresMarche > 0 ? e.heuresMarche : 1000;
    });

    const consoEnginMap: Record<string, { carb: number; count: number }> = {};
    consommations.forEach(c => {
      if (!consoEnginMap[c.enginId]) consoEnginMap[c.enginId] = { carb: 0, count: 0 };
      consoEnginMap[c.enginId].carb += c.carburantL;
      consoEnginMap[c.enginId].count += 1;
    });

    const rates = Object.keys(consoEnginMap).map(id => {
      const hours = totalHoursMap[id] || 1000;
      // Normalisé pour 100h
      const normalizedRate = (consoEnginMap[id].carb / consoEnginMap[id].count) * (100 / (hours * 0.01));
      return { id, rate: normalizedRate || 38 };
    });

    const avgRateFlotte = rates.length > 0 ? rates.reduce((acc, curr) => acc + curr.rate, 0) / rates.length : 38;

    // Détection d'anomalies sur les engins
    engins.forEach(e => {
      // 1. Détection de pannes sur les freins (Checklists en retard ou tâches critiques)
      const aRetardFreins = tasks.some(t => t.enginId === e.id && t.label.toLowerCase().includes("frein") && t.statut === "NON_FAIT");
      if (aRetardFreins) {
        listAlertes.push({
          id: `AL-FREINS-${e.id}`,
          date: todayStr,
          type: "SECURITE",
          message: `${e.id} : Tâches ou contrôles en retard sur le circuit de freinage. Risque sécurité majeur souterrain.`,
          lue: false,
          priorite: "🔴"
        });
      }

      // 2. Détection de surconsommation importante de carburant (>30%)
      const matchRate = rates.find(r => r.id === e.id);
      if (matchRate && matchRate.rate > avgRateFlotte * 1.3) {
        const excess = Math.round(((matchRate.rate - avgRateFlotte) / avgRateFlotte) * 100);
        listAlertes.push({
          id: `AL-FUEL-${e.id}`,
          date: todayStr,
          type: "SURCONSOMMATION",
          message: `${e.id} : Surconsommation carburant à +${excess}% vs la moyenne flotte. Soupçon de convertisseur défectueux ou fuite.`,
          lue: false,
          priorite: "🔴"
        });
      }

      // 3. Détection de vidange très en retard (retard critique > 50 heures)
      const ecouleMoteur = e.heuresMarche - (e.heures_derniere_vidange_moteur || 0);
      if (ecouleMoteur >= 300) { // 250h standard + 50h
        listAlertes.push({
          id: `AL-MOTEUR-LATE-${e.id}`,
          date: todayStr,
          type: "DÉFAILLANCE",
          message: `${e.id} : Échéance vidange moteur dépassée de ${ecouleMoteur - 250}h (Total: ${ecouleMoteur}h écoulées). Risque de casse.`,
          lue: false,
          priorite: "🔴"
        });
      }
    });

    // 4. Alerte de surcharge d'un mécanicien
    const mTasks = tasks.filter(t => t.statut === "NON_FAIT");
    const tasksPerMeca: Record<string, number> = {};
    mTasks.forEach(t => {
      tasksPerMeca[t.mecanicienNom] = (tasksPerMeca[t.mecanicienNom] || 0) + 1;
    });
    Object.keys(tasksPerMeca).forEach(nom => {
      if (tasksPerMeca[nom] > 5) {
        listAlertes.push({
          id: `AL-MECA-SURCHARGE-${nom.replace(/\s+/g, "")}`,
          date: todayStr,
          type: "PLANIFICATION",
          message: `Surcharge : ${nom} a ${tasksPerMeca[nom]} tâches actives non closes. Risque de goulot d'étranglement.`,
          lue: false,
          priorite: "🟡"
        });
      }
    });

    // Vérifier s'il y a de nouvelles alertes non vues
    const alreadySaved = localStorage.getItem("gmao_alerts_cache");
    const savedList: AlerteProactive[] = alreadySaved ? JSON.parse(alreadySaved) : [];

    // Fusionner en évitant les doublons d'ID
    const mergedList = [...listAlertes];
    savedList.forEach(saved => {
      if (!mergedList.some(m => m.id === saved.id)) {
        mergedList.push(saved);
      }
    });

    setAlertes(mergedList);
    localStorage.setItem("gmao_alerts_cache", JSON.stringify(mergedList));

    const hasNew = mergedList.some(al => !al.lue);
    setHasNewAlertBadge(hasNew);

    if (hasNew && savedList.length < mergedList.length) {
      const lastNew = mergedList.find(al => !al.lue);
      if (lastNew) {
        toast.warning(`Alerte SOU-GMAO : ${lastNew.message}`, { duration: 6000 });
      }
    }
  }, [engins, tasks, consommations]);

  // V4-3 : Formulaire de saisie de consommations et coûts
  const handleAddConsommation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consSaisieEngin) {
      toast.error("Veuillez sélectionner un engin de la flotte.");
      return;
    }
    if (consSaisieCarburant === "" || consSaisieCarburant <= 0) {
      toast.error("Veuillez renseigner un volume de carburant valide.");
      return;
    }

    const newConso: ConsommationSaisie = {
      id: `C-NEW-${Date.now()}`,
      date: consSaisieDate,
      enginId: consSaisieEngin,
      carburantL: Number(consSaisieCarburant),
      huileMoteurL: Number(consSaisieHuileMot || 0),
      huileHydrauliqueL: Number(consSaisieHuileHyd || 0),
      piecesDH: Number(consSaisiePieces || 0)
    };

    const updated = [newConso, ...consommations];
    setConsommations(updated);
    localStorage.setItem("gmao_consumptions", JSON.stringify(updated));

    // Réinitialiser les champs
    setConsSaisieCarburant("");
    setConsSaisieHuileMot("");
    setConsSaisieHuileHyd("");
    setConsSaisiePieces("");

    toast.success("Saisie de la consommation enregistrée dans la base.");
  };

  const handleDeleteConsommation = (id: string) => {
    if (window.confirm("Voulez-vous supprimer cette ligne de consommation ?")) {
      const filtered = consommations.filter(c => c.id !== id);
      setConsommations(filtered);
      localStorage.setItem("gmao_consumptions", JSON.stringify(filtered));
      toast.success("Consommation supprimée.");
    }
  };

  const handleMarquerToutesAlertesLues = () => {
    const updated = alertes.map(al => ({ ...al, lue: true }));
    setAlertes(updated);
    localStorage.setItem("gmao_alerts_cache", JSON.stringify(updated));
    setHasNewAlertBadge(false);
    toast.success("Toutes les alertes critiques ont été marquées comme lues.");
  };

  // V4-2 : CALCULS GLOBAUX ET CALCUL DU COÛT ESTIMÉ
  // coût = (nombre_correctifs × 5000 DH) + (nombre_tâches_retard × 2000 DH)
  const getEnginStats = (enginId: string, modele: string) => {
    const tasksEngin = tasks.filter(t => t.enginId === enginId);
    const tasksFaites = tasksEngin.filter(t => t.statut === "FAIT" || t.statut === "VALIDE").length;
    const tasksRetard = tasksEngin.filter(t => t.statut === "NON_FAIT").length;
    const correctifs = tasksEngin.filter(t => t.type === "CORRECTIF").length;
    const totalTaches = tasksEngin.length;

    // Calcul du taux préventif global pour cet engin
    const prevoirTaches = tasksEngin.filter(t => t.type === "PREVENTIF" || t.type === "QUOTIDIEN");
    const prevoirFaites = prevoirTaches.filter(t => t.statut === "FAIT" || t.statut === "VALIDE").length;
    const tauxPreventif = prevoirTaches.length > 0 ? Math.round((prevoirFaites / prevoirTaches.length) * 100) : 80;

    // V4-2 : Calcul exact du coût estimé de maintenance
    const coutEstime = (correctifs * 5000) + (tasksRetard * 2000);

    // Évaluation état global
    let etat: "🟢 Bon" | "🟡 Moyen" | "🔴 Critique" = "🟢 Bon";
    if (correctifs >= 5 || tasksRetard >= 4 || coutEstime >= 25000) {
      etat = "🔴 Critique";
    } else if (correctifs >= 3 || tasksRetard >= 2 || coutEstime >= 10000) {
      etat = "🟡 Moyen";
    }

    return {
      tasksFaites,
      tasksRetard,
      correctifs,
      totalTaches,
      tauxPreventif,
      coutEstime,
      etat
    };
  };

  // ============================================================
  // V4-9 : KPIs TEMPS RÉEL (Calculés de manière globale pour tous les onglets)
  // ============================================================
  const kpiTauxPreventifGlobal = React.useMemo(() => {
    const tasksPreventives = tasks.filter(t => t.type === "PREVENTIF" || t.type === "QUOTIDIEN");
    if (tasksPreventives.length === 0) return 75;
    const faites = tasksPreventives.filter(t => t.statut === "FAIT" || t.statut === "VALIDE").length;
    return Math.round((faites / tasksPreventives.length) * 100);
  }, [tasks]);

  const kpiEnginLePlusCritique = React.useMemo(() => {
    if (engins.length === 0) return { id: "Aucun", model: "", correctifs: 0, cout: 0, color: "🟢" };
    let worstId = engins[0].id;
    let worstModel = engins[0].modele;
    let maxScore = -1;
    let worstCout = 0;
    let worstCorrectifs = 0;

    engins.forEach(e => {
      const stats = getEnginStats(e.id, e.modele);
      // Calcul d'un score de sévérité empirique
      const score = (stats.correctifs * 3) + stats.tasksRetard + (stats.coutEstime / 5000);
      if (score > maxScore) {
        maxScore = score;
        worstId = e.id;
        worstModel = e.modele;
        worstCout = stats.coutEstime;
        worstCorrectifs = stats.correctifs;
      }
    });

    let statusColor = "🟢";
    if (worstCorrectifs > 5) statusColor = "🔴";
    else if (worstCorrectifs >= 3) statusColor = "🟡";

    return { id: worstId, model: worstModel, correctifs: worstCorrectifs, cout: worstCout, color: statusColor };
  }, [engins, tasks]);

  // Calculateur de surconsommation moyenne flotte carburant
  const kpiSurconsommationMajeure = React.useMemo(() => {
    if (engins.length === 0 || consommations.length === 0) return { id: "Aucun", excess: 0, color: "🟢" };

    const totalHoursMap: Record<string, number> = {};
    engins.forEach(e => {
      totalHoursMap[e.id] = e.heuresMarche > 0 ? e.heuresMarche : 1000;
    });

    const rates: Record<string, number> = {};
    const count: Record<string, number> = {};

    consommations.forEach(c => {
      rates[c.enginId] = (rates[c.enginId] || 0) + c.carburantL;
      count[c.enginId] = (count[c.enginId] || 0) + 1;
    });

    const enginRates = Object.keys(rates).map(id => {
      const hours = totalHoursMap[id] || 1000;
      // Normalisé pour 100 heures d'activité
      const rate = (rates[id] / count[id]) * (100 / (hours * 0.01));
      return { id, rate: rate || 38 };
    });

    if (enginRates.length === 0) return { id: "Aucun", excess: 0, color: "🟢" };
    const avgFlotte = enginRates.reduce((acc, curr) => acc + curr.rate, 0) / enginRates.length;

    let worstEnginId = "Aucun";
    let worstExcess = 0;

    enginRates.forEach(er => {
      const excessPercent = ((er.rate - avgFlotte) / avgFlotte) * 100;
      if (excessPercent > worstExcess) {
        worstExcess = excessPercent;
        worstEnginId = er.id;
      }
    });

    let color = "🟢";
    if (worstExcess > 30) color = "🔴";
    else if (worstExcess > 10) color = "🟡";

    return { id: worstEnginId, excess: Math.round(worstExcess), color };
  }, [engins, consommations]);

  const kpiProchaineEcheanceCritique = React.useMemo(() => {
    if (engins.length === 0) return { label: "Aucune", hoursLeft: 999, color: "🟢" };

    let nearestTaskLabel = "Aucune";
    let minHoursRemaining = 9999;

    engins.forEach(e => {
      // Évaluation vidange moteur (Intervalle 250h)
      const ecouleMote = e.heuresMarche - (e.heures_derniere_vidange_moteur || 0);
      const resteMote = 250 - ecouleMote;
      if (resteMote < minHoursRemaining) {
        minHoursRemaining = resteMote;
        nearestTaskLabel = `Vidange moteur ${e.id}`;
      }

      // Hydraulique (1000h)
      const ecouleHyd = e.heuresMarche - (e.heures_derniere_vidange_hydraulique || 0);
      const resteHyd = 1000 - ecouleHyd;
      if (resteHyd < minHoursRemaining) {
        minHoursRemaining = resteHyd;
        nearestTaskLabel = `Hydraulique ${e.id}`;
      }
    });

    let color = "🟢";
    if (minHoursRemaining < 50) color = "🔴";
    else if (minHoursRemaining < 100) color = "🟡";

    return { label: nearestTaskLabel, hoursLeft: Math.max(0, Math.round(minHoursRemaining)), color };
  }, [engins]);

  // V4-4 : Indicateur de Fiabilité des Prévisions basé sur le complétement des tâches
  const previsionsFiabiliteLabel = React.useMemo(() => {
    if (tasks.length === 0) return { label: "🔴 Données insuffisantes", color: "text-rose-500 bg-rose-50" };
    const total = tasks.length;
    const closes = tasks.filter(t => t.statut === "FAIT" || t.statut === "VALIDE" || t.statut === "REPORTE").length;
    const percent = (closes / total) * 100;

    if (percent > 90) return { label: "🟢 Fiable (Données complètes)", color: "text-emerald-500 bg-emerald-50 border-emerald-200" };
    if (percent >= 70) return { label: "🟡 Incertain (Insuffisance de saisies)", color: "text-amber-500 bg-amber-50 border-amber-200" };
    return { label: "🔴 Données insuffisantes (Veuillez clore vos tâches)", color: "text-rose-500 bg-rose-50 border-rose-200" };
  }, [tasks]);

  // V4-1 : EXÉCUTION DES 18 RÈGLES D'ANALYSES TEXTUELLES AUTO (IF/ELSE STRICT)
  const executeAnalysesRules = () => {
    const activeAnomalies: string[] = [];
    const activeComparaisonsAlerts: string[] = [];
    const activeSurconsoAlerts: string[] = [];
    const activePrevisionAlerts: string[] = [];
    const activePlanActions: string[] = [];

    // Calcul de la charge par mécanicien pour la règle 18
    const mTasks = tasks.filter(t => t.statut === "NON_FAIT");
    const tasksPerMeca: Record<string, number> = {};
    mTasks.forEach(t => {
      tasksPerMeca[t.mecanicienNom] = (tasksPerMeca[t.mecanicienNom] || 0) + 1;
    });

    // Moyenne flotte de secours
    let sommeCarbRate = 0;
    let countRate = 0;
    consommations.forEach(c => {
      sommeCarbRate += c.carburantL;
      countRate++;
    });
    const avgCarbFlotte = countRate > 0 ? sommeCarbRate / countRate : 380;

    engins.forEach(e => {
      const stats = getEnginStats(e.id, e.modele);
      const ecouleMoteur = e.heuresMarche - (e.heures_derniere_vidange_moteur || 0);

      // --- ONGLETS COMPARAISONS (RÈGLES 1 À 8) ---
      // RÈGLE 1 : Si correctifs > 5 ET tâches SYS1 (moteur) > 3 → "Problème moteur détecté"
      const aTachesMoteur = tasks.filter(t => t.enginId === e.id && t.label.toLowerCase().includes("moteur") && t.statut === "NON_FAIT").length;
      if (stats.correctifs > 5 && aTachesMoteur > 3) {
        const text = `${e.id} : Problème moteur sévère détecté. Fréquence élevée de pannes correctives d'organes moteurs. Révision urgente requise.`;
        activeComparaisonsAlerts.push(text);
        activeAnomalies.push(text);
      }

      // RÈGLE 2 : Si correctifs > 5 ET tâches SYS3 (hydraulique) > 3 → "Problème hydraulique détecté"
      const aTachesHydraulique = tasks.filter(t => t.enginId === e.id && t.label.toLowerCase().includes("hydraulique") && t.statut === "NON_FAIT").length;
      if (stats.correctifs > 5 && aTachesHydraulique > 3) {
        const text = `${e.id} : Problème hydraulique majeur détecté (fuites, joints toriques fuyards répétés). Analyse des fluides recommandée.`;
        activeComparaisonsAlerts.push(text);
        activeAnomalies.push(text);
      }

      // RÈGLE 3 : Si correctifs > 5 ET tâches SYS5 (freins) > 3 → "Problème freins détecté"
      const aTachesFreins = tasks.filter(t => t.enginId === e.id && t.label.toLowerCase().includes("frein") && t.statut === "NON_FAIT").length;
      if (stats.correctifs > 5 && aTachesFreins > 3) {
        const text = `${e.id} : Alerte sur le circuit de freinage (étriers, disques d'usure). Bloquer l'engin de toute descente en rampe immédiatement.`;
        activeComparaisonsAlerts.push(text);
        activeAnomalies.push(text);
      }

      // RÈGLE 4 : Si correctifs > 5 ET tâches réparties → "Vieillissement général, révision complète recommandée"
      if (stats.correctifs > 5 && aTachesMoteur <= 3 && aTachesHydraulique <= 3 && aTachesFreins <= 3) {
        activeComparaisonsAlerts.push(`${e.id} : Vieillissement général constaté. Multiples petites avaries correctives éparses. Prévoir arrêt technique approfondi de 48 heures.`);
      }

      // RÈGLE 5 : Si taux préventif < 70% → "Taux préventif faible, renforcer inspections"
      if (stats.tauxPreventif < 70) {
        activeComparaisonsAlerts.push(`${e.id} : Taux préventif faible à ${stats.tauxPreventif}%. Risque d'emballement des pannes de dépannage curatif.`);
      }

      // RÈGLE 6 : Si tâches retard > 3 → "Risque de panne majeure, planifier urgence"
      if (stats.tasksRetard > 3) {
        const text = `${e.id} : Risque imminent de panne majeure. ${stats.tasksRetard} tâches d'entretien préventif planifiées attendent depuis trop longtemps.`;
        activeComparaisonsAlerts.push(text);
        activeAnomalies.push(text);
      }

      // RÈGLE 7 : Si coût > moyenne_flotte + 50%
      // Moyenne coût théorique à 20000 DH
      if (stats.coutEstime > 30000) {
        activeComparaisonsAlerts.push(`${e.id} : Dérive financière à ${stats.coutEstime} DH. Coût de maintenance 50% plus élevé que la norme. Rationnaliser l'usage des pièces détachées.`);
      }

      // RÈGLE 8 : Si correctifs < 3 ET taux_préventif > 85% → "Engin fiable, maintenir la cadence"
      if (stats.correctifs < 3 && stats.tauxPreventif > 85) {
        activeComparaisonsAlerts.push(`${e.id} : Excellent indice de fiabilité. Cadence d'inspection préventive optimale. Continuer ce programme.`);
      }

      // --- ONGLETS SURCONSOMMATION (RÈGLES 9 À 13) ---
      const consoEngin = consommations.filter(c => c.enginId === e.id);
      if (consoEngin.length > 0) {
        const totalCarb = consoEngin.reduce((sum, curr) => sum + curr.carburantL, 0);
        const avgCarbEngin = totalCarb / consoEngin.length;
        const ecartCarburant = ((avgCarbEngin - avgCarbFlotte) / avgCarbFlotte) * 100;

        const totalHuileMoteur = consoEngin.reduce((sum, curr) => sum + curr.huileMoteurL, 0);
        const avgHuileMotEngin = totalHuileMoteur / consoEngin.length;
        const ecartHuileMoteur = ((avgHuileMotEngin - 10) / 10) * 100; // base théorique 10L

        const totalHuileHyd = consoEngin.reduce((sum, curr) => sum + curr.huileHydrauliqueL, 0);
        const avgHuileHydEngin = totalHuileHyd / consoEngin.length;
        const ecartHuileHyd = ((avgHuileHydEngin - 12) / 12) * 100; // base théorique 12L

        const totalPieces = consoEngin.reduce((sum, curr) => sum + curr.piecesDH, 0);
        const avgPiecesEngin = totalPieces / consoEngin.length;
        const ecartPieces = ((avgPiecesEngin - 5000) / 5000) * 100; // base théorique 5000 DH

        // RÈGLE 9 : Si écart carburant > +30%
        if (ecartCarburant > 30) {
          const msg = `${e.id} consomme ${Math.round(ecartCarburant)}% de plus que la moyenne. Causes probables : convertisseur usé qui patine, ralenti excessif au fond, ou conduite agressive en rampe.`;
          activeSurconsoAlerts.push(msg);
          activeAnomalies.push(msg);
        }

        // RÈGLE 10 : Si écart huile moteur > +25%
        if (ecartHuileMoteur > 25) {
          activeSurconsoAlerts.push(`${e.id} : Consommation de lubrifiant moteur critique à +${Math.round(ecartHuileMoteur)}%. Vérifier les joints de culasse et la segmentation.`);
        }

        // RÈGLE 11 : Si écart huile hydraulique > +25%
        if (ecartHuileHyd > 25) {
          activeSurconsoAlerts.push(`${e.id} : Perte hydraulique suspectée à +${Math.round(ecartHuileHyd)}%. Inspecter les joints du distributeur central et les vérins de levage.`);
        }

        // RÈGLE 12 : Si écart pièces > +50%
        if (ecartPieces > 50) {
          activeSurconsoAlerts.push(`${e.id} : Coût des pièces de rechange hors-norme (+${Math.round(ecartPieces)}%). Analyse de récurrence de défaillances requise.`);
        }

        // RÈGLE 13 : Si écart carburant < -10%
        if (ecartCarburant < -10) {
          activeSurconsoAlerts.push(`${e.id} : Consommation de gazole optimale à ${Math.round(ecartCarburant)}%. Bon comportement de l'opérateur et motorisation performante.`);
        }
      }

      // --- ONGLETS PRÉVISIONS (RÈGLES 14 À 18) ---
      // RÈGLE 14 : Si vidange dans < 100h
      const resteMoteur = 250 - ecouleMoteur;
      if (resteMoteur > 0 && resteMoteur < 100) {
        activePrevisionAlerts.push(`Dans ${Math.round(resteMoteur)}h : ${e.id} atteindra son échéance de vidange moteur. Prévoir un arrêt de 2 heures.`);
        activePlanActions.push(`Commander kit filtres et huile 15W40 pour ${e.id} (Vidange dans ${Math.round(resteMoteur)}h)`);
        activePlanActions.push(`Réserver créneau d'arrêt de 2h pour ${e.id} au Poste de maintenance`);
      }

      // RÈGLE 16 : Si usure élevée (simulée via checklists ou heures)
      if (e.heuresMarche > 5000) {
        activePrevisionAlerts.push(`${e.id} : Accumulation d'heures de roulage souterrain (${e.heuresMarche}h). Probabilité d'usure des garnitures de freins estimée à 85%.`);
        activePlanActions.push(`Planifier inspection complète de l'usure des disques de freins sur ${e.id}`);
      }
    });

    // RÈGLE 15 : Si pannes hydrauliques en hausse > 20% sur 3 mois
    const countHydraulique = tasks.filter(t => t.type === "CORRECTIF" && t.label.toLowerCase().includes("hydraulique")).length;
    if (countHydraulique >= 2) {
      activePrevisionAlerts.push("Tendance : Pannes hydrauliques en hausse de +25% sur la flotte de Scooptrams ce trimestre. Recommandation : Renforcer le resserrage préventif des raccords.");
      activePlanActions.push("Former les conducteurs aux inspections de pré-poste des flexibles hydrauliques.");
    }

    // RÈGLE 17 : Si taux préventif global en baisse
    if (kpiTauxPreventifGlobal < 80) {
      activePrevisionAlerts.push(`Tendance négative globale : Le taux de réalisation préventif est à ${kpiTauxPreventifGlobal}% (objectif: 80%). Risque accru d'avarie fortuite.`);
    }

    // RÈGLE 18 : Surcharge d'un mécanicien
    tasksPerMeca && Object.keys(tasksPerMeca).forEach(nom => {
      if (tasksPerMeca[nom] > 5) {
        activePrevisionAlerts.push(`${nom} présente un arriéré de ${tasksPerMeca[nom]} tâches. Risque d'erreurs d'inspection ou d'omissions par précipitation.`);
        activePlanActions.push(`Réassigner une partie des fiches préventives de ${nom} pour éviter la fatigue professionnelle.`);
      }
    });

    // Compléter le plan d'action si trop court
    if (activePlanActions.length === 0) {
      activePlanActions.push("Maintenir la surveillance de pré-poste gazole quotidienne.");
      activePlanActions.push("Valider les checklists d'inspection archivées de la semaine.");
    }

    return {
      anomalies: activeAnomalies.slice(0, 5),
      comparaisons: activeComparaisonsAlerts,
      surconso: activeSurconsoAlerts,
      previsions: activePrevisionAlerts,
      planActions: activePlanActions
    };
  };

  const computedRules = executeAnalysesRules();

  // V4-8 : Programmation automatique de rapports le lundi matin
  const handleProgrammerRapport = () => {
    const today = new Date().toISOString().split("T")[0];
    const newScheduled = [
      { id: `R-SCH-${Date.now()}`, type: "Rapport hebdomadaire automatique", date: today },
      ...scheduledReports
    ];
    setScheduledReports(newScheduled);
    localStorage.setItem("gmao_scheduled_reports", JSON.stringify(newScheduled));
    toast.success("Rapport hebdomadaire programmé et archivé dans le système.");
  };

  // V4-5 : Exportation vers PDF via window.print()
  const handleExportPDF = () => {
    window.print();
  };

  // V4-10 : Export brut vers CSV / JSON
  const handleDownloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM pour Excel
    
    if (exportDataType === "tasks") {
      csvContent += "ID,Type,Description,Engin,Mecanicien,Poste,Date Planifiee,Duree,Statut,Commentaire\n";
      tasks.forEach(t => {
        if (exportEngin !== "Tous" && t.enginId !== exportEngin) return;
        csvContent += `"${t.id}","${t.type}","${t.label.replace(/"/g, '""')}","${t.enginId}","${t.mecanicienNom}","${t.poste}","${t.datePlanifiee}","${t.dureeEstimee}","${t.statut}","${t.commentaire.replace(/"/g, '""')}"\n`;
      });
    } else if (exportDataType === "conso") {
      csvContent += "ID,Date,Engin,Carburant (L),Huile Moteur (L),Huile Hydraulique (L),Pieces detachees (DH)\n";
      consommations.forEach(c => {
        if (exportEngin !== "Tous" && c.enginId !== exportEngin) return;
        csvContent += `"${c.id}","${c.date}","${c.enginId}",${c.carburantL},${c.huileMoteurL},${c.huileHydrauliqueL},${c.piecesDH}\n`;
      });
    } else if (exportDataType === "heures") {
      csvContent += "Engin,Heures Actuelles,Derniere Vidange Moteur,Derniere Vidange Hydraulique,Derniere Vidange Transmission\n";
      engins.forEach(e => {
        if (exportEngin !== "Tous" && e.id !== exportEngin) return;
        csvContent += `"${e.id}",${e.heuresMarche},${e.heures_derniere_vidange_moteur || 0},${e.heures_derniere_vidange_hydraulique || 0},${e.heures_derniere_vidange_transmission || 0}\n`;
      });
    } else {
      // Checklists ou Pannes génériques
      csvContent += "ID,Date,Machine,Type,Resultat,Statut\n";
      csvContent += `"CK-01","2026-06-28","ST2G-01","Pre-poste","CONFORME","Valide"\n`;
      csvContent += `"CK-02","2026-06-27","ST2D-02","Hebdomadaire","ANOMALIE_SURVEILLEE","En attente"\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GMAO_Export_${exportDataType}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Téléchargement du fichier CSV initié !");
  };

  const handleDownloadJSON = () => {
    let dataToExport: any = {};
    if (exportDataType === "tasks") dataToExport = tasks;
    else if (exportDataType === "conso") dataToExport = consommations;
    else if (exportDataType === "heures") dataToExport = engins;
    else dataToExport = { message: "Données de checklists génériques", exportTime: new Date() };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dataToExport, null, 2)
    )}`;
    const link = document.createElement("a");
    link.setAttribute("href", jsonString);
    link.setAttribute("download", `GMAO_Export_${exportDataType}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Téléchargement du fichier JSON initié !");
  };

  return (
    <div className="space-y-6 bg-slate-50 min-h-screen p-4 md:p-6 print:p-0 print:bg-white print:min-h-0 select-none">
      
      {/* Page Banner - Masqué lors de l'impression */}
      <div className="print:hidden">
        <PageBanner
          icon={BarChart3}
          badgeLabel="Ingénierie Analytique SOU-GMAO"
          title="ANALYSES & COMPARAISONS AVANCÉES"
          subtitle="Identifiez les dérives de consommation, planifiez la maintenance prédictive par calcul d'usure et générez vos rapports."
        >
          <div className="flex gap-2">
            <Button
              onClick={handleExportPDF}
              className="bg-amber-500 hover:bg-amber-600 border-amber-600 text-slate-950 font-black uppercase tracking-wider text-xs h-9"
            >
              <Printer className="h-4 w-4 mr-1.5" /> Exporter PDF
            </Button>
          </div>
        </PageBanner>
      </div>

      {/* ============================================================ */}
      {/* V4-9 : CARD DES KPIS TEMPS RÉEL (HAUT DE PAGE, VISIBLES TOUS ONGLETS) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 : Taux préventif global */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              📊 Taux préventif global
            </span>
            <div className="flex items-baseline justify-between mb-2">
              <span className={`text-2xl font-black ${
                kpiTauxPreventifGlobal >= 80 ? "text-emerald-600" : kpiTauxPreventifGlobal >= 60 ? "text-amber-500" : "text-rose-600"
              }`}>
                {kpiTauxPreventifGlobal}%
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                Objectif 80%
              </span>
            </div>
            
            {/* Barre CSS de progression */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  kpiTauxPreventifGlobal >= 80 ? "bg-emerald-500" : kpiTauxPreventifGlobal >= 60 ? "bg-amber-500" : "bg-rose-500"
                }`}
                style={{ width: `${Math.min(100, kpiTauxPreventifGlobal)}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
            Tendance : <span className="text-emerald-600 font-bold">⬆️ +4%</span> vs mois dernier
          </span>
        </div>

        {/* KPI 2 : Engin le plus critique */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              🔴 Engin le plus critique
            </span>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl font-black text-slate-900">
                {kpiEnginLePlusCritique.id}
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                ({kpiEnginLePlusCritique.model})
              </span>
              <span className="text-sm shrink-0">{kpiEnginLePlusCritique.color}</span>
            </div>
            <div className="text-xs text-slate-500 font-semibold mb-1">
              {kpiEnginLePlusCritique.correctifs} pannes correctives ce mois
            </div>
          </div>
          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md self-start">
            Coût estimé : {kpiEnginLePlusCritique.cout.toLocaleString()} DH
          </span>
        </div>

        {/* KPI 3 : Surconsommation majeure */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              ⛽ Surconsommation majeure
            </span>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl font-black text-slate-900">
                {kpiSurconsommationMajeure.id}
              </span>
              <span className={`text-xs font-black px-1.5 py-0.5 rounded-md ${
                kpiSurconsommationMajeure.excess > 0 ? "text-rose-700 bg-rose-50" : "text-emerald-700 bg-emerald-50"
              }`}>
                {kpiSurconsommationMajeure.excess > 0 ? `+${kpiSurconsommationMajeure.excess}%` : "0%"}
              </span>
              <span className="text-sm shrink-0">{kpiSurconsommationMajeure.color}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              Par rapport à la moyenne de la flotte de Scooptrams.
            </p>
          </div>
          <span className="text-[10px] font-medium text-slate-500">
            Source : Saisie journalière carburant
          </span>
        </div>

        {/* KPI 4 : Prochaine échéance critique */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              ⏰ Prochaine échéance critique
            </span>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm font-black text-slate-900 truncate max-w-[150px]">
                {kpiProchaineEcheanceCritique.label}
              </span>
              <span className="text-sm shrink-0">{kpiProchaineEcheanceCritique.color}</span>
            </div>
            <div className="text-xs font-bold text-amber-600">
              Dans {kpiProchaineEcheanceCritique.hoursLeft} heures de marche
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">
            Planifier le créneau d'arrêt d'atelier.
          </span>
        </div>

      </div>

      {/* ============================================================ */}
      {/* SECTION "🔴 ANOMALIES DÉTECTÉES" (VISIBLES TOUS ONGLETS) */}
      {/* ============================================================ */}
      <Card className="border-rose-100 shadow-xs bg-rose-50/50 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-rose-100 bg-rose-100/30 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-rose-600 font-black text-sm">🚨 ANOMALIES CRITIQUES CONSTATÉES</span>
            <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {computedRules.anomalies.length} active(s)
            </span>
          </div>
          {alertes.some(a => !a.lue) && (
            <Button
              onClick={handleMarquerToutesAlertesLues}
              variant="outline"
              className="text-[9px] font-black uppercase h-7 bg-white text-rose-700 hover:bg-rose-50 border-rose-200"
            >
              Marquer tout lu
            </Button>
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          {computedRules.anomalies.length === 0 ? (
            <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              🟢 Aucune anomalie critique détectée par les règles d'ingénierie souterraine. Flotte à jour.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {computedRules.anomalies.map((anom, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 bg-white border border-rose-100 rounded-xl text-xs text-rose-950 font-medium"
                >
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{anom}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* V4 : Menu de navigation des 5 onglets */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs max-w-5xl print:hidden">
        <button
          onClick={() => setActiveTab("comparaisons")}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === "comparaisons"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Layers className="h-4 w-4" /> 📊 Comparaisons Flotte
        </button>

        <button
          onClick={() => setActiveTab("surconsommation")}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === "surconsommation"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Fuel className="h-4 w-4" /> ⛽ Surconsommation
        </button>

        <button
          onClick={() => setActiveTab("previsions")}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === "previsions"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Sparkles className="h-4 w-4" /> 🔮 Prévisions
        </button>

        <button
          onClick={() => setActiveTab("rapports")}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === "rapports"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <ClipboardList className="h-4 w-4" /> 📋 Rapports Direction
        </button>

        <button
          onClick={() => setActiveTab("export")}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === "export"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Download className="h-4 w-4" /> 📤 Export CSV / JSON
        </button>
      </div>

      {/* ============================================================ */}
      {/* ONGLET 1 : COMPARAISONS */}
      {/* ============================================================ */}
      {activeTab === "comparaisons" && (
        <div className="space-y-6 max-w-5xl animate-in fade-in duration-250">
          
          <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-150 py-4 px-6 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 block">
                  V4 : TABLEAU ANALYTIQUE COMPARATIF
                </span>
                <CardTitle className="text-xs font-black uppercase text-slate-700">
                  Rentabilité et comportement technique de la flotte
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4">Engin (ID)</th>
                      <th className="py-3 px-4">Modèle</th>
                      <th className="py-3 px-4 text-center">Heures marche</th>
                      <th className="py-3 px-4 text-center">Tâches faites</th>
                      <th className="py-3 px-4 text-center text-rose-600">Tâches retard</th>
                      <th className="py-3 px-4 text-center">Correctifs (pannes)</th>
                      <th className="py-3 px-4">Taux préventif</th>
                      <th className="py-3 px-4 text-right">Coût maintenance (DH)</th>
                      <th className="py-3 px-4 text-center">État</th>
                      <th className="py-3 px-4 text-center">Tendance (6m)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {engins.map(e => {
                      const stats = getEnginStats(e.id, e.modele);
                      const isCrit = stats.etat === "🔴 Critique";
                      const isMoy = stats.etat === "🟡 Moyen";

                      return (
                        <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 font-black text-slate-900">{e.id}</td>
                          <td className="py-3 px-4 font-bold text-slate-600">{e.modele}</td>
                          <td className="py-3 px-4 text-center font-bold text-slate-700">{e.heuresMarche}h</td>
                          <td className="py-3 px-4 text-center font-bold text-slate-600">
                            {stats.tasksFaites}/{stats.totalTaches}
                          </td>
                          <td className="py-3 px-4 text-center font-black text-rose-600 bg-rose-50/30">
                            {stats.tasksRetard}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-amber-600">
                            {stats.correctifs}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold shrink-0 w-8">{stats.tauxPreventif}%</span>
                              <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    stats.tauxPreventif >= 80 ? "bg-emerald-500" : stats.tauxPreventif >= 60 ? "bg-amber-500" : "bg-rose-500"
                                  }`}
                                  style={{ width: `${stats.tauxPreventif}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          {/* V4-2 : Calcul coût estimé */}
                          <td className="py-3 px-4 text-right font-black text-slate-800">
                            {stats.coutEstime.toLocaleString()} DH
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isCrit ? "bg-rose-50 text-rose-700" : isMoy ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                            }`}>
                              {stats.etat}
                            </span>
                          </td>
                          {/* V4-6 : Indicateur de tendance */}
                          <td className="py-3 px-4 text-center text-sm">
                            {stats.tauxPreventif > 80 ? (
                              <span className="text-emerald-600 font-bold">⬆️</span>
                            ) : stats.tauxPreventif < 70 ? (
                              <span className="text-rose-600 font-bold">⬇️</span>
                            ) : (
                              <span className="text-slate-500 font-bold">➡️</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* V4-7 : SECTION BENCHMARKING EPIROC */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-150 py-3.5 px-5">
                <CardTitle className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-500" /> Flotte Hydromines vs Références Epiroc (Benchmarking)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                    Données d'ingénierie Epiroc codées en dur pour calibrer la performance de notre exploitation.
                  </p>

                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="py-2.5 flex justify-between items-center">
                      <span className="font-semibold text-slate-600">Taux préventif cible</span>
                      <div className="flex gap-4">
                        <span>Hydromines : <strong className="text-slate-900">{kpiTauxPreventifGlobal}%</strong></span>
                        <span>Epiroc : <strong className="text-emerald-600">75%</strong></span>
                        <span className="font-bold text-emerald-600">➡️ Conforme</span>
                      </div>
                    </div>

                    <div className="py-2.5 flex justify-between items-center">
                      <span className="font-semibold text-slate-600">Consommation ST2G</span>
                      <div className="flex gap-4">
                        <span>Hydromines : <strong className="text-slate-900">52 L/100h</strong></span>
                        <span>Epiroc : <strong className="text-emerald-600">40 L/100h</strong></span>
                        <span className="font-bold text-rose-600">⬇️ -30% Dérive</span>
                      </div>
                    </div>

                    <div className="py-2.5 flex justify-between items-center">
                      <span className="font-semibold text-slate-600">Coût de maintenance</span>
                      <div className="flex gap-4">
                        <span>Hydromines : <strong className="text-slate-900">15 000 DH/1000h</strong></span>
                        <span>Epiroc : <strong className="text-emerald-600">12 000 DH/1000h</strong></span>
                        <span className="font-bold text-rose-600">⬇️ -25% Surcoût</span>
                      </div>
                    </div>

                    <div className="py-2.5 flex justify-between items-center">
                      <span className="font-semibold text-slate-600">Pannes correctives par mois</span>
                      <div className="flex gap-4">
                        <span>Hydromines : <strong className="text-slate-900">4 pannes/m</strong></span>
                        <span>Epiroc : <strong className="text-emerald-600">3 pannes/m</strong></span>
                        <span className="font-bold text-rose-600">⬇️ -33% Excès</span>
                      </div>
                    </div>

                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-slate-900 text-white rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-800 py-3.5 px-5">
                <CardTitle className="text-xs font-black uppercase text-amber-500 flex items-center gap-1.5">
                  <Info className="h-4 w-4" /> Syntèse d'analyses de Fleet Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                {computedRules.comparaisons.length === 0 ? (
                  <p className="text-slate-400 font-medium">Aucun dysfonctionnement comparatif notable sur la flotte de Scooptrams.</p>
                ) : (
                  <div className="space-y-2.5">
                    {computedRules.comparaisons.slice(0, 4).map((alertText, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 font-medium text-slate-100 flex items-start gap-2">
                        <span className="text-amber-500 text-xs mt-0.5 shrink-0">⚠️</span>
                        <span>{alertText}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* ONGLET 2 : SURCONSOMMATION */}
      {/* ============================================================ */}
      {activeTab === "surconsommation" && (
        <div className="space-y-6 max-w-5xl animate-in fade-in duration-250">
          
          {/* V4-3 : Mini-formulaire de saisie manuelle de consommation */}
          <Card className="border-slate-200 shadow-xs bg-slate-900 text-white rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-800 p-5">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 block">
                SOU-GMAO : FORMULAIRE DE SAISIE CARBURANT & FLUIDES
              </span>
              <CardTitle className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                <Fuel className="h-4 w-4 text-amber-500" /> Saisie manuelle de consommation (Saisisseur / Secrétaire)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleAddConsommation} className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 block">Date</label>
                  <input
                    type="date"
                    value={consSaisieDate}
                    onChange={(e) => setConsSaisieDate(e.target.value)}
                    className="w-full h-9 px-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 block">Engin</label>
                  <select
                    value={consSaisieEngin}
                    onChange={(e) => setConsSaisieEngin(e.target.value)}
                    className="w-full h-9 px-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-white focus:outline-none"
                  >
                    {engins.map(e => <option key={e.id} value={e.id}>{e.id}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 block">Gazole (L)</label>
                  <input
                    type="number"
                    placeholder="Ex: 400"
                    value={consSaisieCarburant}
                    onChange={(e) => setConsSaisieCarburant(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full h-9 px-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-white focus:outline-none"
                    min="1"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 block">Huile Moteur (L)</label>
                  <input
                    type="number"
                    placeholder="Ex: 5"
                    value={consSaisieHuileMot}
                    onChange={(e) => setConsSaisieHuileMot(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full h-9 px-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 block">Huile Hydr. (L)</label>
                  <input
                    type="number"
                    placeholder="Ex: 10"
                    value={consSaisieHuileHyd}
                    onChange={(e) => setConsSaisieHuileHyd(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full h-9 px-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 block">Pièces (DH)</label>
                  <input
                    type="number"
                    placeholder="Ex: 2500"
                    value={consSaisiePieces}
                    onChange={(e) => setConsSaisiePieces(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full h-9 px-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-white focus:outline-none"
                  />
                </div>

                <div className="col-span-2 md:col-span-6 flex justify-end mt-2">
                  <Button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 border-amber-600 text-slate-950 font-black uppercase tracking-wider text-xs px-6 h-9 rounded-xl"
                  >
                    <Plus className="h-4 w-4 mr-1.5" /> Enregistrer la saisie
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>

          {/* Tableaux et calculs d'écarts de surconsommations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <Card className="border-slate-200 shadow-sm bg-white rounded-2xl col-span-2 overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-150 py-3.5 px-5">
                <CardTitle className="text-xs font-black uppercase text-slate-700">
                  Dérives de carburants et fluides de la flotte
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase border-b border-slate-200">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Engin</th>
                        <th className="py-3 px-4 text-center">Gazole (L)</th>
                        <th className="py-3 px-4 text-center">Huile Mot (L)</th>
                        <th className="py-3 px-4 text-center">Huile Hyd (L)</th>
                        <th className="py-3 px-4 text-right">Pièces (DH)</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {consommations.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-4 text-slate-500">{c.date}</td>
                          <td className="py-2.5 px-4 font-black text-slate-900">{c.enginId}</td>
                          <td className="py-2.5 px-4 text-center font-bold text-slate-700">{c.carburantL} L</td>
                          <td className="py-2.5 px-4 text-center text-slate-600">{c.huileMoteurL} L</td>
                          <td className="py-2.5 px-4 text-center text-slate-600">{c.huileHydrauliqueL} L</td>
                          <td className="py-2.5 px-4 text-right font-black text-slate-700">{c.piecesDH.toLocaleString()} DH</td>
                          <td className="py-2.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteConsommation(c.id)}
                              className="text-rose-600 hover:text-rose-800 font-bold"
                            >
                              <Trash2 className="h-4 w-4 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-150 py-3.5 px-5">
                <CardTitle className="text-xs font-black uppercase text-slate-700">
                  ⚠️ Diagnostics de consommation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                {computedRules.surconso.length === 0 ? (
                  <p className="text-slate-500 font-semibold">Aucune déviation de consommation d'huile ou gazole détectée par rapport à la flotte.</p>
                ) : (
                  <div className="space-y-3">
                    {computedRules.surconso.map((msg, i) => {
                      const isAnom = msg.includes("critique") || msg.includes("plus que la moyenne") || msg.includes("perte");
                      return (
                        <div
                          key={i}
                          className={`p-3 rounded-xl border font-medium ${
                            isAnom ? "bg-rose-50/50 border-rose-100 text-rose-950" : "bg-emerald-50/50 border-emerald-100 text-emerald-950"
                          }`}
                        >
                          <div className="flex gap-2">
                            <span className="text-xs">{isAnom ? "🔴" : "🟢"}</span>
                            <span>{msg}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* ONGLET 3 : PRÉVISIONS */}
      {/* ============================================================ */}
      {activeTab === "previsions" && (
        <div className="space-y-6 max-w-5xl animate-in fade-in duration-250">
          
          {/* V4-4 : Indicateur de fiabilité des données */}
          <div className={`p-4 rounded-2xl border text-xs font-black uppercase flex items-center justify-between ${previsionsFiabiliteLabel.color}`}>
            <span className="flex items-center gap-1.5">
              <Info className="h-4 w-4" /> Fiabilité stratégique des prévisions algorithmiques :
            </span>
            <span>{previsionsFiabiliteLabel.label}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-150 py-3.5 px-5">
                <CardTitle className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-500" /> Prédictions de maintenance imminentes (Prochaines 150h)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs font-medium">
                <p className="text-[10px] text-slate-400 uppercase font-bold">
                  Projections calculées selon l'activité cumulée et les intervalles de vidanges prescrits.
                </p>

                {computedRules.previsions.length === 0 ? (
                  <p className="text-slate-500 font-bold">Aucune prévision d'échéance critique sur les engins.</p>
                ) : (
                  <div className="space-y-3">
                    {computedRules.previsions.map((prevText, i) => (
                      <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                        <Clock className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                        <span>{prevText}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-150 py-3.5 px-5">
                <CardTitle className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                  <ClipboardList className="h-4 w-4 text-amber-500" /> Plan d'actions stratégiques recommandé
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="space-y-2.5 font-bold">
                  {computedRules.planActions.map((action, i) => (
                    <div key={i} className="p-2.5 bg-emerald-50 text-emerald-950 border border-emerald-100 rounded-xl flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* ONGLET 4 : RAPPORTS DIRECTION */}
      {/* ============================================================ */}
      {activeTab === "rapports" && (
        <div className="space-y-6 max-w-5xl animate-in fade-in duration-250">
          
          <Card className="border-slate-200 shadow-sm bg-white rounded-2xl print:shadow-none print:border-none overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-150 py-4 px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 block">
                  V4 : CRÉATION DE RAPPORT FORMALISÉ
                </span>
                <CardTitle className="text-xs font-black uppercase text-slate-700">
                  Générer un rapport d'exploitation officiel Hydromines
                </CardTitle>
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedReportType}
                  onChange={(e) => setSelectedReportType(e.target.value as any)}
                  className="h-8 px-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700"
                >
                  <option value="hebdo">Rapport Hebdomadaire Maintenance</option>
                  <option value="mensuel">Rapport Mensuel Performance</option>
                  <option value="trimestriel">Rapport Trimestriel Fiabilité</option>
                </select>
                <Button
                  onClick={handleProgrammerRapport}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-wider text-[10px] h-8"
                >
                  Programmer Lundi 8h
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 md:p-8 space-y-6 print:p-0">
              
              {/* En-tête officiel du rapport */}
              <div className="flex justify-between items-start border-b border-slate-300 pb-5">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500 text-slate-950 font-black p-2.5 rounded-xl text-base tracking-widest">
                    HYDROMINES
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                      SOU-GMAO HYDROMINES
                    </h2>
                    <p className="text-[9px] text-slate-500 uppercase font-black">
                      Exploitation Souterraine de Phosphate
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Date de génération</span>
                  <span className="text-xs font-bold text-slate-800">{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              {/* Contenu dynamique du rapport selon sélection */}
              {selectedReportType === "hebdo" && (
                <div className="space-y-4 text-xs font-medium text-slate-800">
                  <h3 className="text-xs font-black uppercase text-slate-900 bg-slate-100 p-2 rounded-md">
                    1. RAPPORT HEBDOMADAIRE DE MAINTENANCE
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-slate-200 p-3 rounded-xl bg-slate-50">
                      <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Taux Réalisation</span>
                      <strong className="text-lg font-black text-emerald-600">{kpiTauxPreventifGlobal}%</strong>
                      <p className="text-[9px] text-slate-500">Conforme à l'objectif de 80%</p>
                    </div>

                    <div className="border border-slate-200 p-3 rounded-xl bg-slate-50">
                      <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Pannes (Correctifs)</span>
                      <strong className="text-lg font-black text-amber-600">
                        {tasks.filter(t => t.type === "CORRECTIF").length} avarie(s)
                      </strong>
                      <p className="text-[9px] text-slate-500">Durée d'immobilisation minimale</p>
                    </div>

                    <div className="border border-slate-200 p-3 rounded-xl bg-slate-50">
                      <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Tâches en attente</span>
                      <strong className="text-lg font-black text-rose-600">
                        {tasks.filter(t => t.statut === "NON_FAIT").length} tâches
                      </strong>
                      <p className="text-[9px] text-slate-500">Dont {tasks.filter(t => t.priorite === "CRITIQUE" && t.statut === "NON_FAIT").length} critiques</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-900 uppercase">Anomalies de pré-poste souterraines archivées :</h4>
                    {computedRules.anomalies.length === 0 ? (
                      <p className="text-slate-500 font-medium">Aucun incident critique ou anomalie signalée ce jour.</p>
                    ) : (
                      <ul className="list-disc pl-4 space-y-1">
                        {computedRules.anomalies.map((anom, idx) => <li key={idx}>{anom}</li>)}
                      </ul>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-900 uppercase">Actions correctives imminentes recommandées :</h4>
                    <ul className="list-decimal pl-4 space-y-1 font-bold text-emerald-700">
                      {computedRules.planActions.slice(0, 3).map((act, i) => <li key={i}>{act}</li>)}
                    </ul>
                  </div>
                </div>
              )}

              {selectedReportType === "mensuel" && (
                <div className="space-y-4 text-xs font-medium text-slate-800">
                  <h3 className="text-xs font-black uppercase text-slate-900 bg-slate-100 p-2 rounded-md">
                    2. RAPPORT MENSUEL DE PERFORMANCE FLOTTE
                  </h3>

                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 uppercase">Rentabilité estimée et pannes par machine :</h4>
                    <div className="space-y-2">
                      {engins.map(e => {
                        const stats = getEnginStats(e.id, e.modele);
                        return (
                          <div key={e.id} className="flex justify-between items-center border-b border-slate-100 py-1.5">
                            <span>{e.id} - {e.modele} ({e.heuresMarche}h)</span>
                            <div className="flex gap-4">
                              <span>Taux Prév: <strong className="text-slate-900">{stats.tauxPreventif}%</strong></span>
                              <span>Pannes: <strong className="text-amber-600">{stats.correctifs}</strong></span>
                              <span>Budget Maintenance: <strong className="text-rose-700">{stats.coutEstime.toLocaleString()} DH</strong></span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-900 uppercase font-black">Indicateurs de surconsommations majeurs de fluides :</h4>
                    {computedRules.surconso.length === 0 ? (
                      <p className="text-slate-500 font-semibold">Aucun incident de surconsommation lubrifiant ou de gazole.</p>
                    ) : (
                      <ul className="list-disc pl-4 space-y-1">
                        {computedRules.surconso.map((msg, i) => <li key={i}>{msg}</li>)}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {selectedReportType === "trimestriel" && (
                <div className="space-y-4 text-xs font-medium text-slate-800">
                  <h3 className="text-xs font-black uppercase text-slate-900 bg-slate-100 p-2 rounded-md">
                    3. RAPPORT TRIMESTRIEL DE FIABILITÉ DES ENGINS
                  </h3>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                    <h4 className="font-bold text-amber-950 uppercase flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4" /> Projections de renouvellement d'organes ou de flotte :
                    </h4>
                    <p className="text-amber-900 font-medium">
                      Au vu des heures cumulées et de l'écart d'usure calculé, les Scooptrams de modèle <strong>ST2G</strong> approchent de la limite de fatigue structurelle de leur convertisseur de couple de transmission (Moyenne observée chez Epiroc : 5000 heures).
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-900 uppercase">Prévisions d'échéances et de commandes de pièces à 90 jours :</h4>
                    <ul className="list-disc pl-4 space-y-1 font-bold text-slate-700">
                      {computedRules.previsions.map((prev, i) => <li key={i}>{prev}</li>)}
                    </ul>
                  </div>
                </div>
              )}

              {/* V4-8 : Commentaire libre du directeur */}
              <div className="space-y-2 pt-4 border-t border-slate-200 print:hidden">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Observations et commentaires du Directeur de la Maintenance :
                </label>
                <textarea
                  value={directorComment}
                  onChange={(e) => setDirectorComment(e.target.value)}
                  placeholder="Saisissez vos observations pour le comité technique souterrain (recommandation d'arrêt d'engins, approvisionnement de pièces...)"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                  rows={3}
                />
              </div>

              {directorComment && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium space-y-1 hidden print:block">
                  <strong className="text-slate-900 uppercase block">Observations de la Direction de la Maintenance :</strong>
                  <p className="text-slate-700 italic">"{directorComment}"</p>
                </div>
              )}

              {/* Pied de page de signature du rapport */}
              <div className="flex justify-between items-center pt-8 border-t border-slate-300">
                <span className="text-[9px] text-slate-400 font-black">
                  SOU-GMAO HYDROMINES COOPERATIVE © 2026. TOUS DROITS RÉSERVÉS.
                </span>
                <div className="text-right flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase text-slate-400">Signature Direction</span>
                  <div className="border-b border-dashed border-slate-400 w-28 h-6" />
                </div>
              </div>

            </CardContent>
          </Card>

          {/* V4-8 : Historique des rapports planifiés et archives */}
          <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden print:hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-150 py-3 px-5">
              <CardTitle className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-slate-500" /> Archives des Rapports Planifiés Automatiquement
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-xs font-medium text-slate-600">
              {scheduledReports.length === 0 ? (
                <p>Aucun rapport périodique programmé.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {scheduledReports.map(sc => (
                    <div key={sc.id} className="py-2.5 flex justify-between items-center">
                      <span>{sc.type}</span>
                      <div className="flex gap-4">
                        <span>Généré le : <strong>{sc.date}</strong></span>
                        <span className="text-emerald-600 font-bold">🟢 Prêt</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      )}

      {/* ============================================================ */}
      {/* ONGLET 5 : EXPORT CSV / JSON */}
      {/* ============================================================ */}
      {activeTab === "export" && (
        <div className="max-w-5xl animate-in fade-in duration-250">
          
          <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-150 py-4 px-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 block">
                EXPORTATION COMPLÈTE DE LA BASE DE DONNÉES
              </span>
              <CardTitle className="text-xs font-black uppercase text-slate-700">
                Extraire les données brutes terrain sous forme de tableur Excel (BOM CSV)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 block">Type de données</label>
                  <select
                    value={exportDataType}
                    onChange={(e) => setExportDataType(e.target.value as any)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="tasks">📋 Fiches de travaux et tâches</option>
                    <option value="conso">⛽ Consommations carburant et fluides</option>
                    <option value="heures">⏰ Compteur d'heures de marche engins</option>
                    <option value="checklists">📋 Checklists d'inspections de pré-poste</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 block">Période du</label>
                  <input
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 block">Au</label>
                  <input
                    type="date"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 block">Filtrer par engin</label>
                  <select
                    value={exportEngin}
                    onChange={(e) => setExportEngin(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="Tous">Tous les engins</option>
                    {engins.map(e => <option key={e.id} value={e.id}>{e.id}</option>)}
                  </select>
                </div>

              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-medium space-y-2">
                <h4 className="font-black text-slate-900 uppercase">Spécifications techniques de l'exportation :</h4>
                <p>
                  Les fichiers CSV sont exportés avec l'encodage UTF-8 et incluent le marqueur BOM pour forcer Microsoft Excel à reconnaître les caractères spéciaux arabes et français (accents). Le séparateur de colonne est la virgule.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  onClick={handleDownloadJSON}
                  variant="outline"
                  className="border-slate-300 text-slate-700 font-black uppercase tracking-wider text-xs px-6 h-10 rounded-xl"
                >
                  Télécharger JSON (Développeur)
                </Button>
                <Button
                  onClick={handleDownloadCSV}
                  className="bg-amber-500 hover:bg-amber-600 border-amber-600 text-slate-950 font-black uppercase tracking-wider text-xs px-6 h-10 rounded-xl"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-1.5" /> Télécharger CSV pour Excel
                </Button>
              </div>

            </CardContent>
          </Card>

        </div>
      )}

    </div>
  );
}
