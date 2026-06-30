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
  RefreshCw,
  Calendar
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { PageBanner } from "@/components/ui/PageBanner";
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
  Legend,
  AreaChart,
  Area,
  ComposedChart
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/lib/store";
import { useCollection } from "@/hooks/useCollection";
import { toast } from "sonner";
import { OfflineQueueManager } from "@/services/offlineQueueManager";

// 5 default sites for multi-site metrics
const SITES_LIST = ["SMI", "OUMEJRANE", "KOUDIA", "OUANSIMI", "BOU-AZZER"];

interface ComplianceSite {
  code: string;
  fleetCount: number;
  complianceScore: number;
  totalPM: number;
  faitesATemps: number;
  enRetardCritique: number;
  backlogCritique: number;
  risk: 'STABLE' | 'VIGILANCE' | 'CRITIQUE';
  enginsARisqueCount: number;
}

// Sub-component for individual site compliance capsules
function FleetHealthCapsule({ 
  site, 
  isCompact, 
  isActiveSite,
  hasSelection
}: { 
  site: ComplianceSite; 
  isCompact: boolean; 
  isActiveSite: boolean;
  hasSelection: boolean;
}) {
  const ringColor = site.risk === 'CRITIQUE' ? '#DC2626' : site.risk === 'VIGILANCE' ? '#D97706' : '#059669';
  const svgSize = isCompact ? 68 : 84;
  const radius = isCompact ? 26 : 34;
  const strokeWidth = isCompact ? 5 : 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (site.complianceScore / 100) * circumference;
  const center = svgSize / 2;

  const opacity = hasSelection && !isActiveSite ? 'opacity-50 hover:opacity-80' : 'opacity-100';
  const borderStyle = isActiveSite 
    ? 'border-amber-500 ring-2 ring-amber-500/10 shadow-md bg-gradient-to-b from-white to-amber-50/5' 
    : site.risk === 'CRITIQUE' 
      ? 'border-red-200 bg-red-50/5' 
      : 'border-slate-200 bg-white';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`flex flex-col items-center justify-between text-center p-3 sm:p-4 rounded-2xl border transition-all duration-300 ${opacity} ${borderStyle}`}
    >
      <div className="relative flex items-center justify-center">
        <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#F1F5F9" strokeWidth={strokeWidth} />
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            transform={`rotate(-90 ${center} ${center})`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono font-black text-slate-900 leading-none text-xs sm:text-sm">
            {site.complianceScore}%
          </span>
          <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 leading-none">
            comp.
          </span>
        </div>
      </div>

      <div className="mt-3 space-y-1 w-full">
        <span className="text-[11px] font-black uppercase text-slate-800 font-sans tracking-wide block">
          {site.code}
        </span>
        <div className="flex items-center justify-center gap-1">
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${
            site.risk === 'CRITIQUE' ? 'bg-red-600 animate-pulse' :
            site.risk === 'VIGILANCE' ? 'bg-amber-600' :
            'bg-emerald-600'
          }`} />
          <span className={`text-[8.5px] font-black uppercase tracking-wider ${
            site.risk === 'CRITIQUE' ? 'text-red-600 font-bold' :
            site.risk === 'VIGILANCE' ? 'text-amber-600 font-bold' :
            'text-emerald-600 font-bold'
          }`}>
            {site.risk}
          </span>
        </div>
        
        {site.enginsARisqueCount > 0 ? (
          <span className="text-[8.5px] text-red-650 bg-red-50 border border-red-100 px-1 py-0.5 rounded font-black block mt-1 animate-pulse">
            {site.enginsARisqueCount} engin{site.enginsARisqueCount > 1 ? 's' : ''} à risque
          </span>
        ) : (
          <span className="text-[8px] text-slate-400 font-medium block mt-1">
            Flotte stable
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function Dashboard() {
  const { activeSite, density } = useAuthStore();
  const isCompact = density === 'compact';
  const [isSignalerPanneOpen, setIsSignalerPanneOpen] = React.useState(false);

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
    return "DISPONIBLE"; // fallback
  }, []);
  
  // Real scalable Firestore collection subscriptions
  const { data: enginsLive, loading: enginsLoading } = useCollection<any>('engins');
  const { data: piecesLive } = useCollection<any>('pieces');
  const { data: workOrdersLive } = useCollection<any>('workorders');
  const { data: pannesLive } = useCollection<any>('pannes');
  const { data: tasksLive } = useCollection<any>('maintenanceTasks');

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

  const filteredTasks = React.useMemo(() => {
    if (!tasksLive) return [];
    return tasksLive.filter(t => activeSite === "TOUS" || t.siteId === activeSite);
  }, [tasksLive, activeSite]);

  // Executive KPI Core Derivation Models (Memoized)
  const avgDispo = React.useMemo(() => {
    if (filteredEngins.length === 0) return 0;
    const totalDispo = filteredEngins.reduce((acc, curr) => {
      const status = getNormalizedStatus(curr);
      const val = Number(curr.dispo !== undefined ? curr.dispo : (status === 'DISPONIBLE' ? 100 : status === 'EN_MAINTENANCE' ? 50 : 0));
      return acc + val;
    }, 0);
    return Math.round(totalDispo / filteredEngins.length);
  }, [filteredEngins, getNormalizedStatus]);

  // Operational cost estimation based on standard mine indicators
  const coutIndispo24H = React.useMemo(() => {
    const arrEngins = filteredEngins.filter(e => getNormalizedStatus(e) === 'EN_PANNE').length;
    const maintEngins = filteredEngins.filter(e => getNormalizedStatus(e) === 'EN_MAINTENANCE').length;
    return (arrEngins * 450000 + maintEngins * 200000) * 24;
  }, [filteredEngins, getNormalizedStatus]);

  // Backlog BT Critique
  const backlogCritical = React.useMemo(() => {
    return filteredOrders.filter(bt => 
      bt.status !== 'CLOS' && 
      bt.status !== 'RÉSOLU' && 
      (bt.severity === 'critique' || bt.severity === 'CRITIQUE')
    ).length;
  }, [filteredOrders]);

  // Workshop capacity rating
  const workshopLoad = React.useMemo(() => {
    const activeOrders = filteredOrders.filter(bt => bt.status === 'EN_COURS' || bt.status === 'PIÈCES_ATTRIBUÉES').length;
    const threshold = Math.max(2, Math.round(filteredEngins.length * 0.45));
    return Math.min(100, Math.round((activeOrders / threshold) * 100));
  }, [filteredOrders, filteredEngins]);

  // Local pending transactions counter
  const localPendingCount = React.useMemo(() => {
    try {
      return OfflineQueueManager.getPending().length;
    } catch {
      return 0;
    }
  }, []);

  // 1. Compliance PM par chantier
  const complianceParSite = React.useMemo(() => {
    return SITES_LIST.map(code => {
      const siteEngins = (enginsLive || []).filter(e => e.siteId === code);
      const siteTasks = (tasksLive || []).filter(t => t.siteId === code && t.type === 'PREVENTIF');
      
      const totalPM = siteTasks.length;
      const faitesATemps = siteTasks.filter(t => 
        (t.statut === 'FAIT' || t.statut === 'VALIDE') && t.priorite !== 'CRITIQUE'
      ).length;
      const enRetardCritique = siteTasks.filter(t => 
        t.statut === 'NON_FAIT' && t.priorite === 'CRITIQUE'
      ).length;
      
      const complianceScore = totalPM > 0 ? Math.round((faitesATemps / totalPM) * 100) : 100;
      
      const siteBTs = (workOrdersLive || []).filter(b => b.siteId === code);
      const backlogCritiqueSite = siteBTs.filter(bt => 
        bt.status !== 'CLOS' && bt.status !== 'RÉSOLU' && 
        (bt.severity === 'critique' || bt.severity === 'CRITIQUE')
      ).length;
      
      let risk: 'STABLE' | 'VIGILANCE' | 'CRITIQUE' = 'STABLE';
      if (complianceScore < 60 || enRetardCritique >= 3) risk = 'CRITIQUE';
      else if (complianceScore < 80 || enRetardCritique >= 1) risk = 'VIGILANCE';
      
      return {
        code,
        fleetCount: siteEngins.length,
        complianceScore,
        totalPM,
        faitesATemps,
        enRetardCritique,
        backlogCritique: backlogCritiqueSite,
        risk,
        enginsARisqueCount: enRetardCritique
      } as ComplianceSite;
    });
  }, [enginsLive, tasksLive, workOrdersLive]);

  // 2. Engins à risque (dépassement PM)
  const enginsARisque = React.useMemo(() => {
    if (!tasksLive || !enginsLive) return [];
    
    const tachesPMCritiques = tasksLive.filter(t => 
      t.type === 'PREVENTIF' && 
      t.statut === 'NON_FAIT' && 
      t.priorite === 'CRITIQUE' &&
      (activeSite === 'TOUS' || t.siteId === activeSite)
    );
    
    return tachesPMCritiques.map(t => {
      const engin = enginsLive.find(e => e.id === t.enginId);
      const depassementHeures = engin 
        ? (engin.heuresMarche - (t.heuresEnginAuMoment || 0)) - (t.echeanceHeures || 0)
        : 0;
      return {
        enginId: t.enginId,
        code: engin?.code || t.enginId,
        siteId: t.siteId,
        operation: t.label,
        depassementHeures: Math.max(0, depassementHeures),
        heuresActuelles: engin?.heuresMarche || 0
      };
    }).sort((a, b) => b.depassementHeures - a.depassementHeures);
  }, [tasksLive, enginsLive, activeSite]);

  // 3. Ratio Préventif/Correctif réel
  const ratioPreventifCorrectif = React.useMemo(() => {
    const tachesClosesMois = filteredTasks.filter(t => {
      if (t.statut !== 'FAIT' && t.statut !== 'VALIDE') return false;
      const taskMonth = (t.datePlanifiee || '').substring(0, 7);
      const currentMonth = new Date().toISOString().substring(0, 7);
      return taskMonth === currentMonth;
    });
    
    const preventif = tachesClosesMois.filter(t => t.type === 'PREVENTIF').length;
    const correctif = tachesClosesMois.filter(t => t.type === 'CORRECTIF').length;
    const total = preventif + correctif;
    
    return {
      preventifPct: total > 0 ? Math.round((preventif / total) * 100) : 0,
      correctifPct: total > 0 ? Math.round((correctif / total) * 100) : 0,
      total,
      preventif,
      correctif
    };
  }, [filteredTasks]);

  // 4. Tendance 7 jours réelle
  const tendance7Jours = React.useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('fr-FR', { weekday: 'short' });
      
      const tasksJour = filteredTasks.filter(t => t.datePlanifiee === dayStr);
      const tachesFaites = tasksJour.filter(t => t.statut === 'FAIT' || t.statut === 'VALIDE').length;
      const tauxRealisation = tasksJour.length > 0 
        ? Math.round((tachesFaites / tasksJour.length) * 100) 
        : null; 
      
      const pmJour = tasksJour.filter(t => t.type === 'PREVENTIF');
      const pmFaitesJour = pmJour.filter(t => t.statut === 'FAIT' || t.statut === 'VALIDE').length;
      const tauxPMJour = pmJour.length > 0 ? Math.round((pmFaitesJour / pmJour.length) * 100) : null;
      
      days.push({ day: dayLabel, taux: tauxRealisation, prev: tauxPMJour, date: dayStr });
    }
    return days;
  }, [filteredTasks]);

  // 5. Backlog validation Responsable (+48h)
  const tachesEnAttenteValidation = React.useMemo(() => {
    const now = Date.now();
    return filteredTasks.filter(t => {
      if (t.statut !== 'FAIT') return false;
      if (!t.updatedAt) return false;
      const updatedMs = t.updatedAt.toMillis ? t.updatedAt.toMillis() : new Date(t.updatedAt).getTime();
      const heuresEcoulees = (now - updatedMs) / (1000 * 60 * 60);
      return heuresEcoulees >= 48;
    });
  }, [filteredTasks]);

  // MTBF / MTTR Calculs réels basés sur les données
  const fiabiliteMetrics = React.useMemo(() => {
    const closedWOs = filteredOrders.filter(b => b.status === 'CLOS' || b.status === 'RÉSOLU');
    if (closedWOs.length === 0) {
      return { mtbf: null, mttr: null, totalClosed: 0 };
    }
    
    let totalDurationHours = 0;
    let countWithDuration = 0;
    closedWOs.forEach(wo => {
      if (wo.createdAt && wo.updatedAt) {
        const start = wo.createdAt.toMillis ? wo.createdAt.toMillis() : new Date(wo.createdAt).getTime();
        const end = wo.updatedAt.toMillis ? wo.updatedAt.toMillis() : new Date(wo.updatedAt).getTime();
        const durationHours = (end - start) / (1000 * 60 * 60);
        if (durationHours > 0) {
          totalDurationHours += durationHours;
          countWithDuration++;
        }
      }
    });
    
    const mttr = countWithDuration > 0 ? (totalDurationHours / countWithDuration).toFixed(1) : null;
    
    const totalRunningHours = filteredEngins.reduce((sum, e) => sum + (e.heuresMarche || 0), 0);
    const failureCount = filteredPannes.length;
    const mtbf = failureCount > 0 ? (totalRunningHours / failureCount).toFixed(0) : null;
    
    return { mtbf, mttr, totalClosed: closedWOs.length };
  }, [filteredOrders, filteredEngins, filteredPannes]);

  // Remplissage des ateliers réel
  const workshopCapacityList = React.useMemo(() => {
    return SITES_LIST.map(code => {
      const siteEngs = (enginsLive || []).filter(e => e.siteId === code);
      const siteBTs = (workOrdersLive || []).filter(bt => bt.siteId === code);
      const activeBTsCount = siteBTs.filter(b => b.status === 'EN_COURS' || b.status === 'PIÈCES_ATTRIBUÉES').length;
      
      if (siteEngs.length === 0) {
        return {
          siteCode: code,
          activeInterventions: activeBTsCount,
          capacityRatio: null,
          status: "Pas de données"
        };
      }
      
      const machineTotal = siteEngs.length;
      const workshopRating = Math.min(100, Math.round((activeBTsCount / Math.max(1, Math.round(machineTotal * 0.5))) * 100));
      
      return {
        siteCode: code,
        activeInterventions: activeBTsCount,
        capacityRatio: workshopRating,
        status: workshopRating > 80 ? 'Saturé' : workshopRating > 40 ? 'Modéré' : 'Optimisé'
      };
    });
  }, [workOrdersLive, enginsLive]);

  // Framer motion variants
  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`flex-1 bg-white text-slate-900 min-h-screen select-none font-sans ${isCompact ? "space-y-3 p-2.5 sm:p-4 pt-3 text-xs" : "space-y-6 p-4 md:p-8 pt-6"}`}
    >
      {/* 1. Page Banner */}
      <PageBanner
        icon={LayoutDashboard}
        badgeLabel="Hydromines GMAO"
        title="Tableau de Bord"
        subtitle="Surveillance en temps réel de la flotte et des opérations de maintenance"
        siteLabel={activeSite === 'TOUS' ? 'TOUS LES SITES' : activeSite}
      >
        <Button
          onClick={() => setIsSignalerPanneOpen(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-wider text-xs h-9 cursor-pointer shadow-sm"
        >
          <AlertTriangle className="h-4 w-4 mr-1.5 animate-pulse" /> Signaler une panne
        </Button>
      </PageBanner>

      {/* 2. SANTÉ FLOTTE — Carte signature 5 capsules */}
      <motion.div 
        variants={itemVariants}
        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider font-sans flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              SANTÉ FLOTTE — 5 CHANTIERS SOU-GMAO
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium uppercase tracking-wide">
              Discipline préventive et niveau de vigilance opérationnelle par site d'exploitation
            </p>
          </div>
          <Badge variant="outline" className="text-[9px] font-mono border-slate-200 text-slate-600 bg-slate-50 uppercase">
            Vue : {activeSite === 'TOUS' ? 'TOUS LES SITES' : activeSite}
          </Badge>
        </div>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-5">
          {complianceParSite.map((site) => (
            <FleetHealthCapsule 
              key={site.code} 
              site={site} 
              isCompact={isCompact} 
              isActiveSite={activeSite === 'TOUS' || activeSite === site.code}
              hasSelection={activeSite !== 'TOUS'}
            />
          ))}
        </div>
      </motion.div>

      {/* 3. 4 KPI Cards existantes - Real Calculated Metrics */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      >
        {/* Availability Meter */}
        <motion.div variants={itemVariants} className={`bg-white border border-slate-200 rounded-2xl flex flex-col justify-between shadow-sm ${isCompact ? "p-3" : "p-5"}`}>
          <div className="flex items-center justify-between gap-2">
            <span className={`font-sans font-bold text-slate-500 uppercase tracking-wider ${isCompact ? "text-[9px]" : "text-[11px]"}`}>Disponibilité Flotte</span>
            <Badge className="bg-slate-50 border border-slate-200 text-slate-700 text-[8.5px] font-mono">OBJECTIF: 85%</Badge>
          </div>
          
          <div className={`flex items-baseline gap-2 ${isCompact ? "my-1" : "my-3"}`}>
            <span className={`font-black font-mono tracking-tighter text-slate-950 ${isCompact ? "text-2xl" : "text-3xl"}`}>{avgDispo}%</span>
            <span className={`text-[9px] font-mono font-black border px-1 rounded ${avgDispo >= 85 ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-amber-600 bg-amber-50 border-amber-100'}`}>
              {avgDispo >= 85 ? 'CONFORME' : 'SOUS SEUIL'}
            </span>
          </div>

          <div className="space-y-1.5">
            <Progress value={avgDispo} className="h-1 bg-slate-100" />
            <div className="flex justify-between text-[8.5px] font-mono text-slate-500">
              <span>Seuil critique 70%</span>
              <span className="font-extrabold">{filteredEngins.length} Engins Actifs</span>
            </div>
          </div>
        </motion.div>

        {/* Operational Cost Estimation */}
        <motion.div variants={itemVariants} className={`bg-white border border-slate-200 rounded-2xl flex flex-col justify-between shadow-sm ${isCompact ? "p-3" : "p-5"}`}>
          <div className="flex items-center justify-between gap-2">
            <span className={`font-sans font-bold text-slate-500 uppercase tracking-wider ${isCompact ? "text-[9px]" : "text-[11px]"}`}>Coût Indisponibilité (24H)</span>
            <Badge className="bg-amber-50 text-amber-700 border border-amber-100 text-[8.5px] font-mono">ESTIMATION</Badge>
          </div>
          
          <div className={`flex items-baseline gap-1 ${isCompact ? "my-1" : "my-3"}`}>
            <span className={`font-black font-mono tracking-tight text-slate-950 ${isCompact ? "text-xl sm:text-2xl" : "text-3xl"}`}>
              {coutIndispo24H.toLocaleString('fr-FR')}
            </span>
            <span className="text-[10px] text-slate-500 font-mono font-bold">FCFA</span>
          </div>

          <div className="p-1.5 bg-slate-50 border border-slate-100 rounded text-[9px] font-mono text-slate-600 flex items-center justify-between">
            <span className="text-red-600 font-bold">🔴 {filteredEngins.filter(e => getNormalizedStatus(e) === 'EN_PANNE').length} Arrêts</span>
            <span className="text-amber-600 font-bold">🟠 {filteredEngins.filter(e => getNormalizedStatus(e) === 'EN_MAINTENANCE').length} Maint.</span>
          </div>
        </motion.div>

        {/* Sync Status */}
        <motion.div variants={itemVariants} className={`bg-white border border-slate-200 rounded-2xl flex flex-col justify-between shadow-sm ${isCompact ? "p-3" : "p-5"}`}>
          <div className="flex items-center justify-between gap-2">
            <span className={`font-sans font-bold text-slate-500 uppercase tracking-wider ${isCompact ? "text-[9px]" : "text-[11px]"}`}>Tampon SQLite / Synchro</span>
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[8.5px] font-mono">FIABLE</Badge>
          </div>
          
          <div className={`flex items-baseline gap-1.5 ${isCompact ? "my-1" : "my-3"}`}>
            <span className={`font-black font-mono tracking-tighter text-slate-950 ${isCompact ? "text-2xl" : "text-3xl"}`}>
              {localPendingCount}
            </span>
            <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">Transactions</span>
          </div>

          <div className="text-[8.5px] text-slate-500 font-mono flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="font-bold">Mode offline - Double-sauvegarde active</span>
          </div>
        </motion.div>

        {/* Debt / Backlog OT */}
        <motion.div variants={itemVariants} className={`bg-white border border-slate-200 rounded-2xl flex flex-col justify-between shadow-sm ${isCompact ? "p-3" : "p-5"}`}>
          <div className="flex items-center justify-between gap-2">
            <span className={`font-sans font-bold text-slate-500 uppercase tracking-wider ${isCompact ? "text-[9px]" : "text-[11px]"}`}>Dette OT Critique</span>
            <Badge className="bg-red-50 text-red-700 border border-red-100 text-[8.5px] font-mono">BACKLOG</Badge>
          </div>
          
          <div className={`flex items-baseline gap-1.5 ${isCompact ? "my-1" : "my-3"}`}>
            <span className={`font-black font-mono tracking-tighter text-slate-950 ${isCompact ? "text-2xl" : "text-3xl"}`}>{backlogCritical}</span>
            <span className="text-[9px] font-mono font-black text-red-600 uppercase">OTs actifs</span>
          </div>

          <div className="text-[8.5px] text-slate-550 font-mono flex items-center justify-between">
            <span>Surcharge Atelier : {workshopLoad}%</span>
            <span className={`px-1 rounded font-black text-[8px] uppercase ${workshopLoad > 80 ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}>
              {workshopLoad > 80 ? "SATURÉ" : "OPTI"}
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* 4. Bandeau "Engins à Risque PM" — liste horizontale scrollable */}
      <motion.div variants={itemVariants} className="space-y-2">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <h3 className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest font-sans">
            ENGINS EN DÉPASSEMENT DE MAINTENANCE PRÉVENTIVE CRITIQUE
          </h3>
        </div>
        
        {enginsARisque.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 text-center text-xs text-slate-500 font-sans">
            ✓ Aucun engin en dépassement PM critique sur {activeSite === 'TOUS' ? 'l\'ensemble des sites' : activeSite}.
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
            {enginsARisque.map((engin) => (
              <motion.div
                key={engin.enginId}
                whileHover={{ y: -2 }}
                className="min-w-[210px] bg-white border border-slate-200 border-l-4 border-l-red-600 rounded-2xl p-3 shadow-sm flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <span className="font-mono font-black text-slate-900 text-xs tracking-wider">{engin.code}</span>
                  <Badge variant="outline" className="text-[8px] font-sans px-1.5 py-0 rounded border-slate-200 text-slate-600 bg-slate-50">
                    {engin.siteId}
                  </Badge>
                </div>
                <div className="my-2">
                  <p className="text-[9px] text-slate-400 font-bold uppercase truncate">{engin.operation}</p>
                  <p className="text-xl font-mono font-black text-red-600 tracking-tight leading-none mt-1">
                    +{engin.depassementHeures} h
                  </p>
                </div>
                <div className="text-[8.5px] font-mono text-slate-500 border-t border-slate-100 pt-1.5 flex justify-between">
                  <span>Relevé actuel :</span>
                  <span className="font-bold text-slate-700">{engin.heuresActuelles} H</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* 5. Ticker temps réel */}
      <motion.div variants={itemVariants} className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl p-3 overflow-hidden relative shadow-inner">
        <div className="flex items-center gap-2.5 whitespace-nowrap overflow-x-auto no-scrollbar">
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-rose-600 font-mono bg-rose-50 border border-rose-200 px-2 py-0.5 rounded shrink-0">
            <Radio className="h-3 w-3 text-rose-600 animate-pulse" /> SOU-CRAWLER LIVE FEED :
          </span>
          
          <div className="flex items-center gap-6 text-[11px] font-mono text-slate-700 py-0.5">
            {filteredEngins.filter(e => getNormalizedStatus(e) === 'EN_PANNE').length === 0 ? (
              <span className="text-emerald-600 font-bold shrink-0 text-xs">
                ✓ Aucune panne active signalée.
              </span>
            ) : (
              filteredEngins.filter(e => getNormalizedStatus(e) === 'EN_PANNE').map(e => (
                <span key={e.id} className="flex items-center gap-1 bg-red-50 border border-red-100 rounded px-2 py-0.5 text-xs text-red-650 font-extrabold shrink-0">
                  ⚠️ EN_PANNE: {e.code || e.id} ({e.siteId || 'MI'}) - Diagnostic requis
                </span>
              ))
            )}
            
            {filteredPieces.filter(p => Number(p.stock) <= Number(p.critique || 2)).slice(0, 3).map(p => (
              <span key={p.id} className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 text-xs text-amber-700 font-bold shrink-0">
                📦 STOCK BAS: {p.nom} ({p.stock || 0} p)
              </span>
            ))}
            
            <span className="text-slate-300 shrink-0 select-none">•</span>
            <span className="text-emerald-600 font-bold shrink-0 text-xs flex items-center gap-1">
              ✓ Synchro : {localPendingCount} transaction(s) en attente.
            </span>
          </div>
        </div>
      </motion.div>

      {activeSite === "TOUS" ? (
        // ==========================================
        // SECTION GLOBAL CORPORATE (ALL SITES VIEW)
        // ==========================================
        <>
          {/* A. Dynamic Core Analytical Grid */}
          <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
            {/* Horizontal PM Compliance Bar Chart */}
            <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm xl:col-span-2 overflow-hidden space-y-4">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-mono font-black uppercase text-slate-800 tracking-wide">COMPLIANCE PM PAR CHANTIER</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-none">Comparatif réel de la discipline de maintenance préventive</p>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8.5px] font-mono">RÉEL FIRESTORE</Badge>
              </div>

              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={complianceParSite}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis dataKey="code" type="category" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as ComplianceSite;
                          return (
                            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white font-sans text-xs shadow-lg space-y-1">
                              <p className="font-extrabold uppercase text-amber-400">{data.code}</p>
                              <p>Taux de Compliance : <span className="font-mono font-black text-[#ffd700]">{data.complianceScore}%</span></p>
                              <p className="text-slate-400">PM réalisés à temps : <span className="font-mono font-bold text-emerald-400">{data.faitesATemps}</span> / <span className="font-mono font-bold">{data.totalPM}</span></p>
                              <p className="text-slate-400">PM en retard critique : <span className="font-mono font-bold text-red-400">{data.enRetardCritique}</span></p>
                              <p className="text-slate-400">Dette OT Critique : <span className="font-mono font-bold">{data.backlogCritique}</span></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="complianceScore" radius={[0, 4, 4, 0]} barSize={16}>
                      {complianceParSite.map((entry, index) => {
                        const barColor = entry.risk === 'CRITIQUE' ? '#DC2626' : entry.risk === 'VIGILANCE' ? '#D97706' : '#059669';
                        return <Cell key={`cell-${index}`} fill={barColor} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Real-time calculated reliability dashboard metrics */}
            <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-xs font-mono font-black uppercase text-slate-800">MÉTRIQUES DE FIABILITÉ RÉELLES</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-none">Diagnostic global temps-réel issu des opérations closes</p>
              </div>
              
              <div className="my-4 space-y-4 font-mono text-[11px]">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-slate-700 font-bold">
                    <span>MTBF FIRESTORE</span>
                    <span className={fiabiliteMetrics.mtbf ? "text-emerald-600" : "text-slate-450"}>
                      {fiabiliteMetrics.mtbf ? `${fiabiliteMetrics.mtbf} h` : "DONNÉES INSUFFISANTES"}
                    </span>
                  </div>
                  <Progress value={fiabiliteMetrics.mtbf ? Math.min(100, (Number(fiabiliteMetrics.mtbf) / 150) * 100) : 0} className="h-1 bg-slate-100 animate-pulse" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-slate-700 font-bold">
                    <span>MTTR ESTIMÉ</span>
                    <span className={fiabiliteMetrics.mttr ? "text-amber-600" : "text-slate-450"}>
                      {fiabiliteMetrics.mttr ? `${fiabiliteMetrics.mttr} h` : "EN COURS D'ACQUISITION"}
                    </span>
                  </div>
                  <Progress value={fiabiliteMetrics.mttr ? Math.min(100, (Number(fiabiliteMetrics.mttr) / 6) * 100) : 0} className="h-1 bg-slate-100" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-slate-700 font-bold">
                    <span>INTÉGRITÉ DU SYSTÈME</span>
                    <span className="text-emerald-600 font-black">100% OPÉRATIONNEL</span>
                  </div>
                  <Progress value={100} className="h-1 bg-slate-100" />
                </div>
              </div>

              <p className="text-[9px] italic text-slate-550 leading-tight">
                *Les terminaux de fond d'exploitation répliquent chronologiquement via notre passerelle sans perte d'état. Les métriques MTBF/MTTR s'actualisent dynamiquement lors de la clôture des bons d'intervention.
              </p>
            </motion.div>
          </div>

          {/* 📋 CONTRÔLE DES PERFORMANCES FLOTTE & ALERTES ACTIVES */}
          <motion.div variants={itemVariants} className="space-y-3">
            <h3 className={`font-black text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1.5 ${isCompact ? "text-[10px]" : "text-xs"}`}>
              <span>📋</span> CONTRÔLE DES PERFORMANCES FLOTTE & ALERTES ACTIVES
            </h3>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              {/* Card 1: MTBF & MTTR */}
              <Card className="bg-white border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between p-4">
                <CardHeader className="p-0 pb-2">
                  <span className="text-[10px] font-mono font-extrabold text-blue-600 uppercase flex items-center gap-1">
                    ⚙️ FIABILITÉ OPÉRATIONNELLE DU PARC
                  </span>
                </CardHeader>
                <CardContent className="p-0 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 p-2 rounded border border-slate-100 text-center">
                      <span className="text-[9px] text-slate-500 font-mono block">MTBF MOYEN</span>
                      <span className="text-base font-black font-mono text-emerald-600">
                        {fiabiliteMetrics.mtbf ? `${fiabiliteMetrics.mtbf} h` : "—"}
                      </span>
                      <span className="text-[8px] text-slate-400 block mt-0.5">Heures de marche</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-100 text-center">
                      <span className="text-[9px] text-slate-500 font-mono block">MTTR MOYEN</span>
                      <span className="text-base font-black font-mono text-amber-600">
                        {fiabiliteMetrics.mttr ? `${fiabiliteMetrics.mttr} h` : "—"}
                      </span>
                      <span className="text-[8px] text-slate-400 block mt-0.5">Temps moyen rés.</span>
                    </div>
                  </div>
                  <div className="text-[8.5px] font-mono leading-tight text-slate-550 bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="font-bold text-slate-700">Source :</span> Calculé sur {fiabiliteMetrics.totalClosed} ordre(s) de travail clos.
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Alerte Engins Directs */}
              <Card className="bg-white border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between p-4">
                <CardHeader className="p-0 pb-2">
                  <span className="text-[10px] font-mono font-extrabold text-red-600 uppercase flex items-center gap-1">
                    ⚠️ ALERTES ENGINS ACTIFS (ARRÊTÉS)
                  </span>
                </CardHeader>
                <CardContent className="p-0">
                  <div className={`space-y-1 overflow-y-auto max-h-[120px]`}>
                    {filteredEngins.filter(e => getNormalizedStatus(e) === 'EN_PANNE' || getNormalizedStatus(e) === 'EN_MAINTENANCE' || getNormalizedStatus(e) === 'DÉGRADÉ').length === 0 ? (
                      <div className="text-[10px] text-emerald-600 font-mono py-2 text-center">
                        ✓ Aucun engin en panne ou déclassé.
                      </div>
                    ) : (
                      filteredEngins.filter(e => getNormalizedStatus(e) === 'EN_PANNE' || getNormalizedStatus(e) === 'EN_MAINTENANCE' || getNormalizedStatus(e) === 'DÉGRADÉ').slice(0, 3).map(e => {
                        const s = getNormalizedStatus(e);
                        const statusColors = {
                          EN_PANNE: "bg-red-50 text-red-600 border-red-100",
                          EN_MAINTENANCE: "bg-amber-50 text-amber-600 border-amber-100",
                          DÉGRADÉ: "bg-amber-50 text-amber-705 border-amber-100"
                        };
                        return (
                          <div key={e.id} className="p-1.5 bg-slate-50 border border-slate-100 rounded flex items-center justify-between gap-1 text-[9px] font-mono">
                            <span className="font-extrabold text-slate-800">{e.code || e.id}</span>
                            <span className="text-slate-400">({e.siteId})</span>
                            <span className={`px-1 rounded border text-[8px] font-black uppercase ${statusColors[s] || 'bg-slate-100 text-slate-500'}`}>
                              {s === 'EN_PANNE' ? '🔴 ARRÊT' : s === 'EN_MAINTENANCE' ? '🟠 MAINT' : '🟡 DEGRADÉ'}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Backlog validation Responsable & Ratio */}
              <Card className="bg-white border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between p-4">
                <CardHeader className="p-0 pb-1">
                  <span className="text-[10px] font-mono font-extrabold text-teal-600 uppercase flex items-center gap-1">
                    📂 VALIDATIONS ET DISCIPLINE DU MOIS
                  </span>
                </CardHeader>
                <CardContent className="p-0 space-y-1.5 font-mono text-[9.5px]">
                  <div className="flex items-center justify-between border-b pb-1 border-slate-100">
                    <span className="text-slate-500">Attente validation (+48h) :</span>
                    <span className={`font-bold ${tachesEnAttenteValidation.length > 0 ? "text-red-600 animate-pulse" : "text-emerald-600"}`}>
                      {tachesEnAttenteValidation.length} tâche{tachesEnAttenteValidation.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-1 border-slate-100">
                    <span className="text-slate-500">Ratio Préventif / Correctif :</span>
                    <span className="text-slate-900 font-bold">
                      {ratioPreventifCorrectif.preventifPct}% / {ratioPreventifCorrectif.correctifPct}%
                    </span>
                  </div>
                  <div className="text-[8px] text-slate-400 leading-tight">
                    Calculé sur {ratioPreventifCorrectif.total} intervention{ratioPreventifCorrectif.total > 1 ? 's' : ''} closes ce mois-ci.
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* CORE SUPERVISION CHARTS (Corporate) */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* DISPONIBILITE ET ANALYTICS TRENDS */}
            <Card className="bg-white border-slate-200 lg:col-span-4 rounded-2xl shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider font-mono">Progression Disponibilité & Discipline Préventive</CardTitle>
                <CardDescription className="text-slate-500 text-xs">Calcul exact sur les 7 derniers jours sur {activeSite}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 pl-2">
                <div className="h-[285px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tendance7Jours}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                      <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                      <RechartsTooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155" }} labelStyle={{ color: "#fff" }} />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                      <Line 
                        type="monotone" 
                        dataKey="taux" 
                        stroke="#D4A017" 
                        strokeWidth={3} 
                        name="Réalisation (%)" 
                        dot={{ r: 4 }} 
                        connectNulls={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="prev" 
                        stroke="#10b981" 
                        strokeWidth={2} 
                        name="Compliance PM (%)" 
                        strokeDasharray="5 5" 
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* FLEET REPARTITION PIE GRAPH */}
            <Card className="bg-white border-slate-200 lg:col-span-3 rounded-2xl shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider font-mono">Répartition Statuts Parc ({filteredEngins.length} Engins)</CardTitle>
                <CardDescription className="text-slate-500 text-xs">Diagnostic de l'état mécanique global</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-[180px] w-full flex justify-center items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Disponible", value: filteredEngins.filter(e => getNormalizedStatus(e) === 'DISPONIBLE').length || 0, color: "#10b981" },
                          { name: "Maintenance", value: filteredEngins.filter(e => getNormalizedStatus(e) === 'EN_MAINTENANCE').length || 0, color: "#f59e0b" },
                          { name: "En Panne", value: filteredEngins.filter(e => getNormalizedStatus(e) === 'EN_PANNE').length || 0, color: "#ef4444" },
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
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[9.5px] text-emerald-600 font-bold uppercase tracking-wider font-mono">Dispo</p>
                    <p className="text-base font-black text-slate-900 font-mono mt-0.5">{filteredEngins.filter(e => getNormalizedStatus(e) === 'DISPONIBLE').length}</p>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[9.5px] text-amber-600 font-bold uppercase tracking-wider font-mono">Maint</p>
                    <p className="text-base font-black text-slate-900 font-mono mt-0.5">{filteredEngins.filter(e => getNormalizedStatus(e) === 'EN_MAINTENANCE').length}</p>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-red-500">
                    <p className="text-[9.5px] text-red-600 font-bold uppercase tracking-wider font-mono">Panne</p>
                    <p className="text-base font-black text-slate-900 font-mono mt-0.5">{filteredEngins.filter(e => getNormalizedStatus(e) === 'EN_PANNE').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* NEW GRAPH: MULTI-SITE FLEET STATUS COMPARE (GOD LEVEL Stacked Bar) */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider font-mono">RÉPARTITION CAPACITÉ FLOTTE PAR SITE</CardTitle>
                  <CardDescription className="text-slate-500 text-xs">Comparaison directe du statut opérationnel des machines par exploitation</CardDescription>
                </div>
                <Badge className="bg-blue-50 text-blue-700 border border-blue-100 text-[8.5px] font-mono uppercase">PAR CHANTIER</Badge>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={SITES_LIST.map(siteCode => {
                        const siteEngins = (enginsLive || []).filter(e => e.siteId === siteCode);
                        return {
                          site: siteCode,
                          Disponible: siteEngins.filter(e => getNormalizedStatus(e) === 'DISPONIBLE').length,
                          Maintenance: siteEngins.filter(e => getNormalizedStatus(e) === 'EN_MAINTENANCE').length,
                          En_Panne: siteEngins.filter(e => getNormalizedStatus(e) === 'EN_PANNE').length,
                        };
                      })}
                      margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                      <XAxis dataKey="site" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                      <RechartsTooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155" }} labelStyle={{ color: "#fff" }} />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                      <Bar dataKey="Disponible" stackId="a" fill="#10b981" maxBarSize={30} />
                      <Bar dataKey="Maintenance" stackId="a" fill="#f59e0b" maxBarSize={30} />
                      <Bar dataKey="En_Panne" stackId="a" fill="#ef4444" maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* HEATMAP & ATELIER CAPACITY */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* DISPONIBILITE TACTICAL HEATMAP GRID */}
            <Card className="bg-white border-slate-200 rounded-2xl relative overflow-hidden shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider font-mono">Heatmap de Disponibilité d'Engins</CardTitle>
                    <CardDescription className="text-slate-500 text-xs">Cliquez sur un engin pour tester le cadenassage</CardDescription>
                  </div>
                  <Badge className="bg-cyan-50 text-cyan-700 text-[8.5px] font-mono border border-cyan-100 uppercase">TACTIQUE</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {filteredEngins.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs uppercase font-mono">Aucun engin disponible sur {activeSite}</div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                    {filteredEngins.map(e => {
                      const val = Number(e.dispo !== undefined ? e.dispo : (getNormalizedStatus(e) === 'DISPONIBLE' ? 100 : 0));
                      let cellBg = "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-[0_0_8px_rgba(16,185,129,0.02)]";
                      const s = getNormalizedStatus(e);
                      if (s === 'EN_PANNE') cellBg = "bg-red-50 border-red-200 text-red-650 shadow-[0_0_8px_rgba(239,68,68,0.02)]";
                      if (s === 'EN_MAINTENANCE') cellBg = "bg-amber-50 border-amber-200 text-amber-700 shadow-[0_0_8px_rgba(245,158,11,0.02)]";
                      
                      return (
                        <div 
                          key={e.id}
                          className={`h-14 p-2.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-105 active:scale-95 select-none ${cellBg}`}
                          onClick={() => {
                            const message = `Engin [${e.code || e.id}] - Site ${e.siteId || 'SMI'} : Actuellement ${s} à ${val}% de disponibilité estimée par l'atelier.`;
                            toast.info(message, { duration: 5000 });
                          }}
                        >
                          <span className="text-[10.5px] font-black font-mono tracking-wider truncate leading-tight">{e.code || e.id}</span>
                          <span className="text-[9.5px] font-black text-slate-500 uppercase leading-none">{val}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="flex gap-4 mt-4 text-[9.5px] font-black uppercase text-slate-500 font-mono flex-wrap">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-emerald-500"></span> ACTIF (85%-100%)</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-amber-500"></span> CORRECTION (60%-84%)</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-red-500"></span> EN ARRET (0%-59%)</span>
                </div>
              </CardContent>
            </Card>

            {/* WORKSHOP LOADS ACROSS ALL SECTORS */}
            <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider font-mono">Remplissage des Ateliers par Mine</CardTitle>
                <CardDescription className="text-slate-500 text-xs">Évaluation en temps réel d'encombrement des équipes du fond</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3.5">
                {workshopCapacityList.map(s => {
                  const hasData = s.capacityRatio !== null;
                  let barColor = "bg-[#4FC3F7]";
                  if (hasData && s.capacityRatio! >= 80) barColor = "bg-red-500";
                  else if (hasData && s.capacityRatio! >= 50) barColor = "bg-amber-500";
                  
                  return (
                    <div key={s.siteCode} className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-mono font-black uppercase text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${hasData && s.capacityRatio! >= 80 ? 'bg-red-500 animate-ping' : hasData && s.capacityRatio! >= 50 ? 'bg-amber-500' : 'bg-emerald-400'}`}></span>
                          {s.siteCode === 'SMI' ? 'SMI CHANTIERS' : s.siteCode}
                        </span>
                        <span className="text-slate-500">
                          {hasData ? `${s.activeInterventions} Interventions • ${s.capacityRatio}%` : "Pas de données"}
                        </span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/45">
                        {hasData ? (
                          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${s.capacityRatio}%` }}></div>
                        ) : (
                          <div className="h-full rounded-full bg-slate-200/40 border-dashed border-2 border-slate-350"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        // ==========================================
        // SECTION SITES SPÉCIFIQUES (SINGLE SITE VIEW)
        // ==========================================
        <>
          {/* COMPARATIF INTER-ENGINS (GOD LEVEL COMBO CHART) */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider font-mono">COMPARATIF ANALYTIQUE INTER-ENGINS</CardTitle>
                  <CardDescription className="text-slate-500 text-xs">Heures de marche (Barres, axe gauche) vs Taux de Disponibilité estimé (Ligne, axe droit)</CardDescription>
                </div>
                <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[8.5px] font-mono uppercase">VUE TACTIQUE</Badge>
              </CardHeader>
              <CardContent className="pt-6">
                {filteredEngins.length === 0 ? (
                  <div className="h-[250px] flex items-center justify-center text-slate-400 font-mono text-xs uppercase">
                    Aucune donnée d'engin sur ce chantier
                  </div>
                ) : (
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={filteredEngins.map(e => ({
                          name: e.code || e.id,
                          "Heures de Marche": e.heuresMarche || 0,
                          "Disponibilité %": e.dispo !== undefined ? e.dispo : (getNormalizedStatus(e) === 'DISPONIBLE' ? 100 : getNormalizedStatus(e) === 'EN_MAINTENANCE' ? 50 : 0)
                        }))}
                        margin={{ top: 10, right: -5, left: -10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" stroke="#6366f1" fontSize={11} tickLine={false} axisLine={false} label={{ value: 'Heures de Marche', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '10px', fill: '#6366f1', fontWeight: 'bold' } }} />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#10b981" fontSize={11} tickLine={false} axisLine={false} label={{ value: 'Disponibilité %', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fontSize: '10px', fill: '#10b981', fontWeight: 'bold' } }} />
                        <RechartsTooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155" }} labelStyle={{ color: "#fff" }} />
                        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                        <Bar yAxisId="left" dataKey="Heures de Marche" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={35} />
                        <Line yAxisId="right" type="monotone" dataKey="Disponibilité %" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* TWO COLUMN GRID FOR DETAILED TACTICAL MONITORING */}
          <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
            
            {/* HEATMAP OF DISPONIBILITÉ (Single Site) */}
            <motion.div variants={itemVariants} className="xl:col-span-1">
              <Card className="bg-white border-slate-200 rounded-2xl relative overflow-hidden h-full shadow-sm">
                <CardHeader className="border-b border-slate-100 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider font-mono">Heatmap de Disponibilité</CardTitle>
                      <CardDescription className="text-slate-500 text-xs">Parc machine de l'exploitation</CardDescription>
                    </div>
                    <Badge className="bg-cyan-50 text-cyan-700 text-[8.5px] font-mono border border-cyan-100 uppercase">ÉTAT MACHINE</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 flex flex-col justify-between h-[calc(100%-65px)]">
                  {filteredEngins.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs uppercase font-mono">Aucun engin sur {activeSite}</div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2.5 overflow-y-auto max-h-[220px] pr-1">
                      {filteredEngins.map(e => {
                        const val = Number(e.dispo !== undefined ? e.dispo : (getNormalizedStatus(e) === 'DISPONIBLE' ? 100 : 0));
                        let cellBg = "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-[0_0_8px_rgba(16,185,129,0.02)]";
                        const s = getNormalizedStatus(e);
                        if (s === 'EN_PANNE') cellBg = "bg-red-50 border-red-200 text-red-650 shadow-[0_0_8px_rgba(239,68,68,0.02)]";
                        if (s === 'EN_MAINTENANCE') cellBg = "bg-amber-50 border-amber-200 text-amber-700 shadow-[0_0_8px_rgba(245,158,11,0.02)]";
                        
                        return (
                          <div 
                            key={e.id}
                            className={`h-14 p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-105 active:scale-95 select-none ${cellBg}`}
                            onClick={() => {
                              const message = `Engin [${e.code || e.id}] - Site ${e.siteId || 'SMI'} : Actuellement ${s} à ${val}% de disponibilité estimée par l'atelier.`;
                              toast.info(message, { duration: 5000 });
                            }}
                          >
                            <span className="text-[10px] font-black font-mono tracking-wider truncate leading-tight">{e.code || e.id}</span>
                            <span className="text-[9px] font-black text-slate-500 uppercase leading-none">{val}%</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex gap-2.5 mt-4 text-[8.5px] font-black uppercase text-slate-500 font-mono flex-wrap border-t pt-3">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-emerald-500"></span> DISPO</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-amber-500"></span> MAINT</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-red-500"></span> PANNE</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* DETAILED ROSTER ENGINE PROGRESS (GOD LEVEL UI LIST) */}
            <motion.div variants={itemVariants} className="xl:col-span-2">
              <Card className="bg-white border-slate-200 rounded-2xl shadow-sm h-full overflow-hidden">
                <CardHeader className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <div>
                    <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider font-mono">ÉTAT MÉCANIQUE DÉTAILLÉ DE LA FLOTTE</CardTitle>
                    <CardDescription className="text-slate-500 text-xs">Suivi individuel et indicateurs de performance</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[8px] font-mono border-slate-200 text-slate-500 uppercase">
                    {filteredEngins.length} Machines
                  </Badge>
                </CardHeader>
                <CardContent className="pt-4 p-0">
                  <div className="divide-y divide-slate-100 max-h-[290px] overflow-y-auto">
                    {filteredEngins.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-xs uppercase font-mono">Aucun engin enregistré</div>
                    ) : (
                      filteredEngins.map(e => {
                        const s = getNormalizedStatus(e);
                        const dispoPct = e.dispo !== undefined ? e.dispo : (s === 'DISPONIBLE' ? 100 : s === 'EN_MAINTENANCE' ? 50 : 0);
                        return (
                          <div key={e.id} className="p-3.5 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl border ${
                                s === 'DISPONIBLE' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                s === 'EN_MAINTENANCE' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                'bg-red-50 border-red-100 text-red-600'
                              }`}>
                                <Truck className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-black text-slate-900 text-xs tracking-wider">{e.code || e.id}</span>
                                  <span className="text-[9.5px] font-bold text-slate-500 uppercase">{e.marque || e.brand || ''} {e.modele || e.type}</span>
                                </div>
                                <div className="text-[9.5px] text-slate-500 font-mono mt-0.5">
                                  Cumul : <span className="font-bold text-slate-700">{e.heuresMarche || 0} H</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 justify-between sm:justify-end">
                              <div className="text-right hidden sm:block">
                                <span className="text-[9px] text-slate-400 font-bold block uppercase font-mono">Disponibilité</span>
                                <span className={`text-xs font-black font-mono ${dispoPct >= 85 ? 'text-emerald-600' : dispoPct >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{dispoPct}%</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${
                                s === 'DISPONIBLE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                s === 'EN_MAINTENANCE' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-red-50 text-red-700 border-red-200'
                              }`}>
                                {s === 'DISPONIBLE' ? 'Opérationnel' : s === 'EN_MAINTENANCE' ? 'Maintenance' : 'Hors Service'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* CHRONIQUE ET REPARTITION (Single Site) */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* DISPONIBILITE ET ANALYTICS TRENDS */}
            <Card className="bg-white border-slate-200 lg:col-span-4 rounded-2xl shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider font-mono">Progression Disponibilité & Discipline Préventive</CardTitle>
                <CardDescription className="text-slate-500 text-xs">Calcul exact sur les 7 derniers jours sur {activeSite}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 pl-2">
                <div className="h-[285px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tendance7Jours}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                      <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                      <RechartsTooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155" }} labelStyle={{ color: "#fff" }} />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                      <Line 
                        type="monotone" 
                        dataKey="taux" 
                        stroke="#D4A017" 
                        strokeWidth={3} 
                        name="Réalisation (%)" 
                        dot={{ r: 4 }} 
                        connectNulls={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="prev" 
                        stroke="#10b981" 
                        strokeWidth={2} 
                        name="Compliance PM (%)" 
                        strokeDasharray="5 5" 
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* ATELIER CAPACITY & MTTR */}
            <Card className="bg-white border-slate-200 lg:col-span-3 rounded-2xl shadow-sm flex flex-col justify-between">
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider font-mono">Vigilance & Métriques Fiabilité Site</CardTitle>
                <CardDescription className="text-slate-500 text-xs">Analyse locale d'arrêt et réactivité mécanique</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-500 font-mono block uppercase">MTBF LOCAL</span>
                    <span className="text-lg font-black font-mono text-emerald-600 block mt-1">
                      {fiabiliteMetrics.mtbf ? `${fiabiliteMetrics.mtbf} h` : "—"}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Moyenne de marche</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-500 font-mono block uppercase">MTTR LOCAL</span>
                    <span className="text-lg font-black font-mono text-amber-600 block mt-1">
                      {fiabiliteMetrics.mttr ? `${fiabiliteMetrics.mttr} h` : "—"}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Résolution panne</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-2.5">
                  <span className="text-[10px] font-mono font-extrabold text-indigo-600 block uppercase">
                    🛠️ CHARGE DE L'ÉQUIPE ATELIER
                  </span>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-600">
                      <span>Remplissage capacité :</span>
                      <span className="font-bold text-slate-800">{workshopLoad}%</span>
                    </div>
                    <Progress value={workshopLoad} className="h-1.5 bg-slate-100" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <SignalerPanne 
        isOpen={isSignalerPanneOpen} 
        onClose={() => setIsSignalerPanneOpen(false)}
      />
    </motion.div>
  );
}
