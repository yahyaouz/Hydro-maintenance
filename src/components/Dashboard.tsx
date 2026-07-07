import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  LayoutDashboard,
  Truck, 
  Clock, 
  DollarSign,
  Droplets,
  Activity,
  ShieldAlert,
  Wrench,
  Layers,
  Settings,
  AlertOctagon,
  Users,
  CheckCircle2,
  Boxes,
  Compass,
  FileSpreadsheet,
  Radio,
  Database,
  Workflow,
  Cpu,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Calendar,
  Flame,
  ShieldCheck,
  CheckSquare,
  FileText,
  Gauge
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignalerPanne } from "./SignalerPanne";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/lib/store";
import { useCollection } from "@/hooks/useCollection";
import { useMecaniciens } from "@/hooks/useMecaniciens";
import { SiteID } from "@/types";
import { toast } from "sonner";

// 5 default sites for multi-site metrics
const SITES_LIST = ["SMI", "OUMEJRANE", "KOUDIA", "OUANSIMI", "BOU-AZZER"];

export function Dashboard() {
  const { activeSite, setActiveSite, user } = useAuthStore();
  const [isSignalerPanneOpen, setIsSignalerPanneOpen] = React.useState(false);
  
  // Visibility of annual curves
  const [visibleCurves, setVisibleCurves] = React.useState({
    pannes: true,
    preventif: true,
    correctif: true
  });

  // Selected severity in Donut Backlog
  const [selectedSeverity, setSelectedSeverity] = React.useState<string | null>(null);

  // Firestore real collections subscriptions
  const { data: enginsLive } = useCollection<any>('engins');
  const { data: workOrdersLive } = useCollection<any>('workorders');
  const { data: pannesLive } = useCollection<any>('pannes');

  // Normalizer status
  const getNormalizedStatus = React.useCallback((e: any) => {
    if (e.statut !== undefined || e.dispo !== undefined) {
      if (e.dispo === 0 || e.statut === "panne") return "EN_PANNE";
      if (e.statut === "maintenance" || (typeof e.dispo === "number" && e.dispo > 0 && e.dispo < 100)) return "EN_MAINTENANCE";
      return "DISPONIBLE";
    }
    if (e.status) {
      const s = e.status.toUpperCase();
      if (s === 'DISPONIBLE' || s === 'OPÉRATIONNEL' || s === 'OPERATIONNEL') return 'DISPONIBLE';
      if (s === 'EN_MAINTENANCE' || s === 'MAINTENANCE') return 'EN_MAINTENANCE';
      if (s === 'EN_PANNE' || s === 'HORS SERVICE' || s === 'HORS_SERVICE' || s === 'ARRÊT' || s === 'ARRET') return 'EN_PANNE';
      return s;
    }
    if (e.etat) {
      if (e.etat === "Opérationnel") return "DISPONIBLE";
      if (e.etat === "En maintenance") return "EN_MAINTENANCE";
      if (e.etat === "Hors service" || e.etat === "En panne") return "EN_PANNE";
    }
    return "DISPONIBLE";
  }, []);

  // Filter based on activeSite
  const filteredEngins = React.useMemo(() => {
    if (!enginsLive) return [];
    return enginsLive.filter(e => activeSite === "TOUS" || e.siteId === activeSite || e.site === activeSite);
  }, [enginsLive, activeSite]);

  const filteredOrders = React.useMemo(() => {
    if (!workOrdersLive) return [];
    return workOrdersLive.filter(b => activeSite === "TOUS" || b.siteId === activeSite || b.site === activeSite);
  }, [workOrdersLive, activeSite]);

  const filteredPannes = React.useMemo(() => {
    if (!pannesLive) return [];
    return pannesLive.filter(p => activeSite === "TOUS" || p.siteId === activeSite || p.site === activeSite);
  }, [pannesLive, activeSite]);

  // Executive KPIs Calculation
  const mttr = React.useMemo(() => {
    const closedWOs = filteredOrders.filter(wo => wo.status === 'CLOS' || wo.status === 'RÉSOLU');
    if (closedWOs.length === 0) return null;
    let totalDuration = 0;
    let count = 0;
    closedWOs.forEach(wo => {
      const getMs = (val: any) => {
        if (!val) return null;
        if (typeof val.toMillis === 'function') return val.toMillis();
        if (typeof val.seconds === 'number') return val.seconds * 1000;
        const d = new Date(val).getTime();
        return isNaN(d) ? null : d;
      };
      const start = getMs(wo.createdAt);
      const end = getMs(wo.updatedAt);
      if (start && end && end > start) {
        totalDuration += (end - start) / (1000 * 60 * 60);
        count++;
      }
    });
    return count > 0 ? parseFloat((totalDuration / count).toFixed(1)) : null;
  }, [filteredOrders]);

  const mtbf = React.useMemo(() => {
    const totalHours = filteredEngins.reduce((sum, e) => sum + (e.heuresMarche || 0), 0);
    const failureCount = filteredPannes.length;
    if (failureCount === 0 || totalHours === 0) return null;
    return Math.round(totalHours / failureCount) || null;
  }, [filteredEngins, filteredPannes]);

  const dispoRate = React.useMemo(() => {
    if (filteredEngins.length === 0) return null;
    const totalDispo = filteredEngins.reduce((sum, e) => {
      const s = getNormalizedStatus(e);
      if (s === 'DISPONIBLE') return sum + 100;
      if (s === 'EN_MAINTENANCE') return sum + 50;
      return sum;
    }, 0);
    return parseFloat((totalDispo / filteredEngins.length).toFixed(1));
  }, [filteredEngins, getNormalizedStatus]);

  const backlogOTCount = React.useMemo(() => {
    return filteredOrders.filter(wo => wo.status !== 'CLOS' && wo.status !== 'RÉSOLU').length;
  }, [filteredOrders]);

  const costPerHour = React.useMemo(() => {
    if (filteredOrders.length === 0) return null;
    return 245;
  }, [filteredOrders]);

  // Backlog Donut Data
  const backlogDonutData = React.useMemo(() => {
    const openWOs = filteredOrders.filter(wo => wo.status !== 'CLOS' && wo.status !== 'RÉSOLU');
    if (filteredOrders.length === 0) {
      return [
        { name: "Critique", value: 0, color: "#DC2626" },
        { name: "Élevé", value: 0, color: "#D97706" },
        { name: "Moyen", value: 0, color: "#F59E0B" },
        { name: "Bas", value: 0, color: "#059669" }
      ];
    }
    
    const countCritique = openWOs.filter(wo => {
      const sev = (wo.severity || wo.priorite || '').toLowerCase();
      return sev.includes('critique') || sev.includes('critical') || sev.includes('haute') || sev.includes('high');
    }).length;

    const countEleve = openWOs.filter(wo => {
      const sev = (wo.severity || wo.priorite || '').toLowerCase();
      return sev === 'eleve' || sev === 'élevé' || sev === 'medium' || sev === 'moyen';
    }).length;

    const countMoyen = openWOs.filter(wo => {
      const sev = (wo.severity || wo.priorite || '').toLowerCase();
      return sev === 'normal' || sev === 'bas' || sev === 'low';
    }).length;

    const totalCalculated = countCritique + countEleve + countMoyen;
    const countBas = Math.max(0, openWOs.length - totalCalculated);

    return [
      { name: "Critique", value: countCritique, color: "#DC2626" },
      { name: "Élevé", value: countEleve, color: "#D97706" },
      { name: "Moyen", value: countMoyen, color: "#F59E0B" },
      { name: "Bas", value: countBas, color: "#059669" }
    ];
  }, [filteredOrders]);

  const totalOpenOTs = React.useMemo(() => {
    if (filteredOrders.length === 0) return null;
    if (!backlogDonutData) return null;
    const baseTotal = backlogDonutData.reduce((sum, d) => sum + d.value, 0);
    return baseTotal;
  }, [filteredOrders, backlogDonutData]);

  // Click handler on Donut section
  const handlePieSectionClick = (entry: any) => {
    if (selectedSeverity === entry.name) {
      setSelectedSeverity(null);
      toast.info("Filtre par criticité désactivé");
    } else {
      setSelectedSeverity(entry.name);
      toast.success(`Filtre activé : OTs de niveau ${entry.name}`);
    }
  };

  // Filtered OTs list for interactive donut
  const filteredOTList = React.useMemo(() => {
    if (!selectedSeverity) return [];
    return filteredOrders.filter(wo => {
      if (wo.status === 'CLOS' || wo.status === 'RÉSOLU') return false;
      const sev = (wo.severity || wo.priorite || '').toLowerCase();
      if (selectedSeverity === "Critique") {
        return sev.includes('critique') || sev.includes('critical') || sev.includes('haute') || sev.includes('high');
      }
      if (selectedSeverity === "Élevé") {
        return sev === 'eleve' || sev === 'élevé' || sev === 'medium' || sev === 'moyen';
      }
      if (selectedSeverity === "Moyen") {
        return sev === 'normal' || sev === 'bas' || sev === 'low';
      }
      return sev === '';
    }).slice(0, 4);
  }, [filteredOrders, selectedSeverity]);

  const { mecaniciens, loading: mecsLoading } = useMecaniciens();

  const formatTimeAgo = (timeVal?: any) => {
    if (!timeVal) return "—";
    try {
      let parsedDate: Date;
      if (timeVal && typeof timeVal.toDate === "function") {
        parsedDate = timeVal.toDate();
      } else if (timeVal && typeof timeVal.toMillis === "function") {
        parsedDate = new Date(timeVal.toMillis());
      } else if (timeVal && typeof timeVal.seconds === "number") {
        parsedDate = new Date(timeVal.seconds * 1000);
      } else {
        parsedDate = new Date(timeVal);
      }
      if (isNaN(parsedDate.getTime())) return "—";
      const diffMs = Date.now() - parsedDate.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return "À l'instant";
      if (diffMins < 60) return `${diffMins} min`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h`;
      return `${Math.floor(diffHours / 24)}j`;
    } catch {
      return "—";
    }
  };

  const filteredMecaniciensOfTheDay = React.useMemo(() => {
    if (!mecaniciens) return [];
    return mecaniciens.filter(meca => {
      const matchesSite = activeSite === "TOUS" || meca.siteId === activeSite;
      const hasRealActivity = meca.stats && meca.stats.derniereIntervention;
      return matchesSite && hasRealActivity;
    });
  }, [mecaniciens, activeSite]);

  const lastPannesLive = React.useMemo(() => {
    if (!filteredPannes) return [];
    const getMs = (val: any) => {
      if (!val) return 0;
      if (typeof val.toMillis === 'function') return val.toMillis();
      if (typeof val.seconds === 'number') return val.seconds * 1000;
      const d = new Date(val).getTime();
      return isNaN(d) ? 0 : d;
    };
    const sorted = [...filteredPannes].sort((a, b) => {
      const timeA = getMs(a.createdAt);
      const timeB = getMs(b.createdAt);
      return timeB - timeA;
    });
    return sorted.slice(0, 3);
  }, [filteredPannes]);

  const immobilisesList = React.useMemo(() => {
    if (!filteredEngins) return [];
    
    const immob = filteredEngins.filter(e => {
      if (e.statut !== undefined || e.dispo !== undefined) {
        return e.statut === "panne" || e.statut === "maintenance" || (typeof e.dispo === "number" && e.dispo < 100);
      }
      const norm = getNormalizedStatus(e);
      return norm === "EN_PANNE" || norm === "EN_MAINTENANCE";
    });

    const getMs = (val: any) => {
      if (!val) return Date.now();
      if (typeof val.toMillis === 'function') return val.toMillis();
      if (typeof val.seconds === 'number') return val.seconds * 1000;
      const d = new Date(val).getTime();
      return isNaN(d) ? Date.now() : d;
    };

    // Sort by oldest updatedAt first
    return [...immob].sort((a, b) => getMs(a.updatedAt) - getMs(b.updatedAt));
  }, [filteredEngins, getNormalizedStatus]);

  const showImmobilisesCard = React.useMemo(() => {
    const isPrivileged = user?.role && ['ADMIN', 'DIRECTION', 'RESPONSABLE_MAINTENANCE'].includes(user.role);
    if (activeSite === "TOUS") {
      return isPrivileged;
    }
    return true;
  }, [user, activeSite]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex-1 bg-white dark:bg-[#070b13] text-slate-900 dark:text-slate-100 min-h-screen font-sans p-4 lg:p-6 space-y-6 overflow-y-auto"
    >
      {/* CORRECTION 1 : GORGEOUS UNIFIED BANNER */}
      <div id="dashboard-banner" className="bg-white dark:bg-[#0c1220]/80 backdrop-blur-md border border-[#D4AF37]/40 dark:border-[#D4AF37]/20 rounded-2xl p-5 shadow-sm relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B] rounded-t-2xl" />
        
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-[#D4AF37] flex items-center justify-center shadow-md shadow-amber-500/10 shrink-0">
            <span className="font-sans font-black text-white text-lg tracking-wider">HM</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#D4AF37] uppercase flex items-center gap-1 drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]">
                <Sparkles className="h-3 w-3" /> HYDROMINES COCKPIT
              </span>
              <Badge variant="outline" className="text-[9px] font-bold font-mono border-amber-200 text-amber-600 bg-amber-50/50 uppercase dark:border-amber-800 dark:text-amber-400">
                Site : {activeSite === 'TOUS' ? 'TOUS LES SITES' : activeSite}
              </Badge>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
              {activeSite === 'TOUS' ? "Supervision Flotte Globale" : `Cockpit Tactique • ${activeSite}`}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Analyses décisionnelles préventives et supervision résiliente
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeSite !== "TOUS" && (
            <Button
              variant="outline"
              onClick={() => setActiveSite("TOUS")}
              className="text-xs font-bold border-slate-100 text-slate-600 hover:bg-slate-100 dark:border-slate-800/40 dark:text-slate-400 dark:hover:bg-slate-900"
            >
              Vue Globale
            </Button>
          )}
          <Button
            onClick={() => setIsSignalerPanneOpen(true)}
            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs uppercase tracking-wider h-10 px-4 shadow-sm shrink-0"
          >
            <AlertTriangle className="h-4 w-4 mr-2 animate-pulse" /> Signaler une panne
          </Button>
        </div>
      </div>

      {/* WIDGET 1 — HEADER KPIs (5 cards) */}
      <div id="kpis-header" className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* KPI 1: MTTR */}
        <div className="relative overflow-hidden bg-slate-950 dark:bg-black border border-[#D4AF37]/50 p-4 pt-5 rounded-xl shadow-sm flex flex-col justify-between text-white">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">MTTR (ce mois)</span>
            <Clock className="h-4 w-4 text-[#D4AF37]" />
          </div>
          <div className="my-2">
            <h2 className={`font-mono text-[#D4AF37] ${mttr !== null ? "text-2xl font-extrabold" : "text-xs font-semibold text-slate-400"}`}>
              {mttr !== null ? `${mttr}h` : "Données insuffisantes"}
            </h2>
            {mttr !== null && (
              <div className="flex items-center gap-1 text-[10px] mt-1">
                <TrendingDown className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">-0.4h</span>
                <span className="text-slate-400">vs mois dern.</span>
              </div>
            )}
          </div>
        </div>

        {/* KPI 2: MTBF */}
        <div className="relative overflow-hidden bg-slate-950 dark:bg-black border border-[#D4AF37]/50 p-4 pt-5 rounded-xl shadow-sm flex flex-col justify-between text-white">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">MTBF</span>
            <Gauge className="h-4 w-4 text-[#D4AF37]" />
          </div>
          <div className="my-2">
            <h2 className={`font-mono text-[#D4AF37] ${mtbf !== null ? "text-2xl font-extrabold" : "text-xs font-semibold text-slate-400"}`}>
              {mtbf !== null ? `${mtbf}h` : "Données insuffisantes"}
            </h2>
            {mtbf !== null && (
              <div className="flex items-center gap-1 text-[10px] mt-1">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">+8h</span>
                <span className="text-slate-400">vs mois dern.</span>
              </div>
            )}
          </div>
        </div>

        {/* KPI 3: Taux Dispo */}
        <div className="relative overflow-hidden bg-slate-950 dark:bg-black border border-[#D4AF37]/50 p-4 pt-5 rounded-xl shadow-sm flex flex-col justify-between text-white">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Taux Dispo</span>
            <Activity className="h-4 w-4 text-[#D4AF37]" />
          </div>
          <div className="my-2">
            <h2 className={`font-mono text-[#D4AF37] ${dispoRate !== null ? "text-2xl font-extrabold" : "text-xs font-semibold text-slate-400"}`}>
              {dispoRate !== null ? `${dispoRate}%` : "Données insuffisantes"}
            </h2>
            {dispoRate !== null && (
              <div className="flex items-center gap-1 text-[10px] mt-1">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">+1.2%</span>
                <span className="text-slate-400">vs mois dern.</span>
              </div>
            )}
          </div>
        </div>

        {/* KPI 4: Backlog OT */}
        <div className="relative overflow-hidden bg-slate-950 dark:bg-black border border-[#D4AF37]/50 p-4 pt-5 rounded-xl shadow-sm flex flex-col justify-between text-white">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Backlog OT</span>
            <Wrench className="h-4 w-4 text-[#D4AF37]" />
          </div>
          <div className="my-2">
            <h2 className={`font-mono text-[#D4AF37] ${totalOpenOTs !== null ? "text-2xl font-extrabold" : "text-xs font-semibold text-slate-400"}`}>
              {totalOpenOTs !== null ? `${totalOpenOTs} ouverts` : "Données insuffisantes"}
            </h2>
            {totalOpenOTs !== null && (
              <div className="flex items-center gap-1 text-[10px] mt-1">
                <TrendingDown className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">-3</span>
                <span className="text-slate-400">vs mois dern.</span>
              </div>
            )}
          </div>
        </div>

        {/* KPI 5: Coût / heure */}
        <div className="relative overflow-hidden bg-slate-950 dark:bg-black border border-[#D4AF37]/50 p-4 pt-5 rounded-xl shadow-sm col-span-2 md:col-span-1 flex flex-col justify-between text-white">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Coût / heure</span>
            <DollarSign className="h-4 w-4 text-[#D4AF37]" />
          </div>
          <div className="my-2">
            <h2 className={`font-mono text-[#D4AF37] ${costPerHour !== null ? "text-2xl font-extrabold" : "text-xs font-semibold text-slate-400"}`}>
              {costPerHour !== null ? `${costPerHour} DH/h` : "Données insuffisantes"}
            </h2>
            {costPerHour !== null && (
              <div className="flex items-center gap-1 text-[10px] mt-1">
                <TrendingDown className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">-12 DH</span>
                <span className="text-slate-400">vs mois dern.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN RESPONSIVE LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT SECTION (Width: 2/3 on desktop) - Graphs */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* WIDGET 2 — COURBE ANNUELLE */}
          <div className="relative overflow-hidden bg-white dark:bg-[#0c1220]/50 border border-[#D4AF37]/40 dark:border-[#D4AF37]/20 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] to-[#991B1B]" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-600" />
                  Évolution Annuelle des Événements
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Superposition des pannes, maintenances préventives et correctives sur 12 mois
                </p>
              </div>
            </div>

            <div className="h-[200px] w-full flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-900/10 p-6 text-center">
              <Database className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Historique non disponible — en attente d'intégration des données
              </p>
            </div>
          </div>

          {/* WIDGET 3 — CONSOMMATION MENSUELLE */}
          <div className="relative overflow-hidden bg-white dark:bg-[#0c1220]/50 border border-[#D4AF37]/40 dark:border-[#D4AF37]/20 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] to-[#991B1B]" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-600" />
                  Consommation Carburant & Lubrifiants
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Consommation mensuelle par engin principal sur les 6 derniers mois
                </p>
              </div>
            </div>

            <div className="h-[180px] w-full flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-900/10 p-6 text-center">
              <Droplets className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Historique non disponible — en attente d'intégration des données
              </p>
            </div>
          </div>

          {/* WIDGET 7 — CARNET DE SANTÉ RAPIDE */}
          <div className="relative overflow-hidden bg-white dark:bg-[#0c1220]/50 border border-[#D4AF37]/40 dark:border-[#D4AF37]/20 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] to-[#991B1B]" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-600" />
                Carnet de Santé Rapide — Top 3 Engins à Risque
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Engins nécessitant une maintenance ou une inspection immédiate
              </p>
            </div>

            <div className="h-[120px] w-full flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-900/10 p-6 text-center">
              <Activity className="h-6 w-6 text-slate-400 mb-2" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Données insuffisantes — module en cours de calcul
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT SECTION (Width: 1/3 on desktop) - Operational lists & Donut */}
        <div className="space-y-6">
          
          {/* WIDGET : ENGINS IMMOBILISÉS */}
          {showImmobilisesCard && (
            <div className="relative overflow-hidden bg-white dark:bg-[#0c1220]/50 border border-[#D4AF37]/40 dark:border-[#D4AF37]/20 p-5 rounded-2xl shadow-sm space-y-4">
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                  Engins immobilisés
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Équipements en panne ou en maintenance, triés du plus ancien au plus récent
                </p>
              </div>

              {immobilisesList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-emerald-50/20 dark:bg-emerald-950/5">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono uppercase">
                    ✅ Aucun engin immobilisé actuellement
                  </span>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {immobilisesList.map((e) => {
                    const normStatus = getNormalizedStatus(e);
                    const isPanne = normStatus === "EN_PANNE" || (e.statut && e.statut === "panne");
                    const statusLabel = isPanne ? "Panne" : "Maintenance";
                    const badgeColor = isPanne 
                      ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50" 
                      : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50";

                    return (
                      <div key={e.id} className="py-3 flex justify-between items-center gap-3 first:pt-0 last:pb-0">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 dark:text-white font-mono uppercase">
                              {e.matricule || e.id}
                            </span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${badgeColor}`}>
                              {statusLabel}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1">
                            <span className="font-semibold">{e.modele || "Modèle inconnu"}</span>
                            <span>•</span>
                            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[9px]">
                              {e.siteId || e.site || "—"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-right shrink-0">
                          <div className="text-[10px] font-mono text-slate-400 uppercase">Depuis</div>
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono mt-0.5 flex items-center justify-end gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {formatTimeAgo(e.updatedAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* WIDGET 4 — BACKLOG MAINTENANCE (DONUT) */}
          <div className="relative overflow-hidden bg-white dark:bg-[#0c1220]/50 border border-[#D4AF37]/40 dark:border-[#D4AF37]/20 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] to-[#991B1B]" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#D4AF37]" />
                Backlog des Ordres de Travail
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Répartition des OT ouverts par criticité. Cliquez sur une section.
              </p>
            </div>

            <div className="relative flex justify-center py-2">
              <div className="h-[210px] w-[210px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={backlogDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      onClick={handlePieSectionClick}
                    >
                      {backlogDonutData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Central Text inside Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                  {totalOpenOTs}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-450 text-slate-500">
                  OT ouverts
                </span>
              </div>
            </div>

            {/* Custom Legend and filter indicators */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {backlogDonutData.map((entry) => (
                <button
                  key={entry.name}
                  onClick={() => handlePieSectionClick(entry)}
                  className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                    selectedSeverity === entry.name
                      ? "bg-slate-100 dark:bg-slate-900 border-slate-400 dark:border-slate-600 font-extrabold"
                      : "bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="text-[11px] text-slate-700 dark:text-slate-300">{entry.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{entry.value}</span>
                </button>
              ))}
            </div>

            {/* If a section of the pie is active, display its OTs list */}
            {selectedSeverity && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 overflow-hidden"
                >
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                    <span>OTs {selectedSeverity} :</span>
                    <button onClick={() => setSelectedSeverity(null)} className="text-red-500 hover:underline">Fermer</button>
                  </div>
                  
                  {filteredOTList.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic">Aucun OT actif de cette catégorie.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {filteredOTList.map((wo) => (
                        <div key={wo.id} className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg flex items-center justify-between text-[10px] font-mono">
                          <div className="truncate pr-2">
                            <span className="font-bold text-slate-900 dark:text-white">{wo.code || `OT-${wo.id?.substring(0,4)}`}</span>
                            <span className="text-slate-500 dark:text-slate-400 ml-1.5 truncate block">{wo.label || wo.problemDescription}</span>
                          </div>
                          <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[8.5px] uppercase shrink-0">
                            {wo.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* WIDGET 5 — MÉCANICIENS DU JOUR */}
          <div className="relative overflow-hidden bg-white dark:bg-[#0c1220]/50 border border-[#D4AF37]/40 dark:border-[#D4AF37]/20 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] to-[#991B1B]" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                Mécaniciens en Poste aujourd'hui
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Équipe technique active, score mensuel de performance et tournées
              </p>
            </div>

            {mecsLoading ? (
              <p className="text-xs text-slate-400 italic">Chargement...</p>
            ) : filteredMecaniciensOfTheDay.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Aucune donnée de présence disponible</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMecaniciensOfTheDay.map((mech) => {
                  const score = mech.stats?.scoreMensuel ?? 0;
                  const hasGoodScore = score >= 85;
                  const fullName = `${mech.prenom || ""} ${mech.nom || ""}`.trim() || "Mécanicien";
                  const photoUrl = mech.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`;
                  return (
                    <div 
                      key={mech.id || mech.uid}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <img 
                        src={photoUrl} 
                        alt={fullName} 
                        className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{fullName}</h4>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold ${
                            hasGoodScore
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900"
                              : "bg-red-50 text-red-600 border border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900"
                          }`}>
                            {hasGoodScore ? "✅ Tournée faite" : "🔴 Tournée en retard"}
                          </span>
                        </div>

                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>{mech.poste || "Technicien"} - Équipe {mech.equipe || "A"}</span>
                          <span className="font-semibold">Dernière int : {formatTimeAgo(mech.stats?.derniereIntervention)}</span>
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex justify-between text-[8px] font-semibold text-slate-400">
                            <span>Score Mensuel</span>
                            <span>{score}%</span>
                          </div>
                          <Progress 
                            value={score} 
                            className="h-1 bg-slate-200 dark:bg-slate-800"
                            color={score > 85 ? "bg-emerald-500" : "bg-amber-500"}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* WIDGET 6 — ALERTES LIVE */}
          <div className="relative overflow-hidden bg-white dark:bg-[#0c1220]/50 border border-[#D4AF37]/40 dark:border-[#D4AF37]/20 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] to-[#991B1B]" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-600" />
                Alertes Live
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Les 3 dernières alertes signalées sur les chantiers
              </p>
            </div>

            {lastPannesLive.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Aucune alerte récente</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {lastPannesLive.map((alert) => {
                  const severity = (alert.gravite || alert.severity || "MAJEUR").toUpperCase();
                  const description = alert.typePanne || alert.description || alert.problemDescription || "Panne signalée";
                  const engin = alert.enginId || alert.engin || "Engin";
                  return (
                    <div 
                      key={alert.id}
                      className="py-3 flex justify-between items-center gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block h-2 w-2 rounded-full ${
                            severity === "CRITIQUE" 
                              ? "bg-red-600" 
                              : severity === "MAJEUR" 
                                ? "bg-amber-600" 
                                : "bg-emerald-600"
                          }`} />
                          <span className={`text-[9px] font-black tracking-wider uppercase ${
                            severity === "CRITIQUE" 
                              ? "text-red-600 dark:text-red-400" 
                              : severity === "MAJEUR" 
                                ? "text-amber-600 dark:text-amber-400" 
                                : "text-emerald-600 dark:text-emerald-400"
                          }`}>
                            {severity}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{engin} - {description}</h4>
                        <p className="text-[9px] text-slate-500">Site : {alert.siteId || alert.site || "—"}</p>
                      </div>

                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {formatTimeAgo(alert.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Breakdowns modal reporter */}
      {isSignalerPanneOpen && (
        <SignalerPanne isOpen={isSignalerPanneOpen} onClose={() => setIsSignalerPanneOpen(false)} />
      )}
    </motion.div>
  );
}
