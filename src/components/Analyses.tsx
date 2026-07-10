import * as React from 'react';
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Award, AlertTriangle, CheckCircle2,
  Activity, Download, Printer, BarChart3, Users, Wrench,
  Shield, Clock, AlertCircle, ChevronRight, Trophy
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageBanner } from '@/components/ui/PageBanner';
import { useCollection } from '@/hooks/useCollection';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';

export default function Analyses() {
  const [activeTab, setActiveTab] = useState<"directeur" | "performances" | "fiabilite" | "export" | "pannes">("directeur");
  const [periodePannes, setPeriodePannes] = useState<30 | 90 | 180>(90);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [rapportGenere, setRapportGenere] = useState<any>(null);
  const [fenetreMois, setFenetreMois] = useState<6 | 12>(12);
  const [compareSiteA, setCompareSiteA] = useState<string>("SMI");
  const [compareSiteB, setCompareSiteB] = useState<string>("OUMEJRANE");
  const [compareMetric, setCompareMetric] = useState<"pannes" | "dispo" | "mtbf">("pannes");

  const { user, activeSite } = useAuthStore();

  // 5 Firestore collections read in real-time
  const { data: rawEngins, loading: enginsLoading } = useCollection<any>('engins');
  const { data: rawTasks, loading: tasksLoading } = useCollection<any>('maintenanceTasks');
  const { data: rawPannes, loading: pannesLoading } = useCollection<any>('pannes');
  const { data: rawMecaniciens, loading: mecaniciensLoading } = useCollection<any>('mecaniciens');
  const { data: rawInterventions, loading: interventionsLoading } = useCollection<any>('interventions');

  // Filter helper based on role and activeSite
  const filterBySite = <T extends { siteId?: string; deleted?: boolean }>(data: T[] | null) => {
    if (!data) return [];
    const nonDeleted = data.filter(d => !d.deleted);
    if (user?.role === 'ADMIN' || user?.role === 'DIRECTION') {
      return activeSite === 'TOUS' ? nonDeleted : nonDeleted.filter(d => d.siteId === activeSite);
    }
    return nonDeleted.filter(d => d.siteId === user?.siteId);
  };

  const engins = useMemo(() => filterBySite(rawEngins), [rawEngins, activeSite, user]);
  const tasks = useMemo(() => filterBySite(rawTasks), [rawTasks, activeSite, user]);
  const pannes = useMemo(() => filterBySite(rawPannes), [rawPannes, activeSite, user]);
  const mecaniciens = useMemo(() => {
    const baseMecas = filterBySite(rawMecaniciens);
    return baseMecas.map((m: any) => ({
      ...m,
      nomComplet: m.nomComplet || `${m.prenom || ""} ${m.nom || ""}`.trim() || m.id || ""
    }));
  }, [rawMecaniciens, activeSite, user]);
  const interventions = useMemo(() => filterBySite(rawInterventions), [rawInterventions, activeSite, user]);

  const isLoading = enginsLoading || tasksLoading || pannesLoading || mecaniciensLoading || interventionsLoading || !rawEngins || !rawTasks || !rawPannes || !rawMecaniciens || !rawInterventions;

  // Relative time helper
  const getRelativeTime = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 60) return `Il y a ${diffMins} min`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `Il y a ${diffHours} h`;
      const diffDays = Math.floor(diffHours / 24);
      return `Il y a ${diffDays} j`;
    } catch {
      return dateStr;
    }
  };

  // ----------------------------------------------------
  // VUE DIRECTEUR DATA PROCESSING
  // ----------------------------------------------------
  
  // KPI 1 - Global Preventive Compliance (This Month)
  const complianceGlobale = useMemo(() => {
    const mois = new Date().toISOString().substring(0, 7);
    const pmMois = tasks.filter(t => t.type === 'PREVENTIF' && (t.datePlanifiee || '').startsWith(mois));
    const pmFaites = pmMois.filter(t => t.statut === 'FAIT' || t.statut === 'VALIDE').length;
    return pmMois.length > 0 ? Math.round((pmFaites / pmMois.length) * 100) : null;
  }, [tasks]);

  // KPI 2 - Preventive / Corrective Ratio (This Month)
  const ratioPreventifCorrectif = useMemo(() => {
    const mois = new Date().toISOString().substring(0, 7);
    const tachesMois = tasks.filter(t =>
      (t.statut === 'FAIT' || t.statut === 'VALIDE') &&
      (t.datePlanifiee || '').startsWith(mois) &&
      t.type !== 'QUOTIDIEN'
    );
    const preventif = tachesMois.filter(t => t.type === 'PREVENTIF').length;
    const correctif = tachesMois.filter(t => t.type === 'CORRECTIF').length;
    const total = preventif + correctif;
    return {
      preventifPct: total > 0 ? Math.round((preventif / total) * 100) : null,
      correctifPct: total > 0 ? Math.round((correctif / total) * 100) : null,
      total
    };
  }, [tasks]);

  // Donut chart formatted data
  const ratioData = useMemo(() => {
    if (!ratioPreventifCorrectif.total) return [];
    return [
      { name: 'Préventif', value: ratioPreventifCorrectif.preventifPct, color: '#D4A017' },
      { name: 'Correctif', value: ratioPreventifCorrectif.correctifPct, color: '#64748b' }
    ];
  }, [ratioPreventifCorrectif]);

  // KPI 3 - Tasks awaiting validation > 48h
  const tachesEnAttenteValidation = useMemo(() => {
    const now = Date.now();
    return tasks.filter(t => {
      if (t.statut !== 'FAIT') return false;
      const updatedMs = (t.updatedAt as any)?.toMillis 
        ? (t.updatedAt as any).toMillis() 
        : (t.updatedAt as any)?.seconds 
          ? (t.updatedAt as any).seconds * 1000 
          : new Date(t.updatedAt || Date.now()).getTime();
      return (now - updatedMs) / (1000 * 60 * 60) >= 48;
    });
  }, [tasks]);

  // KPI 4 - Critical raw unresolved signalments (Declared for > 24h)
  const pannesCritiquesNonTraitees = useMemo(() => {
    const now = Date.now();
    return pannes.filter(p => {
      if (p.statut !== 'DECLAREE') return false;
      const declMs = new Date(p.dateDeclaration || Date.now()).getTime();
      return (now - declMs) / (1000 * 60 * 60) >= 24;
    });
  }, [pannes]);

  // Compliance by Site list
  const complianceParSite = useMemo(() => {
    const isAdminOrDirection = user?.role === 'ADMIN' || user?.role === 'DIRECTION';
    const sites = isAdminOrDirection
      ? ['SMI', 'OUMEJRANE', 'KOUDIA', 'OUANSIMI', 'BOU-AZZER']
      : (user?.siteId ? [user.siteId] : []);
    const mois = new Date().toISOString().substring(0, 7);

    return sites.map(code => {
      const siteEngins = isAdminOrDirection
        ? (rawEngins || []).filter(e => e.siteId === code && !e.deleted)
        : (engins || []).filter(e => e.siteId === code);
      const siteTasks = isAdminOrDirection
        ? (rawTasks || []).filter(t => t.siteId === code && t.type === 'PREVENTIF' && (t.datePlanifiee || '').startsWith(mois))
        : (tasks || []).filter(t => t.siteId === code && t.type === 'PREVENTIF' && (t.datePlanifiee || '').startsWith(mois));
      const faitesATemps = siteTasks.filter(t => t.statut === 'FAIT' || t.statut === 'VALIDE').length;
      const enRetard = siteTasks.filter(t => t.statut === 'NON_FAIT' && t.priorite === 'CRITIQUE').length;
      const score = siteTasks.length > 0 ? Math.round((faitesATemps / siteTasks.length) * 100) : null;
      const sitePannes = isAdminOrDirection
        ? (rawPannes || []).filter(p => p.siteId === code && p.statut !== 'CLOS')
        : (pannes || []).filter(p => p.siteId === code && p.statut !== 'CLOS');

      return {
        code,
        fleetCount: siteEngins.length,
        score,
        totalPM: siteTasks.length,
        faitesATemps,
        enRetard,
        pannesOuvertes: sitePannes.length,
        risk: score === null ? 'SANS_DONNÉES' : score < 60 || enRetard >= 3 ? 'CRITIQUE' : score < 80 || enRetard >= 1 ? 'VIGILANCE' : 'STABLE'
      };
    });
  }, [rawEngins, rawTasks, rawPannes, engins, tasks, pannes, user]);

  // Proactive real-time alerts derived from current collections state
  const alertesProactives = useMemo(() => {
    const alertes: { id: string; type: string; message: string; priorite: 'CRITIQUE' | 'HAUTE' | 'NORMALE'; siteId: string }[] = [];
    const todayStr = new Date().toISOString().split('T')[0];
    const now = Date.now();

    // Alert 1: Overdue critical PM
    tasks.filter(t => t.type === 'PREVENTIF' && t.statut === 'NON_FAIT' && t.priorite === 'CRITIQUE').forEach(t => {
      alertes.push({
        id: `PM-DEPASSE-${t.id}`,
        type: 'MAINTENANCE',
        message: `${t.enginId} — PM dépassé : ${t.label || 'Sans libellé'}. Risque élevé de rupture mécanique.`,
        priorite: 'CRITIQUE',
        siteId: t.siteId
      });
    });

    // Alert 2: Panne declared and ignored for over 24h
    pannes.filter(p => p.statut === 'DECLAREE').forEach(p => {
      const heures = (now - new Date(p.dateDeclaration || now).getTime()) / (1000 * 60 * 60);
      if (heures >= 24) {
        alertes.push({
          id: `PANNE-IGNOREE-${p.id}`,
          type: 'RÉACTIVITÉ',
          message: `Panne #${p.numero || p.id} (${p.enginId}) — Non prise en charge depuis ${Math.floor(heures)}h.`,
          priorite: heures >= 48 ? 'CRITIQUE' : 'HAUTE',
          siteId: p.siteId
        });
      }
    });

    // Alert 3: Mechanic inactivity safety check (Meca assigned > 3 daily tasks but completed 0)
    const mecasActifs = mecaniciens.filter(m => m.statut === 'Actif' || (m.statut === undefined && m.active !== false));
    mecasActifs.forEach(m => {
      const tasksMecaAujourdhui = tasks.filter(t => t.mecanicienId === m.id && t.datePlanifiee === todayStr);
      const faites = tasksMecaAujourdhui.filter(t => t.statut === 'FAIT' || t.statut === 'VALIDE').length;
      if (tasksMecaAujourdhui.length > 3 && faites === 0) {
        alertes.push({
          id: `MECA-INACTIF-${m.id}`,
          type: 'TERRAIN',
          message: `${m.nomComplet} (${m.siteId}) — 0 tâche réalisée aujourd'hui sur ${tasksMecaAujourdhui.length} planifiées.`,
          priorite: 'HAUTE',
          siteId: m.siteId
        });
      }
    });

    // Alert 4: Engine stuck "En maintenance" for over 72h
    engins.filter(e => {
      if (e.statut !== undefined) {
        return e.statut === 'maintenance';
      }
      return e.etat === 'En maintenance';
    }).forEach(e => {
      const lastPanne = pannes.find(p => p.enginId === e.id && p.statut !== 'CLOS');
      if (lastPanne) {
        const heuresArr = (now - new Date(lastPanne.dateDeclaration || now).getTime()) / (1000 * 60 * 60);
        if (heuresArr >= 72) {
          alertes.push({
            id: `ENGIN-IMMOBILISE-${e.id}`,
            type: 'IMMOBILISATION',
            message: `${e.id} (${e.siteId}) — Immobilisé en atelier depuis ${Math.floor(heuresArr)}h. Niveau d'immobilisation critique.`,
            priorite: 'CRITIQUE',
            siteId: e.siteId
          });
        }
      }
    });

    return alertes.sort((a, b) => {
      const order = { CRITIQUE: 0, HAUTE: 1, NORMALE: 2 };
      return order[a.priorite] - order[b.priorite];
    });
  }, [tasks, pannes, mecaniciens, engins]);

  // ----------------------------------------------------
  // PERFORMANCES DATA PROCESSING
  // ----------------------------------------------------

  // Leaderboard mechanics
  const leaderboardMecaniciens = useMemo(() => {
    const mois = new Date().toISOString().substring(0, 7);

    return mecaniciens
      .filter(m => m.statut === 'Actif' || (m.statut === undefined && m.active !== false))
      .map(m => {
        const tasksMeca = tasks.filter(t =>
          t.mecanicienId === m.id &&
          (t.datePlanifiee || '').startsWith(mois)
        );
        const faites = tasksMeca.filter(t => t.statut === 'FAIT' || t.statut === 'VALIDE').length;
        const total = tasksMeca.length;
        const retard = tasksMeca.filter(t =>
          t.statut === 'NON_FAIT' &&
          (t.datePlanifiee || '') < new Date().toISOString().split('T')[0]
        ).length;
        const correctifs = tasksMeca.filter(t => t.type === 'CORRECTIF' && (t.statut === 'FAIT' || t.statut === 'VALIDE')).length;
        const tauxRealisation = total > 0 ? Math.round((faites / total) * 100) : null;

        // Gamification Score formula
        const score = (faites * 10) + (correctifs * 20) - (retard * 15);

        // Badge determination
        let badge = '🔧 Technicien';
        let badgeColor = 'bg-slate-100 text-slate-700';
        if (score >= 200) { badge = '🏆 Maître Élite'; badgeColor = 'bg-amber-100 text-amber-800'; }
        else if (score >= 120) { badge = '⭐ Spécialiste'; badgeColor = 'bg-blue-100 text-blue-700'; }
        else if (score >= 60) { badge = '🛠️ Confirmé'; badgeColor = 'bg-emerald-100 text-emerald-700'; }
        if (retard === 0 && faites > 0) badge += ' 🔥';

        return {
          id: m.id,
          nomComplet: m.nomComplet,
          siteId: m.siteId,
          poste: m.poste || 'Chantier',
          specialite: m.specialite || 'Générale',
          faites,
          total,
          retard,
          correctifs,
          tauxRealisation,
          score: Math.max(0, score),
          badge,
          badgeColor
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [tasks, mecaniciens]);

  const topThreeMecaniciens = useMemo(() => leaderboardMecaniciens.slice(0, 3), [leaderboardMecaniciens]);
  const restMecaniciens = useMemo(() => leaderboardMecaniciens.slice(3), [leaderboardMecaniciens]);

  // 30 Days trend chart
  const tendance30Jours = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

      const tasksJour = tasks.filter(t => t.datePlanifiee === dayStr && t.type !== 'QUOTIDIEN');
      const faites = tasksJour.filter(t => t.statut === 'FAIT' || t.statut === 'VALIDE').length;
      const taux = tasksJour.length > 0 ? Math.round((faites / tasksJour.length) * 100) : null;

      days.push({ label, taux, total: tasksJour.length, date: dayStr });
    }
    return days;
  }, [tasks]);

  // ----------------------------------------------------
  // FIABILITÉ FLOTTE DATA PROCESSING
  // ----------------------------------------------------

  // MTBF and MTTR per machine
  const fiabiliteParEngin = useMemo(() => {
    return engins.map(engin => {
      const pannesEngin = pannes.filter(p =>
        p.enginId === engin.id &&
        p.statut === 'CLOS' &&
        typeof p.dureeImmobilisation === 'number'
      );

      const sampleSize = pannesEngin.length;

      // MTTR = average duration of downtime on resolved breakdowns
      const mttr = sampleSize > 0
        ? Math.round((pannesEngin.reduce((acc, p) => acc + (p.dureeImmobilisation || 0), 0) / sampleSize) * 10) / 10
        : null;

      // MTBF approximation on a 90 days window
      const pannes90j = pannesEngin.filter(p => {
        const date = new Date(p.dateDeclaration || 0);
        return (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24) <= 90;
      });
      const mtbf = pannes90j.length > 0
        ? Math.round((90 * 24) / pannes90j.length)
        : null;

      // Availability: 100% - (total downtime duration / (90d * 24h)) * 100
      const totalImmobilH = pannesEngin.reduce((acc, p) => acc + (p.dureeImmobilisation || 0), 0);
      const dispoPct = Math.max(0, Math.round((1 - totalImmobilH / (90 * 24)) * 100));

      return {
        enginId: engin.id,
        modele: engin.modele || 'Inconnu',
        siteId: engin.siteId || 'MI',
        heuresMarche: engin.heuresMarche || 0,
        sampleSize,
        mttr,
        mtbf,
        dispoPct,
        totalPannes: pannesEngin.length,
      };
    }).sort((a, b) => a.dispoPct - b.dispoPct); // Least available first
  }, [engins, pannes]);

  // Breakdowns count per category
  const pannesParCategorie = useMemo(() => {
    const categories: Record<string, number> = {};
    pannes.forEach(p => {
      const cat = p.categorie || 'Non spécifié';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    return Object.entries(categories)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [pannes]);

  // 10 most recent breakdowns timeline
  const dernieresPannes = useMemo(() => {
    return [...pannes]
      .sort((a, b) => new Date(b.dateDeclaration || 0).getTime() - new Date(a.dateDeclaration || 0).getTime())
      .slice(0, 10);
  }, [pannes]);

  // ----------------------------------------------------
  // EXPORT RAPPORTS ACTIONS
  // ----------------------------------------------------
  
  const generateMonthlyReport = () => {
    const mois = new Date().toISOString().substring(0, 7);
    const moisLabel = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    const pmMois = tasks.filter(t => t.type === 'PREVENTIF' && (t.datePlanifiee || '').startsWith(mois));
    const pmFaites = pmMois.filter(t => t.statut === 'FAIT' || t.statut === 'VALIDE').length;
    const compliance = pmMois.length > 0 ? Math.round((pmFaites / pmMois.length) * 100) : 0;

    const correctifsMois = tasks.filter(t => t.type === 'CORRECTIF' && (t.datePlanifiee || '').startsWith(mois));
    const correctifsFaits = correctifsMois.filter(t => t.statut === 'FAIT' || t.statut === 'VALIDE').length;

    const pannesMois = pannes.filter(p => (p.dateDeclaration || '').startsWith(mois));
    const pannesResolues = pannesMois.filter(p => p.statut === 'CLOS').length;

    const rapportData = {
      moisLabel,
      compliance,
      pmTotal: pmMois.length,
      pmFaites,
      correctifsTotal: correctifsMois.length,
      correctifsFaits,
      pannesTotal: pannesMois.length,
      pannesResolues,
      topMecanicien: leaderboardMecaniciens[0] || null,
      enginLePlusArr: fiabiliteParEngin[0] || null,
      alertesActives: alertesProactives.filter(a => a.priorite === 'CRITIQUE').length,
    };

    setRapportGenere(rapportData);
    setIsPrintModalOpen(true);
  };

  const handleExportCSV = (type: 'taches' | 'pannes') => {
    let rows: string[] = [];
    let filename = '';

    if (type === 'taches') {
      rows = [
        'ID;Type;Label;EnginID;Date;Statut;Priorite;Site',
        ...tasks.map(t =>
          `"${t.id}";"${t.type || 'N/A'}";"${(t.label || '').replace(/"/g, '""')}";"${t.enginId || 'N/A'}";"${t.datePlanifiee || 'N/A'}";"${t.statut || 'N/A'}";"${t.priorite || 'N/A'}";"${t.siteId || 'N/A'}"`
        )
      ];
      filename = `taches_gmao_${activeSite}_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      rows = [
        'ID;EnginID;Categorie;Gravite;Statut;DateDeclaration;DureeImmobilisation;Site',
        ...pannes.map(p =>
          `"${p.id}";"${p.enginId || 'N/A'}";"${p.categorie || 'N/A'}";"${p.gravite || 'N/A'}";"${p.statut || 'N/A'}";"${p.dateDeclaration || 'N/A'}";"${p.dureeImmobilisation ?? ''}";"${p.siteId || 'N/A'}"`
        )
      ];
      filename = `pannes_gmao_${activeSite}_${new Date().toISOString().split('T')[0]}.csv`;
    }

    const csvContent = '\uFEFF' + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Export ${type === 'taches' ? 'des tâches' : 'des pannes'} téléchargé avec succès.`);
  };

  // ----------------------------------------------------
  // PANNES ANALYSIS DATA PROCESSING (FUSIONNÉ : PANNES + INTERVENTIONS CORRECTIVES)
  // ----------------------------------------------------
  const evenementsMaintenance = useMemo(() => {
    // 1. Filtered and closed pannes
    const pannesEvents = pannes
      .filter(p => p.statut === "CLOS")
      .map(p => ({
        id: p.id,
        enginId: p.enginId,
        categorie: p.categorie || "Non catégorisé",
        siteId: p.siteId,
        date: p.dateDeclaration,
        statut: p.statut,
        source: "panne" as const,
        dureeHeures: p.dureePanneHeures || p.dureeInterventionHeures || 0
      }));

    // 2. Filtered correctif interventions
    const interventionsEvents = interventions
      .filter(i => i.typeIntervention === "CORRECTIF")
      .map(i => ({
        id: i.id,
        enginId: i.enginId,
        categorie: i.categorie || "Non catégorisé",
        siteId: i.siteId,
        date: i.date,
        statut: "CLOS", // they are already executed/closed interventions
        source: "intervention_importee" as const,
        dureeHeures: i.dureeHeures || 0
      }));

    return [...pannesEvents, ...interventionsEvents];
  }, [pannes, interventions]);

  const pannesByPeriodAndSite = useMemo(() => {
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - periodePannes);
    
    // Active events filtered by period
    const activeEventsFiltered = evenementsMaintenance.filter(e => e.date && new Date(e.date) >= limitDate);

    // Previous period events (for comparison)
    const prevLimitDate = new Date();
    prevLimitDate.setDate(prevLimitDate.getDate() - (periodePannes * 2));
    const prevEventsFiltered = evenementsMaintenance.filter(e => {
      if (!e.date) return false;
      const d = new Date(e.date);
      return d >= prevLimitDate && d < limitDate;
    });

    return { active: activeEventsFiltered, previous: prevEventsFiltered };
  }, [evenementsMaintenance, periodePannes]);

  const categoryStats = useMemo(() => {
    const activeList = pannesByPeriodAndSite.active;
    const prevList = pannesByPeriodAndSite.previous;

    const cats: ("Mécanique" | "Hydraulique" | "Électrique" | "Pneumatique" | "Transmission" | "Freinage" | "Autre" | "Non catégorisé")[] = [
      "Mécanique", "Hydraulique", "Électrique", "Pneumatique", "Transmission", "Freinage", "Autre", "Non catégorisé"
    ];

    const stats = cats.map(cat => {
      const activeCount = activeList.filter(p => p.categorie === cat).length;
      const prevCount = prevList.filter(p => p.categorie === cat).length;
      
      let variation = 0;
      if (prevCount > 0) {
        variation = Math.round(((activeCount - prevCount) / prevCount) * 100);
      } else if (activeCount > 0) {
        variation = 100;
      }

      return {
        name: cat,
        activeCount,
        prevCount,
        variation
      };
    });

    return stats.sort((a, b) => b.activeCount - a.activeCount);
  }, [pannesByPeriodAndSite]);

  const top3Tendances = useMemo(() => {
    return categoryStats.slice(0, 3).filter(s => s.activeCount > 0);
  }, [categoryStats]);

  const matrixData = useMemo(() => {
    const isAdminOrDirection = user?.role === 'ADMIN' || user?.role === 'DIRECTION';
    if (!isAdminOrDirection || activeSite !== 'TOUS') return null;

    const sites = ['SMI', 'OUMEJRANE', 'KOUDIA', 'OUANSIMI', 'BOU-AZZER'];
    const cats = ["Mécanique", "Hydraulique", "Électrique", "Pneumatique", "Transmission", "Freinage", "Autre", "Non catégorisé"];

    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - periodePannes);

    const activeEvents = evenementsMaintenance.filter(e => e.date && new Date(e.date) >= limitDate);

    const table = sites.map(site => {
      const row: Record<string, any> = { siteCode: site };
      cats.forEach(cat => {
        row[cat] = activeEvents.filter(e => e.siteId === site && e.categorie === cat).length;
      });
      return row;
    });

    const maxPerCategory: Record<string, number> = {};
    cats.forEach(cat => {
      const values = table.map(r => r[cat]);
      const maxVal = Math.max(...values);
      maxPerCategory[cat] = maxVal > 0 ? maxVal : -1;
    });

    return { table, maxPerCategory, categories: cats, sites };
  }, [evenementsMaintenance, activeSite, user, periodePannes]);

  // ----------------------------------------------------
  // TEMPORAL EVOLUTION & HISTORICAL TRENDS
  // ----------------------------------------------------
  const monthsList = useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = fenetreMois - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const label = d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      list.push({ key: `${year}-${month}`, label, date: d });
    }
    return list;
  }, [fenetreMois]);

  const earliestDate = useMemo(() => {
    let earliest = new Date();
    earliest.setFullYear(earliest.getFullYear() - 1);

    const checkAndSet = (dateStr: string) => {
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (!isNaN(d.getTime()) && d < earliest) {
        earliest = d;
      }
    };

    evenementsMaintenance.forEach(e => checkAndSet(e.date));
    (rawTasks || []).forEach(t => checkAndSet(t.datePlanifiee));
    return earliest;
  }, [evenementsMaintenance, rawTasks]);

  const getSiteMonthlyData = React.useCallback((siteId: string, monthKey: string, date: Date) => {
    const earliestMonth = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1);
    const currentMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    
    if (currentMonth < earliestMonth) {
      return { pannesCount: null, dispoRate: null, mtbf: null };
    }

    const siteEngins = (rawEngins || []).filter(e => !e.deleted && e.siteId === siteId);
    const siteEventsMonth = evenementsMaintenance.filter(e => 
      e.siteId === siteId && 
      e.date && 
      e.date.startsWith(monthKey)
    );

    const pannesCount = siteEventsMonth.length;
    let dispoRate: number | null = null;
    let mtbf: number | null = null;

    if (siteEngins.length > 0) {
      let totalDispo = 0;
      siteEngins.forEach(e => {
        const engineEventsInMonth = siteEventsMonth.filter(ev => ev.enginId === e.id);
        if (engineEventsInMonth.length === 0) {
          totalDispo += 100;
        } else {
          const hasOpen = engineEventsInMonth.some(ev => ev.statut !== 'CLOS');
          if (hasOpen) {
            totalDispo += 0;
          } else {
            totalDispo += 50;
          }
        }
      });
      dispoRate = parseFloat((totalDispo / siteEngins.length).toFixed(1));
      mtbf = pannesCount > 0 ? Math.round((siteEngins.length * 160) / pannesCount) : null;
    }

    return { pannesCount: pannesCount, dispoRate, mtbf };
  }, [rawEngins, evenementsMaintenance, earliestDate]);

  const temporalDataActiveSite = useMemo(() => {
    return monthsList.map(m => {
      const monthKey = m.key;
      const date = m.date;

      const earliestMonth = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1);
      const currentMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      
      if (currentMonth < earliestMonth) {
        return {
          month: m.label,
          pannesCount: null,
          dispoRate: null,
          mtbf: null,
        };
      }

      const eventsInMonth = evenementsMaintenance.filter(e => e.date && e.date.startsWith(monthKey));
      const pannesCount = eventsInMonth.length;

      let dispoValue: number | null = null;
      let mtbfValue: number | null = null;

      if (engins.length > 0) {
        let totalDispo = 0;
        engins.forEach(e => {
          const engineEventsInMonth = eventsInMonth.filter(ev => ev.enginId === e.id);
          if (engineEventsInMonth.length === 0) {
            totalDispo += 100;
          } else {
            const hasOpen = engineEventsInMonth.some(ev => ev.statut !== 'CLOS');
            if (hasOpen) {
              totalDispo += 0;
            } else {
              totalDispo += 50;
            }
          }
        });
        dispoValue = parseFloat((totalDispo / engins.length).toFixed(1));
        mtbfValue = pannesCount > 0 ? Math.round((engins.length * 160) / pannesCount) : null;
      }

      return {
        month: m.label,
        pannesCount: pannesCount,
        dispoRate: dispoValue,
        mtbf: mtbfValue
      };
    });
  }, [monthsList, evenementsMaintenance, engins, earliestDate]);

  const siteAData = useMemo(() => {
    return monthsList.map(m => {
      const res = getSiteMonthlyData(compareSiteA, m.key, m.date);
      return {
        month: m.label,
        value: compareMetric === "pannes" ? res.pannesCount : compareMetric === "dispo" ? res.dispoRate : res.mtbf
      };
    });
  }, [monthsList, compareSiteA, compareMetric, getSiteMonthlyData]);

  const siteBData = useMemo(() => {
    return monthsList.map(m => {
      const res = getSiteMonthlyData(compareSiteB, m.key, m.date);
      return {
        month: m.label,
        value: compareMetric === "pannes" ? res.pannesCount : compareMetric === "dispo" ? res.dispoRate : res.mtbf
      };
    });
  }, [monthsList, compareSiteB, compareMetric, getSiteMonthlyData]);

  const comparativeChartData = useMemo(() => {
    return monthsList.map((m, idx) => {
      return {
        month: m.label,
        siteA: siteAData[idx]?.value,
        siteB: siteBData[idx]?.value,
      };
    });
  }, [monthsList, siteAData, siteBData]);

  const parseToDate = (field: any): Date | null => {
    if (!field) return null;
    if (typeof field.toDate === 'function') {
      return field.toDate();
    }
    if (typeof field.toMillis === 'function') {
      return new Date(field.toMillis());
    }
    if (field.seconds) {
      return new Date(field.seconds * 1000);
    }
    const d = new Date(field);
    return isNaN(d.getTime()) ? null : d;
  };

  const mttrPannes = useMemo(() => {
    return pannes.filter(p => {
      if (p.deleted) return false;
      return p.datePriseEnCharge && p.dateResolution;
    });
  }, [pannes]);

  const mttrChartData = useMemo(() => {
    const siteGroups: Record<string, { totalWaitingMs: number, totalRepairMs: number, count: number }> = {};

    mttrPannes.forEach(p => {
      const site = p.siteId || 'Inconnu';
      const dateDecl = parseToDate(p.dateDeclaration);
      const datePrise = parseToDate(p.datePriseEnCharge);
      const dateRes = parseToDate(p.dateResolution);

      if (dateDecl && datePrise && dateRes) {
        const waitingMs = datePrise.getTime() - dateDecl.getTime();
        const repairMs = dateRes.getTime() - datePrise.getTime();

        const validWaitingMs = Math.max(0, waitingMs);
        const validRepairMs = Math.max(0, repairMs);

        if (!siteGroups[site]) {
          siteGroups[site] = { totalWaitingMs: 0, totalRepairMs: 0, count: 0 };
        }
        siteGroups[site].totalWaitingMs += validWaitingMs;
        siteGroups[site].totalRepairMs += validRepairMs;
        siteGroups[site].count += 1;
      }
    });

    return Object.entries(siteGroups).map(([site, data]) => {
      const avgWaitingHours = parseFloat((data.totalWaitingMs / (1000 * 60 * 60) / data.count).toFixed(1));
      const avgRepairHours = parseFloat((data.totalRepairMs / (1000 * 60 * 60) / data.count).toFixed(1));
      const totalMttrHours = parseFloat((avgWaitingHours + avgRepairHours).toFixed(1));

      return {
        site,
        'Temps d\'attente moyen': avgWaitingHours,
        'Temps de réparation moyen': avgRepairHours,
        'MTTR Total': totalMttrHours,
        count: data.count
      };
    });
  }, [mttrPannes]);

  const MttrTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const sampleCount = payload[0]?.payload?.count || 0;
      return (
        <div className="bg-slate-900 text-white border border-slate-800 p-3 rounded-xl shadow-lg font-mono text-xs space-y-1.5">
          <p className="font-extrabold text-slate-300 border-b border-slate-800 pb-1 mb-1">{label} ({sampleCount} panne{sampleCount > 1 ? 's' : ''})</p>
          {payload.map((p: any) => {
            if (p.value === null || p.value === undefined) return null;
            return (
              <p key={p.name} style={{ color: p.color }} className="font-bold flex justify-between gap-4">
                <span>{p.name} :</span>
                <span>{p.value} h</span>
              </p>
            );
          })}
          <p className="text-[10px] text-slate-400 border-t border-slate-800 pt-1 mt-1 flex justify-between font-black">
            <span>MTTR TOTAL :</span>
            <span>{payload[0]?.payload['MTTR Total']} h</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white border border-slate-800 p-3 rounded-xl shadow-lg font-mono text-xs space-y-1.5">
          <p className="font-extrabold text-slate-300 border-b border-slate-800 pb-1 mb-1">{label}</p>
          {payload.map((p: any) => {
            if (p.value === null || p.value === undefined) return null;
            let unit = "";
            if (p.name.includes("Disponibilité")) unit = "%";
            else if (p.name.includes("MTBF")) unit = " h";
            else unit = " pannes";
            return (
              <p key={p.name} style={{ color: p.color }} className="font-bold flex justify-between gap-4">
                <span>{p.name} :</span>
                <span>{p.value}{unit}</span>
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const ComparativeTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white border border-slate-800 p-3 rounded-xl shadow-lg font-mono text-xs space-y-1.5">
          <p className="font-extrabold text-slate-300 border-b border-slate-800 pb-1 mb-1">{label}</p>
          {payload.map((p: any) => {
            if (p.value === null || p.value === undefined) return null;
            let unit = "";
            if (compareMetric === "dispo") unit = "%";
            else if (compareMetric === "mtbf") unit = " h";
            else unit = " pannes";
            return (
              <p key={p.name} style={{ color: p.color }} className="font-bold flex justify-between gap-4">
                <span>{p.name} :</span>
                <span>{p.value}{unit}</span>
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const handlePrint = () => {
    window.print();
  };

  // ----------------------------------------------------
  // LOADING & EMPTY STATES
  // ----------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-medium text-sm">Chargement des analyses Firestore...</p>
        </div>
      </div>
    );
  }

  if (engins.length === 0 && tasks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white p-8 rounded-2xl border border-slate-200 min-h-[400px] text-center max-w-xl mx-auto my-12">
        <AlertCircle className="h-12 w-12 text-[#D4A017] mb-4 animate-pulse" />
        <h3 className="text-lg font-black text-slate-900 uppercase font-mono tracking-wider">Données insuffisantes</h3>
        <p className="text-slate-500 text-sm mt-2 max-w-md">
          Aucun engin ou aucune tâche de planification n'a été configuré dans Firestore pour le site {activeSite === 'TOUS' ? 'global' : activeSite}. Veuillez d'abord ajouter des données.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 bg-white min-h-screen ${isPrintModalOpen ? 'print:p-0' : 'p-4 md:p-6'} select-none`}>
      
      {/* 1. Page Header */}
      <div className="print:hidden">
        <PageBanner
          icon={BarChart3}
          badgeLabel="Ingénierie Analytique Hydromines"
          title="ANALYSES & COMPARAISONS AVANCÉES"
          subtitle="Suivez la compliance PM, mesurez la performance de vos équipes de fond et suivez la fiabilité de votre parc machine."
        >
          <div className="flex gap-2">
            <Button
              onClick={generateMonthlyReport}
              className="bg-[#D4A017] hover:bg-[#B8860B] text-white border-none font-bold uppercase tracking-wider text-xs h-9 shadow-sm"
            >
              <Printer className="h-4 w-4 mr-1.5" /> Rapport Mensuel
            </Button>
          </div>
        </PageBanner>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="print:hidden">
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
          <TabsList className="bg-slate-50 border border-slate-200/60 p-1 rounded-xl w-full max-w-3xl flex">
            <TabsTrigger value="directeur" className="flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500">
              <Shield className="h-3.5 w-3.5 mr-1.5" /> Vue Directeur
            </TabsTrigger>
            <TabsTrigger value="performances" className="flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500">
              <Trophy className="h-3.5 w-3.5 mr-1.5" /> Performances
            </TabsTrigger>
            <TabsTrigger value="fiabilite" className="flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500">
              <Activity className="h-3.5 w-3.5 mr-1.5" /> Fiabilité Flotte
            </TabsTrigger>
            <TabsTrigger value="pannes" className="flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500">
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5" /> Pannes
            </TabsTrigger>
            <TabsTrigger value="export" className="flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500">
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export Rapports
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: VUE DIRECTEUR */}
          <TabsContent value="directeur" className="mt-6 space-y-6">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              
              {/* Card 1: Compliance PM Globale */}
              <Card className="relative overflow-hidden bg-white dark:bg-slate-950 border border-[#D4AF37]/50 rounded-2xl p-5 shadow-sm flex flex-col justify-between text-slate-900 dark:text-white transition-all duration-300 hover:shadow-md">
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
                <div>
                  <span className="text-[10px] font-mono font-black uppercase text-slate-500 dark:text-slate-400 block mb-1">
                    🎯 COMPLIANCE PM GLOBALE CE MOIS
                  </span>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className={`text-3xl font-black font-mono ${
                      complianceGlobale === null ? 'text-slate-450' :
                      complianceGlobale >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                      complianceGlobale >= 60 ? 'text-amber-500 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                     }`}>
                      {complianceGlobale !== null ? `${complianceGlobale}%` : '—'}
                    </span>
                    <Badge className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-[9px] font-mono">Obj: 80%</Badge>
                  </div>
                  {complianceGlobale !== null && (
                    <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          complianceGlobale >= 80 ? 'bg-emerald-500 dark:bg-emerald-400' :
                          complianceGlobale >= 60 ? 'bg-amber-500 dark:bg-amber-400' : 'bg-red-500 dark:bg-red-400'
                        }`}
                        style={{ width: `${complianceGlobale}%` }}
                      />
                    </div>
                  )}
                </div>
                <p className="text-[9.5px] font-mono text-slate-500 dark:text-slate-400 mt-3 leading-tight">
                  {complianceGlobale !== null ? 'Prévu et réalisé conformément aux fréquences GMAO.' : 'Aucune tâche préventive planifiée ce mois.'}
                </p>
              </Card>

              {/* Card 2: Ratio Préventif / Correctif */}
              <Card className="relative overflow-hidden bg-white dark:bg-slate-950 border border-[#D4AF37]/50 rounded-2xl p-5 shadow-sm flex flex-col justify-between text-slate-900 dark:text-white transition-all duration-300 hover:shadow-md">
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
                <div>
                  <span className="text-[10px] font-mono font-black uppercase text-slate-500 dark:text-slate-400 block mb-1">
                    ⚙️ RATIO PREV / CORR
                  </span>
                  <div className="flex items-center gap-4 h-[60px]">
                    {ratioPreventifCorrectif.total > 0 ? (
                      <>
                        <div className="w-[50px] h-[50px] shrink-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={ratioData}
                                innerRadius={14}
                                outerRadius={22}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {ratioData.map((entry, idx) => (
                                  <Cell key={`cell-${idx}`} fill={entry.color} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="font-mono text-xs text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-[#D4A017]" />
                            <span>Prev: {ratioPreventifCorrectif.preventifPct}%</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-600" />
                            <span>Corr: {ratioPreventifCorrectif.correctifPct}%</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono italic">Aucune intervention ce mois.</span>
                    )}
                  </div>
                </div>
                <p className="text-[9.5px] font-mono text-slate-500 dark:text-slate-400 mt-2 leading-tight">
                  Total : {ratioPreventifCorrectif.total} intervention(s) clôturée(s).
                </p>
              </Card>

              {/* Card 3: Validation en Attente (+48h) */}
              <Card className="relative overflow-hidden bg-white dark:bg-slate-950 border border-[#D4AF37]/50 rounded-2xl p-5 shadow-sm flex flex-col justify-between text-slate-900 dark:text-white transition-all duration-300 hover:shadow-md">
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
                <div>
                  <span className="text-[10px] font-mono font-black uppercase text-slate-500 dark:text-slate-400 block mb-1">
                    📂 ATTENTE VALIDATION RESPONSABLE
                  </span>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-3xl font-black font-mono ${tachesEnAttenteValidation.length > 0 ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {tachesEnAttenteValidation.length}
                    </span>
                    {tachesEnAttenteValidation.length === 0 && (
                      <Badge className="bg-emerald-50 dark:bg-emerald-950/45 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 text-[8.5px] font-mono">
                        Responsable réactif ✓
                      </Badge>
                    )}
                  </div>
                  {tachesEnAttenteValidation.length > 0 && (
                    <div className="space-y-1 overflow-hidden">
                      {tachesEnAttenteValidation.slice(0, 2).map(t => (
                        <div key={t.id} className="text-[9px] font-mono text-slate-600 dark:text-slate-300 truncate border-l border-slate-300 dark:border-slate-700 pl-1.5">
                          <span className="font-bold text-[#D4AF37]">{t.enginId}</span> — {t.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[9.5px] font-mono text-slate-500 dark:text-slate-400 mt-2 leading-none">
                  Tâches closes par l'opérateur en attente de visa.
                </p>
              </Card>

              {/* Card 4: Signalements critiques ignorés */}
              <Card className="relative overflow-hidden bg-white dark:bg-slate-950 border border-[#D4AF37]/50 rounded-2xl p-5 shadow-sm flex flex-col justify-between text-slate-900 dark:text-white transition-all duration-300 hover:shadow-md">
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
                <div>
                  <span className="text-[10px] font-mono font-black uppercase text-slate-500 dark:text-slate-400 block mb-1">
                    ⚠️ ALERTES PANNES SANS ACTION
                  </span>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-3xl font-black font-mono ${pannesCritiquesNonTraitees.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {pannesCritiquesNonTraitees.length}
                    </span>
                    {pannesCritiquesNonTraitees.length === 0 && (
                      <Badge className="bg-emerald-50 dark:bg-emerald-950/45 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 text-[8.5px] font-mono">
                        Suivi impeccable ✓
                      </Badge>
                    )}
                  </div>
                  {pannesCritiquesNonTraitees.length > 0 && (
                    <div className="space-y-1 overflow-hidden">
                      {pannesCritiquesNonTraitees.slice(0, 2).map(p => (
                        <div key={p.id} className="text-[9px] font-mono text-slate-600 dark:text-slate-300 truncate border-l border-red-200 dark:border-red-900/40 pl-1.5">
                          <span className="font-bold text-red-600 dark:text-red-400">⚠️ {p.enginId}</span> — Cat: {p.categorie}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[9.5px] font-mono text-slate-500 dark:text-slate-400 mt-2 leading-none">
                  Déclarations terrain sans diagnostic depuis +24h.
                </p>
              </Card>

            </div>

            {/* Compliance by Chantier & Alerts Sections */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              
              {/* Compliance Par Chantier list */}
              <Card className="relative overflow-hidden bg-white border border-[#D4AF37]/50 rounded-2xl p-5 shadow-sm">
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
                <CardHeader className="p-0 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xs font-mono font-black uppercase text-slate-800 tracking-wide">
                      COMPLIANCE PM PAR CHANTIER
                    </CardTitle>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-none">
                      Calcul dynamique de la discipline de maintenance préventive
                    </p>
                  </div>
                  <Badge className="bg-slate-50 text-slate-600 border border-slate-200 text-[8.5px] font-mono">FIRESTORE</Badge>
                </CardHeader>
                <CardContent className="p-0 pt-4 space-y-4">
                  {complianceParSite.map(site => (
                    <div key={site.code} className="space-y-1.5">
                      <div className="flex justify-between items-center text-[11px] font-mono font-black">
                        <span className="text-slate-700">{site.code} ({site.fleetCount} engins)</span>
                        <span className={`${site.score === null ? 'text-slate-400' : site.risk === 'CRITIQUE' ? 'text-red-600' : site.risk === 'VIGILANCE' ? 'text-amber-500' : 'text-emerald-600'}`}>
                          {site.score !== null ? `${site.score}%` : 'PAS DE DONNÉES'}
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                        {site.score !== null ? (
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${site.score}%` }}
                            transition={{ duration: 0.6 }}
                            className={`h-full rounded-full ${
                              site.risk === 'CRITIQUE' ? 'bg-red-500' :
                              site.risk === 'VIGILANCE' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                          />
                        ) : (
                          <div className="h-full w-full bg-slate-200/50 border-dashed border-2 border-slate-300" />
                        )}
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-slate-400">
                        <span>PM Clôturés : <span className="font-bold text-slate-600">{site.faitesATemps}</span> / {site.totalPM}</span>
                        <span>Retards Critiques : <span className="font-bold text-slate-600">{site.enRetard}</span></span>
                        <span>Pannes Ouvertes : <span className={`font-bold ${site.pannesOuvertes > 0 ? 'text-amber-500' : 'text-slate-500'}`}>{site.pannesOuvertes}</span></span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Active Proactive Alerts List */}
              <Card className="relative overflow-hidden bg-white border border-[#D4AF37]/50 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
                <div>
                  <CardHeader className="p-0 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xs font-mono font-black uppercase text-slate-800 tracking-wide">
                        ALERTES PROACTIVES TERRAIN
                      </CardTitle>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-none">
                        Anomalies critiques extraites des données courantes
                      </p>
                    </div>
                    <Badge className="bg-rose-50 text-rose-700 border border-rose-100 text-[8.5px] font-mono">TEMPS RÉEL</Badge>
                  </CardHeader>
                  
                  <div className="pt-4 space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {alertesProactives.length === 0 ? (
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 text-center">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2 animate-bounce" />
                        <p className="text-xs font-bold text-emerald-700 uppercase font-mono">Aucune alerte active</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-1">La flotte est saine et bien planifiée.</p>
                      </div>
                    ) : (
                      alertesProactives.map(alerte => (
                        <div 
                          key={alerte.id} 
                          className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs font-mono transition-all ${
                            alerte.priorite === 'CRITIQUE' ? 'bg-red-50/40 border-red-100 text-red-950 border-l-4 border-l-red-500' : 'bg-amber-50/40 border-amber-100 text-amber-950 border-l-4 border-l-amber-500'
                          }`}
                        >
                          <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${alerte.priorite === 'CRITIQUE' ? 'text-red-600' : 'text-amber-500'}`} />
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge className={`text-[8px] px-1 py-0 font-extrabold uppercase border ${
                                alerte.priorite === 'CRITIQUE' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                              }`}>
                                {alerte.priorite}
                              </Badge>
                              <span className="text-[9.5px] font-black text-slate-400">{alerte.siteId}</span>
                            </div>
                            <p className="text-[11px] leading-tight text-slate-700 font-medium mt-1">{alerte.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                <p className="text-[9.5px] italic text-slate-400 font-mono text-center mt-4">
                  *Les alertes proactives sont recalculées automatiquement lors de chaque synchronisation d'écriture.
                </p>
              </Card>

            </div>

          </TabsContent>

          {/* TAB 2: PERFORMANCES */}
          <TabsContent value="performances" className="mt-6 space-y-6">
            
            {/* Podium Top 3 */}
            {leaderboardMecaniciens.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-4">
                
                {/* 2nd Place */}
                {topThreeMecaniciens[1] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between text-center relative order-2 md:order-1 mt-6 md:mt-8"
                  >
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">🥈</span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-mono font-black text-slate-400 uppercase">2ÈME PLACE</h4>
                      <h3 className="text-sm font-black text-slate-800">{topThreeMecaniciens[1].nomComplet}</h3>
                      <Badge className="bg-slate-50 text-slate-600 border border-slate-200 text-[8px] font-mono mt-1">
                        {topThreeMecaniciens[1].siteId}
                      </Badge>
                    </div>
                    <div className="my-3 py-2 bg-slate-50 rounded-xl">
                      <span className="text-xl font-black font-mono text-[#D4A017]">{topThreeMecaniciens[1].score} pts</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 space-y-0.5">
                      <p>Réalisations : {topThreeMecaniciens[1].faites} / {topThreeMecaniciens[1].total}</p>
                      <p>Taux de clôture : {topThreeMecaniciens[1].tauxRealisation !== null ? `${topThreeMecaniciens[1].tauxRealisation}%` : '—'}</p>
                    </div>
                  </motion.div>
                )}

                {/* 1st Place */}
                {topThreeMecaniciens[0] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border-2 border-[#D4A017] rounded-2xl p-6 shadow-md flex flex-col justify-between text-center relative order-1 md:order-2"
                  >
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-3xl">🥇</span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-mono font-black text-[#D4A017] uppercase tracking-wider">MAJOR DU PARC</h4>
                      <h3 className="text-base font-black text-slate-900">{topThreeMecaniciens[0].nomComplet}</h3>
                      <Badge className="bg-amber-50 text-[#D4A017] border border-[#D4A017]/30 text-[8px] font-mono mt-1">
                        {topThreeMecaniciens[0].siteId}
                      </Badge>
                    </div>
                    <div className="my-3.5 py-2.5 bg-amber-50/40 rounded-xl border border-amber-100">
                      <span className="text-2xl font-black font-mono text-[#D4A017]">{topThreeMecaniciens[0].score} pts</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 space-y-0.5">
                      <p>Réalisations : {topThreeMecaniciens[0].faites} / {topThreeMecaniciens[0].total}</p>
                      <p>Taux de clôture : {topThreeMecaniciens[0].tauxRealisation !== null ? `${topThreeMecaniciens[0].tauxRealisation}%` : '—'}</p>
                    </div>
                  </motion.div>
                )}

                {/* 3rd Place */}
                {topThreeMecaniciens[2] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between text-center relative order-3 mt-6 md:mt-12"
                  >
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">🥉</span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-mono font-black text-slate-400 uppercase">3ÈME PLACE</h4>
                      <h3 className="text-sm font-black text-slate-800">{topThreeMecaniciens[2].nomComplet}</h3>
                      <Badge className="bg-slate-50 text-slate-600 border border-slate-200 text-[8px] font-mono mt-1">
                        {topThreeMecaniciens[2].siteId}
                      </Badge>
                    </div>
                    <div className="my-3 py-2 bg-slate-50 rounded-xl">
                      <span className="text-xl font-black font-mono text-[#D4A017]">{topThreeMecaniciens[2].score} pts</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 space-y-0.5">
                      <p>Réalisations : {topThreeMecaniciens[2].faites} / {topThreeMecaniciens[2].total}</p>
                      <p>Taux de clôture : {topThreeMecaniciens[2].tauxRealisation !== null ? `${topThreeMecaniciens[2].tauxRealisation}%` : '—'}</p>
                    </div>
                  </motion.div>
                )}

              </div>
            ) : (
              <div className="text-center text-slate-400 font-mono py-8 text-xs italic">Aucun mécanicien actif ce mois.</div>
            )}

            {/* Mechanics List & 30 Days Trend */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              
              {/* Other Mechanics list */}
              <Card className="relative overflow-hidden bg-white border border-[#D4AF37]/50 rounded-2xl p-5 shadow-sm">
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
                <CardHeader className="p-0 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xs font-mono font-black uppercase text-slate-800 tracking-wide">
                      CLASSEMENT GÉNÉRAL DES TECHNICIENS
                    </CardTitle>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-none">
                      Basé sur la réactivité, le traitement curatif et la fidélité préventive
                    </p>
                  </div>
                  <Badge className="bg-slate-50 text-slate-600 border border-slate-200 text-[8.5px] font-mono">GAMIFICATION</Badge>
                </CardHeader>
                <CardContent className="p-0 pt-4 space-y-3 max-h-[350px] overflow-y-auto">
                  {restMecaniciens.length === 0 && topThreeMecaniciens.length === 0 ? (
                    <div className="text-center text-slate-400 text-xs py-8 italic font-mono">Aucun classement à afficher.</div>
                  ) : restMecaniciens.length === 0 ? (
                    <div className="text-center text-slate-400 text-xs py-8 italic font-mono">Tous les mécaniciens sont sur le podium.</div>
                  ) : (
                    restMecaniciens.map((meca, idx) => (
                      <div key={meca.id} className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center justify-between gap-4 font-mono text-xs">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 font-bold text-sm w-4 text-center">{idx + 4}</span>
                          <div>
                            <h4 className="font-bold text-slate-800 leading-tight">{meca.nomComplet}</h4>
                            <p className="text-[9px] text-slate-500">{meca.poste} • {meca.specialite}</p>
                          </div>
                        </div>
                        <div className="text-right space-y-1 shrink-0">
                          <Badge className={`${meca.badgeColor} text-[8px] font-mono uppercase px-1 py-0`}>
                            {meca.badge}
                          </Badge>
                          <p className="text-[11px] font-black text-slate-800">{meca.score} pts</p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* 30 Days Trend Graph */}
              <Card className="relative overflow-hidden bg-white border border-[#D4AF37]/50 rounded-2xl p-5 shadow-sm">
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
                <CardHeader className="p-0 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xs font-mono font-black uppercase text-slate-800 tracking-wide">
                      TENDANCE 30 JOURS - CLÔTURE PM
                    </CardTitle>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-none">
                      Taux quotidien réel d'exécution de la maintenance planifiée
                    </p>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[8.5px] font-mono">PM LINE</Badge>
                </CardHeader>
                <CardContent className="p-0 pt-6">
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={tendance30Jours}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
                        <XAxis dataKey="label" fontSize={10} stroke="#64748b" tickLine={false} axisLine={false} />
                        <YAxis domain={[0, 100]} fontSize={10} stroke="#64748b" tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} labelStyle={{ color: '#fff' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                        <Line
                          type="monotone"
                          dataKey="taux"
                          stroke="#D4A017"
                          strokeWidth={2.5}
                          name="Compliance %"
                          connectNulls={false}
                          dot={{ r: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

            </div>

          </TabsContent>

          {/* TAB 3: FIABILITÉ FLOTTE */}
          <TabsContent value="fiabilite" className="mt-6 space-y-6">
            
            {/* Reliability Grid per Machine */}
            <Card className="relative overflow-hidden bg-white border border-[#D4AF37]/50 rounded-2xl p-5 shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
              <CardHeader className="p-0 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xs font-mono font-black uppercase text-slate-800 tracking-wide">
                    COMPORTEMENT ET FIABILITÉ DU PARC ENGINS
                  </CardTitle>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-none">
                    MTBF (Intervalle Moyen Entre Défaillances) et MTTR (Temps Moyen de Réparation)
                  </p>
                </div>
                <Badge className="bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/30 text-[8.5px] font-mono">TACTIQUE</Badge>
              </CardHeader>
              <CardContent className="p-0 pt-4 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-black">
                      <th className="py-2.5">ENGIN CODE</th>
                      <th className="py-2.5">MODÈLE</th>
                      <th className="py-2.5">SITE</th>
                      <th className="py-2.5">PANNES</th>
                      <th className="py-2.5 text-center">MTBF EST.</th>
                      <th className="py-2.5 text-center">MTTR CLÔT.</th>
                      <th className="py-2.5 text-right">DISPONIBILITÉ 90J</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fiabiliteParEngin.map(item => (
                      <tr key={item.enginId} className="border-b border-slate-50 hover:bg-slate-50/45">
                        <td className="py-3 font-extrabold text-slate-800">{item.enginId}</td>
                        <td className="py-3 text-slate-600">{item.modele}</td>
                        <td className="py-3 text-slate-500">{item.siteId}</td>
                        <td className="py-3 text-slate-600">{item.totalPannes} panne(s)</td>
                        <td className="py-3 text-center">
                          {item.sampleSize >= 2 ? (
                            <span className="font-bold text-slate-700">{item.mtbf} h</span>
                          ) : (
                            <span className="text-[9.5px] text-slate-400 italic">Données insuff. ({item.sampleSize})</span>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          {item.sampleSize >= 1 ? (
                            <span className="font-bold text-amber-600">{item.mttr} h</span>
                          ) : (
                            <span className="text-[9.5px] text-slate-400 italic">—</span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <span className={`font-black font-mono text-sm ${
                            item.dispoPct >= 85 ? 'text-emerald-600' :
                            item.dispoPct >= 65 ? 'text-amber-500' : 'text-red-500'
                          }`}>
                            {item.dispoPct}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Breakdowns by category & Recent Breakdowns */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              
              {/* Category distribution */}
              <Card className="relative overflow-hidden bg-white border border-[#D4AF37]/50 rounded-2xl p-5 shadow-sm">
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
                <CardHeader className="p-0 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xs font-mono font-black uppercase text-slate-800 tracking-wide">
                      AFFECTATION ET CAUSES DE DÉFAILLANCE
                    </CardTitle>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-none">
                      Répartition catégorielle absolue des pannes déclarées
                    </p>
                  </div>
                  <Badge className="bg-slate-50 text-slate-600 border border-slate-200 text-[8.5px] font-mono">PAR SYSTÈME</Badge>
                </CardHeader>
                <CardContent className="p-0 pt-6">
                  {pannesParCategorie.length === 0 ? (
                    <div className="text-center text-slate-400 text-xs py-12 italic font-mono">Aucun incidentologique enregistré.</div>
                  ) : (
                    <div className="h-[240px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={pannesParCategorie}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
                          <XAxis dataKey="name" fontSize={10} stroke="#64748b" tickLine={false} axisLine={false} />
                          <YAxis fontSize={10} stroke="#64748b" tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} labelStyle={{ color: '#fff' }} />
                          <Bar dataKey="count" fill="#D4A017" radius={[4, 4, 0, 0]} maxBarSize={35} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Breakdowns Timeline */}
              <Card className="relative overflow-hidden bg-white border border-[#D4AF37]/50 rounded-2xl p-5 shadow-sm">
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
                <CardHeader className="p-0 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xs font-mono font-black uppercase text-slate-800 tracking-wide">
                      DERNIÈRES DÉCLARATIONS DE PANNES
                    </CardTitle>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-none">
                      Journal chronologique des 10 derniers événements
                    </p>
                  </div>
                  <Badge className="bg-rose-50 text-rose-700 border border-rose-100 text-[8.5px] font-mono">TIMELINE</Badge>
                </CardHeader>
                <CardContent className="p-0 pt-4 space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
                  {dernieresPannes.length === 0 ? (
                    <div className="text-center text-slate-400 text-xs py-12 italic font-mono">Aucune panne en cours d'enregistrement.</div>
                  ) : (
                    dernieresPannes.map(p => (
                      <div key={p.id} className="text-xs font-mono flex items-start gap-2 border-b border-slate-50 pb-2">
                        <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                          p.gravite === 'CRITIQUE' ? 'bg-red-500 animate-pulse' :
                          p.gravite === 'HAUTE' ? 'bg-amber-500' : 'bg-blue-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 truncate">
                            {p.enginId} — Catégorie : {p.categorie || 'Générale'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[9.5px] text-slate-400">
                            <span>Diagnostic : <span className="font-bold text-slate-600">{p.statut}</span></span>
                            <span>•</span>
                            <span>{getRelativeTime(p.dateDeclaration)}</span>
                          </div>
                        </div>
                        <Badge className="bg-slate-50 border border-slate-200 text-slate-500 text-[8.5px] font-mono shrink-0">
                          {p.siteId}
                        </Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

            </div>

          </TabsContent>

          {/* TAB: PANNES ANALYSIS */}
          <TabsContent value="pannes" className="mt-6 space-y-6">
            <Card className="bg-white border border-[#D4AF37]/50 rounded-2xl shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" /> Analyse des Pannes et Défaillances Organes
                  </CardTitle>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Répartition des pannes par catégorie technique et analyse comparative sur la période choisie.
                  </p>
                </div>
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 self-start">
                  {([30, 90, 180] as const).map((days) => (
                    <button
                      key={days}
                      onClick={() => setPeriodePannes(days)}
                      className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-md transition-all ${
                        periodePannes === days
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-850'
                      }`}
                    >
                      {days} Jours
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {pannesByPeriodAndSite.active.length === 0 ? (
                  <div className="py-16 text-center space-y-2">
                    <AlertCircle className="h-10 w-10 text-slate-350 mx-auto animate-pulse" />
                    <p className="text-sm font-black uppercase text-slate-600">Données insuffisantes sur cette période</p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Aucun signalement de panne n'a été enregistré au cours des {periodePannes} derniers jours sur le périmètre actif.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Horizontal Bar Chart */}
                    <div className="lg:col-span-7 space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 font-mono">
                        Répartition des signalements par catégorie technique ({pannesByPeriodAndSite.active.length} pannes)
                      </h4>
                      <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={categoryStats}
                            layout="vertical"
                            margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                            <XAxis type="number" stroke="#94a3b8" fontSize={11} fontWeight="bold" />
                            <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} fontWeight="bold" />
                            <Tooltip
                              cursor={{ fill: '#f8fafc' }}
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-white border border-slate-200 p-2.5 rounded-lg shadow-sm font-mono text-xs">
                                      <p className="font-bold text-slate-800">{data.name}</p>
                                      <p className="text-slate-600 mt-1">Actif: <span className="font-bold text-slate-900">{data.activeCount}</span></p>
                                      <p className="text-slate-500">Précédent: <span className="font-bold">{data.prevCount}</span></p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar dataKey="activeCount" radius={[0, 4, 4, 0]}>
                              {categoryStats.map((entry, idx) => {
                                const colors: Record<string, string> = {
                                  "Mécanique": "#3b82f6",
                                  "Hydraulique": "#6366f1",
                                  "Électrique": "#eab308",
                                  "Pneumatique": "#10b981",
                                  "Transmission": "#a855f7",
                                  "Freinage": "#ef4444",
                                  "Autre": "#64748b",
                                  "Non catégorisé": "#94a3b8"
                                };
                                const fill = colors[entry.name] || "#3b82f6";
                                return <Cell key={`cell-${idx}`} fill={fill} />;
                              })}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono italic text-center mt-2 bg-slate-50 py-1 rounded-md border border-slate-100">
                        * Inclut les pannes déclarées et les interventions correctives importées
                      </p>
                    </div>

                    {/* Right: Top 3 trends */}
                    <div className="lg:col-span-5 space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 font-mono">
                        Top 3 tendances de défaillance
                      </h4>
                      <div className="space-y-3.5">
                        {top3Tendances.map((item, index) => {
                          return (
                            <div key={item.name} className="p-4 bg-slate-50/50 rounded-xl border border-slate-150 flex items-start gap-4">
                              <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-white border border-slate-200 font-mono text-xs font-black text-slate-500">
                                #{index + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-black uppercase tracking-wide text-slate-800">{item.name}</span>
                                  <Badge className={`${
                                    item.variation > 0 
                                      ? 'bg-rose-50 text-rose-700 border-rose-150' 
                                      : item.variation < 0 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-150' 
                                        : 'bg-slate-50 text-slate-600 border-slate-150'
                                  } text-[9px] font-mono font-bold border`}>
                                    {item.variation > 0 ? (
                                      <span className="flex items-center gap-0.5">
                                        <TrendingUp className="h-2.5 w-2.5" /> +{item.variation}%
                                      </span>
                                    ) : item.variation < 0 ? (
                                      <span className="flex items-center gap-0.5">
                                        <TrendingDown className="h-2.5 w-2.5" /> {item.variation}%
                                      </span>
                                    ) : (
                                      <span>stable</span>
                                    )}
                                  </Badge>
                                </div>
                                <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                                  <span className="font-extrabold text-slate-700">{item.activeCount}</span> {item.activeCount > 1 ? 'incidents enregistrés' : 'incident enregistré'} sur les {periodePannes} derniers jours (contre <span className="font-semibold">{item.prevCount}</span> lors de la période précédente).
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Matrix comparative table */}
            {matrixData && pannesByPeriodAndSite.active.length > 0 && (
              <Card className="bg-white border border-[#D4AF37]/50 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-150">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
                  <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[#D4A017]" /> Répartition comparative Inter-Sites ({periodePannes} Jours)
                  </CardTitle>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Comparatif direct du volume d'incidents par type d'organe sur l'ensemble de vos chantiers d'exploitation.
                  </p>
                </CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-black uppercase text-[10px] tracking-wider">
                        <th className="p-4 border-r border-slate-200">Chantier d'exploitation</th>
                        {matrixData.categories.map((cat) => (
                          <th key={cat} className="p-4 border-r border-slate-200 text-center">{cat}</th>
                        ))}
                        <th className="p-4 text-center font-extrabold text-slate-800">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matrixData.table.map((row) => {
                        const rowTotal = matrixData.categories.reduce((acc, cat) => acc + (row[cat] || 0), 0);
                        return (
                          <tr key={row.siteCode} className="border-b border-slate-150 hover:bg-slate-50/50">
                            <td className="p-4 border-r border-slate-200 font-black text-slate-800 text-xs">
                              {row.siteCode}
                            </td>
                            {matrixData.categories.map((cat) => {
                              const value = row[cat] || 0;
                              const isMax = value > 0 && value === matrixData.maxPerCategory[cat];
                              return (
                                <td 
                                  key={cat} 
                                  className={`p-4 border-r border-slate-200 text-center font-mono text-xs font-bold ${
                                    isMax 
                                      ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 font-black' 
                                      : 'text-slate-700'
                                  }`}
                                >
                                  {value > 0 ? value : <span className="text-slate-300 font-normal">-</span>}
                                </td>
                              );
                            })}
                            <td className="p-4 text-center font-mono text-xs font-black text-slate-900 bg-slate-50/50">
                              {rowTotal}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="p-3 bg-slate-50/50 border-t border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 font-mono italic">
                    * Inclut les pannes déclarées et les interventions correctives importées
                  </p>
                </div>
              </Card>
            )}

            {/* Card: Evolution Temporelle */}
            <Card className="bg-white border border-[#D4AF37]/50 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-150">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xs font-mono font-black uppercase text-slate-800 tracking-wide flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[#D4A017]" /> Évolution Temporelle des Indicateurs Pannes
                  </CardTitle>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Analyse des tendances historiques pour le site : <span className="font-extrabold text-[#D4A017]">{activeSite === 'TOUS' ? 'TOUS LES SITES' : activeSite}</span>.
                  </p>
                </div>
                
                {/* Control window selector */}
                <div className="flex items-center gap-3 self-start">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Fenêtre :</span>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    {([6, 12] as const).map((months) => (
                      <button
                        key={months}
                        onClick={() => setFenetreMois(months)}
                        className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-md transition-all ${
                          fenetreMois === months
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {months} Mois
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={temporalDataActiveSite}
                      margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} fontWeight="bold" />
                      
                      {/* Left axis for Availability (%) */}
                      <YAxis 
                        yAxisId="left" 
                        orientation="left" 
                        stroke="#10b981" 
                        fontSize={11} 
                        fontWeight="bold" 
                        domain={[0, 100]} 
                        label={{ value: 'Disponibilité (%)', angle: -90, position: 'insideLeft', offset: 10, style: { textAnchor: 'middle', fontSize: '10px', fill: '#10b981', fontWeight: 'bold' } }}
                      />
                      
                      {/* Right axis for failure count and MTBF */}
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        stroke="#64748b" 
                        fontSize={11} 
                        fontWeight="bold"
                        label={{ value: 'Pannes (u) / MTBF (h)', angle: 90, position: 'insideRight', offset: 10, style: { textAnchor: 'middle', fontSize: '10px', fill: '#64748b', fontWeight: 'bold' } }}
                      />
                      
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold' }} />
                      
                      {/* Taux de disponibilité (%) */}
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="dispoRate" 
                        name="Taux Disponibilité (%)" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        activeDot={{ r: 6 }}
                        connectNulls={false}
                      />
                      
                      {/* Nombre de pannes */}
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="pannesCount" 
                        name="Nombre de Pannes" 
                        stroke="#ef4444" 
                        strokeWidth={3}
                        activeDot={{ r: 6 }}
                        connectNulls={false}
                      />
                      
                      {/* MTBF Moyen (h) */}
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="mtbf" 
                        name="MTBF Moyen (h)" 
                        stroke="#f59e0b" 
                        strokeWidth={3}
                        activeDot={{ r: 6 }}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-slate-400 font-mono italic text-center mt-2 bg-slate-50 py-1 rounded-md border border-slate-100">
                  * Inclut les pannes déclarées et les interventions correctives importées
                </p>
              </CardContent>
            </Card>

            {/* Card: Comparative view for Admin/Direction when activeSite === "TOUS" */}
            {activeSite === "TOUS" && (user?.role === "ADMIN" || user?.role === "DIRECTION") && (
              <Card className="bg-white border border-[#D4AF37]/50 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-150">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xs font-mono font-black uppercase text-slate-800 tracking-wide flex items-center gap-2">
                      <Activity className="h-4 w-4 text-[#D4A017]" /> Comparateur Historique Inter-Sites
                    </CardTitle>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Superposition et comparaison visuelle des performances de deux sites miniers d'exploitation.
                    </p>
                  </div>

                  {/* Comparer Site A et Site B controls */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 pl-1">Site A :</span>
                      <select 
                        value={compareSiteA} 
                        onChange={(e) => setCompareSiteA(e.target.value)}
                        className="bg-white border border-slate-200 text-slate-850 text-[11px] font-mono font-bold rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#D4A017]"
                      >
                        {['SMI', 'OUMEJRANE', 'KOUDIA', 'OUANSIMI', 'BOU-AZZER'].map(site => (
                          <option key={site} value={site}>{site}</option>
                        ))}
                      </select>

                      <span className="text-[10px] font-mono font-bold text-slate-400 pl-2">Site B :</span>
                      <select 
                        value={compareSiteB} 
                        onChange={(e) => setCompareSiteB(e.target.value)}
                        className="bg-white border border-slate-200 text-slate-850 text-[11px] font-mono font-bold rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#D4A017]"
                      >
                        {['SMI', 'OUMEJRANE', 'KOUDIA', 'OUANSIMI', 'BOU-AZZER'].map(site => (
                          <option key={site} value={site}>{site}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 pl-1">Métrique :</span>
                      <select 
                        value={compareMetric} 
                        onChange={(e) => setCompareMetric(e.target.value as any)}
                        className="bg-white border border-slate-200 text-slate-855 text-[11px] font-mono font-bold rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#D4A017]"
                      >
                        <option value="pannes">Nombre de Pannes</option>
                        <option value="dispo">Taux de Disponibilité (%)</option>
                        <option value="mtbf">MTBF Moyen (h)</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={comparativeChartData}
                        margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} fontWeight="bold" />
                        <YAxis 
                          stroke="#64748b" 
                          fontSize={11} 
                          fontWeight="bold"
                          label={{ 
                            value: compareMetric === "pannes" ? "Nombre de Pannes" : compareMetric === "dispo" ? "Disponibilité (%)" : "MTBF Moyen (h)", 
                            angle: -90, 
                            position: 'insideLeft', 
                            offset: 10,
                            style: { textAnchor: 'middle', fontSize: '10px', fill: '#64748b', fontWeight: 'bold' } 
                          }}
                        />
                        <Tooltip content={<ComparativeTooltip />} />
                        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold' }} />
                        
                        {/* Curve for Site A */}
                        <Line 
                          type="monotone" 
                          dataKey="siteA" 
                          name={`Chantier ${compareSiteA}`} 
                          stroke="#10b981" 
                          strokeWidth={3}
                          activeDot={{ r: 6 }}
                          connectNulls={false}
                        />

                        {/* Curve for Site B */}
                        <Line 
                          type="monotone" 
                          dataKey="siteB" 
                          name={`Chantier ${compareSiteB}`} 
                          stroke="#ef4444" 
                          strokeWidth={3}
                          activeDot={{ r: 6 }}
                          connectNulls={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Card: Répartition MTTR (Breakdown of Mean Time To Repair) */}
            <Card className="bg-white border border-[#D4AF37]/50 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-150">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xs font-mono font-black uppercase text-slate-800 tracking-wide flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#D4A017]" /> Répartition MTTR par Site (Temps d'attente vs Réparation)
                  </CardTitle>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Analyse détaillée du temps moyen de résolution (MTTR) : distinction entre l'attente logistique et le dépannage technique réel.
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {mttrPannes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Clock className="h-10 w-10 text-slate-300 animate-pulse" />
                    <p className="text-xs font-mono font-black uppercase text-slate-700 mt-4">Aucune donnée MTTR disponible</p>
                    <p className="text-[11px] text-slate-500 max-w-md mt-2 leading-relaxed">
                      Les pannes doivent passer par le statut <span className="font-bold text-[#D4A017]">EN COURS</span> (capture du temps d'attente) puis être résolues par une tâche <span className="font-bold text-emerald-600">FAIT</span> ou <span className="font-bold text-emerald-600">VALIDE</span> (capture de la résolution) pour alimenter cet indicateur.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Small sample warning */}
                    {mttrPannes.length < 5 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-amber-850">
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-xs space-y-1">
                          <p className="font-black font-mono uppercase tracking-wide text-amber-800">Échantillon restreint</p>
                          <p className="font-medium leading-relaxed text-[11px] text-amber-700">
                            Uniquement {mttrPannes.length} panne{mttrPannes.length > 1 ? 's ont' : ' a'} été traitée{mttrPannes.length > 1 ? 's' : ''} avec un suivi d'horodatage complet (prise en charge + résolution) depuis l'activation de la mesure.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={mttrChartData}
                          margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="site" stroke="#94a3b8" fontSize={11} fontWeight="bold" />
                          <YAxis 
                            stroke="#64748b" 
                            fontSize={11} 
                            fontWeight="bold"
                            label={{ 
                              value: 'Durée moyenne (heures)', 
                              angle: -90, 
                              position: 'insideLeft', 
                              offset: 10,
                              style: { textAnchor: 'middle', fontSize: '10px', fill: '#64748b', fontWeight: 'bold' } 
                            }}
                          />
                          <Tooltip content={<MttrTooltip />} />
                          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold' }} />
                          
                          {/* Stacked bar for Waiting Time (Amber) */}
                          <Bar 
                            dataKey="Temps d'attente moyen" 
                            stackId="a" 
                            fill="#f59e0b" 
                            radius={[0, 0, 0, 0]} 
                          />
                          
                          {/* Stacked bar for Repair Time (Emerald) */}
                          <Bar 
                            dataKey="Temps de réparation moyen" 
                            stackId="a" 
                            fill="#10b981" 
                            radius={[6, 6, 0, 0]} 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 font-mono text-[10px] text-slate-400">
                      <p className="font-bold flex items-center gap-1">
                        <span>●</span> Cet indicateur est basé sur les pannes résolues après le déploiement du 7 juillet 2026.
                      </p>
                      <p className="font-extrabold text-slate-500">
                        Total pannes qualifiées : {mttrPannes.length}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: EXPORT RAPPORTS */}
          <TabsContent value="export" className="mt-6 space-y-6">
            
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              
              {/* Rapport Mensuel Generation */}
              <Card className="relative overflow-hidden bg-white border border-[#D4AF37]/50 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
                <div>
                  <CardHeader className="p-0 pb-4 border-b border-slate-100">
                    <CardTitle className="text-xs font-mono font-black uppercase text-slate-800 tracking-wide flex items-center gap-1.5">
                      <Printer className="h-4 w-4 text-[#D4A017]" /> SYNTHÈSE MENSUELLE PRINT-READY
                    </CardTitle>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-none">
                      Impression propre et formalisée pour transmission d'exploitation
                    </p>
                  </CardHeader>
                  <div className="pt-4 space-y-3 font-mono text-xs text-slate-600">
                    <p className="leading-relaxed">
                      Le bouton ci-dessous compile les indicateurs de compliance préventive, les statistiques d'immobilisation de la flotte, ainsi que les performances d'équipe du mois courant dans un document prêt à être imprimé ou enregistré en PDF.
                    </p>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] leading-tight space-y-1">
                      <p className="font-bold text-slate-800">Sections incluses :</p>
                      <p>• Indicateurs clés de performance d'exploitation</p>
                      <p>• Tâches d'inspections conformes vs en retard</p>
                      <p>• Répartition des causes majeures de dysfonctionnement</p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={generateMonthlyReport}
                  className="w-full bg-[#D4A017] hover:bg-[#B8860B] text-white border-none font-bold uppercase tracking-wider text-xs h-9 shadow-sm mt-6"
                >
                  <Printer className="h-4 w-4 mr-1.5" /> Générer le Rapport
                </Button>
              </Card>

              {/* CSV exports */}
              <Card className="relative overflow-hidden bg-white border border-[#D4AF37]/50 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
                <div>
                  <CardHeader className="p-0 pb-4 border-b border-slate-100">
                    <CardTitle className="text-xs font-mono font-black uppercase text-slate-800 tracking-wide flex items-center gap-1.5">
                      <Download className="h-4 w-4 text-slate-700" /> EXPORT EXCEL & CSV EN BRUT
                    </CardTitle>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-none">
                      Exportation directe des tables Firestore pour analyses externes
                    </p>
                  </CardHeader>
                  <div className="pt-4 space-y-3 font-mono text-xs text-slate-600">
                    <p className="leading-relaxed">
                      Récupérez l'historique complet et brut des écritures synchronisées de vos chantiers. Le format CSV intègre le BOM UTF-8 standard de sorte à s'ouvrir correctement dans Microsoft Excel.
                    </p>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] leading-tight space-y-1">
                      <p className="font-bold text-slate-800">Format d'export :</p>
                      <p>• Séparateur standard point-virgule ( ; )</p>
                      <p>• ID technique des enregistrements Firestore</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <Button
                    onClick={() => handleExportCSV('taches')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 border-none font-bold uppercase tracking-wider text-xs h-9 shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5 mr-1" /> Export Tâches
                  </Button>
                  <Button
                    onClick={() => handleExportCSV('pannes')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 border-none font-bold uppercase tracking-wider text-xs h-9 shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5 mr-1" /> Export Pannes
                  </Button>
                </div>
              </Card>

            </div>

          </TabsContent>
        </Tabs>
      </div>

      {/* 3. Spectacular Custom Overlay Modal for Printing */}
      {isPrintModalOpen && rapportGenere && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto print:absolute print:inset-0 print:bg-white print:p-0 print:z-0">
          <Card className="bg-white w-full max-w-2xl border border-slate-200 rounded-2xl shadow-xl overflow-hidden print:shadow-none print:border-none print:rounded-none">
            
            {/* Modal Controls */}
            <div className="bg-slate-50 p-4 border-b border-slate-200/60 flex items-center justify-between print:hidden">
              <span className="text-xs font-mono font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                <Printer className="h-3.5 w-3.5 text-[#D4A017]" /> APERÇU AVANT IMPRESSION
              </span>
              <div className="flex gap-2">
                <Button 
                  size="xs" 
                  onClick={handlePrint} 
                  className="bg-[#D4A017] hover:bg-[#B8860B] text-white uppercase text-[10px] font-black h-7 px-3"
                >
                  <Printer className="h-3 w-3 mr-1" /> Imprimer
                </Button>
                <Button 
                  size="xs" 
                  variant="outline" 
                  onClick={() => setIsPrintModalOpen(false)} 
                  className="bg-white border-slate-200 text-slate-700 uppercase text-[10px] font-black h-7 px-3"
                >
                  Fermer
                </Button>
              </div>
            </div>

            {/* Print Content Area */}
            <div className="p-8 font-sans space-y-6 bg-white">
              
              {/* Report Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div className="space-y-1">
                  <h1 className="text-lg font-black tracking-widest text-slate-900 uppercase">HYDROMINES MAINTENANCE</h1>
                  <p className="text-[10px] font-mono font-black text-slate-400">RAPPORT MENSUEL D'EXPLOITATION • {rapportGenere.moisLabel.toUpperCase()}</p>
                </div>
                <div className="text-right space-y-0.5 font-mono text-[9px] text-slate-500">
                  <p>Document : GMAO-RE-V1</p>
                  <p>Site : {activeSite === 'TOUS' ? 'GLOBAL CORPORATE' : activeSite}</p>
                  <p>Date : {new Date().toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              {/* Stats Synthèse Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider font-mono">1. SYNTHÈSE GÉNÉRALE DES OPÉRATIONS</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="border border-slate-200 p-2.5 rounded-xl font-mono">
                    <span className="text-[9px] text-slate-400 block font-bold uppercase leading-none mb-1">Compliance PM</span>
                    <span className="text-xl font-black text-[#D4A017]">{rapportGenere.compliance}%</span>
                  </div>
                  <div className="border border-slate-200 p-2.5 rounded-xl font-mono">
                    <span className="text-[9px] text-slate-400 block font-bold uppercase leading-none mb-1">Rapport PM/Corr</span>
                    <span className="text-xl font-black text-slate-800">
                      {rapportGenere.pmTotal}/{rapportGeneresCorrectivesRatio(rapportGenere)}
                    </span>
                  </div>
                  <div className="border border-slate-200 p-2.5 rounded-xl font-mono">
                    <span className="text-[9px] text-slate-400 block font-bold uppercase leading-none mb-1">Pannes résolues</span>
                    <span className="text-xl font-black text-emerald-600">{rapportGenere.pannesResolues} / {rapportGenere.pannesTotal}</span>
                  </div>
                </div>
              </div>

              {/* Special Performance section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-100 p-3 rounded-xl font-mono text-xs">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">MÉCANICIEN DU MOIS</span>
                  {rapportGenere.topMecanicien ? (
                    <p className="font-black text-slate-800">
                      🥇 {rapportGenere.topMecanicien.nomComplet} ({rapportGenere.topMecanicien.score} pts)
                    </p>
                  ) : (
                    <p className="text-slate-400 italic">Aucune donnée</p>
                  )}
                </div>
                <div className="border border-slate-100 p-3 rounded-xl font-mono text-xs">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">ENGIN LE MOINS DISPONIBLE</span>
                  {rapportGenere.enginLePlusArr ? (
                    <p className="font-black text-red-600">
                      ⚠️ {rapportGenere.enginLePlusArr.enginId} ({rapportGenere.enginLePlusArr.dispoPct}% dispo)
                    </p>
                  ) : (
                    <p className="text-slate-400 italic">Aucune donnée</p>
                  )}
                </div>
              </div>

              {/* Alerts summary */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider font-mono">2. ALERTES CRITIQUES EN ATTENTE</h3>
                <div className="border border-slate-150 rounded-xl p-3 font-mono text-[10.5px] leading-relaxed text-slate-600">
                  {rapportGenere.alertesActives > 0 ? (
                    <p className="text-red-600 font-black">
                      ⚠️ Attention : {rapportGenere.alertesActives} alerte(s) critique(s) active(s) détectée(s) sur le réseau terrain nécessitant un arbitrage immédiat.
                    </p>
                  ) : (
                    <p className="text-emerald-600 font-bold">
                      ✓ Aucune alerte critique en attente. Intégrité opérationnelle de la flotte évaluée à 100%.
                    </p>
                  )}
                </div>
              </div>

              {/* Signature area */}
              <div className="pt-12 flex justify-between font-mono text-xs text-slate-500">
                <div className="space-y-1">
                  <p className="font-bold text-slate-700">Responsable Maintenance</p>
                  <p className="text-[10px]">Visa :</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="font-bold text-slate-700">Direction Générale</p>
                  <p className="text-[10px]">Date de Signature :</p>
                </div>
              </div>

            </div>

          </Card>
        </div>
      )}

    </div>
  );
}

function rapportGeneresCorrectivesRatio(rapport: any) {
  const correctives = rapport.correctifsTotal || 0;
  return `${correctives} Clôt.`;
}
