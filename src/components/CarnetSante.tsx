import * as React from "react";
import { 
  ClipboardList, 
  Clock, 
  Wrench, 
  Droplet, 
  AlertTriangle, 
  Calendar, 
  User, 
  Info, 
  Cpu, 
  FileText, 
  Hammer,
  Search,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import { useAuthStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HydrominesLogo } from "./auth/HydrominesLogo";

interface CarnetSanteProps {
  enginId?: string | null;     // ID pré-sélectionné si arrivée depuis une card
  allEngins: any[];            // Liste complète des engins depuis Firestore
}

export function CarnetSante({ enginId, allEngins }: CarnetSanteProps) {
  const { activeSite, user } = useAuthStore();

  // Load Firestore collections
  const { data: rawWorkorders } = useCollection<any>("workorders");
  const { data: rawMaintenances } = useCollection<any>("maintenances");
  const { data: rawPannes } = useCollection<any>("pannes");
  const { data: rawPneus } = useCollection<any>("pneus");

  // State to track selected engine
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = React.useState<"resume" | "workorders" | "pm" | "pannes" | "pieces" | "pneus">("resume");

  // Keep engins sorted by site
  const sortedEngins = React.useMemo(() => {
    return [...(allEngins || [])].sort((a, b) => {
      const siteA = (a.site || "").toUpperCase();
      const siteB = (b.site || "").toUpperCase();
      if (siteA < siteB) return -1;
      if (siteA > siteB) return 1;
      const matA = (a.matricule || "").toUpperCase();
      const matB = (b.matricule || "").toUpperCase();
      return matA.localeCompare(matB);
    });
  }, [allEngins]);

  // Synchronize with enginId prop
  React.useEffect(() => {
    if (enginId) {
      setSelectedId(enginId);
    } else if (sortedEngins.length > 0 && !selectedId) {
      const firstEngin = sortedEngins[0];
      setSelectedId(firstEngin.id || firstEngin.matricule);
    }
  }, [enginId, sortedEngins]);

  // Handle case where allEngins loaded but selectedId is still unset
  React.useEffect(() => {
    if (!selectedId && sortedEngins.length > 0) {
      const firstEngin = sortedEngins[0];
      setSelectedId(firstEngin.id || firstEngin.matricule);
    }
  }, [sortedEngins, selectedId]);

  // Find the currently selected engine object
  const enginSelectionne = React.useMemo(() => {
    if (!selectedId) return sortedEngins[0] || null;
    return sortedEngins.find(e => e.id === selectedId || e.matricule === selectedId) || sortedEngins[0] || null;
  }, [sortedEngins, selectedId]);

  // Helper status badge generator
  const getRefinedStatusBadge = (statut: string) => {
    const norm = (statut || "").toLowerCase();
    if (norm === "actif") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Actif
        </span>
      );
    }
    if (norm === "maintenance") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Maintenance
        </span>
      );
    }
    if (norm === "panne") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          En Panne
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        Hors Service
      </span>
    );
  };

  if (!enginSelectionne) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white space-y-3">
        <ClipboardList className="h-10 w-10 text-slate-300 mx-auto" />
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Aucun engin disponible</h3>
        <p className="text-xs text-slate-500">Veuillez d'abord enregistrer un engin dans l'onglet approprié.</p>
      </div>
    );
  }

  // Filter lists for child tabs client-side
  const engineWo = (rawWorkorders || []).filter(w =>
    (w.machineCode === enginSelectionne.matricule || w.enginId === enginSelectionne.id)
  );

  const engineMaintenances = (rawMaintenances || []).filter(m =>
    (m.enginId === enginSelectionne.id || m.machineCode === enginSelectionne.matricule || m.machineId === enginSelectionne.matricule)
  );

  const enginePannes = React.useMemo(() => 
    (rawPannes || []).filter(p => p.enginId === enginSelectionne.id && !p.deleted)
      .sort((a, b) => new Date(b.dateDeclaration).getTime() - new Date(a.dateDeclaration).getTime()),
    [rawPannes, enginSelectionne.id]
  );

  const enginePneus = (rawPneus || []).filter(p =>
    (p.enginId === enginSelectionne.id || p.enginMatricule === enginSelectionne.matricule)
  );

  // 1. KPI Calculation details
  const currHours = Number(enginSelectionne.heures) || Number(enginSelectionne.hours) || Number(enginSelectionne.km) || 0;
  const isVL = enginSelectionne.categorie === "VL";
  const unitLabel = isVL ? "km" : "h";

  // Last vidange date
  const lastVidange = [...engineMaintenances]
    .filter(m => (m.type || "").toUpperCase() === "VIDANGE")
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())[0];
  const lastVidangeDate = lastVidange ? lastVidange.date : "Non enregistrée";

  // Next vidange calculation
  const lastVidangeHours = Number(lastVidange?.heures) || Number(lastVidange?.hours) || 0;
  const nextVidangeHours = lastVidangeHours ? lastVidangeHours + 250 : 0;
  const hoursLeft = nextVidangeHours ? nextVidangeHours - currHours : 0;
  const isNextVidangeOverdue = nextVidangeHours ? hoursLeft <= 0 : false;

  // Piecces aggregation from workorders
  const replacedPartsMap: Record<string, {
    ref: string;
    designation: string;
    quantity: number;
    lastDate: string;
    btSource: string;
  }> = {};

  engineWo.forEach(wo => {
    const partsList = wo.replacedParts || wo.partsRemplacement || [];
    if (Array.isArray(partsList)) {
      partsList.forEach((p: any) => {
        const ref = (p.ref || p.code || p.partNumber || "REF-INCONNU").toUpperCase().trim();
        const designation = p.designation || p.label || p.name || "Pièce de rechange";
        const qty = Number(p.quantity || p.qty || p.quantite) || 1;
        const btDate = wo.createdAt || wo.date || "N/A";
        const btSource = wo.code || `BT #${wo.id.slice(0, 6)}`;

        if (replacedPartsMap[ref]) {
          replacedPartsMap[ref].quantity += qty;
          if (btDate !== "N/A" && (replacedPartsMap[ref].lastDate === "N/A" || new Date(btDate).getTime() > new Date(replacedPartsMap[ref].lastDate).getTime())) {
            replacedPartsMap[ref].lastDate = btDate;
            replacedPartsMap[ref].btSource = btSource;
          }
        } else {
          replacedPartsMap[ref] = {
            ref,
            designation,
            quantity: qty,
            lastDate: btDate,
            btSource
          };
        }
      });
    }
  });

  const replacedPartsArray = Object.values(replacedPartsMap);

  // Timeline events compiling (top 5 events)
  const eventsList: { id: string; date: string; type: string; title: string; desc: string; icon: any; colorClass: string; badgeColor: string }[] = [];

  // Workorders
  engineWo.forEach(wo => {
    eventsList.push({
      id: wo.id,
      date: wo.createdAt || wo.date || "",
      type: "BON DE TRAVAIL",
      title: wo.title || `BT #${wo.code || wo.id.slice(0,6)}`,
      desc: `Assigné: ${wo.technician || wo.assignedTo || "Technicien"} | Priorité: ${wo.priority || "Normal"}`,
      icon: Wrench,
      colorClass: "bg-blue-50 text-blue-600 border border-blue-100",
      badgeColor: "bg-blue-100 text-blue-800"
    });
  });

  // Maintenances
  engineMaintenances.forEach(m => {
    eventsList.push({
      id: m.id,
      date: m.date || "",
      type: (m.type || "Entretien").toUpperCase(),
      title: `${m.type || "PM"} — ${m.heures || m.hours || "?"} ${unitLabel}`,
      desc: `Obs: ${m.observations || "Aucune observation"} | Intervenant: ${m.technician || "Équipe Tech"}`,
      icon: Droplet,
      colorClass: "bg-emerald-50 text-emerald-600 border border-emerald-100",
      badgeColor: "bg-emerald-100 text-emerald-800"
    });
  });

  // Pannes
  enginePannes.forEach(p => {
    const isCritique = p.gravite === "Critique";
    const isElevee = p.gravite === "Élevée";
    eventsList.push({
      id: p.id,
      date: p.dateDeclaration || p.date || p.createdAt || "",
      type: `PANNE — ${p.statut || "DÉCLARÉE"}`,
      title: `${p.numero || "Panne"} • ${p.categorie || "Autre"}`,
      desc: `Symptômes: ${p.description || "N/A"} | Gravité: ${p.gravite || "Moyenne"}${p.dureeImmobilisation ? ` | Immo: ${p.dureeImmobilisation}h` : ""}${p.diagnostic ? ` | Diagnostic: ${p.diagnostic}` : ""}`,
      icon: AlertTriangle,
      colorClass: isCritique 
        ? "bg-red-50 text-red-700 border border-red-100" 
        : isElevee 
          ? "bg-orange-50 text-orange-700 border border-orange-100"
          : "bg-amber-50 text-amber-700 border border-amber-150",
      badgeColor: isCritique 
        ? "bg-red-100 text-red-800" 
        : isElevee 
          ? "bg-orange-100 text-orange-800"
          : "bg-amber-100 text-amber-800"
    });
  });

  const sortedEvents = eventsList
    .filter(evt => evt.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Sub-tabs list definition
  const subTabs = [
    { id: "resume" as const, label: "RÉSUMÉ" },
    { id: "workorders" as const, label: "BONS DE TRAVAIL" },
    { id: "pm" as const, label: "VIDANGES & PM" },
    { id: "pannes" as const, label: "PANNES" },
    { id: "pieces" as const, label: "PIÈCES REMPLACÉES" },
    { id: "pneus" as const, label: "PNEUS" }
  ];

  return (
    <>
      {/* SCREEN INTERFACE (Hidden on print-to-PDF output) */}
      <div className="space-y-6 print:hidden">
      
      {/* PART 1 — SÉLECTEUR D'ENGIN */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="flex-1 flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#b8860b]">
            Sélectionner un Équipement Actif
          </label>
          <select
            className="h-11 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-550 cursor-pointer w-full max-w-md"
            value={selectedId || ""}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {sortedEngins.map((eng) => (
              <option key={eng.id} value={eng.id || eng.matricule}>
                [{eng.matricule}] — {eng.brand || eng.marque || ""} {eng.type} — {eng.site || "SMI"}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0 transition-all">
          <div className="flex flex-col items-start sm:items-end justify-center gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Statut Flotte</span>
            {getRefinedStatusBadge(enginSelectionne.statut)}
          </div>
          <button
            onClick={() => window.print()}
            className="h-11 px-5 rounded-lg bg-[#b8860b] hover:bg-[#997009] text-white font-extrabold text-[10.5px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-transform duration-100 active:scale-95 shadow-xs border border-amber-600/25"
          >
            <FileText className="w-4 h-4 text-white stroke-[2.2]" />
            Exporter PDF du Carnet
          </button>
        </div>
      </div>

      {/* PART 2 — BANNER (Implemented Inline precisely matching Prompt blueprint) */}
      <div className="bg-white border-2 border-amber-500/10 rounded-[14px] shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          
          {/* col-span-2 : icône ronde fond sombre text-[#ffd700] */}
          <div className="lg:col-span-2 p-6 flex items-center justify-center bg-white relative border-b lg:border-b-0 lg:border-r border-slate-100">
            <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg relative bg-gradient-to-br from-[#121c26] to-[#04080c] border border-amber-500/30 text-[#ffd700]">
              <div className="absolute inset-0 rounded-full animate-pulse opacity-10 bg-amber-500 scale-110" />
              <ClipboardList className="w-10 h-10 stroke-[2.2]" />
            </div>
          </div>

          {/* col-span-7 : badge amber animé + titre luminous-gold-white-text + sous-titre */}
          <div className="lg:col-span-7 p-6 lg:p-8 flex flex-col justify-center items-center lg:items-start text-center lg:text-left gap-3 bg-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/40">
              <span className="w-2 h-2 rounded-full animate-pulse bg-[#b8860b]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 animate-pulse">
                Historique Complet — Traçabilité Totale
              </span>
            </div>

            <h1 className="text-3xl lg:text-4xl xl:text-5xl tracking-normal leading-none uppercase font-black">
              <span className="luminous-gold-white-text">
                Carnet de Santé — {enginSelectionne.matricule}
              </span>
            </h1>

            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Bons de travail · Vidanges · Pannes · Pneus · Pièces remplacées
            </p>
          </div>

          {/* col-span-3 : badge de chantier de l'engin sélectionné */}
          <div className="lg:col-span-3 bg-white p-6 flex flex-col justify-center items-center lg:items-end gap-2 lg:border-l border-slate-100">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50/80 border border-amber-200/30 rounded-md shadow-sm">
              <span className="w-1.5 h-1.5 bg-[#b8860b] rounded-full animate-pulse" />
              <span className="text-[9px] font-bold tracking-wider uppercase text-[#b8860b]">CHANTIER ASSOCIÉ</span>
            </div>
            <div className="px-3.5 py-1.5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-lg text-xs font-black text-[#ffd700] shadow-md uppercase tracking-widest select-none leading-none">
              {enginSelectionne.site}
            </div>
          </div>

        </div>
      </div>

      {/* PART 3 — ONGLETS DU CARNET */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
        {subTabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-amber-50 text-amber-700 border border-amber-500/15 shadow-sm"
                  : "text-slate-500 hover:text-amber-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* RENDER ACTIVE SUBTAB CONTENT */}

      {/* Tab: RÉSUMÉ */}
      {activeSubTab === "resume" && (
        <div className="space-y-6">
          
          {/* KPI columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* KPI 1 : Usage */}
            <Card className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Utilisation totale
                  </p>
                  <p className="text-2xl font-black text-slate-800 font-mono">
                    {currHours} {unitLabel}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
            </Card>

            {/* KPI 2 : Workorders count */}
            <Card className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Bons de Travail
                  </p>
                  <p className="text-2xl font-black text-slate-800 font-mono">
                    {engineWo.length} BT
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Wrench className="w-4 h-4" />
                </div>
              </div>
            </Card>

            {/* KPI 3 : Last Vidange date */}
            <Card className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Dernière Vidange
                  </p>
                  <p className="text-sm font-black text-slate-800 pt-1.5 font-mono truncate max-w-[130px]">
                    {lastVidangeDate}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Droplet className="w-4 h-4" />
                </div>
              </div>
            </Card>

            {/* KPI 4 : Recorded pannes */}
            <Card className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Pannes Signalées
                  </p>
                  <p className="text-2xl font-black text-red-650 font-mono">
                    {enginePannes.length}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
            </Card>

          </div>

          {/* Timeline component of 5 latest events */}
          <div className="p-6 border border-slate-200 rounded-2xl bg-white shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-amber-500 animate-pulse" /> Chronologie des Activités (Derniers Événements)
            </h3>

            {sortedEvents.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium uppercase tracking-wider border border-dashed border-slate-100 rounded-xl">
                ⚠️ Aucun historique enregistré pour cet engin.
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-100 pl-4 ml-2.5 space-y-6 pt-2">
                {sortedEvents.map((event, index) => {
                  const Icon = event.icon;
                  return (
                    <div key={`${event.id}-${index}`} className="relative">
                      {/* Round dot */}
                      <span className="absolute -left-[27px] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm">
                        <Icon className="h-2.5 w-2.5 text-slate-750" />
                      </span>
                      
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-tight">{event.title}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${event.badgeColor}`}>
                            {event.type}
                          </span>
                          <span className="text-[10px] font-bold font-mono text-slate-400 ml-auto bg-slate-50 px-2 py-0.5 rounded">
                            {event.date}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{event.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab: BONS DE TRAVAIL */}
      {activeSubTab === "workorders" && (
        <div className="space-y-4">
          {engineWo.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-white space-y-2">
              <Wrench className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Aucun bon de travail enregistré pour cet engin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {engineWo.map((wo) => {
                const partsList = wo.replacedParts || wo.partsRemplacement || [];
                const hasParts = Array.isArray(partsList) && partsList.length > 0;
                
                // Priority color lookup
                const rawPriority = (wo.priority || wo.priorite || "normal").toLowerCase();
                const priorityClass = rawPriority === "critique" 
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : rawPriority === "majeur"
                    ? "bg-amber-50 text-amber-700 border border-amber-250"
                    : "bg-slate-50 text-slate-600 border border-slate-200";

                // Status mapping
                const rawStatus = (wo.status || wo.statut || "OUVERT").toUpperCase();
                let statusClass = "bg-amber-50 text-amber-700 border border-amber-200";
                if (rawStatus === "EN_COURS" || rawStatus === "ENCOURS" || rawStatus === "EN COURS") {
                  statusClass = "bg-blue-50 text-blue-700 border border-blue-200";
                } else if (rawStatus === "RESOLU" || rawStatus === "RÉSOLU") {
                  statusClass = "bg-emerald-50 text-emerald-700 border border-emerald-200";
                } else if (rawStatus === "CLOS" || rawStatus === "FERMÉ") {
                  statusClass = "bg-slate-100 text-slate-600 border border-slate-200";
                } else if (rawStatus === "PIECES_ATTRIBUEES" || rawStatus === "PIÈCES_ATTRIBUÉES" || rawStatus === "PIECES") {
                  statusClass = "bg-purple-50 text-purple-700 border border-purple-200";
                }

                return (
                  <Card key={wo.id} className="border border-slate-200 bg-white hover:border-amber-500/10 hover:shadow-sm transition-all rounded-xl p-5 flex flex-col justify-between">
                    <div className="space-y-3">
                      
                      {/* Header line */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <span className="text-xs font-black font-mono text-slate-700 uppercase">
                          ⚙️ BT : {wo.code || wo.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${statusClass}`}>
                          {rawStatus}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-sm font-bold text-slate-800 tracking-tight leading-snug">
                        {wo.title || "Entretien mécanique général"}
                      </h4>

                      {/* Technical specifications rows */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500 uppercase font-mono bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                        <div>👨‍🔧 Technicien: <span className="text-slate-800">{wo.technician || wo.assignedTo || "Attente"}</span></div>
                        <div>⌚ Durée: <span className="text-slate-800">{wo.duration || wo.hoursSpend || "?"} h</span></div>
                        <div className="col-span-2">📅 Émis le: <span className="text-slate-800">{wo.createdAt || wo.date || "N/A"}</span></div>
                      </div>

                      {/* Priority badge */}
                      <span className={`inline-flex text-[9px] font-extrabold px-2 py-0.5 rounded uppercase ${priorityClass}`}>
                        Priorité: {rawPriority}
                      </span>

                    </div>

                    {/* Pieces footer if replacements took place */}
                    {hasParts && (
                      <div className="mt-4 pt-3 border-t border-dashed border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#b8860b]">
                          📦 Éléments Remplacés :
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {partsList.slice(0, 3).map((item: any, itemIndex: number) => (
                            <span 
                              key={itemIndex} 
                              className="inline-flex items-center text-[9px] font-bold px-2 py-1 rounded bg-slate-100 border border-slate-205 text-slate-650 font-mono"
                            >
                              {item.ref || item.code || "PIECE"} ({item.quantity || item.qty || 1}x)
                            </span>
                          ))}
                          {partsList.length > 3 && (
                            <span className="inline-flex items-center text-[9px] font-bold px-2 py-1 rounded bg-amber-50 border border-amber-100 text-amber-700 font-mono">
                              +{partsList.length - 3} ref
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: VIDANGES & PM */}
      {activeSubTab === "pm" && (
        <div className="space-y-6">
          
          {/* Header block with next vidange projection */}
          <div className="p-5 border border-amber-500/10 bg-amber-50/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#b8860b] flex items-center gap-1">
                <Droplet className="h-3.5 w-3.5" /> PROCHAINE VIDANGE & MAINTENANCE PLANIFIÉE
              </span>
              {nextVidangeHours ? (
                <div className="space-y-0.5">
                  <p className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">
                    Échéance prévue à : <span className="font-mono text-base font-black text-amber-700 bg-white border border-amber-200/40 px-2 py-0.5 rounded">{nextVidangeHours} {unitLabel}</span>
                  </p>
                  <p className="text-xs text-slate-500 font-semibold uppercase">
                    {hoursLeft <= 0 ? (
                      <span className="text-red-700 font-black flex items-center gap-1 animate-pulse">
                        ⚠️ VIDANGE EN RETARD (Dépassée de {Math.abs(hoursLeft)} {unitLabel})
                      </span>
                    ) : (
                      <span>Dans environ : <strong className="font-mono text-slate-800">{hoursLeft} {unitLabel}</strong> de service</span>
                    )}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-bold uppercase">
                  Aucune vidange enregistrée pour calculer la prochaine échéance. Intervalle préconisé : 250 {unitLabel} (ou 5000 km)
                </p>
              )}
            </div>

            <div className="shrink-0">
              {isNextVidangeOverdue ? (
                <Badge className="bg-red-50 text-red-700 border border-red-200 font-black animate-pulse py-1.5 px-3 rounded-lg text-xs tracking-widest uppercase">
                  ⚠️ VIDANGE EN RETARD
                </Badge>
              ) : nextVidangeHours ? (
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-250 font-black py-1.5 px-3 rounded-lg text-xs tracking-widest uppercase flex items-center gap-1">
                  ✓ CONFORME
                </Badge>
              ) : (
                <Badge className="bg-slate-100 text-slate-500 border border-slate-200 font-semibold py-1.5 px-3 rounded-lg text-xs tracking-widest uppercase">
                  À SURVEILLER
                </Badge>
              )}
            </div>
          </div>

          {/* List of maintenance entries */}
          {engineMaintenances.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-white space-y-2">
              <Droplet className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Aucune vidange ni maintenance préventive enregistrée.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {[...engineMaintenances]
                .sort((a,b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
                .map((m) => {
                  const mType = (m.type || "PM").toUpperCase();
                  const mHeures = Number(m.heures) || Number(m.hours) || 0;
                  
                  // Check if this specific PM corresponds to active schedule
                  const checkOverdue = nextVidangeHours ? (currHours > nextVidangeHours) : false;

                  return (
                    <div key={m.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black font-mono text-slate-800 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded leading-none">
                            ⏱️ {mHeures} {unitLabel}
                          </span>
                          <span className="text-xs font-extrabold text-amber-700 bg-amber-50/50 border border-amber-100 px-2 rounded-full uppercase leading-none">
                            {mType}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold ml-auto md:ml-0 font-mono">
                            📅 {m.date || "N/A"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-semibold uppercase">
                          Observations: <span className="text-slate-700 font-bold normal-case">{m.observations || "Aucune observation formulée"}</span>
                        </p>
                        <p className="text-[10px] text-slate-405 font-bold uppercase tracking-wider">
                          Intervenant: <span className="text-slate-700 font-bold normal-case">{m.technician || "Équipe Hydromines"}</span>
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        {checkOverdue ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-lg text-[10px] font-black border border-red-200 uppercase tracking-widest">
                            <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" /> EN RETARD
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black border border-emerald-200 uppercase tracking-widest">
                            <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" /> CONFORME
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

        </div>
      )}

      {/* Tab: PANNES */}
      {activeSubTab === "pannes" && (
        <div className="space-y-4">
          {enginePannes.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-emerald-250 rounded-2xl bg-white space-y-2">
              <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto animate-pulse" />
              <p className="text-emerald-700 text-xs font-black uppercase tracking-widest">Aucune panne ou anomalie active enregistrée pour cet engin. ✓</p>
              <p className="text-[10px] text-slate-405 font-semibold uppercase">L'actif opère dans ses plages de sécurité nominale.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {enginePannes.map((panne) => {
                const severe = (panne.gravite || "Moyenne");
                const isCritique = severe === "Critique";
                const isElevee = severe === "Élevée";
                const isFaible = severe === "Faible";
                const severeClass = isCritique
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : isElevee
                    ? "bg-orange-50 text-orange-700 border border-orange-200"
                    : isFaible
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200";

                const downtimeHours = panne.dureeImmobilisation || null;

                return (
                  <div key={panne.id} className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-350 shadow-sm transition-all space-y-3.5">
                    
                    {/* Header detail */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-4 w-4 ${isCritique ? 'text-red-600 animate-pulse' : 'text-amber-500'}`} />
                        <span className="text-xs font-black uppercase text-slate-800 font-mono">
                          🔧 Panne : {panne.numero || panne.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex gap-1.5 items-center">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${severeClass}`}>
                          {severe}
                        </span>
                        <span className="text-[10px] font-bold font-mono text-slate-400 bg-slate-50 px-2 py-0.5 border border-slate-100/50 rounded">
                          📅 {panne.dateDeclaration || "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Desc and categorization */}
                    <div className="space-y-1.5">
                      <p className="text-xs text-slate-800 font-black uppercase tracking-normal">
                        Symptômes : <span className="font-bold text-slate-650 normal-case">{panne.description || "Anomalie technique non documentée"}</span>
                      </p>
                      <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                        <div>🔧 Catégorie : <span className="text-slate-700 font-bold">{panne.categorie || "Générique"}</span></div>
                        <div>📊 Statut : <span className="text-indigo-600 font-black bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">{panne.statut || "DÉCLARÉE"}</span></div>
                        {downtimeHours !== null && (
                          <div>⏱️ Arrêt : <span className="text-red-700 font-black">{downtimeHours} h</span></div>
                        )}
                        {panne.arretMachine && (
                          <div className="text-red-600 font-extrabold animate-pulse">⚠️ Machine arrêtée</div>
                        )}
                      </div>
                    </div>

                    {/* Diagnostic notes if present */}
                    {panne.diagnostic && (
                      <div className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-lg text-[11px] font-medium leading-relaxed text-slate-700">
                        <strong className="text-[10px] font-black uppercase tracking-widest text-indigo-800 block mb-1">
                          🧠 Diagnostic & Notes :
                        </strong>
                        {panne.diagnostic}
                        {panne.mecanicienAssigneNom && (
                          <div className="mt-1 text-[10px] text-slate-500">
                            Assigné à : <span className="font-extrabold text-slate-700">{panne.mecanicienAssigneNom}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: PIÈCES REMPLACÉES */}
      {activeSubTab === "pieces" && (
        <div className="space-y-4">
          {replacedPartsArray.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-white space-y-2">
              <Info className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Aucune pièce remplacée enregistrée pour cet engin.</p>
              <p className="text-[9px] text-slate-400">Les interventions mécaniques n'ont spécifié aucun changement d'élément d'usure.</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse bg-white">
                <thead>
                  <tr className="bg-amber-50 text-amber-700 border-b border-slate-200">
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest">Référence</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest">Désignation</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Qté Totale</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest">Dernier Remplacement</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest">Source BT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {replacedPartsArray.map((part, index) => (
                    <tr 
                      key={part.ref} 
                      className={index % 2 === 0 ? "bg-white" : "bg-slate-55/30"}
                    >
                      <td className="p-4 text-xs font-extrabold text-slate-900 font-mono">{part.ref}</td>
                      <td className="p-4 text-xs text-slate-700">{part.designation}</td>
                      <td className="p-4 text-xs text-slate-800 font-mono text-center font-extrabold">{part.quantity}</td>
                      <td className="p-4 text-xs text-slate-500 font-mono">{part.lastDate}</td>
                      <td className="p-4 text-xs text-[#b8860b] font-mono font-bold uppercase">{part.btSource}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: PNEUS */}
      {activeSubTab === "pneus" && (
        <div className="space-y-4">
          {enginePneus.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-white space-y-2">
              <Cpu className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Aucun suivi pneu enregistré pour cet engin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enginePneus.map((pneu) => {
                const poseHours = Number(pneu.heuresPose || pneu.heures_pose || pneu.hoursAtPose) || 0;
                const diffHours = Math.max(0, currHours - poseHours);
                const wear = Math.min(100, Math.round((diffHours / 2000) * 100));
                
                // Color mapping
                const wearColor = wear < 70 ? "bg-emerald-500" : wear <= 90 ? "bg-amber-500" : "bg-red-500";
                const textWearColor = wear < 70 ? "text-emerald-700" : wear <= 90 ? "text-amber-700" : "text-red-700";

                return (
                  <Card key={pneu.id} className="border border-slate-200 bg-white p-5 rounded-xl shadow-sm hover:shadow-xs hover:border-slate-350 transition-all">
                    
                    {/* Header position */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3.5">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1">
                        📍 Position : {pneu.position || pneu.emplacement || "N/A"}
                      </span>
                      <span className={`text-xs font-black tracking-tight ${textWearColor}`}>
                        Usure calculée : {wear}%
                      </span>
                    </div>

                    <div className="space-y-3.5">
                      <p className="text-xs text-slate-600 font-semibold uppercase">
                        Marque / Spec: <span className="text-slate-950 font-extrabold">{pneu.marque || "N/A"}</span> {pneu.dimension && `— Dimension : ${pneu.dimension}`}
                      </p>

                      {/* Setup readings */}
                      <div className="grid grid-cols-2 gap-3 text-[10.5px] font-bold text-slate-500 uppercase font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div>📅 Date d'installation: <span className="text-slate-800 block text-xs mt-0.5">{pneu.datePose || pneu.date_pose || "N/A"}</span></div>
                        <div>⏱️ Relevé de pose: <span className="text-slate-800 block text-xs mt-0.5">{poseHours} {unitLabel}</span></div>
                      </div>

                      {/* Progress bar and statistics */}
                      <div className="space-y-2">
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div className={`h-full ${wearColor}`} style={{ width: `${wear}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center justify-between font-mono">
                          <span>{diffHours} h de service cumulé</span>
                          <span>Max : 2000 h standard</span>
                        </p>
                      </div>

                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      </div>

      {/* --- EXTRA EXPORT DESIGN POUR L'IMPRESSION SUR PAPIER (A4 / PDF) --- */}
      <div className="hidden print:block bg-white p-6 space-y-6 text-slate-900 font-sans text-xs w-full max-w-[210mm] mx-auto leading-normal">
        
        {/* Header de Hydromines S.A. */}
        <div className="flex items-center justify-between border-b-4 border-[#b8860b] pb-4">
          <div className="flex items-center gap-3">
            <HydrominesLogo size={52} className="shrink-0" />
            <div className="space-y-0.5 animate-fade-in">
              <h1 className="text-xl font-black tracking-wider text-[#02A2DE] uppercase leading-none">
                HYDRO<span className="text-[#AC1E23]">MINES</span> S.A.
              </h1>
              <p className="text-[8.5px] font-extrabold uppercase tracking-widest text-[#b8860b] leading-none">
                Département GMAO de la Méthodes & Flotte Minière
              </p>
              <p className="text-[7.5px] text-slate-550 font-bold uppercase tracking-wider leading-none">
                Mines - Eau - Environnement • Document de Contrôle Clinique
              </p>
            </div>
          </div>
          
          <div className="text-right space-y-1">
            <h2 className="text-xs font-black uppercase text-slate-900 tracking-tight leading-none bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
              RAPPORT CLINIQUE DE L'ACTIF
            </h2>
            <p className="text-[9.5px] font-mono font-black text-slate-800 uppercase bg-amber-50/70 border border-amber-200/50 px-2 py-0.5 rounded inline-block mt-1">
              MATRICULE : {enginSelectionne.matricule}
            </p>
            <p className="text-[8px] text-slate-400 font-bold block">
              Généré le : {new Date().toLocaleDateString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        {/* Fiche Technique Identification d'Actif */}
        <div className="bg-slate-50 border border-slate-205 rounded-xl p-4 space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-wider text-[#b8860b] border-b border-slate-200/60 pb-1 flex items-center gap-1">
            📋 IDENTIFICATION ET RENDEMENT DE L'ORGANISME DE TRAVAIL
          </h3>
          <div className="grid grid-cols-4 gap-4 text-[10px] leading-relaxed">
            <div>
              <p className="text-slate-400 font-extrabold uppercase tracking-wider text-[8px]">MATRICULE DE L'ENGIN</p>
              <p className="text-slate-900 font-black font-mono text-xs">{enginSelectionne.matricule}</p>
            </div>
            <div>
              <p className="text-slate-400 font-extrabold uppercase tracking-wider text-[8px]">MODÈLE & CONSTRUCTEUR</p>
              <p className="text-slate-900 font-bold text-xs uppercase">{enginSelectionne.type} ({enginSelectionne.brand || enginSelectionne.marque || "Hydromines"})</p>
            </div>
            <div>
              <p className="text-slate-400 font-extrabold uppercase tracking-wider text-[8px]">CATÉGORIE CLINIQUE</p>
              <p className="text-slate-900 font-bold text-xs uppercase font-mono">{enginSelectionne.categorie || "LHD"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-extrabold uppercase tracking-wider text-[8px]">SITE OPÉRATIONNEL ACTIF</p>
              <p className="text-slate-900 font-black text-xs uppercase text-amber-700">{enginSelectionne.site || "SMI"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-extrabold uppercase tracking-wider text-[8px]">CUMUL D'UTILISATION (COMPTEUR)</p>
              <p className="text-slate-900 font-black font-mono text-xs">{currHours} {unitLabel}</p>
            </div>
            <div>
              <p className="text-slate-400 font-extrabold uppercase tracking-wider text-[8px]">ÉTAT DE DISPONIBILITÉ</p>
              <p className="text-slate-900 font-bold text-xs uppercase font-mono">
                {enginSelectionne.statut === "actif" ? "🟢 EN SERVICE" : enginSelectionne.statut === "maintenance" ? "🟡 EN PLANIFICATION / PM" : enginSelectionne.statut === "panne" ? "🔴 HORS SERVICE / DIAGNOSTIC" : "⚪ ARRETE / STOCK"}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-extrabold uppercase tracking-wider text-[8px]">DERNIÈRE VIDANGE CERTIFIÉE</p>
              <p className="text-slate-900 font-bold font-mono text-xs">{lastVidangeDate}</p>
            </div>
            <div>
              <p className="text-slate-400 font-extrabold uppercase tracking-wider text-[8px]">PROCHAINE CONFIGURATION SOUHAITÉE</p>
              <p className="text-slate-900 font-black font-mono text-xs text-amber-700">
                {nextVidangeHours ? `${nextVidangeHours} ${unitLabel}` : "N/A (Séquence 250h ou 5000km)"}
              </p>
            </div>
          </div>
        </div>

        {/* Tableau Synthèse de Compteur & Santé */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
            <p className="text-base font-black text-slate-800 font-mono leading-none">{engineWo.length}</p>
            <p className="text-[7.5px] text-slate-500 font-extrabold uppercase tracking-widest mt-1">BONS DE TRAVAIL CLOS</p>
          </div>
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
            <p className="text-base font-black text-amber-700 font-mono leading-none">{engineMaintenances.length}</p>
            <p className="text-[7.5px] text-slate-500 font-extrabold uppercase tracking-widest mt-1">ENTRETIENS & PM EFFECTUÉS</p>
          </div>
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
            <p className="text-base font-black text-red-650 font-mono leading-none">{enginePannes.length}</p>
            <p className="text-[7.5px] text-slate-500 font-extrabold uppercase tracking-widest mt-1">PANNES & ALERTES</p>
          </div>
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
            <p className="text-base font-black text-slate-800 font-mono leading-none">{replacedPartsArray.length}</p>
            <p className="text-[7.5px] text-slate-500 font-extrabold uppercase tracking-widest mt-1">ORGANES REMPLACÉS</p>
          </div>
        </div>

        {/* --- SECTION 1 : BONS DE TRAVAIL (GMAO) --- */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
            <span>1. HISTORIQUE INTÉGRAL DE MAINTENANCE (BONS DE TRAVAIL CLOS)</span>
            <span className="text-[7.5px] text-slate-400 font-mono font-bold">Base de données d'ingénierie souterraine</span>
          </h3>
          {engineWo.length === 0 ? (
            <p className="text-[10px] text-slate-400 italic py-3 border border-dashed border-slate-200 text-center rounded-xl font-medium">Aucune intervention de maintenance émise pour ce matricule.</p>
          ) : (
            <table className="w-full text-left border-collapse border border-slate-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 text-[8px] font-black uppercase tracking-wider">
                  <th className="p-2 border border-slate-200">Date d'émission</th>
                  <th className="p-2 border border-slate-200">Code Log</th>
                  <th className="p-2 border border-slate-200 w-[42%]">Titre des Travaux & Diagnostics Réalisés</th>
                  <th className="p-2 border border-slate-200">Technicien</th>
                  <th className="p-2 border border-slate-200 text-center">Durée</th>
                  <th className="p-2 border border-slate-200">Priorité</th>
                  <th className="p-2 border border-slate-200">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[9px] font-medium leading-relaxed">
                {engineWo.map(wo => (
                  <tr key={wo.id} className="hover:bg-slate-50/20">
                    <td className="p-2 border border-slate-200 font-mono text-slate-500">{wo.createdAt || wo.date || "N/A"}</td>
                    <td className="p-2 border border-slate-200 font-black font-mono text-slate-600">{wo.code || `BT-#${wo.id.slice(0, 6).toUpperCase()}`}</td>
                    <td className="p-2 border border-slate-200 text-slate-900 font-bold">{wo.title || "Ordre d'entretien standard"}</td>
                    <td className="p-2 border border-slate-200">{wo.technician || wo.assignedTo || "Attente d'équipe"}</td>
                    <td className="p-2 border border-slate-200 font-mono text-center">{wo.duration || wo.hoursSpend || "?"} h</td>
                    <td className="p-2 border border-slate-200 font-extrabold uppercase font-mono text-[8px]">{wo.priority || "Normal"}</td>
                    <td className="p-2 border border-slate-200 text-slate-600 font-bold uppercase text-[8px]">{wo.status || "Clos"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* --- SECTION 2 : CARNET DE VIDANGES ET MAINTENANCES PRÉVENTIVES --- */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
            <span>2. CARNET DE MÉDECINE PRÉVENTIVE (VIDANGES ET CYCLES PM)</span>
            <span className="text-[7.5px] text-slate-400 font-mono font-bold">Périodicité normale: 250h - Conformité des huiles</span>
          </h3>
          {engineMaintenances.length === 0 ? (
            <p className="text-[10px] text-slate-400 italic py-3 border border-dashed border-slate-200 text-center rounded-xl font-medium">Aucun entretien préventif ou vidange d'huile enregistré dans le grand livre.</p>
          ) : (
            <table className="w-full text-left border-collapse border border-slate-200 rounded-lg">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 text-[8px] font-black uppercase tracking-wider">
                  <th className="p-2 border border-slate-200">Date d'Opération</th>
                  <th className="p-2 border border-slate-200">Relevé d'Heures</th>
                  <th className="p-2 border border-slate-200">Opération Principale</th>
                  <th className="p-2 border border-slate-200">Observations / Diagnostiques sur place</th>
                  <th className="p-2 border border-slate-200">Mécanicien GMAO</th>
                  <th className="p-2 border border-slate-200">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[9px] font-medium leading-relaxed">
                {engineMaintenances.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/20">
                    <td className="p-2 border border-slate-200 font-mono text-slate-500">{m.date || "N/A"}</td>
                    <td className="p-2 border border-slate-200 font-black font-mono text-slate-800">{m.heures || m.hours || "?"} {unitLabel}</td>
                    <td className="p-2 border border-slate-200 text-amber-700 font-black uppercase">{m.type || "PM DE ROUTINE"}</td>
                    <td className="p-2 border border-slate-200 text-slate-700 italic">"{m.observations || "Aucune observation de fuite"}"</td>
                    <td className="p-2 border border-slate-200">{m.technician || "Opérateur Mécanicien"}</td>
                    <td className="p-2 border border-slate-200 font-black text-[8px] text-emerald-700 font-mono">CONFORME</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* --- SECTION 3 : JOURNAL ANALYTIQUE DES PANNES --- */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
            <span>3. REGISTRE PHYSIOLOGIQUE DES PANNES ET ARRETS CORRECTIFS</span>
            <span className="text-[7.5px] text-slate-400 font-mono font-bold">Diagnostic par impact de dysfonctionnement</span>
          </h3>
          {enginePannes.length === 0 ? (
            <p className="text-[10px] text-slate-500 font-bold bg-emerald-50 border border-emerald-200 text-center py-3 rounded-xl uppercase tracking-wider">Aucun dysfonctionnement technique détecté ni panne active. Conforme à la charte Hydromines. ✓</p>
          ) : (
            <table className="w-full text-left border-collapse border border-slate-205 rounded-lg">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 text-[8px] font-black uppercase tracking-wider">
                  <th className="p-2 border border-slate-200">Date Panne</th>
                  <th className="p-2 border border-slate-200">ID Diagnostic</th>
                  <th className="p-2 border border-slate-200">Organe / Système</th>
                  <th className="p-2 border border-slate-200 w-[24%]">Symptôme relevé par l'opérateur</th>
                  <th className="p-2 border border-slate-200">Priorité</th>
                  <th className="p-2 border border-slate-200 text-center">Arrêt (h)</th>
                  <th className="p-2 border border-slate-200 w-[30%]">Action Corrective & Remèdes Cliniques Appliqués</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[9px] font-medium leading-relaxed">
                {enginePannes.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/20">
                    <td className="p-2 border border-slate-200 font-mono text-slate-500">{p.dateDeclaration || p.date || p.createdAt || "N/A"}</td>
                    <td className="p-2 border border-slate-200 font-black font-mono text-slate-655">{p.code || p.id.slice(0, 6).toUpperCase()}</td>
                    <td className="p-2 border border-slate-200 font-extrabold uppercase text-slate-800">{p.categorie || p.systeme || "Générique"}</td>
                    <td className="p-2 border border-slate-200 text-slate-800 font-bold">{p.description || p.titre || "Inconnu"}</td>
                    <td className="p-2 border border-slate-200 text-[8px] font-extrabold uppercase font-mono text-red-650">{p.severity || p.severite || "Majeure"}</td>
                    <td className="p-2 border border-slate-200 font-mono text-center">{p.durationMinutes ? Math.round(p.durationMinutes / 60) : (p.dureeHeures || "—")} h</td>
                    <td className="p-2 border border-slate-200 text-slate-705 bg-slate-50/50 text-[8.5px] italic">
                      {p.remedyAction || p.actionCorrective || p.solution || "Solution validée en cours d'application"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* --- SECTION 4 : INVENTAIRE DES ORGANES ET PIÈCES CHANGER SUR L'ACTIF --- */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
            <span>4. ETAT CIVIQUE DES PIÈCES DE RECHANGE ET ORGANES USURÉS</span>
            <span className="text-[7.5px] text-slate-400 font-mono font-bold">Inventaire quantitatif et points d'ancrage</span>
          </h3>
          {replacedPartsArray.length === 0 ? (
            <p className="text-[10px] text-slate-405 italic py-3 border border-dashed border-slate-200 text-center rounded-xl font-medium">Aucun changement d'organe ou de pièce d'usure répertorié pour cet engin.</p>
          ) : (
            <table className="w-full text-left border-collapse border border-slate-200 rounded-lg">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 text-[8px] font-black uppercase tracking-wider">
                  <th className="p-2 border border-slate-200">Référence unique</th>
                  <th className="p-2 border border-slate-200">Désignation / Label</th>
                  <th className="p-2 border border-slate-200 text-center">Quantité Consommée</th>
                  <th className="p-2 border border-slate-200">Date de Remplacement</th>
                  <th className="p-2 border border-slate-200">BT Code Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[9px] font-medium leading-relaxed font-mono">
                {replacedPartsArray.map(part => (
                  <tr key={part.ref} className="hover:bg-slate-50/20 text-slate-900">
                    <td className="p-2 border border-slate-200 font-black text-slate-900 font-mono text-xxs">{part.ref}</td>
                    <td className="p-2 border border-slate-200 font-sans text-xs font-semibold">{part.designation}</td>
                    <td className="p-2 border border-slate-200 font-bold text-center text-xs">{part.quantity} unités</td>
                    <td className="p-2 border border-slate-200 text-slate-500 text-xxs">{part.lastDate}</td>
                    <td className="p-2 border border-slate-200 text-[#b8860b] font-black text-xxs uppercase">{part.btSource}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* --- SECTION 5 : SUIVI DES PNEUMATIQUES --- */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
            <span>5. PLAN DE CHARGE DU ROULAGE (SUIVI PNEUMATIQUES)</span>
            <span className="text-[7.5px] text-slate-400 font-mono font-bold">Niveau d'abrasion et cumul d'adsorption</span>
          </h3>
          {enginePneus.length === 0 ? (
            <p className="text-[10px] text-slate-405 italic py-3 border border-dashed border-slate-200 text-center rounded-xl font-medium">Aucun pneumatique enregistré sous surveillance clinique de roulage.</p>
          ) : (
            <table className="w-full text-left border-collapse border border-slate-200 rounded-lg">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 text-[8px] font-black uppercase tracking-wider">
                  <th className="p-2 border border-slate-200">Position Clinique</th>
                  <th className="p-2 border border-slate-200">Fabricant / Marque</th>
                  <th className="p-2 border border-slate-200">Dimension Spécifique</th>
                  <th className="p-2 border border-slate-200">Date d'installation</th>
                  <th className="p-2 border border-slate-200 text-center">Compteur Pose</th>
                  <th className="p-2 border border-slate-200 text-center">Heures roulées</th>
                  <th className="p-2 border border-slate-200 text-center">Taux d'Usure calibré (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[9px] font-medium leading-relaxed">
                {enginePneus.map(pneu => {
                  const poseHours = Number(pneu.heuresPose || 0);
                  const diffHours = Math.max(0, currHours - poseHours);
                  const wear = Math.min(100, Math.round((diffHours / 2000) * 100));
                  return (
                    <tr key={pneu.id} className="hover:bg-slate-50/20">
                      <td className="p-2 border border-slate-200 font-extrabold text-slate-800">📍 {pneu.position || "N/A"}</td>
                      <td className="p-2 border border-slate-200 font-semibold">{pneu.marque || "N/A"}</td>
                      <td className="p-2 border border-slate-200 font-mono text-slate-655">{pneu.dimension || "N/A"}</td>
                      <td className="p-2 border border-slate-200 font-mono text-slate-550">{pneu.datePose || "N/A"}</td>
                      <td className="p-2 border border-slate-200 font-mono text-center">{poseHours} {unitLabel}</td>
                      <td className="p-2 border border-slate-200 font-mono text-center text-slate-800 font-bold">{diffHours} h</td>
                      <td className="p-2 border border-slate-200 text-center font-bold font-mono">
                        <span className={wear > 80 ? "text-red-700 font-black animate-pulse" : "text-slate-800"}>{wear} %</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* --- SIGNATURES DE VALIDATION OFFICIELLE --- */}
        <div className="pt-8 border-t border-slate-250 mt-12 grid grid-cols-2 gap-10 text-[9.5px]">
          <div className="space-y-14">
            <p className="text-[8.5px] font-black uppercase tracking-widest text-[#b8860b] border-b border-slate-100 pb-1">
              Certifié valide par le Bureau Méthodes / GMAO
            </p>
            <div className="border-t border-dashed border-slate-200 pt-2 text-slate-400 font-bold">
              Signataire : <strong className="text-slate-750 font-black">{user?.displayName || "Superviseur Flotte"}</strong>
            </div>
          </div>
          <div className="space-y-14 text-right">
            <p className="text-[8.5px] font-black uppercase tracking-widest text-[#b8860b] border-b border-slate-100 pb-1">
              Visa du Responsable Maintenance de Chantier
            </p>
            <div className="border-t border-dashed border-slate-200 pt-2 text-slate-450 font-bold text-right">
              Cachet officiel de l'Actif Hydromines S.A.
            </div>
          </div>
        </div>

        {/* Pied de page confidentiel */}
        <div className="text-center pt-8 text-[7.5px] text-slate-400 font-extrabold uppercase tracking-widest border-t border-slate-100">
          Ce document confidentiel constitue la mémoire technique de l'actif clinique Hydromines S.A. toute duplication est soumise à approbation.
        </div>

      </div>
    </>
  );
}
