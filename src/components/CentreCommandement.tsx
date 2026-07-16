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
  Crown
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
  Cell
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

  // States for tab navigation & Mr Mounir's AI assistant
  const [activeSiteTab, setActiveSiteTab] = React.useState<string>("ensemble");
  const [aiLoading, setAiLoading] = React.useState<boolean>(false);
  const [aiResponse, setAiResponse] = React.useState<string | null>(null);

  // State for site expansion
  const [expandedSite, setExpandedSite] = React.useState<string | null>(null);

  // States for drill-down modals
  const [selectedAnomalySite, setSelectedAnomalySite] = React.useState<string | null>(null);
  const [selectedPieceName, setSelectedPieceName] = React.useState<string | null>(null);
  const [selectedModelName, setSelectedModelName] = React.useState<string | null>(null);

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
  const { data: enginsLive, loading: enginsLoading } = useCollection<any>('engins');
  const { data: workOrdersLive, loading: tasksLoading } = useCollection<any>('maintenanceTasks');
  const { data: pannesLive, loading: pannesLoading } = useCollection<any>('pannes');
  const { data: interventions, loading: interventionsLoading } = useCollection<any>('interventions');
  const { data: objectifsSitesRaw, loading: objectifsLoading } = useCollection<any>('objectifsSites');
  
  // Use useMecaniciens for pre-computed rich stats
  const { mecaniciens, loading: mecsLoading } = useMecaniciens();

  const isLoading = enginsLoading || tasksLoading || pannesLoading || interventionsLoading || mecsLoading || objectifsLoading;

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
    const siteEngins = (enginsLive || []).filter(e => !e.deleted && (e.siteId === siteId || e.site === siteId));
    if (siteEngins.length === 0) return null;

    const siteTasksMonth = (workOrdersLive || []).filter(t => !t.deleted && (t.siteId === siteId || t.site === siteId) && t.datePlanifiee && t.datePlanifiee.startsWith(monthStr));
    const sitePannesMonth = (pannesLive || []).filter(p => !p.deleted && (p.siteId === siteId || p.site === siteId) && p.dateDeclaration && p.dateDeclaration.startsWith(monthStr));

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
    const siteWOs = (workOrdersLive || []).filter(b => !b.deleted && (b.siteId === siteId || b.site === siteId));
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

      return {
        site,
        dispoSite,
        pannesOuvertesSite,
        complianceSite,
        chargeMoyenneSite,
        scoreGlobal,
        isEchantillonFaible,
        siteEnginsCount: siteEngins.length,
        siteMecasCount: siteMecas.length
      };
    });

    // Sort list by scoreGlobal lowest to highest (Critical ones first)
    return list.sort((a, b) => {
      const scoreA = a.scoreGlobal !== null ? a.scoreGlobal : 999;
      const scoreB = b.scoreGlobal !== null ? b.scoreGlobal : 999;
      return scoreA - scoreB;
    });
  }, [enginsLive, workOrdersLive, pannesLive, mecaniciens, getNormalizedStatus, getPanneMonth, getTaskMonth, moisReference]);

  // 2. Situation banner computed text
  const situationBanner = React.useMemo(() => {
    if (isLoading || classementSites.length === 0) return "Chargement des indicateurs clés...";

    const stableCount = classementSites.filter(s => s.scoreGlobal !== null && s.scoreGlobal >= 80).length;
    const vigilanceCount = classementSites.filter(s => s.scoreGlobal !== null && s.scoreGlobal >= 60 && s.scoreGlobal < 80).length;
    const critiqueCount = classementSites.filter(s => s.scoreGlobal !== null && s.scoreGlobal < 60).length;

    // Most in difficulty site (lowest score)
    const worstSite = classementSites[0];
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
      return `${stableCount} sites stables, ${siteNoun} nécessite une attention immédiate (${totalProblems} site(s) sous surveillance)${variationSegment}`;
    } else {
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

  // Positive mecanicien recognition (factual leaderboard)
  const felicitationsMecaniciens = React.useMemo(() => {
    if (!mecaniciens) return [];
    
    const eligibleMecas = mecaniciens.filter(m => {
      if (m.active === false) return false;
      if ((m.stats?.interventionsCeMois || 0) < 1) return false; // Lowered constraint slightly to ensure showing if low data
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
  }, [mecaniciens]);

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

  // --- RECHARTS DATA HELPERS & AI ASSISTANT FOR MR MOUNIR ---

  const historicalMonthsData = React.useMemo(() => {
    const months: string[] = [];
    const [currYear, currMonth] = currentMonthStr.split('-').map(Number);
    for (let i = 4; i >= 0; i--) {
      const d = new Date(currYear, currMonth - 1 - i, 1);
      months.push(getLocalMonthString(d));
    }
    
    return months.map(mStr => {
      const stats = getMonthlyStats(mStr);
      const ratioPreventif = stats.totalPreventives + stats.totalCorrectives > 0
        ? Math.round((stats.totalPreventives / (stats.totalPreventives + stats.totalCorrectives)) * 100)
        : 0;
      return {
        name: formatMoisLettres(mStr).split(" ")[0], // simple label e.g., "mai"
        pannes: stats.totalPannes,
        preventives: stats.totalPreventives,
        correctives: stats.totalCorrectives,
        ratio: ratioPreventif,
        cout: stats.totalCost / 1000 // in kDH
      };
    });
  }, [getMonthlyStats, currentMonthStr, formatMoisLettres]);

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

  const handleLaunchAIPanel = async () => {
    setAiLoading(true);
    setAiResponse(null);
    try {
      const response = await fetch("/api/ai/command-center-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteScores: classementSites,
          metrics: comparisonData,
          data: {
            models: modelsReliability,
            pieces: topPiecesStats,
            ratio: globalPreventiveRatio
          }
        })
      });
      const resData = await response.json();
      if (resData.analysis) {
        setAiResponse(resData.analysis);
      } else {
        setAiResponse("Désolé, l'assistant décisionnel a rencontré un problème pour structurer les analyses.");
      }
    } catch (error) {
      console.error("AI client error:", error);
      setAiResponse("Échec de connexion avec le service décisionnel de l'intelligence artificielle.");
    } finally {
      setAiLoading(false);
    }
  };

  const formatBoldText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-extrabold text-amber-950 dark:text-[#E2C799]">{part}</strong>;
      }
      return part;
    });
  };

  const renderMarkdownText = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let cleanLine = line.trim();
      
      if (cleanLine.startsWith("### ")) {
        return <h4 key={idx} className="text-xs font-black text-[#D4AF37] mt-3 mb-1 uppercase font-mono tracking-wider">{cleanLine.substring(4)}</h4>;
      }
      if (cleanLine.startsWith("## ")) {
        return <h3 key={idx} className="text-sm font-black text-amber-900 dark:text-amber-400 mt-4 mb-2 uppercase font-mono tracking-widest border-b border-[#D4AF37]/20 pb-1">{cleanLine.substring(3)}</h3>;
      }
      if (cleanLine.startsWith("# ")) {
        return <h2 key={idx} className="text-base font-black text-amber-950 dark:text-[#F4EAD4] mt-5 mb-2.5 uppercase font-mono tracking-widest">{cleanLine.substring(2)}</h2>;
      }
      
      if (cleanLine.startsWith("- ") || cleanLine.startsWith("* ")) {
        const content = cleanLine.substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-slate-700 dark:text-[#F4EAD4]/80 leading-relaxed font-sans mb-1">
            {formatBoldText(content)}
          </li>
        );
      }
      
      if (cleanLine === "") return <div key={idx} className="h-1.5" />;
      
      return (
        <p key={idx} className="text-xs text-slate-700 dark:text-[#F4EAD4]/80 leading-relaxed font-sans mb-1.5">
          {formatBoldText(cleanLine)}
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

            {/* Chart 2: Stacked Dual-Trend Evolution curves (Pannes & Coûts) */}
            <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm p-4 space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-black uppercase font-mono tracking-wider text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Évolution Historique (5 Derniers Mois)
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">Progression mensuelle consolidée des pannes et des coûts d'intervention.</p>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalMonthsData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCout" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d97706" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "12px" }} />
                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                    <Area yAxisId="left" type="monotone" dataKey="cout" name="Coût (kDH)" stroke="#d97706" fillOpacity={1} fill="url(#colorCout)" strokeWidth={2.5} />
                    <Line yAxisId="right" type="monotone" dataKey="pannes" name="Pannes" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} />
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
                        <th className="py-3 px-4 text-center">Taux Préventif</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold">
                      {classementSites.map((item) => {
                        const score = item.scoreGlobal;
                        const isExpanded = expandedSite === item.site;

                        let scoreColor = "text-red-600";
                        let scoreBg = "bg-red-50 text-red-700 border-red-200/50";
                        let statusDot = "bg-red-500";

                        if (score !== null) {
                          if (score >= 80) {
                            scoreColor = "text-emerald-600";
                            scoreBg = "bg-emerald-50 text-emerald-700 border-emerald-200/50";
                            statusDot = "bg-emerald-500";
                          } else if (score >= 60) {
                            scoreColor = "text-amber-600";
                            scoreBg = "bg-amber-50 text-amber-700 border-amber-200/50";
                            statusDot = "bg-amber-500";
                          }
                        }

                        return (
                          <React.Fragment key={item.site}>
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
                              <td className="py-3 px-4 text-center font-extrabold text-slate-700">
                                {(() => {
                                  const tgt = (objectifsSitesRaw || []).find((o: any) => o.id === item.site);
                                  const compliancePrev = getSiteCompliance(item.site, prevMonthStr);
                                  return renderMetricWithTarget(item.complianceSite, compliancePrev, tgt?.complianceTarget, false, "%");
                                })()}
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
                                <td colSpan={6} className="p-4 bg-slate-50/70 border-t border-b border-slate-100">
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

      {/* --- SECTION 4 : FIABILITÉ PAR MODÈLE ET TOP PANNES/PIÈCES --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sub-card 1: Fiabilité par modèle */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden relative">
          <CardHeader className="bg-slate-50 border-b border-slate-200/50 p-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-900 font-mono">
                Fiabilité par Modèle d'Engin (Derniers 90 jours)
              </CardTitle>
            </div>
            {setActiveTab && (
              <button 
                onClick={() => setActiveTab("analyses")}
                className="text-[10px] font-black uppercase text-amber-600 hover:text-amber-800 transition-colors font-mono tracking-tight flex items-center gap-0.5"
              >
                voir l'analyse complète
                <ChevronRight className="h-3 w-3" />
              </button>
            )}
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="text-center py-6 text-slate-400 text-xs">Analyse de la flotte...</div>
            ) : modelsReliability.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">Aucune panne clôturée sur les 90 derniers jours.</div>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                {modelsReliability.map((item, index) => (
                  <div 
                    key={item.model} 
                    onClick={() => setSelectedModelName(item.model)}
                    className="flex justify-between items-center p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg cursor-pointer transition-all hover:translate-x-0.5 active:translate-x-0"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-950 uppercase">{item.model}</span>
                      <p className="text-[10px] text-slate-500 font-medium">Effectif : {item.numEngins} machine(s)</p>
                    </div>
                    <div className="text-right space-y-0.5 font-bold">
                      <span className="text-red-600">{item.tauxPanneMoyen.toFixed(1)} panne/engin</span>
                      <p className="text-[10px] text-slate-500 font-medium">MTBF : {item.mtbf ? `${item.mtbf}h` : "N/A"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sub-card 2: Top Pieces */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden relative">
          <CardHeader className="bg-slate-50 border-b border-slate-200/50 p-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-amber-600" />
              <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-900 font-mono">
                Top Pièces les Plus Concernées (Ce mois)
              </CardTitle>
            </div>
            {setActiveTab && (
              <button 
                onClick={() => setActiveTab("analyses")}
                className="text-[10px] font-black uppercase text-amber-600 hover:text-amber-800 transition-colors font-mono tracking-tight flex items-center gap-0.5"
              >
                voir l'analyse complète
                <ChevronRight className="h-3 w-3" />
              </button>
            )}
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="text-center py-6 text-slate-400 text-xs">Calcul des pièces consommées...</div>
            ) : topPiecesStats.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">Aucune consommation de pièce répertoriée ce mois-ci.</div>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                {topPiecesStats.map((item, index) => (
                  <div 
                    key={item.name} 
                    onClick={() => setSelectedPieceName(item.name)}
                    className="flex justify-between items-center p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg cursor-pointer transition-all hover:translate-x-0.5 active:translate-x-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center h-5 w-5 bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px] rounded">
                        #{index + 1}
                      </span>
                      <span className="font-bold text-slate-950 uppercase">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-800 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded">
                      {item.count} fois sollicitée
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* --- SECTION 5 : VOLET HUMAIN (BAS DE PAGE) --- */}
      <Card className="bg-white border-2 border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] rounded-2xl overflow-hidden relative">
        <CardHeader className="bg-slate-50 border-b border-slate-200/50 p-5">
          <div className="flex items-center gap-2.5">
            <Users className="h-5 w-5 text-amber-600" />
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-900 font-mono">
                Volet Humain & Management d'Équipe
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500 font-medium">
                Indicateurs factuels sur la répartition de la charge opérationnelle de maintenance et valorisation positive de l'efficience des mécaniciens.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-6 font-mono text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left human column: Workload by site */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Répartition de la Charge de Travail</span>
              
              {isLoading ? (
                <div className="text-slate-400 text-xs">Analyse de la répartition...</div>
              ) : (
                <div className="space-y-3.5">
                  {compareInterSites.sitesData.map(sData => {
                    const charge = sData.charge || 0;
                    
                    // Color code charge
                    let chargeColor = "bg-emerald-500";
                    let textAlert = "Charge Équilibrée";
                    if (charge > 4) {
                      chargeColor = "bg-red-500";
                      textAlert = "Surcharge critique";
                    } else if (charge > 2.5) {
                      chargeColor = "bg-amber-500";
                      textAlert = "Charge soutenue";
                    }

                    // Max scale for percentage visual bar (assume max 8 tasks as 100%)
                    const percentage = Math.min(100, Math.round((charge / 6) * 100));

                    return (
                      <div key={sData.site} className="space-y-1">
                        <div className="flex justify-between items-center font-bold text-[10px]">
                          <span className="text-slate-900 uppercase font-black">{sData.site}</span>
                          <span className="text-slate-500">
                            {charge.toFixed(1)} tâches / méca ({textAlert})
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

            {/* Right human column: Positive recognition (Félicitations) */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Félicitations & Engagement Technique (Ce mois)</span>
              
              {isLoading ? (
                <div className="text-slate-400 text-xs">Recherche des meilleurs engagements...</div>
              ) : felicitationsMecaniciens.length === 0 ? (
                <div className="p-4 bg-slate-50 text-slate-500 rounded-xl text-center">
                  Aucun dossier mécanicien éligible aux félicitations ce mois-ci.
                </div>
              ) : (
                <div className="space-y-3">
                  {felicitationsMecaniciens.map(({ mecanicien, scoreCombine, scoreTournees, scoreMttr }) => (
                    <div key={mecanicien.uid || mecanicien.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between">
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
                        <p className="text-[9px] text-slate-400 uppercase mt-0.5">Indice de complétion</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </CardContent>
      </Card>

      {/* --- SECTION 6 : ESPACE DÉCISIONNEL IA CONSOLIDÉ --- */}
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
                ASSISTANT STRATÉGIQUE IA
              </span>
              <h3 className="text-base font-black uppercase tracking-tight text-slate-950 font-mono">
                Espace Décisionnel Stratégique — Mr : MOUNIR Outbrrit
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Générez des directives prescriptives pour chaque site d'Hydromines basées sur les données factuelles de la plateforme.
              </p>
            </div>
            <button
              onClick={handleLaunchAIPanel}
              disabled={aiLoading}
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-slate-950 hover:bg-slate-900 text-[#D4AF37] border-2 border-[#D4AF37] font-mono font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
            >
              <Activity className={`w-4 h-4 ${aiLoading ? "animate-spin" : "animate-pulse"}`} />
              {aiLoading ? "Analyse en cours..." : "Lancer l'Analyse Globale IA"}
            </button>
          </div>

          {aiLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-4 text-center">
              <div className="h-12 w-12 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
              <div className="space-y-1">
                <span className="text-xs font-mono font-black uppercase text-[#D4AF37] tracking-widest block animate-pulse">Consultation de la base de connaissances...</span>
                <p className="text-[10px] text-slate-400 font-mono">Consolidation des pannes, des coûts, des MTTR et conformités d'Hydromines.</p>
              </div>
            </div>
          ) : aiResponse ? (
            <div className="bg-gradient-to-br from-amber-50/20 via-white to-slate-50/40 border border-amber-200/50 rounded-2xl p-6 md:p-8 space-y-4 max-h-[500px] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-amber-100 pb-3">
                <span className="text-[10px] font-mono font-black text-[#D4AF37] uppercase tracking-wider">Rapport Directif — Mounir Outbrrit</span>
                <span className="text-[8.5px] font-mono text-slate-400">Analyse Générée d'après la plateforme</span>
              </div>
              <div className="space-y-3 font-sans text-xs leading-relaxed text-slate-800">
                {renderMarkdownText(aiResponse)}
              </div>
            </div>
          ) : (
            <div className="p-8 border border-slate-200 border-dashed rounded-2xl bg-slate-50/50 text-center space-y-3">
              <Sparkles className="h-10 w-10 text-[#D4AF37] mx-auto animate-pulse" />
              <p className="text-[11px] text-slate-500 font-medium font-mono uppercase">
                Aucune analyse globale n'a été exécutée pour ce mois.
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
                  
                  {/* Immobilized machines */}
                  <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden relative">
                    <CardHeader className="bg-slate-50 border-b border-slate-200/50 p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-red-500" />
                          <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-900 font-mono">
                            Engins Immobilisés sur {site} ({siteImmobilizedEngins.length})
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {siteImmobilizedEngins.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 font-mono text-xs">
                          Aucun engin immobilisé sur le site {site}. Performance optimale !
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs font-mono">
                            <thead>
                              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase text-slate-500">
                                <th className="py-2.5 px-4">Engin / Matricule</th>
                                <th className="py-2.5 px-4">Modèle / Type</th>
                                <th className="py-2.5 px-4 text-center">Statut</th>
                                <th className="py-2.5 px-4 text-right">Raison</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-bold">
                              {siteImmobilizedEngins.map((eng) => (
                                <tr key={eng.id} className="hover:bg-slate-50/50">
                                  <td className="py-3 px-4 font-black uppercase text-slate-950">{eng.matricule || eng.nom}</td>
                                  <td className="py-3 px-4 uppercase text-slate-500">{eng.modele || eng.type || "N/A"}</td>
                                  <td className="py-3 px-4 text-center">
                                    <span className="inline-block px-2 py-0.5 rounded bg-red-100 border border-red-200 text-red-700 text-[10px] font-black">
                                      IMMOBILISÉ
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-right text-red-500 uppercase text-[10px]">
                                    {eng.raisonImmobilisation || "Panne non résolue"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>

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
                          {siteWorkOrdersCeMois.slice(0, 5).map((wo) => {
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

                {/* Right Column: Site-specific AI Directives panel */}
                <div className="lg:col-span-5 space-y-6">
                  
                  <Card className="border-2 border-[#D4AF37] bg-white rounded-2xl overflow-hidden shadow-lg relative">
                    <CardHeader className="bg-slate-50 border-b border-[#D4AF37]/20 p-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#D4AF37] animate-pulse" />
                        <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-900 font-mono">
                          Directives IA Spécifiques - {site}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Générez des instructions et analyses décisionnelles ciblées pour optimiser la disponibilité de la flotte du site <strong className="uppercase">{site}</strong>.
                      </p>
                      
                      <button
                        onClick={async () => {
                          setAiLoading(true);
                          setAiResponse(null);
                          try {
                            const response = await fetch("/api/ai/command-center-analysis", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                siteScores: classementSites.filter(s => s.site === site),
                                metrics: {
                                  current: {
                                    totalPannes: sitePannesActive.length + sitePannesClosesCeMois.length,
                                    totalPreventives: siteWorkOrdersCeMois.filter(w => w.type === "PREVENTIF" && w.statut === "FAIT").length,
                                    totalCorrectives: siteWorkOrdersCeMois.filter(w => w.type === "CORRECTIF" && w.statut === "FAIT").length,
                                    totalCost: siteCoutVal || 0
                                  }
                                },
                                data: {
                                  siteName: site,
                                  immobilizedCount: siteImmobilizedEngins.length,
                                  pannesCount: sitePannesActive.length
                                }
                              })
                            });
                            const resData = await response.json();
                            setAiResponse(resData.analysis || "Rapport structuré.");
                          } catch (e) {
                            setAiResponse("Impossible de joindre le consultant.");
                          } finally {
                            setAiLoading(false);
                          }
                        }}
                        disabled={aiLoading}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-950 text-[#D4AF37] hover:bg-slate-900 border-2 border-[#D4AF37] font-mono font-black text-[11px] uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        {aiLoading ? "Consultation..." : `Analyser la performance de ${site}`}
                      </button>

                      {aiLoading ? (
                        <div className="py-8 flex flex-col items-center justify-center gap-2 text-center">
                          <div className="h-8 w-8 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
                          <span className="text-[10px] font-mono text-amber-600 font-bold uppercase animate-pulse">Calcul stratégique...</span>
                        </div>
                      ) : aiResponse ? (
                        <div className="bg-amber-50/20 border border-amber-200/50 rounded-xl p-4 space-y-3 max-h-[350px] overflow-y-auto">
                          <span className="text-[9px] font-mono font-black text-[#D4AF37] uppercase tracking-wider block">Rapport stratégique IA {site} :</span>
                          <div className="font-mono text-[10.5px] leading-relaxed text-slate-800 space-y-2">
                            {renderMarkdownText(aiResponse)}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-center text-slate-400 font-mono text-[10px]">
                          Cliquez pour obtenir les recommandations de Mounir Outbrrit.
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
