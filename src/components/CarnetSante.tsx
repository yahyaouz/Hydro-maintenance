import * as React from "react";
import { 
  HeartPulse, 
  Activity, 
  Wrench, 
  Cpu, 
  Shield, 
  Zap, 
  AlertTriangle, 
  ClipboardList, 
  ChevronRight, 
  FileText, 
  TrendingUp, 
  CheckCircle,
  Truck,
  Disc,
  Clock,
  Save,
  MessageSquare,
  Search,
  Check
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store";
import { useCollection } from "@/hooks/useCollection";
import { DataLoadError } from "@/components/shared/DataLoadError";
import { useCarnetSante, calculSecoursSante } from "@/hooks/useCarnetSante";
import { PageBanner } from "@/components/ui/PageBanner";
import { toast } from "sonner";

interface CarnetSanteProps {
  enginId?: string | null;
  allEngins?: any[];
}

export function CarnetSante({ enginId: initialEnginId = null, allEngins: propEngins }: CarnetSanteProps) {
  const { user, activeSite } = useAuthStore();
  
  // Fetch engines if not provided as props
  const { data: dbEngins, loading: loadingEngins, error: enginsError } = useCollection<any>("engins");
  const engins = propEngins || dbEngins || [];

  // Fetch active breakdowns and work orders
  const { data: pannes, loading: loadingPannes, error: pannesError } = useCollection<any>("pannes");
  const { data: workorders, loading: loadingWorkorders, error: tasksError } = useCollection<any>("maintenanceTasks");

  const hasLoadError = !!(enginsError || pannesError || tasksError);

  // Hook for carnet state
  const { profiles, saveProfile, computeHealthScore } = useCarnetSante();

  const [selectedEnginId, setSelectedEnginId] = React.useState<string | null>(initialEnginId);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [observations, setObservations] = React.useState("");
  const [savingNotes, setSavingNotes] = React.useState(false);

  // Sync state if prop changes
  React.useEffect(() => {
    if (initialEnginId) {
      setSelectedEnginId(initialEnginId);
    }
  }, [initialEnginId]);

  // Set first engine as selected if none selected and engines list loaded
  React.useEffect(() => {
    if (!selectedEnginId && engins.length > 0) {
      // Find first matching active site
      const filtered = engins.filter(e => {
        if (!activeSite || activeSite === "TOUS") return true;
        const eSite = (e.siteId || e.site || "").toUpperCase();
        return eSite === activeSite.toUpperCase();
      });
      if (filtered.length > 0) {
        setSelectedEnginId(filtered[0].id);
      } else {
        setSelectedEnginId(engins[0].id);
      }
    }
  }, [engins, selectedEnginId, activeSite]);

  // Sync observations text when selected engine changes or profiles load
  React.useEffect(() => {
    if (selectedEnginId) {
      const profile = profiles.find(p => p.enginId === selectedEnginId);
      setObservations(profile?.notes || "");
    }
  }, [selectedEnginId, profiles]);

  const selectedEngin = React.useMemo(() => {
    return engins.find(e => e.id === selectedEnginId) || null;
  }, [engins, selectedEnginId]);

  // Filter engines
  const filteredEngins = React.useMemo(() => {
    return engins.filter(e => {
      // 1. Site filter
      if (activeSite && activeSite !== "TOUS") {
        const eSite = (e.siteId || e.site || "").toUpperCase();
        if (eSite !== activeSite.toUpperCase()) return false;
      }
      // 2. Search filter
      const q = searchTerm.toLowerCase().trim();
      if (!q) return true;
      const mat = (e.matricule || "").toLowerCase();
      const type = (e.type || "").toLowerCase();
      const brand = (e.marque || "").toLowerCase();
      return mat.includes(q) || type.includes(q) || brand.includes(q);
    });
  }, [engins, activeSite, searchTerm]);

  // Get score with full context
  const getEnginScore = (engin: any) => {
    return computeHealthScore(engin, pannes || [], workorders || []);
  };

  const handleSaveNotes = async () => {
    if (!selectedEngin) return;
    setSavingNotes(true);
    try {
      const currentScore = getEnginScore(selectedEngin);
      await saveProfile({
        id: selectedEngin.id,
        enginId: selectedEngin.id,
        siteId: selectedEngin.siteId || selectedEngin.site || "SMI",
        healthScore: currentScore,
        notes: observations,
        lastChecked: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNotes(false);
    }
  };

  // Status colors helper
  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: "bg-emerald-500", text: "text-emerald-500", border: "border-emerald-500/20", lightBg: "bg-emerald-50 dark:bg-emerald-950/10" };
    if (score >= 50) return { bg: "bg-amber-500", text: "text-amber-500", border: "border-amber-500/20", lightBg: "bg-amber-50 dark:bg-amber-950/10" };
    return { bg: "bg-rose-500", text: "text-rose-500", border: "border-rose-500/20", lightBg: "bg-rose-50 dark:bg-rose-950/10" };
  };

  return (
    <div className="space-y-6">
      {hasLoadError && <DataLoadError />}
      <PageBanner
        icon={HeartPulse}
        badgeLabel="Indice Flotte"
        title="Carnet de Santé"
        subtitle="Indice de santé des engins calculé en temps réel par rapport à l'historique des pannes, aux heures de service et aux interventions de maintenance en cours."
        siteLabel={activeSite === "TOUS" ? "TOUS SITES" : activeSite}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left pane: Fleet List */}
        <Card className="relative overflow-hidden lg:col-span-4 h-[750px] flex flex-col bg-white dark:bg-slate-950 border border-[#D4AF37]/50 rounded-2xl shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
          <CardHeader className="pb-3 shrink-0">
            <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <HeartPulse className="h-4.5 w-4.5 text-rose-500" /> List des Équipements
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Sélectionnez un engin pour ouvrir sa fiche diagnostique complète.
            </CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher (Ex: LHD-11)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs h-9 bg-slate-50 dark:bg-slate-900/60"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {filteredEngins.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs uppercase tracking-widest font-mono">
                Aucun équipement trouvé
              </div>
            ) : (
              filteredEngins.map((engin) => {
                const score = getEnginScore(engin);
                const col = getScoreColor(score);
                const isSelected = engin.id === selectedEnginId;
                const activePannesCount = (pannes || []).filter(p => p.enginId === engin.id && p.statut !== "CLOS" && !p.deleted).length;
                const activeOrdersCount = (workorders || []).filter(w => (w.enginId === engin.id || w.enginId === engin.matricule) && (w.statut === "NON_FAIT" || w.statut === "EN_COURS") && !w.deleted).length;

                return (
                  <button
                    key={engin.id}
                    onClick={() => setSelectedEnginId(engin.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer group ${
                      isSelected 
                        ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm" 
                        : "bg-white dark:bg-slate-950/40 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 border-slate-100 dark:border-slate-900/60"
                    }`}
                  >
                    <div className="space-y-1 overflow-hidden min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-black text-xs md:text-sm text-slate-900 dark:text-white uppercase tracking-tight truncate">
                          {engin.matricule}
                        </span>
                        <Badge variant="outline" className="text-[9px] px-1.5 h-4.5 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-mono">
                          {engin.categorie || "LHD"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-550 font-mono">
                        <span>{engin.marque} {engin.type}</span>
                        <span>•</span>
                        <span>{engin.heuresMarche || engin.heures || engin.hours || engin.km || 0} hrs</span>
                      </div>
                      
                      {(activePannesCount > 0 || activeOrdersCount > 0) && (
                        <div className="flex gap-1.5 pt-1">
                          {activePannesCount > 0 && (
                            <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[8px] font-bold font-mono bg-rose-50 dark:bg-rose-950/15 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-950/30">
                              <span className="h-1 w-1 rounded-full bg-rose-500" />
                              {activePannesCount} P{activePannesCount > 1 ? "s" : ""}
                            </span>
                          )}
                          {activeOrdersCount > 0 && (
                            <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[8px] font-bold font-mono bg-sky-50 dark:bg-sky-950/15 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-950/30">
                              <span className="h-1 w-1 rounded-full bg-sky-500" />
                              {activeOrdersCount} BT{activeOrdersCount > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className={`text-base font-black tracking-tight ${col.text}`}>
                          {score}%
                        </div>
                        <span className="text-[8px] text-slate-400 uppercase tracking-wider block font-mono">
                          Santé
                        </span>
                      </div>
                      <ChevronRight className={`h-4 w-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-200 ${isSelected ? "text-slate-600 translate-x-0.5" : ""}`} />
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Right pane: Engine Diagnostic Sheet */}
        <div className="lg:col-span-8 space-y-6">
          {selectedEngin ? (
            <>
              {/* Core Health Banner CARD */}
              {(() => {
                const score = getEnginScore(selectedEngin);
                const col = getScoreColor(score);
                const activePannes = (pannes || []).filter(p => p.enginId === selectedEngin.id && p.statut !== "CLOS" && !p.deleted);
                const activeOrders = (workorders || []).filter(w => (w.enginId === selectedEngin.id || w.enginId === selectedEngin.matricule) && (w.statut === "NON_FAIT" || w.statut === "EN_COURS") && !w.deleted);

                return (
                  <Card className="relative overflow-hidden bg-white dark:bg-slate-950 border border-[#D4AF37]/50 shadow-md rounded-2xl">
                    <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
                    <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center justify-between">
                      
                      {/* Left: Metadata */}
                      <div className="space-y-4 text-center md:text-left">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                              {selectedEngin.matricule}
                            </h2>
                            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800">
                              <Truck className="h-3 w-3" /> {selectedEngin.categorie || "LHD"}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-450 border border-sky-100 dark:border-sky-900/35">
                              Secteur {selectedEngin.siteId || selectedEngin.site || "SMI"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            Registre technique : {selectedEngin.marque} {selectedEngin.type} • Modèle {selectedEngin.modele || "N/A"}
                          </p>
                        </div>

                        {/* Fast metrics */}
                        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto md:mx-0">
                          <div className="bg-white dark:bg-slate-900 border border-[#D4AF37]/40 p-2.5 rounded-xl shadow-xs relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-[#38BDF8]" />
                            <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase block font-mono">Heures Service</span>
                            <span className="text-xs font-black text-[#D4AF37] font-mono">{selectedEngin.heuresMarche || selectedEngin.heures || selectedEngin.hours || 0} h</span>
                          </div>
                          <div className="bg-white dark:bg-slate-900 border border-[#D4AF37]/40 p-2.5 rounded-xl shadow-xs relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-[#D4AF37]" />
                            <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase block font-mono">Dispo</span>
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">{selectedEngin.dispo !== undefined ? selectedEngin.dispo : 100}%</span>
                          </div>
                          <div className="bg-white dark:bg-slate-900 border border-[#D4AF37]/40 p-2.5 rounded-xl shadow-xs relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-[#991B1B]" />
                            <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase block font-mono">Anomalies</span>
                            <span className="text-xs font-black text-red-600 dark:text-red-400 font-mono">{activePannes.length}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Radial score representation */}
                      <div className="flex flex-col items-center gap-2 shrink-0 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-900/40 p-4 rounded-3xl">
                        <div className="relative flex items-center justify-center">
                          <svg className="w-24 h-24 transform -rotate-90">
                            {/* Background track circle */}
                            <circle
                              cx="48"
                              cy="48"
                              r="40"
                              className="stroke-slate-100 dark:stroke-slate-800/80 fill-none"
                              strokeWidth="10"
                            />
                            {/* Animated colored ring */}
                            <circle
                              cx="48"
                              cy="48"
                              r="40"
                              className={`fill-none transition-all duration-1000 ${
                                score >= 80 ? "stroke-emerald-500" : score >= 50 ? "stroke-amber-500" : "stroke-rose-500"
                              }`}
                              strokeWidth="10"
                              strokeDasharray={251.2}
                              strokeDashoffset={251.2 - (251.2 * score) / 100}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
                              {score}%
                            </span>
                          </div>
                        </div>
                        <div className="text-center">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-sans block">
                            INDICE GLOBAL
                          </span>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full inline-block mt-1 border ${col.lightBg} ${col.text} ${col.border}`}>
                            {score >= 80 ? "EXCELLENT" : score >= 50 ? "DEGRADÉ" : "CRITIQUE"}
                          </span>
                        </div>
                      </div>

                    </div>
                  </Card>
                );
              })()}

              {/* Subsystems Diagnosis Grid */}
              {(() => {
                const score = getEnginScore(selectedEngin);
                const activePannes = (pannes || []).filter(p => p.enginId === selectedEngin.id && p.statut !== "CLOS" && !p.deleted);

                // Analyze subsystems health
                const getSubsystemStatus = (name: string) => {
                  const relevantPannes = activePannes.filter(p => {
                    const cat = String(p.categorie || p.category || "").toUpperCase();
                    return cat.includes(name.toUpperCase());
                  });
                  if (relevantPannes.length > 0) {
                    const hasCrit = relevantPannes.some(p => ["critique", "haute", "élevée"].includes(String(p.gravite || "moyenne").toLowerCase()));
                    return { status: hasCrit ? "DANGER" : "AVERTISSEMENT", iconColor: hasCrit ? "text-rose-500" : "text-amber-500", issuesCount: relevantPannes.length };
                  }
                  return { status: "NOMINAL", iconColor: "text-emerald-500", issuesCount: 0 };
                };

                const subs = [
                  { id: "moteur", name: "Moteur & Admission", weight: "35%", icon: Cpu, diagnosis: getSubsystemStatus("MOTEUR") },
                  { id: "hydraulique", name: "Système Hydraulique", weight: "30%", icon: Activity, diagnosis: getSubsystemStatus("HYDRAULIQUE") },
                  { id: "transmission", name: "Ligne de Transmission", weight: "15%", icon: Disc, diagnosis: getSubsystemStatus("TRANSMISSION") },
                  { id: "electrique", name: "Réseau Électrique", weight: "10%", icon: Zap, diagnosis: getSubsystemStatus("ÉLECTRIQUE") },
                  { id: "structure", name: "Châssis & Structure", weight: "10%", icon: Shield, diagnosis: getSubsystemStatus("STRUCTURE") },
                ];

                return (
                  <Card className="relative overflow-hidden bg-white dark:bg-slate-950 border border-[#D4AF37]/50 rounded-2xl shadow-sm">
                    <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Diagnostic Organes & Sous-Systèmes
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        État calculé à partir des pannes déclarées, alertes et de la pondération de sécurité de l'engin.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      {subs.map((sub) => {
                        const Icon = sub.icon;
                        const statusColor = sub.diagnosis.status === "DANGER" 
                          ? "border-rose-100 dark:border-rose-950/20 bg-rose-50/30 dark:bg-rose-950/5 text-rose-600" 
                          : sub.diagnosis.status === "AVERTISSEMENT"
                          ? "border-amber-100 dark:border-amber-950/20 bg-amber-50/30 dark:bg-amber-950/5 text-amber-600"
                          : "border-emerald-100 dark:border-emerald-950/15 bg-emerald-50/20 dark:bg-emerald-950/5 text-emerald-600";

                        return (
                          <div
                            key={sub.id}
                            className={`p-4 rounded-2xl border text-center flex flex-col justify-between items-center space-y-3 ${statusColor}`}
                          >
                            <div className="flex flex-col items-center space-y-1.5">
                              <div className={`p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs ${sub.diagnosis.iconColor}`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <span className="text-[10px] font-black text-slate-800 dark:text-slate-100 block truncate max-w-[120px] font-sans">
                                {sub.name}
                              </span>
                            </div>

                            <div className="space-y-1 w-full">
                              <div className="flex justify-between items-center text-[8px] font-mono font-bold text-slate-400 dark:text-slate-500 border-b border-dashed border-slate-200 dark:border-slate-800/80 pb-1">
                                <span>PONDÉRATION</span>
                                <span>{sub.weight}</span>
                              </div>
                              
                              <div className="pt-1 flex items-center justify-center gap-1">
                                {sub.diagnosis.status === "NOMINAL" ? (
                                  <span className="text-[9px] font-black tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
                                    NOMINAL
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-black font-mono">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    {sub.diagnosis.issuesCount} ANOMALIE{sub.diagnosis.issuesCount > 1 ? "S" : ""}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Grid with breakdown logs & save notes */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Save Diagnostics Notes */}
                <Card className="relative overflow-hidden md:col-span-6 bg-white dark:bg-slate-950 border border-[#D4AF37]/50 rounded-2xl shadow-sm flex flex-col justify-between">
                  <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <MessageSquare className="h-4.5 w-4.5 text-sky-500" /> Observations & Notes
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Consignez les observations de surveillance mécanique, contrôles d'usure ou consignes opérationnelles.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1">
                    <textarea
                      placeholder="Saisissez vos observations pour cette fiche diagnostique (consignes, vibrations, état batterie, usure châssis)..."
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      rows={5}
                      className="w-full text-xs font-sans rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-150 dark:border-slate-850 p-3.5 focus:ring-1 focus:ring-sky-500 outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                    />
                    <div className="flex justify-end pt-2">
                      <Button
                        size="sm"
                        onClick={handleSaveNotes}
                        disabled={savingNotes}
                        className="bg-sky-520 hover:bg-sky-600 text-white font-black text-[11px] uppercase tracking-wider rounded-xl h-9.5 px-4 flex items-center gap-1.5 border-none"
                      >
                        {savingNotes ? (
                          <span>Enregistrement...</span>
                        ) : (
                          <>
                            <Save className="h-3.5 w-3.5" />
                            <span>Enregistrer la Fiche</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* active incidents logs */}
                <Card className="relative overflow-hidden md:col-span-6 bg-white dark:bg-slate-950 border border-[#D4AF37]/50 rounded-2xl shadow-sm flex flex-col justify-between">
                  <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <Wrench className="h-4.5 w-4.5 text-amber-500" /> Anomalies & BT Actifs
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Liste des pannes non résolues et des bons de travaux affectés à cet engin.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto max-h-[220px] p-4 space-y-3">
                    {(() => {
                      const activePannes = (pannes || []).filter(p => p.enginId === selectedEngin.id && p.statut !== "CLOS" && !p.deleted);
                      const activeOrders = (workorders || []).filter(w => (w.enginId === selectedEngin.id || w.enginId === selectedEngin.matricule) && (w.statut === "NON_FAIT" || w.statut === "EN_COURS") && !w.deleted);

                      if (activePannes.length === 0 && activeOrders.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center py-8 text-slate-400 text-center space-y-2">
                            <CheckCircle className="h-7 w-7 text-emerald-500 animate-pulse" />
                            <p className="text-[10px] font-mono uppercase tracking-widest">Aucun incident à signaler</p>
                            <p className="text-[9px] text-slate-500 uppercase">L'engin est apte et opérationnel</p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-2">
                          {activePannes.map(p => (
                            <div key={p.id} className="p-3 rounded-xl bg-rose-50/20 dark:bg-rose-950/5 border border-rose-100/40 dark:border-rose-900/20 text-left flex justify-between gap-2 items-center">
                              <div className="space-y-0.5 min-w-0">
                                <span className="text-[8px] font-mono font-bold text-rose-500 uppercase">
                                  PANNE • {p.categorie || p.subSystem || "Organe"}
                                </span>
                                <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase truncate">
                                  {p.description || "Pas de description"}
                                </h4>
                              </div>
                              <Badge className="bg-rose-500 text-white font-mono text-[8px] tracking-wider px-1.5 shrink-0">
                                {p.gravite || "MOYENNE"}
                              </Badge>
                            </div>
                          ))}

                          {activeOrders.map(bt => (
                            <div key={bt.id} className="p-3 rounded-xl bg-sky-50/20 dark:bg-sky-950/5 border border-sky-100/40 dark:border-rose-900/20 text-left flex justify-between gap-2 items-center">
                              <div className="space-y-0.5 min-w-0">
                                <span className="text-[8px] font-mono font-bold text-sky-500 uppercase">
                                  BON TRAVAIL • BT-{bt.id.substring(0, 4).toUpperCase()}
                                </span>
                                <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase truncate">
                                  {bt.label || bt.title || bt.description}
                                </h4>
                              </div>
                              <Badge className="bg-sky-500 text-white font-mono text-[8px] tracking-wider px-1.5 shrink-0">
                                {bt.statut || bt.status || "PLANIFIÉ"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

              </div>
            </>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-850 p-12 rounded-3xl text-center h-[500px] flex flex-col justify-center items-center">
              <HeartPulse className="h-10 w-10 text-slate-300 dark:text-slate-700 animate-pulse mb-3" />
              <p className="text-xs font-mono uppercase tracking-widest text-slate-400">Aucun engin sélectionné</p>
              <p className="text-[10px] text-slate-500 uppercase mt-1">Sélectionnez un engin dans le panneau de gauche pour afficher son diagnostic</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
