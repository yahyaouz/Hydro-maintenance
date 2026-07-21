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
  Gauge,
  Sun,
  Moon
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
  AreaChart,
  Area,
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
import { DataLoadError } from "@/components/shared/DataLoadError";
import { SiteID } from "@/types";
import { toast } from "sonner";
import { getLocalMonthString } from "@/lib/utils";
// @ts-ignore
import bannerImg from "@/assets/images/banner-mecanique.webp";
// @ts-ignore
import goldTexture from "@/assets/images/texture-or.webp";
// @ts-ignore
import hydrominesLogo from "@/assets/images/logo_hydromines.jpg";

// 5 default sites for multi-site metrics
const SITES_LIST = ["SMI", "OUMEJRANE", "KOUDIA", "OUANSIMI", "BOU-AZZER"];

export function Dashboard() {
  const { activeSite, setActiveSite, user, theme, setTheme } = useAuthStore();
  const [isSignalerPanneOpen, setIsSignalerPanneOpen] = React.useState(false);
  
  const isDark = theme === "dark";

  // Theme-adaptive classes for premium light / dark integration
  const mainBgClass = isDark 
    ? "bg-gradient-to-b from-[#090e18] to-[#04060b] text-[#F4EAD4]" 
    : "bg-white text-slate-800";
  
  const cardBgClass = isDark
    ? "bg-gradient-to-br from-[#121824] to-[#0a0d16] border border-[#D4AF37]/25"
    : "bg-gradient-to-br from-white to-[#FDFBF7] border border-[#D4AF37]/40 shadow-[0_8px_30px_rgba(212,175,55,0.06)]";

  const textTitleClass = isDark ? "text-[#FFFDF9]" : "text-amber-950";
  const textMutedClass = isDark ? "text-[#A49F8D]" : "text-slate-600";
  const borderClass = isDark ? "border-[#D4AF37]/10" : "border-[#D4AF37]/25";
  const bgSubtleClass = isDark ? "bg-[#0d121d]" : "bg-amber-50/50";
  const bgSubtle50Class = isDark ? "bg-[#0d121d]/50" : "bg-amber-50/30";
  const bgSubtle12Class = isDark ? "bg-[#121824]" : "bg-slate-100";
  const hoverClass = isDark ? "hover:bg-[#D4AF37]/5" : "hover:bg-amber-50/50";
  
  // Visibility of annual curves
  const [visibleCurves, setVisibleCurves] = React.useState({
    pannes: true,
    preventif: true,
    correctif: true
  });

  // Selected severity in Donut Backlog
  const [selectedSeverity, setSelectedSeverity] = React.useState<string | null>(null);

  // Firestore real collections subscriptions
  const { data: enginsLive, error: enginsError } = useCollection<any>('engins', [], { unlimited: true });
  const { data: workOrdersLive, error: workOrdersError } = useCollection<any>('maintenanceTasks', [], { unlimited: true });
  const { data: pannesLive, error: pannesError } = useCollection<any>('pannes', [], { unlimited: true });
  const { data: carburantsLive, error: carburantsError } = useCollection<any>('carburants', [], { unlimited: true });

  const hasLoadError = !!(enginsError || workOrdersError || pannesError || carburantsError);

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
      const sev = String(wo.severity || wo.priorite || '').toLowerCase();
      return sev.includes('critique') || sev.includes('critical') || sev.includes('haute') || sev.includes('high');
    }).length;

    const countEleve = openWOs.filter(wo => {
      const sev = String(wo.severity || wo.priorite || '').toLowerCase();
      return sev === 'eleve' || sev === 'élevé' || sev === 'medium' || sev === 'moyen' || sev === 'normale';
    }).length;

    const countMoyen = openWOs.filter(wo => {
      const sev = String(wo.severity || wo.priorite || '').toLowerCase();
      return sev === 'normal' || sev === 'bas' || sev === 'low' || sev === 'basse';
    }).length;

    const totalCalculated = countCritique + countEleve + countMoyen;
    const countBas = Math.max(0, openWOs.length - totalCalculated);

    return [
      { name: "Critique", value: countCritique, color: "#EF4444" },
      { name: "Élevé", value: countEleve, color: "#F59E0B" },
      { name: "Moyen", value: countMoyen, color: "#D4AF37" },
      { name: "Bas", value: countBas, color: "#8A6623" }
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
      const sev = String(wo.severity || wo.priorite || '').toLowerCase();
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
    const currentMonthStr = getLocalMonthString();

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

  // Dataset 1: Monthly events (Pannes / Préventif / Correctif) computed dynamically over the last 12 sliding months
  const evolutionAnnuelleData = React.useMemo(() => {
    const list: Array<{ name: string; pannes: number; preventif: number; correctif: number }> = [];
    const now = new Date();
    
    const monthLabels: Record<string, string> = {
      "01": "Jan", "02": "Fév", "03": "Mar", "04": "Avr", "05": "Mai", "06": "Juin",
      "07": "Juil", "08": "Août", "09": "Sept", "10": "Oct", "11": "Nov", "12": "Déc"
    };

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthStr = String(d.getMonth() + 1).padStart(2, "0");
      const key = `${year}-${monthStr}`; // YYYY-MM

      const label = `${monthLabels[monthStr] || monthStr} ${String(year).slice(2)}`;

      // Count pannes in filteredPannes (filtered by active site)
      const pCount = filteredPannes.filter(p => !p.deleted && p.dateDeclaration && p.dateDeclaration.startsWith(key)).length;

      // Count PREVENTIF tasks (status FAIT or VALIDE) in filteredOrders (filtered by active site)
      const pMoisTasks = filteredOrders.filter(t => 
        t.type === 'PREVENTIF' && 
        (t.statut === 'FAIT' || t.statut === 'VALIDE') && 
        t.datePlanifiee && 
        t.datePlanifiee.startsWith(key)
      ).length;

      // Count CORRECTIF/CURATIF tasks (status FAIT or VALIDE) in filteredOrders (filtered by active site)
      const cMoisTasks = filteredOrders.filter(t => 
        (t.type === 'CORRECTIF' || t.type === 'CURATIF') && 
        (t.statut === 'FAIT' || t.statut === 'VALIDE') && 
        t.datePlanifiee && 
        t.datePlanifiee.startsWith(key)
      ).length;

      list.push({
        name: label,
        pannes: pCount,
        preventif: pMoisTasks,
        correctif: cMoisTasks
      });
    }

    return list;
  }, [filteredPannes, filteredOrders]);

  const hasNoAnnualData = React.useMemo(() => {
    return evolutionAnnuelleData.every(d => d.pannes === 0 && d.preventif === 0 && d.correctif === 0);
  }, [evolutionAnnuelleData]);

  // Dataset 2: Monthly Fuel & Lubricant consumption computed dynamically over the last 6 sliding months
  const filteredCarburants = React.useMemo(() => {
    if (!carburantsLive) return [];
    return carburantsLive.filter(c => activeSite === "TOUS" || c.site === activeSite || c.siteId === activeSite);
  }, [carburantsLive, activeSite]);

  const consommationCarburantData = React.useMemo(() => {
    const list: Array<{ name: string; carburant: number; lubrifiants: number }> = [];
    const now = new Date();

    const monthLabels: Record<string, string> = {
      "01": "Jan", "02": "Fév", "03": "Mar", "04": "Avr", "05": "Mai", "06": "Juin",
      "07": "Juil", "08": "Août", "09": "Sept", "10": "Oct", "11": "Nov", "12": "Déc"
    };

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthStr = String(d.getMonth() + 1).padStart(2, "0");
      const key = `${year}-${monthStr}`; // YYYY-MM

      const label = `${monthLabels[monthStr] || monthStr} ${String(year).slice(2)}`;

      const monthRecords = filteredCarburants.filter(c => c.dateReleve && c.dateReleve.startsWith(key));
      let carburantSum = 0;
      let lubrifiantsSum = 0;

      monthRecords.forEach(c => {
        carburantSum += Number(c.consoGasoil) || 0;
        lubrifiantsSum += (Number(c.consoHuileMoteur) || 0) + (Number(c.consoHuileHydraulique) || 0) + (Number(c.consoAutresLubrifiants) || 0);
      });

      list.push({
        name: label,
        carburant: Math.round(carburantSum),
        lubrifiants: Math.round(lubrifiantsSum)
      });
    }

    return list;
  }, [filteredCarburants]);

  const hasNoFuelData = React.useMemo(() => {
    return consommationCarburantData.every(d => d.carburant === 0 && d.lubrifiants === 0);
  }, [consommationCarburantData]);

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
        
        const hours = e.heuresMarche || e.heures || 0;
        if (hours > 6000) {
          riskScore += 30;
          riskFactors.push(`Seuil d'heures dépassé (${hours}h)`);
        } else if (hours > 4000) {
          riskScore += 15;
          riskFactors.push(`Heures de marche élevées (${hours}h)`);
        }
        
        if (e.dispo !== undefined && e.dispo !== null) {
          const dispo = e.dispo;
          if (dispo < 75) {
            riskScore += 40;
            riskFactors.push(`Faible disponibilité (${dispo}%)`);
          } else if (dispo < 90) {
            riskScore += 20;
            riskFactors.push(`Disponibilité en baisse (${dispo}%)`);
          }
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
      className={`flex-1 min-h-screen font-sans p-4 lg:p-6 space-y-6 overflow-y-auto transition-colors duration-500 ${mainBgClass}`}
    >
      {hasLoadError && <DataLoadError />}

      {/* CORRECTION 1 : GORGEOUS UNIFIED BANNER */}
      <div 
        id="dashboard-banner" 
        className={`relative overflow-hidden border-2 border-[#D4AF37] p-7 md:p-10 pb-16 md:pb-16 rounded-3xl transition-all duration-500 flex flex-col md:flex-row md:items-center md:justify-between gap-6 min-h-[210px] md:min-h-[240px] ${
          isDark 
            ? "shadow-[0_12px_40px_rgba(212,175,55,0.12)]" 
            : "shadow-[0_12px_40px_rgba(212,175,55,0.06)]"
        }`}
        style={{
          backgroundImage: isDark
            ? `linear-gradient(135deg, rgba(22, 17, 8, 0.95) 0%, rgba(10, 8, 4, 0.98) 100%), url(${goldTexture})`
            : 'none',
          backgroundColor: isDark ? 'transparent' : '#ffffff',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* SMALL TOP-CENTERED SUN/MOON THEME TOGGLER */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={() => {
              const newTheme = isDark ? "light" : "dark";
              setTheme(newTheme);
              toast.success(`Mode ${newTheme === "light" ? "CLAIR ☀️" : "SOMBRE 🌙"} activé`);
            }}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9.5px] font-black font-mono uppercase tracking-widest transition-all duration-300 shadow-lg hover:scale-[1.04] cursor-pointer ${
              isDark 
                ? "bg-[#1E1402]/90 border-[#D4AF37]/50 text-[#FFFDF9] hover:bg-[#D4AF37]/25" 
                : "bg-white/95 border-[#D4AF37] text-amber-950 hover:bg-amber-50"
            }`}
            style={{ textShadow: isDark ? '0 1px 2px rgba(0,0,0,0.4)' : 'none' }}
          >
            {isDark ? (
              <>
                <Sun className="h-3 w-3 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>MODE CLAIR</span>
              </>
            ) : (
              <>
                <Moon className="h-3 w-3 text-slate-700" />
                <span>MODE SOMBRE</span>
              </>
            )}
          </button>
        </div>

        {/* Banner background image covering the entire right portion of the banner */}
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-[50%] lg:w-[45%] pointer-events-none select-none z-0">
          <img 
            loading="lazy" 
            decoding="async" 
            src={bannerImg} 
            alt="Illustration maintenance industrielle" 
            className={`w-full h-full object-cover object-right transition-all duration-500 ${
              isDark 
                ? "opacity-60 md:opacity-85 mix-blend-screen" 
                : "opacity-75 md:opacity-95 mix-blend-multiply"
            }`}
          />
          {/* Smooth overlay gradient to fade seamlessly into the background on the left */}
          <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? "from-[#0a0804] via-[#0a0804]/70" : "from-white via-white/70"} to-transparent`} />
          <div className={`absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t ${isDark ? "from-[#0a0804]" : "from-white"} to-transparent`} />
          <div className={`absolute inset-x-0 top-0 h-12 bg-gradient-to-b ${isDark ? "from-[#0a0804]" : "from-white"} to-transparent`} />
        </div>

        <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r from-amber-600 via-[#D4AF37] to-amber-950 rounded-t-3xl z-10" />
        
        {/* L-brackets for the banner too to match the KPIs theme perfectly */}
        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#D4AF37]/50 pointer-events-none" />
        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#D4AF37]/50 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[#D4AF37]/50 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#D4AF37]/50 pointer-events-none" />

        <div className="flex items-center gap-5 z-10">
          {/* Logo container, sized 4x the original small HM box (h-12 w-12 is 48x48, h-24 w-24 is 96x96 which is 4 times the area!) */}
          <div className={`h-24 w-24 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden transition-all ${
            isDark 
              ? "bg-gradient-to-br from-[#D4AF37] to-[#8B5E1A] border-2 border-[#D4AF37] shadow-lg" 
              : "bg-white shadow-sm"
          }`}>
            <img 
              src={hydrominesLogo} 
              alt="Hydromines Logo" 
              className="w-full h-full object-contain p-1"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black tracking-widest uppercase flex items-center gap-1">
                <Sparkles className="h-3 w-3 animate-pulse text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
                <span className={isDark ? "text-sky-400" : "text-sky-600"}>HYDRO</span>
                <span className={isDark ? "text-red-500" : "text-red-700"}>MINES</span>
                <span className="text-[#D4AF37] ml-1 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">COCKPIT</span>
              </span>
              <Badge variant="outline" className={`text-[9px] font-black font-mono uppercase tracking-wider ${
                isDark 
                  ? "border-[#D4AF37]/40 text-[#FFFDF9] bg-[#1E1402]" 
                  : "border-[#D4AF37] text-amber-950 bg-amber-50"
              }`}>
                Site : {activeSite === 'TOUS' ? 'TOUS LES SITES' : activeSite}
              </Badge>
            </div>
            <h1 
              className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight mt-1 bg-gradient-to-r from-[#A07810] via-[#D4AF37] to-[#805F0D] bg-clip-text text-transparent" 
              style={{ 
                textShadow: 'none',
                filter: 'none',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {activeSite === 'TOUS' ? "Supervision Flotte Globale" : `Cockpit Tactique • ${activeSite}`}
            </h1>
            <p className={`text-xs md:text-sm font-medium mt-1 ${isDark ? "text-[#F4EAD4]" : "text-slate-600"}`} style={isDark ? { textShadow: '0 1px 2px rgba(0,0,0,0.8)' } : undefined}>
              Analyses décisionnelles préventives et supervision résiliente
            </p>
          </div>
        </div>

        {activeSite !== "TOUS" && (
          <div className="absolute top-4 right-4 md:static z-10">
            <Button
              variant="outline"
              onClick={() => setActiveSite("TOUS")}
              className={`text-xs font-black h-9 uppercase tracking-wider border-2 transition-all ${
                isDark 
                  ? "border-[#D4AF37]/40 text-[#FFFDF9] bg-[#1E1402]/80 hover:bg-[#D4AF37]/15 hover:border-[#D4AF37]" 
                  : "border-[#D4AF37]/60 text-amber-950 bg-white/90 hover:bg-amber-50 hover:border-[#D4AF37]"
              }`}
            >
              Vue Globale
            </Button>
          </div>
        )}

        {/* Button placed at bottom center of the banner */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex justify-center w-full px-4">
          <Button
            onClick={() => setIsSignalerPanneOpen(true)}
            className="bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-650 hover:to-rose-650 text-white font-black text-[10.5px] uppercase tracking-widest h-9 px-5 shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_22px_rgba(220,38,38,0.7)] border-2 border-[#D4AF37] shrink-0 transition-all duration-300 hover:scale-[1.02]"
          >
            <AlertTriangle className="h-3.5 w-3.5 mr-1.5 animate-pulse text-[#D4AF37]" /> Signaler une panne
          </Button>
        </div>
      </div>

      {/* WIDGET 1 — HEADER KPIs (5 cards) */}
      <div id="kpis-header" className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* KPI 1: MTTR */}
        <div 
          className="relative overflow-hidden border-2 border-[#D4AF37] border-l-[5px] border-l-[#D4AF37] p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_36px_rgba(212,175,55,0.3)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group min-h-[165px]"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(212, 175, 55, 0.45) 0%, rgba(139, 92, 26, 0.75) 50%, rgba(40, 25, 5, 0.92) 100%), url(${goldTexture})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Corner L-brackets */}
          <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-[#D4AF37]/50 pointer-events-none" />
          <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-[#D4AF37]/50 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-[#D4AF37]/50 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-[#D4AF37]/50 pointer-events-none" />

          <div className="flex items-center justify-between gap-2 z-10">
            <div className="flex flex-col">
              <span className="text-sm md:text-base font-black text-[#FFFDF9] uppercase tracking-wider font-mono" style={{ textShadow: '0 1.5px 3px rgba(0,0,0,0.8)' }}>MTTR</span>
              <span className="text-[8.5px] md:text-[9.5px] font-bold text-[#F4EAD4] uppercase tracking-widest font-mono -mt-0.5" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>REPAIR TOLERANCE</span>
            </div>
            <div className="h-8 w-8 rounded-xl bg-[#1E1402] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-md group-hover:scale-105 transition-transform duration-300">
              <Clock className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 z-10">
            <h2 className="font-mono text-3xl md:text-4xl font-black tracking-tight text-white flex items-baseline" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              {mttr !== null ? (
                <>
                  {mttr}
                  <span className="text-xs font-black text-[#F4EAD4] ml-1 uppercase">hrs</span>
                </>
              ) : (
                <span className="text-xs font-bold text-slate-300 uppercase">N/A</span>
              )}
            </h2>

            {/* Precision status bar */}
            <div className="h-1 w-full bg-black/40 rounded-full mt-2 overflow-hidden relative border border-[#D4AF37]/20">
              <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: "24%" }} />
            </div>

            <div className="flex items-center justify-between mt-2 pt-1">
              {mttr !== null ? (
                <div className="flex items-center gap-1 text-[9px] font-mono font-black text-emerald-300" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                  <TrendingDown className="h-2.5 w-2.5" />
                  <span>-0.4h vs mois dern.</span>
                </div>
              ) : (
                <span className="text-[8px] font-mono font-bold text-[#F4EAD4]/80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>WAITING TELEMETRY</span>
              )}
              <span className="text-[7.5px] font-black font-mono text-[#D4AF37]/80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>SYS_V1.0</span>
            </div>
          </div>
        </div>

        {/* KPI 2: MTBF */}
        <div 
          className="relative overflow-hidden border-2 border-[#D4AF37] border-l-[5px] border-l-[#D4AF37] p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_36px_rgba(212,175,55,0.3)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group min-h-[165px]"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(212, 175, 55, 0.45) 0%, rgba(139, 92, 26, 0.75) 50%, rgba(40, 25, 5, 0.92) 100%), url(${goldTexture})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Corner L-brackets */}
          <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-[#D4AF37]/50 pointer-events-none" />
          <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-[#D4AF37]/50 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-[#D4AF37]/50 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-[#D4AF37]/50 pointer-events-none" />

          <div className="flex items-center justify-between gap-2 z-10">
            <div className="flex flex-col">
              <span className="text-sm md:text-base font-black text-[#FFFDF9] uppercase tracking-wider font-mono" style={{ textShadow: '0 1.5px 3px rgba(0,0,0,0.8)' }}>MTBF</span>
              <span className="text-[8.5px] md:text-[9.5px] font-bold text-[#F4EAD4] uppercase tracking-widest font-mono -mt-0.5" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>RELIABILITY INDEX</span>
            </div>
            <div className="h-8 w-8 rounded-xl bg-[#1E1402] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-md group-hover:scale-105 transition-transform duration-300">
              <Gauge className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 z-10">
            <h2 className="font-mono text-3xl md:text-4xl font-black tracking-tight text-white flex items-baseline" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              {mtbf !== null ? (
                <>
                  {mtbf}
                  <span className="text-xs font-black text-[#F4EAD4] ml-1 uppercase">hrs</span>
                </>
              ) : (
                <span className="text-xs font-bold text-slate-300 uppercase">N/A</span>
              )}
            </h2>

            {/* Precision status bar */}
            <div className="h-1 w-full bg-black/40 rounded-full mt-2 overflow-hidden relative border border-[#D4AF37]/20">
              <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: "68%" }} />
            </div>

            <div className="flex items-center justify-between mt-2 pt-1">
              {mtbf !== null ? (
                <div className="flex items-center gap-1 text-[9px] font-mono font-black text-emerald-300" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                  <TrendingUp className="h-2.5 w-2.5" />
                  <span>+8h vs mois dern.</span>
                </div>
              ) : (
                <span className="text-[8px] font-mono font-bold text-[#F4EAD4]/80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>WAITING TELEMETRY</span>
              )}
              <span className="text-[7.5px] font-black font-mono text-[#D4AF37]/80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>SYS_V1.0</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Taux Dispo */}
        <div 
          className="relative overflow-hidden border-2 border-[#D4AF37] border-l-[5px] border-l-[#D4AF37] p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_36px_rgba(212,175,55,0.3)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group min-h-[165px]"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(212, 175, 55, 0.45) 0%, rgba(139, 92, 26, 0.75) 50%, rgba(40, 25, 5, 0.92) 100%), url(${goldTexture})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Corner L-brackets */}
          <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-[#D4AF37]/50 pointer-events-none" />
          <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-[#D4AF37]/50 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-[#D4AF37]/50 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-[#D4AF37]/50 pointer-events-none" />

          <div className="flex items-center justify-between gap-2 z-10">
            <div className="flex flex-col">
              <span className="text-sm md:text-base font-black text-[#FFFDF9] uppercase tracking-wider font-mono" style={{ textShadow: '0 1.5px 3px rgba(0,0,0,0.8)' }}>Disponibilité</span>
              <span className="text-[8.5px] md:text-[9.5px] font-bold text-[#F4EAD4] uppercase tracking-widest font-mono -mt-0.5" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>AVAILABILITY COEFFICIENT</span>
            </div>
            <div className="h-8 w-8 rounded-xl bg-[#1E1402] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-md group-hover:scale-105 transition-transform duration-300">
              <Activity className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 z-10">
            <h2 className="font-mono text-3xl md:text-4xl font-black tracking-tight text-white flex items-baseline" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              {dispoRate !== null ? (
                <>
                  {dispoRate}
                  <span className="text-xs font-black text-[#F4EAD4] ml-1 uppercase">%</span>
                </>
              ) : (
                <span className="text-xs font-bold text-slate-300 uppercase">N/A</span>
              )}
            </h2>

            {/* Precision status bar */}
            <div className="h-1 w-full bg-black/40 rounded-full mt-2 overflow-hidden relative border border-[#D4AF37]/20">
              <div className="h-full bg-[#D4AF37] rounded-full animate-pulse" style={{ width: dispoRate !== null ? `${dispoRate}%` : "0%" }} />
            </div>

            <div className="flex items-center justify-between mt-2 pt-1">
              {dispoRate !== null ? (
                <div className="flex items-center gap-1 text-[9px] font-mono font-black text-emerald-300" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                  <TrendingUp className="h-2.5 w-2.5" />
                  <span>+1.2% vs mois dern.</span>
                </div>
              ) : (
                <span className="text-[8px] font-mono font-bold text-[#F4EAD4]/80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>WAITING TELEMETRY</span>
              )}
              <span className="text-[7.5px] font-black font-mono text-[#D4AF37]/80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>SYS_V1.0</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Backlog OT */}
        <div 
          className="relative overflow-hidden border-2 border-[#D4AF37] border-l-[5px] border-l-[#D4AF37] p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_36px_rgba(212,175,55,0.3)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group min-h-[165px]"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(212, 175, 55, 0.45) 0%, rgba(139, 92, 26, 0.75) 50%, rgba(40, 25, 5, 0.92) 100%), url(${goldTexture})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Corner L-brackets */}
          <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-[#D4AF37]/50 pointer-events-none" />
          <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-[#D4AF37]/50 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-[#D4AF37]/50 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-[#D4AF37]/50 pointer-events-none" />

          <div className="flex items-center justify-between gap-2 z-10">
            <div className="flex flex-col">
              <span className="text-sm md:text-base font-black text-[#FFFDF9] uppercase tracking-wider font-mono" style={{ textShadow: '0 1.5px 3px rgba(0,0,0,0.8)' }}>Backlog OT</span>
              <span className="text-[8.5px] md:text-[9.5px] font-bold text-[#F4EAD4] uppercase tracking-widest font-mono -mt-0.5" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>MAINTENANCE BACKLOG</span>
            </div>
            <div className="h-8 w-8 rounded-xl bg-[#1E1402] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-md group-hover:scale-105 transition-transform duration-300">
              <Wrench className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 z-10">
            <h2 className="font-mono text-3xl md:text-4xl font-black tracking-tight text-white flex items-baseline" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              {totalOpenOTs !== null ? (
                <>
                  {totalOpenOTs}
                  <span className="text-xs font-black text-[#F4EAD4] ml-1 uppercase">actifs</span>
                </>
              ) : (
                <span className="text-xs font-bold text-slate-300 uppercase">N/A</span>
              )}
            </h2>

            {/* Precision status bar */}
            <div className="h-1 w-full bg-black/40 rounded-full mt-2 overflow-hidden relative border border-[#D4AF37]/20">
              <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: "42%" }} />
            </div>

            <div className="flex items-center justify-between mt-2 pt-1">
              {totalOpenOTs !== null ? (
                <div className="flex items-center gap-1 text-[9px] font-mono font-black text-emerald-300" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                  <TrendingDown className="h-2.5 w-2.5" />
                  <span>-3 vs mois dern.</span>
                </div>
              ) : (
                <span className="text-[8px] font-mono font-bold text-[#F4EAD4]/80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>WAITING TELEMETRY</span>
              )}
              <span className="text-[7.5px] font-black font-mono text-[#D4AF37]/80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>SYS_V1.0</span>
            </div>
          </div>
        </div>

        {/* KPI 5: Coût Moyen */}
        <div 
          className="relative overflow-hidden border-2 border-[#D4AF37] border-l-[5px] border-l-[#D4AF37] p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_36px_rgba(212,175,55,0.3)] hover:-translate-y-1 transition-all duration-300 col-span-2 md:col-span-1 flex flex-col justify-between group min-h-[165px]"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(212, 175, 55, 0.45) 0%, rgba(139, 92, 26, 0.75) 50%, rgba(40, 25, 5, 0.92) 100%), url(${goldTexture})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Corner L-brackets */}
          <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-[#D4AF37]/50 pointer-events-none" />
          <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-[#D4AF37]/50 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-[#D4AF37]/50 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-[#D4AF37]/50 pointer-events-none" />

          <div className="flex items-center justify-between gap-2 z-10">
            <div className="flex flex-col">
              <span className="text-sm md:text-base font-black text-[#FFFDF9] uppercase tracking-wider font-mono" style={{ textShadow: '0 1.5px 3px rgba(0,0,0,0.8)' }}>Coût Moyen</span>
              <span className="text-[8.5px] md:text-[9.5px] font-bold text-[#F4EAD4] uppercase tracking-widest font-mono -mt-0.5" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>HOURLY COST VECTOR</span>
            </div>
            <div className="h-8 w-8 rounded-xl bg-[#1E1402] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-md group-hover:scale-105 transition-transform duration-300">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 z-10">
            <h2 className="font-mono text-3xl md:text-4xl font-black tracking-tight text-white flex items-baseline" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              {costPerHour !== null ? (
                <>
                  {costPerHour}
                  <span className="text-[10px] font-black text-[#F4EAD4] ml-1 uppercase">dh/h</span>
                </>
              ) : (
                <span className="text-xs font-bold text-slate-300 uppercase">N/A</span>
              )}
            </h2>

            {/* Precision status bar */}
            <div className="h-1 w-full bg-black/40 rounded-full mt-2 overflow-hidden relative border border-[#D4AF37]/20">
              <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: "55%" }} />
            </div>

            <div className="flex items-center justify-between mt-2 pt-1">
              {costPerHour !== null ? (
                <div className="flex items-center gap-1 text-[9px] font-mono font-black text-emerald-300" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                  <TrendingDown className="h-2.5 w-2.5" />
                  <span>-12 DH vs mois dern.</span>
                </div>
              ) : (
                <span className="text-[8px] font-mono font-bold text-[#F4EAD4]/80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>WAITING TELEMETRY</span>
              )}
              <span className="text-[7.5px] font-black font-mono text-[#D4AF37]/80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>SYS_V1.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* CLASSEMENT DES SITES — TABLEAU DÉCISIONNEL */}
      {showClassement && (
        <div className={`relative overflow-hidden ${cardBgClass} border-2 p-5 rounded-2xl space-y-4`}>
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-600 via-[#D4AF37] to-amber-950" />
          
          {/* L-brackets */}
          <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-[#D4AF37]/50 pointer-events-none" />
          <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-[#D4AF37]/50 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-[#D4AF37]/50 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-[#D4AF37]/50 pointer-events-none" />

          <div>
            <h3 className="text-sm font-black text-[#D4AF37] uppercase tracking-wider flex items-center gap-2 font-mono">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              Classement Décisionnel des Sites — Besoin d'Attention
            </h3>
            <p className={`text-[11px] ${textMutedClass} font-medium mt-0.5`}>
              Moyenne pondérée des indicateurs de disponibilité, pannes, conformité préventive et charge de travail (trié du plus critique au plus stable)
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b ${borderClass} text-[10px] font-black uppercase tracking-wider ${textMutedClass}`}>
                  <th className="py-2.5 px-3">Site</th>
                  <th className="py-2.5 px-3 text-center">Score Global</th>
                  <th className="py-2.5 px-3 text-right">Disponibilité Flotte</th>
                  <th className="py-2.5 px-3 text-center">Pannes Ouvertes</th>
                  <th className="py-2.5 px-3 text-right">Taux Préventif</th>
                  <th className="py-2.5 px-3 text-right">Charge Mécanicien</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${borderClass} font-semibold ${textTitleClass}`}>
                {classementSites.map((item) => {
                  const score = item.scoreGlobal;
                  let badgeVariant = "bg-red-950/40 text-red-400 border border-red-900/60";
                  if (score !== null) {
                    if (score >= 80) {
                      badgeVariant = "bg-emerald-950/40 text-emerald-400 border border-emerald-900/60";
                    } else if (score >= 60) {
                      badgeVariant = "bg-amber-950/40 text-amber-300 border border-amber-900/60";
                    }
                  }

                  return (
                    <tr key={item.site} className={`${hoverClass} transition-colors`}>
                      <td className="py-3 px-3 font-bold uppercase tracking-wider flex items-center gap-2">
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                          score !== null && score < 60 ? "bg-red-500" : score !== null && score < 80 ? "bg-amber-500" : "bg-emerald-500"
                        }`} />
                        {item.site}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {score !== null ? (
                          <span className={`inline-block text-[11px] font-black uppercase px-2 py-0.5 rounded-full ${badgeVariant}`}>
                            {Math.round(score)}%
                          </span>
                        ) : (
                          <span className={`${textMutedClass} font-mono`}>—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        {item.dispoSite !== null ? (
                          <span className={`${item.dispoSite < 75 ? "text-red-400 font-bold" : item.dispoSite < 90 ? "text-amber-400" : "text-emerald-400 font-bold"}`}>
                            {item.dispoSite.toFixed(1)}%
                          </span>
                        ) : (
                          <span className={textMutedClass}>—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        {item.pannesOuvertesSite !== null ? (
                          <span className={`${item.pannesOuvertesSite > 4 ? "text-red-400 font-black" : item.pannesOuvertesSite > 0 ? "text-amber-400 font-bold" : "text-emerald-400"}`}>
                            {item.pannesOuvertesSite}
                          </span>
                        ) : (
                          <span className={textMutedClass}>—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        {item.complianceSite !== null ? (
                          <span className={`${item.complianceSite < 60 ? "text-red-400 font-bold" : item.complianceSite < 85 ? "text-amber-400" : "text-emerald-400"}`}>
                            {item.complianceSite.toFixed(1)}%
                          </span>
                        ) : (
                          <span className={textMutedClass}>—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        {item.chargeMoyenneSite !== null ? (
                          <span className={`${item.chargeMoyenneSite > 5 ? "text-red-400 font-bold" : item.chargeMoyenneSite > 2 ? "text-amber-400" : "text-emerald-400"}`}>
                            {item.chargeMoyenneSite.toFixed(1)} T/méc
                          </span>
                        ) : (
                          <span className={textMutedClass}>—</span>
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
          <div className={`relative overflow-hidden ${cardBgClass} p-5 rounded-2xl transition-all duration-300 space-y-4`}>
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-600 via-[#D4AF37] to-amber-950" />
            
            {/* L-brackets */}
            <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-[#D4AF37]/35 pointer-events-none" />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-[#D4AF37]/35 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-[#D4AF37]/35 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-[#D4AF37]/35 pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-[#D4AF37] uppercase tracking-wider flex items-center gap-2 font-mono">
                  <span className="h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse" />
                  Évolution Annuelle des Événements
                </h3>
                <p className={`text-[11px] ${textMutedClass} font-medium mt-0.5`}>
                  Superposition des pannes, maintenances préventives et correctives sur 12 mois
                </p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono font-black">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#EF4444]" /> Pannes</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#D4AF37]" /> Préventif</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#8A6623]" /> Correctif</span>
              </div>
            </div>

            <div className="h-[220px] w-full mt-2 font-mono text-[10px]">
              {hasNoAnnualData ? (
                <div className="h-full flex flex-col items-center justify-center border border-dashed border-[#D4AF37]/20 rounded-2xl bg-[#0d121d]/10 dark:bg-[#0d121d]/30 text-center p-4">
                  <AlertTriangle className="h-8 w-8 text-[#D4AF37] mb-2 animate-pulse" />
                  <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider font-mono">Données insuffisantes</p>
                  <p className="text-[10px] text-slate-500 uppercase mt-1">Aucune panne ou tâche de maintenance enregistrée sur les 12 derniers mois.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={evolutionAnnuelleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="goldLineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#A07810" />
                      <stop offset="30%" stopColor="#D4AF37" />
                      <stop offset="70%" stopColor="#FFFDF0" />
                      <stop offset="100%" stopColor="#B8860B" />
                    </linearGradient>
                    <linearGradient id="goldAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4AF37" stopOpacity={isDark ? 0.20 : 0.08} />
                      <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="pannesAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity={0.12} />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="correctifAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8A6623" stopOpacity={0.08} />
                      <stop offset="100%" stopColor="#8A6623" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#D4AF37" : "#8A6623"} strokeOpacity={0.08} />
                  <XAxis dataKey="name" stroke={isDark ? "#A49F8D" : "#78350f"} strokeOpacity={0.6} fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke={isDark ? "#A49F8D" : "#78350f"} strokeOpacity={0.6} fontSize={10} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? "rgba(13, 17, 29, 0.95)" : "rgba(255, 255, 255, 0.98)", 
                      borderRadius: "14px", 
                      border: "2px solid #D4AF37",
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
                    }} 
                    labelClassName={`font-bold font-mono tracking-wider text-xs ${textTitleClass}`}
                  />
                  <Area type="monotone" dataKey="preventif" stroke="url(#goldLineGradient)" strokeWidth={3.5} fill="url(#goldAreaGradient)" activeDot={{ r: 6, fill: "#FFEAA7", stroke: "#805F0D", strokeWidth: 2 }} dot={{ r: 3, fill: "#D4AF37", stroke: "none" }} />
                  <Area type="monotone" dataKey="correctif" stroke="#8A6623" strokeWidth={2} strokeDasharray="4 4" fill="url(#correctifAreaGradient)" activeDot={{ r: 5 }} dot={{ r: 2, fill: "#8A6623", stroke: "none" }} />
                  <Area type="monotone" dataKey="pannes" stroke="#EF4444" strokeWidth={2.5} fill="url(#pannesAreaGradient)" activeDot={{ r: 5 }} dot={{ r: 3, fill: "#EF4444", stroke: "none" }} />
                </AreaChart>
              </ResponsiveContainer>
              )}
            </div>
            <div className={`text-[9px] ${textMutedClass} italic text-right font-mono`}>
              * Données consolidées mensuelles basées sur l'historique de la flotte locale.
            </div>
          </div>

          {/* WIDGET 3 — CONSOMMATION MENSUELLE */}
          <div className={`relative overflow-hidden ${cardBgClass} p-5 rounded-2xl transition-all duration-300 space-y-4`}>
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-600 via-[#D4AF37] to-amber-950" />
            
            {/* L-brackets */}
            <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-[#D4AF37]/35 pointer-events-none" />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-[#D4AF37]/35 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-[#D4AF37]/35 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-[#D4AF37]/35 pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-[#D4AF37] uppercase tracking-wider flex items-center gap-2 font-mono">
                  <span className={`h-2 w-2 rounded-full ${isDark ? "bg-[#A49F8D]" : "bg-amber-600"}`} />
                  Consommation Carburant & Lubrifiants
                </h3>
                <p className={`text-[11px] ${textMutedClass} font-medium mt-0.5`}>
                  Consommation mensuelle par engin principal sur les 6 derniers mois
                </p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono font-black">
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-[#4E412A] border border-[#D4AF37]/40" /> Gazole (Litres)</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-[#D4AF37]" /> Lubrifiants (L)</span>
              </div>
            </div>

            <div className="h-[200px] w-full mt-2 font-mono text-[10px]">
              {hasNoFuelData ? (
                <div className="h-full flex flex-col items-center justify-center border border-dashed border-[#D4AF37]/20 rounded-2xl bg-[#0d121d]/10 dark:bg-[#0d121d]/30 text-center p-4">
                  <Droplets className="h-8 w-8 text-[#D4AF37] mb-2 animate-pulse" />
                  <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider font-mono">Données insuffisantes</p>
                  <p className="text-[10px] text-slate-500 uppercase mt-1">Aucun relevé de consommation carburant ou lubrifiants sur les 6 derniers mois.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={consommationCarburantData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D4AF37" strokeOpacity={0.10} />
                  <XAxis dataKey="name" stroke={isDark ? "#A49F8D" : "#78350f"} strokeOpacity={0.6} fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke={isDark ? "#A49F8D" : "#78350f"} strokeOpacity={0.6} fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#D4AF37" fontSize={10} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? "#0d111d" : "#ffffff", 
                      borderRadius: "12px", 
                      border: "1px solid rgba(212, 175, 55, 0.4)",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                    }} 
                    labelClassName={`font-bold ${textTitleClass}`}
                  />
                  <Bar yAxisId="left" dataKey="carburant" fill="#4E412A" stroke="#D4AF37" strokeOpacity={0.4} radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar yAxisId="right" dataKey="lubrifiants" fill="#D4AF37" radius={[4, 4, 0, 0]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
              )}
            </div>
            <div className={`text-[9px] ${textMutedClass} italic text-right font-mono`}>
              * Consommation normalisée d'après les relevés de cuves et pompes mobiles.
            </div>
          </div>

          {/* WIDGET 7 — CARNET DE SANTÉ RAPIDE */}
          <div className={`relative overflow-hidden ${cardBgClass} p-5 rounded-2xl transition-all duration-300 space-y-4`}>
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#9c1a1a] to-[#D4AF37]" />
            
            {/* L-brackets */}
            <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-[#D4AF37]/35 pointer-events-none" />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-[#D4AF37]/35 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-[#D4AF37]/35 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-[#D4AF37]/35 pointer-events-none" />

            <div>
              <h3 className="text-sm font-black text-[#D4AF37] uppercase tracking-wider flex items-center gap-2 font-mono">
                <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444] animate-pulse" />
                Carnet de Santé — Top 3 des Engins sous haute surveillance
              </h3>
              <p className={`text-[11px] ${textMutedClass} font-medium mt-0.5`}>
                Engins de la flotte locale triés par score de risque calculé d'après leur usure et statut actuel
              </p>
            </div>

            {enginsAtRisk.length === 0 ? (
              <div className={`h-[120px] w-full flex flex-col items-center justify-center border border-dashed border-[#D4AF37]/20 rounded-xl ${bgSubtleClass} p-6 text-center`}>
                <Activity className={`h-6 w-6 ${textMutedClass} mb-2`} />
                <p className={`text-xs font-bold ${textMutedClass}`}>
                  Aucun engin à risque détecté ou données de flotte non initialisées
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                {enginsAtRisk.map((engin) => {
                  const score = engin.riskScore || 0;
                  // Color codes for risk bars
                  let barColor = "bg-[#A49F8D]";
                  let textColor = isDark ? "text-[#A49F8D]" : "text-slate-600";
                  let bgBadge = "bg-[#0d121d] border-[#D4AF37]/20 text-[#FFFDF9]";
                  if (score >= 70) {
                    barColor = "bg-gradient-to-r from-red-600 to-rose-600";
                    textColor = "text-red-400 font-bold";
                    bgBadge = "bg-red-950/40 text-red-400 border border-red-900/40";
                  } else if (score >= 40) {
                    barColor = "bg-gradient-to-r from-[#D4AF37] to-amber-600";
                    textColor = "text-[#D4AF37] font-bold";
                    bgBadge = "bg-amber-950/40 text-amber-300 border border-amber-900/40";
                  }

                  return (
                    <div 
                      key={engin.id} 
                      className={`p-4 rounded-xl border border-[#D4AF37]/15 ${bgSubtle50Class} flex flex-col justify-between space-y-3`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="px-2 py-0.5 rounded border border-[#D4AF37]/30 font-mono text-[10px] font-black bg-[#1E1402] text-[#FFFDF9] uppercase">
                            {engin.matricule || engin.id}
                          </span>
                          <h4 className={`text-[11px] font-bold ${textTitleClass} mt-1.5 truncate`}>
                            {engin.modele || engin.type || "Équipement"}
                          </h4>
                        </div>
                        <span className={`text-[10px] font-black font-mono shrink-0 ${textColor}`}>
                          {score}% Risque
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className={`h-1.5 w-full ${bgSubtle12Class} rounded-full overflow-hidden border ${borderClass}`}>
                          <div className={`h-full ${barColor}`} style={{ width: `${score}%` }} />
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {(engin.riskFactors || []).map((factor: string, i: number) => (
                            <span 
                              key={i} 
                              className={`text-[8.5px] font-black px-1.5 py-0.5 rounded border ${bgBadge} leading-none font-mono`}
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
            <div className={`relative overflow-hidden ${cardBgClass} p-5 rounded-2xl transition-all duration-300 space-y-4`}>
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-600 via-[#D4AF37] to-amber-950" />
              
              {/* L-brackets */}
              <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-[#D4AF37]/35 pointer-events-none" />
              <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-[#D4AF37]/35 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-[#D4AF37]/35 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-[#D4AF37]/35 pointer-events-none" />

              <div>
                <h3 className="text-sm font-black text-[#D4AF37] uppercase tracking-wider flex items-center gap-2 font-mono">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  Engins immobilisés
                </h3>
                <p className={`text-[11px] ${textMutedClass} font-medium mt-0.5`}>
                  Équipements en panne ou en maintenance, triés du plus ancien au plus récent
                </p>
              </div>

              {immobilisesList.length === 0 ? (
                <div className={`flex flex-col items-center justify-center py-6 border border-dashed border-[#D4AF37]/20 rounded-xl ${bgSubtleClass}`}>
                  <span className="text-[10px] font-black text-emerald-400 font-mono uppercase">
                    ✅ Aucun engin immobilisé actuellement
                  </span>
                </div>
              ) : (
                <div className={`divide-y ${borderClass}`}>
                  {immobilisesList.map((e) => {
                    const normStatus = getNormalizedStatus(e);
                    const isPanne = normStatus === "EN_PANNE" || (e.statut && e.statut === "panne");
                    const statusLabel = isPanne ? "Panne" : "Maintenance";
                    const badgeColor = isPanne 
                      ? "bg-red-950/40 text-red-400 border border-red-900/40" 
                      : "bg-amber-950/40 text-amber-300 border border-amber-900/40";

                    return (
                      <div key={e.id} className="py-3 flex justify-between items-center gap-3 first:pt-0 last:pb-0">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-black ${textTitleClass} font-mono uppercase`}>
                              {e.matricule || e.id}
                            </span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${badgeColor} font-mono`}>
                              {statusLabel}
                            </span>
                          </div>
                          <div className={`flex items-center gap-1.5 text-[10px] ${textMutedClass} mt-1`}>
                            <span className="font-semibold">{e.modele || "Modèle inconnu"}</span>
                            <span>•</span>
                            <span className={`font-mono ${bgSubtle12Class} border border-[#D4AF37]/15 ${textTitleClass} px-1.5 py-0.5 rounded text-[9px]`}>
                              {e.siteId || e.site || "—"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-right shrink-0">
                          <div className={`text-[10px] font-mono ${textMutedClass} uppercase`}>Depuis</div>
                          <div className={`text-xs font-bold ${textTitleClass} font-mono mt-0.5 flex items-center justify-end gap-1`}>
                            <Clock className="w-3 h-3 text-[#D4AF37]/80" />
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
          <div className={`relative overflow-hidden ${cardBgClass} p-5 rounded-2xl transition-all duration-300 space-y-4`}>
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-600 via-[#D4AF37] to-amber-950" />
            
            {/* L-brackets */}
            <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-[#D4AF37]/35 pointer-events-none" />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-[#D4AF37]/35 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-[#D4AF37]/35 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-[#D4AF37]/35 pointer-events-none" />

            <div>
              <h3 className="text-sm font-black text-[#D4AF37] uppercase tracking-wider flex items-center gap-2 font-mono">
                <span className="h-2 w-2 rounded-full bg-[#D4AF37]" />
                Backlog des Ordres de Travail
              </h3>
              <p className={`text-[11px] ${textMutedClass} font-medium mt-0.5`}>
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
                <span className={`text-3xl font-black font-mono tracking-tight ${textTitleClass}`}>
                  {totalOpenOTs}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${textMutedClass}`}>
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
                      ? "bg-[#1E1402] border-[#D4AF37] font-black text-[#FFFDF9]"
                      : `${bgSubtle50Class} ${borderClass} ${textMutedClass}`
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="text-[11px] font-mono">{entry.name}</span>
                  </div>
                  <span className={`font-mono font-bold ${selectedSeverity === entry.name ? "text-[#FFFDF9]" : textTitleClass}`}>{entry.value}</span>
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
                  className={`pt-3 border-t ${borderClass} space-y-2 overflow-hidden`}
                >
                  <div className="flex justify-between items-center text-[10px] font-black text-[#D4AF37] uppercase font-mono">
                    <span>OTs {selectedSeverity} :</span>
                    <button onClick={() => setSelectedSeverity(null)} className="text-red-400 hover:underline">Fermer</button>
                  </div>
                  
                  {filteredOTList.length === 0 ? (
                    <p className={`text-[10px] ${textMutedClass} italic font-mono`}>Aucun OT actif de cette catégorie.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {filteredOTList.map((wo) => (
                        <div key={wo.id} className={`p-2 ${bgSubtleClass} border border-[#D4AF37]/15 rounded-lg flex items-center justify-between text-[10px] font-mono`}>
                          <div className="truncate pr-2">
                            <span className={`font-bold ${textTitleClass}`}>{wo.code || `OT-${wo.id?.substring(0,4)}`}</span>
                            <span className={`${textMutedClass} ml-1.5 truncate block`}>{wo.label || wo.problemDescription}</span>
                          </div>
                          <Badge className="bg-amber-950/40 text-amber-300 border border-amber-900/40 text-[8.5px] uppercase shrink-0 font-mono">
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
          <div className={`relative overflow-hidden ${cardBgClass} p-5 rounded-2xl transition-all duration-300 space-y-4`}>
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-600 via-[#D4AF37] to-amber-950" />
            
            {/* L-brackets */}
            <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-[#D4AF37]/35 pointer-events-none" />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-[#D4AF37]/35 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-[#D4AF37]/35 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-[#D4AF37]/35 pointer-events-none" />

            <div>
              <h3 className="text-sm font-black text-[#D4AF37] uppercase tracking-wider flex items-center gap-2 font-mono">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Mécaniciens en Poste aujourd'hui
              </h3>
              <p className={`text-[11px] ${textMutedClass} font-medium mt-0.5`}>
                Équipe technique active, score mensuel de performance et tournées
              </p>
            </div>

            {mecsLoading ? (
              <p className={`text-xs ${textMutedClass} italic font-mono`}>Chargement...</p>
            ) : filteredMecaniciensOfTheDay.length === 0 ? (
              <p className={`text-xs ${textMutedClass} italic font-mono`}>Aucune donnée de présence disponible</p>
            ) : (
              <div className={`divide-y ${borderClass}`}>
                {filteredMecaniciensOfTheDay.map((mech) => {
                  const score = mech.stats?.scoreMensuel;
                  const hasGoodScore = score !== null && score !== undefined ? score >= 85 : false;
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
                        className="h-10 w-10 rounded-full object-cover border border-[#D4AF37]/25 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className={`text-xs font-bold ${textTitleClass} truncate`}>{fullName}</h4>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold ${
                            hasGoodScore
                              ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40"
                              : "bg-red-950/40 text-red-400 border border-red-900/40"
                          }`}>
                            {hasGoodScore ? "✅ Tournée faite" : "🔴 Tournée en retard"}
                          </span>
                        </div>

                        <div className={`flex justify-between text-[10px] ${textMutedClass}`}>
                          <span>{mech.poste || "Technicien"} - Équipe {mech.equipe || "A"}</span>
                          <span className="font-semibold">Dernière int : {formatTimeAgo(mech.stats?.derniereIntervention)}</span>
                        </div>

                        <div className="space-y-0.5">
                          <div className={`flex justify-between text-[8px] font-semibold ${textMutedClass}`}>
                            <span>Score Mensuel</span>
                            <span>{score !== null && score !== undefined ? `${score}%` : "N/A"}</span>
                          </div>
                          {score !== null && score !== undefined && (
                            <Progress 
                              value={score} 
                              className={`h-1 ${bgSubtle12Class} border ${borderClass}`}
                              color={score > 85 ? "bg-[#D4AF37]" : "bg-amber-600"}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* WIDGET 6 — ALERTES LIVE */}
          <div className={`relative overflow-hidden ${cardBgClass} p-5 rounded-2xl transition-all duration-300 space-y-4`}>
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-600 via-[#D4AF37] to-amber-950" />
            
            {/* L-brackets */}
            <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-[#D4AF37]/35 pointer-events-none" />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-[#D4AF37]/35 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-[#D4AF37]/35 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-[#D4AF37]/35 pointer-events-none" />

            <div>
              <h3 className="text-sm font-black text-[#D4AF37] uppercase tracking-wider flex items-center gap-2 font-mono">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                Alertes Live
              </h3>
              <p className={`text-[11px] ${textMutedClass} font-medium mt-0.5`}>
                Les 3 dernières alertes signalées sur les chantiers
              </p>
            </div>

            {lastPannesLive.length === 0 ? (
              <p className={`text-xs ${textMutedClass} italic font-mono`}>Aucune alerte récente</p>
            ) : (
              <div className={`divide-y ${borderClass}`}>
                {lastPannesLive.map((alert) => {
                  const severity = (alert.gravite || alert.severity || "MAJEUR").toUpperCase();
                  const description = alert.typePanne || alert.description || alert.problemDescription || "Panne signalée";
                  const engin = alert.enginId || alert.engin || "Engin";
                  return (
                    <div 
                      key={alert.id}
                      className={`py-3 flex justify-between items-center gap-3 ${hoverClass} transition-colors first:pt-0 last:pb-0`}
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block h-2 w-2 rounded-full ${
                            severity === "CRITIQUE" 
                              ? "bg-red-500" 
                              : severity === "MAJEUR" 
                                ? "bg-amber-500" 
                                : "bg-emerald-500"
                          }`} />
                          <span className={`text-[9px] font-black tracking-wider uppercase font-mono ${
                            severity === "CRITIQUE" 
                              ? "text-red-400" 
                              : severity === "MAJEUR" 
                                ? "text-amber-400" 
                                : "text-emerald-400"
                          }`}>
                            {severity}
                          </span>
                        </div>
                        <h4 className={`text-xs font-bold ${textTitleClass} truncate`}>{engin} - {description}</h4>
                        <p className={`text-[9px] ${textMutedClass} font-mono`}>Site : {alert.siteId || alert.site || "—"}</p>
                      </div>

                      <span className={`text-[10px] font-mono ${textMutedClass} shrink-0`}>
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
