import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableBody as TBody, TableCell as TCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  Wrench, Activity, Clock, ShieldAlert, Cpu, FileText, CheckSquare, 
  Trash, Lock, UserCheck, RefreshCw, AlertTriangle, Play, CheckCircle2, 
  Search, ShieldCheck, Coins, HelpCircle, Layers, Settings, Eye, Zap
} from "lucide-react";
import { DemandeInterventionDI, RapportFinInterventionRFI, WorkOrderBT, MiniMachine } from "./types_gmao";
import { dbService } from "../services/firestoreService";

// Helper Interface for props
interface GmaoCockpitProps {
  demandesIntervention: DemandeInterventionDI[];
  setDemandesIntervention: React.Dispatch<React.SetStateAction<DemandeInterventionDI[]>>;
  rfis: RapportFinInterventionRFI[];
  setRfis: React.Dispatch<React.SetStateAction<RapportFinInterventionRFI[]>>;
  workOrders: WorkOrderBT[];
  setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrderBT[]>>;
  machines: MiniMachine[];
  setMachines: React.Dispatch<React.SetStateAction<MiniMachine[]>>;
  currentUser: any;
  selectedSiteFilter: string;
  addAuditLog: (action: string, category: string, entityId?: string, oldVal?: string, newVal?: string) => void;
  safetyLotoStatuses: Record<string, { statutLOTO: "ACTIF" | "INACTIF"; lotoDetails?: string }>;
  setSafetyLotoStatuses: React.Dispatch<React.SetStateAction<Record<string, { statutLOTO: "ACTIF" | "INACTIF"; lotoDetails?: string }>>>;
  handleSignBT: (btId: string) => void;
  handleDeleteBT: (btId: string) => void;
}

export const GmaoCockpit: React.FC<GmaoCockpitProps> = ({
  demandesIntervention,
  setDemandesIntervention,
  rfis,
  setRfis,
  workOrders,
  setWorkOrders,
  machines,
  setMachines,
  currentUser,
  selectedSiteFilter,
  addAuditLog,
  safetyLotoStatuses,
  setSafetyLotoStatuses,
  handleSignBT,
  handleDeleteBT,
}) => {
  const [gmaoSubTab, setGmaoSubTab] = useState<"di" | "ot" | "rfi">("di");

  // Selection states for audit profile
  const [selectedMachineCode, setSelectedMachineCode] = useState<string>("ST7-01");

  // DI creation states
  const [newDiMachine, setNewDiMachine] = useState<string>("");
  const [newDiZone, setNewDiZone] = useState<string>("");
  const [newDiSymptom, setNewDiSymptom] = useState<string>("");
  const [newDiSeverity, setNewDiSeverity] = useState<"critique" | "majeur" | "mineur">("majeur");
  const [newDiUrgency, setNewDiUrgency] = useState<"bloquant" | "urgent" | "normal" | "faible">("normal");

  // conversion states
  const [diToConvert, setDiToConvert] = useState<DemandeInterventionDI | null>(null);
  const [convertTitle, setConvertTitle] = useState<string>("");
  const [convertTech, setConvertTech] = useState<string>("M. El Idrissi");
  const [convertDuration, setConvertDuration] = useState<number>(2);
  const [convertLotoRequired, setConvertLotoRequired] = useState<boolean>(false);
  const [convertPriority, setConvertPriority] = useState<"HAUTE" | "MOYENNE" | "BASSE">("MOYENNE");
  const [convertIsMachineStopped, setConvertIsMachineStopped] = useState<boolean>(true);

  // RFI creation states
  const [rfiTargetWo, setRfiTargetWo] = useState<WorkOrderBT | null>(null);
  const [rfiRootCause, setRfiRootCause] = useState<string>("");
  const [rfiSubSystem, setRfiSubSystem] = useState<string>("HYDRAULIQUE");
  const [rfiComponent, setRfiComponent] = useState<string>("Durite haute pression");
  const [rfiRemedyAction, setRfiRemedyAction] = useState<string>("");
  const [rfiDuration, setRfiDuration] = useState<number>(2);
  const [rfiPartsList, setRfiPartsList] = useState<Array<{ name: string; qty: number; costUSD: number }>>([]);

  // Direct Ticket Creation states (Bypass)
  const [newBtMachine, setNewBtMachine] = useState<string>("");
  const [newBtTitle, setNewBtTitle] = useState<string>("");
  const [newBtCategory, setNewBtCategory] = useState<"HYDRAULIQUE" | "MOTEUR" | "TRANSMISSION" | "FREINAGE" | "ÉLECTRIQUE" | "PNEUMATIQUE" | "SÉCURITÉ">("HYDRAULIQUE");
  const [newBtSeverity, setNewBtSeverity] = useState<"critique" | "majeur" | "mineur">("majeur");

  const siteMachines = machines.filter(m => !selectedSiteFilter || m.siteId === selectedSiteFilter);

  // Set default machine for forms
  React.useEffect(() => {
    if (siteMachines.length > 0) {
      if (!newDiMachine) setNewDiMachine(siteMachines[0].code);
      if (!newBtMachine) setNewBtMachine(siteMachines[0].code);
    }
  }, [siteMachines]);

  // Check if machine is locked
  const isMachineLockedByLoto = (code: string) => {
    return safetyLotoStatuses[code]?.statutLOTO === "ACTIF";
  };

  // Submit DI Form
  const tempHandleCreateDI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiMachine) {
      toast.error("Veuillez sélectionner un équipement !");
      return;
    }
    const diId = `DI-2026-0${demandesIntervention.length + 101}`;
    const newDI: DemandeInterventionDI = {
      id: diId,
      machineCode: newDiMachine,
      siteId: currentUser.siteId || selectedSiteFilter || "SMI",
      zone: newDiZone || "Galerie Principale",
      symptom: newDiSymptom,
      severity: newDiSeverity,
      urgency: newDiUrgency,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name,
      createdByRole: currentUser.role,
      status: "NOUVELLE"
    };

    setDemandesIntervention(prev => [newDI, ...prev]);
    dbService.demandesIntervention.create(newDI)
      .then(() => toast.success(`📊 Demande d'Intervention ${diId} postée en ligne avec succès !`))
      .catch((err) => console.error(err));

    addAuditLog(`Création Demande d'Intervention ${diId} pour ${newDiMachine}`, "WORK_ORDER", diId, undefined, "OUVERT");
    setNewDiSymptom("");
    setNewDiZone("");
  };

  // Reject / Process DI
  const handleUpdateDIStatus = (diId: string, status: "EN_ANALYSE" | "ACCEPTÉE" | "REJETÉE" | "CONVERTIE_OT", comment?: string) => {
    setDemandesIntervention(prev => prev.map(di => {
      if (di.id === diId) return { ...di, status, comment };
      return di;
    }));

    dbService.demandesIntervention.updateStatus(diId, status, comment)
      .then(() => toast.success(`Status de la DI ${diId} modifié aux clients : ${status}`))
      .catch(err => console.error(err));

    addAuditLog(`DI ${diId} passée au statut ${status}`, "WORK_ORDER", diId);
  };

  // Convert DI to OT
  const tempHandleConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diToConvert) return;

    const newBTId = `BT-2026-0${workOrders.length + 101}`;
    const newBT: WorkOrderBT = {
      id: newBTId,
      machineCode: diToConvert.machineCode,
      title: convertTitle || `Intervention suite à DI ${diToConvert.id}: ${diToConvert.symptom}`,
      category: diToConvert.severity === "critique" ? "HYDRAULIQUE" : diToConvert.severity === "majeur" ? "MOTEUR" : "TRANSMISSION",
      severity: diToConvert.severity,
      status: "PLANIFIÉ",
      assignedTech: convertTech,
      creationDate: new Date().toISOString().split('T')[0],
      checklist: [
        { task: `Évaluer diagnostics d'urgence suite à DI #${diToConvert.id}`, done: false },
        { task: "Consignation de sécurité LOTO requise", done: convertLotoRequired },
        { task: "Valider tests de charge post-intervention", done: false }
      ],
      actionsHistory: [
        { 
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16), 
          role: currentUser.role, 
          action: `DI #${diToConvert.id} convertie en OT #${newBTId}`, 
          user: currentUser.name 
        }
      ],
      replacedParts: [],
      siteId: diToConvert.siteId || currentUser.siteId || selectedSiteFilter || "SMI",
      diId: diToConvert.id,
      durationPlannedHours: convertDuration,
      priority: convertPriority,
      isMachineStopped: convertIsMachineStopped,
      lotoRequired: convertLotoRequired,
      notes: `Héritage DI #${diToConvert.id} - Déclarant : ${diToConvert.createdBy} (${diToConvert.createdByRole}).`
    };

    setWorkOrders(prev => [newBT, ...prev]);

    // Update parent DI
    handleUpdateDIStatus(diToConvert.id, "CONVERTIE_OT", `Ref OT: ${newBTId}`);
    dbService.demandesIntervention.updateStatus(diToConvert.id, "CONVERTIE_OT", `Ref OT: ${newBTId}`, newBTId);

    // Create OT in firestore
    dbService.workOrders.create(newBT, newBTId)
      .then(() => toast.success(`💼 Ordre de travail ${newBTId} créé avec flliation !`))
      .catch(err => console.error(err));

    addAuditLog(`DI ${diToConvert.id} convertie en OT ${newBTId}`, "WORK_ORDER", newBTId);
    setDiToConvert(null);
  };

  // Direct OT creation
  const tempHandleCreateBTDirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMachineLockedByLoto(newBtMachine)) {
      toast.error(`🚨 CONSIGNATION LOTO EN COURS : L'engin ${newBtMachine} fait l'objet d'un cadenassage LOTO actif. La création de tout nouveau Bon de Travail additionnel est bloquée.`);
      return;
    }
    if (!newBtTitle) {
      toast.error("Veuillez remplir le titre !");
      return;
    }

    const newBTId = `BT-2026-0${workOrders.length + 101}`;
    const newBT: WorkOrderBT = {
      id: newBTId,
      machineCode: newBtMachine,
      title: newBtTitle,
      category: newBtCategory,
      severity: newBtSeverity,
      status: "OUVERT",
      assignedTech: "M. El Idrissi",
      creationDate: new Date().toISOString().split('T')[0],
      checklist: [
        { task: "Prise en main et test initial de pression", done: false },
        { task: "Vérifier consignation LOTO si requis", done: false }
      ],
      actionsHistory: [
        { 
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16), 
          role: currentUser.role, 
          action: "Création directe du Bon de Travail", 
          user: currentUser.name 
        }
      ],
      replacedParts: [],
      siteId: currentUser.siteId || selectedSiteFilter || "SMI",
      priority: "MOYENNE",
      isMachineStopped: true,
      lotoRequired: newBtSeverity === "critique"
    };

    setWorkOrders(prev => [newBT, ...prev]);
    dbService.workOrders.create(newBT, newBTId)
      .then(() => toast.success(`✅ Bon de Travail Direct ${newBTId} émis en ligne !`))
      .catch((err) => console.error(err));

    addAuditLog(`Création directe de l'OT ${newBTId} pour ${newBtMachine}`, "WORK_ORDER", newBTId);
    setNewBtTitle("");
  };

  // Submit RFI Form
  const tempHandleCreateRFI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfiTargetWo) return;
    if (!rfiRootCause || !rfiRemedyAction) {
      toast.error("Veuillez renseigner la cause racine et l'action corrective !");
      return;
    }

    const rfiId = `RFI-2026-0${rfis.length + 101}`;
    const newRFI: RapportFinInterventionRFI = {
      id: rfiId,
      workOrderId: rfiTargetWo.id,
      machineCode: rfiTargetWo.machineCode,
      rootCause: rfiRootCause,
      subSystem: rfiSubSystem,
      component: rfiComponent,
      remedyAction: rfiRemedyAction,
      replacedParts: rfiPartsList,
      durationRealHours: rfiDuration,
      techValidation: true,
      supervisorValidation: currentUser.role === "RESPONSABLE_MAINTENANCE" || currentUser.role === "ADMIN",
      createdAt: new Date().toISOString(),
      signedBy: currentUser.name,
      siteId: rfiTargetWo.siteId || currentUser.siteId || selectedSiteFilter || "SMI"
    };

    setRfis(prev => [newRFI, ...prev]);

    // Update BT status
    setWorkOrders(prev => prev.map(w => {
      if (w.id === rfiTargetWo.id) {
        return {
          ...w,
          status: "RÉSOLU",
          durationRealHours: rfiDuration,
          replacedParts: rfiPartsList.length > 0 ? rfiPartsList : w.replacedParts,
          notes: `${w.notes || ""}\n[RFI Rédigé] Cause racine: ${rfiRootCause}. Temps réel: ${rfiDuration}h.`
        };
      }
      return w;
    }));

    // Unlock LOTO if needed
    if (rfiTargetWo.machineCode) {
      dbService.lotoLocks.releaseLock(rfiTargetWo.machineCode, {
        lotoReleasedAt: new Date().toISOString(),
        lotoDetails: "",
        siteId: rfiTargetWo.siteId || "SMI"
      });

      setSafetyLotoStatuses(prev => ({
        ...prev,
        [rfiTargetWo.machineCode]: {
          statutLOTO: "INACTIF",
          lotoDetails: ""
        }
      }));
    }

    dbService.rapportsFinIntervention.create(newRFI)
      .then(() => {
        toast.success(`🎉 Rapport de Fin d'Intervention ${rfiId} enregistré ! OT #${rfiTargetWo.id} est RÉSOLU.`);
      })
      .catch((err) => console.error(err));

    addAuditLog(`Rapport Fin d'Intervention RFI ${rfiId} déposé pour OT ${rfiTargetWo.id}`, "SÉCURITÉ", rfiTargetWo.machineCode);
    setRfiTargetWo(null);
    setRfiRootCause("");
    setRfiRemedyAction("");
    setRfiPartsList([]);
    setGmaoSubTab("ot");
  };

  const selectedMachine = machines.find(m => m.code === selectedMachineCode) || machines[0];

  return (
    <div className="space-y-4">
      {/* Sub-tab navigation bar for GMAO workflow */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-sky-950 text-sky-400 font-bold">
            <Wrench className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-xs font-black uppercase text-slate-100 tracking-wider">Cockpit GMAO Industriel</h3>
            <p className="text-[9px] text-slate-400">Chaîne opérationnelle de conformité : DI ➜ OT ➜ RFI</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850">
          <button
            onClick={() => { setGmaoSubTab("di"); setDiToConvert(null); }}
            className={cn(
              "px-3 py-1 rounded text-[10px] font-extrabold uppercase transition-all flex items-center gap-1",
              gmaoSubTab === "di"
                ? "bg-sky-500 text-slate-950 font-black shadow"
                : "text-slate-450 hover:text-slate-200"
            )}
          >
            📋 DI ({demandesIntervention.filter(d => d.status === "NOUVELLE" || d.status === "EN_ANALYSE").length})
          </button>
          <button
            onClick={() => { setGmaoSubTab("ot"); setRfiTargetWo(null); }}
            className={cn(
              "px-3 py-1 rounded text-[10px] font-extrabold uppercase transition-all flex items-center gap-1",
              gmaoSubTab === "ot"
                ? "bg-sky-500 text-slate-950 font-black shadow"
                : "text-slate-450 hover:text-slate-200"
            )}
          >
            ⚙️ OT ({workOrders.filter(w => w.status !== "CLOS" && w.status !== "RÉSOLU").length})
          </button>
          <button
            onClick={() => setGmaoSubTab("rfi")}
            className={cn(
              "px-3 py-1 rounded text-[10px] font-extrabold uppercase transition-all flex items-center gap-1",
              gmaoSubTab === "rfi"
                ? "bg-sky-500 text-slate-950 font-black shadow"
                : "text-slate-450 hover:text-slate-200"
            )}
          >
            📑 RFI & Historiques ({rfis.length})
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SUBTAB 1 : DEMANDES D'INTERVENTION (DI) */}
      {/* ==================================================================== */}
      {gmaoSubTab === "di" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fadeIn">
          {/* DI Formulation */}
          <div className="space-y-4">
            <Card className="bg-slate-900 border-slate-800 text-slate-100">
              <CardHeader className="p-3 border-b border-slate-855">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-sky-400 flex items-center justify-between">
                  <span>Rédiger une Demande (DI)</span>
                  <Badge className="bg-sky-950 text-sky-400 text-[8px] uppercase">Terrain Exploitation</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <form onSubmit={tempHandleCreateDI} className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400 block text-[9px]">ÉQUIPEMENT COCERNÉ</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 h-9 rounded px-2 text-xs"
                      value={newDiMachine}
                      onChange={(e) => setNewDiMachine(e.target.value)}
                    >
                      <option value="">-- Choisir un engin --</option>
                      {siteMachines.map(m => (
                        <option key={m.code} value={m.code}>{m.code} - {m.type} ({m.status})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 block text-[9px]">SITE & ZONE MINE</label>
                    <Input
                      placeholder="ex: Galerie Nord, Niveau -150m"
                      className="bg-slate-955 border-slate-800 text-slate-200 text-xs"
                      value={newDiZone}
                      onChange={(e) => setNewDiZone(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-slate-400 block text-[9px]">GRAVITÉ DU PROBLÈME</label>
                      <select
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 h-9 rounded px-2 text-xs"
                        value={newDiSeverity}
                        onChange={(e) => setNewDiSeverity(e.target.value as any)}
                      >
                        <option value="mineur">🟢 Mineur</option>
                        <option value="majeur">🟡 Majeur</option>
                        <option value="critique">🔴 Critique (Immo)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 block text-[9px]">DEGRÉ D'URGENCE</label>
                      <select
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 h-9 rounded px-2 text-xs"
                        value={newDiUrgency}
                        onChange={(e) => setNewDiUrgency(e.target.value as any)}
                      >
                        <option value="faible">Faible</option>
                        <option value="normal">Normal</option>
                        <option value="urgent">Urgent</option>
                        <option value="bloquant">🚨 Bloquant !</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 block text-[9px]">SYMPTÔMES CONSTATÉS</label>
                    <textarea
                      placeholder="Décrivez précisément les observations terrain..."
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 text-xs rounded"
                      value={newDiSymptom}
                      required
                      onChange={(e) => setNewDiSymptom(e.target.value)}
                    />
                  </div>

                  <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-850 space-y-1">
                    <span className="text-[8px] uppercase text-slate-500 font-bold block">Séquences rapides de pannes types :</span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        "Bruit métallique tambour",
                        "Fuite d'huile hydraulique",
                        "Surchauffe moteur en rampe",
                        "Perte de puissance translation",
                        "Pression freinage critique"
                      ].map(sym => (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => setNewDiSymptom(sym)}
                          className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded"
                        >
                          + {sym}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-10 bg-sky-500 hover:bg-sky-600 text-slate-950 font-black uppercase text-[10px]">
                    📊 Émettre la Demande d'Intervention
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* DI Datatable */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-slate-900 border-slate-800 text-slate-100">
              <CardHeader className="p-3 border-b border-slate-850 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xs font-black uppercase text-slate-100">Registre Canalisé des DI</CardTitle>
                  <CardDescription className="text-[9px] text-slate-405">Trace des anomalies déclarées en continu</CardDescription>
                </div>
                <Badge className="bg-slate-950 text-slate-350 border border-slate-800 font-mono text-[9px]">
                  {demandesIntervention.filter(di => !selectedSiteFilter || di.siteId === selectedSiteFilter).length} DI(s)
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <Table className="text-xs">
                  <TableHeader className="bg-slate-950/40">
                    <TableRow className="border-slate-850">
                      <TableHead className="text-[9px] w-16">RÉF</TableHead>
                      <TableHead className="text-[9px] w-20">ENGIN</TableHead>
                      <TableHead className="text-[9px]">SYMPTÔMES / ZONE</TableHead>
                      <TableHead className="text-[9px] w-24">CRITICITÉ</TableHead>
                      <TableHead className="text-[9px] w-20">STATUT</TableHead>
                      <TableHead className="text-[9px] text-right w-24">ACTION</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {demandesIntervention
                      .filter(di => !selectedSiteFilter || di.siteId === selectedSiteFilter)
                      .map(di => {
                        const isNew = di.status === "NOUVELLE" || di.status === "EN_ANALYSE";
                        return (
                          <TableRow key={di.id} className="border-slate-850 hover:bg-slate-950/10">
                            <TableCell className="font-mono text-[10px] text-slate-400">{di.id}</TableCell>
                            <TableCell>
                              <div className="font-bold text-sky-400">{di.machineCode}</div>
                              <span className="text-[8px] text-slate-500 font-mono italic block truncate max-w-[80px]">{di.zone}</span>
                            </TableCell>
                            <TableCell>
                              <p className="line-clamp-2 text-[10.5px] text-slate-200">{di.symptom}</p>
                              <div className="text-[8.5px] text-slate-500 mt-1">
                                Par: <strong>{di.createdBy}</strong> ({di.createdByRole}) • {new Date(di.createdAt).toLocaleString()}
                              </div>
                              {di.comment && (
                                <div className="text-[9.5px] text-amber-500 bg-slate-950/70 p-1.5 rounded border border-slate-850 mt-1">
                                  💬 Note: {di.comment}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Badge className={cn(
                                  "text-[8px] uppercase px-1 py-0",
                                  di.severity === "critique" ? "bg-red-950 text-red-400" :
                                  di.severity === "majeur" ? "bg-amber-950 text-amber-400" : "bg-emerald-950 text-emerald-400"
                                )}>
                                  {di.severity}
                                </Badge>
                                <span className="block text-[8px] text-slate-500">{di.urgency}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={cn(
                                "text-[9px] font-mono",
                                di.status === "NOUVELLE" ? "bg-sky-950 text-sky-455 border border-sky-850" :
                                di.status === "EN_ANALYSE" ? "bg-amber-900/50 text-amber-400 border border-amber-800" :
                                di.status === "ACCEPTÉE" ? "bg-emerald-950 text-emerald-400" :
                                di.status === "REJETÉE" ? "bg-red-950 text-red-500 border border-red-900" : "bg-slate-950 text-slate-450"
                              )}>
                                {di.status.replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {isNew && (
                                <div className="flex flex-col gap-1 items-end">
                                  <Button
                                    size="xs"
                                    onClick={() => {
                                      setDiToConvert(di);
                                      setConvertTitle(`Intervention suite à anomalie ${di.id}: ${di.symptom}`);
                                      setConvertLotoRequired(di.severity === "critique");
                                    }}
                                    className="bg-emerald-500 text-slate-950 hover:bg-emerald-600 font-extrabold text-[9px] h-6 px-2 w-full"
                                  >
                                    TRAITER
                                  </Button>
                                  <div className="flex gap-1 w-full text-[9px]">
                                    {di.status === "NOUVELLE" && (
                                      <button
                                        onClick={() => handleUpdateDIStatus(di.id, "EN_ANALYSE")}
                                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-1 py-0.5 rounded flex-1 h-5 text-center text-[8px] uppercase"
                                      >
                                        Insc.
                                      </button>
                                    )}
                                    <button
                                      onClick={() => {
                                        const r = prompt("Raison d'annulation / rejet :");
                                        if (r) handleUpdateDIStatus(di.id, "REJETÉE", r);
                                      }}
                                      className="bg-red-950 hover:bg-red-900 text-red-400 px-1 py-0.5 rounded flex-1 h-5 text-center text-[8px] uppercase font-bold"
                                    >
                                      Rej.
                                    </button>
                                  </div>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    {demandesIntervention.filter(di => !selectedSiteFilter || di.siteId === selectedSiteFilter).length === 0 && (
                      <TableRow>
                        <TCell colSpan={6} className="text-center py-6 text-slate-500">
                          Aucun ticket de demande déclaré sur ce site.
                        </TCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* diToConvert Visual Wizard Wrapper */}
            {diToConvert && (
              <Card className="bg-slate-900 border-sky-400 text-slate-100 border-2">
                <CardHeader className="p-3 border-b border-slate-850 bg-slate-950/40 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xs font-black uppercase text-sky-400 flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-amber-400 animate-pulse" />
                      Génération Filiation : Associer la DI au nouvel OT
                    </CardTitle>
                    <CardDescription className="text-[9px] text-slate-300">
                      Héritage automatique des variables terrain de la source Réf: <span className="font-mono text-white font-bold">{diToConvert.id}</span>
                    </CardDescription>
                  </div>
                  <Button size="xs" variant="ghost" onClick={() => setDiToConvert(null)} className="text-slate-400 h-6">Fermer</Button>
                </CardHeader>
                <CardContent className="p-3">
                  <form onSubmit={tempHandleConvert} className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[9px]">ENGIN DIRECT</label>
                        <Input value={diToConvert.machineCode} disabled className="bg-slate-950 border-slate-850 text-sky-405 font-bold" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[9px]">AFFECTATION MÉCANICIEN</label>
                        <select
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 h-9 rounded px-2"
                          value={convertTech}
                          onChange={(e) => setConvertTech(e.target.value)}
                        >
                          <option value="M. El Idrissi">M. El Idrissi (Généraliste)</option>
                          <option value="Y. Benjelloun">Y. Benjelloun (Foreuse Jumbo)</option>
                          <option value="R. Chahid">R. Chahid (Systèmes HT)</option>
                          <option value="T. Saidi">T. Saidi (Hydraulicien Fond)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[9px]">priority WORKFLOW</label>
                        <select
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 h-9 rounded px-2"
                          value={convertPriority}
                          onChange={(e) => setConvertPriority(e.target.value as any)}
                        >
                          <option value="HAUTE">🔴 HAUTE priority (24h)</option>
                          <option value="MOYENNE">🟡 MOYENNE priority (72h)</option>
                          <option value="BASSE">🟢 BASSE priority (1 sem)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 text-[9px]">LIBELLÉ DIRECTIVE DE TRAVAIL (OT)</label>
                      <Input
                        value={convertTitle}
                        onChange={(e) => setConvertTitle(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-slate-100"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[9px]">TEMPS PRÉVU ALLOUÉ (HEURES)</label>
                        <Input
                          type="number"
                          min={0.5}
                          step={0.5}
                          value={convertDuration}
                          onChange={(e) => setConvertDuration(parseFloat(e.target.value) || 2)}
                          className="bg-slate-955 border-slate-800 text-slate-100 font-mono"
                        />
                      </div>

                      <div className="space-y-1 flex flex-col justify-center bg-slate-950/25 p-1 px-2 rounded border border-slate-850/40">
                        <label className="text-[9px] text-slate-400 mb-1 font-bold flex items-center gap-1">
                          <Lock className="h-3 w-3 text-red-500" /> CONSIGNATION LOTO ?
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={convertLotoRequired}
                            onChange={(e) => setConvertLotoRequired(e.target.checked)}
                            className="h-4 w-4 rounded bg-slate-950 accent-amber-500"
                            id="chk_convert_loto_2"
                          />
                          <label htmlFor="chk_convert_loto_2" className="text-[9.5px] cursor-pointer text-slate-300">
                            Cadenassage requis
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1 flex flex-col justify-center bg-slate-950/25 p-1 px-2 rounded border border-slate-850/40">
                        <label className="text-[9px] text-slate-400 mb-1 font-bold flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-amber-500" /> ARRÊT MACHINE EN PRODUCTION ?
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={convertIsMachineStopped}
                            onChange={(e) => setConvertIsMachineStopped(e.target.checked)}
                            className="h-4 w-4 rounded bg-slate-950 accent-emerald-500"
                            id="chk_convert_stop_2"
                          />
                          <label htmlFor="chk_convert_stop_2" className="text-[9.5px] cursor-pointer text-slate-300">
                            Arrêt d'exploitation
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button type="submit" className="flex-1 bg-emerald-500 text-slate-950 hover:bg-emerald-600 font-black text-[10px] uppercase h-10">
                        ⚡ Valider Filiation & Créer l'OT
                      </Button>
                      <Button variant="outline" type="button" onClick={() => setDiToConvert(null)} className="h-10 border-slate-800 text-slate-400">
                        Annuler
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUBTAB 2 : ORDRES DE TRAVAIL (OT) */}
      {/* ==================================================================== */}
      {gmaoSubTab === "ot" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fadeIn">
          {/* Direct OT Emission */}
          <div className="space-y-4">
            <Card className="bg-slate-900 border-slate-800 text-slate-100">
              <CardHeader className="p-3 border-b border-slate-850">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                  <span>Émettre un Bon Direct (OT)</span>
                  <Badge className="bg-emerald-950 text-emerald-450 text-[8px]">Voie Rapide</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <form onSubmit={tempHandleCreateBTDirect} className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-405 block text-[9px]">SÉLECTION ENGIN</label>
                    <select
                      className="w-full bg-slate-955 border border-slate-800 text-slate-100 h-9 rounded px-2 text-xs"
                      value={newBtMachine}
                      onChange={(e) => setNewBtMachine(e.target.value)}
                    >
                      {siteMachines.map(m => (
                        <option key={m.code} value={m.code}>{m.code} - {m.type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-slate-400 block text-[9px]">GRAVITÉ ENGIN</label>
                      <select
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 h-9 rounded px-2"
                        value={newBtSeverity}
                        onChange={(e) => setNewBtSeverity(e.target.value as any)}
                      >
                        <option value="mineur">Vert (Mineur)</option>
                        <option value="majeur">Jaune (Majeur)</option>
                        <option value="critique">Rouge (Critique)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 block text-[9px]">SYSTÈME DIRECTEMENT VISÉ</label>
                      <select
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 h-9 rounded px-2"
                        value={newBtCategory}
                        onChange={(e) => setNewBtCategory(e.target.value as any)}
                      >
                        <option value="HYDRAULIQUE">HYDRAULIQUE</option>
                        <option value="MOTEUR">MOTEUR</option>
                        <option value="TRANSMISSION">TRANSMISSION</option>
                        <option value="FREINAGE">FREINAGE</option>
                        <option value="ÉLECTRIQUE">ÉLECTRIQUE</option>
                        <option value="PNEUMATIQUE">PNEUMATIQUE</option>
                        <option value="SÉCURITÉ">SÉCURITÉ</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-405 block text-[9px]">INTITULÉ DE L'MISSION DE TRAVAIL</label>
                    <Input
                      placeholder="ex: Remplacement couronne et étanchéité raccord..."
                      className="bg-slate-950 border-slate-800 text-slate-100 h-9 text-xs"
                      value={newBtTitle}
                      onChange={(e) => setNewBtTitle(e.target.value)}
                    />
                  </div>

                  <Button type="submit" className="w-full h-10 bg-emerald-500 hover:bg-emerald-600 text-slate-955 font-black uppercase text-[10px]">
                    ⚙️ Ouvrir la Fiche OT Directement
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* RFI Form Modal */}
            {rfiTargetWo && (
              <Card className="bg-slate-900 border-amber-500 text-slate-100 border-2">
                <CardHeader className="p-3 border-b border-slate-850 bg-slate-955/40 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xs font-black uppercase text-amber-400 flex items-center gap-1">
                      🖊️ Rédiger le Rapport RFI Obligatoire
                    </CardTitle>
                    <CardDescription className="text-[9px] text-slate-350">
                      Rensiegnement de traçabilité avant clôture sur l'OT: <span className="font-mono text-white">{rfiTargetWo.id}</span>
                    </CardDescription>
                  </div>
                  <Button size="xs" variant="ghost" onClick={() => setRfiTargetWo(null)} className="h-6 text-[10px] text-slate-400">X</Button>
                </CardHeader>
                <CardContent className="p-3">
                  <form onSubmit={tempHandleCreateRFI} className="space-y-3.5 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[9px] block">PROBLÈM ET CAUSE RACINE CONSTATÉ (ANALYSE FACTUELLE)</label>
                      <textarea
                        placeholder="ex: Fissuration locale du collecteur d'échappement par fatigue thermique répétitive..."
                        rows={2}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 text-xs rounded"
                        value={rfiRootCause}
                        required
                        onChange={(e) => setRfiRootCause(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[9px] block">ORGAN CRITIQUE</label>
                        <select
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 h-9 rounded px-2"
                          value={rfiSubSystem}
                          onChange={(e) => setRfiSubSystem(e.target.value)}
                        >
                          <option value="HYDRAULIQUE">HYDRAULIQUE</option>
                          <option value="MOTEUR">MOTEUR</option>
                          <option value="TRANSMISSION">TRANSMISSION</option>
                          <option value="FREINAGE">FREINAGE</option>
                          <option value="ÉLECTRIQUE">ÉLECTRIQUE</option>
                          <option value="STRUCTURE">STRUCTURE métallique</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[9px] block">COMPOSANT REMPLACÉ</label>
                        <Input
                          value={rfiComponent}
                          onChange={(e) => setRfiComponent(e.target.value)}
                          className="bg-slate-955 border-slate-800 text-slate-100"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 text-[9px] block">ACTIONS CORRECTIVES MENÉES (ACTS DE RÉSOLUTIONS)</label>
                      <textarea
                        placeholder="ex: Dépose du bloc collecteur fissuré, meulage intérieur, soudage de renfort inox et pose joint neuf..."
                        rows={2}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 text-xs rounded"
                        value={rfiRemedyAction}
                        required
                        onChange={(e) => setRfiRemedyAction(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[9px] block">DURÉE RÉELLE (HEURES)</label>
                        <Input
                          type="number"
                          min={0.5}
                          step={0.5}
                          value={rfiDuration}
                          onChange={(e) => setRfiDuration(parseFloat(e.target.value) || 2)}
                          className="bg-slate-950 border-slate-800 text-slate-100 text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1 flex flex-col justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 border-slate-800 hover:text-white text-[9.5px]"
                          onClick={() => {
                            setRfiPartsList(prev => [...prev, { name: "Kit de joints transmission standard", qty: 1, costUSD: 85 }]);
                            toast.success("Kit de pièce annexé au rapport.");
                          }}
                        >
                          + Annexer Pièce
                        </Button>
                      </div>
                    </div>

                    {rfiPartsList.length > 0 && (
                      <div className="bg-slate-950/80 p-2 rounded border border-slate-850 space-y-1">
                        <span className="text-[8px] uppercase text-slate-500 font-bold block">Pièces installées :</span>
                        {rfiPartsList.map((p, ix) => (
                          <div key={ix} className="text-[9.5px] font-mono text-emerald-400 flex items-center justify-between">
                            <span>{p.name} (x{p.qty})</span>
                            <span>{p.costUSD} USD</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button type="submit" className="w-full h-10 bg-amber-500 hover:bg-amber-600 text-slate-955 font-black uppercase text-[10px]">
                      💾 Rédiger le RFI & Résoudre l'OT
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Active OTs list */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-slate-900 border-slate-800 text-slate-100">
              <CardHeader className="p-3 border-b border-slate-850 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xs font-black uppercase text-slate-100">Liste Active des Bons de Travail (OT)</CardTitle>
                  <CardDescription className="text-[9px] text-slate-400">Trésor de données techniques critiques du fond</CardDescription>
                </div>
                <Badge className="bg-slate-950 border border-slate-800 font-mono text-slate-350 text-[10px]">
                  {workOrders.filter(w => w.status !== "CLOS" && (!selectedSiteFilter || w.siteId === selectedSiteFilter)).length} OT(s) actif(s)
                </Badge>
              </CardHeader>
              <CardContent className="p-3 space-y-3.5 max-h-[720px] overflow-y-auto">
                {workOrders
                  .filter(wo => !selectedSiteFilter || wo.siteId === selectedSiteFilter)
                  .map(wo => {
                    const isPassed = wo.status === "CLOS";
                    const isRes = wo.status === "RÉSOLU";
                    const linkedRfi = rfis.find(r => r.workOrderId === wo.id);

                    return (
                      <Card key={wo.id} className={cn(
                        "bg-slate-950/70 border-slate-850/80 hover:border-slate-800 transition-all",
                        isPassed && "opacity-50 hover:opacity-100 bg-slate-955/20 border-slate-900",
                        isRes && "border-slate-800/80 bg-slate-950/40"
                      )}>
                        <CardContent className="p-3 space-y-2 text-xs">
                          {/* Tags block */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 flex-wrap">
                              <Badge className={cn(
                                "font-mono font-black text-[10px]",
                                isPassed ? "bg-slate-800 text-slate-400" :
                                isRes ? "bg-emerald-950 text-emerald-400 border border-emerald-900" : "bg-sky-950 text-sky-400 border border-sky-800"
                              )}>
                                {wo.id}
                              </Badge>
                              {wo.diId && (
                                <Badge variant="outline" className="text-[8.5px] font-mono text-zinc-400 border-dashed">
                                  Lien DI: {wo.diId}
                                </Badge>
                              )}
                              {wo.priority === "HAUTE" && (
                                <span className="bg-red-955 text-red-400 text-[8px] font-mono px-1.5 rounded uppercase font-extrabold">HAUTE</span>
                              )}
                              {wo.lotoRequired && (
                                <Badge className="bg-amber-950 text-amber-500 text-[8px] flex items-center gap-0.5">
                                  <Lock className="h-2 w-2" /> LOTO Requis
                                </Badge>
                              )}
                              {wo.isMachineStopped && (
                                <Badge className="bg-rose-950 text-rose-500 text-[8px] flex items-center gap-0.5">
                                  <AlertTriangle className="h-2 w-2" /> Engin Immo.
                                </Badge>
                              )}
                            </div>
                            <Badge className={cn(
                              "text-[9px] font-mono",
                              wo.status === "OUVERT" ? "bg-sky-950 text-sky-450" :
                              wo.status === "PLANIFIÉ" ? "bg-indigo-950 text-indigo-400" :
                              wo.status === "EN_COURS" ? "bg-amber-950 text-amber-500 animate-pulse" :
                              wo.status === "RÉSOLU" ? "bg-emerald-950 text-emerald-400" : "bg-slate-900 text-slate-500"
                            )}>
                              {wo.status}
                            </Badge>
                          </div>

                          {/* Detail titles */}
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-bold text-slate-100 text-[12.5px]">{wo.title}</h4>
                              <div className="text-[10px] text-slate-405 flex items-center gap-2 mt-0.5">
                                <span>Matériel : <strong className="text-sky-455 font-mono uppercase">{wo.machineCode}</strong></span>
                                <span>&bull;</span>
                                <span>Cat: <strong>{wo.category}</strong></span>
                                <span>&bull;</span>
                                <span>Par: <span className="text-slate-205">{wo.assignedTech}</span></span>
                              </div>
                            </div>
                            <div className="text-right font-mono text-[10px] text-slate-400 whitespace-nowrap">
                              <span>Planifié: {wo.durationPlannedHours || 2}h</span>
                              {wo.durationRealHours && <span className="block text-emerald-450 font-bold">Réel: {wo.durationRealHours}h</span>}
                            </div>
                          </div>

                          {wo.notes && (
                            <p className="text-[9.5px] text-zinc-400 bg-slate-955/40 p-2 rounded border border-slate-900 border-dashed">
                              {wo.notes}
                            </p>
                          )}

                          {/* Checklist */}
                          {wo.checklist && wo.checklist.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-1.5 bg-slate-950/35 rounded border border-slate-900">
                              {wo.checklist.map((c, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  disabled={isPassed}
                                  onClick={() => {
                                    setWorkOrders(prev => prev.map(w => {
                                      if (w.id === wo.id) {
                                        const cl = [...w.checklist!];
                                        cl[i] = { ...cl[i], done: !cl[i].done };
                                        return { ...w, checklist: cl };
                                      }
                                      return w;
                                    }));
                                    toast.info("Checklist actualisée !");
                                  }}
                                  className={cn(
                                    "flex items-center gap-1 px-1.5 py-1 text-[9px] border rounded text-left",
                                    c.done ? "bg-emerald-950/40 border-emerald-900/60 text-emerald-400" : "bg-slate-900/40 border-slate-850 text-slate-400 hover:text-slate-200"
                                  )}
                                >
                                  <CheckCircle2 className={cn("h-3 w-3", c.done ? "text-emerald-400" : "text-slate-600")} />
                                  <span className="truncate">{c.task}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Controls */}
                          <div className="flex items-center justify-between border-t border-slate-850/50 pt-2 mt-2">
                            <span className="text-[9px] text-slate-500 font-mono">Date: {wo.creationDate}</span>
                            <div className="flex items-center gap-1.5">
                              {wo.status === "PLANIFIÉ" && (
                                <Button
                                  size="xs"
                                  onClick={() => {
                                    setWorkOrders(prev => prev.map(w => {
                                      if (w.id === wo.id) return { ...w, status: "EN_COURS" };
                                      return w;
                                    }));
                                    addAuditLog(`Prise en main active OT ${wo.id}`, "WORK_ORDER", wo.id);
                                    toast.success("OT basculé EN COURS.");
                                  }}
                                  className="bg-indigo-650 text-white hover:bg-indigo-700 font-bold text-[9px] h-6 px-2"
                                >
                                  DÉMARRER
                                </Button>
                              )}

                              {wo.status === "EN_COURS" && (
                                <Button
                                  size="xs"
                                  onClick={() => {
                                    setRfiTargetWo(wo);
                                    setRfiRootCause("");
                                    setRfiRemedyAction("");
                                    setRfiDuration(wo.durationPlannedHours || 2);
                                  }}
                                  className="bg-amber-550 hover:bg-amber-600 text-slate-955 font-black text-[9px] h-6 px-2.5"
                                >
                                  RÉDIGER RFI
                                </Button>
                              )}

                              {isRes && (
                                <span className="bg-emerald-950 text-emerald-405 border border-emerald-900 px-2 py-0.5 rounded text-[9px] font-bold font-mono">
                                  RFI OK ({linkedRfi?.id})
                                </span>
                              )}

                              {!isPassed && (
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() => handleSignBT(wo.id)}
                                  className="border-slate-800 text-slate-350 text-[9px] h-6 px-2 hover:text-white"
                                >
                                  CLORE OT (VISA)
                                </Button>
                              )}

                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => handleDeleteBT(wo.id)}
                                className="text-slate-550 hover:text-slate-300 h-6 px-1.5 ml-1"
                              >
                                <Trash className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                        </CardContent>
                      </Card>
                    );
                  })}
                {workOrders.filter(wo => !selectedSiteFilter || wo.siteId === selectedSiteFilter).length === 0 && (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    Aucun ordre de travail actif pour ce filtre.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUBTAB 3 : RFIS ET PROFILS HISTORIQUES MACHINE */}
      {/* ==================================================================== */}
      {gmaoSubTab === "rfi" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fadeIn">
          
          {/* Machine Profile Hub */}
          <div className="space-y-4">
            <Card className="bg-slate-900 border-slate-800 text-slate-100">
              <CardHeader className="p-3 border-b border-slate-850">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-sky-400">
                  Profil de Fiabilité & Diagnostics
                </CardTitle>
                <CardDescription className="text-[9px] text-slate-400">
                  Calculateur automatique MTBF et MTTR (Historique Centralisé et Fiches)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 space-y-3 pb-4">
                <div className="space-y-1 bg-slate-950 p-2 rounded border border-slate-850">
                  <span className="text-[8px] tracking-wider uppercase text-slate-500 font-bold block">ENGIN AUDITÉ</span>
                  <select
                    className="w-full bg-slate-900 border border-slate-800 text-sky-405 font-mono text-xs font-bold uppercase h-8 px-2"
                    value={selectedMachineCode}
                    onChange={(e) => setSelectedMachineCode(e.target.value)}
                  >
                    {siteMachines.map(m => (
                      <option key={m.code} value={m.code}>{m.code} - {m.type}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-950 border border-slate-850 rounded p-2 text-center text-xs">
                    <span className="text-[8px] text-zinc-500 uppercase block">MTTR (Temps de Répar.)</span>
                    <span className="text-lg font-black text-rose-450 block font-mono mt-0.5">
                      {(() => {
                        const mRfi = rfis.filter(r => r.machineCode === selectedMachineCode);
                        if (mRfi.length === 0) return "1.5 h";
                        const sum = mRfi.reduce((acc, r) => acc + r.durationRealHours, 0);
                        return `${(sum / mRfi.length).toFixed(1)} h`;
                      })()}
                    </span>
                    <span className="text-[7.5px] text-slate-500 block">Indice de maintenance</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-850 rounded p-2 text-center text-xs">
                    <span className="text-[8px] text-zinc-500 uppercase block">MTBF Est. (Dispo.)</span>
                    <span className="text-lg font-black text-emerald-455 block font-mono mt-0.5">
                      {(() => {
                        const mDi = demandesIntervention.filter(d => d.machineCode === selectedMachineCode);
                        if (mDi.length <= 1) return "15.0 j";
                        return "11.2 j";
                      })()}
                    </span>
                    <span className="text-[7.5px] text-slate-500 block">Temps moyen dispo.</span>
                  </div>
                </div>

                {/* Subsystem graph */}
                <div className="bg-slate-950/40 p-2.5 rounded border border-slate-850 space-y-2">
                  <span className="text-[9px] uppercase text-zinc-400 font-bold block">Causes de défaillance (Registre Subsystemes) :</span>
                  <div className="space-y-1.5 text-[10px]">
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-slate-400 text-[9px]">
                        <span>Transmissions - Hydraulique</span>
                        <span className="font-mono text-slate-200 font-bold">{rfis.filter(r => r.subSystem === "HYDRAULIQUE").length}</span>
                      </div>
                      <Progress value={60} className="h-1 bg-slate-900" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-slate-400 text-[9px]">
                        <span>Moteurs - Propulsion</span>
                        <span className="font-mono text-slate-200 font-bold">{rfis.filter(r => r.subSystem === "MOTEUR").length}</span>
                      </div>
                      <Progress value={25} className="h-1 bg-slate-900" />
                    </div>
                  </div>
                </div>

                {/* Timeline for audited machine */}
                <div className="space-y-2.5">
                  <span className="text-[9.5px] text-slate-100 font-bold uppercase tracking-wider block">Journal de Filiation Élevé :</span>
                  <div className="border-l border-slate-800 pl-3 space-y-3.5 max-h-[280px] overflow-y-auto font-mono text-[9px]">
                    {demandesIntervention
                      .filter(d => d.machineCode === selectedMachineCode)
                      .map(d => (
                        <div key={d.id} className="relative space-y-0.5">
                          <span className="absolute -left-[16.5px] top-1.5 h-1.5 w-1.5 rounded-full bg-sky-500" />
                          <div className="text-sky-400 font-bold flex justify-between">
                            <span>📋 DI OUVERTE : {d.id}</span>
                            <span className="text-[8px] text-slate-500">{new Date(d.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-350 italic">"{d.symptom}"</p>
                          <span className="text-[8px] text-slate-500">Par: {d.createdBy} &bull; Statut final: {d.status}</span>
                        </div>
                      ))}

                    {workOrders
                      .filter(w => w.machineCode === selectedMachineCode)
                      .map(w => (
                        <div key={w.id} className="relative space-y-0.5">
                          <span className="absolute -left-[16.5px] top-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                          <div className="text-indigo-400 font-bold flex justify-between">
                            <span>⚙️ OT OUVERT : {w.id}</span>
                            <span className="text-[8px] text-slate-500">{w.creationDate}</span>
                          </div>
                          <p className="text-slate-200">{w.title}</p>
                          <span className="text-[8px] text-slate-500">Affecté: {w.assignedTech} &bull; État: {w.status}</span>
                        </div>
                      ))}

                    {rfis
                      .filter(r => r.machineCode === selectedMachineCode)
                      .map(r => (
                        <div key={r.id} className="relative space-y-0.5">
                          <span className="absolute -left-[16.5px] top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <div className="text-emerald-450 font-black flex justify-between">
                            <span>📑 RFI ARCHIVÉ : {r.id}</span>
                            <span className="text-[8px] text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-300">Cause: {r.rootCause}</p>
                          <p className="text-slate-400">Actions: {r.remedyAction}</p>
                        </div>
                      ))}

                    {demandesIntervention.filter(d => d.machineCode === selectedMachineCode).length === 0 &&
                     workOrders.filter(w => w.machineCode === selectedMachineCode).length === 0 &&
                     rfis.filter(r => r.machineCode === selectedMachineCode).length === 0 && (
                      <div className="text-[10px] text-slate-550 italic text-center py-4">
                        Aucun antécédent répertorié pour {selectedMachineCode}.
                      </div>
                    )}
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* RFIs log sheet */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-slate-900 border-slate-800 text-slate-100">
              <CardHeader className="p-3 border-b border-slate-850 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xs font-black uppercase text-slate-100">Registre des RFI Enregistrés</CardTitle>
                  <CardDescription className="text-[9px] text-slate-400">Fiches réglementaires et validations officielles</CardDescription>
                </div>
                <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 font-mono text-[9px]">
                  {rfis.filter(r => !selectedSiteFilter || r.siteId === selectedSiteFilter).length} rapports
                </Badge>
              </CardHeader>
              <CardContent className="p-3 space-y-3">
                {rfis
                  .filter(r => !selectedSiteFilter || r.siteId === selectedSiteFilter)
                  .map(r => (
                    <Card key={r.id} className="bg-slate-950 border-slate-850">
                      <CardContent className="p-3 text-xs space-y-2.5">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1 flex-wrap">
                            <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 font-mono text-[10px] font-bold">
                              {r.id}
                            </Badge>
                            <span className="text-slate-500 text-[8.5px] font-mono bg-slate-900 px-1 border border-slate-855 rounded">
                              OT parent: {r.workOrderId}
                            </span>
                            <Badge variant="outline" className="text-sky-400 uppercase font-mono text-[9px]">
                              {r.machineCode}
                            </Badge>
                            <span className="text-slate-400 text-[9px] font-mono bg-slate-900 px-1.5 rounded">
                              {r.subSystem}
                            </span>
                          </div>
                          <span className="text-slate-500 text-[9px] font-mono">{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-900/50 p-2 border border-slate-850 rounded">
                          <div>
                            <span className="text-[8px] text-rose-400 font-bold block uppercase">Cause :</span>
                            <p className="italic text-slate-300">"{r.rootCause}"</p>
                          </div>
                          <div>
                            <span className="text-[8px] text-emerald-450 font-bold block uppercase">Actions corrective :</span>
                            <p className="text-slate-200 font-bold">{r.remedyAction}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between flex-wrap text-[10px] text-slate-455">
                          <span>Composant : <strong className="text-slate-200">{r.component}</strong></span>
                          <span>Durée d'intervention : <strong className="text-slate-200 font-mono">{r.durationRealHours}h</strong></span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[8.5px] text-slate-500">
                          <span>Émetteur : {r.siteId}</span>
                          <span className="text-emerald-500 font-black uppercase">
                            🖋️ Signature Certifiée : {r.signedBy}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                {rfis.filter(r => !selectedSiteFilter || r.siteId === selectedSiteFilter).length === 0 && (
                  <div className="text-center py-10 text-slate-550 text-xs">
                    Aucun rapport rédigé sur ce filtre de mine.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      )}

    </div>
  );
};
