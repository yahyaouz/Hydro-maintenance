import * as React from "react";
import { 
  HelpCircle, 
  Plus, 
  Trash2, 
  CheckCircle, 
  FileText, 
  Users, 
  Wrench, 
  Sparkles, 
  ChevronRight, 
  ArrowRight,
  ClipboardList,
  AlertTriangle,
  User,
  X,
  Search,
  Save,
  Check,
  Zap,
  Info
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store";
import { useCollection } from "@/hooks/useCollection";
import { useRCA } from "@/hooks/useRCA";
import { PageBanner } from "@/components/ui/PageBanner";
import { RootCauseAnalysis as RCAType } from "@/components/types_gmao";
import { toast } from "sonner";

export function RootCauseAnalysis() {
  const { user, activeSite } = useAuthStore();
  const { rcas, loading, saveRCA, deleteRCA } = useRCA();

  // Load existing workorders & engines to link
  const { data: workorders } = useCollection<any>("workorders");
  const { data: engins } = useCollection<any>("engins");

  const [selectedRcaId, setSelectedRcaId] = React.useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [generatingAI, setGeneratingAI] = React.useState(false);

  // Form State
  const [workOrderId, setWorkOrderId] = React.useState("");
  const [machineCode, setMachineCode] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [teamInput, setTeamInput] = React.useState("");
  const [problemDescription, setProblemDescription] = React.useState("");
  const [fiveWhys, setFiveWhys] = React.useState<string[]>(["", "", "", "", ""]);
  const [rootCause, setRootCause] = React.useState("");
  const [preventiveActionsInput, setPreventiveActionsInput] = React.useState("");

  const selectedRca = React.useMemo(() => {
    return rcas.find(r => r.id === selectedRcaId) || null;
  }, [rcas, selectedRcaId]);

  // Set first RCA if none selected on load
  React.useEffect(() => {
    if (!selectedRcaId && rcas.length > 0) {
      const filtered = rcas.filter(r => {
        if (!activeSite || activeSite === "TOUS") return true;
        return r.siteId === activeSite;
      });
      if (filtered.length > 0) {
        setSelectedRcaId(filtered[0].id);
      } else {
        setSelectedRcaId(rcas[0].id);
      }
    }
  }, [rcas, selectedRcaId, activeSite]);

  // Filter RCAs based on search & site
  const filteredRcas = React.useMemo(() => {
    return rcas.filter(r => {
      // 1. Site isolation
      if (activeSite && activeSite !== "TOUS") {
        if (r.siteId !== activeSite) return false;
      }
      // 2. Search
      const q = searchTerm.toLowerCase().trim();
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.machineCode.toLowerCase().includes(q) ||
        r.workOrderId.toLowerCase().includes(q)
      );
    });
  }, [rcas, activeSite, searchTerm]);

  // Auto-fill machine code if work order selected
  React.useEffect(() => {
    if (workOrderId && workorders) {
      const wo = workorders.find(w => w.id === workOrderId);
      if (wo) {
        setMachineCode(wo.machineCode || wo.enginMatricule || "");
        if (!title) {
          setTitle(`Analyse RCA - Défaillance ${wo.machineCode || ""} (${wo.title || ""})`);
        }
      }
    }
  }, [workOrderId, workorders, title]);

  const handleGenerateAIAnalysis = async (rca: RCAType) => {
    // CORRECTION 2 — COMMENTAIRE EXPLICATIF STRUCTURÉ DU MOCK IA :
    // ANALYSE IA SIMULÉE — Cette fonctionnalité est simulée localement (mock) pour l'instant.
    // Elle sera entièrement interfacée avec l'assistant centralisé Hydromines basé sur le modèle
    // de langage Gemini API au SPRINT 6 (Intégration & Assistant Intelligent) afin d'évaluer 
    // dynamiquement la pertinence des 5 Pourquoi et de suggérer des actions correctives éprouvées.
    
    setGeneratingAI(true);
    toast.info("L'assistant Hydromines analyse les causes racines...");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const aiReport = `### RAPPORT D'ANALYSE IA ASSISTÉE — SOU-GMAO ASSISTANT
*Émis automatiquement pour le chantier ${rca.siteId}*

**1. Pertinence des 5 Pourquoi :**
- La décomposition causale est de haute qualité. Le cheminement entre la panne de surface et la cause racine organisationnelle (${rca.rootCause}) est valide sur le plan thermodynamique et mécanique.

**2. Analyse Technique Générée :**
- L'incident est symptomatique d'une fatigue mécanique accélérée par des conditions ambiantes sévères (humidité élevée sous terre et abrasion due aux particules de minerai).
- Le délai moyen d'intervention (MTTR) sur ce type d'organe aurait pu être réduit de 20% si un kit de rechange standardisé avait été stocké au point d'ancrage chantier.

**3. Suggestions d'Actions Correctives Supplémentaires :**
- **Action IA 1 :** Mettre en place un capteur de vibration haute fréquence sur l'arbre de transmission pour détecter les anomalies de charge 15h avant défaillance.
- **Action IA 2 :** Former les opérateurs à la ronde visuelle de graissage d'urgence au début de chaque poste de travail souterrain.
- **Action IA 3 :** Réviser la périodicité du changement de joints d'étanchéité de 250h à 180h pour l'exploitation en milieu acide.`;

    try {
      await saveRCA({
        ...rca,
        aiAnalysis: aiReport,
        updatedAt: new Date().toISOString()
      });
      toast.success("Analyse IA générée et intégrée au rapport RCA !");
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleCreateRCA = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !machineCode.trim()) {
      toast.error("Le titre et le code machine sont requis.");
      return;
    }

    const newRca: RCAType = {
      id: "rca_" + Math.random().toString(36).substring(2, 9),
      workOrderId,
      machineCode: machineCode.toUpperCase().trim(),
      title: title.trim(),
      status: "BROUILLON",
      team: teamInput.split(",").map(t => t.trim()).filter(Boolean),
      problemDescription: problemDescription.trim(),
      fiveWhys,
      rootCause: rootCause.trim(),
      preventiveActions: preventiveActionsInput.split("\n").map(a => a.trim()).filter(Boolean),
      siteId: activeSite === "TOUS" ? "SMI" : activeSite,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await saveRCA(newRca);
      setIsCreateOpen(false);
      setSelectedRcaId(newRca.id);
      
      // Reset
      setWorkOrderId("");
      setMachineCode("");
      setTitle("");
      setTeamInput("");
      setProblemDescription("");
      setFiveWhys(["", "", "", "", ""]);
      setRootCause("");
      setPreventiveActionsInput("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (rca: RCAType, newStatus: "BROUILLON" | "COMPLÉTÉ" | "APPROUVÉ") => {
    try {
      await saveRCA({
        ...rca,
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      toast.success(`Statut mis à jour : ${newStatus}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce rapport RCA ?")) return;
    try {
      await deleteRCA(id);
      setSelectedRcaId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleWhyChange = (index: number, val: string) => {
    const updated = [...fiveWhys];
    updated[index] = val;
    setFiveWhys(updated);
  };

  return (
    <div className="space-y-6">
      <PageBanner
        icon={HelpCircle}
        badgeLabel="Méthodologie RCA"
        title="Causes Racines (RCA)"
        subtitle="Fiches d'analyses de pannes critiques basées sur l'algorithme des '5 Pourquoi' pour éradiquer les défaillances répétitives chantiers."
        siteLabel={activeSite === "TOUS" ? "TOUS SITES" : activeSite}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: list panel */}
        <Card className="lg:col-span-4 h-[750px] flex flex-col bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-900 shadow-sm">
          <CardHeader className="pb-3 shrink-0">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="h-4.5 w-4.5 text-sky-500 animate-spin" style={{ animationDuration: '4s' }} /> Dossiers RCA
              </CardTitle>
              {["ADMIN", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER"].includes(user?.role || "") && (
                <Button
                  size="sm"
                  onClick={() => setIsCreateOpen(true)}
                  className="bg-sky-520 hover:bg-sky-650 text-white font-black text-[10px] rounded-lg h-7.5 uppercase px-2.5 flex items-center gap-1 border-none cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Créer RCA
                </Button>
              )}
            </div>
            <CardDescription className="text-xs text-slate-500">
              Analyses méticuleuses de défaillances pour éliminer les récurrences mécaniques.
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
            {filteredRcas.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs uppercase tracking-widest font-mono">
                Aucun dossier RCA
              </div>
            ) : (
              filteredRcas.map((r) => {
                const isSelected = r.id === selectedRcaId;
                const dateStr = new Date(r.createdAt).toLocaleDateString("fr-FR", { day: '2-digit', month: '2-digit' });
                
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRcaId(r.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer group ${
                      isSelected 
                        ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm" 
                        : "bg-white dark:bg-slate-950/40 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 border-slate-100 dark:border-slate-900/60"
                    }`}
                  >
                    <div className="space-y-1 overflow-hidden min-w-0 pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-sans font-black text-xs text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[150px]">
                          {r.title}
                        </span>
                        <Badge variant="outline" className={`text-[8px] font-mono tracking-wider h-4 px-1.5 rounded uppercase ${
                          r.status === "APPROUVÉ" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          r.status === "COMPLÉTÉ" ? "bg-sky-50 text-sky-600 border-sky-100" :
                          "bg-amber-50 text-amber-600 border-amber-100"
                        }`}>
                          {r.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span>Engin : {r.machineCode}</span>
                        <span>•</span>
                        <span>{dateStr}</span>
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-200 ${isSelected ? "text-slate-600 translate-x-0.5" : ""}`} />
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Right: detailed report */}
        <div className="lg:col-span-8">
          {selectedRca ? (
            <Card className="bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-900 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 dark:border-slate-900/60 pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-50 dark:bg-rose-950/15 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-950/30">
                        ANALYSE D'ÉVÉNEMENT CRITIQUE
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        RCA ID : {selectedRca.id.toUpperCase()}
                      </span>
                    </div>
                    <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      {selectedRca.title}
                    </h2>
                    <p className="text-xs text-slate-400">
                      Rattaché à l'équipement : <strong className="text-slate-700 dark:text-slate-300 font-bold">{selectedRca.machineCode}</strong> • Bon de travail : <strong className="text-slate-700 dark:text-slate-300 font-mono font-bold">{selectedRca.workOrderId || "NON ASSOCIÉ"}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Status switcher */}
                    {["ADMIN", "RESPONSABLE_MAINTENANCE"].includes(user?.role || "") ? (
                      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
                        <Button
                          size="sm"
                          variant={selectedRca.status === "BROUILLON" ? "secondary" : "ghost"}
                          onClick={() => handleUpdateStatus(selectedRca, "BROUILLON")}
                          className="h-7 text-[9px] font-black uppercase px-2 rounded-lg"
                        >
                          Brouillon
                        </Button>
                        <Button
                          size="sm"
                          variant={selectedRca.status === "COMPLÉTÉ" ? "secondary" : "ghost"}
                          onClick={() => handleUpdateStatus(selectedRca, "COMPLÉTÉ")}
                          className="h-7 text-[9px] font-black uppercase px-2 rounded-lg"
                        >
                          Complété
                        </Button>
                        <Button
                          size="sm"
                          variant={selectedRca.status === "APPROUVÉ" ? "secondary" : "ghost"}
                          onClick={() => handleUpdateStatus(selectedRca, "APPROUVÉ")}
                          className="h-7 text-[9px] font-black uppercase px-2 rounded-lg"
                        >
                          Approuvé
                        </Button>
                      </div>
                    ) : (
                      <Badge className={`text-xs font-black uppercase px-3 py-1.5 rounded-xl border ${
                        selectedRca.status === "APPROUVÉ" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        selectedRca.status === "COMPLÉTÉ" ? "bg-sky-50 text-sky-600 border-sky-100" :
                        "bg-amber-50 text-amber-600 border-amber-100"
                      }`}>
                        {selectedRca.status}
                      </Badge>
                    )}

                    {["ADMIN", "RESPONSABLE_MAINTENANCE"].includes(user?.role || "") && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(selectedRca.id)}
                        className="h-8.5 w-8.5 text-rose-500 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-100 rounded-xl cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 md:p-8 space-y-6">
                
                {/* Team & problem description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-900 space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-slate-500" /> ÉQUIPE D'ANALYSE
                    </span>
                    {selectedRca.team.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Aucun membre assigné</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedRca.team.map((member, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-[10px] font-black bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-350 px-2 py-0.5 rounded-md border border-slate-150 dark:border-slate-850">
                            <User className="h-2.5 w-2.5" /> {member}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-900 space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <ClipboardList className="h-3.5 w-3.5 text-slate-500" /> DESCRIPTION DU PROBLÈME (SITUATIONAL ANALYSIS)
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans font-medium">
                      {selectedRca.problemDescription || "Non spécifié"}
                    </p>
                  </div>
                </div>

                {/* The Five Whys Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <HelpCircle className="h-4.5 w-4.5 text-sky-500" /> L'Algorithme des 5 Pourquoi
                  </h3>
                  <div className="space-y-3 relative before:absolute before:top-2 before:bottom-2 before:left-5 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-900">
                    {selectedRca.fiveWhys.map((why, index) => {
                      if (!why) return null;
                      return (
                        <div key={index} className="flex items-start gap-4 relative z-10 animate-in fade-in slide-in-from-left-2 duration-300">
                          <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 text-slate-800 dark:text-slate-100 font-mono font-black text-xs flex items-center justify-center">
                            W{index + 1}
                          </div>
                          <div className="flex-1 bg-slate-50/40 dark:bg-slate-900/10 border border-slate-100/60 dark:border-slate-900/60 p-3 rounded-2xl">
                            <span className="text-[8px] font-bold text-slate-400 block font-mono">POURQUOI ?</span>
                            <p className="text-xs text-slate-800 dark:text-slate-200 font-sans font-semibold mt-0.5">
                              {why}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Root cause and preventive actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-50 dark:border-slate-900/60 pt-6">
                  
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="h-4.5 w-4.5 text-rose-500" /> CAUSE RACINE IDENTIFIÉE
                    </h4>
                    <div className="bg-rose-50/20 dark:bg-rose-950/5 border border-rose-100/40 dark:border-rose-900/20 p-4 rounded-2xl">
                      <p className="text-xs font-sans font-extrabold text-slate-800 dark:text-slate-200 leading-relaxed uppercase">
                        {selectedRca.rootCause || "Analyse en cours..."}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Wrench className="h-4.5 w-4.5 text-emerald-500" /> PLAN D'ACTIONS PRÉVENTIVES
                    </h4>
                    {selectedRca.preventiveActions.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Aucune action planifiée</p>
                    ) : (
                      <ul className="space-y-2">
                        {selectedRca.preventiveActions.map((act, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-350 leading-relaxed">
                            <ArrowRight className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                </div>

                {/* Gemini intelligent assistant analysis */}
                <div className="border-t border-slate-50 dark:border-slate-900/60 pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="h-4.5 w-4.5 text-purple-500 animate-pulse" /> Diagnostic & Recommandations IA
                    </h3>
                    {!selectedRca.aiAnalysis && (
                      <Button
                        size="sm"
                        onClick={() => handleGenerateAIAnalysis(selectedRca)}
                        disabled={generatingAI}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl h-8 px-3 flex items-center gap-1 border-none cursor-pointer"
                      >
                        <Zap className="h-3.5 w-3.5" />
                        {generatingAI ? "Calcul en cours..." : "Générer Analyse IA"}
                      </Button>
                    )}
                  </div>

                  {selectedRca.aiAnalysis ? (
                    <div className="bg-purple-50/20 dark:bg-purple-950/5 border border-purple-100/40 dark:border-purple-900/20 rounded-2xl p-5 relative overflow-hidden text-left">
                      <div className="absolute top-0 right-0 h-20 w-20 bg-purple-500/5 rounded-full blur-xl" />
                      <div className="text-xs font-sans text-slate-700 dark:text-slate-300 space-y-3 whitespace-pre-line leading-relaxed">
                        {selectedRca.aiAnalysis}
                      </div>
                      
                      {/* Regeneration button */}
                      <div className="mt-4 pt-3 border-t border-purple-100/30 flex justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleGenerateAIAnalysis(selectedRca)}
                          disabled={generatingAI}
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/20 font-bold text-[9px] uppercase tracking-wider h-7"
                        >
                          <Zap className="h-3.5 w-3.5 mr-1" /> Régénérer l'analyse
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-900 p-6 rounded-2xl text-center space-y-2">
                      <Sparkles className="h-6 w-6 text-purple-400 mx-auto animate-pulse" />
                      <p className="text-[11px] text-slate-400 uppercase tracking-widest font-mono">Assistance IA Non Générée</p>
                      <p className="text-[9px] text-slate-500 uppercase max-w-sm mx-auto">Activez l'analyse IA pour évaluer la qualité des 5 Pourquoi et recevoir des préconisations constructives de prévention.</p>
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-850 p-12 rounded-3xl text-center h-[500px] flex flex-col justify-center items-center">
              <HelpCircle className="h-10 w-10 text-slate-300 dark:text-slate-700 animate-bounce mb-3" />
              <p className="text-xs font-mono uppercase tracking-widest text-slate-400">Aucune analyse RCA sélectionnée</p>
              <p className="text-[10px] text-slate-500 uppercase mt-1">Sélectionnez un dossier RCA dans le volet latéral ou créez un nouveau dossier</p>
            </div>
          )}
        </div>
      </div>

      {/* Creation Modal / Dialog */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)} />
          
          {/* Content */}
          <Card className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 shadow-2xl rounded-3xl overflow-hidden max-h-[90vh] flex flex-col">
            <CardHeader className="border-b border-slate-100 dark:border-slate-900 shrink-0">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="h-4.5 w-4.5 text-sky-500" /> Ouvrir une Analyse de Cause (RCA)
                </CardTitle>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsCreateOpen(false)}
                  className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Saisissez les éléments d'investigation pour isoler la cause fondamentale de la panne.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-y-auto p-6 space-y-4">
              <form onSubmit={handleCreateRCA} className="space-y-4">
                
                {/* Linked work order selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Bons de Travaux (BT) Associé</label>
                    <select
                      value={workOrderId}
                      onChange={(e) => setWorkOrderId(e.target.value)}
                      className="w-full text-xs h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 px-3 outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 dark:text-slate-100"
                    >
                      <option value="">-- Sélectionner un Bon (Optionnel) --</option>
                      {(workorders || []).filter(w => !activeSite || activeSite === "TOUS" || w.siteId === activeSite).map(w => (
                        <option key={w.id} value={w.id}>
                          {w.machineCode || "Engin"} - {w.title || w.description} ({w.id.substring(0, 5).toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Équipement / Engin</label>
                    <select
                      value={machineCode}
                      onChange={(e) => setMachineCode(e.target.value)}
                      className="w-full text-xs h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 px-3 outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 dark:text-slate-100"
                      required
                    >
                      <option value="">-- Sélectionner l'Équipement --</option>
                      {(engins || []).filter(e => !activeSite || activeSite === "TOUS" || (e.siteId || e.site || "").toUpperCase() === activeSite.toUpperCase()).map(e => (
                        <option key={e.id} value={e.matricule}>
                          {e.matricule} ({e.marque} {e.type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Titre de l'Analyse RCA</label>
                  <Input
                    placeholder="Ex: Analyse d'incident LHD-12 rupture de flexible hydraulique"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="text-xs h-10 bg-slate-50 dark:bg-slate-900/60 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Équipe d'Analyse (Membres séparés par des virgules)</label>
                  <Input
                    placeholder="Ex: Yassine B., Marc L., Karim T."
                    value={teamInput}
                    onChange={(e) => setTeamInput(e.target.value)}
                    className="text-xs h-10 bg-slate-50 dark:bg-slate-900/60 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Description du Problème</label>
                  <textarea
                    placeholder="Décrivez précisément l'événement déclencheur, l'heure, les circonstances..."
                    value={problemDescription}
                    onChange={(e) => setProblemDescription(e.target.value)}
                    rows={2}
                    className="w-full text-xs font-sans rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-150 dark:border-slate-850 p-3.5 focus:ring-1 focus:ring-sky-500 outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                  />
                </div>

                {/* 5 Whys fields */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Séquence des 5 Pourquoi (Causalité ascendante)</label>
                  <div className="space-y-2">
                    {fiveWhys.map((why, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <span className="text-[10px] font-bold font-mono text-slate-400 w-8">P{index + 1}</span>
                        <Input
                          placeholder={`Pourquoi l'étape précédente s'est-elle produite ?`}
                          value={why}
                          onChange={(e) => handleWhyChange(index, e.target.value)}
                          className="text-xs h-9 bg-slate-50 dark:bg-slate-900/60 rounded-xl flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Cause Racine Fondamentale</label>
                  <Input
                    placeholder="Ex: Absence de routine de lubrification du roulement dans le carnet de graissage hebdomadaire."
                    value={rootCause}
                    onChange={(e) => setRootCause(e.target.value)}
                    className="text-xs h-10 bg-slate-50 dark:bg-slate-900/60 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Actions Préventives Planifiées (Une action par ligne)</label>
                  <textarea
                    placeholder="Ex: Intégrer la buse de graissage n°4 dans les fiches systématiques souterraines&#10;Former les équipes au contrôle de température infrarouge"
                    value={preventiveActionsInput}
                    onChange={(e) => setPreventiveActionsInput(e.target.value)}
                    rows={3}
                    className="w-full text-xs font-sans rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-150 dark:border-slate-850 p-3.5 focus:ring-1 focus:ring-sky-500 outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-900">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsCreateOpen(false)}
                    className="text-xs font-black uppercase rounded-xl h-10"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="bg-sky-520 hover:bg-sky-650 text-white font-black text-xs uppercase tracking-wider rounded-xl h-10 px-5 flex items-center gap-1.5 border-none"
                  >
                    <Save className="h-4 w-4" />
                    <span>Créer le Rapport RCA</span>
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}
