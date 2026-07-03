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
import { SiteID } from "@/types";
import { toast } from "sonner";

// 5 default sites for multi-site metrics
const SITES_LIST = ["SMI", "OUMEJRANE", "KOUDIA", "OUANSIMI", "BOU-AZZER"];

// Annual History Data with exact requested values for 12 months
const ANNUAL_HISTORY_MOCK = [
  { mois: "Jan", pannes: 5, preventif: 38, correctif: 8, prevVsLastYear: 2, corrVsLastYear: -4 },
  { mois: "Fév", pannes: 8, preventif: 42, correctif: 12, prevVsLastYear: 5, corrVsLastYear: 1 },
  { mois: "Mar", pannes: 6, preventif: 40, correctif: 9, prevVsLastYear: -2, corrVsLastYear: -2 },
  { mois: "Avr", pannes: 4, preventif: 45, correctif: 6, prevVsLastYear: 8, corrVsLastYear: -10 },
  { mois: "Mai", pannes: 9, preventif: 41, correctif: 14, prevVsLastYear: -3, corrVsLastYear: 4 },
  { mois: "Juin", pannes: 7, preventif: 43, correctif: 10, prevVsLastYear: 1, corrVsLastYear: -2 },
  { mois: "Juil", pannes: 5, preventif: 47, correctif: 8, prevVsLastYear: 4, corrVsLastYear: -6 },
  { mois: "Août", pannes: 7, preventif: 44, correctif: 11, prevVsLastYear: 3, corrVsLastYear: -5 },
  { mois: "Sept", pannes: 10, preventif: 41, correctif: 13, prevVsLastYear: -1, corrVsLastYear: 2 },
  { mois: "Oct", pannes: 4, preventif: 46, correctif: 7, prevVsLastYear: 10, corrVsLastYear: -18 },
  { mois: "Nov", pannes: 8, preventif: 39, correctif: 10, prevVsLastYear: 0, corrVsLastYear: -3 },
  { mois: "Déc", pannes: 6, preventif: 35, correctif: 9, prevVsLastYear: -5, corrVsLastYear: -8 }
];

// Fuel & Lubricant consumption per engine
const CONSUMPTION_MOCK = [
  { engin: "ST7-01", site: "SMI", carburant: 980, lubrifiant: 80, moyenne: 900 },
  { engin: "ST7-02", site: "KOUDIA", carburant: 1150, lubrifiant: 95, moyenne: 1100 },
  { engin: "ST7-03", site: "OUMEJRANE", carburant: 850, lubrifiant: 70, moyenne: 820 },
  { engin: "ST7-04", site: "SMI", carburant: 1240, lubrifiant: 110, moyenne: 1000 }, // Over +20% (1350 vs 1000) -> Anomaly
  { engin: "ST7-05", site: "OUANSIMI", carburant: 920, lubrifiant: 75, moyenne: 910 }
];

// shift mechanics of the day
const MECHANICS_MOCK = [
  { id: 1, nom: "Karim Belhadj", shift: "Shift 1 (06h-14h)", status: "OK", derniereIntervention: "2h", score: 94, photo: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80" },
  { id: 2, nom: "Youssef Amrani", shift: "Shift 2 (14h-22h)", status: "OK", derniereIntervention: "4h", score: 88, photo: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80" },
  { id: 3, nom: "Rachid Alami", shift: "Shift 3 (22h-06h)", status: "RETARD", derniereIntervention: "9h", score: 72, photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" }
];

// live alerts
const LIVE_ALERTS_MOCK = [
  { id: "A1", type: "CRITIQUE", titre: "Pression hydraulique ST7-04", heure: "10 min", site: "SMI" },
  { id: "A2", type: "MAJEUR", titre: "Surchauffe moteur ST7-01", heure: "35 min", site: "BOU-AZZER" },
  { id: "A3", type: "AVERTISSEMENT", titre: "Niveau carburant ST7-05", heure: "1h", site: "OUANSIMI" }
];

// quick health check
const CARNET_SANTE_MOCK = [
  { id: "C1", engin: "ST7-04", modele: "Sandeo ST7", sante: 45, sousSysteme: "Moteur : 45%", recommandation: "Intervention recommandée dans 50h" },
  { id: "C2", engin: "ST7-01", modele: "Sandeo ST7", sante: 62, sousSysteme: "Transmission : 55%", recommandation: "Inspection recommandée sous 72h" },
  { id: "C3", engin: "ST7-05", modele: "Sandeo ST5", sante: 78, sousSysteme: "Hydraulique : 70%", recommandation: "Entretien préventif planifié" }
];

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
    if (closedWOs.length === 0) return 3.2; // default
    let totalDuration = 0;
    let count = 0;
    closedWOs.forEach(wo => {
      const start = wo.createdAt ? (wo.createdAt.toMillis ? wo.createdAt.toMillis() : new Date(wo.createdAt).getTime()) : null;
      const end = wo.updatedAt ? (wo.updatedAt.toMillis ? wo.updatedAt.toMillis() : new Date(wo.updatedAt).getTime()) : null;
      if (start && end && end > start) {
        totalDuration += (end - start) / (1000 * 60 * 60);
        count++;
      }
    });
    return count > 0 ? parseFloat((totalDuration / count).toFixed(1)) : 3.2;
  }, [filteredOrders]);

  const mtbf = React.useMemo(() => {
    const totalHours = filteredEngins.reduce((sum, e) => sum + (e.heuresMarche || 0), 0);
    const failureCount = filteredPannes.length;
    if (failureCount === 0 || totalHours === 0) return 142; // default
    return Math.round(totalHours / failureCount) || 142;
  }, [filteredEngins, filteredPannes]);

  const dispoRate = React.useMemo(() => {
    if (filteredEngins.length === 0) return 94.5; // default
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
    // estimated DH/h total maintenance cost, default is 245
    return 245;
  }, []);

  // Backlog Donut Data
  const backlogDonutData = React.useMemo(() => {
    const openWOs = filteredOrders.filter(wo => wo.status !== 'CLOS' && wo.status !== 'RÉSOLU');
    
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
      { name: "Critique", value: countCritique || 4, color: "#EF4444" },
      { name: "Élevé", value: countEleve || 3, color: "#F97316" },
      { name: "Moyen", value: countMoyen || 3, color: "#EAB308" },
      { name: "Bas", value: countBas || 2, color: "#10B981" }
    ];
  }, [filteredOrders]);

  const totalOpenOTs = React.useMemo(() => {
    const baseTotal = backlogDonutData.reduce((sum, d) => sum + d.value, 0);
    return baseTotal || backlogOTCount || 12;
  }, [backlogDonutData, backlogOTCount]);

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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex-1 bg-slate-50 dark:bg-[#070b13] text-slate-900 dark:text-slate-100 min-h-screen font-sans p-4 lg:p-6 space-y-6 overflow-y-auto"
    >
      {/* CORRECTION 1 : GORGEOUS UNIFIED BANNER */}
      <div id="dashboard-banner" className="bg-white dark:bg-[#0c1220]/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#D4AF37] via-amber-500 to-[#D4AF37] rounded-t-2xl" />
        
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
              className="text-xs font-bold border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900"
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
        <div className="bg-white dark:bg-[#0c1220]/50 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">MTTR (ce mois)</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="my-2">
            <h2 className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">{mttr}h</h2>
            <div className="flex items-center gap-1 text-[10px] mt-1">
              <TrendingDown className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-600 font-semibold">-0.4h</span>
              <span className="text-slate-400">vs mois dern.</span>
            </div>
          </div>
        </div>

        {/* KPI 2: MTBF */}
        <div className="bg-white dark:bg-[#0c1220]/50 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">MTBF</span>
            <Gauge className="h-4 w-4 text-blue-500" />
          </div>
          <div className="my-2">
            <h2 className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">{mtbf}h</h2>
            <div className="flex items-center gap-1 text-[10px] mt-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-600 font-semibold">+8h</span>
              <span className="text-slate-400">vs mois dern.</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Taux Dispo */}
        <div className="bg-white dark:bg-[#0c1220]/50 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Taux Dispo</span>
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="my-2">
            <h2 className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">{dispoRate}%</h2>
            <div className="flex items-center gap-1 text-[10px] mt-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-600 font-semibold">+1.2%</span>
              <span className="text-slate-400">vs mois dern.</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Backlog OT */}
        <div className="bg-white dark:bg-[#0c1220]/50 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Backlog OT</span>
            <Wrench className="h-4 w-4 text-[#D4AF37]" />
          </div>
          <div className="my-2">
            <h2 className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">{totalOpenOTs} ouverts</h2>
            <div className="flex items-center gap-1 text-[10px] mt-1">
              <TrendingDown className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-600 font-semibold">-3</span>
              <span className="text-slate-400">vs mois dern.</span>
            </div>
          </div>
        </div>

        {/* KPI 5: Coût / heure */}
        <div className="bg-white dark:bg-[#0c1220]/50 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm col-span-2 md:col-span-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Coût / heure</span>
            <DollarSign className="h-4 w-4 text-rose-500" />
          </div>
          <div className="my-2">
            <h2 className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">{costPerHour} DH/h</h2>
            <div className="flex items-center gap-1 text-[10px] mt-1">
              <TrendingDown className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-600 font-semibold">-12 DH</span>
              <span className="text-slate-400">vs mois dern.</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN RESPONSIVE LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT SECTION (Width: 2/3 on desktop) - Graphs */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* WIDGET 2 — COURBE ANNUELLE */}
          <div className="bg-white dark:bg-[#0c1220]/50 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  Évolution Annuelle des Événements
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Superposition des pannes, maintenances préventives et correctives sur 12 mois
                </p>
              </div>

              {/* Interactive Legends as Toggles */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setVisibleCurves(prev => ({ ...prev, pannes: !prev.pannes }))}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border flex items-center gap-1.5 ${
                    visibleCurves.pannes
                      ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900"
                      : "bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-900 dark:text-slate-600 dark:border-slate-800"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${visibleCurves.pannes ? "bg-red-500" : "bg-slate-400"}`} />
                  Pannes
                </button>

                <button
                  onClick={() => setVisibleCurves(prev => ({ ...prev, preventif: !prev.preventif }))}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border flex items-center gap-1.5 ${
                    visibleCurves.preventif
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900"
                      : "bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-900 dark:text-slate-600 dark:border-slate-800"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${visibleCurves.preventif ? "bg-emerald-500" : "bg-slate-400"}`} />
                  Préventif (PM)
                </button>

                <button
                  onClick={() => setVisibleCurves(prev => ({ ...prev, correctif: !prev.correctif }))}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border flex items-center gap-1.5 ${
                    visibleCurves.correctif
                      ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900"
                      : "bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-900 dark:text-slate-600 dark:border-slate-800"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${visibleCurves.correctif ? "bg-orange-500" : "bg-slate-400"}`} />
                  Correctif
                </button>
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ANNUAL_HISTORY_MOCK} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="mois" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs space-y-1">
                            <p className="font-bold text-slate-900 dark:text-white uppercase border-b pb-1 mb-1 border-slate-100 dark:border-slate-800">{data.mois}</p>
                            {visibleCurves.pannes && (
                              <p className="text-red-600 dark:text-red-400 font-medium">
                                Pannes : <span className="font-bold font-mono">{data.pannes}</span>
                              </p>
                            )}
                            {visibleCurves.preventif && (
                              <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                                PM (Préventif) : <span className="font-bold font-mono">{data.preventif}</span>
                                <span className={`text-[10px] ml-1.5 font-mono ${data.prevVsLastYear >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                  ({data.prevVsLastYear >= 0 ? `+${data.prevVsLastYear}` : data.prevVsLastYear}% yr)
                                </span>
                              </p>
                            )}
                            {visibleCurves.correctif && (
                              <p className="text-orange-600 dark:text-orange-400 font-medium">
                                Correctif : <span className="font-bold font-mono">{data.correctif}</span>
                                <span className={`text-[10px] ml-1.5 font-mono ${data.corrVsLastYear >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                  ({data.corrVsLastYear >= 0 ? `+${data.corrVsLastYear}` : data.corrVsLastYear}% yr)
                                </span>
                              </p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {visibleCurves.pannes && (
                    <Line type="monotone" dataKey="pannes" stroke="#EF4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  )}
                  {visibleCurves.preventif && (
                    <Line type="monotone" dataKey="preventif" stroke="#10B981" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 3 }} />
                  )}
                  {visibleCurves.correctif && (
                    <Line type="monotone" dataKey="correctif" stroke="#F97316" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 3 }} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* WIDGET 3 — CONSOMMATION MENSUELLE */}
          <div className="bg-white dark:bg-[#0c1220]/50 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  Consommation Carburant & Lubrifiants
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Consommation mensuelle par engin principal sur les 6 derniers mois
                </p>
              </div>
            </div>

            {/* Custom Highlight Panel */}
            <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/60 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-xs text-slate-700 dark:text-amber-300 font-bold flex items-center gap-1.5">
                <span>🏆</span> Top consommateur : ST7-04 (SMI) — 1,240L ce mois
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900 animate-pulse shrink-0 self-start sm:self-auto">
                ⚠️ Anomalie détectée
              </span>
            </div>

            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CONSUMPTION_MOCK} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="engin" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const isAnomaly = (data.carburant + data.lubrifiant) > data.moyenne * 1.2;
                        return (
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs space-y-1">
                            <p className="font-bold text-slate-900 dark:text-white uppercase">{data.engin} ({data.site})</p>
                            <p className="text-blue-600 dark:text-blue-400">Gasoil : <span className="font-bold font-mono">{data.carburant}L</span></p>
                            <p className="text-teal-600 dark:text-teal-400">Lubrifiant : <span className="font-bold font-mono">{data.lubrifiant}L</span></p>
                            <p className="text-slate-500 border-t pt-1 mt-1 font-mono">Moyenne : {data.moyenne}L</p>
                            {isAnomaly && (
                              <p className="text-red-600 dark:text-red-400 font-extrabold text-[10px] uppercase mt-1">⚠️ Anomalie (+20%)</p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="carburant" stackId="a" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="lubrifiant" stackId="a" fill="#14B8A6" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* WIDGET 7 — CARNET DE SANTÉ RAPIDE */}
          <div className="bg-white dark:bg-[#0c1220]/50 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                Carnet de Santé Rapide — Top 3 Engins à Risque
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Engins nécessitant une maintenance ou une inspection immédiate
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CARNET_SANTE_MOCK.map((item) => (
                <div 
                  key={item.id}
                  className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:scale-[1.02] transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{item.engin}</h4>
                      <p className="text-[10px] text-slate-500">{item.modele}</p>
                    </div>
                    <Badge className={
                      item.sante < 50 
                        ? "bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900"
                        : "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900"
                    }>
                      Santé : {item.sante}%
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400">
                      <span>{item.sousSysteme}</span>
                    </div>
                    <Progress 
                      value={item.sante} 
                      className="h-1.5 bg-slate-200 dark:bg-slate-800"
                      color={item.sante < 50 ? "bg-red-500" : "bg-amber-500"}
                    />
                  </div>

                  <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 px-2 py-1 rounded text-center">
                    {item.recommandation}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT SECTION (Width: 1/3 on desktop) - Operational lists & Donut */}
        <div className="space-y-6">
          
          {/* WIDGET 4 — BACKLOG MAINTENANCE (DONUT) */}
          <div className="bg-white dark:bg-[#0c1220]/50 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse" />
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
          <div className="bg-white dark:bg-[#0c1220]/50 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Mécaniciens en Poste aujourd'hui
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Équipe technique active, score mensuel de performance et tournées
              </p>
            </div>

            <div className="space-y-3">
              {MECHANICS_MOCK.map((mech) => (
                <div 
                  key={mech.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 rounded-xl"
                >
                  <img 
                    src={mech.photo} 
                    alt={mech.nom} 
                    className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{mech.nom}</h4>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold ${
                        mech.status === "OK"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900"
                          : "bg-red-50 text-red-600 border border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900"
                      }`}>
                        {mech.status === "OK" ? "✅ Tournée faite" : "🔴 Tournée en retard"}
                      </span>
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>{mech.shift}</span>
                      <span className="font-semibold">Dernière int : {mech.derniereIntervention}</span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[8px] font-semibold text-slate-400">
                        <span>Score Mensuel</span>
                        <span>{mech.score}%</span>
                      </div>
                      <Progress 
                        value={mech.score} 
                        className="h-1 bg-slate-200 dark:bg-slate-800"
                        color={mech.score > 85 ? "bg-emerald-500" : "bg-amber-500"}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WIDGET 6 — ALERTES LIVE */}
          <div className="bg-white dark:bg-[#0c1220]/50 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-600 animate-pulse" />
                Alertes Live
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Les 3 dernières alertes signalées sur les chantiers
              </p>
            </div>

            <div className="space-y-2.5">
              {LIVE_ALERTS_MOCK.map((alert) => (
                <div 
                  key={alert.id}
                  className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex justify-between items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-2 w-2 rounded-full ${
                        alert.type === "CRITIQUE" 
                          ? "bg-red-500 animate-ping" 
                          : alert.type === "MAJEUR" 
                            ? "bg-amber-500" 
                            : "bg-blue-500"
                      }`} />
                      <span className={`text-[9px] font-black tracking-wider uppercase ${
                        alert.type === "CRITIQUE" 
                          ? "text-red-600 dark:text-red-400" 
                          : alert.type === "MAJEUR" 
                            ? "text-amber-600 dark:text-amber-400" 
                            : "text-blue-600 dark:text-blue-400"
                      }`}>
                        {alert.type}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{alert.titre}</h4>
                    <p className="text-[9px] text-slate-500">{alert.site}</p>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 shrink-0">Il y a {alert.heure}</span>
                </div>
              ))}
            </div>
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
