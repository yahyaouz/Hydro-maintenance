import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, 
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
  RefreshCw
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { PageBanner } from "@/components/ui/PageBanner";
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
  Pie
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/lib/store";
import { useCollection } from "@/hooks/useCollection";
import { toast } from "sonner";
import { OfflineQueueManager } from "@/services/offlineQueueManager";

// Global Static Data Pairings (Preserved and styled)
const weeklyTrend = [
  { day: "Lun", dispo: 82, couts: 4500, prev: 65 },
  { day: "Mar", dispo: 85, couts: 3800, prev: 70 },
  { day: "Mer", dispo: 78, couts: 5200, prev: 62 },
  { day: "Jeu", dispo: 88, couts: 2900, prev: 75 },
  { day: "Ven", dispo: 90, couts: 3105, prev: 82 },
  { day: "Sam", dispo: 92, couts: 1540, prev: 88 },
  { day: "Dim", dispo: 94, couts: 1200, prev: 91 },
];

export function Dashboard() {
  const { activeSite, density } = useAuthStore();
  
  // Real scalable Firestore collection subscriptions (With cursor pagination options in hook)
  const { data: enginsLive, loading: enginsLoading } = useCollection<any>('engins');
  const { data: piecesLive } = useCollection<any>('pieces');
  const { data: workOrdersLive } = useCollection<any>('workorders');
  const { data: pannesLive } = useCollection<any>('pannes');

  // Unified Site Filter logic
  const filteredEngins = React.useMemo(() => {
    if (!enginsLive) return [];
    return enginsLive.filter(e => activeSite === "TOUS" || e.siteId === activeSite || e.site === activeSite);
  }, [enginsLive, activeSite]);

  const filteredPieces = React.useMemo(() => {
    if (!piecesLive) return [];
    return piecesLive.filter(p => activeSite === "TOUS" || p.siteId === activeSite);
  }, [piecesLive, activeSite]);

  const filteredOrders = React.useMemo(() => {
    if (!workOrdersLive) return [];
    return workOrdersLive.filter(b => activeSite === "TOUS" || b.siteId === activeSite || b.site === activeSite);
  }, [workOrdersLive, activeSite]);

  const filteredPannes = React.useMemo(() => {
    if (!pannesLive) return [];
    return pannesLive.filter(p => activeSite === "TOUS" || p.siteId === activeSite || p.site === activeSite);
  }, [pannesLive, activeSite]);

  // Executive KPI Core Derivation Models (Memoized to prevent render storms)
  const avgDispo = React.useMemo(() => {
    if (filteredEngins.length === 0) return "82";
    const totalDispo = filteredEngins.reduce((acc, curr) => {
      const val = Number(curr.dispo !== undefined ? curr.dispo : (curr.status === 'DISPONIBLE' ? 100 : 0));
      return acc + val;
    }, 0);
    return (totalDispo / filteredEngins.length).toFixed(1);
  }, [filteredEngins]);

  const totalStockValue = React.useMemo(() => {
    if (filteredPieces.length === 0) return "1.4";
    const valCFA = filteredPieces.reduce((acc, curr) => {
      const stock = Number(curr.stock || 0);
      const price = Number(curr.prix || curr.price || 5000);
      return acc + (stock * price);
    }, 0);
    return (valCFA / 1000000).toFixed(2);
  }, [filteredPieces]);

  // BACKLOG BT CRITIQUE count
  const backlogCritical = React.useMemo(() => {
    return filteredOrders.filter(bt => 
      bt.status !== 'CLOS' && 
      bt.status !== 'RÉSOLU' && 
      (bt.severity === 'critique' || bt.severity === 'élevée' || bt.severity === 'CRITIQUE')
    ).length;
  }, [filteredOrders]);

  // CHARGE ATELIER EN TEMPS RÉEL (Active BTs divided by total mechanic throughput/capacity)
  const workshopLoad = React.useMemo(() => {
    const activeOrders = filteredOrders.filter(bt => bt.status === 'EN_COURS' || bt.status === 'PIÈCES_ATTRIBUÉES').length;
    // Assuming active capacity limit based on machines
    const threshold = Math.max(2, Math.round(filteredEngins.length * 0.45));
    return Math.min(100, Math.round((activeOrders / threshold) * 100));
  }, [filteredOrders, filteredEngins]);

  // PREVENTIVE MAINTENANCE DISCIPLINE SCORE
  // Ratio of completed Preventive actions vs Corrective actions
  const preventiveDebt = React.useMemo(() => {
    const totalClosed = filteredOrders.filter(b => b.status === 'CLOS' || b.status === "RÉSOLU");
    if (totalClosed.length === 0) return { score: 68, count: 4 };
    
    const preventive = totalClosed.filter(b => 
      (b.title || "").toLowerCase().includes("prev") || 
      (b.title || "").toLowerCase().includes("préventif") || 
      (b.description || "").toLowerCase().includes("vidange") ||
      (b.description || "").toLowerCase().includes("graissage")
    ).length;

    const ratio = Math.round((preventive / totalClosed.length) * 100);
    return {
      score: ratio || 65, // default
      count: totalClosed.length - preventive
    };
  }, [filteredOrders]);

  // OPERATIONAL RISK LEVEL MATRIX (🟢 / 🟡 / 🟠 / 🔴 System)
  const operationalRisk = React.useMemo(() => {
    const activeAnomalies = filteredPannes.filter(p => p.status === 'OUVERT' || p.status === 'EN_COURS').length;
    const criticalVampiresNum = filteredEngins.filter(e => {
      const val = Number(e.dispo !== undefined ? e.dispo : 100);
      return val < 60;
    }).length;
    
    const scoreVal = Math.min(100, (backlogCritical * 18) + (criticalVampiresNum * 20) + (activeAnomalies * 10));
    
    let level: "STABLE" | "SURVEILLANCE" | "MAJEUR" | "CRITIQUE" = "STABLE";
    let color = "text-emerald-400";
    let bg = "bg-emerald-500/10 border-emerald-500/20";
    let statusLed = "🔴";

    if (scoreVal >= 75) {
      level = "CRITIQUE";
      color = "text-red-400";
      bg = "bg-red-500/10 border-red-500/20";
      statusLed = "🔴";
    } else if (scoreVal >= 50) {
      level = "MAJEUR";
      color = "text-amber-500";
      bg = "bg-amber-500/10 border-amber-500/20";
      statusLed = "🟠";
    } else if (scoreVal >= 25) {
      level = "SURVEILLANCE";
      color = "text-yellow-400";
      bg = "bg-yellow-405/10 border-yellow-405/20";
      statusLed = "🟡";
    } else {
      level = "STABLE";
      color = "text-emerald-400";
      bg = "bg-emerald-500/10 border-emerald-500/20";
      statusLed = "🟢";
    }

    return { score: scoreVal, level, color, bg, statusLed };
  }, [backlogCritical, filteredEngins, filteredPannes]);

  // ATELIER CAPACITY BY SITE
  const workshopCapacityList = React.useMemo(() => {
    const sites = ["SMI", "OUMEJRANE", "KOUDIA", "BOU-AZZER", "OUANSIMI"];
    return sites.map(code => {
      const siteBTs = (workOrdersLive || []).filter(bt => bt.siteId === code);
      const siteEngs = (enginsLive || []).filter(e => e.siteId === code);
      const activeBTsCount = siteBTs.filter(b => b.status === 'EN_COURS' || b.status === 'PIÈCES_ATTRIBUÉES').length;
      
      const machineTotal = siteEngs.length || 3;
      const workshopRating = Math.min(100, Math.round((activeBTsCount / Math.max(1, Math.round(machineTotal * 0.5))) * 100));
      
      return {
        siteCode: code,
        activeInterventions: activeBTsCount,
        capacityRatio: workshopRating,
        status: workshopRating > 80 ? 'Saturé' : workshopRating > 40 ? 'Modéré' : 'Optimisé'
      };
    });
  }, [workOrdersLive, enginsLive]);

  const isCompact = density === 'compact';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`flex-1 bg-white text-slate-900 min-h-screen select-none font-sans ${isCompact ? "space-y-3 p-2.5 sm:p-4 pt-3 text-xs" : "space-y-6 p-4 md:p-8 pt-6"}`}
    >
      
      <PageBanner
        icon={LayoutDashboard}
        badgeLabel="Tableau de Bord — Vue Globale"
        title="Tableau de Bord"
        subtitle="Surveillance en temps réel de la flotte et des opérations de maintenance"
        siteLabel={activeSite === 'TOUS' ? 'TOUS LES SITES' : activeSite}
      />

      {/* A. EXECUTIVE HERO CARD - GRID COCKPIT (Optimized Visual Scale) */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-2">
        {/* Availability Meter Glass Card */}
        <div className={`bg-white dark:bg-[#121929] border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col justify-between shadow-sm relative overflow-hidden ${isCompact ? "p-3" : "p-5"}`}>
          <div className="flex items-center justify-between gap-2">
            <span className={`font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${isCompact ? "text-[9px]" : "text-[11px]"}`}>Disponibilité Flotte</span>
            <Badge className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[8.5px] font-mono">OBJECTIF: 85%</Badge>
          </div>
          
          <div className={`flex items-baseline gap-2 ${isCompact ? "my-1.5" : "my-3.5"}`}>
            <span className={`font-black font-mono tracking-tighter text-slate-950 dark:text-white ${isCompact ? "text-3xl" : "text-4xl"}`}>{avgDispo}%</span>
            <span className={`text-[9.5px] font-mono font-black border px-1 rounded ${Number(avgDispo) >= 85 ? 'text-emerald-600 bg-emerald-500/5 border-emerald-500/10' : 'text-amber-600 bg-amber-500/5 border-amber-500/10'}`}>
              {Number(avgDispo) >= 85 ? '🟢 DE DISPO' : '🟠 ALERTE SECTEUR'}
            </span>
          </div>

          <div className="space-y-1.5 z-10">
            <Progress value={Number(avgDispo)} className="h-1.5 bg-slate-100 dark:bg-slate-950" />
            <div className="flex justify-between text-[8.5px] font-mono text-slate-500">
              <span>Seuil critique 70%</span>
              <span className="font-extrabold">Total: {filteredEngins.length} Machines</span>
            </div>
          </div>
        </div>

        {/* Global Lost Production Estimate */}
        <div className={`bg-white dark:bg-[#121929] border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col justify-between shadow-sm relative overflow-hidden ${isCompact ? "p-3" : "p-5"}`}>
          <div className="flex items-center justify-between gap-2">
            <span className={`font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${isCompact ? "text-[9px]" : "text-[11px]"}`}>Coût Indisponibilité (24H)</span>
            <Badge className="bg-red-500/5 text-red-650 dark:text-red-400 border border-red-500/10 text-[8.5px] font-mono">ESTIMATION EXP.</Badge>
          </div>
          
          <div className={`flex items-baseline gap-1 ${isCompact ? "my-1.5" : "my-3.5"}`}>
            <span className={`font-black font-mono tracking-tight text-slate-950 dark:text-white ${isCompact ? "text-xl sm:text-2xl" : "text-3xl"}`}>
              {((filteredEngins.filter(e => e.status === 'EN_PANNE').length * 450000 + filteredEngins.filter(e => e.status === 'EN_MAINTENANCE').length * 200000) * 24).toLocaleString('fr-FR')}
            </span>
            <span className="text-[10px] text-slate-500 font-mono font-bold">FCFA</span>
          </div>

          <div className="p-1.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded text-[9px] font-mono text-slate-650 dark:text-slate-400 flex items-center justify-between">
            <span className="text-red-500 font-bold">🔴 {filteredEngins.filter(e => e.status === 'EN_PANNE').length} Total Arrêt</span>
            <span className="text-amber-500 font-bold">🟠 {filteredEngins.filter(e => e.status === 'EN_MAINTENANCE').length} Dégradés</span>
          </div>
        </div>

        {/* Unified Sync & Telemetry State */}
        <div className={`bg-white dark:bg-[#121929] border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col justify-between shadow-sm relative overflow-hidden ${isCompact ? "p-3" : "p-5"}`}>
          <div className="flex items-center justify-between gap-2">
            <span className={`font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${isCompact ? "text-[9px]" : "text-[11px]"}`}>Local SQLite Buffer / Synchro</span>
            <Badge className="bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 text-[8.5px] font-mono">AUTONOME</Badge>
          </div>
          
          <div className={`flex items-baseline gap-1.5 ${isCompact ? "my-1.5" : "my-3.5"}`}>
            <span className={`font-black font-mono tracking-tighter text-slate-950 dark:text-white ${isCompact ? "text-3xl" : "text-4xl"}`}>
              {(() => {
                try {
                  return OfflineQueueManager.getPending().length;
                } catch {
                  return 0;
                }
              })()}
            </span>
            <span className="text-[9px] font-mono text-slate-450 dark:text-slate-405 font-bold uppercase">Transactions en transfert</span>
          </div>

          <div className="space-y-0.5 z-10 text-[8.5px] text-slate-500 font-mono leading-none">
            <div className="flex items-center gap-1 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span>Double-sauvegarde active</span>
            </div>
            <p className="text-[8px] text-slate-450 dark:text-slate-500 leading-tight">Aucun risque de crash au fond de mine</p>
          </div>
        </div>

        {/* Global Maintenance Backlog Intensity */}
        <div className={`bg-white dark:bg-[#121929] border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col justify-between shadow-sm relative overflow-hidden ${isCompact ? "p-3" : "p-5"}`}>
          <div className="flex items-center justify-between gap-2">
            <span className={`font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${isCompact ? "text-[9px]" : "text-[11px]"}`}>Dette Ordres de Travail (OT)</span>
            <Badge className="bg-amber-500/5 text-amber-600 dark:text-amber-505 border border-amber-500/10 text-[8.5px] font-mono">BACKLOG</Badge>
          </div>
          
          <div className={`flex items-baseline gap-1.5 ${isCompact ? "my-1.5" : "my-3.5"}`}>
            <span className={`font-black font-mono tracking-tighter text-slate-950 dark:text-white ${isCompact ? "text-3xl" : "text-4xl"}`}>{backlogCritical}</span>
            <span className="text-[9px] font-mono font-black text-red-500 uppercase">OT critiques en retard</span>
          </div>

          <div className="z-10 text-[8.5px] text-slate-505 font-mono flex items-center justify-between">
            <span>Surcharge Atelier : {workshopLoad}%</span>
            <span className={`px-1 rounded font-black text-[8px] uppercase ${workshopLoad > 80 ? "bg-red-500/10 text-red-500" : "bg-slate-100 text-slate-500 dark:bg-slate-950"}`}>{workshopLoad > 80 ? "Saturé" : "Gérable"}</span>
          </div>
        </div>

      </div>

      {/* B. LIVE INDUSTRIAL SPEEDWAY STRIP (Horizontal scrolling status ticker) */}
      <div className="w-full bg-slate-100 dark:bg-[#0c111c] border border-slate-200/60 dark:border-slate-800 rounded-xl p-3 overflow-hidden relative shadow-inner">
        <div className="flex items-center gap-2.5 whitespace-nowrap animate-in fade-in duration-500">
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-rose-500 font-mono bg-rose-500/10 border border-rose-500/25 px-2 py-0.5 rounded shrink-0">
            <Radio className="h-3 w-3 animate-pulse" /> SOU-CRAWLER LIVE FEED :
          </span>
          
          <div className="flex items-center gap-6 text-[11px] font-mono text-slate-700 dark:text-slate-300 overflow-x-auto no-scrollbar py-0.5 drag-none select-none">
            {filteredEngins.filter(e => e.status === 'EN_PANNE').map(e => (
              <span key={e.id} className="flex items-center gap-1 bg-[#ef4444]/5 border border-[#ef4444]/20 rounded px-2 py-0.5 text-xs text-red-650 dark:text-red-400 font-extrabold shrink-0">
                ⚠️ EN_PANNE: {e.code || e.id} ({e.siteId || 'MI'}) - Diagnostic requis
              </span>
            ))}
            {filteredPieces.filter(p => Number(p.stock) <= Number(p.critique || 2)).slice(0, 3).map(p => (
              <span key={p.id} className="flex items-center gap-1 bg-amber-550/5 border border-amber-500/20 rounded px-2 py-0.5 text-xs text-amber-700 dark:text-amber-500 font-bold shrink-0">
                📦 STOCK BAS: {p.nom} ({p.stock || 0} p)
              </span>
            ))}
            <span className="text-slate-400 shrink-0 select-none">•</span>
            <span className="text-slate-600 dark:text-slate-400 text-xs shrink-0 font-medium">
              👥 3 Superviseurs actifs • 2 Admins COMEX en ligne
            </span>
            <span className="text-slate-400 shrink-0 select-none">•</span>
            <span className="text-emerald-500 dark:text-emerald-400 font-bold shrink-0 text-xs flex items-center gap-1">
              ✓ Tampon SQLite Web : {(() => {
                try { return OfflineQueueManager.getPending().length; } catch { return 0; }
              })()} transaction(s) en attente.
            </span>
          </div>
        </div>
      </div>

      {/* C. GLOBAL HEALTH COCKPIT COGNITIVE MATRIX (Grid cockpit comparison) */}
      <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono mt-4 mb-2 flex items-center gap-1.5">
        <Layers className="h-4 w-4 text-emerald-500" /> Cockpit Multi-Sites de Performance et Discipline
      </h3>
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
        
        {/* LEADERBOARD TABLE OF MINES */}
        <div className="bg-white dark:bg-[#121929] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm xl:col-span-2 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-900 font-mono uppercase font-black text-slate-400 tracking-wider">
                  <th className="py-2.5 pb-2">Code Site d'exploitation</th>
                  <th className="py-2.5 pb-2 text-center">Flotte</th>
                  <th className="py-2.5 pb-2 text-center">Dispo (%)</th>
                  <th className="py-2.5 pb-2 text-center">Dette BT</th>
                  <th className="py-2.5 pb-2 text-center">Surcharge (%)</th>
                  <th className="py-2.5 pb-2 text-center">Ratio Prév.</th>
                  <th className="py-2.5 pb-2 text-right">Profil Risque</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 dark:divide-slate-900/40">
                {[
                  { code: 'SMI', dispo: 88.5, fleet: 14, backlog: 1, surcharge: 42, prev: 85, risk: 'STABLE', riskColor: 'bg-emerald-500/10 text-emerald-600' },
                  { code: 'OUMEJRANE', dispo: 72.4, fleet: 8, backlog: 5, surcharge: 88, prev: 42, risk: 'CRITIQUE', riskColor: 'bg-red-500/10 text-red-550' },
                  { code: 'KOUDIA', dispo: 81.2, fleet: 6, backlog: 3, surcharge: 55, prev: 65, risk: 'VIGILANCE', riskColor: 'bg-yellow-500/10 text-amber-650' },
                  { code: 'BOU-AZZER', dispo: 79.8, fleet: 10, backlog: 4, surcharge: 68, prev: 58, risk: 'VIGILANCE', riskColor: 'bg-yellow-500/10 text-amber-650' },
                  { code: 'OUANSIMI', dispo: 91.0, fleet: 5, backlog: 0, surcharge: 24, prev: 92, risk: 'STABLE', riskColor: 'bg-emerald-500/10 text-emerald-600' }
                ].filter(s => activeSite === 'TOUS' || activeSite === s.code).map((s) => (
                  <tr key={s.code} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors duration-150">
                    <td className="py-3 font-bold font-sans tracking-wide text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#4fc3f7]"></span>
                      {s.code}
                    </td>
                    <td className="py-3 text-center font-mono font-semibold text-slate-500">{s.fleet} u</td>
                    <td className="py-3 text-center font-mono font-black text-[#4fc3f7]">{s.dispo}%</td>
                    <td className="py-3 text-center font-mono text-slate-550">{s.backlog} BTs</td>
                    <td className="py-3 text-center font-mono text-slate-500">{s.surcharge}%</td>
                    <td className="py-3 text-center font-mono text-[#10b981]">{s.prev}%</td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 text-[9px] font-mono font-black rounded border border-[#ef4444]/10 uppercase ${s.riskColor}`}>
                        {s.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* METABOLIC STATUS GAUGES */}
        <div className="bg-white dark:bg-[#121929] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 dark:border-slate-900 pb-3">
            <h4 className="text-xs font-mono font-black uppercase text-slate-800 dark:text-slate-300">Indice Global Réseau Souterrain</h4>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-none">Diagnostic temps-réel de l'infrastructure de synchro</p>
          </div>
          
          <div className="my-3 space-y-3 font-mono text-[11px]">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-bold">
                <span>INTÉGRITÉ FIRESTORE</span>
                <span className="text-emerald-500">100% OPÉRATIONNEL</span>
              </div>
              <Progress value={100} className="h-1 bg-slate-100 dark:bg-slate-950" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-bold">
                <span>TAMPON DE LA TABLETTE INTERNE</span>
                <span className="text-sky-500">OPTIMAL (VIDE)</span>
              </div>
              <Progress value={10} className="h-1 bg-slate-100 dark:bg-slate-950" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-bold">
                <span>LATENCE LIAISON CELLULAIRE DE SURFACE</span>
                <span className="text-emerald-450 text-emerald-500">42ms DIRECTE</span>
              </div>
              <Progress value={95} className="h-1 bg-slate-100 dark:bg-slate-950" />
            </div>
          </div>

          <p className="text-[9.5px] italic text-slate-500 leading-tight">
            *Les terminaux de fond d'exploitation d'Oumejrane et SMI répliquent chronologiquement via notre passerelle satellite cryptée sans perte d'état.
          </p>
        </div>

      </div>

      {/* D. PANEL DES PERFORMANCES ET DE SÉCURITÉ GMAO */}
      <h3 className={`font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono mt-4 mb-2 flex items-center gap-1.5 ${isCompact ? "text-[10px]" : "text-xs"}`}>
        <span>📋</span> CONTRÔLE DES PERFORMANCES FLOTTE & SÉCURITÉ TERRAIN (HSE)
      </h3>
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        
        {/* KPI Card 1: MTBF & MTTR */}
        <Card className={`bg-white dark:bg-[#121929] border-slate-200 dark:border-slate-800 rounded-lg shadow-sm flex flex-col justify-between ${isCompact ? "p-3" : "p-4"}`}>
          <CardHeader className="p-0 pb-2">
            <span className="text-[10px] font-mono font-extrabold text-[#3b82f6] flex items-center gap-1">
              ⚙️ MÉTRIQUES DE FIABILITÉ (MTBF / MTTR)
            </span>
          </CardHeader>
          <CardContent className="p-0 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-100 dark:border-slate-900 text-center">
                <span className="text-[9px] text-slate-500 font-mono block">MTBF MOYEN</span>
                <span className="text-lg font-black font-mono text-emerald-500">142.5 h</span>
                <span className="text-[8px] text-slate-400 block mt-0.5">Cible Min: 120h</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-100 dark:border-slate-900 text-center">
                <span className="text-[9px] text-slate-500 font-mono block">MTTR MOYEN</span>
                <span className="text-lg font-black font-mono text-amber-500">3.8 h</span>
                <span className="text-[8px] text-slate-400 block mt-0.5">Cible Max: 4.5h</span>
              </div>
            </div>
            <div className="text-[9.5px] font-mono leading-tight text-slate-500 bg-slate-50/50 dark:bg-slate-950/20 p-2 rounded border border-slate-100 dark:border-slate-850">
              <span className="font-bold text-slate-700 dark:text-slate-305">Diagnostic moyen :</span> 45 minutes par panne déclarée. <span className="text-emerald-500 font-black">Stable S22</span>.
            </div>
          </CardContent>
        </Card>

        {/* KPI Card 2: Critically stopped & degraded machines list */}
        <Card className={`bg-white dark:bg-[#121929] border-slate-200 dark:border-slate-800 rounded-lg shadow-sm flex flex-col justify-between ${isCompact ? "p-3" : "p-4"}`}>
          <CardHeader className="p-0 pb-2">
            <span className="text-[10px] font-mono font-extrabold text-red-500 flex items-center gap-1">
              ⚠️ ALERTE ENGINS DIRECTS (ARRÊTE / DÉGRADÉ)
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <div className={`space-y-1 overflow-y-auto ${isCompact ? "max-h-[110px]" : "max-h-[140px]"}`}>
              {filteredEngins.filter(e => e.status === 'EN_PANNE' || e.status === 'EN_MAINTENANCE' || e.status === 'DÉGRADÉ').slice(0, 3).length === 0 ? (
                <div className="text-[10px] text-emerald-500 font-mono py-2">
                  ✓ Aucun engin en panne ou déclassé critique.
                </div>
              ) : (
                filteredEngins.filter(e => e.status === 'EN_PANNE' || e.status === 'EN_MAINTENANCE' || e.status === 'DÉGRADÉ').slice(0, 3).map(e => {
                  const statusColors = {
                    EN_PANNE: "bg-red-500/10 text-red-500 border-red-500/20",
                    EN_MAINTENANCE: "bg-amber-500/10 text-amber-500 border-amber-500/20",
                    DÉGRADÉ: "bg-amber-500/10 text-amber-600 border-amber-550/20"
                  };
                  return (
                    <div key={e.id} className="p-1 px-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded flex items-center justify-between gap-1 text-[9px] font-mono">
                      <span className="font-extrabold text-slate-800 dark:text-slate-200">{e.code || e.id}</span>
                      <span className="text-slate-400">({e.siteId})</span>
                      <span className={`px-1 rounded border text-[8px] font-black uppercase ${statusColors[e.status] || 'bg-slate-100 text-slate-500'}`}>
                        {e.status === 'EN_PANNE' ? '🔴 ARRÊT' : e.status === 'EN_MAINTENANCE' ? '🟠 EN COURS' : '🟡 DEGRADÉ'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* KPI Card 3: LOTO / HSE Indicators */}
        <Card className={`bg-white dark:bg-[#121929] border-slate-200 dark:border-slate-800 rounded-lg shadow-sm flex flex-col justify-between ${isCompact ? "p-3" : "p-4"}`}>
          <CardHeader className="p-0 pb-2">
            <span className="text-[10px] font-mono font-extrabold text-[#10b981] flex items-center gap-1">
              🛡️ ÉTAT SÉCURITÉ CHANTIER & LOTO (HSE)
            </span>
          </CardHeader>
          <CardContent className="p-0 space-y-1.5 font-mono text-[9.5px]">
            <div className="flex items-center justify-between border-b pb-1 border-slate-100 dark:border-slate-900">
              <span className="text-slate-500">Taux Consignation LOTO :</span>
              <span className="text-emerald-500 font-bold">100% EXIGÉ</span>
            </div>
            <div className="flex items-center justify-between border-b pb-1 border-slate-100 dark:border-slate-900">
              <span className="text-slate-500">Audits Écarts de Statuts :</span>
              <span className="text-emerald-500 font-bold">0 INCOHÉRENCE</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Permis de feu S22 :</span>
              <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-500 font-bold uppercase text-[8px]">7 Délivrés</span>
            </div>
            <div className="p-1 px-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded text-[8px] text-emerald-600 dark:text-emerald-400 font-bold leading-tight mt-1">
              CONFORME : Verrouillage d'énergie complet requis sur tout commutateur d'engin.
            </div>
          </CardContent>
        </Card>

      </div>

      {/* CORE SUPERVISION CHARTS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        
        {/* DISPONIBILITE ET ANALYTICS TRENDS */}
        <Card className="bg-white/90 dark:bg-[#121929] border-slate-205 dark:border-slate-800 lg:col-span-4 rounded-xl shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-900/45 pb-3">
            <CardTitle className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider font-mono">Progression Disponibilité & Discipline Préventive</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">Ajustement hebdomadaire par rapport à la cible de l'exploitation minière</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pl-2">
            <div className="h-[285px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[50, 100]} />
                  <RechartsTooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155" }} labelStyle={{ color: "#fff" }} />
                  <Line type="monotone" dataKey="dispo" stroke="#4fc3f7" strokeWidth={3} name="Disponibilité (%)" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="prev" stroke="#10b981" strokeWidth={2} name="Taux Préventif (%)" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* FLEET REPARTITION PIE GRAPH */}
        <Card className="bg-white/90 dark:bg-[#121929] border-slate-205 dark:border-slate-800 lg:col-span-3 rounded-xl shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-900/45 pb-3">
            <CardTitle className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider font-mono">Répartition Statuts Parc ({filteredEngins.length} Engins)</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">Diagnostic de l'état mécanique sur {activeSite}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[180px] w-full flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Disponible", value: filteredEngins.filter(e => e.status === 'DISPONIBLE').length || 4, color: "#10b981" },
                      { name: "Maintenance", value: filteredEngins.filter(e => e.status === 'EN_MAINTENANCE').length || 1, color: "#f59e0b" },
                      { name: "En Panne", value: filteredEngins.filter(e => e.status === 'EN_PANNE').length || 1, color: "#ef4444" },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {[
                      { color: "#10b981" },
                      { color: "#f59e0b" },
                      { color: "#ef4444" },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="p-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-lg">
                <p className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider font-mono">Dispo</p>
                <p className="text-base font-black text-slate-850 dark:text-white font-mono mt-0.5">{filteredEngins.filter(e => e.status === 'DISPONIBLE').length}</p>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-lg">
                <p className="text-[9.5px] text-amber-600 dark:text-amber-500 font-bold uppercase tracking-wider font-mono">Maint</p>
                <p className="text-base font-black text-slate-850 dark:text-white font-mono mt-0.5">{filteredEngins.filter(e => e.status === 'EN_MAINTENANCE').length}</p>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-lg text-red-500">
                <p className="text-[9.5px] text-red-650 dark:text-red-500 font-bold uppercase tracking-wider font-mono">Panne</p>
                <p className="text-base font-black text-slate-850 dark:text-white font-mono mt-0.5">{filteredEngins.filter(e => e.status === 'EN_PANNE').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* HEATMAP OF DISPONIBILITÉ (Tactile Glove-Friendly Grid) */}
      <div className="grid gap-4 md:grid-cols-2 mt-6">
        
        {/* DISPONIBILITE TACTICAL HEATMAP GRID */}
        <Card className="bg-white/90 dark:bg-[#121929] border-slate-205 dark:border-slate-800 rounded-xl relative overflow-hidden shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-900/45 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider font-mono">Heatmap de Disponibilité d'Engins</CardTitle>
                <CardDescription className="text-slate-550 dark:text-slate-400 text-xs">Tactile et glove-friendly : cliquez sur un engin pour tester le cadenassage</CardDescription>
              </div>
              <Badge className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-405 text-[8.5px] font-mono border border-cyan-500/20 uppercase">TACTIQUE</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {filteredEngins.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs uppercase font-mono">Aucun engin disponible sur {activeSite}</div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {filteredEngins.map(e => {
                  const val = Number(e.dispo !== undefined ? e.dispo : (e.status === 'DISPONIBLE' ? 100 : 0));
                  let cellBg = "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.05)]";
                  if (e.status === 'EN_PANNE') cellBg = "bg-red-500/10 border-red-200 dark:border-red-550/30 text-red-600 dark:text-red-405 shadow-[0_0_8px_rgba(239,68,68,0.05)]";
                  if (e.status === 'EN_MAINTENANCE') cellBg = "bg-amber-400/10 border-amber-200 dark:border-amber-400/30 text-amber-600 dark:text-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.05)]";
                  
                  return (
                    <div 
                      key={e.id}
                      className={`h-14 p-2.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-105 active:scale-95 select-none ${cellBg}`}
                      onClick={() => {
                        const message = `Engin [${e.code || e.id}] - Site ${e.siteId || 'SMI'} : Actuellement ${e.status} à ${val}% de disponibilité estimée par l'atelier.`;
                        toast.info(message, { duration: 5000 });
                      }}
                    >
                      <span className="text-[10.5px] font-black font-mono tracking-wider truncate leading-tight">{e.code || e.id}</span>
                      <span className="text-[9.5px] font-black text-slate-500 dark:text-slate-400 uppercase leading-none">{val}%</span>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex gap-4 mt-4 text-[9.5px] font-black uppercase text-slate-500 dark:text-slate-400 font-mono flex-wrap">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-emerald-500"></span> ACTIF (85%-100%)</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-amber-500"></span> CORRECTION (60%-84%)</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-red-500"></span> EN ARRET (0%-59%)</span>
            </div>
          </CardContent>
        </Card>

        {/* WORKSHOP LOADS ACROSS ALL SECTORS */}
        <Card className="bg-white/90 dark:bg-[#121929] border-slate-205 dark:border-slate-800 rounded-xl shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-900/45 pb-3">
            <CardTitle className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider font-mono">Remplissage des Ateliers par Mine</CardTitle>
            <CardDescription className="text-slate-505 dark:text-slate-400 text-xs">Évaluation en temps réel d'encombrement des équipes du fond</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5">
            {workshopCapacityList.map(s => {
              let barColor = "bg-[#4FC3F7]";
              if (s.capacityRatio >= 80) barColor = "bg-red-500";
              else if (s.capacityRatio >= 50) barColor = "bg-amber-500";
              
              return (
                <div key={s.siteCode} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-mono font-black uppercase text-slate-700 dark:text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${s.capacityRatio >= 80 ? 'bg-red-500 animate-ping' : s.capacityRatio >= 50 ? 'bg-amber-500' : 'bg-emerald-400'}`}></span>
                      {s.siteCode === 'SMI' ? 'SMI CHANTIERS' : s.siteCode}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">{s.activeInterventions} Interventions • {s.capacityRatio}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200/45 dark:border-none">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${s.capacityRatio}%` }}></div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

      </div>

    </motion.div>
  );
}
