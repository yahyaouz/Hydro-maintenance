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
// @ts-ignore
import bannerImg from "@/assets/images/banner-mecanique.webp";
// @ts-ignore
import goldTexture from "@/assets/images/texture-or.webp";

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
  const { data: workOrdersLive } = useCollection<any>('maintenanceTasks');
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
    return workOrdersLive.filter(b => (activeSite === "TOUS" || b.siteId === activeSite || b.site === activeSite) && b.deleted !== true);
  }, [workOrdersLive, activeSite]);

  const filteredPannes = React.useMemo(() => {
    if (!pannesLive) return [];
    return pannesLive.filter(p => activeSite === "TOUS" || p.siteId === activeSite || p.site === activeSite);
  }, [pannesLive, activeSite]);

  // Executive KPIs Calculation
  const mttr = React.useMemo(() => {
    const closedWOs = filteredOrders.filter(wo => wo.statut === 'FAIT' || wo.statut === 'VALIDE');
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
    return filteredOrders.filter(wo => wo.statut === 'NON_FAIT' || wo.statut === 'EN_COURS').length;
  }, [filteredOrders]);

  const costPerHour = React.useMemo(() => {
    if (filteredOrders.length === 0) return null;
    return 245;
  }, [filteredOrders]);

  // Backlog Donut Data
  const backlogDonutData = React.useMemo(() => {
    const openWOs = filteredOrders.filter(wo => wo.statut === 'NON_FAIT' || wo.statut === 'EN_COURS');
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
      return sev === 'eleve' || sev === 'élevé' || sev === 'medium' || sev === 'moyen' || sev === 'normale';
    }).length;

    const countMoyen = openWOs.filter(wo => {
      const sev = (wo.severity || wo.priorite || '').toLowerCase();
      return sev === 'normal' || sev === 'bas' || sev === 'low' || sev === 'basse';
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
      if (wo.statut !== 'NON_FAIT' && wo.statut !== 'EN_COURS') return false;
      const sev = (wo.severity || wo.priorite || '').toLowerCase();
      if (selectedSeverity === "Critique") {
        return sev.includes('critique') || sev.includes('critical') || sev.includes('haute') || sev.includes('high');
      }
      if (selectedSeverity === "Élevé") {
        return sev === 'eleve' || sev === 'élevé' || sev === 'medium' || sev === 'moyen' || sev === 'normale';
      }
      if (selectedSeverity === "Moyen") {
        return sev === 'normal' || sev === 'bas' || sev === 'low' || sev === 'basse';
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

  const classementSites = React.useMemo(() => {
    const currentMonthStr = new Date().toISOString().substring(0, 7);

    const list = SITES_LIST.map(site => {
      // 1. dispoSite
      const siteEngins = enginsLive ? enginsLive.filter(e => e.siteId === site || e.site === site) : [];
      const dispoEnginsCount = siteEngins.filter(e => getNormalizedStatus(e) === "DISPONIBLE").length;
      const dispoSite = siteEngins.length > 0 ? (dispoEnginsCount / siteEngins.length) * 100 : null;

      // 2. pannesOuvertesSite
      const sitePannes = pannesLive ? pannesLive.filter(p => p.siteId === site || p.site === site) : [];
      const pannesOuvertesSite = sitePannes.filter(p => p.statut !== "CLOS" && !p.deleted).length;
      const notePannes = Math.max(0, 100 - (pannesOuvertesSite * (100 / 8)));

      // 3. complianceSite
      const siteWOs = workOrdersLive ? workOrdersLive.filter(b => (b.siteId === site || b.site === site) && b.deleted !== true) : [];
      const preventifMoisTasks = siteWOs.filter(t => t.type === 'PREVENTIF' && t.datePlanifiee && t.datePlanifiee.startsWith(currentMonthStr));
      const complianceSite = preventifMoisTasks.length > 0
        ? (preventifMoisTasks.filter(t => t.statut === 'FAIT' || t.statut === 'VALIDE').length / preventifMoisTasks.length) * 100
        : null;

      // 4. chargeMoyenneSite
      const activeTasksSite = siteWOs.filter(t => t.statut === 'NON_FAIT' || t.statut === 'EN_COURS').length;
      const siteMecas = mecaniciens
        ? mecaniciens.filter(m => m.siteId === site && m.active !== false)
        : [];
      const chargeMoyenneSite = siteMecas.length > 0 ? activeTasksSite / siteMecas.length : null;
      const noteCharge = chargeMoyenneSite !== null ? Math.max(0, 100 - (chargeMoyenneSite * (100 / 10))) : null;

      // Weighted global score (0 to 100)
      let totalScore = 0;
      let sumOfWeights = 0;

      if (dispoSite !== null) {
        totalScore += dispoSite * 40;
        sumOfWeights += 40;
      }
      if (complianceSite !== null) {
        totalScore += complianceSite * 30;
        sumOfWeights += 30;
      }
      if (notePannes !== null) {
        totalScore += notePannes * 20;
        sumOfWeights += 20;
      }
      if (noteCharge !== null) {
        totalScore += noteCharge * 10;
        sumOfWeights += 10;
      }

      const scoreGlobal = sumOfWeights > 0 ? totalScore / sumOfWeights : null;

      return {
        site,
        dispoSite,
        pannesOuvertesSite,
        complianceSite,
        chargeMoyenneSite,
        scoreGlobal
      };
    });

    // Sort list by scoreGlobal lowest to highest
    return list.sort((a, b) => {
      const scoreA = a.scoreGlobal !== null ? a.scoreGlobal : 999;
      const scoreB = b.scoreGlobal !== null ? b.scoreGlobal : 999;
      return scoreA - scoreB;
    });
  }, [enginsLive, workOrdersLive, pannesLive, mecaniciens, getNormalizedStatus]);

  // Dataset 1: Monthly events (Pannes / Préventif / Correctif)
  const simulatedAnnualData = React.useMemo(() => [
    { name: "Jan", pannes: 4, preventif: 12, correctif: 8 },
    { name: "Fév", pannes: 3, preventif: 16, correctif: 6 },
    { name: "Mar", pannes: 7, preventif: 11, correctif: 10 },
    { name: "Avr", pannes: 2, preventif: 19, correctif: 5 },
    { name: "Mai", pannes: 5, preventif: 15, correctif: 9 },
    { name: "Juin", pannes: 3, preventif: 18, correctif: 7 },
    { name: "Juil", pannes: 4, preventif: 21, correctif: 8 },
    { name: "Août", pannes: 6, preventif: 14, correctif: 12 },
    { name: "Sept", pannes: 2, preventif: 17, correctif: 5 },
    { name: "Oct", pannes: 5, preventif: 20, correctif: 9 },
    { name: "Nov", pannes: 3, preventif: 22, correctif: 6 },
    { name: "Déc", pannes: 4, preventif: 25, correctif: 8 },
  ], []);

  // Dataset 2: Monthly Fuel & Lubricant consumption
  const simulatedFuelData = React.useMemo(() => [
    { name: "Jan", carburant: 4800, lubrifiants: 240 },
    { name: "Fév", carburant: 5100, lubrifiants: 280 },
    { name: "Mar", carburant: 4600, lubrifiants: 220 },
    { name: "Avr", carburant: 5300, lubrifiants: 310 },
    { name: "Mai", carburant: 4900, lubrifiants: 250 },
    { name: "Juin", carburant: 5500, lubrifiants: 340 },
  ], []);

  // Dataset 3: Dynamic at-risk engines computed from the collection!
  const enginsAtRisk = React.useMemo(() => {
    if (!filteredEngins || filteredEngins.length === 0) return [];
    return filteredEngins
      .map(e => {
        const normStatus = getNormalizedStatus(e);
        let riskScore = 0;
        let riskFactors: string[] = [];
        
        if (normStatus === "EN_PANNE") {
          riskScore += 80;
          riskFactors.push("Arrêt immédiat (en panne)");
        } else if (normStatus === "EN_MAINTENANCE") {
          riskScore += 40;
          riskFactors.push("Sous maintenance active");
        }
        
        const hours = e.heures || e.heuresMarche || 0;
        if (hours > 6000) {
          riskScore += 30;
          riskFactors.push(`Seuil d'heures dépassé (${hours}h)`);
        } else if (hours > 4000) {
          riskScore += 15;
          riskFactors.push(`Heures de marche élevées (${hours}h)`);
        }
        
        const dispo = e.dispo ?? 100;
        if (dispo < 75) {
          riskScore += 40;
          riskFactors.push(`Faible disponibilité (${dispo}%)`);
        } else if (dispo < 90) {
          riskScore += 20;
          riskFactors.push(`Disponibilité en baisse (${dispo}%)`);
        }
        
        if (riskScore === 0) {
          riskScore = hours > 0 ? (hours / 250) : 10;
          riskFactors.push("Usure mécanique standard");
        }
        
        return {
          ...e,
          riskScore: Math.min(100, Math.round(riskScore)),
          riskFactors: riskFactors.slice(0, 2)
        };
      })
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 3);
  }, [filteredEngins, getNormalizedStatus]);

  const showClassement = activeSite === "TOUS" && user?.role && ['ADMIN', 'DIRECTION', 'RESPONSABLE_MAINTENANCE'].includes(user.role);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex-1 bg-white dark:bg-[#070b13] text-slate-900 dark:text-slate-100 min-h-screen font-sans p-4 lg:p-6 space-y-6 overflow-y-auto"
    >
      {/* CORRECTION 1 : GORGEOUS UNIFIED BANNER */}
      <div id="dashboard-banner" className="bg-white dark:bg-[#0c1220]/90 border border-[#D4AF37]/40 dark:border-[#D4AF37]/20 rounded-2xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.02)] relative flex flex-col md:flex-row md:items-center md:justify-between gap-4 overflow-hidden min-h-[120px]">
        {/* Banner background image with fade mask */}
        <div className="absolute inset-0 pointer-events-none select-none z-0">
          <img 
            loading="lazy" 
            decoding="async" 
            src={bannerImg} 
            alt="Illustration maintenance industrielle" 
            className="w-full h-full object-cover opacity-25 dark:opacity-20"
            style={{
              maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent), linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent), linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
              maskComposite: 'intersect',
              WebkitMaskComposite: 'source-in'
            }}
          />
          {/* Border blending overlays */}
          <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-[#0c1220] dark:via-[#0c1220]/80 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent dark:from-[#0c1220] dark:via-[#0c1220]/80 pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white via-white/80 to-transparent dark:from-[#0c1220] dark:via-[#0c1220]/80 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-[#0c1220] dark:via-[#0c1220]/80 pointer-events-none" />
        </div>

        <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r from-slate-950 via-[#D4AF37] to-slate-950 rounded-t-2xl z-10" />
        
        <div className="flex items-center gap-4 z-10">
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

        <div className="flex items-center gap-2 z-10">
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
      <div id="kpis-header" className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* KPI 1: MTTR */}
        <div 
          className="relative overflow-hidden border border-[#D4AF37] border-l-[4px] border-l-[#1a1204] p-5 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group min-h-[145px]"
          style={{
            backgroundImage: `linear-gradient(200deg, rgba(255,255,255,0.25), transparent 40%), url(${goldTexture})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Corner L-brackets */}
          <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-[#1a1204]/30 pointer-events-none" />
          <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-[#1a1204]/30 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-[#1a1204]/30 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-[#1a1204]/30 pointer-events-none" />

          <div className="flex items-center justify-between gap-2 z-10">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-[#1a1204] uppercase tracking-widest font-mono">MTTR</span>
              <span className="text-[7.5px] font-bold text-[#1a1204]/70 uppercase tracking-widest font-mono -mt-0.5">REPAIR TOLERANCE</span>
            </div>
            <div className="h-8 w-8 rounded-xl bg-[#1a1204] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-md group-hover:scale-105 transition-transform duration-300">
              <Clock className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 z-10">
            <h2 className="font-mono text-3xl font-black tracking-tight text-[#1a1204] flex items-baseline">
              {mttr !== null ? (
                <>
                  {mttr}
                  <span className="text-xs font-black text-[#1a1204]/80 ml-1 uppercase">hrs</span>
                </>
              ) : (
                <span className="text-xs font-semibold text-[#1a1204]/60 uppercase">N/A</span>
              )}
            </h2>

            {/* Precision status bar */}
            <div className="h-1 w-full bg-[#1a1204]/10 rounded-full mt-2 overflow-hidden relative">
              <div className="h-full bg-[#1a1204] rounded-full" style={{ width: "24%" }} />
            </div>

            <div className="flex items-center justify-between mt-2 pt-1">
              {mttr !== null ? (
                <div className="flex items-center gap-1 text-[8.5px] font-mono font-bold text-[#1a1204]">
                  <TrendingDown className="h-2.5 w-2.5" />
                  <span>-0.4h vs mois dern.</span>
                </div>
              ) : (
                <span className="text-[8px] font-mono text-[#1a1204]/60">WAITING TELEMETRY</span>
              )}
              <span className="text-[7px] font-bold font-mono text-[#1a1204]/50">SYS_V1.0</span>
            </div>
          </div>
        </div>

        {/* KPI 2: MTBF */}
        <div className="relative overflow-hidden bg-white dark:bg-[#0c1220] border border-slate-150 dark:border-slate-850 border-l-[4px] border-l-[#9c1a1a] p-5 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group min-h-[145px]">
          {/* Blueprint dot pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] opacity-60 pointer-events-none" />
          
          {/* Corner L-brackets */}
          <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-slate-300/60 dark:border-slate-700/60 pointer-events-none" />
          <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-slate-300/60 dark:border-slate-700/60 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-slate-300/60 dark:border-slate-700/60 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-slate-300/60 dark:border-slate-700/60 pointer-events-none" />

          <div className="flex items-center justify-between gap-2 z-10">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest font-mono">MTBF</span>
              <span className="text-[7.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono -mt-0.5">RELIABILITY INDEX</span>
            </div>
            <div className="h-8 w-8 rounded-xl bg-slate-950 dark:bg-slate-900 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-md group-hover:scale-105 transition-transform duration-300">
              <Gauge className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 z-10">
            <h2 className="font-mono text-3xl font-black tracking-tight text-[#9c1a1a] dark:text-[#ff6b6b] flex items-baseline">
              {mtbf !== null ? (
                <>
                  {mtbf}
                  <span className="text-xs font-black text-slate-400 dark:text-slate-500 ml-1 uppercase">hrs</span>
                </>
              ) : (
                <span className="text-xs font-semibold text-slate-450 dark:text-slate-500 uppercase">N/A</span>
              )}
            </h2>

            {/* Precision status bar */}
            <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden relative">
              <div className="h-full bg-[#9c1a1a] rounded-full" style={{ width: "68%" }} />
            </div>

            <div className="flex items-center justify-between mt-2 pt-1">
              {mtbf !== null ? (
                <div className="flex items-center gap-1 text-[8.5px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-2.5 w-2.5" />
                  <span>+8h vs mois dern.</span>
                </div>
              ) : (
                <span className="text-[8px] font-mono text-slate-400">WAITING TELEMETRY</span>
              )}
              <span className="text-[7px] font-bold font-mono text-slate-300 dark:text-slate-600">SYS_V1.0</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Taux Dispo */}
        <div 
          className="relative overflow-hidden border border-[#D4AF37] border-l-[4px] border-l-[#1a1204] p-5 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group min-h-[145px]"
          style={{
            backgroundImage: `linear-gradient(200deg, rgba(255,255,255,0.25), transparent 40%), url(${goldTexture})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Corner L-brackets */}
          <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-[#1a1204]/30 pointer-events-none" />
          <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-[#1a1204]/30 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-[#1a1204]/30 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-[#1a1204]/30 pointer-events-none" />

          <div className="flex items-center justify-between gap-2 z-10">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-[#1a1204] uppercase tracking-widest font-mono">Disponibilité</span>
              <span className="text-[7.5px] font-bold text-[#1a1204]/70 uppercase tracking-widest font-mono -mt-0.5">AVAILABILITY COEFFICIENT</span>
            </div>
            <div className="h-8 w-8 rounded-xl bg-[#1a1204] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-md group-hover:scale-105 transition-transform duration-300">
              <Activity className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 z-10">
            <h2 className="font-mono text-3xl font-black tracking-tight text-[#1a1204] flex items-baseline">
              {dispoRate !== null ? (
                <>
                  {dispoRate}
                  <span className="text-xs font-black text-[#1a1204]/80 ml-1 uppercase">%</span>
                </>
              ) : (
                <span className="text-xs font-semibold text-[#1a1204]/60 uppercase">N/A</span>
              )}
            </h2>

            {/* Precision status bar */}
            <div className="h-1 w-full bg-[#1a1204]/10 rounded-full mt-2 overflow-hidden relative">
              <div className="h-full bg-[#1a1204] rounded-full animate-pulse" style={{ width: dispoRate !== null ? `${dispoRate}%` : "0%" }} />
            </div>

            <div className="flex items-center justify-between mt-2 pt-1">
              {dispoRate !== null ? (
                <div className="flex items-center gap-1 text-[8.5px] font-mono font-bold text-[#1a1204]">
                  <TrendingUp className="h-2.5 w-2.5" />
                  <span>+1.2% vs mois dern.</span>
                </div>
              ) : (
                <span className="text-[8px] font-mono text-[#1a1204]/60">WAITING TELEMETRY</span>
              )}
              <span className="text-[7px] font-bold font-mono text-[#1a1204]/50">SYS_V1.0</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Backlog OT */}
        <div 
          className="relative overflow-hidden border border-[#D4AF37] border-l-[4px] border-l-[#1a1204] p-5 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group min-h-[145px]"
          style={{
            backgroundImage: `linear-gradient(200deg, rgba(255,255,255,0.25), transparent 40%), url(${goldTexture})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Corner L-brackets */}
          <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-[#1a1204]/30 pointer-events-none" />
          <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-[#1a1204]/30 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-[#1a1204]/30 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-[#1a1204]/30 pointer-events-none" />

          <div className="flex items-center justify-between gap-2 z-10">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-[#1a1204] uppercase tracking-widest font-mono">Backlog OT</span>
              <span className="text-[7.5px] font-bold text-[#1a1204]/70 uppercase tracking-widest font-mono -mt-0.5">MAINTENANCE BACKLOG</span>
            </div>
            <div className="h-8 w-8 rounded-xl bg-[#1a1204] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-md group-hover:scale-105 transition-transform duration-300">
              <Wrench className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 z-10">
            <h2 className="font-mono text-3xl font-black tracking-tight text-[#1a1204] flex items-baseline">
              {totalOpenOTs !== null ? (
                <>
                  {totalOpenOTs}
                  <span className="text-xs font-black text-[#1a1204]/80 ml-1 uppercase">actifs</span>
                </>
              ) : (
                <span className="text-xs font-semibold text-[#1a1204]/60 uppercase">N/A</span>
              )}
            </h2>

            {/* Precision status bar */}
            <div className="h-1 w-full bg-[#1a1204]/10 rounded-full mt-2 overflow-hidden relative">
              <div className="h-full bg-[#1a1204] rounded-full" style={{ width: "42%" }} />
            </div>

            <div className="flex items-center justify-between mt-2 pt-1">
              {totalOpenOTs !== null ? (
                <div className="flex items-center gap-1 text-[8.5px] font-mono font-bold text-[#1a1204]">
                  <TrendingDown className="h-2.5 w-2.5" />
                  <span>-3 vs mois dern.</span>
                </div>
              ) : (
                <span className="text-[8px] font-mono text-[#1a1204]/60">WAITING TELEMETRY</span>
              )}
              <span className="text-[7px] font-bold font-mono text-[#1a1204]/50">SYS_V1.0</span>
            </div>
          </div>
        </div>

        {/* KPI 5: Coût / heure */}
        <div className="relative overflow-hidden bg-white dark:bg-[#0c1220] border border-slate-150 dark:border-slate-850 border-l-[4px] border-l-[#D4AF37] p-5 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 col-span-2 md:col-span-1 flex flex-col justify-between group min-h-[145px]">
          {/* Blueprint dot pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] opacity-60 pointer-events-none" />
          
          {/* Corner L-brackets */}
          <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-slate-300/60 dark:border-slate-700/60 pointer-events-none" />
          <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-slate-300/60 dark:border-slate-700/60 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-slate-300/60 dark:border-slate-700/60 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-slate-300/60 dark:border-slate-700/60 pointer-events-none" />

          <div className="flex items-center justify-between gap-2 z-10">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest font-mono">Coût Moyen</span>
              <span className="text-[7.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono -mt-0.5">HOURLY COST VECTOR</span>
            </div>
            <div className="h-8 w-8 rounded-xl bg-slate-950 dark:bg-slate-900 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-md group-hover:scale-105 transition-transform duration-300">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 z-10">
            <h2 className="font-mono text-3xl font-black tracking-tight text-[#D4AF37] flex items-baseline">
              {costPerHour !== null ? (
                <>
                  {costPerHour}
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 ml-1 uppercase">dh/h</span>
                </>
              ) : (
                <span className="text-xs font-semibold text-slate-450 dark:text-slate-500 uppercase">N/A</span>
              )}
            </h2>

            {/* Precision status bar */}
            <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden relative">
              <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: "55%" }} />
            </div>

            <div className="flex items-center justify-between mt-2 pt-1">
              {costPerHour !== null ? (
                <div className="flex items-center gap-1 text-[8.5px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  <TrendingDown className="h-2.5 w-2.5" />
                  <span>-12 DH vs mois dern.</span>
                </div>
              ) : (
                <span className="text-[8px] font-mono text-slate-400">WAITING TELEMETRY</span>
              )}
              <span className="text-[7px] font-bold font-mono text-slate-300 dark:text-slate-600">SYS_V1.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* CLASSEMENT DES SITES — TABLEAU DÉCISIONNEL */}
      {showClassement && (
        <div className="relative overflow-hidden bg-white dark:bg-[#0c1220]/50 border border-[#D4AF37]/40 dark:border-[#D4AF37]/20 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
              Classement Décisionnel des Sites — Besoin d'Attention
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Moyenne pondérée des indicateurs de disponibilité, pannes, conformité préventive et charge de travail (trié du plus critique au plus stable)
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">Site</th>
                  <th className="py-2.5 px-3 text-center">Score Global</th>
                  <th className="py-2.5 px-3 text-right">Disponibilité Flotte</th>
                  <th className="py-2.5 px-3 text-center">Pannes Ouvertes</th>
                  <th className="py-2.5 px-3 text-right">Taux Préventif</th>
                  <th className="py-2.5 px-3 text-right">Charge Mécanicien</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {classementSites.map((item) => {
                  const score = item.scoreGlobal;
                  let badgeVariant = "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50";
                  if (score !== null) {
                    if (score >= 80) {
                      badgeVariant = "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50";
                    } else if (score >= 60) {
                      badgeVariant = "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50";
                    }
                  }

                  return (
                    <tr key={item.site} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                          score !== null && score < 60 ? "bg-rose-500" : score !== null && score < 80 ? "bg-amber-500" : "bg-emerald-500"
                        }`} />
                        {item.site}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {score !== null ? (
                          <span className={`inline-block text-[11px] font-black uppercase px-2 py-0.5 rounded-full ${badgeVariant}`}>
                            {Math.round(score)}%
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        {item.dispoSite !== null ? (
                          <span className={`${item.dispoSite < 75 ? "text-rose-600 font-bold" : item.dispoSite < 90 ? "text-amber-600" : "text-emerald-600"}`}>
                            {item.dispoSite.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        {item.pannesOuvertesSite !== null ? (
                          <span className={`${item.pannesOuvertesSite > 4 ? "text-rose-600 font-black" : item.pannesOuvertesSite > 0 ? "text-amber-600 font-bold" : "text-emerald-600"}`}>
                            {item.pannesOuvertesSite}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        {item.complianceSite !== null ? (
                          <span className={`${item.complianceSite < 60 ? "text-rose-600 font-bold" : item.complianceSite < 85 ? "text-amber-600" : "text-emerald-600"}`}>
                            {item.complianceSite.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        {item.chargeMoyenneSite !== null ? (
                          <span className={`${item.chargeMoyenneSite > 5 ? "text-rose-600 font-bold" : item.chargeMoyenneSite > 2 ? "text-amber-600" : "text-emerald-600"}`}>
                            {item.chargeMoyenneSite.toFixed(1)} T/méc
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MAIN TWO-COLUMN RESPONSIVE LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT SECTION (Width: 2/3 on desktop) - Graphs */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* WIDGET 2 — COURBE ANNUELLE */}
          <div className="relative overflow-hidden bg-white dark:bg-[#0c1220] border border-slate-150 dark:border-slate-850 p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 space-y-4">
            <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r from-slate-900 via-[#D4AF37] to-[#9c1a1a]" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#D4AF37]" />
                  Évolution Annuelle des Événements
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Superposition des pannes, maintenances préventives et correctives sur 12 mois
                </p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono font-bold">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#9c1a1a]" /> Pannes</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#D4AF37]" /> Préventif</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-800 dark:bg-slate-200" /> Correctif</span>
              </div>
            </div>

            <div className="h-[220px] w-full mt-2 font-mono text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulatedAnnualData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: "#ffffff", 
                      borderRadius: "12px", 
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
                    }} 
                    labelClassName="font-bold text-slate-800"
                  />
                  <Line type="monotone" dataKey="preventif" stroke="#D4AF37" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="correctif" stroke="#1e293b" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="pannes" stroke="#9c1a1a" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[9px] text-slate-400 dark:text-slate-500 italic text-right">
              * Données consolidées mensuelles basées sur l'historique de la flotte locale.
            </div>
          </div>

          {/* WIDGET 3 — CONSOMMATION MENSUELLE */}
          <div className="relative overflow-hidden bg-white dark:bg-[#0c1220] border border-slate-150 dark:border-slate-850 p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 space-y-4">
            <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r from-slate-900 via-[#D4AF37] to-[#9c1a1a]" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#1e293b] dark:bg-white" />
                  Consommation Carburant & Lubrifiants
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Consommation mensuelle par engin principal sur les 6 derniers mois
                </p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono font-bold">
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-slate-900 dark:bg-slate-700" /> Gazole (Litres)</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-[#D4AF37]" /> Lubrifiants (L)</span>
              </div>
            </div>

            <div className="h-[200px] w-full mt-2 font-mono text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={simulatedFuelData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#D4AF37" fontSize={10} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: "#ffffff", 
                      borderRadius: "12px", 
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
                    }} 
                  />
                  <Bar yAxisId="left" dataKey="carburant" fill="#1e293b" radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar yAxisId="right" dataKey="lubrifiants" fill="#D4AF37" radius={[4, 4, 0, 0]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[9px] text-slate-400 dark:text-slate-500 italic text-right">
              * Consommation normalisée d'après les relevés de cuves et pompes mobiles.
            </div>
          </div>

          {/* WIDGET 7 — CARNET DE SANTÉ RAPIDE */}
          <div className="relative overflow-hidden bg-white dark:bg-[#0c1220] border border-slate-150 dark:border-slate-850 p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 space-y-4">
            <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r from-[#9c1a1a] to-[#D4AF37]" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#9c1a1a] animate-pulse" />
                Carnet de Santé — Top 3 des Engins sous haute surveillance
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Engins de la flotte locale triés par score de risque calculé d'après leur usure et statut actuel
              </p>
            </div>

            {enginsAtRisk.length === 0 ? (
              <div className="h-[120px] w-full flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-900/10 p-6 text-center">
                <Activity className="h-6 w-6 text-slate-400 mb-2" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Aucun engin à risque détecté ou données de flotte non initialisées
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                {enginsAtRisk.map((engin) => {
                  const score = engin.riskScore || 0;
                  // Color codes for risk bars
                  let barColor = "bg-slate-400";
                  let textColor = "text-slate-700 dark:text-slate-300";
                  let bgBadge = "bg-slate-50 border-slate-100";
                  if (score >= 70) {
                    barColor = "bg-[#9c1a1a]";
                    textColor = "text-rose-700 dark:text-rose-400";
                    bgBadge = "bg-rose-50/50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/40";
                  } else if (score >= 40) {
                    barColor = "bg-[#D4AF37]";
                    textColor = "text-amber-700 dark:text-amber-400";
                    bgBadge = "bg-amber-50/50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/40";
                  }

                  return (
                    <div 
                      key={engin.id} 
                      className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/40 dark:bg-[#0f172a]/20 flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-850 font-mono text-[10px] font-black bg-white dark:bg-[#121c30] text-slate-900 dark:text-white uppercase">
                            {engin.matricule || engin.id}
                          </span>
                          <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-300 mt-1.5 truncate">
                            {engin.modele || engin.type || "Équipement"}
                          </h4>
                        </div>
                        <span className={`text-[10px] font-black font-mono shrink-0 ${textColor}`}>
                          {score}% Risque
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-850 rounded-full overflow-hidden">
                          <div className={`h-full ${barColor}`} style={{ width: `${score}%` }} />
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {(engin.riskFactors || []).map((factor: string, i: number) => (
                            <span 
                              key={i} 
                              className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded border ${bgBadge} leading-none`}
                            >
                              {factor}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
                            {wo.statut || wo.status}
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
