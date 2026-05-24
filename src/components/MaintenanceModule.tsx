import * as React from "react";
import { 
  Wrench, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Timer,
  Droplet,
  Settings,
  Filter as FilterIcon,
  Info,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  CalendarDays,
  CheckCircle,
  TrendingUp,
  Sliders,
  Sparkles,
  ToggleLeft,
  X,
  Gauge
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { enginsRepository, EnginDocument } from "@/repositories/enginsRepository";
import { workOrdersRepository, WorkOrderDocument } from "@/repositories/workOrdersRepository";
import { useCollection } from "@/hooks/useCollection";
import { ENGIN_STATUS, WORKORDER_STATUS, PRIORITY_LEVELS } from "@/types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface ScheduledMaintenance {
  id: string;
  machineId: string;
  type: "VIDANGE" | "SOUFFLAGE" | "GRAISSAGE" | "INSPECTION";
  label: string;
  priority: "critique" | "élevée" | "moyenne" | "faible";
  dueHours: number;
  intervalHours: number;
  statut: "à planifier" | "en cours" | "terminé";
  lastDoneDate: string;
  siteId: string;
}

export function MaintenanceModule() {
  const { user, activeSite } = useAuthStore();
  
  // Dynamic fetches for live or fallback cached tables
  const { data: rawEngins } = useCollection<any>('engins');
  const { data: rawOrders } = useCollection<any>('workorders');

  const liveEngins: EnginDocument[] = React.useMemo(() => {
    if (rawEngins && rawEngins.length > 0) {
      return rawEngins;
    }
    return enginsRepository.getAll('TOUS');
  }, [rawEngins]);

  const liveOrders: WorkOrderDocument[] = React.useMemo(() => {
    if (rawOrders && rawOrders.length > 0) {
      return rawOrders;
    }
    return workOrdersRepository.getAll('TOUS');
  }, [rawOrders]);

  // Current Site Filtered views
  const siteEngins = React.useMemo(() => {
    return liveEngins.filter(e => activeSite === "TOUS" || e.siteId === activeSite || e.site === activeSite);
  }, [liveEngins, activeSite]);

  const siteOrders = React.useMemo(() => {
    return liveOrders.filter(o => activeSite === "TOUS" || o.siteId === activeSite);
  }, [liveOrders, activeSite]);

  // STATE FOR SCHEDULING INTERACTIVE ENGINE (PERSISTED)
  const [schedules, setSchedules] = React.useState<ScheduledMaintenance[]>([
    { id: "S-101", machineId: "M-045", type: "VIDANGE", label: "Vidange Moteur (500h)", priority: "critique", dueHours: 8, intervalHours: 500, statut: "à planifier", lastDoneDate: "2026-04-12", siteId: "SMI" },
    { id: "S-102", machineId: "S-012", type: "VIDANGE", label: "Vidange Boîte de Vitesse (1000h)", priority: "moyenne", dueHours: 110, intervalHours: 1000, statut: "à planifier", lastDoneDate: "2026-03-20", siteId: "KOUDIA" },
    { id: "S-103", machineId: "M-045", type: "SOUFFLAGE", label: "Soufflage Cartouche Filtre", priority: "critique", dueHours: 2, intervalHours: 120, statut: "en cours", lastDoneDate: "2026-05-18", siteId: "SMI" },
    { id: "S-105", machineId: "P-002", type: "GRAISSAGE", label: "Graissage Général Articulation", priority: "faible", dueHours: 24, intervalHours: 24, statut: "en cours", lastDoneDate: "2026-05-21", siteId: "KOUDIA" },
    { id: "S-106", machineId: "H-001", type: "INSPECTION", label: "Inspection Trains Roulants", priority: "moyenne", dueHours: 85, intervalHours: 250, statut: "à planifier", lastDoneDate: "2026-05-10", siteId: "SMI" }
  ]);

  // Form Submission Schedules State
  const [formMachineId, setFormMachineId] = React.useState<string>("");
  const [formType, setFormType] = React.useState<"VIDANGE" | "SOUFFLAGE" | "GRAISSAGE" | "INSPECTION">("VIDANGE");
  const [formInterval, setFormInterval] = React.useState<number>(250);
  const [formCurrentHours, setFormCurrentHours] = React.useState<number>(0);
  const [formDueHours, setFormDueHours] = React.useState<number>(250);

  // Load schedules on init
  React.useEffect(() => {
    const rawS = localStorage.getItem('sg_preventive_schedules');
    if (rawS) {
      try {
        const parsed = JSON.parse(rawS);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSchedules(parsed);
        }
      } catch (err) {
        console.error("Failed to parse local schedules:", err);
      }
    }
  }, []);

  const syncSchedules = (newSchedules: ScheduledMaintenance[]) => {
    setSchedules(newSchedules);
    try {
      localStorage.setItem('sg_preventive_schedules', JSON.stringify(newSchedules));
    } catch (e) {
      console.error("Failed to sync schedules:", e);
    }
  };

  // ADD DYNAMIC SCHEDULE EVENT (MANUAL MODE SUPPORT FOR ROBUST EXPLOITATION)
  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const mId = formMachineId || (siteEngins[0]?.code || siteEngins[0]?.id || "M-045");
    
    const labelMapping = {
      VIDANGE: `Vidange Moteur & Analyse (${formInterval}h)`,
      SOUFFLAGE: `Soufflage & Changement des Filtres (${formInterval}h)`,
      GRAISSAGE: `Graissage Général Châssis (${formInterval}h)`,
      INSPECTION: `Inspection Clinique Organes Souterrains (${formInterval}h)`
    };

    const newScheduleItem: ScheduledMaintenance = {
      id: `S-${100 + schedules.length + 1}`,
      machineId: mId,
      type: formType,
      label: labelMapping[formType],
      priority: formDueHours <= 20 ? "critique" : formDueHours <= 100 ? "élevée" : "moyenne",
      dueHours: Number(formDueHours),
      intervalHours: Number(formInterval),
      statut: "à planifier",
      lastDoneDate: new Date().toISOString().slice(0, 10),
      siteId: (activeSite === 'TOUS' ? 'SMI' : activeSite)
    };

    const updated = [newScheduleItem, ...schedules];
    syncSchedules(updated);
    toast.success(`📅 Échéance préventive programmée pour l'engin ${mId} (${newScheduleItem.label})`);
    
    // Clear Form
    setFormMachineId("");
    setFormInterval(250);
    setFormDueHours(250);
    setFormCurrentHours(0);
  };

  // CALCULATE FLEET SIGHT HEALTH SEGMENTS CLINICS (Machine preventive health scores)
  const fleetHealth = React.useMemo(() => {
    return siteEngins.map(m => {
      const code = m.code || m.id || m.enginId || '';
      const machineSchedules = schedules.filter(s => s.machineId === code);
      let score = 100;
      
      machineSchedules.forEach(s => {
        if (s.statut !== 'terminé') {
          if (s.dueHours <= 0) {
            score -= 35; // Overdue is high negligence risk
          } else if (s.dueHours <= 15) {
            score -= 15; // Approaching overdue threshold
          }
        }
      });
      
      if (m.status === ENGIN_STATUS.EN_PANNE || m.statut === 'panne') {
        score -= 20;
      }
      
      const healthScore = Math.max(15, Math.min(100, score));
      return {
        id: code,
        type: m.type || 'ST2G',
        status: m.status || m.statut || ENGIN_STATUS.DISPONIBLE,
        hours: m.hours || 0,
        healthScore
      };
    });
  }, [siteEngins, schedules]);

  // FILTERED SCHEDULES
  const currentSchedules = React.useMemo(() => {
    return schedules.filter(s => activeSite === "TOUS" || s.siteId === activeSite);
  }, [schedules, activeSite]);

  // COGNITIVE RATIOS (Preventive volume vs Corrective)
  const statistics = React.useMemo(() => {
    const totalBTs = siteOrders.length || 1;
    const prevCount = siteOrders.filter(o => 
      (o.title || "").toLowerCase().includes("prev") || 
      (o.title || "").toLowerCase().includes("vidange") || 
      (o.title || "").toLowerCase().includes("graissage") || 
      (o.title || "").toLowerCase().includes("checklist") ||
      (o.checklist && o.checklist.some(c => c.task.includes("Filtre") || c.task.includes("Niveau")))
    ).length;
    
    const correctiveCount = Math.max(0, totalBTs - prevCount);
    const preventiveRatio = Math.round((prevCount / totalBTs) * 100);

    // Overdue scheduled alerts count
    const overdueCount = currentSchedules.filter(s => s.dueHours <= 10 && s.statut !== 'terminé').length;

    return {
      totalBTs,
      prevCount,
      correctiveCount,
      preventiveRatio,
      overdueCount,
      chartData: [
        { name: "Préventif Discipliné", valeur: prevCount, fill: "#10b981" },
        { name: "Correctif Subit", valeur: correctiveCount, fill: "#ef4444" }
      ]
    };
  }, [siteOrders, currentSchedules]);

  // DETTE DE MAINTENANCE, LUBRIFICATION NÉGLIGÉE, OMISSIONS
  const advancedMetrics = React.useMemo(() => {
    // Maintenance Debt computed on cumulative delayed hours or overdue schedules
    const delayedSchedules = currentSchedules.filter(s => s.dueHours <= 0 && s.statut !== 'terminé');
    const totalOverdueHoursSum = delayedSchedules.reduce((acc, curr) => acc + Math.abs(curr.dueHours), 0);
    
    // Debt Score (0 to 100): 100 is pristine compliance, decays by 15 per overdue action
    const debtScore = Math.max(0, 100 - (delayedSchedules.length * 15 + Math.min(40, Math.floor(totalOverdueHoursSum / 5))));
    
    // Neglected tasks metrics
    const gOmissions = currentSchedules.filter(s => s.type === "GRAISSAGE" && s.dueHours <= 5 && s.statut !== 'terminé').length;
    const sOmissions = currentSchedules.filter(s => s.type === "SOUFFLAGE" && s.dueHours <= 10 && s.statut !== 'terminé').length;
    const vOmissions = currentSchedules.filter(s => s.type === "VIDANGE" && s.dueHours <= 15 && s.statut !== 'terminé').length;

    // Neglect scoring list for engines
    const engineNeglectMap: Record<string, { code: string; overdueCount: number; maxDelay: number; scoreEffect: number }> = {};
    
    siteEngins.forEach(e => {
      const code = e.code || e.id || e.enginId || '';
      engineNeglectMap[code] = { code, overdueCount: 0, maxDelay: 0, scoreEffect: 0 };
    });

    currentSchedules.forEach(s => {
      if (s.statut !== 'terminé' && s.dueHours <= 15) {
        const code = s.machineId;
        if (engineNeglectMap[code]) {
          engineNeglectMap[code].overdueCount += 1;
          const delay = s.dueHours < 0 ? Math.abs(s.dueHours) : 0;
          if (delay > engineNeglectMap[code].maxDelay) {
            engineNeglectMap[code].maxDelay = delay;
          }
          engineNeglectMap[code].scoreEffect += (s.priority === "critique" ? 30 : 15);
        }
      }
    });

    const neglectRanking = Object.values(engineNeglectMap)
      .filter(item => item.overdueCount > 0)
      .sort((a, b) => b.scoreEffect - a.scoreEffect || b.overdueCount - a.overdueCount);

    return {
      debtScore,
      totalOverdueHoursSum,
      delayedCount: delayedSchedules.length,
      gOmissions,
      sOmissions,
      vOmissions,
      neglectRanking
    };
  }, [currentSchedules, siteEngins]);

  // MICRO-CHECKLIST TERRAIN PROCESS STATE (GLOVE FRIENDLY)
  const [selectedChecklistMachine, setSelectedChecklistMachine] = React.useState<string>("");
  const [activeTaskType, setActiveTaskType] = React.useState<"VIDANGE" | "SOUFFLAGE" | "GRAISSAGE" | "INSPECTION" | null>(null);

  // Micro fiches parameters (Zero typing clicker variables)
  const [cbFilterBlown, setCbFilterBlown] = React.useState(true);
  const [cbOilChecked, setCbOilChecked] = React.useState(true);
  const [cbHydraulicLeak, setCbHydraulicLeak] = React.useState(false); // False = No leak detected (Secure state)
  const [cbFlexibleInspected, setCbFlexibleInspected] = React.useState(true);
  const [cbGreasingCompleted, setCbGreasingCompleted] = React.useState(true);

  const canCompleteOrLaunch = ["ADMIN", "RESPONSABLE_MAINTENANCE", "MECANICIEN"].includes(user?.role || "");

  // SUBMIT HANDLER FOR THE GLOVE FRIENDLY MICRO REPORT (UNDER 30 SECONDS)
  const handleValiderMicroFiche = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChecklistMachine) {
      toast.error("Veuillez sélectionner un engin souterrain.");
      return;
    }
    if (!activeTaskType) {
      toast.error("Choisissez le type d'entretien prescrit.");
      return;
    }

    const machineId = selectedChecklistMachine;
    const taskName = activeTaskType === 'VIDANGE' ? 'Vidange & Niveaux' :
                     activeTaskType === 'SOUFFLAGE' ? 'Soufflage Cartouche Filtre' :
                     activeTaskType === 'GRAISSAGE' ? 'Graissage cardans/axe' : 'Fiche d\'inspection Souterrain';

    const cleanTitle = `[PREV] ${taskName} effectué via Fiche Micro-30s`;
    
    // Create new WorkOrder in cache repository / Firestore
    const newBTDoc: Omit<WorkOrderDocument, 'workOrderId' | 'id'> & { id?: string } = {
      title: cleanTitle,
      machineCode: machineId,
      enginId: machineId,
      severity: cbHydraulicLeak ? PRIORITY_LEVELS.CRITIQUE : PRIORITY_LEVELS.MINEUR,
      status: WORKORDER_STATUS.CLOS, // Autoclose since it is a fast declared field checklist
      assignedTech: user?.email || "Équipe Souterraine",
      creationDate: new Date().toISOString().slice(0, 10),
      createdBy: user?.role || "SECRETAIRE",
      durationHours: 0.5,
      costEst: activeTaskType === 'VIDANGE' ? 250 : 25,
      siteId: (activeSite === 'TOUS' ? 'SMI' : activeSite) as any,
      replacedParts: activeTaskType === 'VIDANGE' ? [{ ref: "HUILE-SAE40", name: "Lubrifiant SAE40 HD", qty: 20, costUSD: 180 }] : [],
      checklist: [
        { task: "Filtre à air soufflé", completed: cbFilterBlown },
        { task: "Niveau d'huile ajusté", completed: cbOilChecked },
        { task: "Fuite hydraulique absente ou corrigée", completed: !cbHydraulicLeak },
        { task: "Flexibles de pression testés", completed: cbFlexibleInspected },
        { task: "Points de graissage bourrés", completed: cbGreasingCompleted }
      ],
      idempotencyKey: `PREV-MC-${machineId}-${Date.now()}`
    };

    try {
      // 1. Save work order to local cache / Firestore bridge
      workOrdersRepository.create(newBTDoc);

      // 2. Clear out scheduled overdue elements
      const updatedSchedules = schedules.map(s => {
        if (s.machineId === machineId && s.type === activeTaskType) {
          return {
            ...s,
            dueHours: s.intervalHours,
            statut: "terminé" as const,
            lastDoneDate: new Date().toISOString().slice(0, 10)
          };
        }
        return s;
      });
      syncSchedules(updatedSchedules);

      // 3. Update machine status locally in local storage
      const activeEngins = enginsRepository.loadAll();
      const updatedEngins: EnginDocument[] = activeEngins.map(eng => {
        if (eng.enginId === machineId) {
          return {
            ...eng,
            lastInspectionDate: new Date().toISOString().slice(0, 10),
            dispo: cbHydraulicLeak ? 55 : 98,
            statut: cbHydraulicLeak ? 'panne' : eng.statut,
            status: cbHydraulicLeak ? ENGIN_STATUS.EN_PANNE : ENGIN_STATUS.DISPONIBLE
          };
        }
        return eng;
      });
      enginsRepository.saveAll(updatedEngins);

      toast.success(`✅ Micro-fiche validée pour l'engin ${machineId} ! Rapport d'activité synchronisé.`);
      
      // Reset inputs
      setSelectedChecklistMachine("");
      setActiveTaskType(null);
      setCbFilterBlown(true);
      setCbOilChecked(true);
      setCbHydraulicLeak(false);
      setCbFlexibleInspected(true);
      setCbGreasingCompleted(true);
    } catch (err) {
      console.error(err);
      toast.error("Erreur d'écriture sur le cache local.");
    }
  };

  // TRIGGER SCHEDULER COMPLETIONS (MANUAL LAUNCH)
  const handleLaunchScheduled = (id: string, machineCode: string) => {
    const updated = schedules.map(s => {
      if (s.id === id) {
        toast.info(`🔧 Entretien ${s.label} sur ${machineCode} démarré en atelier de surface.`);
        return { ...s, statut: "en cours" as const };
      }
      return s;
    });
    syncSchedules(updated);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-[#0b0f19] text-slate-100 min-h-screen select-none font-sans">
      
      {/* HEADER COCKPIT */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <CalendarDays className="h-6 w-6 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2 uppercase">
                DISCIPLINE ET RIGUEUR PRÉVENTIVE SOU-GMAO
              </h2>
              <p className="text-slate-400 text-xs flex items-center gap-1.5 mt-0.5 font-mono">
                Cible de performance : <span className="text-emerald-400 font-bold">70% de préventif dirigé</span> • Site : {activeSite === 'TOUS' ? 'Tous les ateliers' : `Atelier ${activeSite}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CORE KPI SUMMARY GRID */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* COMPLIANCE THERMOMETER */}
        <Card className="bg-[#131b2e] border-slate-800 rounded-xl animate-fade-in text-white">
          <CardHeader className="py-3 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] uppercase font-black tracking-widest text-[#5facff]">Ratio Préventif</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#5facff]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-mono text-emerald-450">{statistics.preventiveRatio}%</div>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tight font-semibold">Objectif : 70% de cible GMAO</p>
            <Progress value={statistics.preventiveRatio} className="h-1.5 mt-2 bg-slate-900" />
          </CardContent>
        </Card>

        {/* OVERDUE ALERTS CARD */}
        <Card className={cn(
          "bg-[#131b2e] border-slate-800 rounded-xl border-l-4 text-white",
          statistics.overdueCount > 0 ? "border-l-red-500" : "border-l-slate-800"
        )}>
          <CardHeader className="py-3 pb-2 flex flex-row items-center justify-between font-mono">
            <CardTitle className="text-[10px] uppercase font-black tracking-widest text-slate-400 font-mono">Échéances Imminentes</CardTitle>
            <ShieldAlert className="h-4.5 w-4.5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-3xl font-black font-mono",
              statistics.overdueCount > 0 ? "text-red-500 animate-pulse" : "text-white"
            )}>{statistics.overdueCount < 10 ? `0${statistics.overdueCount}` : statistics.overdueCount}</div>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Échéances critiques (&lt;10 heures)</p>
          </CardContent>
        </Card>

        {/* COMPLIANCE SUMMARY (MAINTENANCE DEBT SCORE) */}
        <Card className={cn(
          "bg-[#131b2e] border-slate-800 rounded-xl border-l-4 text-white",
          advancedMetrics.debtScore < 80 ? "border-l-amber-500" : "border-l-emerald-500"
        )}>
          <CardHeader className="py-3 pb-2 flex flex-row items-center justify-between font-mono">
            <CardTitle className="text-[10px] uppercase font-black tracking-widest text-slate-400 font-mono">Score Dette de Maintenance</CardTitle>
            <Sliders className="h-4 w-4 text-[#4A90D9]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-mono text-white">{Math.round(advancedMetrics.debtScore)}%</div>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold text-xs">Retard cumulé: {advancedMetrics.totalOverdueHoursSum} h</p>
          </CardContent>
        </Card>

        {/* EXTREME PREVENTIVE RIGOUR: OMISSIONS AND LUBRICATIONS */}
        <Card className={cn(
          "bg-[#131b2e] border-slate-800 rounded-xl border-l-4 text-white",
          (advancedMetrics.gOmissions + advancedMetrics.sOmissions) > 0 ? "border-l-red-500" : "border-l-emerald-500"
        )}>
          <CardHeader className="py-3 pb-2 flex flex-row items-center justify-between font-mono">
            <CardTitle className="text-[10px] uppercase font-black tracking-widest text-slate-400 font-mono">Omissions de Rigueur</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black uppercase text-slate-150 font-mono flex items-center gap-2">
              {(advancedMetrics.gOmissions + advancedMetrics.sOmissions) > 0 ? (
                <span className="text-red-500 animate-pulse">⚠️ SOUFF: {advancedMetrics.sOmissions} | GRAIS: {advancedMetrics.gOmissions}</span>
              ) : (
                <span className="text-emerald-450">AUCUN OUBLI RAS</span>
              )}
            </div>
            <p className="text-[9.5px] text-slate-405 mt-1.5 leading-relaxed truncate font-semibold uppercase">Omissions soufflage filtre & graissage</p>
          </CardContent>
        </Card>
      </div>

      {/* DETAILED DOUBLE GRID COCKPIT */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        
        {/* LEFT COLUMN: GLOVE-FRIENDLY MANDATORY <30 SECONDS MICRO-CHECKLIST (LG:COL-SPAN-5) */}
        <Card className="lg:col-span-12 xl:col-span-5 bg-[#131b2e] border-slate-800 rounded-xl shadow-xl overflow-hidden border-2 border-[#4A90D9]/20">
          <CardHeader className="bg-slate-900/60 border-b border-slate-801">
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-[#4A90D9]" />
              <div>
                <CardTitle className="text-sm font-black text-white uppercase tracking-wider">
                  Fiche de Rigueur Souterraine (Micro-30 Sec)
                </CardTitle>
                <CardDescription className="text-slate-400 text-[10.5px]">
                  Boutons géants pour gants de protection. Saisie clavier bannie.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleValiderMicroFiche} className="space-y-4">
              
              {/* MACHINE CHOSEN */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">1. Sélection de l'engin souterrain</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {siteEngins.slice(0, 9).map((m, idx) => {
                    const engineIdRef = m.enginId || m.id || `engin-${idx}`;
                    return (
                      <div 
                        key={engineIdRef}
                        onClick={() => setSelectedChecklistMachine(engineIdRef)}
                        className={cn(
                          "h-12 border rounded-lg flex flex-col justify-center items-center cursor-pointer transition-all active:scale-95 text-center px-1 font-bold",
                          selectedChecklistMachine === engineIdRef 
                            ? "bg-[#4A90D9] text-slate-900 border-[#4a90d9]" 
                            : "bg-[#0d1424] text-slate-300 border-slate-800 hover:border-slate-700"
                        )}
                      >
                        <span className="text-[10px] block truncate font-black">{engineIdRef}</span>
                        <span className="text-[7.5px] uppercase opacity-75">{m.type || "Inconnu"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TASK TYPE CHOSEN */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-405 uppercase tracking-widest font-mono">2. Type d'entretien effectué</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["VIDANGE", "SOUFFLAGE", "GRAISSAGE", "INSPECTION"] as const).map((t) => (
                    <div 
                      key={t}
                      onClick={() => setActiveTaskType(t)}
                      className={cn(
                        "h-12 border rounded-lg flex flex-col justify-center items-center cursor-pointer transition-all text-center px-1 font-bold font-sans",
                        activeTaskType === t 
                          ? "bg-slate-100 text-slate-930 border-white" 
                          : "bg-[#0d1424] text-slate-400 border-slate-800 hover:border-slate-700"
                      )}
                    >
                      <span className="text-[9.5px] font-black tracking-tighter block leading-none uppercase">{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* GLOVE-FRIENDLY DOUBLE TOGGLES ON/OFF (CLICK TOUCH PLATES) */}
              {activeTaskType && (
                <div className="space-y-3.5 bg-[#0d1424] p-3 rounded-xl border border-slate-800 my-4">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono border-b border-slate-800 pb-1.5">3. Validation physique terrain</h4>
                  
                  {/* COMPONENT 1: FILTER BLOWN */}
                  <div 
                    onClick={() => setCbFilterBlown(!cbFilterBlown)}
                    className={cn(
                      "h-12 px-3 border rounded-lg flex items-center justify-between cursor-pointer transition-all select-none",
                      cbFilterBlown ? "bg-[#10b981]/10 border-[#10b981]/40 text-emerald-400" : "bg-slate-900/40 border-slate-800 text-slate-400"
                    )}
                  >
                    <span className="text-[10.5px] font-bold uppercase">Cartouches d'Air Soufflées</span>
                    <Badge className={cbFilterBlown ? "bg-[#10b981] text-slate-900" : "bg-slate-800 text-slate-400"}>
                      {cbFilterBlown ? "SOUFFLÉ ✅" : "NÉGLIGÉ"}
                    </Badge>
                  </div>

                  {/* COMPONENT 2: OIL SHIFT DONE */}
                  <div 
                    onClick={() => setCbOilChecked(!cbOilChecked)}
                    className={cn(
                      "h-12 px-3 border rounded-lg flex items-center justify-between cursor-pointer transition-all select-none",
                      cbOilChecked ? "bg-[#10b981]/10 border-[#10b981]/40 text-emerald-400" : "bg-slate-900/40 border-slate-800 text-slate-400"
                    )}
                  >
                    <span className="text-[10.5px] font-bold uppercase">Niveau d'huile fait (SAE40)</span>
                    <Badge className={cbOilChecked ? "bg-[#10b981] text-slate-900" : "bg-slate-800 text-slate-400"}>
                      {cbOilChecked ? "AJUSTÉ" : "NON REMPLI"}
                    </Badge>
                  </div>

                  {/* COMPONENT 3: HYDRAULIC LEAKS */}
                  <div 
                    onClick={() => setCbHydraulicLeak(!cbHydraulicLeak)}
                    className={cn(
                      "h-12 px-3 border rounded-lg flex items-center justify-between cursor-pointer transition-all select-none",
                      cbHydraulicLeak ? "bg-red-950/20 border-red-900/30 text-red-400" : "bg-[#10b981]/10 border-[#10b981]/20 text-emerald-400"
                    )}
                  >
                    <span className="text-[10.5px] font-bold uppercase">Fuite Hydraulique Observée ?</span>
                    <Badge className={cbHydraulicLeak ? "bg-red-650 text-white" : "bg-[#10b981]/25 text-emerald-450"}>
                      {cbHydraulicLeak ? "⚠️ FUITE PRESENTE" : "R-A-S"}
                    </Badge>
                  </div>

                  {/* COMPONENT 4: FLEXIBLES STATUS */}
                  <div 
                    onClick={() => setCbFlexibleInspected(!cbFlexibleInspected)}
                    className={cn(
                      "h-12 px-3 border rounded-lg flex items-center justify-between cursor-pointer transition-all select-none",
                      cbFlexibleInspected ? "bg-[#10b981]/10 border-[#10b981]/40 text-emerald-400" : "bg-slate-900/40 border-slate-800 text-slate-400"
                    )}
                  >
                    <span className="text-[10.5px] font-bold uppercase">Joint-Raccord Flexibles OK</span>
                    <Badge className={cbFlexibleInspected ? "bg-[#10b981] text-slate-900" : "bg-slate-800 text-slate-400"}>
                      {cbFlexibleInspected ? "CONFORME" : "À SURVEILLER"}
                    </Badge>
                  </div>

                  {/* COMPONENT 5: GREASING */}
                  <div 
                    onClick={() => setCbGreasingCompleted(!cbGreasingCompleted)}
                    className={cn(
                      "h-12 px-3 border rounded-lg flex items-center justify-between cursor-pointer transition-all select-none",
                      cbGreasingCompleted ? "bg-[#10b981]/10 border-[#10b981]/40 text-emerald-400" : "bg-slate-900/40 border-slate-800 text-slate-400"
                    )}
                  >
                    <span className="text-[10.5px] font-bold uppercase">Graissage Quotidien Bourré</span>
                    <Badge className={cbGreasingCompleted ? "bg-[#10b981] text-slate-900" : "bg-slate-800 text-slate-400"}>
                      {cbGreasingCompleted ? "GRAISSÉ ✅" : "IMPÉRATIF"}
                    </Badge>
                  </div>
                </div>
              )}

              {/* MASSIVE SUBMIT BUTTON */}
              <button 
                type="submit"
                disabled={!selectedChecklistMachine || !activeTaskType}
                className={cn(
                  "w-full h-14 rounded-xl text-xs uppercase font-black tracking-widest transition-all duration-150 active:scale-95 flex items-center justify-center gap-2 border-none cursor-pointer",
                  (!selectedChecklistMachine || !activeTaskType) 
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                    : "bg-[#4A90D9] text-slate-900 hover:bg-[#3572b2] hover:text-white"
                )}
              >
                <CheckCircle className="h-4.5 w-4.5" /> VALIDER FICHE TERRAIN (30 SEC)
              </button>
            </form>
          </CardContent>
        </Card>

        {/* FLEET CLINICAL HEALTH SCORES MODULE */}
        <Card className="lg:col-span-12 xl:col-span-5 bg-[#131b2e] border-slate-800 rounded-xl shadow-xl overflow-hidden mt-0">
          <CardHeader className="bg-slate-900/40 border-b border-slate-801 py-3">
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-emerald-400" />
              <div>
                <CardTitle className="text-xs font-black text-white uppercase tracking-wider">
                  Dossiers de Santé Préventive de la Flotte
                </CardTitle>
                <CardDescription className="text-slate-400 text-[10px]">
                  Score clinique pondéré calculé sur les pannes récentes & échéances expirées.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 px-3 pb-3">
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto scroll-industrial pr-1">
              {fleetHealth.map((item) => (
                <div key={item.id} className="p-2.5 rounded-lg bg-[#0d1424] border border-slate-850 flex items-center justify-between text-xs transition-all hover:border-slate-800">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] text-[#4A90D9] font-black">{item.id}</span>
                      <span className="text-[9.5px] uppercase font-bold text-slate-400">({item.type})</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono m-0">{item.hours} heures déclarées</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className={cn(
                        "font-black font-mono text-xs",
                        item.healthScore >= 80 ? "text-emerald-400" :
                        item.healthScore >= 55 ? "text-amber-400" : "text-red-550"
                      )}>
                        {item.healthScore}%
                      </span>
                    </div>
                    <div className="w-16 bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-900">
                      <div 
                        className={cn(
                          "h-full rounded-full",
                          item.healthScore >= 80 ? "bg-emerald-500" :
                          item.healthScore >= 55 ? "bg-amber-500" : "bg-red-500"
                        )}
                        style={{ width: `${item.healthScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Machine Neglect Ranking Segment */}
            {advancedMetrics.neglectRanking.length > 0 && (
              <div className="mt-4 border-t border-slate-800/80 pt-4">
                <div className="flex items-center gap-1.5 mb-2.5 px-1">
                  <AlertCircle className="h-3.5 w-3.5 text-red-500 animate-pulse" />
                  <span className="text-[9px] uppercase font-black text-red-400 tracking-wider">Top Machines Négligées (Retards Préventifs)</span>
                </div>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto scroll-industrial pr-1">
                  {advancedMetrics.neglectRanking.slice(0, 5).map((rank, idx) => (
                    <div key={rank.code} className="p-2 rounded bg-red-950/10 border border-red-900/10 flex items-center justify-between text-[10.5px] font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-red-500 font-black">#{idx + 1}</span>
                        <span className="text-white font-black">{rank.code}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-slate-400 uppercase text-[8px]">Retards:</span>
                        <span className="text-red-400 font-extrabold">{rank.overdueCount} actions</span>
                        {rank.maxDelay > 0 && (
                          <span className="text-slate-500">(-{rank.maxDelay}h)</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* RIGHT COLUMN: MANDATORY SCHEDULING LIST (LG:COL-SPAN-7) */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-4">
          
          {/* SCHEDULE PANEL */}
          <Card className="bg-[#131b2e] border-slate-800 rounded-xl shadow-xl">
            <CardHeader className="py-4 border-b border-slate-800/80 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black text-white uppercase tracking-wider">
                  Moteur de Planification Préventif SOU-GMAO
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  Proportion d'heures de service cumulées avant arrêt préventif réglementaire prescrit.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4 p-0">
              <div className="divide-y divide-slate-800/60 max-h-[480px] overflow-y-auto scroll-industrial">
                {currentSchedules.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-slate-900/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "h-10 w-10 shrink-0 rounded-lg flex items-center justify-center border",
                        item.type === 'VIDANGE' ? 'bg-amber-950/40 border-amber-900/20 text-amber-500' :
                        item.type === 'SOUFFLAGE' ? 'bg-blue-950/40 border-blue-900/20 text-blue-400' :
                        item.type === 'GRAISSAGE' ? 'bg-emerald-950/40 border-emerald-900/20 text-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-400'
                      )}>
                        {item.type === 'VIDANGE' ? <Droplet className="h-5 w-5" /> : 
                         item.type === 'GRAISSAGE' ? <Wrench className="h-5 w-5" /> : <Settings className="h-5 w-5" />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-400 font-semibold">{item.id}</span>
                          <span className="font-black text-white uppercase tracking-wider">{item.machineId}</span>
                          <Badge className={cn(
                            "text-[8.5px] uppercase font-bold",
                            item.priority === 'critique' ? "bg-red-950 text-red-400 border border-red-900/30" : "bg-slate-800 text-slate-450"
                          )}>{item.priority}</Badge>
                        </div>
                        <p className="font-bold text-slate-300 uppercase">{item.label}</p>
                        <p className="text-[10px] text-slate-500 font-mono">Dernier entretien accompli le {item.lastDoneDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 justify-between sm:justify-start">
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 font-bold uppercase block">Intervalle</span>
                        <span className="font-mono text-xs font-bold text-slate-300">{item.intervalHours}h</span>
                      </div>
                      <div className="text-right min-w-[70px]">
                        <span className="text-[9px] text-slate-500 font-bold uppercase block font-mono">Échéance</span>
                        <span className={cn(
                          "font-mono font-black text-sm",
                          item.dueHours <= 10 ? "text-red-500 animate-pulse" : "text-white"
                        )}>{item.dueHours}h</span>
                      </div>
                      <div className="shrink-0">
                        {item.statut === 'à planifier' ? (
                          <Button 
                            size="sm"
                            onClick={() => handleLaunchScheduled(item.id, item.machineId)}
                            className="bg-slate-800 border-slate-705 text-white font-bold h-9 text-[10px] uppercase tracking-wider px-3 hover:bg-slate-700 font-mono"
                          >
                            Prescrire
                          </Button>
                        ) : (
                          <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900/30 font-bold uppercase text-[9px] h-9 px-3 flex items-center justify-center rounded-lg">
                            EN ATELIER
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* MANUAL PREVENTIVE SCHEDULING BUILDER */}
          <Card className="bg-[#131b2e] border-slate-800 rounded-xl shadow-xl">
            <CardHeader className="py-3 border-b border-slate-850">
              <div className="flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-[#5facff]" />
                <CardTitle className="text-xs font-black text-white uppercase tracking-wider">
                  Planifier un Nouvel Entretien Préventif
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleAddSchedule} className="space-y-3.5 text-xs">
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-405 uppercase font-mono">1. Code de l'engin</label>
                    <select
                      value={formMachineId}
                      onChange={(e) => setFormMachineId(e.target.value)}
                      required
                      className="w-full h-10 px-3 bg-[#0d1424] border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#4A90D9]"
                    >
                      <option value="">-- Sélectionner --</option>
                      {siteEngins.map(e => {
                        const codeStr = e.code || e.id || e.enginId;
                        return (
                          <option key={codeStr} value={codeStr}>{codeStr} - {e.type}</option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-405 uppercase font-mono">2. Type d'entretien</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as any)}
                      className="w-full h-10 px-3 bg-[#0d1424] border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#4A90D9]"
                    >
                      <option value="VIDANGE">Vidange Complète (Huile)</option>
                      <option value="SOUFFLAGE">Soufflage des Filtres</option>
                      <option value="GRAISSAGE">Graissage Général</option>
                      <option value="INSPECTION">Inspection Clinique</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-405 uppercase font-mono">3. Intervalle (Heures)</label>
                    <input
                      type="number"
                      value={formInterval}
                      onChange={(e) => {
                        const val = Math.max(10, Number(e.target.value));
                        setFormInterval(val);
                        setFormDueHours(Math.max(1, val - formCurrentHours));
                      }}
                      className="w-full h-10 px-3 bg-[#0d1424] border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#4A90D9]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-405 uppercase font-mono">4. Compteur Actuel</label>
                    <input
                      type="number"
                      value={formCurrentHours}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value));
                        setFormCurrentHours(val);
                        setFormDueHours(Math.max(1, formInterval - val));
                      }}
                      className="w-full h-10 px-3 bg-[#0d1424] border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#4A90D9]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-405 uppercase font-mono">5. Échéance Restante</label>
                    <input
                      type="number"
                      value={formDueHours}
                      onChange={(e) => setFormDueHours(Math.max(1, Number(e.target.value)))}
                      className="w-full h-10 px-3 bg-[#0d1424] border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#4A90D9]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs uppercase font-black font-sans tracking-wider transition-colors active:scale-95 cursor-pointer border-none"
                  >
                    Enregistrer la Planification
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* DUAL KPIS CHART PREVENTIVE VS CORRECTIVE VOLUMES */}
          <Card className="bg-[#131b2e] border-slate-800 shadow-xl rounded-xl">
            <CardHeader className="py-4 border-b border-slate-850 pb-3">
              <CardTitle className="text-xs font-black text-white uppercase tracking-wider">
                Volume d'Intervention : Discipline Préventive vs Correctif Souterrain
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1 w-full min-h-[160px] flex items-center">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={statistics.chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#10192e" horizontal={false} />
                    <XAxis type="number" stroke="#5facff" fontSize={10} hide />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={130} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#131b2e', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ fontSize: '11px', color: '#ffffff' }}
                    />
                    <Bar dataKey="valeur" radius={[0, 4, 4, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="shrink-0 flex md:flex-col gap-4 text-center justify-center md:items-end w-full md:w-36 border-t md:border-t-0 md:border-l border-slate-800/85 pt-4 md:pt-0 md:pl-4">
                <div className="text-center md:text-right">
                  <span className="text-[10px] text-slate-450 uppercase block font-bold font-mono">Total de Bons</span>
                  <span className="text-2xl font-black font-mono text-white">{statistics.totalBTs}</span>
                </div>
                <div className="text-center md:text-right">
                  <span className="text-[10px] text-[#ef4444] uppercase block font-bold font-mono">Urgents subis</span>
                  <span className="text-2xl font-black font-mono text-red-405">{statistics.correctiveCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
}
