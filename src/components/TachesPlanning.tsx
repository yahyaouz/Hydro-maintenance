import React from 'react';
import { 
  Calendar, Clock, CheckCircle2, Wrench, AlertTriangle, User, Truck, Plus, 
  Search, Filter, Share2, TrendingUp, Award, Zap, Printer, Clock3, Check, RefreshCw, Eye, ShieldCheck, Star
} from 'lucide-react';
import { 
  collection, doc, addDoc, updateDoc, onSnapshot, Timestamp, getDoc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PageBanner } from '@/components/ui/PageBanner';

import { MaintenanceTask, Engin, Mecanicien, PmIntervalle, TaskType, TaskPriority } from './taches/types';
import { 
  DAILY_TASKS_COMMON, DAILY_TASKS_BY_MODEL, DAILY_TASKS_GENERIC, getDureeByOperation 
} from './taches/constants';
import { TaskDetailModal } from './taches/TaskDetailModal';
import { AddTaskModal } from './taches/AddTaskModal';
import { SignalerPanne } from './SignalerPanne';

export default function TachesPlanning() {
  const { user, activeSite } = useAuthStore();
  const isModeDirecteur = ['ADMIN', 'DIRECTION', 'RESPONSABLE_MAINTENANCE'].includes(user?.role || '');

  // Base state
  const [tasks, setTasks] = React.useState<MaintenanceTask[]>([]);
  const [engins, setEngins] = React.useState<Engin[]>([]);
  const [mecaniciens, setMecaniciens] = React.useState<Mecanicien[]>([]);
  const [pmIntervalles, setPmIntervalles] = React.useState<PmIntervalle[]>([]);

  // Load flags
  const [enginsLoaded, setEnginsLoaded] = React.useState(false);
  const [mecaniciensLoaded, setMecaniciensLoaded] = React.useState(false);
  const [intervallesLoaded, setIntervallesLoaded] = React.useState(false);
  const [tasksLoaded, setTasksLoaded] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [generationRunning, setGenerationRunning] = React.useState(false);

  // Filters and navigation
  const [activeTab, setActiveTab] = React.useState<'tasks' | 'calendar' | 'performance' | 'pannes'>('tasks');
  const [filterType, setFilterType] = React.useState<string>('TOUS');
  const [filterMeca, setFilterMeca] = React.useState<string>('TOUS');
  const [filterPoste, setFilterPoste] = React.useState<string>('TOUS');
  const [filterDate, setFilterDate] = React.useState<string>("Aujourd'hui");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Modal control
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<MaintenanceTask | null>(null);

  // Pannes states
  const [pannes, setPannes] = React.useState<any[]>([]);
  const [pannesLoaded, setPannesLoaded] = React.useState(false);
  const [isSignalerPanneOpen, setIsSignalerPanneOpen] = React.useState(false);
  
  // States for panne details and diagnostics
  const [selectedPanne, setSelectedPanne] = React.useState<any | null>(null);
  const [diagComment, setDiagComment] = React.useState('');
  const [diagMecaId, setDiagMecaId] = React.useState('');
  const [diagArret, setDiagArret] = React.useState(false);
  const [isCreatingBt, setIsCreatingBt] = React.useState(false);

  // Calendar state
  const [currentWeekStart, setCurrentWeekStart] = React.useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    return new Date(d.setDate(diff));
  });

  // Handle Firestore Errors
  const handleFirestoreError = (error: unknown, op: string) => {
    console.error(`[Firestore Error - ${op}]:`, error);
    toast.error(`Erreur de synchronisation (${op})`);
  };

  // Firestore Listeners
  React.useEffect(() => {
    // Engins
    const unsubEngins = onSnapshot(collection(db, 'engins'), (snap) => {
      setEngins(snap.docs.map(d => ({ id: d.id, ...d.data() } as Engin)));
      setEnginsLoaded(true);
    }, (err) => handleFirestoreError(err, 'Engins'));

    // Mecaniciens
    const unsubMecas = onSnapshot(collection(db, 'mecaniciens'), (snap) => {
      setMecaniciens(snap.docs.map(d => ({ id: d.id, ...d.data() } as Mecanicien)));
      setMecaniciensLoaded(true);
    }, (err) => handleFirestoreError(err, 'Mécaniciens'));

    // PM Intervalles
    const unsubIntervalles = onSnapshot(collection(db, 'pmIntervalles'), (snap) => {
      setPmIntervalles(snap.docs.map(d => ({ id: d.id, ...d.data() } as PmIntervalle)));
      setIntervallesLoaded(true);
    }, (err) => handleFirestoreError(err, 'Intervalles PM'));

    // Maintenance Tasks
    const unsubTasks = onSnapshot(collection(db, 'maintenanceTasks'), (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() } as MaintenanceTask)));
      setTasksLoaded(true);
      setLoading(false);
    }, (err) => handleFirestoreError(err, 'Tâches Maintenance'));

    // Pannes
    const unsubPannes = onSnapshot(collection(db, 'pannes'), (snap) => {
      setPannes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setPannesLoaded(true);
    }, (err) => handleFirestoreError(err, 'Pannes'));

    return () => {
      unsubEngins();
      unsubMecas();
      unsubIntervalles();
      unsubTasks();
      unsubPannes();
    };
  }, []);

  // Multi-site permissions filtering
  const filteredEngins = React.useMemo(() => {
    return engins.filter(e => 
      e.deleted !== true &&
      e.etat !== "Hors service" && e.etat !== "Vendu" &&
      (user?.role === 'ADMIN' || user?.role === 'DIRECTION' || e.siteId === user?.siteId) &&
      (activeSite === 'TOUS' || e.siteId === activeSite)
    );
  }, [engins, user, activeSite]);

  const filteredMecaniciens = React.useMemo(() => {
    return mecaniciens.filter(m => 
      m.deleted !== true &&
      m.statut === "Actif" &&
      (user?.role === 'ADMIN' || user?.role === 'DIRECTION' || m.siteId === user?.siteId) &&
      (activeSite === 'TOUS' || m.siteId === activeSite)
    );
  }, [mecaniciens, user, activeSite]);

  const filteredTasks = React.useMemo(() => {
    return tasks.filter(t => 
      t.deleted !== true &&
      (user?.role === 'ADMIN' || user?.role === 'DIRECTION' || t.siteId === user?.siteId) &&
      (activeSite === 'TOUS' || t.siteId === activeSite)
    );
  }, [tasks, user, activeSite]);

  const filteredPannes = React.useMemo(() => {
    return pannes.filter(p => 
      p.deleted !== true &&
      (user?.role === 'ADMIN' || user?.role === 'DIRECTION' || p.siteId === user?.siteId) &&
      (activeSite === 'TOUS' || p.siteId === activeSite)
    );
  }, [pannes, user, activeSite]);

  const mtbfMttrMetrics = React.useMemo(() => {
    const siteEngins = filteredEngins;
    const sitePannes = filteredPannes;
    
    // Sum engine hours
    const totalHours = siteEngins.reduce((sum, e) => sum + (e.heuresMarche || 0), 0);
    const totalPannesCount = sitePannes.length;
    
    const mtbf = totalPannesCount > 0 ? Math.round(totalHours / totalPannesCount) : totalHours;
    
    // Closed pannes for MTTR
    const closedPannes = sitePannes.filter(p => p.statut === 'CLOS');
    const totalRepairHours = closedPannes.reduce((sum, p) => sum + (Number(p.dureeImmobilisation) || 0), 0);
    const mttr = closedPannes.length > 0 ? Math.round((totalRepairHours / closedPannes.length) * 10) / 10 : 0;
    
    const activePannesCount = sitePannes.filter(p => p.statut !== 'CLOS').length;
    const critiquePannesCount = sitePannes.filter(p => p.statut !== 'CLOS' && p.gravite === 'Critique').length;

    return {
      mtbf,
      mttr,
      activeCount: activePannesCount,
      critiqueCount: critiquePannesCount,
      totalCount: totalPannesCount
    };
  }, [filteredEngins, filteredPannes]);

  // IDEMPOTENT AUTO-GENERATION OF TASKS
  React.useEffect(() => {
    if (user?.role && user.role !== 'VIEWER' && enginsLoaded && mecaniciensLoaded && intervallesLoaded && tasksLoaded && !generationRunning) {
      const runAutoGeneration = async () => {
        setGenerationRunning(true);
        try {
          const todayStr = new Date().toISOString().split('T')[0];

          // 1. Tâches Quotidiennes
          for (const engin of filteredEngins) {
            const hasDailyToday = tasks.some(
              t => t.type === 'QUOTIDIEN' && t.enginId === engin.id && t.datePlanifiee === todayStr && !t.deleted
            );
            if (hasDailyToday) continue;

            const siteMecas = filteredMecaniciens.filter(m => m.siteId === engin.siteId);
            if (siteMecas.length === 0) continue;

            const modelSpecific = DAILY_TASKS_BY_MODEL[engin.modele] || DAILY_TASKS_GENERIC;
            const fullList = [...DAILY_TASKS_COMMON, ...modelSpecific];

            for (let idx = 0; idx < fullList.length; idx++) {
              const def = fullList[idx];
              const m = siteMecas[idx % siteMecas.length];
              
              await addDoc(collection(db, 'maintenanceTasks'), {
                type: 'QUOTIDIEN',
                label: `${def.label} — ${engin.id}`,
                enginId: engin.id,
                enginModele: engin.modele,
                mecanicienId: m.id,
                mecanicienNom: m.nomComplet,
                poste: m.poste || 'Poste 1',
                siteId: engin.siteId,
                datePlanifiee: todayStr,
                dureeEstimee: def.duree,
                priorite: def.priorite,
                statut: 'NON_FAIT',
                commentaire: '',
                heuresEnginAuMoment: engin.heuresMarche || 0,
                generationType: 'AUTO_QUOTIDIEN',
                deleted: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
              });
            }
          }

          // 2. Tâches Préventives PM
          for (const engin of filteredEngins) {
            const modelIntervalles = pmIntervalles.filter(
              i => i.typeEngin === engin.modele || i.typeEngin === 'Générique'
            );

            for (const intervalle of modelIntervalles) {
              const completedTasks = tasks.filter(t => 
                t.enginId === engin.id &&
                t.type === 'PREVENTIF' &&
                t.label.includes(intervalle.operation.substring(0, 20)) &&
                (t.statut === 'FAIT' || t.statut === 'VALIDE') &&
                !t.deleted
              );
              completedTasks.sort((a, b) => (b.heuresEnginAuMoment || 0) - (a.heuresEnginAuMoment || 0));
              const lastPmHours = completedTasks[0]?.heuresEnginAuMoment || 0;
              const hoursSinceLastPm = (engin.heuresMarche || 0) - lastPmHours;

              const threshold = intervalle.intervalleHeures * 0.9;
              if (hoursSinceLastPm >= threshold) {
                const alreadyGenerated = tasks.some(t => 
                  t.enginId === engin.id &&
                  t.type === 'PREVENTIF' &&
                  t.label.includes(intervalle.operation.substring(0, 20)) &&
                  !['FAIT', 'VALIDE', 'REPORTE'].includes(t.statut) &&
                  !t.deleted
                );
                if (alreadyGenerated) continue;

                const siteMecas = filteredMecaniciens.filter(m => m.siteId === engin.siteId);
                const assignedMeca = siteMecas[0] || filteredMecaniciens[0];
                if (!assignedMeca) continue;

                const isCritique = hoursSinceLastPm >= intervalle.intervalleHeures;
                const priorite = isCritique ? 'CRITIQUE' : 'HAUTE';

                await addDoc(collection(db, 'maintenanceTasks'), {
                  type: 'PREVENTIF',
                  label: `${intervalle.operation} — Échéance ${intervalle.intervalleHeures}h (Actuel: ${engin.heuresMarche}h, Dernier: ${lastPmHours}h)`,
                  enginId: engin.id,
                  enginModele: engin.modele,
                  mecanicienId: assignedMeca.id,
                  mecanicienNom: assignedMeca.nomComplet,
                  poste: assignedMeca.poste || 'Poste 1',
                  siteId: engin.siteId,
                  datePlanifiee: todayStr,
                  dureeEstimee: getDureeByOperation(intervalle.operation),
                  priorite,
                  statut: 'NON_FAIT',
                  commentaire: '',
                  echeanceHeures: intervalle.intervalleHeures,
                  heuresEnginAuMoment: engin.heuresMarche || 0,
                  generationType: 'AUTO_PM',
                  deleted: false,
                  createdAt: Timestamp.now(),
                  updatedAt: Timestamp.now()
                });
              }
            }
          }
        } catch (err) {
          console.error("Auto generation failed", err);
        } finally {
          setGenerationRunning(false);
        }
      };
      runAutoGeneration();
    }
  }, [enginsLoaded, mecaniciensLoaded, intervallesLoaded, tasksLoaded, filteredEngins.length, filteredMecaniciens.length]);

  // CRUD Implementations
  const handleCreateTask = async (data: any) => {
    try {
      const targetEngin = filteredEngins.find(e => e.id === data.enginId);
      const targetMeca = filteredMecaniciens.find(m => m.id === data.mecanicienId);
      if (!targetEngin || !targetMeca) {
        toast.error("Erreur d'affectation.");
        return;
      }

      await addDoc(collection(db, 'maintenanceTasks'), {
        ...data,
        enginModele: targetEngin.modele,
        mecanicienNom: targetMeca.nomComplet,
        siteId: targetEngin.siteId,
        statut: 'NON_FAIT',
        commentaire: '',
        heuresEnginAuMoment: targetEngin.heuresMarche || 0,
        generationType: 'MANUEL',
        deleted: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      toast.success("Tâche planifiée avec succès !");
    } catch (err) {
      handleFirestoreError(err, 'Planifier');
    }
  };

  const handleUpdateTask = async (taskId: string, fields: Partial<MaintenanceTask>) => {
    try {
      await updateDoc(doc(db, 'maintenanceTasks', taskId), {
        ...fields,
        updatedAt: Timestamp.now()
      });
      toast.success("Tâche mise à jour.");

      // Automatic close of associated panne when corrective task is FAIT or VALIDE
      if (fields.statut === 'FAIT' || fields.statut === 'VALIDE') {
        const taskSnap = await getDoc(doc(db, 'maintenanceTasks', taskId));
        if (taskSnap.exists()) {
          const taskData = taskSnap.data();
          if (taskData.type === 'CORRECTIF' && taskData.panneId) {
            await updateDoc(doc(db, 'pannes', taskData.panneId), {
              statut: 'CLOS',
              solution: fields.commentaire || "Fiche d'intervention validée.",
              updatedAt: Timestamp.now()
            });

            // Put engine back to service
            if (taskData.enginId) {
              const enginRef = doc(db, 'engins', taskData.enginId);
              await updateDoc(enginRef, {
                etat: 'Opérationnel',
                updatedAt: Timestamp.now()
              });
            }
            toast.success("La panne associée a été automatiquement clôturée et l'engin remis en service !");
          }
        }
      }
    } catch (err) {
      handleFirestoreError(err, 'Mettre à jour');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Supprimer définitivement cette tâche ?")) return;
    try {
      await updateDoc(doc(db, 'maintenanceTasks', taskId), {
        deleted: true,
        updatedAt: Timestamp.now()
      });
      toast.success("Tâche supprimée.");
    } catch (err) {
      handleFirestoreError(err, 'Supprimer');
    }
  };

  // Get filtered list for UI
  const getVisibleTasks = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    return filteredTasks.filter(t => {
      // Date Filter
      if (filterDate === "Aujourd'hui") {
        if (t.datePlanifiee !== todayStr) return false;
      } else if (filterDate !== "Tous") {
        if (t.datePlanifiee !== filterDate) return false;
      }

      // Type Filter
      if (filterType !== 'TOUS' && t.type !== filterType) return false;

      // Mechanic Filter
      if (filterMeca !== 'TOUS' && t.mecanicienId !== filterMeca) return false;

      // Shift Filter
      if (filterPoste !== 'TOUS' && t.poste !== filterPoste) return false;

      // Search Query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesLabel = t.label.toLowerCase().includes(query);
        const matchesEngin = t.enginId.toLowerCase().includes(query);
        const matchesMeca = t.mecanicienNom.toLowerCase().includes(query);
        if (!matchesLabel && !matchesEngin && !matchesMeca) return false;
      }

      return true;
    });
  };

  // Duration utility helper
  const getCumulativeDuration = (items: MaintenanceTask[]) => {
    let totalMins = 0;
    items.forEach(t => {
      if (t.statut === 'REPORTE') return;
      const d = t.dureeEstimee;
      if (d === '15min') totalMins += 15;
      else if (d === '30min') totalMins += 30;
      else if (d === '1h') totalMins += 60;
      else if (d === '2h') totalMins += 120;
      else if (d === '4h') totalMins += 240;
      else if (d === '6h') totalMins += 360;
      else if (d === '1j') totalMins += 480;
    });
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${hrs}h ${mins > 0 ? mins + 'min' : ''}`;
  };

  // WhatsApp Recap
  const handleGenerateSMSRecap = () => {
    const activeTasks = getVisibleTasks();
    const faits = activeTasks.filter(t => t.statut === 'FAIT' || t.statut === 'VALIDE').length;
    const total = activeTasks.length;
    
    let text = `*Hydromines GMAO — Rapport de Shift (${filterDate})*\n`;
    text += `Statut global: ${faits}/${total} effectués (${total > 0 ? Math.round(faits/total*100) : 0}%)\n\n`;
    
    activeTasks.forEach((t, i) => {
      const icon = t.statut === 'FAIT' || t.statut === 'VALIDE' ? "✅" : t.statut === 'EN_COURS' ? "⏳" : t.statut === 'REPORTE' ? "❌" : "🔲";
      text += `${i+1}. ${icon} [${t.type}] ${t.enginId} - ${t.label} (Par: ${t.mecanicienNom})\n`;
      if (t.commentaire) text += `   _Obs: ${t.commentaire}_\n`;
    });

    navigator.clipboard.writeText(text);
    toast.success("Rapport copié ! Prêt à être partagé.");
  };

  // Calendar dates calculation
  const getWeekDays = () => {
    const days = [];
    const temp = new Date(currentWeekStart);
    for (let i = 0; i < 7; i++) {
      days.push(new Date(temp));
      temp.setDate(temp.getDate() + 1);
    }
    return days;
  };

  const handlePrevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };

  // Interactive dynamic PM forecast calculation (Top 3)
  const prochainesEcheances = React.useMemo(() => {
    return filteredEngins.map(engin => {
      const modelIntervalles = pmIntervalles.filter(
        i => i.typeEngin === engin.modele || i.typeEngin === 'Générique'
      );
      
      return modelIntervalles.map(intervalle => {
        const completed = filteredTasks.filter(t => 
          t.enginId === engin.id && 
          t.type === 'PREVENTIF' &&
          t.label.includes(intervalle.operation.substring(0, 20)) &&
          (t.statut === 'FAIT' || t.statut === 'VALIDE')
        );
        completed.sort((a, b) => (b.heuresEnginAuMoment || 0) - (a.heuresEnginAuMoment || 0));
        const lastPmHours = completed[0]?.heuresEnginAuMoment || 0;
        const remainingHours = intervalle.intervalleHeures - ((engin.heuresMarche || 0) - lastPmHours);
        
        return { enginId: engin.id, operation: intervalle.operation, remainingHours };
      });
    }).flat()
      .filter(e => e.remainingHours > 0 && e.remainingHours <= 100)
      .sort((a, b) => a.remainingHours - b.remainingHours)
      .slice(0, 3);
  }, [filteredEngins, pmIntervalles, filteredTasks]);

  // Leaders calculations
  const statsParMeca = React.useMemo(() => {
    const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
    return filteredMecaniciens.map(meca => {
      const tasksMeca = filteredTasks.filter(t => 
        t.mecanicienId === meca.id && 
        t.datePlanifiee.startsWith(currentMonthStr)
      );
      const total = tasksMeca.length;
      const faites = tasksMeca.filter(t => t.statut === 'FAIT' || t.statut === 'VALIDE').length;
      const retard = tasksMeca.filter(t => 
        t.statut === 'NON_FAIT' && 
        t.datePlanifiee < new Date().toISOString().split('T')[0]
      ).length;
      const rate = total > 0 ? Math.round((faites / total) * 100) : 0;

      const badges: string[] = [];
      if (rate >= 90) badges.push('🏆 Champion');
      if (rate >= 80) badges.push('⭐ Spécialiste');
      if (retard === 0 && faites > 0) badges.push('🔥 Série Or');
      else if (retard <= 2 && faites > 0) badges.push('🔥 Série Argent');

      return { meca, total, faites, retard, rate, badges };
    }).sort((a, b) => b.rate - a.rate);
  }, [filteredMecaniciens, filteredTasks]);

  const kpis = React.useMemo(() => {
    const currentMonthStr = new Date().toISOString().substring(0, 7);
    const tasksMois = filteredTasks.filter(t => t.datePlanifiee.startsWith(currentMonthStr));
    const total = tasksMois.length;
    const faites = tasksMois.filter(t => t.statut === 'FAIT' || t.statut === 'VALIDE').length;
    const perfGlobale = total > 0 ? Math.round((faites / total) * 100) : 85;

    const prev = tasksMois.filter(t => t.type === 'PREVENTIF' || t.type === 'QUOTIDIEN').length;
    const corr = tasksMois.filter(t => t.type === 'CORRECTIF').length;
    const totalType = prev + corr;
    const prevPercent = totalType > 0 ? Math.round((prev / totalType) * 100) : 75;

    const topNom = statsParMeca[0]?.meca.nomComplet || 'Aucun';
    const topRate = statsParMeca[0]?.rate || 0;

    return { perfGlobale, prevPercent, topNom, topRate };
  }, [filteredTasks, statsParMeca]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-900">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-slate-800" />
          <span className="text-sm font-black uppercase tracking-wider">Chargement GMAO...</span>
        </div>
      </div>
    );
  }

  const visibleTasks = getVisibleTasks();
  const tasksFait = visibleTasks.filter(t => t.statut === 'FAIT' || t.statut === 'VALIDE').length;
  const tasksTotal = visibleTasks.length;
  const progressionRate = tasksTotal > 0 ? Math.round((tasksFait / tasksTotal) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Banner */}
      <PageBanner
        icon={Calendar}
        badgeLabel="Hydromines GMAO"
        title="Tâches & Planning"
        subtitle="Rondes quotidiennes, interventions préventives calculées et correctifs de shift"
        siteLabel={activeSite}
      >
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsSignalerPanneOpen(true)}
            className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer shadow-sm"
          >
            <AlertTriangle className="h-4 w-4 mr-1.5 animate-pulse" /> Signaler une panne
          </Button>
          <Button
            onClick={handleGenerateSMSRecap}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
          >
            <Share2 className="h-4 w-4 mr-1.5" /> Whatsapp / SMS
          </Button>
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="text-xs font-bold bg-white"
          >
            <Printer className="h-4 w-4 mr-1.5" /> Imprimer
          </Button>
        </div>
      </PageBanner>

      {/* Main Body */}
      <div className="p-4 max-w-7xl mx-auto w-full space-y-4">
        
        {/* Tab Selector */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3 px-6 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-px flex items-center gap-2 ${
              activeTab === 'tasks' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Clock className="h-4 w-4" /> Tâches Journalières
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-3 px-6 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-px flex items-center gap-2 ${
              activeTab === 'calendar' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Calendar className="h-4 w-4" /> Calendrier & Planning
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`py-3 px-6 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-px flex items-center gap-2 ${
              activeTab === 'performance' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Award className="h-4 w-4" /> Performance & Gamification
          </button>
          <button
            onClick={() => setActiveTab('pannes')}
            className={`py-3 px-6 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-px flex items-center gap-2 ${
              activeTab === 'pannes' ? 'border-rose-600 text-rose-700' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <AlertTriangle className="h-4 w-4 text-rose-500 animate-pulse" /> Pannes & Correctifs
          </button>
        </div>

        {/* -------------------- TAB 1: TASKS LIST -------------------- */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            
            {/* Summary Progress Card */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-slate-900 text-white border-none shadow-sm md:col-span-3">
                <CardContent className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center md:text-left">
                    <span className="text-[10px] font-bold uppercase text-amber-500 tracking-wider">Avancement du shift</span>
                    <h3 className="text-xl font-black uppercase">{progressionRate}% Terminé</h3>
                    <p className="text-xs text-slate-300 font-medium">
                      {tasksFait} fiches validées / réalisées sur un total de {tasksTotal} tâches affectées
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <span className="text-2xl font-black text-amber-500">{tasksTotal}</span>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Fiches affectées</p>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-black text-emerald-400">{tasksFait}</span>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Réalisées</p>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-black text-blue-400">{getCumulativeDuration(visibleTasks)}</span>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Charge estimée</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Action Button */}
              <div className="flex items-stretch">
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="w-full h-full bg-amber-500 hover:bg-amber-600 border-amber-600 text-slate-950 font-black uppercase text-xs flex flex-col items-center justify-center gap-1.5 rounded-3xl transition-transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Plus className="h-6 w-6" /> Planifier Tâche
                </Button>
              </div>
            </div>

            {/* Filters Bar */}
            <Card className="bg-white border border-slate-200">
              <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Filter className="h-3 w-3" /> Type
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full h-9 px-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="TOUS">Tous les types</option>
                    <option value="PREVENTIF">🔩 Préventifs (PM)</option>
                    <option value="CORRECTIF">🚨 Correctifs</option>
                    <option value="QUOTIDIEN">📅 Quotidiens</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <User className="h-3 w-3" /> Intervenant
                  </label>
                  <select
                    value={filterMeca}
                    onChange={(e) => setFilterMeca(e.target.value)}
                    className="w-full h-9 px-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="TOUS">Tous les agents</option>
                    {filteredMecaniciens.map(m => (
                      <option key={m.id} value={m.id}>{m.nomComplet}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Clock3 className="h-3 w-3" /> Shift / Poste
                  </label>
                  <select
                    value={filterPoste}
                    onChange={(e) => setFilterPoste(e.target.value)}
                    className="w-full h-9 px-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="TOUS">Tous les shifts</option>
                    <option value="Poste 1">Poste 1</option>
                    <option value="Poste 2">Poste 2</option>
                    <option value="Poste 3">Poste 3</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Échéance
                  </label>
                  <select
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full h-9 px-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="Aujourd'hui">Aujourd'hui</option>
                    <option value="Tous">Toutes les dates</option>
                  </select>
                </div>

                <div className="space-y-1 relative">
                  <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Search className="h-3 w-3" /> Rechercher
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Machine, libellé, agent..."
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tasks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleTasks.map(task => (
                <Card
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="bg-white border border-slate-200 rounded-3xl hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col text-xs"
                >
                  <CardHeader className="p-4 pb-2 border-b border-slate-100 flex flex-row items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                          task.type === 'PREVENTIF' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                          task.type === 'CORRECTIF' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {task.type}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                          task.priorite === 'CRITIQUE' ? 'bg-red-500 text-white animate-pulse' :
                          task.priorite === 'HAUTE' ? 'bg-amber-500 text-slate-950' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {task.priorite}
                        </span>
                      </div>
                      <h4 className="font-black text-slate-900 tracking-tight line-clamp-2">
                        {task.label}
                      </h4>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                      <div className="flex items-center gap-1 font-bold">
                        <Truck className="h-3 w-3 text-slate-400" /> {task.enginId} ({task.enginModele})
                      </div>
                      <div className="flex items-center gap-1 font-bold">
                        <User className="h-3 w-3 text-slate-400" /> {task.mecanicienNom}
                      </div>
                      <div className="flex items-center gap-1 font-bold">
                        <Clock className="h-3 w-3 text-slate-400" /> {task.dureeEstimee}
                      </div>
                      <div className="flex items-center gap-1 font-bold">
                        <Clock3 className="h-3 w-3 text-slate-400" /> {task.poste}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                      <span className="text-[9px] text-slate-400 font-bold">{task.datePlanifiee}</span>
                      
                      <div className="flex items-center gap-1">
                        <span className={`px-2 py-1 rounded-xl text-[9px] font-black uppercase ${
                          task.statut === 'VALIDE' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          task.statut === 'FAIT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          task.statut === 'EN_COURS' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          task.statut === 'REPORTE' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                          'bg-slate-50 text-slate-500 border border-slate-100'
                        }`}>
                          {task.statut === 'VALIDE' ? '🛡️ Validé' :
                           task.statut === 'FAIT' ? '✅ Fait' :
                           task.statut === 'EN_COURS' ? '⏳ En cours' :
                           task.statut === 'REPORTE' ? '❌ Reporté' :
                           '🔲 À faire'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {visibleTasks.length === 0 && (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 gap-2 bg-white rounded-3xl border border-slate-150">
                  <AlertTriangle className="h-8 w-8 text-slate-300" />
                  <p className="font-black text-xs uppercase tracking-wider text-slate-500">Aucune tâche trouvée</p>
                  <p className="text-[10px] text-slate-400 font-medium">Modifiez vos critères de filtrage</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* -------------------- TAB 2: CALENDAR PLANNING -------------------- */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            
            {/* Intel PM Forecast Card */}
            <Card className="bg-slate-900 text-white border-none shadow-sm overflow-hidden">
              <CardContent className="p-5 flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="space-y-1 max-w-lg text-center md:text-left">
                  <span className="text-[10px] font-bold uppercase text-amber-500 tracking-wider flex items-center justify-center md:justify-start gap-1">
                    <Zap className="h-3.5 w-3.5" /> Algo de Prévision Intelligente
                  </span>
                  <h3 className="text-sm font-black uppercase">🔥 Prochaines Fiches PM (Échéances &lt; 100 Heures)</h3>
                  <p className="text-xs text-slate-300 font-medium">
                    Calcul en direct basé sur les heures de marche réelles des engins et l'historique des derniers préventifs validés sur Firestore
                  </p>
                </div>
                <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                  {prochainesEcheances.map((ech, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-800 border border-slate-700/80 p-3 rounded-2xl flex flex-col gap-1 min-w-[160px]"
                    >
                      <span className="text-[10px] font-black uppercase text-amber-400">{ech.enginId}</span>
                      <p className="text-[10px] text-white font-black truncate">{ech.operation}</p>
                      <span className="text-[9px] font-bold text-rose-400 mt-1">
                        Dû dans <strong className="text-white">{Math.round(ech.remainingHours)}h</strong>
                      </span>
                    </div>
                  ))}
                  {prochainesEcheances.length === 0 && (
                    <div className="text-slate-400 text-xs font-bold py-2 px-4 bg-slate-800/50 rounded-2xl">
                      Aucune PM critique immédiate (&lt; 100h)
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Navigation Weeks */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePrevWeek} className="text-xs font-bold">
                  Précédent
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextWeek} className="text-xs font-bold">
                  Suivant
                </Button>
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Semaine du {currentWeekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>

            {/* Grid Calendar */}
            <Card className="bg-white border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-black uppercase text-[10px]">
                      <th className="p-4 border-r border-slate-200 w-44">Mécanicien</th>
                      {getWeekDays().map((day, idx) => (
                        <th key={idx} className="p-4 border-r border-slate-200 text-center">
                          {day.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMecaniciens.map(meca => (
                      <tr key={meca.id} className="border-b border-slate-150 hover:bg-slate-50/50">
                        <td className="p-4 border-r border-slate-200 font-black text-slate-800">
                          {meca.nomComplet}
                          <span className="block text-[9px] font-bold text-slate-400 mt-0.5">{meca.specialite || "Moteur"}</span>
                        </td>
                        {getWeekDays().map((day, idx) => {
                          const dayStr = day.toISOString().split('T')[0];
                          const dayTasks = filteredTasks.filter(
                            t => t.mecanicienId === meca.id && t.datePlanifiee === dayStr && !t.deleted
                          );

                          return (
                            <td key={idx} className="p-2 border-r border-slate-200 align-top min-h-[100px] h-24">
                              <div className="space-y-1">
                                {dayTasks.map(task => (
                                  <div
                                    key={task.id}
                                    onClick={() => setSelectedTask(task)}
                                    className={`p-1.5 rounded-xl border cursor-pointer hover:scale-102 transition-transform duration-100 ${
                                      task.statut === 'VALIDE' ? 'bg-blue-50/70 text-blue-800 border-blue-200' :
                                      task.statut === 'FAIT' ? 'bg-emerald-50/70 text-emerald-800 border-emerald-200' :
                                      task.statut === 'REPORTE' ? 'bg-rose-50/70 text-rose-800 border-rose-200' :
                                      'bg-slate-50/70 text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between text-[8px] font-black mb-0.5 uppercase">
                                      <span className="truncate max-w-[50px]">{task.enginId}</span>
                                      <span>{task.poste === 'Poste 1' ? 'P1' : task.poste === 'Poste 2' ? 'P2' : 'P3'}</span>
                                    </div>
                                    <p className="text-[9px] font-bold line-clamp-1 truncate">{task.label}</p>
                                  </div>
                                ))}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

          </div>
        )}

        {/* -------------------- TAB 3: PERFORMANCE -------------------- */}
        {activeTab === 'performance' && (
          <div className="space-y-4">
            
            {/* Gamification Counters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white border border-slate-200 shadow-xs">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Taux de Shift</span>
                    <h3 className="text-lg font-black text-slate-800">{kpis.perfGlobale}%</h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-slate-200 shadow-xs">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center text-amber-500 animate-bounce">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Prophète du Mois</span>
                    <h3 className="text-sm font-black text-slate-800 truncate">{kpis.topNom}</h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-slate-200 shadow-xs">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Score Moyen d'exécution</span>
                    <h3 className="text-lg font-black text-slate-800">{kpis.topRate}%</h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-slate-200 shadow-xs">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-amber-500">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Ratio Préventif / Correctif</span>
                    <h3 className="text-lg font-black text-slate-800">{kpis.prevPercent}% / {100 - kpis.prevPercent}%</h3>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Leaderboard Table */}
            <Card className="bg-white border border-slate-200 overflow-hidden rounded-3xl shadow-sm">
              <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-600">
                  🏆 Classement des Mécaniciens — Efficacité Mensuelle
                </CardTitle>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-black uppercase text-[9px]">
                      <th className="p-4">Rang</th>
                      <th className="p-4">Intervenant</th>
                      <th className="p-4 text-center">Fiches Réalisées</th>
                      <th className="p-4 text-center">Taux d'Éradication</th>
                      <th className="p-4 text-center">Retards Cumulés</th>
                      <th className="p-4">Badges & Gamification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsParMeca.map((stat, idx) => (
                      <tr key={stat.meca.id} className="border-b border-slate-150 hover:bg-slate-50/50">
                        <td className="p-4 font-black text-slate-600">
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                        </td>
                        <td className="p-4 font-black text-slate-800 flex items-center gap-2">
                          <div className="h-7 w-7 bg-slate-900 rounded-full flex items-center justify-center text-white font-black text-[9px]">
                            {stat.meca.nomComplet.substring(0, 2)}
                          </div>
                          <div>
                            {stat.meca.nomComplet}
                            <span className="block text-[8px] font-bold text-slate-400">{stat.meca.specialite || "Hydraulique"}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center font-bold text-slate-700">
                          {stat.faites} / {stat.total}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="font-black text-slate-800">{stat.rate}%</span>
                            <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-slate-900" style={{ width: `${stat.rate}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`font-black uppercase px-2 py-0.5 rounded-full text-[9px] ${
                            stat.retard > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {stat.retard} retards
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1.5">
                            {stat.badges.map((badge, bidx) => (
                              <span key={bidx} className="bg-slate-900 text-amber-400 border border-slate-800 font-bold px-2 py-0.5 rounded-xl text-[9px]">
                                {badge}
                              </span>
                            ))}
                            {stat.badges.length === 0 && (
                              <span className="text-slate-400 text-[10px]">Pas encore de badge de shift</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

          </div>
        )}

        {/* -------------------- TAB 4: PANNES & CORRECTIFS -------------------- */}
        {activeTab === 'pannes' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
              <Card className="bg-white border border-slate-200 shadow-xs">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    mtbfMttrMetrics.activeCount > 0 ? 'bg-rose-50 text-rose-600 border border-rose-100 animate-pulse' : 'bg-slate-50 text-slate-500'
                  }`}>
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Pannes Actives</span>
                    <h3 className="text-lg font-black text-slate-800">
                      {mtbfMttrMetrics.activeCount} <span className="text-xs text-slate-400 font-bold">/ {mtbfMttrMetrics.totalCount}</span>
                    </h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-slate-200 shadow-xs">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center text-[#b8860b]">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Fiabilité (MTBF)</span>
                    <h3 className="text-lg font-black text-slate-800">{mtbfMttrMetrics.mtbf} <span className="text-xs text-slate-400 font-bold">h</span></h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-slate-200 shadow-xs">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <Clock3 className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Réparabilité (MTTR)</span>
                    <h3 className="text-lg font-black text-slate-800">{mtbfMttrMetrics.mttr} <span className="text-xs text-slate-400 font-bold">h</span></h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-slate-200 shadow-xs">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Taux de Résilience</span>
                    <h3 className="text-lg font-black text-slate-800">
                      {mtbfMttrMetrics.totalCount > 0 
                        ? Math.round(((mtbfMttrMetrics.totalCount - mtbfMttrMetrics.activeCount) / mtbfMttrMetrics.totalCount) * 100) 
                        : 100}%
                    </h3>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Split layout: List on Left, Detail & Actions on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              
              {/* Left Col: list of pannes */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                <Card className="bg-white border border-slate-200 shadow-sm flex flex-col flex-1 p-4 space-y-3 min-h-[500px]">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Rechercher une panne..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                    />
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 max-h-[550px] pr-1">
                    {filteredPannes.filter(p => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return (p.numero?.toLowerCase().includes(q) || 
                              p.description?.toLowerCase().includes(q) || 
                              p.categorie?.toLowerCase().includes(q) ||
                              p.enginId?.toLowerCase().includes(q));
                    }).map(panne => {
                      const isSelected = selectedPanne?.id === panne.id;
                      const isCritique = panne.gravite === 'Critique';
                      const isElevee = panne.gravite === 'Élevée';
                      const badgeColor = isCritique 
                        ? 'bg-red-50 text-red-700 border-red-150' 
                        : isElevee 
                          ? 'bg-orange-50 text-orange-700 border-orange-150'
                          : 'bg-amber-50 text-amber-700 border-amber-150';

                      return (
                        <div
                          key={panne.id}
                          onClick={() => {
                            setSelectedPanne(panne);
                            setDiagComment(panne.diagnostic || '');
                            setDiagMecaId(panne.mecanicienAssigne || '');
                            setDiagArret(panne.arretMachine || false);
                          }}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left space-y-2 ${
                            isSelected 
                              ? 'border-rose-500 bg-rose-50/40 shadow-sm' 
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-mono font-black uppercase text-slate-800">
                              🔧 {panne.numero || panne.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full font-black uppercase tracking-wider text-[8.5px] border ${badgeColor}`}>
                              {panne.gravite}
                            </span>
                          </div>

                          <div>
                            <p className="text-xs font-black text-slate-900 leading-tight line-clamp-1">{panne.description}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                              Engin : <span className="text-slate-800 font-extrabold">{panne.enginId}</span> • Organe : <span className="text-slate-800 font-extrabold">{panne.categorie}</span>
                            </p>
                          </div>

                          <div className="flex justify-between items-center border-t border-slate-100 pt-2 text-[9px] font-bold text-slate-400 font-mono">
                            <span>📅 {panne.dateDeclaration ? panne.dateDeclaration.split('T')[0] : 'N/A'}</span>
                            <span className={`px-1.5 py-0.5 rounded uppercase font-black tracking-widest text-[8.5px] ${
                              panne.statut === 'CLOS' ? 'bg-emerald-100 text-emerald-800' :
                              panne.statut === 'EN_REPARATION' ? 'bg-indigo-100 text-indigo-800 animate-pulse' :
                              panne.statut === 'DIAGNOSTIQUE' ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800 animate-pulse'
                            }`}>
                              {panne.statut}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {filteredPannes.length === 0 && (
                      <div className="py-16 text-center text-slate-400 space-y-2 uppercase font-black text-xs">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto animate-bounce" />
                        <p>Zéro panne active enregistrée ! ✓</p>
                        <p className="text-[10px] font-bold text-slate-400">Le parc opère en sécurité nominale.</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Right Col: Details & actions workflow */}
              <div className="lg:col-span-7">
                <Card className="bg-white border border-slate-200 shadow-sm p-5 space-y-6 flex flex-col justify-between h-full min-h-[500px]">
                  {selectedPanne ? (
                    <div className="space-y-6 text-xs text-left">
                      
                      {/* Sub-Header */}
                      <div className="border-b border-slate-100 pb-4 flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full tracking-widest animate-pulse">
                            {selectedPanne.statut}
                          </span>
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                            Incident : {selectedPanne.numero}
                          </h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            Déclaré par : <span className="text-slate-700 font-black">{selectedPanne.declareParNom}</span> le {selectedPanne.dateDeclaration?.replace('T', ' ').substring(0, 16)}
                          </p>
                        </div>
                        
                        {selectedPanne.photo && (
                          <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 cursor-pointer hover:scale-105 transition-transform">
                            <img 
                              src={selectedPanne.photo} 
                              alt="Anomalie" 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                              onClick={() => window.open(selectedPanne.photo)}
                            />
                          </div>
                        )}
                      </div>

                      {/* Info Cards Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Engin concerné</span>
                          <span className="font-extrabold text-slate-900">{selectedPanne.enginId} ({selectedPanne.enginModele || "ST2G"})</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Organe affecté</span>
                          <span className="font-extrabold text-slate-900">{selectedPanne.categorie}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">État Machine</span>
                          <span className={`font-black uppercase flex items-center gap-1 ${selectedPanne.arretMachine ? 'text-red-600 animate-pulse' : 'text-emerald-600'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${selectedPanne.arretMachine ? 'bg-red-500' : 'bg-emerald-500'}`} />
                            {selectedPanne.arretMachine ? 'Arrêt Immédiat' : 'En Service'}
                          </span>
                        </div>
                      </div>

                      {/* Symptoms */}
                      <div className="p-3 bg-red-50/30 border border-red-100 rounded-xl space-y-1">
                        <span className="text-[9px] font-black uppercase text-red-700 tracking-wider">Symptômes déclarés :</span>
                        <p className="font-medium text-slate-800 leading-relaxed text-sm">{selectedPanne.description}</p>
                      </div>

                      {/* Workflow Actions Section */}
                      <div className="border-t border-slate-100 pt-4 space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#b8860b]">
                          ⚙️ Cycle de Traitement Correctif
                        </h4>

                        {/* STEP 1: Assigner & Diagnostiquer */}
                        {selectedPanne.statut === 'DECLAREE' && (
                          <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl space-y-3.5">
                            <span className="text-[10px] font-black uppercase text-amber-800">Étape 1 : Affectation & Diagnostic Terrain</span>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-500 uppercase block">Mécanicien Assigné *</label>
                                <select
                                  value={diagMecaId}
                                  onChange={(e) => setDiagMecaId(e.target.value)}
                                  className="w-full h-9 px-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                                >
                                  <option value="">Sélectionner un intervenant...</option>
                                  {filteredMecaniciens.map(m => (
                                    <option key={m.id} value={m.id}>{m.nomComplet} ({m.specialite || "Mécanique"})</option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-500 uppercase block">Arrêt de production ?</label>
                                <div className="flex items-center h-9">
                                  <input 
                                    type="checkbox" 
                                    checked={diagArret} 
                                    onChange={(e) => setDiagArret(e.target.checked)}
                                    className="mr-2 h-4 w-4 rounded cursor-pointer" 
                                  />
                                  <span className="font-bold text-slate-700 uppercase cursor-pointer select-none">Confirmer arrêt</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-500 uppercase block">Note de Diagnostic * (Symptômes & Actions requis)</label>
                              <textarea
                                value={diagComment}
                                onChange={(e) => setDiagComment(e.target.value)}
                                placeholder="Saisir les remarques du diagnostic..."
                                className="w-full h-14 p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none text-xs font-medium"
                              />
                            </div>

                            <Button
                              onClick={async () => {
                                if (!diagMecaId) { toast.error("Veuillez assigner un mécanicien."); return; }
                                if (diagComment.length < 5) { toast.error("Veuillez saisir une note de diagnostic."); return; }
                                try {
                                  const meca = filteredMecaniciens.find(m => m.id === diagMecaId);
                                  await updateDoc(doc(db, 'pannes', selectedPanne.id), {
                                    statut: 'DIAGNOSTIQUE',
                                    mecanicienAssigne: diagMecaId,
                                    mecanicienAssigneNom: meca?.nomComplet || 'Inconnu',
                                    diagnostic: diagComment,
                                    arretMachine: diagArret,
                                    updatedAt: Timestamp.now()
                                  });
                                  toast.success("Diagnostic enregistré ! Panne passée à l'étape suivante.");
                                  setSelectedPanne(prev => ({ 
                                    ...prev, 
                                    statut: 'DIAGNOSTIQUE', 
                                    mecanicienAssigne: diagMecaId,
                                    mecanicienAssigneNom: meca?.nomComplet || 'Inconnu',
                                    diagnostic: diagComment,
                                    arretMachine: diagArret
                                  }));
                                } catch (err) {
                                  toast.error("Erreur d'affectation.");
                                }
                              }}
                              className="bg-amber-500 hover:bg-amber-600 text-white font-black uppercase text-[10px] py-1 px-4 h-8"
                            >
                              Valider le Diagnostic
                            </Button>
                          </div>
                        )}

                        {/* STEP 2: Créer un BT Correctif */}
                        {selectedPanne.statut === 'DIAGNOSTIQUE' && (
                          <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl space-y-3.5">
                            <span className="text-[10px] font-black uppercase text-indigo-800">Étape 2 : Planification du Bon de Travail (BT) Correctif</span>
                            
                            <div className="p-3 bg-white border border-slate-100 rounded-lg space-y-1">
                              <p className="font-bold text-slate-700">📋 Note de Diagnostic :</p>
                              <p className="text-slate-600">{selectedPanne.diagnostic}</p>
                              <p className="text-[10px] text-slate-400 font-medium">Assigné à : <span className="font-bold text-slate-600">{selectedPanne.mecanicienAssigneNom}</span></p>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                              <Button
                                disabled={isCreatingBt}
                                onClick={async () => {
                                  setIsCreatingBt(true);
                                  try {
                                    const formattedDate = new Date().toISOString().split('T')[0];
                                    await addDoc(collection(db, 'maintenanceTasks'), {
                                      label: `CORRECTIF • ${selectedPanne.numero} — ${selectedPanne.description}`,
                                      enginId: selectedPanne.enginId,
                                      enginModele: selectedPanne.enginModele || "ST2G",
                                      mecanicienNom: selectedPanne.mecanicienAssigneNom,
                                      mecanicienId: selectedPanne.mecanicienAssigne,
                                      siteId: selectedPanne.siteId,
                                      type: 'CORRECTIF',
                                      priorite: selectedPanne.gravite === 'Critique' ? 'CRITIQUE' : selectedPanne.gravite === 'Élevée' ? 'HAUTE' : 'HAUTE',
                                      datePlanifiee: formattedDate,
                                      poste: 'Poste 1',
                                      dureeEstimee: selectedPanne.gravite === 'Critique' ? '4h' : selectedPanne.gravite === 'Élevée' ? '2h' : '1h',
                                      panneId: selectedPanne.id,
                                      statut: 'NON_FAIT',
                                      commentaire: '',
                                      heuresEnginAuMoment: 0,
                                      generationType: 'MANUEL',
                                      deleted: false,
                                      createdAt: Timestamp.now(),
                                      updatedAt: Timestamp.now()
                                    });

                                    await updateDoc(doc(db, 'pannes', selectedPanne.id), {
                                      statut: 'EN_REPARATION',
                                      updatedAt: Timestamp.now()
                                    });

                                    toast.success("Bon de Travail (BT) Correctif créé et assigné !");
                                    setSelectedPanne(prev => ({ ...prev, statut: 'EN_REPARATION' }));
                                  } catch (err) {
                                    console.error(err);
                                    toast.error("Erreur de création du BT.");
                                  } finally {
                                    setIsCreatingBt(false);
                                  }
                                }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] h-8"
                              >
                                {isCreatingBt ? 'Génération...' : '🛠️ Générer le BT Correctif'}
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* STEP 3: En cours de réparation / Résolution */}
                        {selectedPanne.statut === 'EN_REPARATION' && (
                          <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl space-y-3.5 text-center py-6">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block mr-2" />
                            <span className="text-[10px] font-black uppercase text-emerald-800">Intervention en cours sur le terrain</span>
                            <p className="text-slate-600 mt-2">La panne est en cours de traitement. Elle sera automatiquement clôturée dès que la tâche corrective associée sera validée ou marquée comme réalisée par le mécanicien.</p>
                          </div>
                        )}

                        {/* Direct manual closing button (Always available for manager) */}
                        {selectedPanne.statut !== 'CLOS' && isModeDirecteur && (
                          <div className="border-t border-dashed border-slate-200 pt-4 space-y-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#b8860b] block">Clôture Manuelle d'Urgence</span>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-500 uppercase block">Durée d'Immobilisation (Heures) *</label>
                                <input
                                  type="number"
                                  min={0.5}
                                  max={120}
                                  step={0.5}
                                  id="diagImmo"
                                  placeholder="Ex: 4"
                                  className="w-full h-9 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-500 uppercase block">Remède / Solution apportée *</label>
                                <input
                                  type="text"
                                  id="diagSolution"
                                  placeholder="Ex: Remplacement du flexible de direction"
                                  className="w-full h-9 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                                />
                              </div>
                            </div>

                            <Button
                              onClick={async () => {
                                const hoursInput = document.getElementById('diagImmo') as HTMLInputElement;
                                const solutionInput = document.getElementById('diagSolution') as HTMLInputElement;
                                if (!hoursInput || !solutionInput) return;
                                
                                const hours = Number(hoursInput.value);
                                const solution = solutionInput.value;
                                if (!hours || hours <= 0) { toast.error("Veuillez renseigner une durée d'arrêt valide."); return; }
                                if (solution.length < 5) { toast.error("Veuillez renseigner le remède apporté."); return; }

                                try {
                                  await updateDoc(doc(db, 'pannes', selectedPanne.id), {
                                    statut: 'CLOS',
                                    dureeImmobilisation: hours,
                                    solution: solution,
                                    updatedAt: Timestamp.now()
                                  });

                                  // Remettre l'engin en service
                                  if (selectedPanne.enginId) {
                                    const enginRef = doc(db, 'engins', selectedPanne.enginId);
                                    await updateDoc(enginRef, {
                                      etat: 'Opérationnel',
                                      updatedAt: Timestamp.now()
                                    });
                                  }

                                  toast.success("Panne résolue et engin remis en service nominal !");
                                  setSelectedPanne(null);
                                } catch (err) {
                                  toast.error("Erreur de clôture.");
                                }
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] w-full"
                            >
                              ✅ Clôturer et remettre l'engin en service nominal
                            </Button>
                          </div>
                        )}

                        {/* CASE: Panne est CLÔTURÉE */}
                        {selectedPanne.statut === 'CLOS' && (
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2">
                            <span className="text-[10px] font-black uppercase text-slate-500">Incident clôturé ✓</span>
                            <p className="font-bold text-slate-800">✅ Solution appliquée :</p>
                            <p className="text-slate-600 font-medium">{selectedPanne.solution || "Aucune note"}</p>
                            {selectedPanne.dureeImmobilisation && (
                              <p className="text-[10px] text-red-600 font-mono font-bold uppercase">⏱️ Durée d'Immobilisation : {selectedPanne.dureeImmobilisation} Heures</p>
                            )}
                          </div>
                        )}

                      </div>

                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col justify-center items-center text-slate-400 gap-2 font-mono py-16">
                      <AlertTriangle className="h-8 w-8 text-slate-300" />
                      <p className="font-black text-xs uppercase tracking-wider text-slate-500">Sélectionner un incident</p>
                      <p className="text-[10px] text-slate-400 font-medium">Cliquez sur une panne à gauche pour afficher son workflow</p>
                    </div>
                  )}
                </Card>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Modals components */}
      <SignalerPanne
        isOpen={isSignalerPanneOpen}
        onClose={() => setIsSignalerPanneOpen(false)}
      />

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          isModeDirecteur={isModeDirecteur}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {isAddModalOpen && (
        <AddTaskModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          engins={filteredEngins}
          mecaniciens={filteredMecaniciens}
          onCreateTask={handleCreateTask}
        />
      )}

    </div>
  );
}
