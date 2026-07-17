// V4-ALERTES: Main Alerts management component
import * as React from "react";
import { 
  AlertTriangle, Check, CheckCircle2, ShieldAlert, Wrench, 
  Package, Droplets, Clock, Trash2, Shield, Eye, RefreshCw, 
  Play, CheckCheck, Inbox, AlertOctagon, Info, ChevronRight,
  ExternalLink, UserCheck, ShoppingCart, Search, Filter, Calendar
} from "lucide-react";
import { 
  collection, doc, getDoc, setDoc, updateDoc, deleteDoc, Timestamp, writeBatch 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { dbService } from "@/services/firestoreService";
import { useAuthStore } from "@/lib/store";
import { useCollection } from "@/hooks/useCollection";
import { DataLoadError } from "@/components/shared/DataLoadError";
import { PageBanner } from "@/components/ui/PageBanner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { cn, getLocalDateString } from "@/lib/utils";

export interface AlertDocument {
  id: string;
  code: 'PM_OVERDUE' | 'PM_CRITICAL' | 'PANNE_24H' | 'PANNE_48H' | 'PIECE_STOCK_BAS' | 'GASOIL_ANORMAL' | 'ENGIN_INACTIF';
  type: string;
  severity: 'YELLOW' | 'RED' | 'RED_FLASHING';
  title: string;
  message: string;
  status: 'ACTIVE' | 'VUE' | 'TRAITEE' | 'ARCHIVEE';
  siteId: string;
  targetId: string;
  createdAt: string;
  updatedAt: string;
  emailSent: boolean;
  smsSent: boolean;
  details?: any;
}

export function Alertes() {
  const { user, activeSite } = useAuthStore();
  const isAuthorized = ['ADMIN', 'DIRECTION', 'RESPONSABLE_MAINTENANCE'].includes(user?.role || '');

  // Fetch Firestore collections
  const { data: alerts, loading: alertsLoading, error: alertsError } = useCollection<AlertDocument>('alerts', [], {
    orderByField: 'updatedAt',
    orderByDirection: 'desc',
    limitNum: 100
  });

  const { data: engins, loading: enginsLoading, error: enginsError } = useCollection<any>('engins');
  const { data: pmIntervalles, loading: pmIntervallesLoading, error: pmIntervallesError } = useCollection<any>('pmIntervalles');
  const { data: pannes, loading: pannesLoading, error: pannesError } = useCollection<any>('pannes');
  const { data: pieces, loading: piecesLoading, error: piecesError } = useCollection<any>('pieces');
  const { data: tasks, loading: tasksLoading, error: tasksError } = useCollection<any>('maintenanceTasks');

  const hasLoadError = !!(alertsError || enginsError || pmIntervallesError || pannesError || piecesError || tasksError);

  const loading = alertsLoading || enginsLoading || pmIntervallesLoading || pannesLoading || piecesLoading || tasksLoading;

  const [activeFilter, setActiveFilter] = React.useState<'ALL' | 'ACTIVE' | 'VUE' | 'TRAITEE' | 'ARCHIVEE'>('ACTIVE');
  const [severityFilter, setSeverityFilter] = React.useState<'ALL' | 'YELLOW' | 'RED' | 'RED_FLASHING'>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [generationRunning, setGenerationRunning] = React.useState(false);

  // V4-ALERTES: Automatic background engine to check rules and generate alerts
  React.useEffect(() => {
    if (loading || !engins || !pmIntervalles || !pannes || !pieces || !tasks) return;
    if (!isAuthorized) return;

    const runAlertGeneration = async () => {
      setGenerationRunning(true);
      try {
        const batchAlerts: AlertDocument[] = [];
        const now = new Date();

        // ----------------------------------------------------
        // Rule 1 & 2: PM_OVERDUE and PM_CRITICAL
        // ----------------------------------------------------
        for (const engin of engins) {
          if (engin.deleted || (engin.id || '').startsWith('temp_')) continue;

          const modelIntervalles = pmIntervalles.filter(
            (i: any) => i.typeEngin === engin.modele || i.typeEngin === 'Générique'
          );

          for (const intervalle of modelIntervalles) {
            const enginTasks = tasks.filter(
              (t: any) => t.enginId === engin.id && t.type === 'PREVENTIF' && !t.deleted
            );

            const lastPm = enginTasks
              .filter((t: any) => t.statut === 'FAIT' || t.statut === 'VALIDE')
              .filter((t: any) => (t.label || "").toLowerCase().includes((intervalle.operation || "").substring(0, 20).toLowerCase()))
              .sort((a: any, b: any) => (b.heuresEnginAuMoment || 0) - (a.heuresEnginAuMoment || 0))[0];

            const lastPmHours = lastPm ? (lastPm.heuresEnginAuMoment || 0) : 0;
            const hoursSinceLastPm = engin.heuresMarche - lastPmHours;

            const overdueThreshold = intervalle.intervalleHeures;
            const criticalThreshold = intervalle.intervalleHeures * 1.1;

            const currentOpName = intervalle.operation || "Opération";

            if (hoursSinceLastPm >= criticalThreshold) {
              const safeOperationId = currentOpName.replace(/[^a-zA-Z0-9]/g, '_');
              batchAlerts.push({
                id: `pm_critical_${engin.id}_${safeOperationId}`,
                code: 'PM_CRITICAL',
                type: 'Maintenance préventive très dépassée',
                severity: 'RED',
                title: `PM CRITIQUE DÉPASSÉ • ${engin.id}`,
                message: `L'opération ${currentOpName} est dépassée depuis ${Math.round(hoursSinceLastPm - overdueThreshold)}h (Heures actuelles: ${engin.heuresMarche}h, Intervalle: ${overdueThreshold}h).`,
                siteId: engin.siteId,
                targetId: engin.id,
                emailSent: false,
                smsSent: false,
                status: 'ACTIVE',
                createdAt: now.toISOString(),
                updatedAt: now.toISOString(),
                details: { operation: currentOpName, hoursSinceLastPm, threshold: overdueThreshold }
              });
            } else if (hoursSinceLastPm >= overdueThreshold) {
              const safeOperationId = currentOpName.replace(/[^a-zA-Z0-9]/g, '_');
              batchAlerts.push({
                id: `pm_overdue_${engin.id}_${safeOperationId}`,
                code: 'PM_OVERDUE',
                type: 'Maintenance préventive dépassée',
                severity: 'YELLOW',
                title: `PM REQUIS • ${engin.id}`,
                message: `L'opération ${currentOpName} doit être planifiée. Heures cumulées depuis le dernier PM: ${Math.round(hoursSinceLastPm)}h / ${overdueThreshold}h.`,
                siteId: engin.siteId,
                targetId: engin.id,
                emailSent: false,
                smsSent: false,
                status: 'ACTIVE',
                createdAt: now.toISOString(),
                updatedAt: now.toISOString(),
                details: { operation: currentOpName, hoursSinceLastPm, threshold: overdueThreshold }
              });
            }
          }
        }

        // ----------------------------------------------------
        // Rule 3 & 4: PANNE_24H and PANNE_48H
        // ----------------------------------------------------
        for (const panne of pannes) {
          if (panne.deleted || panne.statut === 'CLOS') continue;

          const decDate = panne.dateDeclaration ? new Date(panne.dateDeclaration) : new Date(panne.createdAt?.seconds * 1000 || now);
          const elapsedHours = (now.getTime() - decDate.getTime()) / (3600 * 1000);

          if (panne.gravite === 'Critique' && elapsedHours >= 48) {
            batchAlerts.push({
              id: `panne_48h_${panne.id}`,
              code: 'PANNE_48H',
              type: 'Panne critique non traitée',
              severity: 'RED_FLASHING',
              title: `URGENCE PANNE CRITIQUE IMMOBILISÉE • ${panne.numero || panne.id}`,
              message: `La panne critique sur l'engin ${panne.enginId} (${panne.categorie}) n'est pas résolue depuis plus de 48 heures (${Math.round(elapsedHours)}h d'arrêt cumulé).`,
              siteId: panne.siteId,
              targetId: panne.id,
              emailSent: false,
              smsSent: false,
              status: 'ACTIVE',
              createdAt: now.toISOString(),
              updatedAt: now.toISOString(),
              details: { numero: panne.numero, elapsedHours }
            });
          } else if (elapsedHours >= 24) {
            batchAlerts.push({
              id: `panne_24h_${panne.id}`,
              code: 'PANNE_24H',
              type: 'Panne non traitée',
              severity: 'RED',
              title: `RETARD RÉSOLUTION PANNE • ${panne.numero || panne.id}`,
              message: `La panne de catégorie ${panne.categorie} sur l'engin ${panne.enginId} est déclarée depuis ${Math.round(elapsedHours)}h sans être clôturée.`,
              siteId: panne.siteId,
              targetId: panne.id,
              emailSent: false,
              smsSent: false,
              status: 'ACTIVE',
              createdAt: now.toISOString(),
              updatedAt: now.toISOString(),
              details: { numero: panne.numero, elapsedHours }
            });
          }
        }

        // ----------------------------------------------------
        // Rule 5: PIECE_STOCK_BAS
        // ----------------------------------------------------
        for (const piece of pieces) {
          if (piece.deleted) continue;
          const currentStock = piece.stock !== undefined ? piece.stock : 0;
          const minStock = piece.min !== undefined ? piece.min : 5;

          if (currentStock < minStock) {
            batchAlerts.push({
              id: `piece_stock_bas_${piece.id}`,
              code: 'PIECE_STOCK_BAS',
              type: 'Stock pièce insuffisant',
              severity: 'YELLOW',
              title: `STOCK CRITIQUE • ${piece.ref || piece.id}`,
              message: `La pièce "${piece.nom}" est sous le seuil minimum de sécurité (Stock actuel: ${currentStock} / Minimum requis: ${minStock}). Approvisionnement nécessaire.`,
              siteId: piece.siteId || 'SMI',
              targetId: piece.id,
              emailSent: false,
              smsSent: false,
              status: 'ACTIVE',
              createdAt: now.toISOString(),
              updatedAt: now.toISOString(),
              details: { nom: piece.nom, stock: currentStock, min: minStock }
            });
          }
        }

        // ----------------------------------------------------
        // Rule 6: GASOIL_ANORMAL
        // ----------------------------------------------------
        for (const engin of engins) {
          if (engin.deleted || (engin.id || '').startsWith('temp_')) continue;

          const avgConso = engin.consommationMoyenne || engin.fuelAvg || 0;
          const lastConso = engin.derniereConsommation || engin.fuelLast || 0;

          if (avgConso > 0 && lastConso > avgConso * 1.30) {
            batchAlerts.push({
              id: `gasoil_anormal_${engin.id}`,
              code: 'GASOIL_ANORMAL',
              type: 'Consommation anormale',
              severity: 'YELLOW',
              title: `ANOMALIE CARBURANT • ${engin.id}`,
              message: `Consommation de gasoil suspecte de ${Math.round(lastConso)} L/h vs moyenne de ${Math.round(avgConso)} L/h (+${Math.round((lastConso / avgConso - 1) * 100)}%).`,
              siteId: engin.siteId,
              targetId: engin.id,
              emailSent: false,
              smsSent: false,
              status: 'ACTIVE',
              createdAt: now.toISOString(),
              updatedAt: now.toISOString(),
              details: { lastConso, avgConso }
            });
          }
        }

        // ----------------------------------------------------
        // Rule 7: ENGIN_INACTIF
        // ----------------------------------------------------
        for (const engin of engins) {
          const activeStatut = (engin.statut || '').toLowerCase();
          const isOut = engin.statut !== undefined 
            ? (activeStatut === 'hors service' || activeStatut === 'vendu') 
            : (engin.etat === 'Vendu' || engin.etat === 'Hors service');
          if (engin.deleted || (engin.id || '').startsWith('temp_') || isOut) continue;

          const lastUpdate = engin.updatedAt ? new Date(engin.updatedAt.seconds ? engin.updatedAt.seconds * 1000 : engin.updatedAt) : null;
          if (lastUpdate) {
            const elapsedDays = (now.getTime() - lastUpdate.getTime()) / (24 * 3600 * 1000);
            if (elapsedDays > 7) {
              batchAlerts.push({
                id: `engin_inactif_${engin.id}`,
                code: 'ENGIN_INACTIF',
                type: 'Engin sans activité',
                severity: 'YELLOW',
                title: `INACTIVITÉ SUSPECTE • ${engin.id}`,
                message: `L'engin n'a enregistré aucune mise à jour d'activité ou d'heures depuis plus de 7 jours (${Math.round(elapsedDays)} jours d'absence de données).`,
                siteId: engin.siteId,
                targetId: engin.id,
                emailSent: false,
                smsSent: false,
                status: 'ACTIVE',
                createdAt: now.toISOString(),
                updatedAt: now.toISOString(),
                details: { elapsedDays }
              });
            }
          }
        }

        // Write batch alerts to firestore idempotently
        let createdCount = 0;
        for (const alert of batchAlerts) {
          const alertRef = doc(db, 'alerts', alert.id);
          const snap = await getDoc(alertRef);
          if (!snap.exists()) {
            await dbService.alerts.create(alert.id, alert);
            createdCount++;
          }
        }

        if (createdCount > 0) {
          toast.success(`${createdCount} nouvelle(s) alerte(s) métier identifiée(s) et enregistrée(s).`);
        }
      } catch (err) {
        console.error("Failed to execute alert generation rules:", err);
      } finally {
        setGenerationRunning(false);
      }
    };

    runAlertGeneration();
  }, [engins, pmIntervalles, pannes, pieces, tasks, loading, isAuthorized]);

  // Handle alert status transition
  const handleTransition = async (alertId: string, currentStatus: string, targetStatus: 'ACTIVE' | 'VUE' | 'TRAITEE' | 'ARCHIVEE') => {
    try {
      await dbService.alerts.update(alertId, {
        status: targetStatus,
        updatedAt: new Date().toISOString()
      });
      toast.success(`Alerte mise à jour : statut '${targetStatus}'`);
    } catch (err) {
      console.error(err);
      toast.error("Échec de la transition de l'alerte.");
    }
  };

  // Perform bulk actions
  const handleBulkAction = async (action: 'VUE' | 'TRAITEE' | 'ARCHIVEE') => {
    try {
      const activeAlerts = filteredAlerts.filter(a => a.status !== action);
      if (activeAlerts.length === 0) {
        toast.info("Aucune alerte éligible pour cette action groupée.");
        return;
      }

      await dbService.alerts.batchUpdateStatus(activeAlerts.map(a => a.id), action);
      toast.success(`${activeAlerts.length} alerte(s) mise(s) à jour en bloc.`);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'action de groupe.");
    }
  };

  // Purge / delete all archived alerts
  const handlePurgeArchived = async () => {
    try {
      const archivedAlerts = (alerts || []).filter(a => a.status === 'ARCHIVEE');
      if (archivedAlerts.length === 0) {
        toast.info("Aucune alerte archivée à supprimer.");
        return;
      }

      await dbService.alerts.batchDelete(archivedAlerts.map(a => a.id));
      toast.success(`${archivedAlerts.length} alerte(s) archivée(s) définitivement supprimée(s).`);
    } catch (err) {
      console.error(err);
      toast.error("Erreur de purge des archives.");
    }
  };

  // Filter alerts according to current controls
  const filteredAlerts = React.useMemo(() => {
    if (!alerts) return [];
    return alerts.filter(a => {
      // Site constraint
      const matchesSite = activeSite === 'TOUS' || a.siteId === activeSite;
      
      // Status filter
      const matchesStatus = activeFilter === 'ALL' || a.status === activeFilter;

      // Severity filter
      const matchesSeverity = severityFilter === 'ALL' || a.severity === severityFilter;

      // Search matching title, type, or message
      const text = `${a.title} ${a.type} ${a.message}`.toLowerCase();
      const matchesSearch = text.includes(searchQuery.toLowerCase());

      return matchesSite && matchesStatus && matchesSeverity && matchesSearch;
    });
  }, [alerts, activeSite, activeFilter, severityFilter, searchQuery]);

  // Count highlights
  const counts = React.useMemo(() => {
    const raw = alerts || [];
    const activeRaw = raw.filter(a => activeSite === 'TOUS' || a.siteId === activeSite);
    return {
      active: activeRaw.filter(a => a.status === 'ACTIVE').length,
      vue: activeRaw.filter(a => a.status === 'VUE').length,
      traitee: activeRaw.filter(a => a.status === 'TRAITEE').length,
      archivee: activeRaw.filter(a => a.status === 'ARCHIVEE').length,
      critical: activeRaw.filter(a => a.status === 'ACTIVE' && (a.severity === 'RED' || a.severity === 'RED_FLASHING')).length
    };
  }, [alerts, activeSite]);

  // Contextual actions executor
  const handleContextualAction = async (alert: AlertDocument) => {
    try {
      switch (alert.code) {
        case 'PM_OVERDUE':
        case 'PM_CRITICAL': {
          // Create Work Order (BT) task in Firestore
          const enginObj = engins?.find((e: any) => e.id === alert.targetId);
          const opName = alert.details?.operation || 'Maintenance Préventive';
          
          const newBtId = `pm_task_${alert.targetId}_${Date.now()}`;
          const newBt = {
            id: newBtId,
            type: 'PREVENTIF',
            label: `PM - ${opName}`,
            enginId: alert.targetId,
            enginModele: enginObj?.modele || '',
            mecanicienId: '',
            mecanicienNom: 'À attribuer',
            poste: 'Poste 1',
            siteId: alert.siteId,
            datePlanifiee: getLocalDateString(),
            dureeEstimee: '2h',
            priorite: alert.code === 'PM_CRITICAL' ? 'CRITIQUE' : 'HAUTE',
            statut: 'NON_FAIT',
            generationType: 'AUTO_PM',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          };

          await dbService.workOrders.createWithId(newBtId, newBt);
          await dbService.alerts.update(alert.id, {
            status: 'VUE',
            updatedAt: new Date().toISOString()
          });

          toast.success(`Bon de Travail généré pour ${alert.targetId} ! Alerte acquittée.`);
          break;
        }
        case 'PANNE_24H':
        case 'PANNE_48H': {
          // Open work orders or assign mechanics by opening toast / mock transition
          await dbService.alerts.update(alert.id, {
            status: 'TRAITEE',
            updatedAt: new Date().toISOString()
          });
          toast.success("Ordre d'intervention prioritaire affecté à l'équipe de piquet.");
          break;
        }
        case 'PIECE_STOCK_BAS': {
          // Order pieces simulation
          toast.success(`Demande d'achat d'urgence initiée pour la pièce détériorée [${alert.details?.nom || alert.targetId}].`);
          await dbService.alerts.update(alert.id, {
            status: 'VUE',
            updatedAt: new Date().toISOString()
          });
          break;
        }
        case 'GASOIL_ANORMAL': {
          toast.success(`Ordre d'audit énergétique et d'investigation moteur programmé sur l'engin ${alert.targetId}.`);
          await dbService.alerts.update(alert.id, {
            status: 'TRAITEE',
            updatedAt: new Date().toISOString()
          });
          break;
        }
        case 'ENGIN_INACTIF': {
          toast.success(`Vérification physique ordonnée au superviseur du chantier pour l'engin ${alert.targetId}.`);
          await dbService.alerts.update(alert.id, {
            status: 'TRAITEE',
            updatedAt: new Date().toISOString()
          });
          break;
        }
        default:
          toast.info("Aucune action contextuelle spécifique.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Échec du traitement contextuel.");
    }
  };

  return (
    <div className="space-y-6" id="gmao-alerts-page">
      {hasLoadError && <DataLoadError />}
      {/* Page Banner Header */}
      <PageBanner
        icon={AlertTriangle}
        badgeLabel="Vigilance Opérationnelle"
        title="Alertes & Pannes"
        subtitle="Suivi en temps réel des incidents et interventions"
        siteLabel={activeSite === 'TOUS' ? 'TOUS LES SITES' : activeSite}
      >
        <div className="flex gap-2">
          {generationRunning && (
            /* V4-TYPO: replaced text-[10px] and font-mono with text-caption */
            <span className="flex items-center gap-1 text-caption font-bold text-amber-500 animate-pulse bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">
              <RefreshCw className="h-3 w-3 animate-spin" /> ÉVALUATION...
            </span>
          )}
          {activeFilter === 'ARCHIVEE' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handlePurgeArchived}
              /* V4-TYPO: replaced text-[10px] and font-mono with text-caption and font-sans */
              className="text-caption font-bold tracking-wider uppercase h-8 px-3"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Purger les Archives
            </Button>
          )}
        </div>
      </PageBanner>

      {/* KPI Dashboard Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="relative overflow-hidden bg-white dark:bg-slate-950 border border-[#D4AF37]/50 rounded-xl shadow-sm text-slate-900 dark:text-white hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
          <CardContent className="p-4 pt-5 flex items-center justify-between">
            <div>
              {/* V4-TYPO: replaced text-[10px] and font-mono with text-caption and font-sans */}
              <p className="text-caption font-sans text-slate-500 dark:text-slate-400 uppercase tracking-wider font-extrabold">Active Alerts</p>
              <h3 className="text-2xl font-black text-[#D4AF37] mt-1">{counts.active}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
              <AlertOctagon className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-white dark:bg-slate-950 border border-[#D4AF37]/50 rounded-xl shadow-sm text-slate-900 dark:text-white hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
          <CardContent className="p-4 pt-5 flex items-center justify-between">
            <div>
              {/* V4-TYPO: replaced text-[10px] and font-mono with text-caption and font-sans */}
              <p className="text-caption font-sans text-slate-500 dark:text-slate-400 uppercase tracking-wider font-extrabold">Risques Critiques</p>
              <h3 className={cn("text-2xl font-black mt-1 animate-pulse text-red-600 dark:text-red-400", counts.critical > 0 ? "" : "text-[#D4AF37]")}>
                {counts.critical}
              </h3>
            </div>
            <div className={cn("p-2.5 rounded-xl", counts.critical > 0 ? "bg-red-500/10 text-red-600 dark:text-red-400 animate-bounce" : "bg-slate-100 dark:bg-slate-900 text-slate-400")}>
              <ShieldAlert className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-white dark:bg-slate-950 border border-[#D4AF37]/50 rounded-xl shadow-sm text-slate-900 dark:text-white hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
          <CardContent className="p-4 pt-5 flex items-center justify-between">
            <div>
              {/* V4-TYPO: replaced text-[10px] and font-mono with text-caption and font-sans */}
              <p className="text-caption font-sans text-slate-500 dark:text-slate-400 uppercase tracking-wider font-extrabold">Alertes Acquittées</p>
              <h3 className="text-2xl font-black text-[#D4AF37] mt-1">{counts.vue}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
              <Eye className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-white dark:bg-slate-950 border border-[#D4AF37]/50 rounded-xl shadow-sm text-slate-900 dark:text-white hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
          <CardContent className="p-4 pt-5 flex items-center justify-between">
            <div>
              {/* V4-TYPO: replaced text-[10px] and font-mono with text-caption and font-sans */}
              <p className="text-caption font-sans text-slate-500 dark:text-slate-400 uppercase tracking-wider font-extrabold">Alertes Traitées</p>
              <h3 className="text-2xl font-black text-[#D4AF37] mt-1">{counts.traitee}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-white dark:bg-slate-950 border border-[#D4AF37]/50 rounded-xl shadow-sm text-slate-900 dark:text-white hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
          <CardContent className="p-4 pt-5 flex items-center justify-between">
            <div>
              {/* V4-TYPO: replaced text-[10px] and font-mono with text-caption and font-sans */}
              <p className="text-caption font-sans text-slate-500 dark:text-slate-400 uppercase tracking-wider font-extrabold">Historique Archivé</p>
              <h3 className="text-2xl font-black text-[#D4AF37] mt-1">{counts.archivee}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
              <Inbox className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Toolbar */}
      <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#D4AF37]/30 shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
        {/* Navigation Categories Tab */}
        <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1 rounded-lg">
          {(['ACTIVE', 'VUE', 'TRAITEE', 'ARCHIVEE', 'ALL'] as const).map((filter) => {
            const labels = {
              ACTIVE: 'À Traiter',
              VUE: 'Acquittées',
              TRAITEE: 'Résolues',
              ARCHIVEE: 'Archivées',
              ALL: 'Toutes'
            };
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  /* V4-TYPO: replaced text-[10.5px] with text-caption */
                  "px-3.5 py-1.5 rounded-md text-caption font-black uppercase tracking-wider transition-all cursor-pointer",
                  activeFilter === filter
                    ? "bg-white text-slate-900 shadow-xs font-extrabold border border-slate-100"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                {labels[filter]}
              </button>
            );
          })}
        </div>

        {/* Action controls & search */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Severity selector */}
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
            {/* V4-TYPO: replaced text-[9px] and font-mono with text-caption and font-sans */}
            <span className="text-caption font-sans font-black text-slate-450 uppercase px-1">Gravité:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="bg-transparent text-caption font-bold text-slate-700 outline-none border-0 cursor-pointer p-0"
            >
              <option value="ALL">TOUTES</option>
              <option value="YELLOW">JAUNE (SEUIL MÉTROLOGIQUE)</option>
              <option value="RED">ROUGE (CRITIQUE)</option>
              <option value="RED_FLASHING">CLIGNOTANT (SÉVÈRE &gt; 48h)</option>
            </select>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une alerte..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8.5 pr-4 py-1.5 w-48 sm:w-60 bg-slate-50 border border-slate-100 rounded-lg text-caption focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold"
            />
          </div>

          {/* Bulk actions */}
          {activeFilter === 'ACTIVE' && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('VUE')}
                className="text-caption font-black uppercase tracking-widest h-8"
              >
                <CheckCheck className="h-3 w-3 mr-1" /> Tout acquitter
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Alerts Feed Grid */}
      <div className="relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
            <RefreshCw className="h-8 w-8 animate-spin text-slate-450 mb-3" />
            <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Calcul & Analyse des Règles — HYDROMINES - Espace Maintenance...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-slate-50/30 rounded-2xl border-2 border-dashed border-slate-150 p-6 text-center">
            <Inbox className="h-10 w-10 text-slate-300 mb-2.5" />
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-700">Aucune alerte correspondante</h4>
            {/* V4-TYPO: replaced text-[10px] with text-caption */}
            <p className="text-caption text-slate-500 uppercase mt-1">Tous les indicateurs et seuils techniques sont actuellement stables sur ce chantier.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredAlerts.map((alert) => {
                const isCritical = alert.severity === 'RED' || alert.severity === 'RED_FLASHING';
                const isFlashing = alert.severity === 'RED_FLASHING' && alert.status === 'ACTIVE';

                return (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "p-4 rounded-xl border bg-white flex flex-col justify-between gap-4 relative overflow-hidden transition-all duration-300 shadow-xs",
                      alert.status === 'ACTIVE' 
                        ? isCritical 
                          ? "border-l-4 border-l-rose-500 border-rose-100 bg-rose-50/5 hover:shadow-md" 
                          : "border-l-4 border-l-yellow-500 border-yellow-100 bg-yellow-50/5 hover:shadow-md"
                        : "border-slate-200 opacity-70"
                    )}
                  >
                    {/* Top line with status indicators and tags */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          /* V4-TYPO: replaced text-[8px] with text-tech (since alert code is a tech code) */
                          "text-tech font-mono font-black uppercase px-2 py-0.5 rounded-full border tracking-wider",
                          isCritical
                            ? "bg-rose-50 text-rose-600 border-rose-100"
                            : "bg-yellow-50 text-yellow-600 border-yellow-100"
                        )}>
                          {alert.code}
                        </span>
                        {/* V4-TYPO: replaced text-[8px] with text-tech (site ID is tech data) */}
                        <span className="text-tech font-mono font-black bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-full tracking-wider uppercase">
                          {alert.siteId}
                        </span>
                      </div>
                      
                      {/* V4-TYPO: replaced text-[8.5px] and font-mono with text-caption and font-sans */}
                      <span className="text-caption font-sans text-slate-450 uppercase font-black">
                        {new Date((alert.createdAt as any)?.seconds ? (alert.createdAt as any).seconds * 1000 : alert.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
 
                    {/* Core Body */}
                    <div className="space-y-1">
                      <h4 className="text-sm font-black uppercase text-slate-800 tracking-wide flex items-center gap-1.5">
                        {isFlashing && <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping shrink-0" />}
                        {alert.title}
                      </h4>
                      {/* V4-TYPO: replaced text-[10.5px] with text-body */}
                      <p className="text-body text-slate-500 font-medium leading-relaxed font-sans">
                        {alert.message}
                      </p>
                    </div>
 
                    {/* Metadata indicators */}
                    {/* V4-TYPO: replaced text-[9px] and font-mono with text-caption and font-sans */}
                    <div className="flex items-center gap-3 text-caption font-sans text-slate-450 border-t border-slate-50 pt-2.5">
                      <span className="flex items-center gap-1 font-bold uppercase">
                        STATUS: <span className={cn(
                          "font-black",
                          alert.status === 'ACTIVE' && "text-amber-500",
                          alert.status === 'VUE' && "text-blue-500",
                          alert.status === 'TRAITEE' && "text-emerald-500",
                          alert.status === 'ARCHIVEE' && "text-slate-500"
                        )}>{alert.status}</span>
                      </span>
                      <span>•</span>
                      <span className="uppercase font-bold">Mail: {alert.emailSent ? 'ENVOYÉ' : 'PRÉPARÉ'}</span>
                      <span>•</span>
                      <span className="uppercase font-bold">SMS: {alert.smsSent ? 'ENVOYÉ' : 'PRÉPARÉ'}</span>
                    </div>                      {/* Action Panel */}
                    <div className="flex items-center justify-between gap-2 border-t border-slate-50 pt-3 mt-1.5">
                      {/* Left: Action transitions */}
                      <div className="flex gap-1">
                        {alert.status === 'ACTIVE' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTransition(alert.id, alert.status, 'VUE')}
                            /* V4-TYPO: replaced text-[9px] with text-caption */
                            className="text-caption font-black tracking-widest h-8 px-2.5 text-slate-650 hover:text-blue-500"
                          >
                            <Eye className="h-3 w-3 mr-1" /> Acquitter
                          </Button>
                        )}
                        {alert.status === 'VUE' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTransition(alert.id, alert.status, 'TRAITEE')}
                            /* V4-TYPO: replaced text-[9px] with text-caption */
                            className="text-caption font-black tracking-widest h-8 px-2.5 text-slate-650 hover:text-emerald-500"
                          >
                            <Check className="h-3 w-3 mr-1" /> Traitée
                          </Button>
                        )}
                        {alert.status === 'TRAITEE' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTransition(alert.id, alert.status, 'ARCHIVEE')}
                            /* V4-TYPO: replaced text-[9px] with text-caption */
                            className="text-caption font-black tracking-widest h-8 px-2.5 text-slate-650 hover:text-slate-800"
                          >
                            <Inbox className="h-3 w-3 mr-1" /> Archiver
                          </Button>
                        )}
                        {alert.status === 'ARCHIVEE' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTransition(alert.id, alert.status, 'ACTIVE')}
                            /* V4-TYPO: replaced text-[9px] with text-caption */
                            className="text-caption font-black tracking-widest h-8 px-2.5 text-slate-650 hover:text-amber-500"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" /> Réactiver
                          </Button>
                        )}
                      </div>
 
                      {/* Right: Contextual physical button based on rule */}
                      {alert.status === 'ACTIVE' && (
                        <Button
                          onClick={() => handleContextualAction(alert)}
                          className={cn(
                            /* V4-TYPO: replaced text-[9px] with text-caption */
                            "text-caption font-black tracking-widest uppercase h-8 px-3 border-none",
                            isCritical 
                              ? "bg-rose-600 hover:bg-rose-700 text-white" 
                              : "bg-amber-500 hover:bg-amber-600 text-white"
                          )}
                        >
                          {alert.code === 'PM_OVERDUE' || alert.code === 'PM_CRITICAL' ? (
                            <><Wrench className="h-3 w-3 mr-1" /> Planifier PM</>
                          ) : alert.code === 'PANNE_24H' || alert.code === 'PANNE_48H' ? (
                            <><UserCheck className="h-3 w-3 mr-1" /> Assigner Méca</>
                          ) : alert.code === 'PIECE_STOCK_BAS' ? (
                            <><ShoppingCart className="h-3 w-3 mr-1" /> Notifier Achat</>
                          ) : alert.code === 'GASOIL_ANORMAL' ? (
                            <><Eye className="h-3 w-3 mr-1" /> Investiguer</>
                          ) : (
                            <><ExternalLink className="h-3 w-3 mr-1" /> Inspecter</>
                          )}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Rules and Limits Reference Panel */}
      <Card className="relative overflow-hidden bg-white border border-[#D4AF37]/50 rounded-2xl shadow-md mt-6">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
        <CardHeader className="p-4 pb-2 border-b border-slate-50 bg-slate-50/50">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-amber-500" /> Guide de Configuration des Seuils Métier
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            {/* V4-TYPO: replaced text-[10px] with text-caption and font-sans */}
            <table className="w-full text-left border-collapse text-caption font-sans">
              <thead>
                <tr className="border-b border-slate-100 text-slate-450 uppercase font-black tracking-wider">
                  <th className="pb-2">Code Règle</th>
                  <th className="pb-2">Désignation</th>
                  <th className="pb-2">Condition Métrologique / Seuil</th>
                  <th className="pb-2">Gravité Visuelle</th>
                  <th className="pb-2">Action Centrale Programmée</th>
                </tr>
              </thead>
              {/* V4-TYPO: replaced font-mono on entire tbody with targeted fonts */}
              <tbody className="divide-y divide-slate-50 text-slate-650 font-medium">
                <tr>
                  {/* V4-TYPO: rule code is tech data, so keep font-mono with text-tech */}
                  <td className="py-2.5 font-bold font-mono text-tech text-slate-800">PM_OVERDUE</td>
                  <td>Maintenance préventive dépassée</td>
                  {/* V4-TYPO: numbers are tech data, so font-mono + text-tech */}
                  <td className="font-mono text-tech">Heures cumulées &gt; intervalle PM</td>
                  {/* V4-TYPO: replaced text-[8.5px] with text-caption */}
                  <td><span className="inline-flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full text-caption border border-yellow-100 font-black">🟡 JAUNE</span></td>
                  <td>Génération automatique de Bon de Travail (BT) planifié</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold font-mono text-tech text-slate-800">PM_CRITICAL</td>
                  <td>Maintenance préventive très dépassée</td>
                  <td className="font-mono text-tech">Heures cumulées &gt; 110% de l'intervalle PM</td>
                  <td><span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-caption border border-rose-100 font-black">🔴 ROUGE</span></td>
                  <td>Escalade immédiate au Responsable Maintenance (email/SMS simulés)</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold font-mono text-tech text-slate-800">PANNE_24H</td>
                  <td>Panne non traitée</td>
                  <td className="font-mono text-tech">Statut panne ≠ CLOS après 24 heures d'immobilisation</td>
                  <td><span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-caption border border-rose-100 font-black">🔴 ROUGE</span></td>
                  <td>Rappel de piquet, escalade et notification d'urgence</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold font-mono text-tech text-slate-800">PANNE_48H</td>
                  <td>Panne critique non traitée</td>
                  <td className="font-mono text-tech">Sévérité "Critique" + statut ≠ CLOS après 48 heures</td>
                  <td><span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-caption border border-rose-100 font-black animate-pulse">🚨 CLIGNOTANT</span></td>
                  <td>Alerte majeure opérationnelle, SMS direct prioritaire d'astreinte</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold font-mono text-tech text-slate-800">PIECE_STOCK_BAS</td>
                  <td>Stock pièce insuffisant</td>
                  <td className="font-mono text-tech">Quantité physique disponible &lt; seuil minimum de sécurité</td>
                  <td><span className="inline-flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full text-caption border border-yellow-100 font-black">🟡 JAUNE</span></td>
                  <td>Génération d'une demande de réapprovisionnement magasinier</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold font-mono text-tech text-slate-800">GASOIL_ANORMAL</td>
                  <td>Consommation anormale</td>
                  <td className="font-mono text-tech">Consommation instantanée (L/h) &gt; moyenne historique + 30%</td>
                  <td><span className="inline-flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full text-caption border border-yellow-100 font-black">🟡 JAUNE</span></td>
                  <td>Demande d'investigation moteur pour déceler fuite ou anomalie</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold font-mono text-tech text-slate-800">ENGIN_INACTIF</td>
                  <td>Engin sans activité</td>
                  <td className="font-mono text-tech">Absence de mise à jour de données d'heures &gt; 7 jours</td>
                  <td><span className="inline-flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full text-caption border border-yellow-100 font-black">🟡 JAUNE</span></td>
                  <td>Vérification physique requise sur chantier de production</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Alertes;
