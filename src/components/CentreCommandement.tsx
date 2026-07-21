import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  AlertTriangle, 
  Activity, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Wrench, 
  Clock, 
  ShieldAlert, 
  Gauge, 
  Users, 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown, 
  Sparkles, 
  Building2, 
  Info,
  Sliders,
  CheckSquare,
  DollarSign,
  UserCheck,
  BarChart2,
  RefreshCw,
  X,
  Award,
  Crown,
  Lock,
  Unlock,
  XCircle,
  Radio,
  Network,
  MapPin
} from "lucide-react";
import { 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ReferenceLine
} from "recharts";
import { 
  Card, 
  CardContent,  
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useAuthStore } from "@/lib/store";
import { useCollection } from "@/hooks/useCollection";
import { useMecaniciens } from "@/hooks/useMecaniciens";
import { DataLoadError } from "@/components/shared/DataLoadError";
import { SiteID } from "@/types";
import { getLocalMonthString } from "@/lib/utils";

// @ts-ignore
import goldTexture from "@/assets/images/texture-or.webp";

const SITES_LIST = ["SMI", "OUMEJRANE", "KOUDIA", "OUANSIMI", "BOU-AZZER"];

interface CentreCommandementProps {
  setActiveTab?: (tab: string) => void;
}

export default function CentreCommandement({ setActiveTab }: CentreCommandementProps) {
  const { user, theme, setPendingRcaPrefill } = useAuthStore();
  const isDark = theme === "dark";

  const formatFreshness = (lastUpdateMs: number | null) => {
    if (!lastUpdateMs) return "Aucun signal";
    const now = Date.now();
    const diffMs = now - lastUpdateMs;
    if (diffMs < 0) return "À l'instant";
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays}j`;
  };

  const formatExactDateTime = (ms: number | null) => {
    if (!ms) return "";
    const d = new Date(ms);
    return d.toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // States for tab navigation & performance analysis
  const [activeSiteTab, setActiveSiteTab] = React.useState<string>("ensemble");
  const [analysisGenerated, setAnalysisGenerated] = React.useState<boolean>(false);
  const [siteAnalysis, setSiteAnalysis] = React.useState<string | null>(null);

  // State for site expansion
  const [expandedSite, setExpandedSite] = React.useState<string | null>(null);

  // States for drill-down modals
  const [selectedAnomalySite, setSelectedAnomalySite] = React.useState<string | null>(null);
  const [selectedPieceName, setSelectedPieceName] = React.useState<string | null>(null);
  const [selectedModelName, setSelectedModelName] = React.useState<string | null>(null);

  // State for system alerts expanded groups
  const [expandedAlertGroups, setExpandedAlertGroups] = React.useState<Record<string, boolean>>({});

  const getPanneDateString = (p: any) => {
    if (p.createdAt) {
      if (typeof p.createdAt.toMillis === 'function') {
        return new Date(p.createdAt.toMillis()).toISOString();
      }
      if (typeof p.createdAt === 'string') return p.createdAt;
      if (p.createdAt.seconds) return new Date(p.createdAt.seconds * 1000).toISOString();
    }
    return p.dateDeclaration || p.date || "";
  };

  const getPanneMonth = React.useCallback((p: any) => {
    const dateStr = getPanneDateString(p);
    if (!dateStr) return "";
    return dateStr.substring(0, 7); // "YYYY-MM"
  }, []);

  const getTaskMonth = React.useCallback((t: any) => {
    if (t.datePlanifiee) return t.datePlanifiee.substring(0, 7);
    if (t.createdAt) {
      if (typeof t.createdAt.toMillis === 'function') {
        return getLocalMonthString(new Date(t.createdAt.toMillis()));
      }
      if (typeof t.createdAt === 'string') return t.createdAt.substring(0, 7);
      if (t.createdAt.seconds) return getLocalMonthString(new Date(t.createdAt.seconds * 1000));
    }
    if (t.date) {
      return String(t.date).substring(0, 7);
    }
    return "";
  }, []);

  // Firestore real collections subscriptions
  const { data: enginsLive, loading: enginsLoading, error: enginsError } = useCollection<any>('engins', [], { unlimited: true });
  const { data: workOrdersLive, loading: tasksLoading, error: tasksError } = useCollection<any>('maintenanceTasks', [], { unlimited: true });
  const { data: pannesLive, loading: pannesLoading, error: pannesError } = useCollection<any>('pannes', [], { unlimited: true });
  const { data: interventions, loading: interventionsLoading, error: interventionsError } = useCollection<any>('interventions', [], { unlimited: true });
  const { data: objectifsSitesRaw, loading: objectifsLoading, error: objectifsError } = useCollection<any>('objectifsSites', [], { unlimited: true });
  const { data: pieces, loading: piecesLoading, error: piecesError } = useCollection<any>('pieces', [], { unlimited: true });
  const { data: lotoLocks, loading: lotoLoading, error: lotoError } = useCollection<any>('lotoLocks', [], { unlimited: true });
  const { data: checklistsLive, loading: checklistsLoading, error: checklistsError } = useCollection<any>('checklists', [], { unlimited: true });
  const { data: alertsLive, loading: alertsLoading, error: alertsError } = useCollection<any>('alerts', [], { unlimited: true });

  const hasLoadError = !!(enginsError || tasksError || pannesError || interventionsError || objectifsError || piecesError || lotoError || checklistsError || alertsError);
  
  // Use useMecaniciens for pre-computed rich stats
  const { mecaniciens, loading: mecsLoading } = useMecaniciens();

  const isLoading = enginsLoading || tasksLoading || pannesLoading || interventionsLoading || mecsLoading || objectifsLoading || piecesLoading || lotoLoading || alertsLoading;

  const [lastRefreshTime, setLastRefreshTime] = React.useState<Date>(() => new Date());

  const prevIsLoadingRef = React.useRef(isLoading);
  React.useEffect(() => {
    if (prevIsLoadingRef.current && !isLoading) {
      setLastRefreshTime(new Date());
    }
    prevIsLoadingRef.current = isLoading;
  }, [isLoading]);

  const [moisReference, setMoisReference] = React.useState<string>(() => getLocalMonthString());

  const currentMonthStr = moisReference;

  const prevMonthStr = React.useMemo(() => {
    const [year, month] = currentMonthStr.split('-').map(Number);
    const p = new Date(year, month - 2, 1);
    return getLocalMonthString(p);
  }, [currentMonthStr]);

  const isMoisCourantReel = React.useMemo(() => {
    return moisReference === getLocalMonthString();
  }, [moisReference]);

  const formatMoisLettres = React.useCallback((mStr: string) => {
    const [year, month] = mStr.split('-').map(Number);
    const d = new Date(year, month - 1, 1);
    return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }, []);

  const handlePrevMonth = React.useCallback(() => {
    const [year, month] = moisReference.split('-').map(Number);
    const p = new Date(year, month - 2, 1);
    setMoisReference(getLocalMonthString(p));
  }, [moisReference]);

  const handleNextMonth = React.useCallback(() => {
    const [year, month] = moisReference.split('-').map(Number);
    const n = new Date(year, month, 1);
    const nStr = getLocalMonthString(n);
    const currentRealStr = getLocalMonthString();
    if (nStr <= currentRealStr) {
      setMoisReference(nStr);
    }
  }, [moisReference]);

  // Site metrics calculation for a specific month
  const getSiteDispo = React.useCallback((siteId: string, monthStr: string) => {
    const siteEngins = (enginsLive || []).filter(e => {
      if (e.deleted) return false;
      if (siteId !== "ensemble" && e.siteId !== siteId && e.site !== siteId) return false;
      return true;
    });
    if (siteEngins.length === 0) return null;

    const siteTasksMonth = (workOrdersLive || []).filter(t => {
      if (t.deleted) return false;
      if (siteId !== "ensemble" && t.siteId !== siteId && t.site !== siteId) return false;
      return t.datePlanifiee && t.datePlanifiee.startsWith(monthStr);
    });

    const sitePannesMonth = (pannesLive || []).filter(p => {
      if (p.deleted) return false;
      if (siteId !== "ensemble" && p.siteId !== siteId && p.site !== siteId) return false;
      return p.dateDeclaration && p.dateDeclaration.startsWith(monthStr);
    });

    let totalDispo = 0;
    siteEngins.forEach(e => {
      const enginePannes = sitePannesMonth.filter(p => p.enginId === e.id);
      const engineTasks = siteTasksMonth.filter(t => t.enginId === e.id);
      if (enginePannes.length === 0 && engineTasks.length === 0) {
        totalDispo += 100;
      } else {
        const hasOpenPannes = enginePannes.some(p => p.statut !== 'CLOS');
        const hasOpenTasks = engineTasks.some(t => t.statut === 'NON_FAIT' || t.statut === 'EN_COURS');
        if (hasOpenPannes || hasOpenTasks) {
          totalDispo += 0;
        } else {
          totalDispo += 50;
        }
      }
    });
    return parseFloat((totalDispo / siteEngins.length).toFixed(1));
  }, [enginsLive, workOrdersLive, pannesLive]);

  const getSiteMttr = React.useCallback((siteId: string, monthStr: string) => {
    const sitePannesMonth = (pannesLive || []).filter(p => 
      !p.deleted && 
      (p.siteId === siteId || p.site === siteId) && 
      p.statut === 'CLOS' && 
      p.dateDeclaration && 
      p.dateDeclaration.startsWith(monthStr) &&
      p.datePriseEnCharge && 
      p.dateResolution
    );
    if (sitePannesMonth.length === 0) return null;

    const parseToDate = (field: any): Date | null => {
      if (!field) return null;
      if (typeof field.toMillis === 'function') return new Date(field.toMillis());
      if (field.seconds) return new Date(field.seconds * 1000);
      const d = new Date(field);
      return isNaN(d.getTime()) ? null : d;
    };

    let totalWaitingMs = 0;
    let totalRepairMs = 0;
    let count = 0;

    sitePannesMonth.forEach(p => {
      const dateDecl = parseToDate(p.dateDeclaration);
      const datePrise = parseToDate(p.datePriseEnCharge);
      const dateRes = parseToDate(p.dateResolution);

      if (dateDecl && datePrise && dateRes) {
        const waitingMs = Math.max(0, datePrise.getTime() - dateDecl.getTime());
        const repairMs = Math.max(0, dateRes.getTime() - datePrise.getTime());

        totalWaitingMs += waitingMs;
        totalRepairMs += repairMs;
        count++;
      }
    });

    if (count === 0) return null;

    const avgWaitingHours = parseFloat((totalWaitingMs / (1000 * 60 * 60) / count).toFixed(1));
    const avgRepairHours = parseFloat((totalRepairMs / (1000 * 60 * 60) / count).toFixed(1));
    return parseFloat((avgWaitingHours + avgRepairHours).toFixed(1));
  }, [pannesLive]);

  const getSiteCompliance = React.useCallback((siteId: string, monthStr: string) => {
    const siteWOs = (workOrdersLive || []).filter(b => {
      if (b.deleted) return false;
      if (siteId !== "ensemble" && b.siteId !== siteId && b.site !== siteId) return false;
      return true;
    });
    const preventifMoisTasks = siteWOs.filter(t => t.type === 'PREVENTIF' && t.datePlanifiee && t.datePlanifiee.startsWith(monthStr));
    if (preventifMoisTasks.length === 0) return null;

    const faites = preventifMoisTasks.filter(t => t.statut === 'FAIT' || t.statut === 'VALIDE').length;
    return Math.round((faites / preventifMoisTasks.length) * 100);
  }, [workOrdersLive]);

  const getSiteCout = React.useCallback((siteId: string, monthStr: string) => {
    const siteEngins = (enginsLive || []).filter(e => !e.deleted && (e.siteId === siteId || e.site === siteId));
    if (siteEngins.length === 0) return null;

    const getHoursFromDuree = (duree: string) => {
      if (!duree) return 0;
      const clean = duree.toLowerCase().trim();
      if (clean === '15min') return 0.25;
      if (clean === '30min') return 0.5;
      if (clean === '1h') return 1;
      if (clean === '2h') return 2;
      if (clean === '4h') return 4;
      if (clean === '6h') return 6;
      if (clean === '1j') return 8;
      const num = parseFloat(clean);
      return isNaN(num) ? 0 : num;
    };

    const getTaskCost = (task: any) => {
      if (typeof task.cout === "number") return task.cout;
      if (typeof task.cost === "number") return task.cost;
      if (typeof task.coutTotal === "number") return task.coutTotal;
      
      const hours = getHoursFromDuree(task.dureeEstimee || task.duree || "");
      const laborCost = hours * 250; 
      const partsCount = (task.piecesUtilisees || task.pieces || []).length;
      const partsCost = partsCount * 450; 
      return laborCost + partsCost;
    };

    const getPanneCost = (p: any) => {
      if (typeof p.cout === "number") return p.cout;
      if (typeof p.cost === "number") return p.cost;
      
      const parseToDate = (field: any): Date | null => {
        if (!field) return null;
        if (typeof field.toMillis === 'function') return new Date(field.toMillis());
        if (field.seconds) return new Date(field.seconds * 1000);
        const d = new Date(field);
        return isNaN(d.getTime()) ? null : d;
      };

      let laborHours = 0;
      const dPrise = parseToDate(p.datePriseEnCharge);
      const dRes = parseToDate(p.dateResolution);
      if (dPrise && dRes && dRes > dPrise) {
        laborHours = (dRes.getTime() - dPrise.getTime()) / (1000 * 60 * 60);
      } else {
        laborHours = 2; 
      }
      const laborCost = laborHours * 250;
      const partsCount = (p.pieces || p.piecesConcernees || []).length;
      const partsCost = partsCount * 450;
      return laborCost + partsCost;
    };

    const preventives = (workOrdersLive || []).filter(t => !t.deleted && (t.siteId === siteId || t.site === siteId) && t.type === 'PREVENTIF' && (t.statut === 'FAIT' || t.statut === 'VALIDE') && t.datePlanifiee && t.datePlanifiee.startsWith(monthStr));
    const correctives = (workOrdersLive || []).filter(t => !t.deleted && (t.siteId === siteId || t.site === siteId) && (t.type === 'CORRECTIF' || t.type === 'CURATIF') && (t.statut === 'FAIT' || t.statut === 'VALIDE') && t.datePlanifiee && t.datePlanifiee.startsWith(monthStr));
    const closedPannes = (pannesLive || []).filter(p => !p.deleted && (p.siteId === siteId || p.site === siteId) && p.statut === 'CLOS' && p.dateResolution && p.dateResolution.startsWith(monthStr));
    const interventionsMois = (interventions || []).filter(i => !i.deleted && (i.siteId === siteId || i.site === siteId) && (i.typeIntervention === 'CORRECTIF' || i.type === 'CORRECTIF' || i.type === 'CURATIF') && i.date && i.date.startsWith(monthStr));

    let totalCost = 0;
    preventives.forEach(t => { totalCost += getTaskCost(t); });
    correctives.forEach(t => { totalCost += getTaskCost(t); });
    closedPannes.forEach(p => { totalCost += getPanneCost(p); });
    interventionsMois.forEach(i => { totalCost += getTaskCost(i); });

    const totalHours = siteEngins.length * 160;
    if (totalHours === 0) return null;
    return parseFloat((totalCost / totalHours).toFixed(1));
  }, [enginsLive, workOrdersLive, pannesLive, interventions]);

  const renderMetricWithTarget = React.useCallback((
    val: number | null,
    valPrev: number | null,
    target: number | null,
    lowerIsBetter: boolean,
    unit: string = ""
  ) => {
    if (target === null || target === undefined) {
      return (
        <div className="text-[10px] text-slate-400 font-mono italic">
          Objectif non défini
        </div>
      );
    }

    if (val === null || val === undefined) {
      return (
        <div className="text-[10px] text-slate-400 font-mono italic">
          Sans données (Cible: {target}{unit})
        </div>
      );
    }

    const gap = lowerIsBetter ? (target - val) : (val - target);
    const isSuccess = gap >= 0;

    let trendIcon = null;
    let trendColor = "text-slate-400";

    if (valPrev !== null && valPrev !== undefined) {
      const gapPrev = lowerIsBetter ? (target - valPrev) : (valPrev - target);
      const isReducing = gap > gapPrev;
      const isTrendPositive = isSuccess || isReducing;

      if (isTrendPositive) {
        trendIcon = <TrendingUp className="inline-block h-3 w-3" />;
        trendColor = "text-emerald-500";
      } else {
        trendIcon = <TrendingDown className="inline-block h-3 w-3" />;
        trendColor = "text-red-500";
      }
    } else {
      if (isSuccess) {
        trendIcon = <TrendingUp className="inline-block h-3 w-3" />;
        trendColor = "text-emerald-500";
      } else {
        trendIcon = <TrendingDown className="inline-block h-3 w-3" />;
        trendColor = "text-red-500";
      }
    }

    return (
      <div className="flex flex-col items-center justify-center space-y-0.5">
        <div className="font-mono text-xs font-black text-slate-800">
          {val.toFixed(1)}{unit}
        </div>
        <div className="flex items-center gap-1 text-[9px] font-mono font-medium text-slate-500">
          <span>Cible: {target}{unit}</span>
          <span className={`font-bold ${isSuccess ? 'text-emerald-600' : 'text-red-600'}`}>
            ({isSuccess ? '+' : ''}{gap.toFixed(1)}{unit})
          </span>
          <span className={trendColor} title={valPrev !== null ? `Précédent: ${valPrev.toFixed(1)}${unit}` : ""}>
            {trendIcon}
          </span>
        </div>
      </div>
    );
  }, []);

  // Prolonged target drop alert memo
  const prolongedAlertSites = React.useMemo(() => {
    if (!objectifsSitesRaw || !enginsLive || !workOrdersLive || !pannesLive) return [];

    const m0 = currentMonthStr;
    
    const getPrevMonth = (mStr: string) => {
      const [y, m] = mStr.split('-').map(Number);
      const d = new Date(y, m - 2, 1);
      return getLocalMonthString(d);
    };
    const m1 = getPrevMonth(m0);
    const m2 = getPrevMonth(m1);

    return SITES_LIST.map(siteId => {
      const tgt = (objectifsSitesRaw || []).find((o: any) => o.id === siteId);
      if (!tgt || tgt.dispoTarget === null || tgt.dispoTarget === undefined) return null;

      const dispo0 = getSiteDispo(siteId, m0);
      const dispo1 = getSiteDispo(siteId, m1);
      const dispo2 = getSiteDispo(siteId, m2);

      const isUnder0 = dispo0 !== null && dispo0 < tgt.dispoTarget;
      const isUnder1 = dispo1 !== null && dispo1 < tgt.dispoTarget;
      const isUnder2 = dispo2 !== null && dispo2 < tgt.dispoTarget;

      if (isUnder0 && isUnder1 && isUnder2) {
        return {
          siteId,
          dispoTarget: tgt.dispoTarget,
          dispo0,
          dispo1,
          dispo2,
          m0,
          m1,
          m2
        };
      }
      return null;
    }).filter(Boolean) as Array<{
      siteId: string;
      dispoTarget: number;
      dispo0: number;
      dispo1: number;
      dispo2: number;
      m0: string;
      m1: string;
      m2: string;
    }>;
  }, [objectifsSitesRaw, enginsLive, workOrdersLive, pannesLive, getSiteDispo, currentMonthStr]);

  const sitePannesForMonth = React.useMemo(() => {
    if (!selectedAnomalySite || !pannesLive) return [];
    return pannesLive.filter(p => 
      !p.deleted && 
      (p.siteId === selectedAnomalySite || p.site === selectedAnomalySite) && 
      getPanneMonth(p) === currentMonthStr
    );
  }, [selectedAnomalySite, pannesLive, getPanneMonth, currentMonthStr]);

  const groupingSentence = React.useMemo(() => {
    if (sitePannesForMonth.length < 3) return null;
    const total = sitePannesForMonth.length;
    const counts: Record<string, { count: number; cat: string; engType: string }> = {};
    
    sitePannesForMonth.forEach(p => {
      const cat = p.categorie || "Inconnue";
      const engin = (enginsLive || []).find(e => e.id === p.enginId);
      const engType = (engin?.type || engin?.modele || "Inconnu").trim();
      const key = `${cat}::${engType}`;
      if (!counts[key]) {
        counts[key] = { count: 0, cat, engType };
      }
      counts[key].count++;
    });

    const sorted = Object.values(counts).sort((a, b) => b.count - a.count);
    if (sorted.length === 0) return null;

    const first = sorted[0];
    if (first.count < 2 || first.count / total < 0.3) {
      return null;
    }

    const second = sorted[1];
    if (second && second.count >= 2 && (second.count / total >= 0.25)) {
      return `${first.count} des ${total} pannes sont de catégorie "${first.cat}" sur des engins de type "${first.engType}", et ${second.count} de catégorie "${second.cat}" sur des engins de type "${second.engType}".`;
    }

    return `${first.count} des ${total} pannes sont de catégorie "${first.cat}" sur des engins de type "${first.engType}".`;
  }, [sitePannesForMonth, enginsLive]);

  const interventionsForPiece = React.useMemo(() => {
    if (!selectedPieceName || !interventions) return [];
    return interventions.filter(i => {
      if (i.deleted) return false;
      const pieces = i.piecesUtilisees || [];
      const matchesPiece = pieces.some((p: string) => p && p.trim().toLowerCase() === selectedPieceName.toLowerCase());
      return matchesPiece && getTaskMonth(i) === currentMonthStr;
    });
  }, [selectedPieceName, interventions, getTaskMonth, currentMonthStr]);

  const enginsOfSelectedModel = React.useMemo(() => {
    if (!selectedModelName || !enginsLive || !pannesLive) return [];
    const limit90 = Date.now() - (90 * 24 * 60 * 60 * 1000);
    const closedPannes90 = pannesLive.filter(p => 
      p.statut === 'CLOS' && 
      !p.deleted &&
      p.dateDeclaration && 
      new Date(p.dateDeclaration).getTime() >= limit90
    );

    const modelEngins = enginsLive.filter(e => 
      !e.deleted && 
      (e.type || e.modele || 'Inconnu').trim() === selectedModelName
    );

    return modelEngins.map(e => {
      const pannesCount = closedPannes90.filter(p => p.enginId === e.id).length;
      return {
        id: e.id,
        matricule: e.matricule || e.nom || "Inconnu",
        site: e.siteId || e.site || "Inconnu",
        pannesCount
      };
    }).sort((a, b) => b.pannesCount - a.pannesCount);
  }, [selectedModelName, enginsLive, pannesLive]);

  const handleInvestigateRCA = React.useCallback((p: any) => {
    if (setPendingRcaPrefill) {
      setPendingRcaPrefill({
        enginId: p.enginId || "",
        categorie: p.categorie || "Panne",
        pannesIds: [p.id]
      });
      if (setActiveTab) {
        setActiveTab("rca");
      }
    }
  }, [setPendingRcaPrefill, setActiveTab]);

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

  const getPanneCloseMonth = React.useCallback((p: any) => {
    const getMs = (val: any) => {
      if (!val) return null;
      if (typeof val.toMillis === 'function') return val.toMillis();
      if (typeof val.seconds === 'number') return val.seconds * 1000;
      const d = new Date(val).getTime();
      return isNaN(d) ? null : d;
    };
    const closedMs = getMs(p.updatedAt || p.dateResolution || p.dateCloture || p.dateClotureEcheance);
    if (!closedMs) return "";
    return getLocalMonthString(new Date(closedMs));
  }, []);

  // 1. Classement des sites (Exactly like Dashboard.tsx)
  const classementSites = React.useMemo(() => {
    const currentMonthStr = moisReference;

    const list = SITES_LIST.map(site => {
      // dispoSite
      const siteEngins = enginsLive ? enginsLive.filter(e => e.siteId === site || e.site === site) : [];
      const dispoEnginsCount = siteEngins.filter(e => getNormalizedStatus(e) === "DISPONIBLE").length;
      const dispoSite = siteEngins.length > 0 ? (dispoEnginsCount / siteEngins.length) * 100 : null;

      // pannesOuvertesSite
      const sitePannes = pannesLive ? pannesLive.filter(p => p.siteId === site || p.site === site) : [];
      const pannesOuvertesSite = sitePannes.filter(p => p.statut !== "CLOS" && !p.deleted).length;
      const notePannes = Math.max(0, 100 - (pannesOuvertesSite * (100 / 8)));

      // complianceSite
      const siteWOs = workOrdersLive ? workOrdersLive.filter(b => (b.siteId === site || b.site === site) && b.deleted !== true) : [];
      const preventifMoisTasks = siteWOs.filter(t => t.type === 'PREVENTIF' && t.datePlanifiee && t.datePlanifiee.startsWith(currentMonthStr));
      const complianceSite = preventifMoisTasks.length > 0
        ? (preventifMoisTasks.filter(t => t.statut === 'FAIT' || t.statut === 'VALIDE').length / preventifMoisTasks.length) * 100
        : null;

      // chargeMoyenneSite
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

      // Reliability indicators
      const sitePannesCeMois = pannesLive ? pannesLive.filter(p => (p.siteId === site || p.site === site) && !p.deleted && getPanneMonth(p) === currentMonthStr) : [];
      const siteWOsCeMois = workOrdersLive ? workOrdersLive.filter(b => (b.siteId === site || b.site === site) && !b.deleted && getTaskMonth(b) === currentMonthStr) : [];
      const totalSamples = sitePannesCeMois.length + siteWOsCeMois.length;
      const isEchantillonFaible = totalSamples < 5;

      // Compute open BTs count and their average age (in days)
      const openWOsForAge = siteWOs.filter(t => !t.deleted && (t.statut === 'NON_FAIT' || t.statut === 'EN_COURS'));
      const openWOsCount = openWOsForAge.length;

      let totalAgeDays = 0;
      let countWithAge = 0;
      const nowMs = Date.now();
      
      openWOsForAge.forEach(t => {
        let createdMs = null;
        if (t.createdAt) {
          if (typeof t.createdAt.toMillis === 'function') createdMs = t.createdAt.toMillis();
          else if (typeof t.createdAt.seconds === 'number') createdMs = t.createdAt.seconds * 1000;
          else {
            const d = new Date(t.createdAt).getTime();
            if (!isNaN(d)) createdMs = d;
          }
        } else if (t.creationDate) {
          const d = new Date(t.creationDate).getTime();
          if (!isNaN(d)) createdMs = d;
        } else if (t.datePlanifiee) {
          const d = new Date(t.datePlanifiee).getTime();
          if (!isNaN(d)) createdMs = d;
        }

        if (createdMs) {
          const ageDays = (nowMs - createdMs) / (1000 * 60 * 60 * 24);
          totalAgeDays += Math.max(0, ageDays);
          countWithAge++;
        }
      });
      const avgAgeDays = countWithAge > 0 ? (totalAgeDays / countWithAge) : 0;

      // Real freshness signal per site: the most recent updatedAt/createdAt among engins/pannes/maintenanceTasks
      let maxMs = 0;
      const getUpdateMs = (item: any) => {
        if (!item) return null;
        const val = item.updatedAt || item.createdAt || item.dateResolution || item.reportedDate || item.creationDate || item.datePlanifiee;
        if (!val) return null;
        if (typeof val.toMillis === 'function') return val.toMillis();
        if (typeof val.seconds === 'number') return val.seconds * 1000;
        const d = new Date(val).getTime();
        return isNaN(d) ? null : d;
      };

      const checkItem = (item: any) => {
        const ms = getUpdateMs(item);
        if (ms && ms > maxMs) {
          maxMs = ms;
        }
      };

      siteEngins.forEach(checkItem);
      sitePannes.forEach(checkItem);
      siteWOs.forEach(checkItem);

      const lastUpdateMs = maxMs > 0 ? maxMs : null;

      return {
        site,
        dispoSite,
        pannesOuvertesSite,
        complianceSite,
        chargeMoyenneSite,
        scoreGlobal,
        isEchantillonFaible,
        siteEnginsCount: siteEngins.length,
        siteMecasCount: siteMecas.length,
        dataInsuffisante: scoreGlobal === null,
        openWOsCount,
        avgAgeDays,
        lastUpdateMs
      };
    });

    // Separate active sites with performance scores vs those with insufficient data
    const valids = list.filter(s => s.scoreGlobal !== null).sort((a, b) => a.scoreGlobal! - b.scoreGlobal!);
    const nulls = list.filter(s => s.scoreGlobal === null);

    return [...valids, ...nulls];
  }, [enginsLive, workOrdersLive, pannesLive, mecaniciens, getNormalizedStatus, getPanneMonth, getTaskMonth, moisReference]);

  const recentActivitiesList = React.useMemo(() => {
    const list: Array<{
      id: string;
      type: "panne" | "task_cloture" | "loto_pose" | "loto_levee" | "checklist_ko";
      title: string;
      description: string;
      timestamp: number;
      site: string;
    }> = [];

    const getMs = (item: any) => {
      if (!item) return 0;
      const val = item.updatedAt || item.createdAt || item.dateResolution || item.reportedDate || item.creationDate || item.datePlanifiee || item.date || item.timestamp;
      if (!val) return 0;
      if (typeof val.toMillis === 'function') return val.toMillis();
      if (typeof val.seconds === 'number') return val.seconds * 1000;
      const d = new Date(val).getTime();
      return isNaN(d) ? 0 : d;
    };

    // 1. Process pannes (creation)
    if (pannesLive) {
      const sortedPannes = [...pannesLive]
        .filter((p: any) => !p.deleted)
        .map((p: any) => {
          const rawDate = p.reportedDate || p.dateDeclaration || p.creationDate || p.createdAt || p.timestamp;
          return { p, ms: getMs(rawDate) };
        })
        .filter(item => item.ms > 0)
        .sort((a, b) => b.ms - a.ms)
        .slice(0, 30); // secure limit for merge

      sortedPannes.forEach(({ p, ms }) => {
        list.push({
          id: `panne-${p.id || p.uid || ms}`,
          type: "panne",
          title: `Panne : ${p.organ || p.titre || "Inconnu"}`,
          description: `Machine ${p.matricule || p.enginId || "N/A"} (${p.criticite || "N/A"}) - Signalé par : ${p.declarant || p.rapporteur || "Opérateur"}`,
          timestamp: ms,
          site: p.siteId || p.site || "SMI",
        });
      });
    }

    // 2. Process work orders (tasks closure)
    if (workOrdersLive) {
      const closedTasks = [...workOrdersLive]
        .filter((t: any) => !t.deleted && ["FAIT", "VALIDE", "CLOS"].includes(t.statut))
        .map((t: any) => {
          const rawDate = t.updatedAt || t.dateResolution || t.dateRealisation || t.datePlanifiee || t.createdAt;
          return { t, ms: getMs(rawDate) };
        })
        .filter(item => item.ms > 0)
        .sort((a, b) => b.ms - a.ms)
        .slice(0, 30); // secure limit for merge

      closedTasks.forEach(({ t, ms }) => {
        list.push({
          id: `task-cloture-${t.id || t.uid || ms}`,
          type: "task_cloture",
          title: `BT Clôturé : ${t.titre || t.type || "Tâche"}`,
          description: `Pour ${t.enginId || t.matricule || "Machine"} (${t.type || "PREVENTIF"}) - Clôturé par : ${t.mecanicienNom || "Mécanicien"}`,
          timestamp: ms,
          site: t.siteId || t.site || "SMI",
        });
      });
    }

    // 3. Process lotoLocks (pose/levée)
    if (lotoLocks) {
      const validLocks = [...lotoLocks].filter((lock: any) => !lock.deleted);
      
      validLocks.forEach((lock: any) => {
        // Lock pose (activation)
        if (lock.lotoStartedAt) {
          const msPose = getMs(lock.lotoStartedAt);
          if (msPose > 0) {
            list.push({
              id: `loto-pose-${lock.id || msPose}`,
              type: "loto_pose",
              title: `🔐 Consignation LOTO`,
              description: `Machine ${lock.machineCode || "N/A"} consignée par ${lock.lotoOwner || "N/A"} - ${lock.lotoDetails || "HSE requis"}`,
              timestamp: msPose,
              site: lock.siteId || "SMI",
            });
          }
        }
        
        // Lock levée (release)
        if (lock.lotoReleasedAt) {
          const msLevee = getMs(lock.lotoReleasedAt);
          if (msLevee > 0) {
            list.push({
              id: `loto-levee-${lock.id || msLevee}`,
              type: "loto_levee",
              title: `🔓 Déconsignation LOTO`,
              description: `Levée de consignation machine ${lock.machineCode || "N/A"} — ${lock.lotoDetails || "Prêt pour service"}`,
              timestamp: msLevee,
              site: lock.siteId || "SMI",
            });
          }
        }
      });
    }

    // 4. Process checklists (échec critique KO on critical items)
    const criticalItemIds = new Set([
      "C_A3", "C_B1", "C_B2", "C_B3", "C_C1", "C_C2", "C_C3", "C_E3", 
      "M_C3", "M_C4", "M_D1", "M_D2", "M_F2", 
      "S_A1", "S_A2", "S_A3", "S_A4", "S_B3", "S_C1", "S_C2"
    ]);

    if (checklistsLive) {
      const failedChecklists = [...checklistsLive]
        .filter((c: any) => {
          if (c.deleted || !c.items) return false;
          return Object.entries(c.items).some(([itemId, status]) => 
            status === "KO" && criticalItemIds.has(itemId)
          );
        })
        .map((c: any) => {
          const rawDate = c.timestamp || c.createdAt || (c.date ? `${c.date}T${c.heure || "00:00"}` : null);
          return { c, ms: getMs(rawDate) };
        })
        .filter(item => item.ms > 0)
        .sort((a, b) => b.ms - a.ms)
        .slice(0, 30); // secure limit for merge

      failedChecklists.forEach(({ c, ms }) => {
        list.push({
          id: `checklist-failed-${c.id || c.uid || ms}`,
          type: "checklist_ko",
          title: `🛑 Échec Critique d'Inspection`,
          description: `Machine ${c.enginId || "N/A"} (${c.enginModele || ""}) — Inspecteur : ${c.signataire || "N/A"} — Type : ${c.type || "Inspection"}`,
          timestamp: ms,
          site: c.siteId || "SMI",
        });
      });
    }

    // Sort the combined list by timestamp descending and take the top 20
    return list.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
  }, [pannesLive, workOrdersLive, lotoLocks, checklistsLive]);

  // 2. Situation banner computed text
  const situationBanner = React.useMemo(() => {
    if (isLoading || classementSites.length === 0) return "Chargement des indicateurs clés...";

    const stableCount = classementSites.filter(s => s.scoreGlobal !== null && s.scoreGlobal >= 80).length;
    const vigilanceCount = classementSites.filter(s => s.scoreGlobal !== null && s.scoreGlobal >= 60 && s.scoreGlobal < 80).length;
    const critiqueCount = classementSites.filter(s => s.scoreGlobal !== null && s.scoreGlobal < 60).length;
    const donneesInsuffisantesCount = classementSites.filter(s => s.scoreGlobal === null).length;
    const sitesInsuffisantsNoms = classementSites.filter(s => s.scoreGlobal === null).map(s => s.site).join(", ");

    // Most in difficulty site (lowest valid score)
    const worstSite = classementSites.find(s => s.scoreGlobal !== null);
    const hasUnstableSites = vigilanceCount > 0 || critiqueCount > 0;

    // Monthly panne counts
    const currentMonthStr = moisReference;
    const prevMonthStr = (() => {
      const [year, month] = currentMonthStr.split('-').map(Number);
      const p = new Date(year, month - 2, 1);
      return getLocalMonthString(p);
    })();

    const currentMonthPannesCount = pannesLive ? pannesLive.filter(p => !p.deleted && getPanneMonth(p) === currentMonthStr).length : 0;
    const prevMonthPannesCount = pannesLive ? pannesLive.filter(p => !p.deleted && getPanneMonth(p) === prevMonthStr).length : 0;

    let variationSegment = "";
    if (prevMonthPannesCount > 0) {
      const diff = currentMonthPannesCount - prevMonthPannesCount;
      const pct = Math.round((diff / prevMonthPannesCount) * 100);
      if (pct > 0) {
        variationSegment = ` — pannes en hausse de ${pct}% vs le mois dernier.`;
      } else if (pct < 0) {
        variationSegment = ` — pannes en baisse de ${Math.abs(pct)}% vs le mois dernier.`;
      } else {
        variationSegment = ` — volume de pannes stable vs le mois dernier.`;
      }
    }

    if (hasUnstableSites && worstSite) {
      const siteNoun = worstSite.site;
      const totalProblems = critiqueCount + vigilanceCount;
      const baseText = `${stableCount} site(s) stable(s), ${siteNoun} nécessite une attention immédiate (${totalProblems} site(s) sous surveillance)${variationSegment}`;
      if (donneesInsuffisantesCount > 0) {
        return `${baseText}. Attention : ${donneesInsuffisantesCount} site(s) sans données exploitables ce mois-ci (${sitesInsuffisantsNoms}) — vérification recommandée.`;
      }
      return baseText;
    } else {
      if (donneesInsuffisantesCount > 0) {
        return `${stableCount} site(s) stable(s), mais ${donneesInsuffisantesCount} site(s) sans données exploitables ce mois-ci (${sitesInsuffisantsNoms}) — vérification recommandée.${variationSegment}`;
      }
      return `Tous les sites sont actuellement stables et opérationnels (${stableCount} sites au vert)${variationSegment}. Excellent niveau global d'exploitation.`;
    }
  }, [classementSites, pannesLive, getPanneMonth, isLoading, moisReference]);

  // 3. 7-day open pannes history checker helper
  const getPannesOpen7DaysAgoCount = React.useCallback((siteId: string) => {
    if (!pannesLive) return 0;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoMs = sevenDaysAgo.getTime();

    const getMs = (val: any) => {
      if (!val) return 0;
      if (typeof val.toMillis === 'function') return val.toMillis();
      if (typeof val.seconds === 'number') return val.seconds * 1000;
      const d = new Date(val).getTime();
      return isNaN(d) ? 0 : d;
    };

    const sitePannes = pannesLive.filter(p => p.siteId === siteId || p.site === siteId);
    
    const open7DaysAgo = sitePannes.filter(p => {
      const createdMs = getMs(p.createdAt || p.dateDeclaration || p.date);
      if (!createdMs || createdMs > sevenDaysAgoMs) return false;

      const isClosed = p.statut === "CLOS";
      if (!isClosed) return true;

      const closedMs = getMs(p.updatedAt || p.dateResolution || p.dateCloture || p.dateClotureEcheance);
      return closedMs > sevenDaysAgoMs;
    });

    return open7DaysAgo.length;
  }, [pannesLive]);

  // 4. Immobilises list (sorted oldest to youngest)
  const immobilisesList = React.useMemo(() => {
    if (!enginsLive) return [];
    
    const immob = enginsLive.filter(e => {
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
  }, [enginsLive, getNormalizedStatus]);

  // --- COMPILATION & CALCULATIONS FOR COMPLETED MONTHS ---

  const getMonthlyStats = React.useCallback((monthStr: string) => {
    const getMs = (val: any) => {
      if (!val) return null;
      if (typeof val.toMillis === 'function') return val.toMillis();
      if (typeof val.seconds === 'number') return val.seconds * 1000;
      const d = new Date(val).getTime();
      return isNaN(d) ? null : d;
    };

    const getHoursFromDuree = (duree: string): number => {
      if (!duree) return 0;
      const clean = duree.toLowerCase().trim();
      if (clean === '15min') return 0.25;
      if (clean === '30min') return 0.5;
      if (clean === '1h') return 1;
      if (clean === '2h') return 2;
      if (clean === '4h') return 4;
      if (clean === '6h') return 6;
      if (clean === '1j') return 8;
      
      const num = parseFloat(clean);
      if (!isNaN(num)) return num;
      return 0;
    };

    const getTaskCost = (task: any) => {
      if (typeof task.cout === "number") return task.cout;
      if (typeof task.cost === "number") return task.cost;
      if (typeof task.coutTotal === "number") return task.coutTotal;
      
      const hours = getHoursFromDuree(task.dureeEstimee || task.duree || "");
      const laborCost = hours * 250; 
      const partsCount = (task.piecesUtilisees || task.pieces || []).length;
      const partsCost = partsCount * 450; 
      return laborCost + partsCost;
    };

    const getPanneCost = (p: any) => {
      if (typeof p.cout === "number") return p.cout;
      if (typeof p.cost === "number") return p.cost;
      
      let laborHours = 0;
      const dPrise = p.datePriseEnCharge ? getMs(p.datePriseEnCharge) : null;
      const dRes = p.dateResolution ? getMs(p.dateResolution) : null;
      if (dPrise && dRes && dRes > dPrise) {
        laborHours = (dRes - dPrise) / (1000 * 60 * 60);
      } else {
        laborHours = 2; 
      }
      const laborCost = laborHours * 250;
      const partsCount = (p.pieces || p.piecesConcernees || []).length;
      const partsCost = partsCount * 450;
      return laborCost + partsCost;
    };

    // 1. Total pannes
    const pannesMonth = pannesLive 
      ? pannesLive.filter(p => !p.deleted && getPanneMonth(p) === monthStr)
      : [];
    const totalPannes = pannesMonth.length;

    // 2. Interventions préventives réalisées
    const preventives = workOrdersLive
      ? workOrdersLive.filter(t => !t.deleted && t.type === 'PREVENTIF' && (t.statut === 'FAIT' || t.statut === 'VALIDE') && getTaskMonth(t) === monthStr)
      : [];
    const totalPreventives = preventives.length;

    // 3. Interventions correctives réalisées
    const correctives = workOrdersLive
      ? workOrdersLive.filter(t => !t.deleted && (t.type === 'CORRECTIF' || t.type === 'CURATIF') && (t.statut === 'FAIT' || t.statut === 'VALIDE') && getTaskMonth(t) === monthStr)
      : [];
    const closedPannes = pannesLive
      ? pannesLive.filter(p => !p.deleted && p.statut === 'CLOS' && getPanneCloseMonth(p) === monthStr)
      : [];
    const interventionsMonth = interventions 
      ? interventions.filter(i => !i.deleted && (i.type === 'CORRECTIF' || i.type === 'CURATIF') && getTaskMonth(i) === monthStr)
      : [];
    const totalCorrectives = correctives.length + closedPannes.length + interventionsMonth.length;

    // 4. Coût total
    let totalCost = 0;
    preventives.forEach(t => { totalCost += getTaskCost(t); });
    correctives.forEach(t => { totalCost += getTaskCost(t); });
    closedPannes.forEach(p => { totalCost += getPanneCost(p); });
    interventionsMonth.forEach(i => { totalCost += getTaskCost(i); });

    return {
      totalPannes,
      totalPreventives,
      totalCorrectives,
      totalCost,
      totalEvents: totalPannes + totalPreventives + totalCorrectives
    };
  }, [pannesLive, workOrdersLive, interventions, getPanneMonth, getTaskMonth, getPanneCloseMonth]);

  const comparisonData = React.useMemo(() => {
    const currentMonthStr = moisReference;
    
    const prevMonthStr = (() => {
      const [year, month] = currentMonthStr.split('-').map(Number);
      const p = new Date(year, month - 2, 1);
      return getLocalMonthString(p);
    })();

    const m0 = getMonthlyStats(currentMonthStr);
    const m1 = getMonthlyStats(prevMonthStr);

    const hasHistory = m1.totalEvents > 0;

    const calculateVariation = (v0: number, v1: number) => {
      if (!hasHistory || v1 === 0) return null;
      return Math.round(((v0 - v1) / v1) * 100);
    };

    return {
      hasHistory,
      current: m0,
      previous: m1,
      pannesVar: calculateVariation(m0.totalPannes, m1.totalPannes),
      preventivesVar: calculateVariation(m0.totalPreventives, m1.totalPreventives),
      correctivesVar: calculateVariation(m0.totalCorrectives, m1.totalCorrectives),
      costVar: calculateVariation(m0.totalCost, m1.totalCost),
    };
  }, [getMonthlyStats, moisReference]);

  // MTTR calculation per site
  const calculateSiteMttr = React.useCallback((site: string) => {
    if (!pannesLive) return null;
    
    const sitePannes = pannesLive.filter(p => 
      (p.siteId === site || p.site === site) && 
      p.deleted !== true && 
      p.statut === 'CLOS' && 
      p.datePriseEnCharge && 
      p.dateResolution
    );

    if (sitePannes.length === 0) return null;

    const parseToDate = (field: any): Date | null => {
      if (!field) return null;
      if (typeof field.toMillis === 'function') {
        return new Date(field.toMillis());
      }
      if (field.seconds) {
        return new Date(field.seconds * 1000);
      }
      const d = new Date(field);
      return isNaN(d.getTime()) ? null : d;
    };

    let totalWaitingMs = 0;
    let totalRepairMs = 0;
    let count = 0;

    sitePannes.forEach(p => {
      const dateDecl = parseToDate(p.dateDeclaration);
      const datePrise = parseToDate(p.datePriseEnCharge);
      const dateRes = parseToDate(p.dateResolution);

      if (dateDecl && datePrise && dateRes) {
        const waitingMs = Math.max(0, datePrise.getTime() - dateDecl.getTime());
        const repairMs = Math.max(0, dateRes.getTime() - datePrise.getTime());

        totalWaitingMs += waitingMs;
        totalRepairMs += repairMs;
        count++;
      }
    });

    if (count === 0) return null;

    const avgWaitingHours = parseFloat((totalWaitingMs / (1000 * 60 * 60) / count).toFixed(1));
    const avgRepairHours = parseFloat((totalRepairMs / (1000 * 60 * 60) / count).toFixed(1));
    const totalMttrHours = parseFloat((avgWaitingHours + avgRepairHours).toFixed(1));

    return totalMttrHours;
  }, [pannesLive]);

  // Inter-sites side-by-side comparison matrix data
  const compareInterSites = React.useMemo(() => {
    const sitesData = SITES_LIST.map(site => {
      const match = classementSites.find(s => s.site === site);
      const dispo = match ? match.dispoSite : null;
      const mttrVal = calculateSiteMttr(site);
      const pannesOuvertes = match ? match.pannesOuvertesSite : 0;
      const compliance = match ? match.complianceSite : null;
      const charge = match ? match.chargeMoyenneSite : null;
      const coutVal = getSiteCout(site, currentMonthStr);

      return {
        site,
        dispo,
        mttr: mttrVal,
        pannesOuvertes,
        compliance,
        charge,
        cout: coutVal
      };
    });

    const getExtreme = (metric: 'dispo' | 'mttr' | 'pannesOuvertes' | 'compliance' | 'charge' | 'cout', type: 'best' | 'worst') => {
      const validValues = sitesData
        .map(s => s[metric])
        .filter((v): v is number => v !== null && v !== undefined);

      if (validValues.length === 0) return null;

      if (metric === 'dispo' || metric === 'compliance') {
        const extremeVal = type === 'best' ? Math.max(...validValues) : Math.min(...validValues);
        return extremeVal;
      } else {
        const extremeVal = type === 'best' ? Math.min(...validValues) : Math.max(...validValues);
        return extremeVal;
      }
    };

    const extremes = {
      dispo: { best: getExtreme('dispo', 'best'), worst: getExtreme('dispo', 'worst') },
      mttr: { best: getExtreme('mttr', 'best'), worst: getExtreme('mttr', 'worst') },
      pannesOuvertes: { best: getExtreme('pannesOuvertes', 'best'), worst: getExtreme('pannesOuvertes', 'worst') },
      compliance: { best: getExtreme('compliance', 'best'), worst: getExtreme('compliance', 'worst') },
      charge: { best: getExtreme('charge', 'best'), worst: getExtreme('charge', 'worst') },
      cout: { best: getExtreme('cout', 'best'), worst: getExtreme('cout', 'worst') }
    };

    return {
      sitesData,
      extremes
    };
  }, [classementSites, calculateSiteMttr, getSiteCout, currentMonthStr]);

  // 3-month history existence checker
  const hasEnoughHistory = React.useMemo(() => {
    if (!pannesLive || pannesLive.length === 0) return false;
    let oldestMs = Date.now();
    const getMs = (val: any) => {
      if (!val) return null;
      if (typeof val.toMillis === 'function') return val.toMillis();
      if (typeof val.seconds === 'number') return val.seconds * 1000;
      const d = new Date(val).getTime();
      return isNaN(d) ? null : d;
    };
    pannesLive.forEach(p => {
      const ms = getMs(p.createdAt || p.dateDeclaration || p.date);
      if (ms && ms < oldestMs) oldestMs = ms;
    });
    if (workOrdersLive) {
      workOrdersLive.forEach(t => {
        const ms = getMs(t.createdAt);
        if (ms && ms < oldestMs) oldestMs = ms;
      });
    }
    const ageDays = (Date.now() - oldestMs) / (1000 * 60 * 60 * 24);
    return ageDays >= 90; 
  }, [pannesLive, workOrdersLive]);

  // Automatic anomaly detection (preceding 3 months vs current month)
  const getPrecedingMonths = (baseMonthStr: string) => {
    const [year, month] = baseMonthStr.split('-').map(Number);
    const months: string[] = [];
    for (let i = 1; i <= 3; i++) {
      const d = new Date(year, month - 1 - i, 1);
      months.push(getLocalMonthString(d));
    }
    return months;
  };

  const anomaliesDetection = React.useMemo(() => {
    if (!hasEnoughHistory) {
      return {
        status: "insufficient_history" as const,
        list: []
      };
    }

    const mMonths = getPrecedingMonths(moisReference);
    const currentMonthStr = moisReference;

    const list = SITES_LIST.map(site => {
      const countCurrent = pannesLive 
        ? pannesLive.filter(p => !p.deleted && (p.siteId === site || p.site === site) && getPanneMonth(p) === currentMonthStr).length
        : 0;

      const countPrev1 = pannesLive 
        ? pannesLive.filter(p => !p.deleted && (p.siteId === site || p.site === site) && getPanneMonth(p) === mMonths[0]).length
        : 0;
      const countPrev2 = pannesLive 
        ? pannesLive.filter(p => !p.deleted && (p.siteId === site || p.site === site) && getPanneMonth(p) === mMonths[1]).length
        : 0;
      const countPrev3 = pannesLive 
        ? pannesLive.filter(p => !p.deleted && (p.siteId === site || p.site === site) && getPanneMonth(p) === mMonths[2]).length
        : 0;

      const avgPrevious = (countPrev1 + countPrev2 + countPrev3) / 3;
      
      let variation = 0;
      if (avgPrevious > 0) {
        variation = Math.round(((countCurrent - avgPrevious) / avgPrevious) * 100);
      } else if (countCurrent > 0) {
        variation = 100;
      }

      const hasDrop = variation > 40;

      return {
        site,
        countCurrent,
        avgPrevious: parseFloat(avgPrevious.toFixed(1)),
        variation,
        hasDrop
      };
    }).filter(item => item.hasDrop)
      .sort((a, b) => b.variation - a.variation);

    return {
      status: "success" as const,
      list
    };
  }, [hasEnoughHistory, pannesLive, getPanneMonth, moisReference]);

  // Model-level reliability analysis (last 90 days) - Condensed top 3
  const modelsReliability = React.useMemo(() => {
    if (!enginsLive || !pannesLive) return [];
    const limit90 = Date.now() - (90 * 24 * 60 * 60 * 1000);

    const enginsByModel: Record<string, any[]> = {};
    enginsLive.filter(e => !e.deleted).forEach(e => {
      const model = (e.type || e.modele || 'Inconnu').trim();
      if (!enginsByModel[model]) {
        enginsByModel[model] = [];
      }
      enginsByModel[model].push(e);
    });

    const closedPannes90 = pannesLive.filter(p => 
      p.statut === 'CLOS' && 
      !p.deleted &&
      p.dateDeclaration && 
      new Date(p.dateDeclaration).getTime() >= limit90
    );

    const result = Object.entries(enginsByModel).map(([model, modelEngins]) => {
      const enginIdsOfModel = new Set(modelEngins.map(e => e.id));
      const modelPannes = closedPannes90.filter(p => enginIdsOfModel.has(p.enginId));
      
      const numEngins = modelEngins.length;
      const totalPannes = modelPannes.length;
      const tauxPanneMoyen = numEngins > 0 ? (totalPannes / numEngins) : 0;
      const mtbf = totalPannes > 0 ? Math.round((numEngins * 90 * 24) / totalPannes) : null;

      return {
        model,
        numEngins,
        totalPannes,
        tauxPanneMoyen,
        mtbf
      };
    });

    return result
      .sort((a, b) => b.tauxPanneMoyen - a.tauxPanneMoyen)
      .slice(0, 3);
  }, [enginsLive, pannesLive]);

  // Top 3 parts/pieces in current month
  const topPiecesStats = React.useMemo(() => {
    if (!pannesLive) return [];
    const currentMonthStr = moisReference;

    const counts: Record<string, { name: string; count: number }> = {};
    
    pannesLive.filter(p => !p.deleted && getPanneMonth(p) === currentMonthStr).forEach(p => {
      const pList = p.pieces || p.piecesConcernees || [];
      pList.forEach((pName: string) => {
        if (!pName) return;
        const trimmed = pName.trim();
        if (!trimmed) return;
        const key = trimmed.toLowerCase();
        if (counts[key]) {
          counts[key].count += 1;
        } else {
          counts[key] = {
            name: trimmed,
            count: 1
          };
        }
      });
    });

    if (interventions) {
      interventions.filter(i => !i.deleted && i.typeIntervention === "CORRECTIF" && getTaskMonth(i) === currentMonthStr).forEach(i => {
        const pList = i.piecesUtilisees || [];
        pList.forEach((pName: string) => {
          if (!pName) return;
          const trimmed = pName.trim();
          if (!trimmed) return;
          const key = trimmed.toLowerCase();
          if (counts[key]) {
            counts[key].count += 1;
          } else {
            counts[key] = {
              name: trimmed,
              count: 1
            };
          }
        });
      });
    }

    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [pannesLive, interventions, getPanneMonth, getTaskMonth, moisReference]);

  // PM planned within the next 7 days (including today)
  const pmAVenir7Jours = React.useMemo(() => {
    if (!workOrdersLive) return [];
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const limit = today + (7 * 24 * 60 * 60 * 1000); // 7 days in ms

    const parseDate = (d: any): number => {
      if (!d) return 0;
      if (typeof d === 'string') return new Date(d).getTime();
      if (d.seconds) return d.seconds * 1000;
      if (d instanceof Date) return d.getTime();
      return new Date(d).getTime();
    };

    return workOrdersLive
      .filter((t: any) => 
        !t.deleted &&
        t.type === 'PREVENTIF' &&
        t.statut === 'NON_FAIT' &&
        t.datePlanifiee
      )
      .filter((t: any) => {
        const taskTime = parseDate(t.datePlanifiee);
        return taskTime >= today && taskTime <= limit;
      })
      .sort((a: any, b: any) => parseDate(a.datePlanifiee) - parseDate(b.datePlanifiee));
  }, [workOrdersLive]);

  // Positive mecanicien recognition (factual leaderboard)
  const felicitationsMecaniciens = React.useMemo(() => {
    if (!mecaniciens) return [];
    
    const eligibleMecas = mecaniciens.filter(m => {
      if (m.active === false) return false;
      // Filter out those with less than 3 completed tasks this month (same as Mecaniciens.tsx)
      if ((m.stats?.interventionsCeMois || 0) < 3) return false;
      
      // Dynamic site filtering based on selected tab in command center
      if (activeSiteTab !== "ensemble" && m.siteId !== activeSiteTab) {
        return false;
      }
      return true;
    });

    const scored = eligibleMecas.map(m => {
      const scoreTournees = m.stats.tauxTournéesCompletes !== null ? m.stats.tauxTournéesCompletes : 0;
      const scoreMttr = m.stats.mttrMoyen !== null ? Math.max(0, 100 - (m.stats.mttrMoyen * 15)) : 50;
      const scoreCombine = (scoreTournees + scoreMttr) / 2;

      return {
        mecanicien: m,
        scoreTournees,
        scoreMttr,
        scoreCombine: Math.round(scoreCombine * 10) / 10
      };
    });

    return scored.sort((a, b) => b.scoreCombine - a.scoreCombine).slice(0, 3);
  }, [mecaniciens, activeSiteTab]);

  // Human HR analysis - Mechaniciens à accompagner avec contexte diagnostique et factuel
  const mecaniciensAAccompagner = React.useMemo(() => {
    if (!mecaniciens || !workOrdersLive || !pieces) return [];

    // Filter active mechanics with low completed interventions this month (e.g. < 2)
    const candidates = mecaniciens.filter(m => m.active !== false && (m.stats?.interventionsCeMois || 0) < 2);

    // Filter for active/open BTs
    const openTasksRef = workOrdersLive.filter(t => !t.deleted && !["FAIT", "VALIDE"].includes(t.statut));

    // Rupture pieces (stock <= min)
    const rupturePieces = pieces.filter(p => {
      if (p.deleted) return false;
      const stock = p.stock !== undefined ? p.stock : 0;
      const min = p.min !== undefined ? p.min : 5;
      return stock <= min;
    });

    const list = candidates.map(m => {
      const siteId = m.siteId || "SMI";

      // 1. Get open tasks assigned to this mechanic
      const mecaOpenBTs = openTasksRef.filter(t => t.mecanicienId === m.id || t.mecanicienId === m.uid);

      // 2. Check if any of these tasks are blocked by a missing/ruptured piece
      const blockedPiecesNames: string[] = [];
      mecaOpenBTs.forEach(t => {
        const tPieces = t.piecesUtilisees || t.pieces || [];
        tPieces.forEach((pc: string) => {
          const pcUpper = (pc || "").trim().toUpperCase();
          const matchedPiece = rupturePieces.find(p => {
            const refUpper = (p.ref || "").trim().toUpperCase();
            const nomUpper = (p.nom || "").trim().toUpperCase();
            const idUpper = (p.id || "").trim().toUpperCase();
            return pcUpper === refUpper || pcUpper === nomUpper || pcUpper === idUpper;
          });
          if (matchedPiece && !blockedPiecesNames.includes(matchedPiece.nom)) {
            blockedPiecesNames.push(matchedPiece.nom);
          }
        });
      });

      // 3. Calculate site workload
      const siteOpenBTs = openTasksRef.filter(t => t.siteId === siteId || t.site === siteId);
      const siteActiveMecas = mecaniciens.filter(mec => mec.active !== false && mec.siteId === siteId);
      const siteWorkloadRatio = siteActiveMecas.length > 0 ? (siteOpenBTs.length / siteActiveMecas.length) : 0;

      // Determine diagnostic/narrative reason
      let statusReason = "Aucun blocage identifié. Soutien ou formation recommandée.";
      let category: 'BLOCAGE_EXTERNE' | 'SURCHARGE' | 'A_ACCOMPAGNER' = 'A_ACCOMPAGNER';

      if (blockedPiecesNames.length > 0) {
        statusReason = `Pièce manquante : ${blockedPiecesNames.join(", ")}`;
        category = 'BLOCAGE_EXTERNE';
      } else if (siteWorkloadRatio > 2.5) {
        statusReason = `Surcharge site (${siteWorkloadRatio.toFixed(1)} BT/méca)`;
        category = 'SURCHARGE';
      }

      return {
        mecanicien: m,
        siteWorkloadRatio,
        blockedPieces: blockedPiecesNames,
        statusReason,
        category,
        interventionsCeMois: m.stats?.interventionsCeMois || 0
      };
    });

    return list;
  }, [mecaniciens, workOrdersLive, pieces]);

  // Helper to render variation badge
  const renderVarBadge = (variation: number | null, lowerIsBetter: boolean) => {
    if (variation === null) {
      return (
        <span className="text-[10px] text-slate-400 font-mono font-medium block mt-1">
          Non comparable
        </span>
      );
    }
    
    const isZero = variation === 0;
    const isUp = variation > 0;
    
    let isImproving = false;
    if (lowerIsBetter) {
      isImproving = !isUp; 
    } else {
      isImproving = isUp; 
    }

    const colorClass = isZero 
      ? "text-slate-500 bg-slate-100" 
      : isImproving 
        ? "text-emerald-700 bg-emerald-50 border-emerald-200" 
        : "text-red-700 bg-red-50 border-red-200";

    const arrow = isZero ? "→" : isUp ? "↑" : "↓";
    const sign = isUp ? "+" : "";
    return (
      <div className="flex items-center gap-1.5 mt-1">
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-black border ${colorClass}`}>
          {arrow} {sign}{variation}%
        </span>
        <span className="text-[9px] text-slate-400 font-mono uppercase">vs mois prèc.</span>
      </div>
    );
  };

  // Date parsing helper
  const parseToDate = React.useCallback((field: any): Date | null => {
    if (!field) return null;
    if (typeof field.toMillis === 'function') return new Date(field.toMillis());
    if (field.seconds) return new Date(field.seconds * 1000);
    const d = new Date(field);
    return isNaN(d.getTime()) ? null : d;
  }, []);

  // Time elapsed formatter helper
  const formatElapsedTime = React.useCallback((dateField: any) => {
    const d = parseToDate(dateField);
    if (!d) return "N/A";
    const diffMs = Date.now() - d.getTime();
    if (diffMs < 0) return "0 min";
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    const remMins = diffMins % 60;
    if (diffHours < 24) return `${diffHours}h ${remMins}m`;
    const diffDays = Math.floor(diffHours / 24);
    const remHours = diffHours % 24;
    return `${diffDays}j ${remHours}h`;
  }, [parseToDate]);

  // LOTO duration check helper (>48h)
  const isLotoOver48h = React.useCallback((lockStartedAt: any) => {
    const d = parseToDate(lockStartedAt);
    if (!d) return false;
    const diffMs = Date.now() - d.getTime();
    return diffMs > 48 * 3600 * 1000;
  }, [parseToDate]);

  const renderCriticalAlertsGrid = (currentSite: string | "ensemble") => {
    // 1. DATA FILTERING: Sécurité Critique
    const criticalPannes = (pannesLive || []).filter(p => 
      !p.deleted && 
      p.statut !== "CLOS" && 
      p.categorie === "SÉCURITÉ / INSPECTION" &&
      (currentSite === "ensemble" || p.siteId === currentSite || p.site === currentSite)
    );

    // 2. DATA FILTERING: Engins Immobilisés
    const baseImmobilized = (enginsLive || []).filter(e => 
      !e.deleted &&
      ((e.statut || "").toLowerCase() === "panne" || (e.statut || "").toLowerCase() === "maintenance") &&
      (currentSite === "ensemble" || e.siteId === currentSite || e.site === currentSite)
    );

    // Sort engines from oldest to newest based on active panne datePriseEnCharge or dateDeclaration
    const getSortTime = (eng: any) => {
      const activePanne = (pannesLive || []).find(p => 
        !p.deleted && 
        p.statut !== "CLOS" && 
        (p.enginId === eng.id || p.enginId === eng.matricule || p.enginId === eng.nom)
      );
      if (!activePanne) return Infinity;
      const date = parseToDate(activePanne.datePriseEnCharge) || parseToDate(activePanne.dateDeclaration) || parseToDate(activePanne.createdAt);
      return date ? date.getTime() : Infinity;
    };

    const sortedImmobilizedEngins = [...baseImmobilized].sort((a, b) => getSortTime(a) - getSortTime(b));

    // 3. DATA FILTERING: Cadenassages LOTO Actifs
    const activeLotos = (lotoLocks || []).filter(lock => 
      lock.lotoLocked === true &&
      (currentSite === "ensemble" || lock.siteId === currentSite || lock.site === currentSite)
    );

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* CARD 1: SÉCURITÉ CRITIQUE */}
        <Card className="bg-slate-900 border-2 border-red-500/30 rounded-2xl shadow-lg relative overflow-hidden flex flex-col min-h-[300px]">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-600 animate-pulse" />
          <CardHeader className="bg-slate-950 border-b border-red-500/10 p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-red-500 animate-pulse" />
                <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-100 font-mono">
                  Sécurité Critique
                </CardTitle>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-black font-mono rounded ${criticalPannes.length > 0 ? "bg-red-500 text-white" : "bg-slate-800 text-slate-400"}`}>
                {criticalPannes.length} ACTIFS
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col justify-between overflow-y-auto max-h-[350px]">
            {criticalPannes.length === 0 ? (
              <div className="text-center py-16 text-slate-500 font-mono text-xs uppercase font-bold">
                Aucun élément
              </div>
            ) : (
              <div className="space-y-3.5">
                {criticalPannes.map((panne) => {
                  const elapsed = formatElapsedTime(panne.dateDeclaration || panne.createdAt);
                  return (
                    <div key={panne.id} className="p-3 bg-slate-950/60 border border-red-500/10 rounded-xl space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-black text-white font-mono uppercase bg-red-950/80 px-2 py-0.5 rounded border border-red-800/30">
                          {panne.enginId}
                        </span>
                        {currentSite === "ensemble" && (
                          <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">
                            Site: {panne.siteId || panne.site || "N/A"}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 text-xs font-sans leading-normal">
                        {panne.description}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-red-400 font-mono font-bold uppercase pt-1 border-t border-red-500/5">
                        <Clock className="h-3 w-3" />
                        <span>Signalé il y a : {elapsed}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* CARD 2: ENGINS IMMOBILISÉS (VERSION COMPLÈTE) */}
        <Card className="bg-slate-900 border-2 border-amber-500/30 rounded-2xl shadow-lg relative overflow-hidden flex flex-col min-h-[300px]">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500" />
          <CardHeader className="bg-slate-950 border-b border-amber-500/10 p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-amber-500" />
                <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-100 font-mono">
                  Engins Immobilisés
                </CardTitle>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-black font-mono rounded ${sortedImmobilizedEngins.length > 0 ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
                {sortedImmobilizedEngins.length} TOTAL
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col justify-between overflow-y-auto max-h-[350px]">
            {sortedImmobilizedEngins.length === 0 ? (
              <div className="text-center py-16 text-slate-500 font-mono text-xs uppercase font-bold">
                Aucun élément
              </div>
            ) : (
              <div className="space-y-3.5">
                {sortedImmobilizedEngins.map((eng) => {
                  const activePanne = (pannesLive || []).find(p => 
                    !p.deleted && 
                    p.statut !== "CLOS" && 
                    (p.enginId === eng.id || p.enginId === eng.matricule || p.enginId === eng.nom)
                  );
                  const panneDate = activePanne ? (activePanne.datePriseEnCharge || activePanne.dateDeclaration || activePanne.createdAt) : null;
                  const elapsed = panneDate ? formatElapsedTime(panneDate) : "N/A";

                  const hasPieceInRupture = activePanne && (activePanne.piecesConcernees || []).some((pc: string) => {
                    const pcUpper = (pc || "").trim().toUpperCase();
                    return (pieces || []).some((p: any) => {
                      if (p.deleted) return false;
                      const refUpper = (p.ref || "").trim().toUpperCase();
                      const nomUpper = (p.nom || "").trim().toUpperCase();
                      const idUpper = (p.id || "").trim().toUpperCase();
                      const matches = (pcUpper === refUpper || pcUpper === nomUpper || pcUpper === idUpper);
                      if (matches) {
                        const stock = p.stock !== undefined ? p.stock : 0;
                        const min = p.min !== undefined ? p.min : 5;
                        return stock < min;
                      }
                      return false;
                    });
                  });

                  const hasActiveLoto = (lotoLocks || []).some(lock => 
                    (lock.machineCode === eng.id || lock.machineCode === eng.matricule || lock.id === eng.id) && 
                    lock.lotoLocked === true
                  );

                  return (
                    <div key={eng.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-black text-white font-mono uppercase">
                            {eng.matricule || eng.nom}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 font-mono uppercase">
                            Modèle: {eng.modele || eng.type || "N/A"}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black border ${
                            (eng.statut || "").toLowerCase() === "panne" 
                              ? "bg-red-950 text-red-400 border-red-800/30" 
                              : "bg-amber-950 text-amber-400 border-amber-800/30"
                          }`}>
                            {(eng.statut || "IMMOBILISÉ").toUpperCase()}
                          </span>
                          {currentSite === "ensemble" && (
                            <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">
                              {eng.siteId || eng.site || "N/A"}
                            </span>
                          )}
                        </div>
                      </div>

                      {activePanne && (
                        <div className="space-y-1.5">
                          <p className="text-slate-300 text-[11px] font-sans leading-normal">
                            <span className="font-bold text-slate-400 font-mono block text-[9.5px] uppercase">Raison:</span>
                            {activePanne.description || activePanne.raison || "Panne en cours d'évaluation"}
                          </p>
                          <div className="text-[9.5px] text-slate-400 font-mono">
                            <span className="font-bold text-slate-500 uppercase">Catégorie: </span>
                            {activePanne.categorie || "Autre"}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                        {panneDate && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono font-bold uppercase">
                            <Clock className="h-3 w-3" />
                            <span>Immob. : {elapsed}</span>
                          </div>
                        )}
                        {hasPieceInRupture && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-black font-mono bg-red-950 text-red-400 border border-red-800/30 rounded">
                            ⚠️ Rupture pièce
                          </span>
                        )}
                        {hasActiveLoto && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-black font-mono bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 rounded">
                            🔒 LOTO ACTIF
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* CARD 3: CADENASSAGES LOTO ACTIFS */}
        <Card className="bg-slate-900 border-2 border-amber-500/30 rounded-2xl shadow-lg relative overflow-hidden flex flex-col min-h-[300px]">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#D4AF37]" />
          <CardHeader className="bg-slate-950 border-b border-[#D4AF37]/10 p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#D4AF37]" />
                <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-100 font-mono">
                  Cadenassages LOTO Actifs
                </CardTitle>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-black font-mono rounded ${activeLotos.length > 0 ? "bg-[#D4AF37] text-slate-950" : "bg-slate-800 text-slate-400"}`}>
                {activeLotos.length} SÉCURISÉS
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col justify-between overflow-y-auto max-h-[350px]">
            {activeLotos.length === 0 ? (
              <div className="text-center py-16 text-slate-500 font-mono text-xs uppercase font-bold">
                Aucun élément
              </div>
            ) : (
              <div className="space-y-3.5">
                {activeLotos.map((lock) => {
                  const elapsed = formatElapsedTime(lock.lotoStartedAt);
                  const isAbnormal = isLotoOver48h(lock.lotoStartedAt);

                  return (
                    <div key={lock.id} className="p-3 bg-slate-950/60 border border-[#D4AF37]/10 rounded-xl space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-black text-[#D4AF37] font-mono uppercase bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/20">
                          {lock.machineCode || lock.id}
                        </span>
                        {currentSite === "ensemble" && (
                          <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">
                            Site: {lock.siteId || lock.site || "N/A"}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs text-slate-300 font-medium font-sans">
                          <span className="font-bold text-slate-400 font-mono">Propriétaire: </span>
                          {lock.lotoOwner || "Inconnu"}
                        </div>
                        {lock.lotoDetails && (
                          <p className="text-[11px] text-slate-400 font-sans italic">
                            "{lock.lotoDetails}"
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5 pt-2 border-t border-[#D4AF37]/5">
                        <div className="flex items-center gap-1.5 text-[10px] text-[#D4AF37] font-mono font-bold uppercase">
                          <Lock className="h-3 w-3 animate-spin-slow" />
                          <span>Sécurisé depuis : {elapsed}</span>
                        </div>
                        {isAbnormal && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-[9px] font-black font-mono bg-red-950 text-red-400 border border-red-800/30 rounded animate-pulse w-full text-center">
                            ⚠️ DURÉE ANORMALE (&gt;48h)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    );
  };

  // --- RENDU BLOCS REELS: ALERTES SYSTEME & PIECES BLOQUANTES ---
  const renderSystemAlertsAndBlockingPiecesGrid = (currentSite: string | "ensemble") => {
    // 1. DATA FILTERING: Alertes Système
    const activeAlerts = (alertsLive || []).filter(a => a.status === 'ACTIVE');
    
    // Group active alerts by code
    const alertGroups: Record<string, any[]> = {};
    activeAlerts.forEach(alert => {
      const code = alert.code || 'AUTRE';
      if (!alertGroups[code]) {
        alertGroups[code] = [];
      }
      alertGroups[code].push(alert);
    });

    const totalActiveAlertsCount = activeAlerts.length;

    // 2. DATA FILTERING: Pièces Bloquantes (Rupture stock + liées à un BT ouvert)
    const openPannesRef = (pannesLive || []).filter(p => !p.deleted && p.statut !== "CLOS");
    const openTasksRef = (workOrdersLive || []).filter(t => !t.deleted && !["FAIT", "VALIDE"].includes(t.statut));

    const allBlockingPieces = (pieces || []).filter(piece => {
      if (piece.deleted) return false;
      
      const stock = piece.stock !== undefined ? piece.stock : 0;
      const min = piece.min !== undefined ? piece.min : 5;
      
      // Stock must be below or equal to threshold
      if (stock > min) return false;
      
      const refUpper = (piece.ref || "").trim().toUpperCase();
      const nomUpper = (piece.nom || "").trim().toUpperCase();
      const idUpper = (piece.id || "").trim().toUpperCase();
      
      const isRefByPanne = openPannesRef.some(p => {
        const pPieces = p.pieces || p.piecesConcernees || [];
        return pPieces.some((pc: string) => {
          const pcUpper = (pc || "").trim().toUpperCase();
          return pcUpper === refUpper || pcUpper === nomUpper || pcUpper === idUpper;
        });
      });
      
      const isRefByTask = openTasksRef.some(t => {
        const tPieces = t.piecesUtilisees || t.pieces || [];
        return tPieces.some((pc: string) => {
          const pcUpper = (pc || "").trim().toUpperCase();
          return pcUpper === refUpper || pcUpper === nomUpper || pcUpper === idUpper;
        });
      });
      
      return isRefByPanne || isRefByTask;
    });

    // Resolve waiting BTs for each piece
    const piecesWithWaitingBTs = allBlockingPieces.map(piece => {
      const refUpper = (piece.ref || "").trim().toUpperCase();
      const nomUpper = (piece.nom || "").trim().toUpperCase();
      const idUpper = (piece.id || "").trim().toUpperCase();
      
      const waiting: { type: 'PANNE' | 'TASK'; id: string; label: string; enginId: string; siteId: string; status: string }[] = [];
      
      // Check Pannes
      openPannesRef.forEach(p => {
        const pPieces = p.pieces || p.piecesConcernees || [];
        const isMatched = pPieces.some((pc: string) => {
          const pcUpper = (pc || "").trim().toUpperCase();
          return pcUpper === refUpper || pcUpper === nomUpper || pcUpper === idUpper;
        });
        if (isMatched) {
          waiting.push({
            type: 'PANNE',
            id: p.id,
            label: p.description || p.raison || "Signalement de panne",
            enginId: p.enginId || "N/A",
            siteId: p.siteId || p.site || "N/A",
            status: p.statut
          });
        }
      });
      
      // Check Tasks
      openTasksRef.forEach(t => {
        const tPieces = t.piecesUtilisees || t.pieces || [];
        const isMatched = tPieces.some((pc: string) => {
          const pcUpper = (pc || "").trim().toUpperCase();
          return pcUpper === refUpper || pcUpper === nomUpper || pcUpper === idUpper;
        });
        if (isMatched) {
          waiting.push({
            type: 'TASK',
            id: t.id,
            label: t.label || t.designation || "Tâche de maintenance",
            enginId: t.enginId || "N/A",
            siteId: t.siteId || t.site || "N/A",
            status: t.statut
          });
        }
      });

      return {
        ...piece,
        waitingBTs: waiting
      };
    });

    // Filter blocking pieces based on current site tab selection
    const filteredBlockingPieces = piecesWithWaitingBTs.filter(p => {
      if (currentSite === "ensemble") return true;
      // Piece belongs to site OR at least one waiting BT is on this site
      const pieceSite = p.siteId || p.site || "";
      const matchesPieceSite = pieceSite.toUpperCase() === currentSite.toUpperCase();
      const hasWaitingBTOnSite = p.waitingBTs.some(bt => (bt.siteId || bt.site || "").toUpperCase() === currentSite.toUpperCase());
      return matchesPieceSite || hasWaitingBTOnSite;
    });

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* CARD 1: ALERTES SYSTÈME */}
        <Card className="bg-slate-900 border-2 border-slate-700/30 rounded-2xl shadow-lg relative overflow-hidden flex flex-col min-h-[350px] text-slate-100">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-500 to-slate-400" />
          <CardHeader className="bg-slate-950 border-b border-slate-800/50 p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 animate-pulse" />
                <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-100 font-mono">
                  Alertes Système actives
                </CardTitle>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-black font-mono rounded ${totalActiveAlertsCount > 0 ? "bg-red-600 text-white animate-pulse" : "bg-slate-800 text-slate-400"}`}>
                {totalActiveAlertsCount} ACTIVES
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-1 overflow-y-auto max-h-[420px] space-y-3">
            {totalActiveAlertsCount === 0 ? (
              <div className="text-center py-20 text-slate-500 font-mono text-xs uppercase font-bold">
                Aucune alerte active
              </div>
            ) : (
              <div className="space-y-3">
                {Object.keys(alertGroups).map((code) => {
                  const list = alertGroups[code];
                  const isExpanded = !!expandedAlertGroups[code];
                  
                  // Color style mapping
                  let cardBorder = "border-slate-850 bg-slate-950/40";
                  let badgeColor = "bg-slate-800 text-slate-400";
                  
                  if (["PM_OVERDUE", "PM_CRITICAL", "PANNE_48H", "PANNE_24H"].includes(code)) {
                    cardBorder = "border-red-500/20 bg-red-950/10 hover:border-red-500/40";
                    badgeColor = "bg-red-500 text-white";
                  } else if (["PIECE_STOCK_BAS", "GASOIL_ANORMAL"].includes(code)) {
                    cardBorder = "border-amber-500/20 bg-amber-950/10 hover:border-amber-500/40";
                    badgeColor = "bg-amber-500 text-slate-950";
                  } else if (code === "ENGIN_INACTIF") {
                    cardBorder = "border-slate-700/30 bg-slate-900/30 hover:border-slate-600/30";
                    badgeColor = "bg-slate-600 text-white";
                  }

                  return (
                    <div 
                      key={code} 
                      className={`border rounded-xl transition-all duration-200 overflow-hidden ${cardBorder}`}
                    >
                      {/* Accordion Trigger */}
                      <button
                        onClick={() => {
                          setExpandedAlertGroups(prev => ({
                            ...prev,
                            [code]: !prev[code]
                          }));
                        }}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-950/20 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`text-[10px] font-black font-mono uppercase px-2 py-0.5 rounded ${badgeColor}`}>
                            {code}
                          </span>
                          <span className="text-xs font-black text-slate-200 uppercase font-mono tracking-wide">
                            {code === 'PM_OVERDUE' ? 'PM DÉPASSÉ' :
                             code === 'PM_CRITICAL' ? 'PM CRITIQUE' :
                             code === 'PANNE_24H' ? 'PANNE > 24H' :
                             code === 'PANNE_48H' ? 'PANNE CRITIQUE > 48H' :
                             code === 'PIECE_STOCK_BAS' ? 'STOCK CRITIQUE PIÈCE' :
                             code === 'GASOIL_ANORMAL' ? 'CONSO CARBURANT ANORMALE' :
                             code === 'ENGIN_INACTIF' ? 'ENGIN INACTIF (>7J)' : code}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-400 font-mono">
                            {list.length} alerte{list.length > 1 ? 's' : ''}
                          </span>
                          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isExpanded ? "transform rotate-180" : ""}`} />
                        </div>
                      </button>

                      {/* Accordion Content */}
                      {isExpanded && (
                        <div className="p-3 bg-slate-950/60 border-t border-slate-800/40 divide-y divide-slate-800/40 space-y-2.5">
                          {list.map((alert) => {
                            const elapsed = formatElapsedTime(alert.createdAt);
                            return (
                              <div key={alert.id} className="pt-2.5 first:pt-0 space-y-1">
                                <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                                  <span className="text-white uppercase px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800">
                                    {alert.targetId || 'N/A'}
                                  </span>
                                  <span className="text-slate-400">
                                    Site: {alert.siteId || alert.site || 'N/A'}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                                  {alert.message}
                                </p>
                                <div className="flex items-center gap-1 text-[9.5px] text-slate-500 font-mono">
                                  <Clock className="h-3 w-3 text-slate-500" />
                                  <span>Depuis : {elapsed}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* CARD 2: PIÈCES BLOQUANTES */}
        <Card className="bg-slate-900 border-2 border-slate-700/30 rounded-2xl shadow-lg relative overflow-hidden flex flex-col min-h-[350px] text-slate-100">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-600" />
          <CardHeader className="bg-slate-950 border-b border-slate-800/50 p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-rose-500 animate-pulse" />
                <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-100 font-mono">
                  Pièces Bloquantes (Ruptures Actives)
                </CardTitle>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-black font-mono rounded ${filteredBlockingPieces.length > 0 ? "bg-red-600 text-white animate-pulse" : "bg-slate-800 text-slate-400"}`}>
                {filteredBlockingPieces.length} CRITIQUES
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-1 overflow-y-auto max-h-[420px] space-y-3">
            {filteredBlockingPieces.length === 0 ? (
              <div className="text-center py-20 text-slate-500 font-mono text-xs uppercase font-bold">
                Aucun blocage
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBlockingPieces.map((piece) => {
                  const stock = piece.stock !== undefined ? piece.stock : 0;
                  const min = piece.min !== undefined ? piece.min : 5;
                  
                  return (
                    <div 
                      key={piece.id} 
                      className="p-3 bg-slate-950/60 border border-red-500/10 rounded-xl space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-black text-white uppercase font-mono tracking-wide">
                            {piece.nom || 'Pièce inconnue'}
                          </h4>
                          <div className="text-[10px] font-mono font-bold text-slate-400">
                            Ref: <span className="text-slate-300">{piece.ref || piece.id}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-black bg-red-950 text-red-400 border border-red-800/30">
                            STOCK: {stock} / SEUIL: {min}
                          </span>
                          <div className="text-[9px] text-slate-400 font-mono uppercase mt-1">
                            Site: {piece.siteId || piece.site || 'Magasin Central'}
                          </div>
                        </div>
                      </div>

                      {/* Waiting BTs List */}
                      <div className="space-y-2 pt-2 border-t border-slate-800/50">
                        <div className="text-[9.5px] font-black font-mono text-slate-400 uppercase tracking-wider">
                          🛠️ Bons de travail en attente ({piece.waitingBTs.length}) :
                        </div>
                        <div className="space-y-2">
                          {piece.waitingBTs.map((bt) => (
                            <div 
                              key={bt.id} 
                              className="p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-start justify-between gap-2"
                            >
                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-[8.5px] font-black font-mono uppercase px-1.5 py-0.2 rounded ${
                                    bt.type === 'PANNE' ? 'bg-rose-950 text-rose-400 border border-rose-900/30' : 'bg-blue-950 text-blue-400 border border-blue-900/30'
                                  }`}>
                                    {bt.type === 'PANNE' ? 'PANNE' : 'BT PLANIFIÉ'}
                                  </span>
                                  <span className="text-[9px] font-black text-slate-200 font-mono bg-slate-800 px-1 py-0.2 rounded">
                                    {bt.enginId}
                                  </span>
                                  {currentSite === "ensemble" && (
                                    <span className="text-[8.5px] font-bold text-slate-400 font-mono uppercase">
                                      {bt.siteId}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10.5px] text-slate-300 font-sans leading-snug truncate">
                                  {bt.label}
                                </p>
                              </div>
                              <span className="text-[8.5px] font-mono font-bold text-slate-400 uppercase bg-slate-950 px-1.5 py-0.5 rounded border border-slate-850 shrink-0">
                                {bt.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    );
  };

  // --- PREVENTIVE VS CORRECTIVE DYNAMIC ENGINE ---

  const getTaskMonthForRatio = React.useCallback((t: any) => {
    if (t.dateRealisation) return String(t.dateRealisation).substring(0, 7);
    if (t.datePlanifiee) return String(t.datePlanifiee).substring(0, 7);
    return getTaskMonth(t);
  }, [getTaskMonth]);

  const getPreventifCorrectifStats = React.useCallback((siteId: string | "ensemble", monthStr: string) => {
    const tasks = (workOrdersLive || []).filter(t => {
      if (t.deleted) return false;
      
      // Site filter
      if (siteId !== "ensemble") {
        const tSite = t.siteId || t.site || "";
        if (tSite.toUpperCase() !== siteId.toUpperCase()) return false;
      }
      
      // Month filter
      const tMonth = getTaskMonthForRatio(t);
      return tMonth === monthStr;
    });

    const completedTasks = tasks.filter(t => t.statut === 'FAIT' || t.statut === 'VALIDE');

    if (completedTasks.length === 0) {
      return {
        preventifCount: 0,
        correctifCount: 0,
        totalCompleted: 0,
        realisedRate: null
      };
    }

    const preventifCount = completedTasks.filter(t => t.type === 'PREVENTIF').length;
    const correctifCount = completedTasks.filter(t => t.type === 'CORRECTIF' || t.type === 'CURATIF').length;

    const total = preventifCount + correctifCount;
    if (total === 0) {
      return {
        preventifCount: 0,
        correctifCount: 0,
        totalCompleted: 0,
        realisedRate: null
      };
    }

    const realisedRate = (preventifCount / total) * 100;

    return {
      preventifCount,
      correctifCount,
      totalCompleted: total,
      realisedRate: Math.round(realisedRate * 10) / 10
    };
  }, [workOrdersLive, getTaskMonthForRatio]);

  const get6RollingMonths = React.useCallback((endMonthStr: string) => {
    const months: string[] = [];
    let [year, month] = endMonthStr.split('-').map(Number);
    for (let i = 5; i >= 0; i--) {
      let y = year;
      let m = month - i;
      if (m <= 0) {
        m += 12;
        y -= 1;
      }
      const mStr = String(m).padStart(2, '0');
      months.push(`${y}-${mStr}`);
    }
    return months;
  }, []);

  const renderPreventifCorrectifKPIZone = (currentSite: string | "ensemble") => {
    const currentMonthStats = getPreventifCorrectifStats(currentSite, currentMonthStr);
    
    // Get target
    const globalTargetObj = (objectifsSitesRaw || []).find((o: any) => o.id === 'GLOBAL');
    const globalTargetVal = globalTargetObj?.preventifCorrectifTarget !== undefined ? Number(globalTargetObj.preventifCorrectifTarget) : 75;

    const realised = currentMonthStats.realisedRate;
    const gap = realised !== null ? Math.round((realised - globalTargetVal) * 10) / 10 : null;

    // Get rolling 6 months data
    const rollingMonths = get6RollingMonths(currentMonthStr);
    const chartData = rollingMonths.map(m => {
      const stats = getPreventifCorrectifStats(currentSite, m);
      const rate = stats.realisedRate;
      return {
        monthRaw: m,
        monthName: formatMoisLettres(m).split(' ')[0], // short name for x-axis e.g. "juillet"
        monthFullName: formatMoisLettres(m),
        realised: rate,
        target: globalTargetVal,
        shadedRange: (rate !== null && rate < globalTargetVal) ? [rate, globalTargetVal] : [globalTargetVal, globalTargetVal],
        hasData: rate !== null
      };
    });

    // Custom Tooltip component inside render to have access to scope
    const CustomKPIChartTooltip = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-mono shadow-xl text-slate-100">
            <div className="font-bold text-[#D4AF37] mb-1.5 uppercase tracking-wide">
              {data.monthFullName}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between gap-6">
                <span className="text-slate-400">Réalisé :</span>
                <span className={data.hasData ? "font-bold text-white" : "text-rose-400 font-bold italic"}>
                  {data.hasData ? `${data.realised}%` : "Données insuffisantes"}
                </span>
              </div>
              <div className="flex justify-between gap-6">
                <span className="text-slate-400">Objectif :</span>
                <span className="font-bold text-red-400">{data.target}%</span>
              </div>
              {data.hasData && (
                <div className="flex justify-between gap-6 pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Écart :</span>
                  <span className={`font-bold ${data.realised >= data.target ? "text-emerald-400" : "text-rose-400"}`}>
                    {data.realised >= data.target ? `+${(data.realised - data.target).toFixed(1)}` : (data.realised - data.target).toFixed(1)} pts
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      }
      return null;
    };

    return (
      <Card className="bg-slate-900 border-2 border-slate-700/30 rounded-2xl shadow-lg relative overflow-hidden flex flex-col text-slate-100" id={`preventif-correctif-${currentSite}`}>
        {/* Glow border for branding */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-[#D4AF37] to-emerald-600" />
        
        <CardHeader className="bg-slate-950 border-b border-slate-800/50 p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-100 font-mono flex items-center gap-2">
                <Gauge className="h-4 w-4 text-[#D4AF37]" />
                Taux de Maintenance Préventive vs Corrective
              </CardTitle>
              <CardDescription className="text-[10px] uppercase font-mono font-bold text-slate-400 mt-1">
                KPI Prioritaire Direction — Objectif Target de {globalTargetVal}% de maintenance préventive
              </CardDescription>
            </div>
            
            {/* BIG DIGITS HEADER */}
            <div className="flex items-center gap-6 self-start md:self-auto bg-slate-900/60 p-2 px-4 rounded-xl border border-slate-800/50 font-mono">
              <div className="text-center">
                <span className="text-[8px] text-slate-400 font-black uppercase block tracking-wider">Réalisé</span>
                <span className={`text-sm font-black ${realised === null ? "text-slate-500 italic animate-pulse" : realised >= globalTargetVal ? "text-emerald-400" : "text-rose-400"}`}>
                  {realised !== null ? `${realised}%` : "Données insuffisantes"}
                </span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div className="text-center">
                <span className="text-[8px] text-slate-400 font-black uppercase block tracking-wider">Objectif</span>
                <span className="text-sm font-black text-slate-100">
                  {globalTargetVal}%
                </span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div className="text-center">
                <span className="text-[8px] text-slate-400 font-black uppercase block tracking-wider">Écart</span>
                <span className={`text-sm font-black ${gap === null ? "text-slate-500 font-mono italic" : gap >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {gap !== null ? (gap >= 0 ? `+${gap} pts` : `${gap} pts`) : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: ROLLING 6-MONTH CHART */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono mb-4 flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-blue-400" />
                  Courbe de Performance — 6 Derniers Mois Glissants
                </h4>
              </div>
              
              <div className="w-full h-[230px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="pcUnderTargetShade" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis 
                      dataKey="monthName" 
                      tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold' }}
                      axisLine={{ stroke: '#475569' }}
                      tickLine={{ stroke: '#475569' }}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'monospace' }}
                      axisLine={{ stroke: '#475569' }}
                      tickLine={{ stroke: '#475569' }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip content={<CustomKPIChartTooltip />} />
                    
                    {/* Horizontal target reference line */}
                    <ReferenceLine 
                      y={globalTargetVal} 
                      stroke="#f87171" 
                      strokeDasharray="4 4" 
                      strokeWidth={1.5}
                      label={{
                        value: `Target: ${globalTargetVal}%`,
                        position: 'top',
                        fill: '#f87171',
                        fontSize: 9,
                        fontFamily: 'monospace',
                        fontWeight: 'black'
                      }}
                    />
                    
                    {/* Under-performance area shade */}
                    <Area 
                      type="monotone" 
                      dataKey="shadedRange" 
                      stroke="none" 
                      fill="url(#pcUnderTargetShade)" 
                      activeDot={false}
                    />

                    {/* Realised Area Line */}
                    <Area 
                      type="monotone" 
                      dataKey="realised" 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      fill="none"
                      dot={{ fill: '#10b981', r: 4, strokeWidth: 1 }}
                      activeDot={{ r: 6 }}
                      connectNulls={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* RIGHT COLUMN: SITE-BY-SITE DETAIL BARS */}
            <div className="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800/80 pt-6 lg:pt-0 lg:pl-8">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono mb-4 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                  Détail par Site Minier — {formatMoisLettres(currentMonthStr)}
                </h4>
                
                <div className="space-y-4">
                  {SITES_LIST.map(siteCode => {
                    const siteStats = getPreventifCorrectifStats(siteCode, currentMonthStr);
                    const sRealised = siteStats.realisedRate;
                    const sGap = sRealised !== null ? Math.round((sRealised - globalTargetVal) * 10) / 10 : null;
                    const isCurrentTab = activeSiteTab === siteCode;

                    return (
                      <div 
                        key={siteCode} 
                        className={`p-2.5 rounded-xl transition-all border ${
                          isCurrentTab 
                            ? "bg-slate-950/60 border-amber-500/50 shadow-[0_0_10px_rgba(212,175,55,0.1)]" 
                            : "bg-slate-950/20 border-slate-800/50 hover:bg-slate-950/30"
                        }`}
                      >
                        {/* Site name & percentage info */}
                        <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                          <span className="font-black text-white flex items-center gap-1.5">
                            {siteCode}
                            {isCurrentTab && (
                              <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-ping" />
                            )}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`font-black ${sRealised === null ? "text-slate-500 italic" : sRealised >= globalTargetVal ? "text-emerald-400" : "text-rose-400"}`}>
                              {sRealised !== null ? `${sRealised}%` : "Insuffisant"}
                            </span>
                            {sGap !== null && (
                              <span className={`text-[10px] font-bold ${sGap >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                ({sGap >= 0 ? `+${sGap}` : sGap} pts)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar with target indicator */}
                        <div className="h-4 w-full bg-slate-950 rounded-md relative overflow-hidden">
                          {sRealised === null ? (
                            /* Insufficient data background pattern */
                            <div 
                              className="absolute inset-0 opacity-40" 
                              style={{
                                background: 'repeating-linear-gradient(45deg, #1e293b, #1e293b 8px, #0f172a 8px, #0f172a 16px)'
                              }}
                            />
                          ) : (
                            <div 
                              className={`h-full rounded-md transition-all duration-500 bg-gradient-to-r ${
                                sRealised >= globalTargetVal 
                                  ? "from-emerald-600 to-emerald-400" 
                                  : "from-rose-600 to-rose-400"
                              }`}
                              style={{ width: `${sRealised}%` }}
                            />
                          )}
                          
                          {/* Target Tick Marker */}
                          <div 
                            className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10 shadow-[0_0_4px_rgba(239,68,68,0.5)]" 
                            style={{ left: `${globalTargetVal}%` }}
                            title={`Cible: ${globalTargetVal}%`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    );
  };

  // --- RECHARTS DATA HELPERS & AI ASSISTANT FOR MR MOUNIR ---

  const CustomHistoricalTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isProj = data.isProjection;
      const dVal = data.dispoReal !== null ? data.dispoReal : data.dispoProj;
      const cVal = data.complianceReal !== null ? data.complianceReal : data.complianceProj;

      return (
        <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-[11px] font-mono shadow-md text-slate-100">
          <div className="font-black text-[#D4AF37] mb-1 uppercase tracking-wide flex items-center gap-1">
            <span>{data.fullName}</span>
            {isProj && (
              <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1 py-0.5 rounded border border-amber-500/30">
                PROJ.
              </span>
            )}
          </div>
          <div className="space-y-0.5">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Dispo :</span>
              <span className="font-bold text-emerald-400">
                {dVal !== null ? `${dVal}%` : "---"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Conformité PM :</span>
              <span className="font-bold text-cyan-400">
                {cVal !== null ? `${cVal}%` : "---"}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const historicalMonthsData = React.useMemo(() => {
    const months: string[] = [];
    const [currYear, currMonth] = currentMonthStr.split('-').map(Number);
    // 6 rolling months (including currentMonthStr)
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currYear, currMonth - 1 - i, 1);
      months.push(getLocalMonthString(d));
    }
    
    // Calculate actual metrics for each month for the selected site
    const dataPoints = months.map((mStr, idx) => {
      // Reuse existing getSiteDispo and getSiteCompliance
      const dispo = getSiteDispo(activeSiteTab, mStr);
      const compliance = getSiteCompliance(activeSiteTab, mStr);
      return {
        monthRaw: mStr,
        name: formatMoisLettres(mStr).split(" ")[0], // simple label e.g., "mai"
        fullName: formatMoisLettres(mStr),
        dispoReal: dispo,
        complianceReal: compliance,
        dispoProj: idx === 5 ? dispo : null,
        complianceProj: idx === 5 ? compliance : null,
        isProjection: false
      };
    });

    // Extract valid non-null values for regression
    const validDispos = dataPoints
      .map((d, idx) => ({ x: idx, y: d.dispoReal }))
      .filter((p): p is { x: number; y: number } => typeof p.y === 'number' && p.y !== null && !isNaN(p.y));
      
    const validCompliances = dataPoints
      .map((d, idx) => ({ x: idx, y: d.complianceReal }))
      .filter((p): p is { x: number; y: number } => typeof p.y === 'number' && p.y !== null && !isNaN(p.y));

    const hasEnoughDispo = validDispos.length >= 3;
    const hasEnoughCompliance = validCompliances.length >= 3;

    // Linear regression function: y = m * x + c
    const runRegression = (pts: { x: number; y: number }[]) => {
      const n = pts.length;
      if (n < 3) return null;
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      for (const p of pts) {
        sumX += p.x;
        sumY += p.y;
        sumXY += p.x * p.y;
        sumXX += p.x * p.x;
      }
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      return { slope, intercept };
    };

    let projectedDispo: number | null = null;
    if (hasEnoughDispo) {
      const reg = runRegression(validDispos);
      if (reg) {
        // Project for 7th point (index 6)
        const val = reg.slope * 6 + reg.intercept;
        projectedDispo = Math.min(100, Math.max(0, parseFloat(val.toFixed(1))));
      }
    }

    let projectedCompliance: number | null = null;
    if (hasEnoughCompliance) {
      const reg = runRegression(validCompliances);
      if (reg) {
        // Project for 7th point (index 6)
        const val = reg.slope * 6 + reg.intercept;
        projectedCompliance = Math.min(100, Math.max(0, parseFloat(val.toFixed(1))));
      }
    }

    // Next month details
    const nextMonthDate = new Date(currYear, currMonth, 1);
    const nextMonthStr = getLocalMonthString(nextMonthDate);
    const nextMonthName = formatMoisLettres(nextMonthStr).split(" ")[0];

    const chartData = [...dataPoints];
    const canProject = hasEnoughDispo || hasEnoughCompliance;

    if (canProject) {
      chartData.push({
        monthRaw: nextMonthStr,
        name: `${nextMonthName} (Proj.)`,
        fullName: `${formatMoisLettres(nextMonthStr)} (Projection)`,
        dispoReal: null,
        complianceReal: null,
        dispoProj: projectedDispo,
        complianceProj: projectedCompliance,
        isProjection: true
      });
    }

    return {
      chartData,
      hasEnoughDispo,
      hasEnoughCompliance,
      projectedDispo,
      projectedCompliance,
      nextMonthName
    };
  }, [getSiteDispo, getSiteCompliance, activeSiteTab, currentMonthStr, formatMoisLettres]);

  const sitesRealVsPlanned = React.useMemo(() => {
    return SITES_LIST.map(site => {
      const siteWOs = (workOrdersLive || []).filter(t => !t.deleted && (t.siteId === site || t.site === site));
      const siteTasksMonth = siteWOs.filter(t => t.datePlanifiee && t.datePlanifiee.startsWith(currentMonthStr));
      
      const totalPlanned = siteTasksMonth.length;
      const totalRealized = siteTasksMonth.filter(t => t.statut === 'FAIT' || t.statut === 'VALIDE').length;
      
      const correctivesCount = (workOrdersLive || []).filter(t => !t.deleted && (t.siteId === site || t.site === site) && (t.type === 'CORRECTIF' || t.type === 'CURATIF') && (t.statut === 'FAIT' || t.statut === 'VALIDE') && getTaskMonth(t) === currentMonthStr).length;
      const sitePannes = (pannesLive || []).filter(p => !p.deleted && (p.siteId === site || p.site === site));
      const pannesClosed = sitePannes.filter(p => p.statut === 'CLOS' && getPanneCloseMonth(p) === currentMonthStr).length;
      
      const totalCorrectiveRealized = correctivesCount + pannesClosed;

      return {
        name: site,
        planifie: totalPlanned,
        realise: totalRealized,
        preventif: totalRealized,
        correctif: totalCorrectiveRealized
      };
    });
  }, [workOrdersLive, pannesLive, currentMonthStr, getTaskMonth, getPanneCloseMonth]);

  const globalPreventiveRatio = React.useMemo(() => {
    let totalPrev = 0;
    let totalCorr = 0;
    sitesRealVsPlanned.forEach(s => {
      totalPrev += s.preventif;
      totalCorr += s.correctif;
    });
    const total = totalPrev + totalCorr;
    const ratio = total > 0 ? Math.round((totalPrev / total) * 100) : 0;
    return {
      ratio,
      preventif: totalPrev,
      correctif: totalCorr,
      total
    };
  }, [sitesRealVsPlanned]);

  const generateSiteAnalysis = (siteId: string): string => {
    // 1. Get score of the site
    const match = classementSites.find(s => s.site === siteId);
    const score = match ? match.scoreGlobal : null;

    // 2. Compute preventive/corrective ratio for current month and previous month
    // Current month:
    const currentWO = (workOrdersLive || []).filter(w => !w.deleted && (w.siteId === siteId || w.site === siteId) && w.datePlanifiee && w.datePlanifiee.startsWith(moisReference));
    const currentPrev = currentWO.filter(w => w.type === "PREVENTIF" && w.statut === "FAIT").length;
    const currentCorr = currentWO.filter(w => w.type === "CORRECTIF" && w.statut === "FAIT").length;
    const totalCurrent = currentPrev + currentCorr;
    const currentRatio = totalCurrent > 0 ? Math.round((currentPrev / totalCurrent) * 100) : 0;

    // Previous month:
    const prevWO = (workOrdersLive || []).filter(w => !w.deleted && (w.siteId === siteId || w.site === siteId) && w.datePlanifiee && w.datePlanifiee.startsWith(prevMonthStr));
    const prevPrev = prevWO.filter(w => w.type === "PREVENTIF" && w.statut === "FAIT").length;
    const prevCorr = prevWO.filter(w => w.type === "CORRECTIF" && w.statut === "FAIT").length;
    const totalPrev = prevPrev + prevCorr;
    const prevRatio = totalPrev > 0 ? Math.round((prevPrev / totalPrev) * 100) : 0;

    // 3. Compute immobilized engins
    const siteImmobilized = (enginsLive || []).filter(e => (e.siteId === siteId || e.site === siteId) && (e.statut === "IMMOBILISE" || e.disponibilite === "NON"));

    // 4. Cost target check
    const tgt = (objectifsSitesRaw || []).find((o: any) => o.id === siteId) || {
      dispoTarget: 85,
      complianceTarget: 80,
      mttrTarget: 4,
      coutTarget: 1500
    };
    const siteCoutVal = getSiteCout(siteId, moisReference);

    const alerts: string[] = [];

    if (score === null) {
      alerts.push(`**Données Insuffisantes :** Aucune donnée de disponibilité, conformité préventive ou charge d'équipe n'a été enregistrée pour ce site ce mois-ci. L'état opérationnel précis du site est actuellement indéterminable.`);
    } else if (score < 60) {
      alerts.push(`**Attention Prioritaire :** Le score global du site est de **${score}%**, ce qui est en dessous du seuil critique de 60%. Une intervention managériale et technique est requise.`);
    }

    if (currentRatio < prevRatio) {
      alerts.push(`**Dégradation du Ratio Préventif :** Le ratio préventif/correctif s'est détérioré ce mois-ci, s'établissant à **${currentRatio}%** contre **${prevRatio}%** le mois précédent. Il est impératif de recentrer les efforts sur les opérations de maintenance préventive.`);
    }

    if (siteImmobilized.length > 0) {
      alerts.push(`**Engins Immobilisés :** Il y a actuellement **${siteImmobilized.length}** engin(s) immobilisé(s) sur ce site. Nous vous invitons à vérifier le classement des engins immobilisés pour accélérer leur remise en service.`);
    }

    if (siteCoutVal > tgt.coutTarget) {
      const overCost = Math.round(siteCoutVal - tgt.coutTarget);
      alerts.push(`**Dépassement de Budget :** Le coût total de maintenance ce mois-ci s'élève à **${Math.round(siteCoutVal)} USD**, dépassant l'objectif budgétaire de **${tgt.coutTarget} USD** (écart de **+${overCost} USD**).`);
    }

    if (alerts.length === 0) {
      return "Aucun signal d'alerte pour ce site ce mois-ci. Les indicateurs sont au vert et respectent les objectifs opérationnels.";
    }

    return "### Rapport d'Analyse Opérationnelle — " + siteId + "\n\n" + alerts.map(a => "- " + a).join("\n\n");
  };

  const generateGlobalAnalysis = (): string => {
    if (
      isLoading || 
      !enginsLive || enginsLive.length === 0 || 
      !workOrdersLive || workOrdersLive.length === 0 || 
      !pannesLive || pannesLive.length === 0 || 
      classementSites.length === 0
    ) {
      return "données insuffisantes pour générer une synthèse complète";
    }

    const alerts: string[] = [];
    const now = Date.now();

    // Helper to get time in milliseconds
    const getMs = (val: any) => {
      if (!val) return 0;
      if (typeof val.toMillis === 'function') return val.toMillis();
      if (typeof val.seconds === 'number') return val.seconds * 1000;
      const d = new Date(val).getTime();
      return isNaN(d) ? 0 : d;
    };

    // 1. Écart préventif/correctif vs objectif
    const globalRatio = globalPreventiveRatio.ratio;
    const ratioTarget = 70;
    if (globalRatio < ratioTarget) {
      const globalGap = ratioTarget - globalRatio;
      alerts.push(`**Écart Ratio Préventif/Correctif Global :** Le ratio de maintenance préventive de la flotte est de **${globalRatio}%**, soit un écart négatif de **-${globalGap}%** sous l'objectif de ${ratioTarget}%. Une remobilisation des équipes sur les fiches de maintenance préventive planifiées est préconisée.`);
    }

    // Site-by-site preventive ratio gaps vs site objective
    sitesRealVsPlanned.forEach(s => {
      const siteTotal = s.preventif + s.correctif;
      if (siteTotal > 0) {
        const siteRatio = Math.round((s.preventif / siteTotal) * 100);
        const tgt = (objectifsSitesRaw || []).find((o: any) => o.id === s.name) || { complianceTarget: 80 };
        const siteTarget = tgt.complianceTarget || 70;
        if (siteRatio < siteTarget) {
          const siteGap = siteTarget - siteRatio;
          alerts.push(`**Écart Ratio Préventif/Correctif (Site ${s.name}) :** Le ratio est à **${siteRatio}%** par rapport à l'objectif de ${siteTarget}% (écart de **-${siteGap}%**).`);
        }
      }
    });

    // 2. Tout cadenassage LOTO actif depuis plus de 48h
    const fortyEightHoursAgo = now - (48 * 60 * 60 * 1000);
    const activeLongLotos = (lotoLocks || []).filter((lock: any) => {
      if (lock.deleted || lock.lotoLocked !== true) return false;
      const startedMs = getMs(lock.lotoStartedAt);
      return startedMs > 0 && startedMs < fortyEightHoursAgo;
    });

    if (activeLongLotos.length > 0) {
      activeLongLotos.forEach((lock: any) => {
        const startedMs = getMs(lock.lotoStartedAt);
        const hoursActive = Math.round((now - startedMs) / (1000 * 60 * 60));
        alerts.push(`**Cadenassage Prolongé LOTO :** La machine **${lock.machineCode || "N/A"}** (${lock.siteId || lock.site || "SMI"}) est cadenassée par **${lock.lotoOwner || "Inconnu"}** depuis **${hoursActive} heures** (dépassement du seuil de 48h).`);
      });
    }

    // 3. Tout site en donnée insuffisante depuis plus de 24h
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
    const missingDataSitesLong = classementSites.filter(s => {
      if (!s.dataInsuffisante) return false;
      if (!s.lastUpdateMs) return true;
      return s.lastUpdateMs < twentyFourHoursAgo;
    });

    if (missingDataSitesLong.length > 0) {
      missingDataSitesLong.forEach(s => {
        const lastUpdateText = s.lastUpdateMs 
          ? `dernière activité il y a ${Math.round((now - s.lastUpdateMs) / (1000 * 60 * 60))} heures`
          : "aucune activité enregistrée";
        alerts.push(`**Données Insuffisantes (>24h) :** Le site **${s.site}** manque de données d'activité depuis plus de 24 heures (${lastUpdateText}).`);
      });
    }

    // 4. Tout déséquilibre de charge d'équipe notable (un site avec un seul mécanicien et un backlog élevé)
    const overloadedSingleMecaSites = classementSites.filter(s => {
      return s.siteMecasCount === 1 && s.openWOsCount >= 4;
    });

    if (overloadedSingleMecaSites.length > 0) {
      overloadedSingleMecaSites.forEach(s => {
        alerts.push(`**Déséquilibre de Charge :** Le site **${s.site}** présente un déséquilibre opérationnel fort avec **un seul mécanicien** affecté pour un backlog de **${s.openWOsCount} fiches ouvertes** (charge de ${s.chargeMoyenneSite?.toFixed(1)} BT/méca).`);
      });
    }

    // 5. Priorités de sécurité critique ouvertes
    const openCriticalSecurity = (pannesLive || []).filter(p => {
      if (p.deleted || p.statut === "CLOS") return false;
      const isSecurityCategory = p.categorie === "SÉCURITÉ / INSPECTION";
      const isCriticalSeverity = p.criticite === "CRITIQUE" || p.criticite === "SÉCURITÉ";
      return isSecurityCategory || isCriticalSeverity;
    });

    if (openCriticalSecurity.length > 0) {
      openCriticalSecurity.forEach(p => {
        alerts.push(`**Sécurité Critique :** Anomalie critique ouverte sur l'engin **${p.matricule || p.enginId || "N/A"}** (${p.siteId || p.site || "SMI"}) — *"${p.description || p.titre || "Anomalie critique"}"* — Niveau : ${p.criticite || "SÉCURITÉ"}.`);
      });
    }

    // 6. Sites en score CRITIQUE ou VIGILANCE (<60% ou 60-80%)
    const criticalSites = classementSites.filter(s => s.scoreGlobal !== null && s.scoreGlobal < 60);
    const vigilanceSites = classementSites.filter(s => s.scoreGlobal !== null && s.scoreGlobal >= 60 && s.scoreGlobal < 80);

    if (criticalSites.length > 0) {
      const siteNames = criticalSites.map(s => `**${s.site}** (${s.scoreGlobal?.toFixed(1)}%)`).join(", ");
      alerts.push(`**Sites en Alerte Critique (<60%) :** Le(s) site(s) ${siteNames} requiert/veulent une attention immédiate pour redresser les indicateurs de performance.`);
    }

    if (vigilanceSites.length > 0) {
      const siteNames = vigilanceSites.map(s => `**${s.site}** (${s.scoreGlobal?.toFixed(1)}%)`).join(", ");
      alerts.push(`**Sites sous Vigilance (60%-80%) :** Le(s) site(s) ${siteNames} présente(nt) des faiblesses temporaires au niveau de la disponibilité ou de la conformité préventive.`);
    }

    // 7. Modèle d'engin le moins fiable de toute la flotte si un écart significatif existe
    const worstModel = modelsReliability[0];
    if (worstModel && worstModel.tauxPanneMoyen > 1.0) {
      alerts.push(`**Fiabilité de la Flotte :** Le modèle d'engin **${worstModel.model}** est actuellement le moins fiable avec un taux de **${worstModel.tauxPanneMoyen.toFixed(1)}** panne(s) par machine sur les 90 derniers jours (MTBF moyen de **${worstModel.mtbf ? worstModel.mtbf + 'h' : 'N/A'}**).`);
    }

    // 8. Pièce la plus récurrente du mois
    const topPiece = topPiecesStats[0];
    if (topPiece && topPiece.count >= 2) {
      alerts.push(`**Pièces de rechange récurrentes :** La pièce d'usure **${topPiece.name}** est la plus fréquemment sollicitée ce mois-ci avec **${topPiece.count}** occurrences enregistrées.`);
    }

    // Message final ou message positif si aucun problème n'est détecté
    if (alerts.length === 0) {
      return `### Synthèse Opérationnelle d'Hydromines — ${moisReference}\n\n` +
             `**Tous les indicateurs de performance globale sont optimaux pour ce mois.** Aucun écart préventif/correctif notable, aucun cadenassage LOTO anormal, aucun site en donnée insuffisante, aucune surcharge de mécanicien, ni aucune anomalie de sécurité critique ouverte.`;
    }

    return `### Synthèse Opérationnelle d'Hydromines — ${moisReference}\n\n` +
           `Consolidation automatique de la performance globale du réseau :\n\n` +
           alerts.map(a => "- " + a).join("\n\n");
  };

  const renderAnalysisText = (text: string | null) => {
    if (!text) return null;
    const paragraphs = text.split("\n\n");
    return paragraphs.map((p, i) => {
      const cleanParagraph = p.trim();
      if (cleanParagraph.startsWith("### ")) {
        return <h4 key={i} className="text-xs font-black text-[#D4AF37] mt-3 mb-1 uppercase font-mono tracking-wider">{cleanParagraph.substring(4)}</h4>;
      }
      if (cleanParagraph.startsWith("#### ")) {
        return <h5 key={i} className="text-[11px] font-black text-slate-900 dark:text-[#E2C799] mt-3 mb-1 uppercase font-mono tracking-wide">{cleanParagraph.substring(5)}</h5>;
      }
      if (cleanParagraph.startsWith("- ")) {
        const content = cleanParagraph.substring(2);
        const parts = content.split(/\*\*(.*?)\*\*/g);
        return (
          <div key={i} className="ml-4 text-xs text-slate-700 dark:text-[#F4EAD4]/80 leading-relaxed font-sans mb-1 flex items-start gap-1.5">
            <span className="text-[#D4AF37]">•</span>
            <span>
              {parts.map((part, idx) => idx % 2 === 1 ? <strong key={idx} className="font-extrabold text-amber-950 dark:text-[#E2C799]">{part}</strong> : part)}
            </span>
          </div>
        );
      }
      const parts = cleanParagraph.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="text-xs leading-relaxed text-slate-700 dark:text-[#F4EAD4]/80 font-sans">
          {parts.map((part, idx) => idx % 2 === 1 ? <strong key={idx} className="font-extrabold text-amber-950 dark:text-[#E2C799]">{part}</strong> : part)}
        </p>
      );
    });
  };

  // Role restriction (only ADMIN, DIRECTION, RESPONSABLE_MAINTENANCE)
  const hasAccess = React.useMemo(() => {
    return user?.role && ['ADMIN', 'DIRECTION', 'RESPONSABLE_MAINTENANCE'].includes(user.role);
  }, [user]);

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center font-sans bg-white dark:bg-[#090e18]">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
        <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white tracking-widest font-mono">Accès Restreint</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md">
          Cette page est réservée exclusivement aux membres de la direction et de la gestion de la maintenance globale.
        </p>
      </div>
    );
  }

  // Row mapping for inter-site comparison matrix
  const interSiteRows = [
    {
      label: "Disponibilité Flotte",
      key: "dispo" as const,
      format: (v: number | null) => v !== null ? `${Math.round(v)}%` : "N/A",
      lowerIsBetter: false,
      render: (val: any, siteId: string) => {
        const tgt = (objectifsSitesRaw || []).find((o: any) => o.id === siteId);
        const prevVal = getSiteDispo(siteId, prevMonthStr);
        return renderMetricWithTarget(val, prevVal, tgt?.dispoTarget, false, "%");
      }
    },
    {
      label: "MTTR Moyen (heures)",
      key: "mttr" as const,
      format: (v: number | null) => v !== null ? `${v.toFixed(1)} h` : "N/A",
      lowerIsBetter: true,
      render: (val: any, siteId: string) => {
        const tgt = (objectifsSitesRaw || []).find((o: any) => o.id === siteId);
        const prevVal = getSiteMttr(siteId, prevMonthStr);
        return renderMetricWithTarget(val, prevVal, tgt?.mttrTarget, true, "h");
      }
    },
    {
      label: "Pannes Ouvertes Actives",
      key: "pannesOuvertes" as const,
      format: (v: number) => `${v}`,
      lowerIsBetter: true
    },
    {
      label: "Conformité PM (Préventif)",
      key: "compliance" as const,
      format: (v: number | null) => v !== null ? `${Math.round(v)}%` : "N/A",
      lowerIsBetter: false,
      render: (val: any, siteId: string) => {
        const tgt = (objectifsSitesRaw || []).find((o: any) => o.id === siteId);
        const prevVal = getSiteCompliance(siteId, prevMonthStr);
        return renderMetricWithTarget(val, prevVal, tgt?.complianceTarget, false, "%");
      }
    },
    {
      label: "Charge Moyenne / Mécanicien",
      key: "charge" as const,
      format: (v: number | null) => v !== null ? `${v.toFixed(1)} OT` : "0.0 OT",
      lowerIsBetter: true
    },
    {
      label: "Coût Horaire Global",
      key: "cout" as const,
      format: (v: number | null) => v !== null ? `${v.toFixed(1)} DH/h` : "N/A",
      lowerIsBetter: true,
      render: (val: any, siteId: string) => {
        const tgt = (objectifsSitesRaw || []).find((o: any) => o.id === siteId);
        const prevVal = getSiteCout(siteId, prevMonthStr);
        return renderMetricWithTarget(val, prevVal, tgt?.coutTarget, true, " DH/h");
      }
    }
  ];

  return (
    <div className={`flex-1 min-h-screen p-4 lg:p-6 space-y-6 overflow-y-auto transition-colors duration-500 bg-white dark:bg-[#090e18] text-slate-800 dark:text-[#F4EAD4]`}>
      {hasLoadError && <DataLoadError />}
      
      {/* EXECUTIVE TOP HEADER BANNER */}
      <div 
        className="relative overflow-hidden border-2 border-[#D4AF37] p-6 md:p-8 rounded-3xl transition-all duration-500 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-[0_8px_30px_rgba(212,175,55,0.06)] bg-white"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(253, 251, 247, 0.99) 100%), url(${goldTexture})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 rounded-t-3xl z-10" />
        
        {/* Golden corner brackets */}
        <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-[#D4AF37] pointer-events-none" />
        <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-[#D4AF37] pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-[#D4AF37] pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-[#D4AF37] pointer-events-none" />

        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono font-black uppercase tracking-widest text-[#D4AF37] bg-slate-950 rounded-md shadow-sm">
            <Crown className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
            RESPONSABLE DE LA MAINTENANCE GLOBALE
          </span>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-950 font-sans">
            Centre de Commandement : <span className="text-amber-850">ESPACE RESPONSABLE DE LA MAINTENANCE</span>
          </h1>
          <h2 className="text-sm font-bold flex items-center gap-1">
            <span className="text-[#D4AF37] font-black tracking-widest bg-slate-950 px-2 py-0.5 rounded text-[11px] uppercase">Mr</span> 
            <span className="text-[#D4AF37] font-extrabold uppercase tracking-widest bg-slate-950 px-2.5 py-0.5 rounded text-[12px]">MOUNIR Outbrrit</span>
          </h2>
        </div>

        <div className="shrink-0 bg-white border-2 border-[#D4AF37] p-4 rounded-2xl flex flex-col items-center justify-center min-w-[150px] shadow-sm">
          <span className="text-[9px] font-mono text-amber-600 font-bold uppercase tracking-wider">État Général</span>
          <span className="text-lg font-black text-slate-900 mt-1 uppercase font-mono tracking-tight flex items-center gap-1.5">
            {classementSites.filter(s => s.scoreGlobal !== null && s.scoreGlobal < 60).length > 0 ? (
              <>
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping shrink-0" />
                Alerte
              </>
            ) : classementSites.filter(s => s.scoreGlobal !== null && s.scoreGlobal < 80).length > 0 ? (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                Vigilance
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                Optimal
              </>
            )}
          </span>
          <span className="text-[8.5px] font-mono text-slate-500 mt-1 uppercase">Mise à jour : Temps Réel</span>
        </div>
      </div>

      {/* SYNTHESIS PHRASE ALERT BANNER WITH WHITE BACKGROUND & GOLD STYLE */}
      <div className="relative overflow-hidden bg-white text-slate-800 rounded-2xl p-4 md:p-5 border-2 border-[#D4AF37] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="h-10 w-10 shrink-0 bg-amber-500/10 border border-[#D4AF37]/40 rounded-xl flex items-center justify-center text-amber-600">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-mono text-amber-600 font-bold uppercase tracking-widest">
              SYNTHÈSE DE LA SITUATION — HYDROMINES
            </div>
            <p className="text-xs sm:text-sm font-black font-sans tracking-tight text-slate-900 mt-0.5 uppercase leading-relaxed">
              {situationBanner}
            </p>
          </div>
        </div>

        {/* Month Selector and Refresh indicator */}
        <div className="shrink-0 flex flex-col items-start md:items-end gap-2 self-stretch md:self-auto border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* MONTH SELECTOR */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 transition-colors shadow-xs">
              <button 
                onClick={handlePrevMonth}
                className="p-1 rounded hover:bg-slate-100 text-amber-600 transition-colors cursor-pointer"
                title="Mois précédent"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="text-[10px] font-mono font-black text-slate-800 tracking-wider uppercase min-w-[90px] text-center">
                {formatMoisLettres(moisReference)}
              </span>
              <button 
                onClick={handleNextMonth}
                disabled={isMoisCourantReel}
                className="p-1 rounded hover:bg-slate-100 text-[#D4AF37] hover:text-amber-600 transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                title="Mois suivant"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* LIVE PULSE INDICATOR */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 shadow-xs">
              <Clock className="h-3.5 w-3.5 text-amber-500 animate-pulse shrink-0" />
              <span className="text-[10px] font-mono font-bold text-slate-700 tracking-tight">
                Données à {(() => {
                  const hrs = String(lastRefreshTime.getHours()).padStart(2, "0");
                  const mins = String(lastRefreshTime.getMinutes()).padStart(2, "0");
                  return `${hrs}:${mins}`;
                })()}
              </span>
              <button
                onClick={() => setLastRefreshTime(new Date())}
                className="ml-1 p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-amber-600 transition-all cursor-pointer"
                title="Confirmer la fraîcheur"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            </div>
          </div>
          <span className="text-[8px] font-mono text-slate-400 text-left md:text-right max-w-[240px] leading-tight">
            Données synchronisées en temps réel via Firestore.
          </span>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="border-b border-gray-200 dark:border-slate-800 pb-px">
        <nav className="flex flex-wrap gap-2" aria-label="Tabs">
          <button
            onClick={() => {
              setActiveSiteTab("ensemble");
              setExpandedSite(null);
            }}
            className={`px-4 py-2 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
              activeSiteTab === "ensemble"
                ? "bg-slate-900 border-[#D4AF37] text-[#D4AF37] shadow-md"
                : "bg-white border-slate-200 text-slate-600 hover:border-[#D4AF37]/50 hover:text-slate-800"
            }`}
          >
            Vue d'ensemble
          </button>
          {SITES_LIST.map((site) => (
            <button
              key={site}
              onClick={() => {
                setActiveSiteTab(site);
                setExpandedSite(site); // auto-expand for drill-down compatibility
              }}
              className={`px-4 py-2 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                activeSiteTab === site
                  ? "bg-slate-900 border-[#D4AF37] text-[#D4AF37] shadow-md"
                  : "bg-white border-slate-200 text-slate-600 hover:border-[#D4AF37]/50 hover:text-slate-800"
              }`}
            >
              {site}
            </button>
          ))}
        </nav>
      </div>

      {/* HISTORICAL CONSULTING WARNING BANNER */}
      {!isMoisCourantReel && (
        <div className="relative overflow-hidden bg-amber-50 border-2 border-amber-500/30 text-amber-900 rounded-2xl p-4 shadow-md flex items-center gap-3 font-mono text-xs uppercase font-bold">
          <Info className="h-5 w-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <span className="text-amber-700 font-black">Consultation Historique : </span>
            Vous consultez les archives de <span className="underline">{formatMoisLettres(moisReference)}</span>. Les indicateurs "temps réel" ou les actions d'écriture ne concernent pas cette période passée.
          </div>
        </div>
      )}

      {/* ALERTE DE DÉPASSEMENT PROLONGÉ (3 MOIS SOUS CIBLE) */}
      {activeSiteTab === "ensemble" && prolongedAlertSites.length > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-r from-red-950 to-red-900 border-2 border-red-500/50 text-white rounded-2xl p-5 shadow-xl flex flex-col gap-4 animate-pulse">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-red-600" />
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 shrink-0 bg-red-500/20 border border-red-500/40 rounded-xl flex items-center justify-center text-red-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-mono font-black tracking-wider text-red-400 uppercase">
                ALERTE SÉVÈRE : DÉPASSEMENT PROLONGÉ DE LA CIBLE DE DISPONIBILITÉ
              </h4>
              <p className="text-xs font-medium text-slate-300 mt-1 leading-relaxed font-mono uppercase">
                Les sites suivants sont restés sous leur objectif de disponibilité (<span className="text-red-400 font-bold">dispoTarget</span>) pendant <span className="text-red-400 font-black">3 mois consécutifs</span>. Une intervention immédiate de la direction est requise.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-1">
            {prolongedAlertSites.map((alert) => (
              <div key={alert.siteId} className="bg-black/40 border border-red-500/20 rounded-xl p-3 font-mono text-[11px] space-y-2">
                <div className="flex justify-between items-center border-b border-red-500/10 pb-1.5">
                  <span className="font-black text-red-400 uppercase text-[11.5px]">{alert.siteId}</span>
                  <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded text-[9px] font-black">SOUS CIBLE</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Mois Référence :</span>
                    <span className="text-slate-200 font-bold">{alert.dispo0.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Mois Précédent (M-1) :</span>
                    <span className="text-slate-200 font-bold">{alert.dispo1.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Mois M-2 :</span>
                    <span className="text-slate-200 font-bold">{alert.dispo2.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between border-t border-red-500/10 pt-1.5 font-bold text-red-400 text-[10px]">
                    <span>Objectif Cible :</span>
                    <span>{alert.dispoTarget}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RENDER ACTIVE TAB CONTENT */}
      {activeSiteTab === "ensemble" ? (
        <>
          {/* CRITICAL ALERTS AND SAFETY REGULATION GRID */}
          {renderCriticalAlertsGrid("ensemble")}

          {/* SYSTEM ALERTS AND BLOCKING PIECES GRID */}
          {renderSystemAlertsAndBlockingPiecesGrid("ensemble")}

          {/* PREVENTIF VS CORRECTIF DYNAMIC KPI ZONE */}
          {renderPreventifCorrectifKPIZone("ensemble")}

          {/* --- SECTION 1 : COMPARAISON MENSUELLE (CE MOIS VS MOIS PRÉCÉDENT) --- */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-[#D4AF37]" />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">
                Comparaison Performance Mensuelle (Ce mois vs Mois précédent)
              </h2>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="h-24 bg-slate-100 dark:bg-slate-900 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Card 1: Ratio Préventif global Card */}
                <Card className="border-2 border-[#D4AF37]/50 bg-white relative overflow-hidden rounded-xl shadow-xs">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#D4AF37]" />
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-mono text-slate-400 font-black uppercase tracking-wider block">Ratio Préventif (Cible &gt;70%)</span>
                        <h3 className="text-2xl font-black text-slate-900 font-mono mt-1">
                          {globalPreventiveRatio.ratio}%
                        </h3>
                      </div>
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                        <Gauge className="h-4 w-4" />
                      </div>
                    </div>
                    
                    {/* Progress indicator bar */}
                    <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          globalPreventiveRatio.ratio >= 70 ? "bg-emerald-500" : "bg-red-500"
                        }`}
                        style={{ width: `${globalPreventiveRatio.ratio}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Card 2: Pannes */}
                <Card className="border border-slate-200 bg-white relative overflow-hidden rounded-xl">
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-mono text-slate-400 font-black uppercase tracking-wider block">Pannes Déclarées</span>
                        <h3 className="text-2xl font-black text-slate-900 font-mono mt-1">
                          {comparisonData.current.totalPannes}
                        </h3>
                      </div>
                      <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                    </div>
                    {renderVarBadge(comparisonData.pannesVar, true)}
                  </CardContent>
                </Card>

                {/* Card 3: Préventif réalisé */}
                <Card className="border border-slate-200 bg-white relative overflow-hidden rounded-xl">
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-mono text-slate-400 font-black uppercase tracking-wider block">Préventifs Réalisés</span>
                        <h3 className="text-2xl font-black text-slate-900 font-mono mt-1">
                          {comparisonData.current.totalPreventives}
                        </h3>
                      </div>
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    </div>
                    {renderVarBadge(comparisonData.preventivesVar, false)}
                  </CardContent>
                </Card>

                {/* Card 4: Coût total de maintenance */}
                <Card className="border border-slate-200 bg-white relative overflow-hidden rounded-xl">
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-mono text-slate-400 font-black uppercase tracking-wider block">Coûts de Maintenance (Est.)</span>
                        <h3 className="text-2xl font-black text-slate-900 font-mono mt-1">
                          {comparisonData.current.totalCost.toLocaleString()} <span className="text-xs font-sans">DH</span>
                        </h3>
                      </div>
                      <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
                        <DollarSign className="h-4 w-4" />
                      </div>
                    </div>
                    {renderVarBadge(comparisonData.costVar, true)}
                  </CardContent>
                </Card>

              </div>
            )}
          </div>

          {/* MONTHLY RECHARTS GRAPHICAL & REPORTING ANALYSES */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart 1: Écart Planifié vs Réalisé (BarChart) */}
            <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm p-4 col-span-1 lg:col-span-2 space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-black uppercase font-mono tracking-wider text-slate-900 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-amber-500" />
                    Écart Planifié vs Réalisé (Tâches de Maintenance)
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">Nombre de bons de travail programmés comparés aux réalisés par site.</p>
                </div>
                <span className="text-[9px] font-mono font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">Rapport Consolidé</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sitesRealVsPlanned} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: "monospace", fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fontFamily: "monospace", fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: "11px", fontFamily: "sans-serif", borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                    <Legend wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />
                    <Bar dataKey="planifie" name="Planifiés" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="realise" name="Réalisés (Préventif)" fill="#d97706" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="correctif" name="Correctif Clôturé" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Chart 2: Trend & Projection of Availability and Compliance (6 Rolling Months + 1 projected) */}
            <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm p-4 space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3 gap-2">
                <div>
                  <h3 className="text-xs font-black uppercase font-mono tracking-wider text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Évolution & Projection (6 Mois Glissants)
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Taux de disponibilité flotte vs conformité préventive pour <span className="font-bold text-slate-700">{activeSiteTab === "ensemble" ? "Tous les sites" : activeSiteTab}</span>.
                  </p>
                </div>
                {(!historicalMonthsData.hasEnoughDispo && !historicalMonthsData.hasEnoughCompliance) ? (
                  <span className="text-[9px] font-mono font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded px-1.5 py-0.5 whitespace-nowrap" title="Moins de 3 mois d'historique réel">
                    Historique insuffisant pour projeter
                  </span>
                ) : (
                  <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5 whitespace-nowrap" title="Régression linéaire sur 6 mois">
                    Projection active
                  </span>
                )}
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalMonthsData.chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDispo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fontFamily: "monospace", fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 9, fontFamily: "monospace", fill: "#64748b" }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomHistoricalTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                    
                    {/* Real Solid curves */}
                    <Area type="monotone" dataKey="dispoReal" name="Disponibilité (Réelle)" stroke="#10b981" fillOpacity={1} fill="url(#colorDispo)" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 1, fill: "#fff" }} />
                    <Area type="monotone" dataKey="complianceReal" name="Conformité PM (Réelle)" stroke="#06b6d4" fillOpacity={1} fill="url(#colorComp)" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 1, fill: "#fff" }} />
                    
                    {/* Projected Dashed curves */}
                    <Line type="monotone" dataKey="dispoProj" name="Disponibilité (Projetée)" stroke="#10b981" strokeDasharray="5 5" strokeWidth={2.5} dot={{ r: 3, strokeDasharray: "none" }} activeDot={false} legendType="none" />
                    <Line type="monotone" dataKey="complianceProj" name="Conformité PM (Projetée)" stroke="#06b6d4" strokeDasharray="5 5" strokeWidth={2.5} dot={{ r: 3, strokeDasharray: "none" }} activeDot={false} legendType="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

      {/* TWO COLUMN GRID : SITES CLASSIFICATION AND IMMOBILIZED VEHICLES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN (7 COLS): SITES CLASSIFICATION TABLE */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-white border-2 border-[#D4AF37]/40 shadow-[0_8px_30px_rgba(212,175,55,0.06)] rounded-2xl overflow-hidden relative">
            
            {/* Corner L-brackets */}
            <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-[#D4AF37]/50 pointer-events-none" />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-[#D4AF37]/50 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-[#D4AF37]/50 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-[#D4AF37]/50 pointer-events-none" />

            <CardHeader className="bg-slate-50 border-b border-slate-200/50 p-5">
              <div className="flex items-center gap-2.5">
                <Building2 className="h-5 w-5 text-amber-600" />
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-900 font-mono">
                    Classement Décisionnel des Sites
                  </CardTitle>
                  <CardDescription className="text-[11px] text-slate-500 font-medium">
                    Calculé sur la disponibilité de la flotte, conformité préventive, pannes ouvertes et charge d'équipe. Cliquez sur une ligne pour voir le détail.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 font-mono text-xs text-slate-400">
                  <Activity className="h-8 w-8 text-amber-500 animate-spin" />
                  Génération du classement en cours...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-4">Site</th>
                        <th className="py-3 px-4 text-center">Score Global</th>
                        <th className="py-3 px-4 text-center">Disponibilité</th>
                        <th className="py-3 px-4 text-center">Pannes Actives</th>
                        <th className="py-3 px-4 text-center">BT Ouverts & Âge</th>
                        <th className="py-3 px-4 text-center">Taux Préventif</th>
                        <th className="py-3 px-4 text-center">Fraîcheur Réelle</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold">
                      {classementSites.map((item, index) => {
                        const score = item.scoreGlobal;
                        const isExpanded = expandedSite === item.site;
                        const showSectionHeader = score === null && (index === 0 || classementSites[index - 1].scoreGlobal !== null);

                        let scoreColor = "text-slate-500";
                        let scoreBg = "bg-slate-100 text-slate-700 border-slate-200/50";
                        let statusDot = "bg-slate-400";

                        if (score !== null) {
                          if (score >= 80) {
                            scoreColor = "text-emerald-600";
                            scoreBg = "bg-emerald-50 text-emerald-700 border-emerald-200/50";
                            statusDot = "bg-emerald-500";
                          } else if (score >= 60) {
                            scoreColor = "text-amber-600";
                            scoreBg = "bg-amber-50 text-amber-700 border-amber-200/50";
                            statusDot = "bg-amber-500";
                          } else {
                            scoreColor = "text-red-600";
                            scoreBg = "bg-red-50 text-red-700 border-red-200/50";
                            statusDot = "bg-red-500";
                          }
                        }

                        return (
                          <React.Fragment key={item.site}>
                            {showSectionHeader && (
                              <tr className="bg-amber-50/50 border-t border-b border-amber-200/40 text-amber-900 font-sans">
                                <td colSpan={8} className="py-2.5 px-4 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
                                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                                  <span>Données insuffisantes (Activité inactive ce mois)</span>
                                  {item.lastUpdateMs ? (
                                    <span className="text-slate-600 font-mono font-bold ml-2 text-[9px] bg-amber-100/60 px-2 py-0.5 rounded border border-amber-200/30">
                                      Dernière transmission : {formatFreshness(item.lastUpdateMs)} ({formatExactDateTime(item.lastUpdateMs)})
                                    </span>
                                  ) : (
                                    <span className="text-slate-500 font-mono font-bold ml-2 text-[9px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                      Aucun signal enregistré
                                    </span>
                                  )}
                                </td>
                              </tr>
                            )}
                            <tr 
                              onClick={() => setExpandedSite(isExpanded ? null : item.site)}
                              className={`hover:bg-amber-50/40 transition-colors cursor-pointer ${isExpanded ? "bg-amber-50/20" : ""}`}
                            >
                              <td className="py-3 px-4 font-black uppercase tracking-wider flex items-center gap-2 text-slate-900">
                                <span className={`inline-block h-2 w-2 rounded-full ${statusDot} shrink-0`} />
                                {item.site}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <span className={`px-2.5 py-0.5 rounded border font-extrabold text-[11px] ${scoreBg}`}>
                                    {score !== null ? `${Math.round(score)}%` : "N/A"}
                                  </span>
                                  {item.isEchantillonFaible && (
                                    <span 
                                      className="px-1.5 py-0.5 rounded text-[8px] bg-slate-100 text-slate-500 border border-slate-200 font-bold uppercase tracking-wider"
                                      title="Fiabilité limitée en raison d'un nombre restreint de pannes ou d'OT ce mois"
                                    >
                                      échantillon faible
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center font-extrabold text-slate-700">
                                {(() => {
                                  const tgt = (objectifsSitesRaw || []).find((o: any) => o.id === item.site);
                                  const dispoPrev = getSiteDispo(item.site, prevMonthStr);
                                  return renderMetricWithTarget(item.dispoSite, dispoPrev, tgt?.dispoTarget, false, "%");
                                })()}
                              </td>
                              <td className="py-3 px-4 text-center font-extrabold text-slate-700">
                                <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] ${item.pannesOuvertesSite > 0 ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"}`}>
                                  {item.pannesOuvertesSite}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex flex-col items-center justify-center">
                                  <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] ${item.openWOsCount > 0 ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-slate-50 text-slate-400 border border-slate-100"}`}>
                                    {item.openWOsCount} BTs
                                  </span>
                                  {item.openWOsCount > 0 && (
                                    <span className="text-[9px] text-slate-500 font-medium mt-0.5">
                                      moy. {item.avgAgeDays.toFixed(1)}j
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center font-extrabold text-slate-700">
                                {(() => {
                                  const tgt = (objectifsSitesRaw || []).find((o: any) => o.id === item.site);
                                  const compliancePrev = getSiteCompliance(item.site, prevMonthStr);
                                  return renderMetricWithTarget(item.complianceSite, compliancePrev, tgt?.complianceTarget, false, "%");
                                })()}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {item.lastUpdateMs ? (
                                  <div className="flex flex-col items-center justify-center" title={`Date exacte: ${formatExactDateTime(item.lastUpdateMs)}`}>
                                    <span className="text-slate-800 text-[10px] font-bold">
                                      {formatFreshness(item.lastUpdateMs)}
                                    </span>
                                    <span className="text-[8px] text-slate-400 font-medium scale-90 origin-center">
                                      {formatExactDateTime(item.lastUpdateMs).split(',')[0]}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic font-medium">Aucun signal</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors">
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </button>
                              </td>
                            </tr>

                            {/* COLLAPSIBLE DETAILS FOR THE SITE */}
                            {isExpanded && (
                              <tr>
                                <td colSpan={8} className="p-4 bg-slate-50/70 border-t border-b border-slate-100">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                                    
                                    <div className="space-y-1">
                                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                                        <Gauge className="h-3.5 w-3.5 text-slate-400" />
                                        FLOTTE ENGINS
                                      </span>
                                      <p className="text-sm font-black text-slate-900 font-mono">
                                        {item.siteEnginsCount} machine(s)
                                      </p>
                                      <p className="text-[10px] text-slate-500 font-medium">
                                        Disponibilité globale : {item.dispoSite !== null ? `${Math.round(item.dispoSite)}%` : "N/A"}
                                      </p>
                                    </div>

                                    <div className="space-y-1">
                                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                        SITUATION PANNES
                                      </span>
                                      <p className="text-sm font-black text-slate-900 font-mono">
                                        {item.pannesOuvertesSite} panne(s) actives
                                      </p>
                                      <p className="text-[10px] text-slate-500 font-medium">
                                        Impact production élevé
                                      </p>
                                    </div>

                                    <div className="space-y-1">
                                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                                        <Users className="h-3.5 w-3.5 text-sky-500" />
                                        CHARGE DE TRAVAIL
                                      </span>
                                      <p className="text-sm font-black text-slate-900 font-mono">
                                        {item.chargeMoyenneSite !== null ? `${item.chargeMoyenneSite.toFixed(1)} OT / méca` : "0.0 OT / méca"}
                                      </p>
                                      <p className="text-[10px] text-slate-500 font-medium">
                                        Effectif actif : {item.siteMecasCount} mécanicien(s)
                                      </p>
                                    </div>

                                    <div className="space-y-1">
                                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                                        <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />
                                        CONFORMITÉ PM
                                      </span>
                                      <p className="text-sm font-black text-slate-900 font-mono">
                                        {item.complianceSite !== null ? `${Math.round(item.complianceSite)}%` : "0%"}
                                      </p>
                                      <p className="text-[10px] text-slate-500 font-medium">
                                        Respect du plan préventif
                                      </p>
                                    </div>

                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* --- SECTION 2 : COMPARAISON INTER-SITES CÔTE À CÔTE --- */}
          <Card className="bg-white border-2 border-[#D4AF37]/40 shadow-[0_8px_30px_rgba(212,175,55,0.06)] rounded-2xl overflow-hidden relative">
            <CardHeader className="bg-slate-50 border-b border-slate-200/50 p-5">
              <div className="flex items-center gap-2.5">
                <Sliders className="h-5 w-5 text-amber-600" />
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-900 font-mono">
                    Comparatif Inter-Sites Côte à Côte
                  </CardTitle>
                  <CardDescription className="text-[11px] text-slate-500 font-medium">
                    Analyse matricielle des 5 sites d'exploitation. La meilleure performance est teintée en <span className="text-emerald-700 font-bold">Vert</span>, et la moins bonne en <span className="text-red-700 font-bold">Rouge</span>.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="text-center py-10 font-mono text-xs text-slate-400">
                  Génération de la matrice comparative...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-4">Indicateurs clés</th>
                        {SITES_LIST.map(site => (
                          <th key={site} className="py-3 px-4 text-center font-black">{site}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                      {interSiteRows.map((row) => {
                        const extremes = compareInterSites.extremes;
                        return (
                          <tr key={row.key} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-4 font-black text-slate-900">{row.label}</td>
                            {compareInterSites.sitesData.map(sData => {
                              const val = sData[row.key];
                              
                              const bestVal = extremes[row.key].best;
                              const worstVal = extremes[row.key].worst;

                              const isBest = val !== null && val !== undefined && val === bestVal && bestVal !== worstVal;
                              const isWorst = val !== null && val !== undefined && val === worstVal && bestVal !== worstVal;

                              let cellClass = "text-center";
                              if (isBest) {
                                cellClass = "text-center bg-emerald-50 text-emerald-800 border-x border-emerald-100/50 dark:bg-emerald-950/20 dark:text-emerald-400";
                              } else if (isWorst) {
                                cellClass = "text-center bg-red-50 text-red-800 border-x border-red-100/50 dark:bg-red-950/20 dark:text-red-400";
                              }

                              return (
                                <td key={sData.site} className={`py-3 px-4 font-mono font-extrabold ${cellClass}`}>
                                  {row.render ? row.render(val, sData.site) : row.format(val as any)}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN (4 COLS): ENGINS IMMOBILISES & TRENDS */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-white border-2 border-red-500/20 shadow-[0_8px_30px_rgba(239,68,68,0.04)] rounded-2xl overflow-hidden relative">
            
            {/* L-brackets */}
            <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-red-500/30 pointer-events-none" />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-red-500/30 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-red-500/30 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-red-500/30 pointer-events-none" />

            <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-red-600 z-10" />

            <CardHeader className="bg-slate-50 border-b border-slate-200/50 p-5">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="h-5 w-5 text-red-600 animate-pulse" />
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-900 font-mono">
                    Engins Immobilisés
                  </CardTitle>
                  <CardDescription className="text-[11px] text-slate-500 font-medium">
                    Machines en panne ou maintenance, triées par durée d'arrêt cumulée (du plus ancien au plus récent).
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 font-mono text-xs">
              {!isMoisCourantReel ? (
                <div className="flex flex-col items-center justify-center py-10 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  <Clock className="h-6 w-6 text-slate-400 mb-2" />
                  <span className="font-black text-slate-700 text-[10px] uppercase tracking-wider">
                    Non disponible pour les mois passés
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] leading-relaxed">
                    Cette section affiche l'état de la flotte en temps réel actuel et n'est pas disponible en mode archive historique.
                  </p>
                </div>
              ) : isLoading ? (
                <div className="text-center py-10 font-medium text-slate-400">
                  Calcul des temps d'arrêt...
                </div>
              ) : immobilisesList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-emerald-50 border border-dashed border-emerald-200 rounded-xl">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 mb-2" />
                  <span className="font-black text-emerald-700 text-[10px] uppercase tracking-wider">
                    Opérationnel optimal
                  </span>
                  <p className="text-[10px] text-emerald-600 mt-1">
                    Aucun engin n'est immobilisé aujourd'hui sur l'ensemble des sites.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {immobilisesList.slice(0, 4).map((e: any) => {
                    const normStatus = getNormalizedStatus(e);
                    const isPanne = normStatus === "EN_PANNE" || e.statut === "panne";
                    
                    const badgeColor = isPanne 
                      ? "bg-red-50 text-red-700 border-red-200" 
                      : "bg-amber-50 text-amber-700 border-amber-200";

                    const siteId = e.siteId || e.site;
                    const openToday = pannesLive ? pannesLive.filter((p: any) => (p.siteId === siteId || p.site === siteId) && p.statut !== "CLOS" && !p.deleted).length : 0;
                    const open7DaysAgo = getPannesOpen7DaysAgoCount(siteId);
                    const trendDiff = openToday - open7DaysAgo;

                    return (
                      <div 
                        key={e.uid || e.id} 
                        className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2.5 hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900 text-xs uppercase tracking-tight">
                            {e.matricule || e.id}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${badgeColor}`}>
                            {isPanne ? "Panne" : "Maintenance"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                          <span>Site : <strong className="text-slate-800 uppercase">{siteId}</strong></span>
                          <span>Marque : <strong className="text-slate-800">{e.marque || "N/A"}</strong></span>
                        </div>

                        {/* TREND PILL WITH COMPASS */}
                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Tendance du Site :</span>
                          <div className="flex items-center gap-1 font-bold text-[9.5px]">
                            {trendDiff > 0 ? (
                              <span className="flex items-center gap-0.5 text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                <TrendingUp className="h-3 w-3" />
                                {openToday} pannes (+{trendDiff} en 7j)
                              </span>
                            ) : trendDiff < 0 ? (
                              <span className="flex items-center gap-0.5 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                <TrendingDown className="h-3 w-3" />
                                {openToday} pannes ({trendDiff} en 7j)
                              </span>
                            ) : (
                              <span className="flex items-center gap-0.5 text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                <Clock className="h-3 w-3" />
                                {openToday} pannes (stable)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* --- SECTION 3 : DÉTECTION D'ANOMALIE AUTOMATIQUE --- */}
          <Card className="bg-white border-2 border-[#D4AF37]/30 shadow-[0_8px_30px_rgba(212,175,55,0.04)] rounded-2xl overflow-hidden relative">
            <CardHeader className="bg-slate-50 border-b border-slate-200/50 p-5">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-5 w-5 text-[#D4AF37] animate-bounce" />
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-900 font-mono">
                    Détection d'Anomalie Auto.
                  </CardTitle>
                  <CardDescription className="text-[11px] text-slate-500 font-medium">
                    Décrochages significatifs comparés à la propre moyenne historique de chaque site (seuil d'alerte à +40%).
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 font-mono text-xs">
              {isLoading ? (
                <div className="text-center py-6 text-slate-400 font-medium">
                  Analyse des variations historiques...
                </div>
              ) : anomaliesDetection.status === "insufficient_history" ? (
                <div className="p-4 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-center text-slate-500 text-[10.5px]">
                  Historique insuffisant pour détecter des anomalies (&lt; 3 mois de données).
                </div>
              ) : anomaliesDetection.list.length === 0 ? (
                <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-xl text-center font-bold text-[10.5px]">
                  Aucun décrochage critique détecté ce mois-ci sur les sites. Tout est stable.
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase text-red-500 tracking-wider block">Décrochages détectés ce mois-ci :</span>
                  {anomaliesDetection.list.map((anom) => (
                    <div 
                      key={anom.site} 
                      onClick={() => setSelectedAnomalySite(anom.site)}
                      className="p-3 bg-red-50 hover:bg-red-100/70 border border-red-150 rounded-xl space-y-1 cursor-pointer transition-all hover:translate-x-0.5 active:translate-x-0"
                    >
                      <div className="flex justify-between items-center font-black">
                        <span className="uppercase text-red-800 font-mono text-xs">{anom.site}</span>
                        <span className="text-red-700 font-mono text-xs">+{anom.variation}%</span>
                      </div>
                      <p className="text-[10px] text-red-700 font-medium leading-relaxed font-mono">
                        {anom.countCurrent} pannes ce mois vs une moyenne de {anom.avgPrevious} sur les 3 mois précédents.
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      {/* --- NEW SECTION : CARTE SCHÉMATIQUE DES SITES ET FIL D'ACTIVITÉ EN DIRECT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6">
        
        {/* CARTE SCHÉMATIQUE DES SITES (col-span-5) */}
        <Card className="lg:col-span-5 bg-slate-950 border-2 border-slate-800 shadow-2xl rounded-2xl overflow-hidden relative flex flex-col justify-between h-[450px]">
          {/* Cyber accents */}
          <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-slate-700 pointer-events-none" />
          <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-slate-700 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-slate-700 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-slate-700 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#D4AF37]/60 z-10" />

          <CardHeader className="bg-slate-900/60 border-b border-slate-800/60 p-4">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-amber-500 animate-pulse" />
              <div>
                <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-100 font-mono">
                  Topologie Réseau & Télémétrie
                </CardTitle>
                <CardDescription className="text-[9.5px] text-slate-400 font-medium font-mono uppercase">
                  État de transmission et score global en temps réel.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 flex-1 relative overflow-hidden flex items-center justify-center bg-slate-950/90 select-none">
            {/* Tech grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-10" />
            
            <div className="relative w-full h-[300px] max-w-[360px]">
              {/* Telemetry line flow style */}
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes telemetryFlow {
                  to {
                    stroke-dashoffset: -20;
                  }
                }
                .telemetry-link {
                  stroke-dasharray: 5, 5;
                  animation: telemetryFlow 1.5s linear infinite;
                }
              `}} />

              {/* Connecting lines SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 360 300" fill="none">
                {(() => {
                  const hqCoords = { x: 180, y: 150 };
                  const nodes = [
                    { code: "SMI", x: 75, y: 75 },
                    { code: "OUMEJRANE", x: 285, y: 75 },
                    { code: "KOUDIA", x: 75, y: 225 },
                    { code: "OUANSIMI", x: 285, y: 225 },
                    { code: "BOU-AZZER", x: 180, y: 45 },
                  ];

                  return nodes.map(n => {
                    const siteData = classementSites.find(s => s.site === n.code);
                    const isInactive = !siteData || siteData.scoreGlobal === null;
                    const score = siteData ? siteData.scoreGlobal : null;
                    
                    let strokeColor = "#475569"; // Inactive Gray
                    if (!isInactive && score !== null) {
                      if (score >= 80) strokeColor = "#10b981"; // Green
                      else if (score >= 60) strokeColor = "#f59e0b"; // Amber
                      else strokeColor = "#f43f5e"; // Red
                    }

                    return (
                      <line 
                        key={n.code}
                        x1={hqCoords.x} 
                        y1={hqCoords.y} 
                        x2={n.x} 
                        y2={n.y} 
                        stroke={strokeColor} 
                        strokeWidth="1.5" 
                        className="telemetry-link"
                        style={{ strokeOpacity: isInactive ? 0.25 : 0.7 }}
                      />
                    );
                  });
                })()}
              </svg>

              {/* Central HQ Node */}
              <div 
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 cursor-pointer group"
                style={{ left: "50%", top: "50%" }}
              >
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 animate-ping" />
                  <div className="absolute w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 animate-pulse" />
                  <div className="w-4 h-4 rounded-full bg-amber-500 border border-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
                </div>
                <span className="text-[8px] font-black uppercase text-amber-500 font-mono tracking-wider mt-1.5 px-1 bg-slate-900 border border-amber-500/30 rounded">
                  QG CENTRAL
                </span>
              </div>

              {/* Site Nodes */}
              {(() => {
                const nodes = [
                  { code: "SMI", name: "SMI", left: "20.8%", top: "25%" },
                  { code: "OUMEJRANE", name: "Oumejrane", left: "79.2%", top: "25%" },
                  { code: "KOUDIA", name: "Koudia", left: "20.8%", top: "75%" },
                  { code: "OUANSIMI", name: "Ouansimi", left: "79.2%", top: "75%" },
                  { code: "BOU-AZZER", name: "Bou-Azzer", left: "50%", top: "15%" },
                ];

                return nodes.map(n => {
                  const siteData = classementSites.find(s => s.site === n.code);
                  const isInactive = !siteData || siteData.scoreGlobal === null;
                  const score = siteData ? siteData.scoreGlobal : null;

                  let nodeBg = "bg-slate-900 border-slate-700 text-slate-400";
                  let pingBg = "bg-slate-500/20 border-slate-500/30";
                  let indicatorBg = "bg-slate-500";
                  let hoverBorder = "hover:border-slate-500 hover:shadow-slate-500/10";

                  if (!isInactive && score !== null) {
                    if (score >= 80) {
                      nodeBg = "bg-slate-900 border-emerald-500 text-emerald-400";
                      pingBg = "bg-emerald-500/10 border-emerald-500/20";
                      indicatorBg = "bg-emerald-500";
                      hoverBorder = "hover:border-emerald-400 hover:shadow-emerald-500/20";
                    } else if (score >= 60) {
                      nodeBg = "bg-slate-900 border-amber-500 text-amber-400";
                      pingBg = "bg-amber-500/10 border-amber-500/20";
                      indicatorBg = "bg-amber-500";
                      hoverBorder = "hover:border-amber-400 hover:shadow-amber-500/20";
                    } else {
                      nodeBg = "bg-slate-900 border-red-500 text-red-400";
                      pingBg = "bg-red-500/10 border-red-500/20";
                      indicatorBg = "bg-red-500";
                      hoverBorder = "hover:border-red-400 hover:shadow-red-500/20";
                    }
                  }

                  return (
                    <div 
                      key={n.code}
                      onClick={() => setExpandedSite(expandedSite === n.code ? null : n.code)}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 cursor-pointer group transition-all duration-300 ${isInactive ? "opacity-60 hover:opacity-100" : ""}`}
                      style={{ left: n.left, top: n.top }}
                    >
                      <div className={`relative flex items-center justify-center p-1 rounded-lg border-2 ${nodeBg} transition-all duration-300 shadow-md ${hoverBorder}`}>
                        {!isInactive && <div className={`absolute -inset-1 rounded-lg ${pingBg} border animate-ping pointer-events-none`} />}
                        
                        <div className="flex items-center gap-1.5 px-1 font-mono">
                          <span className={`w-1.5 h-1.5 rounded-full ${indicatorBg} shrink-0`} />
                          <span className="text-[9.5px] font-black uppercase text-slate-100 tracking-tight">{n.name}</span>
                          <span className="text-[8.5px] font-bold">
                            {score !== null ? `${Math.round(score)}%` : "N/A"}
                          </span>
                        </div>

                        {/* Interactive Tooltip / Detail overlay on hover */}
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-48 bg-slate-950 border border-slate-800 rounded-xl p-3 shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 text-slate-100 space-y-1.5">
                          <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                            <span className="text-[10px] font-black uppercase text-amber-500 font-mono">{n.name}</span>
                            <span className="text-[9px] font-mono font-bold text-slate-400">Score: {score !== null ? `${Math.round(score)}%` : "N/A"}</span>
                          </div>
                          <div className="space-y-1 font-mono text-[9px]">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Dispo Flotte :</span>
                              <span className="font-bold text-slate-200">{siteData?.dispoSite !== null ? `${Math.round(siteData!.dispoSite!)}%` : "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Pannes actives :</span>
                              <span className="font-bold text-red-400">{siteData?.pannesOuvertesSite || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">BT Ouverts :</span>
                              <span className="font-bold text-blue-400">{siteData?.openWOsCount || 0} ({siteData?.avgAgeDays ? `${Math.round(siteData.avgAgeDays)}j` : "—"})</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Taux Préventif :</span>
                              <span className="font-bold text-emerald-400">{siteData?.complianceSite !== null ? `${Math.round(siteData!.complianceSite!)}%` : "0%"}</span>
                            </div>
                          </div>
                          <div className="border-t border-slate-800 pt-1 flex items-center justify-between text-[8px] text-slate-400 font-mono">
                            <span>Fraîcheur :</span>
                            <span className="font-bold text-slate-300">
                              {siteData?.lastUpdateMs ? formatFreshness(siteData.lastUpdateMs) : "Aucun signal"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}

            </div>
          </CardContent>

          <div className="p-3 bg-slate-900/40 border-t border-slate-800/40 text-[9px] text-slate-400 text-center font-mono uppercase">
            Cliquez sur un site pour déplier son analyse détaillée ci-dessus.
          </div>
        </Card>

        {/* FIL D'ACTIVITÉ EN DIRECT (col-span-7) */}
        <Card className="lg:col-span-7 bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden relative flex flex-col justify-between h-[450px]">
          <CardHeader className="bg-slate-50 border-b border-slate-200/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-amber-600 animate-pulse" />
                <div>
                  <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-900 font-mono">
                    Télémétrie d'Activité en Direct
                  </CardTitle>
                  <CardDescription className="text-[11px] text-slate-500 font-medium">
                    Historique en temps réel des actions, pannes et interventions métiers sur les chantiers.
                  </CardDescription>
                </div>
              </div>
              <span className="text-[9px] font-mono font-black text-emerald-600 bg-emerald-50 border border-emerald-200/50 rounded px-2 py-0.5 animate-pulse uppercase">
                ● temps réel actif
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-4 flex-1 overflow-y-auto space-y-3 font-mono text-xs">
            {recentActivitiesList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center text-slate-400">
                <Clock className="h-8 w-8 text-slate-300 mb-2" />
                <span className="font-extrabold uppercase tracking-wider text-[10px]">Aucune activité récente</span>
                <p className="text-[9px] text-slate-400 mt-1">Le flux d'activité se mettra à jour dès qu'une panne, un BT ou une intervention sera enregistrée.</p>
              </div>
            ) : (
              <div className="relative pl-4 space-y-4 border-l border-slate-200 ml-2">
                {recentActivitiesList.map((act) => {
                  let iconColor = "bg-blue-100 text-blue-600 border-blue-200";
                  let IconComponent = Wrench;
                  let badgeStyle = "bg-blue-50 text-blue-700 border-blue-150";
                  let dotColor = "bg-blue-500";

                  if (act.type === "panne") {
                    iconColor = "bg-red-100 text-red-600 border-red-200";
                    IconComponent = AlertTriangle;
                    badgeStyle = "bg-red-50 text-red-700 border-red-150";
                    dotColor = "bg-red-500";
                  } else if (act.type === "task_cloture") {
                    iconColor = "bg-emerald-100 text-emerald-600 border-emerald-200";
                    IconComponent = CheckCircle2;
                    badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-150";
                    dotColor = "bg-emerald-500";
                  } else if (act.type === "loto_pose") {
                    iconColor = "bg-amber-100 text-amber-600 border-amber-200";
                    IconComponent = Lock;
                    badgeStyle = "bg-amber-50 text-amber-700 border-amber-150";
                    dotColor = "bg-amber-500";
                  } else if (act.type === "loto_levee") {
                    iconColor = "bg-slate-100 text-slate-600 border-slate-200";
                    IconComponent = Unlock;
                    badgeStyle = "bg-slate-50 text-slate-700 border-slate-150";
                    dotColor = "bg-slate-500";
                  } else if (act.type === "checklist_ko") {
                    iconColor = "bg-rose-100 text-rose-600 border-rose-200";
                    IconComponent = XCircle;
                    badgeStyle = "bg-rose-50 text-rose-700 border-rose-150";
                    dotColor = "bg-rose-500";
                  }

                  return (
                    <div key={act.id} className="relative group hover:translate-x-0.5 transition-transform duration-200">
                      {/* Timeline Dot */}
                      <span className="absolute -left-[23px] top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm z-10">
                        <span className={`h-2 w-2 rounded-full ${dotColor}`} />
                      </span>

                      <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1 hover:border-slate-300 transition-colors">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-xs">
                            <span className={`p-1 rounded-md ${iconColor} border`}>
                              <IconComponent className="h-3.5 w-3.5" />
                            </span>
                            <span>{act.title}</span>
                          </div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">
                            {formatFreshness(act.timestamp)}
                          </span>
                        </div>

                        <p className="text-[10.5px] text-slate-500 font-medium leading-relaxed pt-1">
                          {act.description}
                        </p>

                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                          <span className="text-[9px] font-bold text-slate-400">
                            ID: {act.id.slice(0, 18)}...
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-tight border ${badgeStyle}`}>
                            SITE : {act.site}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>

          <div className="p-3 bg-slate-50 border-t border-slate-200/60 flex justify-between items-center text-[9px] text-slate-400 font-mono uppercase">
            <span>Flux sécurisé via Firebase</span>
            <span>Total : {recentActivitiesList.length} capturés</span>
          </div>
        </Card>

      </div>

      {/* --- SECTION 4 : FIABILITÉ PAR MODÈLE ET TOP PANNES/PIÈCES --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Ce qui arrive */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden relative">
          <CardHeader className="bg-slate-50 border-b border-slate-200/50 p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600 animate-pulse" />
              <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-900 font-mono">
                Ce Qui Arrive (PM Planifiées - 7 Jours)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="text-center py-6 text-slate-400 text-xs">Analyse du calendrier préventif...</div>
            ) : pmAVenir7Jours.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs font-mono">
                Aucune PM planifiée cette semaine
              </div>
            ) : (
              <div className="space-y-2.5 font-mono text-xs max-h-[300px] overflow-y-auto pr-1">
                {pmAVenir7Jours.map((task: any) => {
                  const dateStr = task.datePlanifiee
                    ? new Date(task.datePlanifiee).toLocaleDateString("fr-FR", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })
                    : "N/A";
                  return (
                    <div
                      key={task.id}
                      className="flex justify-between items-center p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg transition-all"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-950 uppercase">
                            {task.enginId || "Machine"}
                          </span>
                          <span className="text-[10px] bg-slate-150 text-slate-700 px-1.5 py-0.5 rounded font-bold uppercase">
                            {task.siteId || task.site || "SMI"}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-600 font-medium line-clamp-1">
                          {task.titre || task.type}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-amber-700 font-extrabold text-[11px] bg-amber-50 border border-amber-200/50 rounded px-1.5 py-0.5">
                          {dateStr}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Fiabilité — Analyse Profonde */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden relative">
          <CardHeader className="bg-slate-50 border-b border-slate-200/50 p-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-slate-500" />
              <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-700 font-mono">
                Fiabilité — Analyse Profonde
              </CardTitle>
            </div>
            {setActiveTab && (
              <button 
                onClick={() => setActiveTab("analyses")}
                className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-700 transition-colors font-mono tracking-tight flex items-center gap-0.5"
              >
                voir l'analyse complète
                <ChevronRight className="h-3 w-3" />
              </button>
            )}
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Column 1: Model Reliability */}
              <div className="space-y-2 border-r border-slate-100 pr-2 last:border-r-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">
                  Modèles (Taux Panne / 90j)
                </span>
                {isLoading ? (
                  <div className="text-slate-400 text-xs py-2">Calcul...</div>
                ) : modelsReliability.length === 0 ? (
                  <div className="text-slate-400 text-[11px] py-2">Aucun historique</div>
                ) : (
                  <div className="space-y-1.5">
                    {modelsReliability.map((item) => (
                      <div
                        key={item.model}
                        onClick={() => setSelectedModelName(item.model)}
                        className="flex justify-between items-center p-1.5 bg-slate-50/50 hover:bg-slate-100/80 border border-slate-100 rounded-md cursor-pointer transition-all text-[11px]"
                      >
                        <span className="font-extrabold text-slate-800 uppercase truncate max-w-[80px]" title={item.model}>
                          {item.model}
                        </span>
                        <span className="text-red-600 font-bold text-right shrink-0">
                          {item.tauxPanneMoyen.toFixed(1)}/mach
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Column 2: Pieces Selection */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">
                  Organes Sollicités (Ce mois)
                </span>
                {isLoading ? (
                  <div className="text-slate-400 text-xs py-2">Calcul...</div>
                ) : topPiecesStats.length === 0 ? (
                  <div className="text-slate-400 text-[11px] py-2">Aucun historique</div>
                ) : (
                  <div className="space-y-1.5">
                    {topPiecesStats.map((item) => (
                      <div
                        key={item.name}
                        onClick={() => setSelectedPieceName(item.name)}
                        className="flex justify-between items-center p-1.5 bg-slate-50/50 hover:bg-slate-100/80 border border-slate-100 rounded-md cursor-pointer transition-all text-[11px]"
                      >
                        <span className="font-extrabold text-slate-800 uppercase truncate max-w-[100px]" title={item.name}>
                          {item.name}
                        </span>
                        <span className="font-bold text-slate-500 shrink-0">
                          {item.count}×
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* --- SECTION 5 : RESSOURCES HUMAINES --- */}
      <Card className="bg-white border-2 border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] rounded-2xl overflow-hidden relative">
        <CardHeader className="bg-slate-50 border-b border-slate-200/50 p-5">
          <div className="flex items-center gap-2.5">
            <Users className="h-5 w-5 text-indigo-600" />
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-900 font-mono">
                Ressources Humaines & Pilotage d'Équipe
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500 font-medium">
                Indicateurs consolidés sur l'efficience des techniciens, l'équilibrage des interventions et l'accompagnement diagnostique personnalisé.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-6 font-mono text-xs">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. Bloc Palmarès du mois */}
            <div className="space-y-3 bg-slate-50/40 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Crown className="h-4 w-4 text-amber-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Palmarès du Mois</span>
              </div>
              
              {isLoading ? (
                <div className="text-slate-400 text-xs">Recherche des meilleurs engagements...</div>
              ) : felicitationsMecaniciens.length === 0 ? (
                <div className="p-4 bg-white border border-slate-150 text-slate-500 rounded-xl text-center">
                  Aucun dossier mécanicien éligible aux félicitations ce mois-ci.
                </div>
              ) : (
                <div className="space-y-3">
                  {felicitationsMecaniciens.map(({ mecanicien, scoreCombine }) => (
                    <div key={mecanicien.uid || mecanicien.id} className="p-3 bg-white border border-slate-150 rounded-xl flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 font-extrabold shrink-0 text-xs">
                          {mecanicien.prenom ? mecanicien.prenom.charAt(0) : mecanicien.nomComplet?.charAt(0) || "M"}
                        </div>
                        <div>
                          <span className="font-bold text-slate-950 uppercase block">
                            {mecanicien.prenom} {mecanicien.nom || mecanicien.nomComplet}
                          </span>
                          <span className="text-[9px] text-slate-400 uppercase block">
                            Matricule : {mecanicien.matricule} — {mecanicien.siteId || "Site Inconnu"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-[10.5px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          <UserCheck className="h-3 w-3" />
                          {scoreCombine}%
                        </span>
                        <p className="text-[8px] text-slate-400 uppercase mt-0.5">Complétion</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Bloc Charge de travail */}
            <div className="space-y-3 bg-slate-50/40 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Activity className="h-4 w-4 text-indigo-500" />
                <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Charge de Travail par Site</span>
              </div>
              
              {isLoading ? (
                <div className="text-slate-400 text-xs">Analyse de la répartition...</div>
              ) : (
                <div className="space-y-3">
                  {compareInterSites.sitesData.map(sData => {
                    const charge = sData.charge || 0;
                    
                    // Color code charge
                    let chargeColor = "bg-emerald-500";
                    let textAlert = "Équilibrée";
                    if (charge > 4) {
                      chargeColor = "bg-red-500";
                      textAlert = "Surcharge critique";
                    } else if (charge > 2.5) {
                      chargeColor = "bg-amber-500";
                      textAlert = "Soutenue";
                    }

                    // Max scale for percentage visual bar (assume max 6 tasks as 100%)
                    const percentage = Math.min(100, Math.round((charge / 6) * 100));

                    return (
                      <div key={sData.site} className="space-y-1.5 p-2 bg-white border border-slate-100 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center font-bold text-[10px]">
                          <span className="text-slate-900 uppercase font-black">{sData.site}</span>
                          <span className="text-slate-500 text-[9px]">
                            {charge.toFixed(1)} BT/méca ({textAlert})
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${chargeColor} rounded-full transition-all`} style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Bloc À accompagner (Diagnostic-driven) */}
            <div className="space-y-3 bg-slate-50/40 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Wrench className="h-4 w-4 text-sky-500" />
                <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider">À Accompagner (Contexte)</span>
              </div>
              
              {isLoading ? (
                <div className="text-slate-400 text-xs">Analyse des besoins de soutien...</div>
              ) : mecaniciensAAccompagner.length === 0 ? (
                <div className="p-4 bg-white border border-slate-150 text-slate-500 rounded-xl text-center font-bold">
                  Aucun écart notable ce mois-ci.
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {mecaniciensAAccompagner.map(({ mecanicien, category, statusReason, interventionsCeMois }) => {
                    let badgeColor = "text-sky-700 bg-sky-50 border-sky-100";
                    let diagnosticLabel = "Accompagnement requis";
                    
                    if (category === "BLOCAGE_EXTERNE") {
                      badgeColor = "text-red-700 bg-red-50 border-red-100";
                      diagnosticLabel = "Blocage logistique";
                    } else if (category === "SURCHARGE") {
                      badgeColor = "text-amber-700 bg-amber-50 border-amber-100";
                      diagnosticLabel = "Surcharge opérationnelle";
                    }

                    return (
                      <div key={mecanicien.uid || mecanicien.id} className="p-2.5 bg-white border border-slate-150 rounded-xl space-y-2 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 uppercase block text-[10.5px]">
                              {mecanicien.prenom} {mecanicien.nom || mecanicien.nomComplet}
                            </span>
                            <span className="text-[8.5px] text-slate-400 uppercase">
                              Matricule : {mecanicien.matricule} — {mecanicien.siteId || "Site Inconnu"}
                            </span>
                          </div>
                          <span className="text-[8px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                            {interventionsCeMois} résolu(s)
                          </span>
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center justify-center text-[8.5px] font-black uppercase px-2 py-0.5 rounded border ${badgeColor} w-max`}>
                            {diagnosticLabel}
                          </span>
                          <span className="text-[9.5px] text-slate-600 font-medium leading-relaxed">
                            {statusReason}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </CardContent>
      </Card>

      {/* --- SECTION 6 : ESPACE DE DIAGNOSTIC ET SYNTHÈSE DE PERFORMANCE --- */}
      <Card className="border-2 border-[#D4AF37] bg-white rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(212,175,55,0.08)] relative">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-[#D4AF37] to-yellow-600" />
        
        {/* Corner L-brackets */}
        <div className="absolute top-3 left-3 w-2 h-2 border-t-2 border-l-2 border-[#D4AF37]/60" />
        <div className="absolute top-3 right-3 w-2 h-2 border-t-2 border-r-2 border-[#D4AF37]/60" />
        <div className="absolute bottom-3 left-3 w-2 h-2 border-b-2 border-l-2 border-[#D4AF37]/60" />
        <div className="absolute bottom-3 right-3 w-2 h-2 border-b-2 border-r-2 border-[#D4AF37]/60" />

        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] font-mono font-black uppercase tracking-widest text-[#D4AF37] bg-slate-950 rounded-md">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                CONSOLIDATION DU RÉSEAU
              </span>
              <h3 className="text-base font-black uppercase tracking-tight text-slate-950 font-mono">
                Espace de Synthèse Opérationnelle — Diagnostic de Performance
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Générez des analyses et directives basées sur les données factuelles consolidées de la plateforme.
              </p>
            </div>
            <button
              onClick={() => {
                setSiteAnalysis(generateGlobalAnalysis());
                setAnalysisGenerated(true);
              }}
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-slate-950 hover:bg-slate-900 text-[#D4AF37] border-2 border-[#D4AF37] font-mono font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              Lancer l'Analyse Globale
            </button>
          </div>

          {siteAnalysis && !activeSiteTab.includes("ensemble") && analysisGenerated ? (
            // If we generated a site-specific analysis, show it or reset on tab change.
            // Actually, we can check if it's there.
            <div className="bg-gradient-to-br from-amber-50/20 via-white to-slate-50/40 border border-amber-200/50 rounded-2xl p-6 md:p-8 space-y-4 max-h-[500px] overflow-y-auto animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b border-amber-100 pb-3">
                <span className="text-[10px] font-mono font-black text-[#D4AF37] uppercase tracking-wider">Rapport Opérationnel — Consolidation</span>
                <span className="text-[8.5px] font-mono text-slate-400">Analyse déterministe d'après les indicateurs du site</span>
              </div>
              <div className="space-y-3 font-sans text-xs leading-relaxed text-slate-800">
                {renderAnalysisText(siteAnalysis)}
              </div>
            </div>
          ) : siteAnalysis ? (
            <div className="bg-gradient-to-br from-amber-50/20 via-white to-slate-50/40 border border-amber-200/50 rounded-2xl p-6 md:p-8 space-y-4 max-h-[500px] overflow-y-auto animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b border-amber-100 pb-3">
                <span className="text-[10px] font-mono font-black text-[#D4AF37] uppercase tracking-wider">Rapport Opérationnel — Consolidation</span>
                <span className="text-[8.5px] font-mono text-slate-400">Analyse déterministe d'après les indicateurs du site</span>
              </div>
              <div className="space-y-3 font-sans text-xs leading-relaxed text-slate-800">
                {renderAnalysisText(siteAnalysis)}
              </div>
            </div>
          ) : (
            <div className="p-8 border border-slate-200 border-dashed rounded-2xl bg-slate-50/50 text-center space-y-3">
              <Sparkles className="h-10 w-10 text-[#D4AF37] mx-auto animate-pulse" />
              <p className="text-[11px] text-slate-500 font-medium font-mono uppercase">
                Aucune analyse globale n'a été générée pour ce mois.
              </p>
              <p className="text-[10px] text-slate-400 max-w-md mx-auto">
                Cliquez sur le bouton ci-dessus pour lancer la consolidation automatique de la performance de tous les sites d'Hydromines.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
        </>
      ) : (
        /* ==========================================
           SPECIFIC SITE DASHBOARD VIEW
           ========================================== */
        (() => {
          const site = activeSiteTab; // e.g. "SMI"
          
          // Get specific targets
          const tgt = (objectifsSitesRaw || []).find((o: any) => o.id === site) || {
            dispoTarget: 85,
            complianceTarget: 80,
            mttrTarget: 4,
            coutTarget: 1500
          };

          const siteDispo = getSiteDispo(site, moisReference);
          const siteCompliance = getSiteCompliance(site, moisReference);
          const siteMttr = getSiteMttr(site, moisReference);
          const siteCoutVal = getSiteCout(site, moisReference);

          // Pannes actives filtrées
          const sitePannesActive = (pannesLive || []).filter(p => !p.deleted && (p.siteId === site || p.site === site) && p.statut !== "CLOS");
          const sitePannesClosesCeMois = (pannesLive || []).filter(p => !p.deleted && (p.siteId === site || p.site === site) && p.statut === "CLOS" && getPanneCloseMonth(p) === moisReference);

          // Bons de travail du mois
          const siteWorkOrdersCeMois = (workOrdersLive || []).filter(w => !w.deleted && (w.siteId === site || w.site === site) && w.datePlanifiee && w.datePlanifiee.startsWith(moisReference));
          const siteImmobilizedEngins = (enginsLive || []).filter(e => (e.siteId === site || e.site === site) && (e.statut === "IMMOBILISE" || e.disponibilite === "NON"));

          // Helper for metric compared to targets
          const renderSiteGoalCard = (label: string, value: number | null, target: number, unit: string, isLowerBetter: boolean = false) => {
            if (value === null) {
              return (
                <div className="text-xl font-mono text-slate-400 font-bold">N/A</div>
              );
            }
            const diff = value - target;
            const isOk = isLowerBetter ? diff <= 0 : diff >= 0;
            return (
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {value.toFixed(1)}{unit}
                  </span>
                  <span className={`text-[10px] font-mono font-bold ${isOk ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"} px-1.5 py-0.5 rounded`}>
                    Cible: {target}{unit}
                  </span>
                </div>
                <div className="text-[9px] text-slate-400 font-mono uppercase">
                  {isOk ? "✓ Objectif atteint" : "✗ Sous l'objectif"}
                </div>
              </div>
            );
          };

          return (
            <div className="space-y-6">
              
              {/* CRITICAL ALERTS AND SAFETY REGULATION GRID */}
              {renderCriticalAlertsGrid(site)}

              {/* SYSTEM ALERTS AND BLOCKING PIECES GRID */}
              {renderSystemAlertsAndBlockingPiecesGrid(site)}

              {/* PREVENTIF VS CORRECTIF DYNAMIC KPI ZONE */}
              {renderPreventifCorrectifKPIZone(site)}

              {/* Site KPI Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Availability card */}
                <Card className="border border-slate-200 bg-white relative overflow-hidden rounded-xl">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-mono text-slate-400 font-black uppercase tracking-wider block">Disponibilité Flotte</span>
                      <Building2 className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="mt-2">
                      {renderSiteGoalCard("Disponibilité", siteDispo, tgt.dispoTarget, "%")}
                    </div>
                  </CardContent>
                </Card>

                {/* Preventive compliance card */}
                <Card className="border border-slate-200 bg-white relative overflow-hidden rounded-xl">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-mono text-slate-400 font-black uppercase tracking-wider block">Taux de Préventif Conforme</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="mt-2">
                      {renderSiteGoalCard("Préventif", siteCompliance, tgt.complianceTarget, "%")}
                    </div>
                  </CardContent>
                </Card>

                {/* Active pannes card */}
                <Card className="border border-slate-200 bg-white relative overflow-hidden rounded-xl">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-mono text-slate-400 font-black uppercase tracking-wider block">Pannes Actives</span>
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="mt-2 font-mono">
                      <div className="text-2xl font-black text-slate-900">
                        {sitePannesActive.length} <span className="text-xs text-slate-400 font-bold font-sans">ouvertes</span>
                      </div>
                      <div className="text-[9px] text-slate-400 uppercase font-black mt-1">
                        {sitePannesClosesCeMois.length} résolues ce mois-ci
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Estimated site cost card */}
                <Card className="border border-slate-200 bg-white relative overflow-hidden rounded-xl">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-sky-500" />
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-mono text-slate-400 font-black uppercase tracking-wider block">Estimation des Coûts (Mois)</span>
                      <DollarSign className="h-4 w-4 text-sky-500" />
                    </div>
                    <div className="mt-2">
                      {renderSiteGoalCard("Coût Horaire", siteCoutVal, tgt.coutTarget, " DH/h", true)}
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* Two Column Grid: Fleet Status & AI Directives */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Fleet status table */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Site active work orders */}
                  <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden relative">
                    <CardHeader className="bg-slate-50 border-b border-slate-200/50 p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-amber-500" />
                          <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-900 font-mono">
                            Dernières Interventions Récentes ({site})
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {siteWorkOrdersCeMois.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 font-mono text-xs">
                          Aucune tâche répertoriée ce mois-ci sur le site {site}.
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100 font-mono text-[11px]">
                          {siteWorkOrdersCeMois.slice(0, 10).map((wo) => {
                            const dateStr = wo.datePlanifiee ? new Date(wo.datePlanifiee).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' }) : "N/A";
                            return (
                              <div key={wo.id} className="p-3.5 flex justify-between items-center hover:bg-slate-50/50">
                                <div className="space-y-1">
                                  <span className="font-black text-slate-950 block uppercase text-xs">
                                    {wo.titre || wo.description}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block uppercase">
                                    Type : {wo.type} — {wo.enginId}
                                  </span>
                                </div>
                                <div className="text-right space-y-1">
                                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ${
                                    wo.statut === "FAIT" || wo.statut === "VALIDE" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                                  }`}>
                                    {wo.statut || "PROGRAMMÉ"}
                                  </span>
                                  <p className="text-[9px] text-slate-400">{dateStr}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                </div>

                {/* Right Column: Site-specific performance analysis panel */}
                <div className="lg:col-span-5 space-y-6">
                  
                  <Card className="border-2 border-[#D4AF37] bg-white rounded-2xl overflow-hidden shadow-lg relative">
                    <CardHeader className="bg-slate-50 border-b border-[#D4AF37]/20 p-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                        <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-900 font-mono">
                          Directives de Performance - {site}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Générez des instructions et analyses de performance ciblées pour optimiser la disponibilité de la flotte du site <strong className="uppercase">{site}</strong>.
                      </p>
                      
                      <button
                        onClick={() => {
                          setSiteAnalysis(generateSiteAnalysis(site));
                          setAnalysisGenerated(true);
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-950 text-[#D4AF37] hover:bg-slate-900 border-2 border-[#D4AF37] font-mono font-black text-[11px] uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        Analyser la performance de {site}
                      </button>

                      {analysisGenerated && siteAnalysis ? (
                        <div className="bg-amber-50/20 border border-amber-200/50 rounded-xl p-4 space-y-3 max-h-[350px] overflow-y-auto animate-in fade-in duration-200">
                          <span className="text-[9px] font-mono font-black text-[#D4AF37] uppercase tracking-wider block">Rapport de performance {site} :</span>
                          <div className="font-mono text-[10.5px] leading-relaxed text-slate-800 space-y-2">
                            {renderAnalysisText(siteAnalysis)}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-center text-slate-400 font-mono text-[10px]">
                          Cliquez ci-dessus pour générer les analyses du site.
                        </div>
                      )}
                    </CardContent>
                  </Card>

                </div>

              </div>

            </div>
          );
        })()
      )}

      {/* MODALS POUR DRILL-THROUGH */}
      <AnimatePresence>
        {/* Modal 1: Anomalies par site */}
        {selectedAnomalySite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
              <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-mono">
                    Anomalies & Pannes - Site : {selectedAnomalySite}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedAnomalySite(null)} 
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-4">
                {groupingSentence && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-mono font-bold leading-relaxed flex items-start gap-2.5">
                    <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{groupingSentence}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                    Pannes individuelles du mois en cours
                  </span>
                  {sitePannesForMonth.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs font-mono">
                      Aucune panne enregistrée ce mois-ci sur ce site.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      {sitePannesForMonth.map((p) => {
                        const eng = (enginsLive || []).find(e => e.id === p.enginId);
                        const engName = eng ? `${eng.matricule || eng.nom} (${(eng.modele || eng.type || "").toUpperCase()})` : p.enginId || "Engin Inconnu";
                        const gravityColor = p.gravite === "CRITIQUE" ? "bg-red-100 text-red-800 border-red-200" :
                                             p.gravite === "MOYENNE" ? "bg-amber-100 text-amber-800 border-amber-200" :
                                             "bg-slate-100 text-slate-800 border-slate-200";

                        return (
                          <div key={p.id} className="p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono">
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 text-[11px] uppercase tracking-tight bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                  {engName}
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${gravityColor}`}>
                                  {p.gravite || "GRAVITÉ INCONNUE"}
                                </span>
                                <span className="text-slate-400 text-[10px]">
                                  {p.dateDeclaration ? new Date(p.dateDeclaration).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' }) : "Date inconnue"}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-700 font-medium">
                                <strong className="text-slate-900">[{p.categorie || "Panne"}]</strong> {p.description || p.resume || "Pas de description."}
                              </p>
                            </div>
                            <div className="shrink-0 flex items-center">
                              <button
                                onClick={() => {
                                  handleInvestigateRCA(p);
                                  setSelectedAnomalySite(null);
                                }}
                                className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-white rounded-lg font-bold text-[10.5px] transition-all cursor-pointer"
                              >
                                <Sparkles className="h-3 w-3" />
                                Investiguer (RCA)
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setSelectedAnomalySite(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 2: Top Pièces */}
        {selectedPieceName && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
              <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-amber-500" />
                  <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-mono">
                    Traçabilité Pièce : {selectedPieceName}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedPieceName(null)} 
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-4">
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                    Interventions correctives ayant sollicité cette pièce ce mois-ci
                  </span>
                  {interventionsForPiece.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs font-mono">
                      Aucune intervention enregistrée ce mois-ci mentionnant cette pièce.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      {interventionsForPiece.map((i) => {
                        const eng = (enginsLive || []).find(e => e.id === i.enginId);
                        const engName = eng ? `${eng.matricule || eng.nom} (${(eng.modele || eng.type || "").toUpperCase()})` : i.enginId || "Engin Inconnu";
                        
                        return (
                          <div key={i.id} className="p-4 bg-white space-y-1.5 text-xs font-mono">
                            <div className="flex justify-between items-center flex-wrap gap-2">
                              <span className="font-bold text-slate-900 text-[11px] uppercase tracking-tight bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {engName}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="uppercase text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border">
                                  Site: {i.siteId || i.site || "TOUS"}
                                </span>
                                <span className="text-slate-400 text-[10px]">
                                  {i.date ? new Date(i.date).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' }) : "Date inconnue"}
                                </span>
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-700 font-medium">
                              <strong className="text-slate-900">[{i.nom || i.typeIntervention || "Correction"}]</strong> {i.description || i.rapport || "Aucun rapport saisi."}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setSelectedPieceName(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 3: Fiabilité Modèle */}
        {selectedModelName && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
              <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-500" />
                  <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-mono">
                    Fiabilité par Machine : Modèle {selectedModelName}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedModelName(null)} 
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-4">
                <div className="space-y-3">
                  <div className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    Visualisation individuelle des engins du modèle pour détecter si le taux de panne moyen est influencé par une machine spécifique particulièrement problématique (MTBF bas) ou s'il s'agit d'une défaillance répartie uniformément.
                  </div>
                  
                  {enginsOfSelectedModel.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs font-mono">
                      Aucun engin répertorié pour ce modèle.
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 divide-y divide-slate-150">
                      {enginsOfSelectedModel.map((item) => {
                        const isProblematic = item.pannesCount >= 3;
                        return (
                          <div key={item.id} className="p-3.5 bg-white flex items-center justify-between gap-4 font-mono text-xs">
                            <div className="space-y-1">
                              <span className="font-black text-slate-900 text-xs uppercase bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {item.matricule}
                              </span>
                              <span className="text-[10px] text-slate-400 block uppercase">
                                Site : {item.site}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold ${
                                isProblematic 
                                  ? "bg-red-50 text-red-700 border-red-200" 
                                  : item.pannesCount > 0 
                                  ? "bg-amber-50 text-amber-700 border-amber-200" 
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}>
                                {item.pannesCount} pannes {isProblematic ? "⚠️ (Anomalie cible)" : ""}
                              </span>
                              <p className="text-[9px] text-slate-400 uppercase mt-0.5">Clôturées (90j)</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setSelectedModelName(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
