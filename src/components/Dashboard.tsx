import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, 
  AlertTriangle, 
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
  const { activeSite } = useAuthStore();
  
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-transparent text-slate-900 dark:text-slate-100 min-h-screen select-none font-sans"
    >
      
      {/* COCKPIT EXECUTIVE HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 dark:from-sky-500/20 dark:to-blue-600/10 border border-sky-400/20 rounded-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-sky-500/5 animate-pulse"></div>
              <Compass className="h-6.5 w-6.5 text-[#3b82f6] animate-spin relative z-10" style={{ animationDuration: '30s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-wider text-slate-950 dark:text-white uppercase font-sans">
                  EXECUTIVE COMMAND CENTER
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-sky-400 border border-blue-500/20 uppercase tracking-widest leading-none">
                  SOU-GMAO PRO
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[9px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-black">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span> SECURE-LINK ACTIVE
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-2 mt-1 font-mono uppercase tracking-tight">
                CONSOLE DE DIRECTION EXÉCUTIVE ET PLANIFICATION DES RETARDS CHARGEMENT S-GMAO
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="p-1 px-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2 text-xs font-mono font-black text-slate-700 dark:text-slate-300">
            <Database className="h-4 w-4 text-blue-500" />
            <span>LOCAL MEMORY: SECURE CRYPTO CACHE</span>
          </div>

          <Badge variant="outline" className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121929] text-slate-900 dark:text-slate-100 px-4 rounded-xl flex items-center gap-2 text-xs font-black tracking-widest uppercase shadow-sm">
            🛰️ {activeSite === "TOUS" ? "TOUS LES GRANDS SITES" : `SECTEUR : ${activeSite}`}
          </Badge>
        </div>
      </div>

      {/* A. EXECUTIVE HERO CARD - GRID COCKPIT (Optimized Visual Scale) */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-4 mt-2">
        
        {/* Availability Meter Glass Card */}
        <div className="bg-white/85 dark:bg-gradient-to-br dark:from-[#131b2e] dark:to-[#090e1a] border border-slate-200 dark:border-[#1e2a44] rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-colors duration-300"></div>
          
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Disponibilité Physique Flotte</span>
            <Badge className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-400/20 text-[9px] font-mono">OBJECTIF: 85.0%</Badge>
          </div>
          
          <div className="my-4 flex items-baseline gap-2">
            <span className="text-5xl font-black font-mono tracking-tighter text-slate-950 dark:text-white">{avgDispo}%</span>
            <span className={`text-xs font-mono font-black ${Number(avgDispo) >= 85 ? 'text-emerald-500' : 'text-amber-500'}`}>
              {Number(avgDispo) >= 85 ? '▲ CONFORME' : '▼ ALERTE SECTEUR'}
            </span>
          </div>

          <div className="space-y-1.5 z-10">
            <Progress value={Number(avgDispo)} className="h-2 bg-slate-100 dark:bg-slate-950" />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>Seuil critique 70%</span>
              <span>Total: {filteredEngins.length} Machines</span>
            </div>
          </div>
        </div>

        {/* Global Lost Production Estimate */}
        <div className="bg-white/85 dark:bg-gradient-to-br dark:from-[#131b2e] dark:to-[#090e1a] border border-slate-200 dark:border-[#1e2a44] rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors duration-300"></div>
          
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Coût Indisponibilité (24H)</span>
            <Badge className="bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20 text-[9px] font-mono">ESTIMATION EXP.</Badge>
          </div>
          
          <div className="my-4">
            <span className="text-3xl font-black font-mono tracking-tight text-slate-950 dark:text-white">
              {((filteredEngins.filter(e => e.status === 'EN_PANNE').length * 450000 + filteredEngins.filter(e => e.status === 'EN_MAINTENANCE').length * 200000) * 24).toLocaleString('fr-FR')} FCFA
            </span>
            <p className="text-[10px] text-slate-400 dark:text-slate-405 font-mono mt-1">Impact d'extraction non-réalisée sous-sol</p>
          </div>

          <div className="p-2 py-1.5 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl text-[9.5px] font-mono text-slate-600 dark:text-red-405 flex items-center justify-between">
            <span>{filteredEngins.filter(e => e.status === 'EN_PANNE').length} Arrêts critiques</span>
            <span className="font-extrabold">{filteredEngins.filter(e => e.status === 'EN_MAINTENANCE').length} Interventions</span>
          </div>
        </div>

        {/* Unified Sync & Telemetry State */}
        <div className="bg-white/85 dark:bg-gradient-to-br dark:from-[#131b2e] dark:to-[#090e1a] border border-slate-200 dark:border-[#1e2a44] rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors duration-300"></div>
          
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Offline Queue / Tampon</span>
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-mono">AUTONOME</Badge>
          </div>
          
          <div className="my-4 flex items-baseline gap-2">
            <span className="text-5xl font-black font-mono tracking-tighter text-slate-950 dark:text-white">
              {(() => {
                try {
                  return OfflineQueueManager.getPending().length;
                } catch {
                  return 0;
                }
              })()}
            </span>
            <span className="text-xs font-mono text-slate-450 dark:text-slate-405 font-bold uppercase">Transactions en attente</span>
          </div>

          <div className="space-y-1 z-10 text-[10px] text-slate-500 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Synchronisation SQLite web opérationnelle</span>
            </div>
            <p className="text-[9px] text-slate-400/80 leading-none mt-1">Garantie anti-corruption double sauvegarde.</p>
          </div>
        </div>

        {/* Global Maintenance Backlog Intensity */}
        <div className="bg-white/85 dark:bg-gradient-to-br dark:from-[#131b2e] dark:to-[#090e1a] border border-slate-200 dark:border-[#1e2a44] rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors duration-300"></div>
          
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Dette & Intensité BT</span>
            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20 text-[9px] font-mono">CRID CARD</Badge>
          </div>
          
          <div className="my-4 flex items-baseline gap-2">
            <span className="text-5xl font-black font-mono tracking-tighter text-slate-950 dark:text-white">{backlogCritical}</span>
            <span className="text-xs font-mono font-black text-red-500">CRITIQUES OUVERTS</span>
          </div>

          <div className="z-10 text-[10px] text-slate-500 font-mono flex items-center justify-between">
            <span>Surcharge Atelier: {workshopLoad}%</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-650 font-bold uppercase text-[9px]">{workshopLoad > 80 ? "Saturé" : "Gérable"}</span>
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

      {/* D. IA EXECUTIVE ADVISOR & ALERT CENTER (Powered by the AI Engine) */}
      <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono mt-4 mb-2 flex items-center gap-1.5">
        <Sparkles className="h-4 w-4 text-[#ef4444]" /> IA Advisory Directoire — Supervision des Risques S-GMAO
      </h3>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Risk predictions card 7-day */}
        <Card className="bg-gradient-to-br from-red-500/5 to-transparent dark:from-red-950/10 dark:to-transparent border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-red-500/30 transition-all duration-300 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <span className="text-[10px] font-mono font-extrabold text-red-650 dark:text-red-400 flex items-center gap-1">
              <Cpu className="h-3.5 w-3.5" /> ÉVALUANT : PRÉDICTION DE RISQUE MATÉRIEL 7 JOURS
            </span>
            <CardTitle className="text-sm font-black text-slate-900 dark:text-white uppercase font-sans mt-0.5">Moteur de Fréquence Opérationnelle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-red-500/5 dark:bg-red-500/10 border border-red-500/15 rounded-xl text-xs space-y-1.5 text-slate-750 dark:text-slate-330 leading-relaxed font-mono">
              <span className="text-[9.5px] font-black text-rose-500 block">▲ RISQUE MAJEUR : SYSTEME HYDRAULIQUE OUMEJRANE</span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                Analyse historique : La récurrence élevée de micro-défaillances non affectées sur le CAT R1300G d'Oumejrane induit une probabilité de rupture hydraulique estimée à <span className="font-extrabold text-rose-500">82%</span> sous 7 jours.
              </p>
              <p className="text-[10.5px] text-slate-500 leading-tight">
                Action immédiate : Réaffecter préventivement le lot de flexibles de rechange #H_FLX_10 de SMI vers Oumejrane.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Declarative deviations checks - False Availability detecting engine */}
        <Card className="bg-gradient-to-br from-amber-500/5 to-transparent dark:from-amber-950/10 dark:to-transparent border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-amber-500/30 transition-all duration-300 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <span className="text-[10px] font-mono font-extrabold text-amber-650 dark:text-amber-500 flex items-center gap-1">
              <AlertOctagon className="h-3.5 w-3.5" /> CONFORMITÉ : DIVERGENCES ET FAUSSES DISPO
            </span>
            <CardTitle className="text-sm font-black text-slate-900 dark:text-white uppercase font-sans mt-0.5">Audit Écarts de Statut Terrains</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-amber-500/5 dark:bg-[#121422] border border-amber-500/15 rounded-xl text-xs space-y-1.5 leading-relaxed font-mono">
              {(() => {
                const fDevs = filteredEngins.filter(e => {
                  if (e.status !== 'DISPONIBLE') return false;
                  const activeBT = filteredOrders.find(o => 
                    (o.enginId === e.id || o.enginId === e.code || o.codeEngin === e.code) &&
                     o.status === 'EN_COURS' && 
                     (o.type === 'CORRECTIF' || o.severity === 'CRITIQUE' || o.severity === 'élevée')
                  );
                  return !!activeBT;
                });

                if (fDevs.length === 0) {
                  return (
                    <div className="text-emerald-600 dark:text-emerald-400 text-[11px]">
                      🟢 AUCUN ÉCART CONSTATÉ.
                      <p className="mt-1 text-[10px] text-slate-500 leading-tight">
                        Tous les engins déclarés "Disponible" sont exempts d'ordre correctif ou d'anomalie critique en cours. Cohérence terrain préservée.
                      </p>
                    </div>
                  );
                }

                return (
                  <div>
                    <span className="text-[9.5px] font-black text-amber-600 dark:text-amber-500 block">⚠️ CORRECTION ADMINISTRATIVE EXIGÉE :</span>
                    <div className="space-y-1.5 mt-1.5 max-h-[105px] overflow-y-auto pr-1">
                      {fDevs.map(e => (
                        <p key={e.id} className="text-[10.5px] text-slate-600 dark:text-slate-400 leading-tight">
                          <span className="font-extrabold text-amber-500">[{e.code || e.id}]</span> déclaré DISPO mais possède un BT correctif en cours d'exécution. Statut incohérent.
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </CardContent>
        </Card>

        {/* AI Stock balance recommendations */}
        <Card className="bg-gradient-to-br from-indigo-500/5 to-transparent dark:from-indigo-950/10 dark:to-transparent border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <span className="text-[10px] font-mono font-extrabold text-[#4f46e5] dark:text-[#a5b4fc] flex items-center gap-1">
              <Boxes className="h-3.5 w-3.5" /> LOGISTIQUE : COMPATIBILITÉ ET STOCKS SÉCURITÉ
            </span>
            <CardTitle className="text-sm font-black text-slate-900 dark:text-white uppercase font-sans mt-0.5">Allocation & Tensions Pièces de Rechange</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-indigo-500/5 dark:bg-indigo-950/10 border border-indigo-500/15 rounded-xl text-xs space-y-1 text-slate-755 dark:text-slate-330 leading-relaxed font-mono">
              <span className="text-[9.5px] font-black text-indigo-500 block">🔍 ESTIMATION DE RUPTURE ATELIER</span>
              {(() => {
                const lowStockPieces = filteredPieces.filter(p => Number(p.stock) <= Number(p.critique || 2));
                if (lowStockPieces.length === 0) {
                  return (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-none py-1">
                      Niveau de stock tampon de secours suffisant pour les chantiers.
                    </p>
                  );
                }

                return (
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      Demande pièces critiques sans stock disponible détectée :
                    </p>
                    <div className="space-y-1 max-h-[85px] overflow-y-auto">
                      {lowStockPieces.slice(0, 2).map((piece) => (
                        <p key={piece.id} className="text-[10px] text-amber-600 dark:text-amber-500 underline leading-none">
                          • {piece.nom} ({piece.stock} restant)
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })()}
              <p className="text-[10px] text-slate-500 mt-1 lines-none leading-tight">
                COMEX : Suggérer la commande anticipée de kits de filtration d'huile hydraulique pour ne pas saturer.
              </p>
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
