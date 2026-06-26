import * as React from "react";
import { 
  Wrench, Search, AlertTriangle, HelpCircle, Check, CheckCircle2, 
  ChevronRight, RefreshCw, Eye, BookOpen, Clock, Flame, 
  Ban, ShieldAlert, Thermometer, Printer, ArrowUp, Info, 
  Play, Plus, Minus, ThumbsUp, Layers, CheckCircle, FileText
} from "lucide-react";
import { 
  GLOSSARY_ITEMS, SCHEMATICS_PIECES, QUICK_FIXES, 
  TORQUES_DATA, COMMON_ERRORS, PANNES_DATA, Panne, GlossaryItem, QuickFix
} from "./assistantData";
import { motion, AnimatePresence } from "motion/react";
import { PageBanner } from "@/components/ui/PageBanner";
import { useAuthStore } from "@/lib/store";
import { HydrominesLogo } from "./auth/HydrominesLogo";
import { AssistantEpiroc } from "./AssistantEpiroc";
import { AssistantEpirocSt2d } from "./AssistantEpirocSt2d";
import { AssistantEpirocSt7 } from "./AssistantEpirocSt7";

export function AssistantMecanicien() {
  const { activeSite } = useAuthStore();
  
  // 🚂 Active machine selector
  const [activeMachine, setActiveMachine] = React.useState<"montabert" | "epiroc" | "epiroc_st2d" | "epiroc_st7">("montabert");

  // 🚨 Emergency Mode state
  const [isEmergencyMode, setIsEmergencyMode] = React.useState(false);

  // 📋 Triage state
  const [triageAnswers, setTriageAnswers] = React.useState<{ [key: string]: string }>({});

  // 🔍 Selected schematic zone
  const [selectedZone, setSelectedZone] = React.useState<"A" | "B" | "C" | "D" | "E" | null>(null);

  // 📖 Glossary search
  const [glossarySearch, setGlossarySearch] = React.useState("");

  // 🗺️ Diagnostic tree states
  const [diagStep1, setDiagStep1] = React.useState<string | null>(null);
  const [diagStep2, setDiagStep2] = React.useState<string | null>(null);

  // 🛠️ Pannes Matrix search & filters
  const [panneSearch, setPanneSearch] = React.useState("");
  const [selectedSystem, setSelectedSystem] = React.useState<string>("TOUS");
  const [selectedSeverity, setSelectedSeverity] = React.useState<string>("TOUS");
  const [selectedTimeFilter, setSelectedTimeFilter] = React.useState<string>("TOUS");

  // 📦 Stock state (persisted in LocalStorage)
  const [stock, setStock] = React.useState<{ [key: string]: number }>(() => {
    const saved = localStorage.getItem("montabert_t23_stock");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      "kit-joints": 3,
      "soupapes": 2,
      "bague-guidage": 1,
      "bushing": 2,
      "retainers": 4,
      "joints-section": 6,
      "graisse": 8,
      "boulons-section": 2,
      "raccords": 4
    };
  });

  React.useEffect(() => {
    localStorage.setItem("montabert_t23_stock", JSON.stringify(stock));
  }, [stock]);

  const updateStock = (key: string, delta: number) => {
    setStock(prev => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta)
    }));
  };

  // 📋 Preventative checklists state
  const [prevChecklist, setPrevChecklist] = React.useState<{ [key: string]: boolean }>(() => {
    const saved = localStorage.getItem("montabert_t23_prev_checklist");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {};
  });

  React.useEffect(() => {
    localStorage.setItem("montabert_t23_prev_checklist", JSON.stringify(prevChecklist));
  }, [prevChecklist]);

  const togglePrevCheck = (key: string) => {
    setPrevChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // ✍️ Validation Form logs
  const [validationForm, setValidationForm] = React.useState({
    test1: false, test2: false, test3: false, test4: false, test5: false, test6: false,
    mecanicienName: "",
    validationDate: "",
    notes: ""
  });
  const [validationLogs, setValidationLogs] = React.useState<any[]>(() => {
    const saved = localStorage.getItem("montabert_t23_validation_logs");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  React.useEffect(() => {
    localStorage.setItem("montabert_t23_validation_logs", JSON.stringify(validationLogs));
  }, [validationLogs]);

  const saveValidationLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validationForm.mecanicienName) return;
    const newLog = {
      id: Date.now(),
      ...validationForm,
      date: validationForm.validationDate || new Date().toISOString().split('T')[0]
    };
    setValidationLogs(prev => [newLog, ...prev]);
    // reset form partially
    setValidationForm({
      test1: false, test2: false, test3: false, test4: false, test5: false, test6: false,
      mecanicienName: "",
      validationDate: "",
      notes: ""
    });
  };

  // Filter pannes based on Emergency mode and manual filters
  const filteredPannes = React.useMemo(() => {
    return PANNES_DATA.filter(p => {
      // 🚨 EMERGENCY FILTER: Only show red severity in emergency mode
      if (isEmergencyMode) {
        if (p.severity !== "ROUGE") return false;
      }

      // Manual filters
      if (selectedSystem !== "TOUS" && p.system !== selectedSystem) return false;
      if (selectedSeverity !== "TOUS" && p.severity !== selectedSeverity) return false;
      if (selectedTimeFilter !== "TOUS") {
        if (selectedTimeFilter === "SHORT" && p.repTime > 1) return false;
        if (selectedTimeFilter === "MEDIUM" && (p.repTime <= 1 || p.repTime > 2.5)) return false;
        if (selectedTimeFilter === "LONG" && p.repTime <= 2.5) return false;
      }

      // Search matching
      if (panneSearch.trim()) {
        const query = panneSearch.toLowerCase();
        return (
          p.title.toLowerCase().includes(query) ||
          p.id.includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.symptoms.toLowerCase().includes(query) ||
          p.partsInvolved.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [isEmergencyMode, selectedSystem, selectedSeverity, selectedTimeFilter, panneSearch]);

  // Jump helper
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 font-sans print:bg-white print:text-black">
      
      {/* Tab Switcher at the very top of Assistant Mecaniciens */}
      <div className="mx-4 md:mx-6 mt-4 pt-4 flex flex-wrap gap-2 border-b border-slate-200 pb-3 print:hidden">
        <button
          onClick={() => setActiveMachine("montabert")}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
            activeMachine === "montabert"
              ? "bg-amber-500 text-white border-amber-600 shadow-sm"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
          }`}
        >
          ⛏️ MONTABERT T23
        </button>
        <button
          onClick={() => setActiveMachine("epiroc")}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
            activeMachine === "epiroc"
              ? "bg-amber-500 text-white border-amber-600 shadow-sm"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
          }`}
        >
          🚜 EPIROC ST2G
        </button>
        <button
          onClick={() => setActiveMachine("epiroc_st2d")}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
            activeMachine === "epiroc_st2d"
              ? "bg-amber-500 text-white border-amber-600 shadow-sm"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
          }`}
        >
          🚜 EPIROC ST2D
        </button>
        <button
          onClick={() => setActiveMachine("epiroc_st7")}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
            activeMachine === "epiroc_st7"
              ? "bg-amber-500 text-white border-amber-600 shadow-sm"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
          }`}
        >
          🚜 EPIROC ST7
        </button>
      </div>

      {activeMachine === "epiroc" ? (
        <AssistantEpiroc />
      ) : activeMachine === "epiroc_st2d" ? (
        <AssistantEpirocSt2d />
      ) : activeMachine === "epiroc_st7" ? (
        <AssistantEpirocSt7 />
      ) : (
        <>
          {/* 🚀 PAGE BANNER */}
          <div className="p-4 md:p-6 pb-0 print:hidden">
        <PageBanner
          icon={Wrench}
          badgeLabel="ASSISTANT TECHNIQUE"
          title="Assistant Mécanicien"
          subtitle="Référence Chantier • Perforateur Pneumatique de Mine (23 kg) • Montabert T23"
          siteLabel={activeSite === 'TOUS' ? 'TOUS LES SITES' : activeSite}
          logo={<HydrominesLogo size={110} variant="full" className="mb-1" />}
        >
          <button
            onClick={() => setIsEmergencyMode(!isEmergencyMode)}
            className={`px-4 h-10 rounded-lg font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 shadow-md cursor-pointer ${
              isEmergencyMode 
                ? "bg-rose-600 text-white animate-bounce border border-white" 
                : "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-white animate-pulse" />
            <span>{isEmergencyMode ? "⚠️ MODE URGENCE" : "🚨 ACTIVER URGENCE"}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="h-10 px-3 bg-slate-850 hover:bg-slate-200 text-slate-600 rounded-lg border border-slate-800 flex items-center justify-center cursor-pointer transition-all"
            title="Imprimer le manuel technique"
          >
            <Printer className="w-4 h-4" />
          </button>
        </PageBanner>

        {/* 🎨 HYDROMINES TWO-LINE BRAND IDENTITY (Sky Blue & Red) */}
        <div className="w-full mt-4 flex flex-col gap-[3px]">
          <div className="h-1 bg-sky-400 w-full rounded-sm" />
          <div className="h-1 bg-red-600 w-full rounded-sm" />
        </div>
      </div>

      {/* 🚨 EMERGENCE WARNING BAR */}
      {isEmergencyMode && (
        <div className="mx-4 md:mx-6 mt-4 bg-rose-50 text-rose-700 px-4 py-3 font-bold text-xs uppercase tracking-widest text-center flex items-center justify-center gap-3 animate-pulse border border-rose-300 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-white animate-bounce" />
          <span>Filtre d'urgence actif : Seuls les arrêts immédiats, Quick Fixes et stocks indispensables s'affichent !</span>
          <button 
            onClick={() => setIsEmergencyMode(false)}
            className="underline ml-4 bg-white/20 px-2 py-1 rounded text-[10px]"
          >
            Désactiver
          </button>
        </div>
      )}

      {/* MAIN TWO-COLUMN CONTAINER */}
      <div className="max-w-[1600px] mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: TABLE OF CONTENTS (STICKY ON DESKTOP) */}
        <div className="lg:col-span-3 lg:sticky lg:top-20 h-fit max-h-[85vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl p-4 shadow-sm print:hidden select-none">
          <h2 className="text-xs font-black uppercase text-slate-500 tracking-widest mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" /> Sommaire Technique
          </h2>
          <nav className="space-y-1">
            {[
              { id: "sec0", title: "0. TRIAGE 5 MINUTES" },
              { id: "sec1", title: "1. IDENTIFICATION RAPIDE" },
              { id: "sec2", title: "2. GLOSSAIRE INTERACTIF" },
              { id: "sec3", title: "3. SCHÉMAS & PIÈCES" },
              { id: "sec4", title: "4. MAINTENANCE PRÉVENTIVE" },
              { id: "sec5", title: "5. ARBRE DE DÉCISION" },
              { id: "sec6", title: "6. QUICK FIXES SANS DÉMONTAGE" },
              { id: "sec7", title: "7. MATRICE DES PANNES" },
              { id: "sec8", title: "8. COMPOSANTS EN DÉTAILS" },
              { id: "sec9", title: "9. PIÈGES ET ERREURS CLASSIQUES" },
              { id: "sec10", title: "10. STOCK MINIMUM CHANTIER" },
              { id: "sec11", title: "11. PROCÉDURES DE MONTAGE" },
              { id: "sec12", title: "12. VALEURS DE TOLÉRANCE" },
              { id: "sec13", title: "13. COUPLES DE SERRAGE & KITS" },
              { id: "sec14", title: "14. TESTS POST-RÉPARATION" },
              { id: "sec15", title: "15. SÉCURITÉ DES MÉCANICIENS" }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => scrollToId(item.id)}
                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-500 hover:text-amber-600 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100 flex items-center justify-between"
              >
                <span>{item.title}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 hover:opacity-100 text-amber-500 transition-opacity" />
              </button>
            ))}
          </nav>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <span className="text-[10px] font-black text-slate-500 block mb-1">STATION DE SERVICE</span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
              ⚡ MODE HORS-LIGNE PRÊT
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED SECTIONS */}
        <div className="lg:col-span-9 space-y-12">
          
          {/* SECTION 0: TRIAGE 5 MINUTES */}
          <section id="sec0" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
              <h2 className="text-base font-black uppercase text-slate-900 flex items-center gap-2">
                <span className="bg-amber-500 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black">0</span>
                PROTOCOLE DE TRIAGE 5 MINUTES
              </h2>
              <span className="text-[10px] bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full font-black uppercase border border-rose-200">DIAGNOSTIC RAPIDE DE CHANTIER</span>
            </div>

            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Mecanicien, réponds aux questions de terrain ci-dessous pour savoir immédiatement si la foreuse doit s'arrêter net (🔴), finir le poste de travail (🟠), ou continuer sous haute surveillance (🟢).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                { id: "q1", question: "Q1: Y a-t-il une fuite d'air massive et continue ?", icon: "💨" },
                { id: "q2", question: "Q2: Entends-tu un bruit métallique de rupture ou claquement irrégulier ?", icon: "🔊" },
                { id: "q3", question: "Q3: Le perforateur frappe-t-il faiblement mais sans fuite ?", icon: "🔨" },
                { id: "q4", question: "Q4: L'outil se bloque-t-il sans arrêt ou dévie de trajectoire ?", icon: "🎯" }
              ].map(q => (
                <div key={q.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex gap-2 items-start mb-3">
                    <span className="text-xl">{q.icon}</span>
                    <span className="text-xs font-black text-slate-700 leading-tight">{q.question}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTriageAnswers(prev => ({ ...prev, [q.id]: "OUI" }))}
                      className={`flex-1 py-2 rounded-lg font-black text-xs cursor-pointer border ${
                        triageAnswers[q.id] === "OUI" 
                          ? "bg-slate-800 text-amber-600 border-amber-500" 
                          : "bg-white text-slate-600 border-slate-800 hover:bg-slate-850"
                      }`}
                      style={{ minHeight: "40px" }}
                    >
                      OUI
                    </button>
                    <button
                      onClick={() => setTriageAnswers(prev => ({ ...prev, [q.id]: "NON" }))}
                      className={`flex-1 py-2 rounded-lg font-black text-xs cursor-pointer border ${
                        triageAnswers[q.id] === "NON" 
                          ? "bg-slate-800 text-amber-600 border-amber-500" 
                          : "bg-white text-slate-600 border-slate-800 hover:bg-slate-850"
                      }`}
                      style={{ minHeight: "40px" }}
                    >
                      NON
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Directives Output based on answers */}
            <div className="bg-amber-50/50 text-slate-900 rounded-xl p-5 border border-amber-200">
              <h3 className="text-xs font-black uppercase text-amber-500 tracking-wider mb-3">DIRECTIVE CONCRÈTE GÉNÉRÉE :</h3>
              
              {triageAnswers.q1 === "OUI" || triageAnswers.q2 === "OUI" ? (
                <div className="flex gap-4 items-start bg-rose-950/40 p-4 rounded-lg border border-rose-500/30">
                  <span className="text-3xl">🔴</span>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-rose-400 block mb-1">ARRÊT IMMÉDIAT ET CONSIGNATION</span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Arrête instantanément le perforateur. Ferme l'arrivée d'air du compresseur et vidange la ligne. Risque important de casse du piston, d'éjection ou de fissure irrémédiable du cylindre. Va directement à la Section 6 (Quick Fix) ou Section 8 pour diagnostiquer la pièce à changer.
                    </p>
                  </div>
                </div>
              ) : triageAnswers.q3 === "OUI" || triageAnswers.q4 === "OUI" ? (
                <div className="flex gap-4 items-start bg-amber-50 p-4 rounded-lg border border-amber-500/30">
                  <span className="text-3xl">🟠</span>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-600 block mb-1">FIN DE POSTE ET INTERVENTION EN SOIRÉE</span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Le perforateur peut terminer la passe en cours avec précaution. Réduis la pression de poussée du berceau et surveille l'alimentation en huile. Planifie un nettoyage de la soupape oscillante ou un remplacement du bushing avant en atelier ce soir.
                    </p>
                  </div>
                </div>
              ) : triageAnswers.q1 === "NON" ? (
                <div className="flex gap-4 items-start bg-emerald-950/40 p-4 rounded-lg border border-emerald-500/30">
                  <span className="text-3xl">🟢</span>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block mb-1">OPÉRATION NORMALE & SURVEILLANCE</span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Les paramètres critiques semblent conformes. Assure-toi que la fumée blanche d'huile est visible à l'échappement (preuve de graissage) et poursuis l'abattage de roche.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  Sélectionne les réponses OUI/NON pour générer la consigne d'atelier instantanée.
                </div>
              )}
            </div>

            <div className="mt-4 text-right">
              <button onClick={() => scrollToId("sec0")} className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-500 inline-flex items-center gap-1">
                <ArrowUp className="w-3 h-3" /> Retour en haut
              </button>
            </div>
          </section>

          {/* SECTION 1: FICHE D'IDENTIFICATION RAPIDE */}
          <section id="sec1" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
              <h2 className="text-base font-black uppercase text-slate-900 flex items-center gap-2">
                <span className="bg-amber-500 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black">1</span>
                FICHE D'IDENTIFICATION RAPIDE & CARTOGRAPHIE
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div>
                <table className="w-full text-xs">
                  <tbody>
                    <tr className="border-b border-slate-800/60"><td className="py-2 font-black text-slate-500">CONSTRUCTEUR</td><td className="py-2 text-right font-bold text-slate-700">Montabert (France)</td></tr>
                    <tr className="border-b border-slate-800/60"><td className="py-2 font-black text-slate-500">MODÈLE</td><td className="py-2 text-right font-bold text-slate-700">T23 (Série T)</td></tr>
                    <tr className="border-b border-slate-800/60"><td className="py-2 font-black text-slate-500">POIDS NET</td><td className="py-2 text-right font-bold text-slate-700">23 Kilogrammes</td></tr>
                    <tr className="border-b border-slate-800/60"><td className="py-2 font-black text-slate-500">ALIMENTATION</td><td className="py-2 text-right font-bold text-slate-700">Air comprimé pneumatique</td></tr>
                    <tr className="border-b border-slate-800/60"><td className="py-2 font-black text-slate-500">PRESSION DE SERVICE</td><td className="py-2 text-right font-bold text-slate-700">5,5 à 6,0 bar</td></tr>
                    <tr className="border-b border-slate-800/60"><td className="py-2 font-black text-slate-500">VERSIONS DE CHANTIER</td><td className="py-2 text-right font-bold text-slate-700">Berceau d'avance foreuse / Manuel poignée en T</td></tr>
                    <tr className="border-b border-slate-800/60"><td className="py-2 font-black text-slate-500">LUBRIFIANT RECOMMANDÉ</td><td className="py-2 text-right font-bold text-slate-700">Atomiseur Montabert ISO VG 100 / ISO VG 46</td></tr>
                  </tbody>
                </table>
              </div>

              {/* INTERACTIVE SCHEMATIC SELECTOR MOCKUP */}
              <div className="bg-slate-50 text-slate-800 p-4 rounded-2xl border border-slate-200">
                <h3 className="text-xs font-black uppercase text-amber-500 tracking-wider mb-2 text-center">CARTOGRAPHIE DIAGNOSTIC INTERACTIVE</h3>
                <p className="text-[10px] text-slate-500 text-center mb-4">Clique sur une zone clé pour charger instantanément les schémas et pannes associées.</p>
                
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => setSelectedZone("A")}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${selectedZone === "A" ? "bg-amber-500 text-white font-black border-white" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white"}`}
                  >
                    <span className="text-xs font-black block">⚙️ ZONE A : Tête arrière (Back Head)</span>
                    <span className="text-[9px] text-slate-350 block">Soupape oscillante, arrivée d'air, filtres tamis</span>
                  </button>

                  <button 
                    onClick={() => setSelectedZone("B")}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${selectedZone === "B" ? "bg-amber-500 text-white font-black border-white" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white"}`}
                  >
                    <span className="text-xs font-black block">⚙️ ZONE B : Corps central (Cylinder)</span>
                    <span className="text-[9px] text-slate-350 block">Piston, chemise de percussion, bague de guidage</span>
                  </button>

                  <button 
                    onClick={() => setSelectedZone("C")}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${selectedZone === "C" ? "bg-amber-500 text-white font-black border-white" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white"}`}
                  >
                    <span className="text-xs font-black block">⚙️ ZONE C : Nez et Manchon (Chuck Housing)</span>
                    <span className="text-[9px] text-slate-350 block">Bushing, verrous de retainers, adaptateur de queue</span>
                  </button>

                  <button 
                    onClick={() => setSelectedZone("D")}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${selectedZone === "D" ? "bg-amber-500 text-white font-black border-white" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white"}`}
                  >
                    <span className="text-xs font-black block">⚙️ ZONE D : Raccords air / eau</span>
                    <span className="text-[9px] text-slate-350 block">Flexibles pneumatiques, injection de liquide</span>
                  </button>
                </div>

                {/* ZONE SPECS POPUP */}
                <AnimatePresence mode="wait">
                  {selectedZone && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="mt-4 p-3 bg-amber-50 text-slate-800 rounded-xl border border-amber-200 text-xs"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-black text-amber-500 uppercase tracking-widest text-[10px]">
                          {selectedZone === "A" && "SPÉCIFICATIONS TÊTE ARRIÈRE"}
                          {selectedZone === "B" && "SPÉCIFICATIONS CELLULE PERCUSSION"}
                          {selectedZone === "C" && "SPÉCIFICATIONS MANCHON DE GUIDAGE"}
                          {selectedZone === "D" && "SPÉCIFICATIONS RACCORDEMENTS"}
                        </span>
                        <button onClick={() => setSelectedZone(null)} className="text-slate-500 hover:text-white text-[10px] font-black uppercase">Fermer</button>
                      </div>
                      <p className="text-[11px] text-slate-700">
                        {selectedZone === "A" && "Contient le distributeur oscillant qui régule le flux alternatif de frappe. Doit toujours être exempte d'eau. Couple de serrage du chapeau arrière : 150 Nm."}
                        {selectedZone === "B" && "Espace de frappe à tolérance serrée. Le piston frappe la queue à une fréquence moyenne de 2000 coups/minute. Jeu piston/chemise : maximum 0.05 mm."}
                        {selectedZone === "C" && "Prend tous les chocs abrasifs et la charge latérale (side loading). Les retainers doivent obligatoirement être montés par paire pour éviter les casses unilatérales."}
                        {selectedZone === "D" && "Raccord fileté G 3/4\" d'air comprimé avec raccord d'injection d'eau pour chasser les débris ( flushing )."}
                      </p>
                      <div className="mt-2 text-right">
                        <button 
                          onClick={() => {
                            if (selectedZone === "A") { setSelectedSystem("AIR"); scrollToId("sec3"); }
                            if (selectedZone === "B") { setSelectedSystem("PISTON"); scrollToId("sec3"); }
                            if (selectedZone === "C") { setSelectedSystem("MANCHON"); scrollToId("sec3"); }
                            if (selectedZone === "D") { setSelectedSystem("AIR"); scrollToId("sec6"); }
                          }} 
                          className="text-[9px] text-amber-500 font-bold underline"
                        >
                          Accéder aux schémas / pannes associés →
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="mt-4 text-right">
              <button onClick={() => scrollToId("sec0")} className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-500 inline-flex items-center gap-1">
                <ArrowUp className="w-3 h-3" /> Retour en haut
              </button>
            </div>
          </section>

          {/* SECTION 2: GLOSSAIRE TECHNIQUE INTERACTIF */}
          <section id="sec2" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
              <h2 className="text-base font-black uppercase text-slate-900 flex items-center gap-2">
                <span className="bg-amber-500 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black">2</span>
                GLOSSAIRE TECHNIQUE INTERACTIF
              </h2>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Traduction et explication des termes techniques d'origine anglaise couramment employés dans la documentation de forage Montabert.
            </p>

            <div className="mb-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Rechercher un terme technique (ex: Bushing, Retainer...)"
                  value={glossarySearch}
                  onChange={(e) => setGlossarySearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold outline-none text-slate-900 focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto">
              {GLOSSARY_ITEMS.filter(item => 
                item.term.toLowerCase().includes(glossarySearch.toLowerCase()) || 
                item.french.toLowerCase().includes(glossarySearch.toLowerCase())
              ).map(item => (
                <div key={item.term} className="p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-amber-500/20 transition-all">
                  <div className="flex justify-between mb-1">
                    <span className="font-black text-xs text-slate-800">{item.term}</span>
                    <span className="text-[10px] text-amber-600 font-extrabold bg-amber-50 px-2 py-0.5 rounded uppercase tracking-wider border border-amber-200 text-amber-700">
                      {item.french}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 text-right">
              <button onClick={() => scrollToId("sec0")} className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-500 inline-flex items-center gap-1">
                <ArrowUp className="w-3 h-3" /> Retour en haut
              </button>
            </div>
          </section>

          {/* SECTION 3: SCHÉMAS ( éclatés, fonctionnels, comparatifs + vidéos placeholders ) */}
          <section id="sec3" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
              <h2 className="text-base font-black uppercase text-slate-900 flex items-center gap-2">
                <span className="bg-amber-500 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black">3</span>
                SCHÉMAS D'ASSEMBLAGE & CATALOGUE PIÈCES
              </h2>
            </div>

            <div className="space-y-6">
              
              {/* SCHEMA A */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span className="bg-slate-100 text-slate-850 w-5 h-5 rounded inline-flex items-center justify-center text-[10px] font-black border border-slate-200">A</span>
                  SCHÉMA A : TÊTE ARRIÈRE / DISTRIBUTION (BACK HEAD ASSEMBLY)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] bg-white border border-slate-800/60 rounded-lg">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-black uppercase text-[9px] text-left border-b border-slate-200">
                        <th className="p-2">N°</th>
                        <th className="p-2">Désignation (FR)</th>
                        <th className="p-2">Désignation (EN)</th>
                        <th className="p-2">Réf. Montabert</th>
                        <th className="p-2">Réf. Aftermarket</th>
                        <th className="p-2">Intervalle de remplacement</th>
                        <th className="p-2 text-right">Prix (DH)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SCHEMATICS_PIECES.A.map(p => (
                        <tr key={p.id} className="border-b border-slate-200 hover:bg-slate-50/50">
                          <td className="p-2 font-bold">{p.id}</td>
                          <td className="p-2 font-semibold text-slate-700">{p.nameFr}</td>
                          <td className="p-2 italic text-slate-500">({p.nameEn})</td>
                          <td className="p-2 font-mono text-slate-600">{p.refMontabert}</td>
                          <td className="p-2 font-mono text-slate-500">{p.refAftermarket}</td>
                          <td className="p-2">{p.interval}</td>
                          <td className="p-2 text-right font-black text-amber-600">{p.price.toLocaleString()} DH</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SCHEMA B */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span className="bg-slate-100 text-slate-850 w-5 h-5 rounded inline-flex items-center justify-center text-[10px] font-black border border-slate-200">B</span>
                  SCHÉMA B : CORPS / CYLINDRE (CYLINDER ASSEMBLY)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] bg-white border border-slate-800/60 rounded-lg">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-black uppercase text-[9px] text-left border-b border-slate-200">
                        <th className="p-2">N°</th>
                        <th className="p-2">Désignation (FR)</th>
                        <th className="p-2">Désignation (EN)</th>
                        <th className="p-2">Réf. Montabert</th>
                        <th className="p-2">Réf. Aftermarket</th>
                        <th className="p-2">Intervalle de remplacement</th>
                        <th className="p-2 text-right">Prix (DH)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SCHEMATICS_PIECES.B.map(p => (
                        <tr key={p.id} className="border-b border-slate-200 hover:bg-slate-50/50">
                          <td className="p-2 font-bold">{p.id}</td>
                          <td className="p-2 font-semibold text-slate-700">{p.nameFr}</td>
                          <td className="p-2 italic text-slate-500">({p.nameEn})</td>
                          <td className="p-2 font-mono text-slate-600">{p.refMontabert}</td>
                          <td className="p-2 font-mono text-slate-500">{p.refAftermarket}</td>
                          <td className="p-2">{p.interval}</td>
                          <td className="p-2 text-right font-black text-amber-600">{p.price.toLocaleString()} DH</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SCHEMA C */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span className="bg-slate-100 text-slate-850 w-5 h-5 rounded inline-flex items-center justify-center text-[10px] font-black border border-slate-200">C</span>
                  SCHÉMA C : MANCHON AVANT / OUTIL (FRONT HEAD / CHUCK ASSEMBLY)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] bg-white border border-slate-800/60 rounded-lg">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-black uppercase text-[9px] text-left border-b border-slate-200">
                        <th className="p-2">N°</th>
                        <th className="p-2">Désignation (FR)</th>
                        <th className="p-2">Désignation (EN)</th>
                        <th className="p-2">Réf. Montabert</th>
                        <th className="p-2">Réf. Aftermarket</th>
                        <th className="p-2">Intervalle de remplacement</th>
                        <th className="p-2 text-right">Prix (DH)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SCHEMATICS_PIECES.C.map(p => (
                        <tr key={p.id} className="border-b border-slate-200 hover:bg-slate-50/50">
                          <td className="p-2 font-bold">{p.id}</td>
                          <td className="p-2 font-semibold text-slate-700">{p.nameFr}</td>
                          <td className="p-2 italic text-slate-500">({p.nameEn})</td>
                          <td className="p-2 font-mono text-slate-600">{p.refMontabert}</td>
                          <td className="p-2 font-mono text-slate-500">{p.refAftermarket}</td>
                          <td className="p-2">{p.interval}</td>
                          <td className="p-2 text-right font-black text-amber-600">{p.price.toLocaleString()} DH</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* DIAGRAMME D'USURE COMPARATIF */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="text-xs font-black text-slate-800 uppercase mb-3">CONTRÔLE VISUEL ET SEUILS D'USURE DES PIÈCES COMPOSANTS</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: "Piston de percussion", normal: "Surface chromée lisse miroir", usure: "Rayures axiales sensibles à l'ongle", action: "Changer piston (9 350 DH) + joints" },
                    { label: "Bague de nez (Bushing)", normal: "Alésage cylindrique rectiligne", usure: "Jeu du fleuret > 1.5mm / bavures", action: "Remplacer le bushing avant (990 DH)" },
                    { label: "Joints toriques section", normal: "Forme ronde souple élastique", usure: "Forme aplatie rectangulaire / durcie", action: "Remplacer systématiquement" },
                    { label: "Soupape oscillante", normal: "Portées planes brillantes", usure: "Faces piquées ou oxydées / encrassement", action: "Nettoyer ou remplacer (2 000 DH)" },
                    { label: "Queue de fleuret", normal: "Butée plane parfaitement droite", usure: "Usure en biseau unilatéral", action: "Meuler les bavures ou jeter le fleuret" }
                  ].map(item => (
                    <div key={item.label} className="p-3 bg-white rounded-lg border border-slate-800 text-xs">
                      <span className="font-bold text-slate-700 block mb-1">{item.label}</span>
                      <div className="text-[10px] text-slate-500 mb-0.5">🟢 Normal : {item.normal}</div>
                      <div className="text-[10px] text-rose-600 mb-1">🔴 Usé : {item.usure}</div>
                      <div className="text-[10px] font-black text-amber-600 uppercase">⚡ Action : {item.action}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* VIDEOS PLACEHOLDERS */}
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase mb-3">🎥 TUTORIELS VIDÉO DE MAINTENANCE (PLACEHOLDERS DE CHANTIER)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { title: "Purger le condensat de ligne", time: "0:45 min", action: "Comment éjecter l'eau accumulée dans le flexible avant branchement." },
                    { title: "Régler le graisseur de ligne", time: "1:15 min", action: "Ajuster la vis de débit d'huile pour le brouillard atomiseur." },
                    { title: "Démonter le piston sans rayure", time: "2:30 min", action: "Méthode d'extraction axiale sécurisée au maillet en laiton." },
                    { title: "Vérifier le jeu des retainers", time: "1:00 min", action: "Indicateurs d'usure critique des verrous d'outils." }
                  ].map((v, i) => (
                    <div key={i} className="p-3 bg-slate-50 text-slate-900 rounded-xl flex flex-col justify-between border border-slate-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black bg-amber-500 text-white px-1.5 py-0.5 rounded">V{i+1}</span>
                        <span className="text-[10px] text-slate-500 font-bold">{v.time}</span>
                      </div>
                      <h5 className="text-[11px] font-black leading-tight mb-1">{v.title}</h5>
                      <p className="text-[10px] text-slate-500 mb-3">{v.action}</p>
                      <button 
                        onClick={() => alert(`Visualisation du tutoriel vidéo '${v.title}' • En attente de connexion réseau central.`)}
                        className="w-full bg-slate-800 hover:bg-slate-700 py-1.5 rounded text-[10px] font-bold text-amber-500 flex items-center justify-center gap-1 cursor-pointer"
                        style={{ minHeight: "32px" }}
                      >
                        <Play className="w-3.5 h-3.5" /> Lancer le tutoriel
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="mt-4 text-right">
              <button onClick={() => scrollToId("sec0")} className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-500 inline-flex items-center gap-1">
                <ArrowUp className="w-3 h-3" /> Retour en haut
              </button>
            </div>
          </section>

          {/* SECTION 4: MAINTENANCE PRÉVENTIVE */}
          <section id="sec4" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
              <h2 className="text-base font-black uppercase text-slate-900 flex items-center gap-2">
                <span className="bg-amber-500 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black">4</span>
                MAINTENANCE PRÉVENTIVE & INSPECTIONS
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* CHECKLIST DE POSTE */}
              <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-200">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-amber-500" /> INSPECTION DÉBUT / FIN DE POSTE (INTERACTIVE)
                </h3>
                <div className="space-y-2">
                  {[
                    { id: "p1", label: "Pression d'air comprimé : 5.5 à 6 bar mesurés à la machine." },
                    { id: "p2", label: "Graisseur de ligne : Rempli d'huile et débit atomiseur réglé." },
                    { id: "p3", label: "Raccords rapides : Absence totale de fuite visible ou sifflement." },
                    { id: "p4", label: "Tirants latéraux : Vérification visuelle du serrage complet." },
                    { id: "p5", label: "Queue de forage : Exempte de fissures et d'usure asymétrique." },
                    { id: "p6", label: "Retainers (verrous) : Présents, non tordus et lubrifiés." },
                    { id: "p7", label: "Rinçage de fin de poste : Purge de la machine à l'air sec." },
                    { id: "p8", label: "Position de stockage correcte : Nez incliné vers le bas." }
                  ].map(item => (
                    <label 
                      key={item.id} 
                      className="flex items-start gap-3 p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={!!prevChecklist[item.id]}
                        onChange={() => togglePrevCheck(item.id)}
                        className="w-4.5 h-4.5 text-amber-500 rounded border-slate-700 focus:ring-amber-500 mt-0.5"
                      />
                      <span className="text-[11px] font-bold text-slate-600 leading-tight">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* SIGNALEMENT VISUEL (CE QUE TU VOIS = CE QUE C'EST) */}
              <div className="space-y-4">
                <div className="bg-slate-50 text-slate-900 rounded-xl p-4 border border-slate-200">
                  <h4 className="text-[11px] font-black uppercase text-amber-500 tracking-wider mb-2">💡 LE SIGNALEMENT VISUEL DU MÉCANICIEN</h4>
                  <div className="space-y-2 text-[11px]">
                    <div className="p-2 bg-amber-50 rounded border-l-4 border-amber-500 text-slate-800">
                      <span className="font-bold text-amber-600 block">💨 Fumée blanche d'échappement</span>
                      <span className="text-slate-600 text-[10px]">Débit d'huile de graissage correct. Si fumée bleue/noire : surcharge ou huile moteur brûlée.</span>
                    </div>
                    <div className="p-2 bg-sky-50 rounded border-l-4 border-sky-400 text-slate-800">
                      <span className="font-bold text-sky-400 block">❄️ Givre important sur le silencieux</span>
                      <span className="text-slate-600 text-[10px]">Présence d'eau résiduelle dans l'air de galerie. Risque de gel interne des canaux.</span>
                    </div>
                    <div className="p-2 bg-rose-50 rounded border-l-4 border-rose-500 text-slate-800">
                      <span className="font-bold text-rose-400 block">🛠️ Traces d'huile en ligne droite sur le corps</span>
                      <span className="text-slate-600 text-[10px]">Joint de section de carter détruit. Risque de fuite d'air massive. Arrêt programmé ce soir.</span>
                    </div>
                  </div>
                </div>

                {/* AVANT D'APPELER LE CHEF */}
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <h4 className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5 mb-2">
                    <Info className="w-4 h-4 text-amber-600 animate-bounce" /> CHECKLIST "AVANT D'APPELER LE CHEF"
                  </h4>
                  <ol className="list-decimal list-inside text-[11px] text-slate-700 font-semibold space-y-1">
                    <li>La pression d'air au niveau du marteau dépasse-t-elle 5 bar ?</li>
                    <li>Le réservoir d'huile est-il réellement plein ?</li>
                    <li>Les tirants latéraux sont-ils tous les deux présents et serrés ?</li>
                    <li>As-tu tenté de frapper la tête avec un maillet en cuivre (soupape gommée) ?</li>
                    <li>Le fleuret est-il droit et de longueur standard ?</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="mt-4 text-right">
              <button onClick={() => scrollToId("sec0")} className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-500 inline-flex items-center gap-1">
                <ArrowUp className="w-3 h-3" /> Retour en haut
              </button>
            </div>
          </section>

          {/* SECTION 5: ARBRE DE DÉCISION DIAGNOSTIC */}
          <section id="sec5" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
              <h2 className="text-base font-black uppercase text-slate-900 flex items-center gap-2">
                <span className="bg-amber-500 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black">5</span>
                ARBRE DE DÉCISION DIAGNOSTIC TECHNIQUE
              </h2>
            </div>

            <p className="text-xs text-slate-500 mb-6">
              Suis les embranchements ci-dessous pour identifier précisément l'élément défaillant et la procédure de dépannage préconisée.
            </p>

            <div className="bg-slate-50 text-slate-900 rounded-2xl p-6 border border-slate-200 mb-6">
              <div className="flex flex-col gap-6">
                
                {/* STEP 1: Symptôme Principal */}
                <div>
                  <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-2">ÉTAPE 1 : QUEL EST LE SYMPTÔME PRINCIPAL DE CHANTIER ?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: "immo", label: "Le piston ne frappe pas du tout" },
                      { id: "faible", label: "La frappe est faible / avancement lent" },
                      { id: "fuite", label: "Fuite d'air ou de fluide continue" }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => { setDiagStep1(opt.id); setDiagStep2(null); }}
                        className={`p-3 rounded-lg border text-xs font-black text-left cursor-pointer transition-all ${
                          diagStep1 === opt.id 
                            ? "bg-amber-500 text-white border-white" 
                            : "bg-slate-800 text-slate-700 border-slate-700 hover:bg-slate-750"
                        }`}
                        style={{ minHeight: "44px" }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* STEP 2: Questions de précision */}
                {diagStep1 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-t border-slate-800 pt-4"
                  >
                    <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-2">ÉTAPE 2 : QUESTION DE PRÉCISION DU MÉCANICIEN</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      
                      {diagStep1 === "immo" && [
                        { id: "immo_soupape", label: "Entends-tu un sifflement d'air continu à l'échappement ?" },
                        { id: "immo_piston", label: "Le piston est-il bloqué mécaniquement à la main ?" }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => setDiagStep2(opt.id)}
                          className={`p-3 rounded-lg border text-xs font-bold text-left cursor-pointer transition-all ${
                            diagStep2 === opt.id ? "bg-amber-500 text-white border-white" : "bg-slate-800 text-slate-700 border-slate-700 hover:bg-slate-750"
                          }`}
                          style={{ minHeight: "44px" }}
                        >
                          {opt.label}
                        </button>
                      ))}

                      {diagStep1 === "faible" && [
                        { id: "faible_pression", label: "La pression dynamique descend-elle sous 5 bar ?" },
                        { id: "faible_graisse", label: "Y a-t-il absence totale d'huile à l'échappement ?" }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => setDiagStep2(opt.id)}
                          className={`p-3 rounded-lg border text-xs font-bold text-left cursor-pointer transition-all ${
                            diagStep2 === opt.id ? "bg-amber-500 text-white border-white" : "bg-slate-800 text-slate-700 border-slate-700 hover:bg-slate-750"
                          }`}
                          style={{ minHeight: "44px" }}
                        >
                          {opt.label}
                        </button>
                      ))}

                      {diagStep1 === "fuite" && [
                        { id: "fuite_corps", label: "La fuite d'air se situe-t-elle entre deux sections de carter ?" },
                        { id: "fuite_nez", label: "La fuite s'échappe-t-elle par l'avant de la machine (nez) ?" }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => setDiagStep2(opt.id)}
                          className={`p-3 rounded-lg border text-xs font-bold text-left cursor-pointer transition-all ${
                            diagStep2 === opt.id ? "bg-amber-500 text-white border-white" : "bg-slate-800 text-slate-700 border-slate-700 hover:bg-slate-750"
                          }`}
                          style={{ minHeight: "44px" }}
                        >
                          {opt.label}
                        </button>
                      ))}

                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Résultat diagnostic */}
                {diagStep2 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-slate-800 text-xs"
                  >
                    <span className="font-black text-amber-500 uppercase block mb-1">🔍 DIAGNOSTIC IDENTIFIÉ :</span>
                    
                    {diagStep2 === "immo_soupape" && (
                      <div>
                        <span className="font-bold text-slate-900 block text-sm">Panne d'origine Soupape gommée</span>
                        <p className="text-slate-600 mt-1 mb-2">La soupape oscillante arrière est collée par de la vieille graisse carbonisée ou de l'eau condensée.</p>
                        <span className="text-rose-400 font-extrabold uppercase">Procédure recommandee :</span>
                        <p className="text-slate-600">Section 6 Quick Fix n°2 (Maillet cuivre). Si inefficace, nettoyage au gasoil propre de la soupape (Panne 1.1).</p>
                      </div>
                    )}

                    {diagStep2 === "immo_piston" && (
                      <div>
                        <span className="font-bold text-slate-900 block text-sm">Panne d'origine Piston Grippé</span>
                        <p className="text-slate-600 mt-1 mb-2">Le piston de percussion a subi un frottement à sec et s'est bloqué dans le cylindre.</p>
                        <span className="text-rose-400 font-extrabold uppercase">Procédure de Secours :</span>
                        <p className="text-slate-600 text-rose-300">Arrêt immédiat exigé ! Démontage complet de la power cell en atelier de mine (Panne 2.1).</p>
                      </div>
                    )}

                    {diagStep2 === "faible_pression" && (
                      <div>
                        <span className="font-bold text-slate-900 block text-sm">Perte de charge ou filtre bouché</span>
                        <p className="text-slate-600 mt-1 mb-2">La pression d'alimentation dynamique est insuffisante pour mouvoir convenablement la soupape.</p>
                        <span className="text-amber-600 font-extrabold uppercase">Procédure de secours :</span>
                        <p className="text-slate-600">Nettoyer le filtre tamis interne (Panne 1.1) et vérifier le flexible d'air (Panne 1.8).</p>
                      </div>
                    )}

                    {diagStep2 === "faible_graisse" && (
                      <div>
                        <span className="font-bold text-slate-900 block text-sm">Friction à sec imminente</span>
                        <p className="text-slate-600 mt-1 mb-2">L'appareil surchauffe et n'est plus lubrifié correctement.</p>
                        <span className="text-amber-600 font-extrabold uppercase">Procédure de secours :</span>
                        <p className="text-slate-600">Faire le plein d'huile et nettoyer la vis micrométrique du graisseur (Panne 5.1).</p>
                      </div>
                    )}

                    {diagStep2 === "fuite_corps" && (
                      <div>
                        <span className="font-bold text-slate-900 block text-sm">Détérioration du joint de corps</span>
                        <p className="text-slate-600 mt-1 mb-2">L'étanchéité inter-sections du cylindre de percussion est corrompue.</p>
                        <span className="text-amber-600 font-extrabold uppercase">Procédure de secours :</span>
                        <p className="text-slate-600">Serrer les tirants au couple croisé de 120 Nm ou changer le joint de section plat (Panne 4.1).</p>
                      </div>
                    )}

                    {diagStep2 === "fuite_nez" && (
                      <div>
                        <span className="font-bold text-slate-900 block text-sm">Usure des joints frontaux de nez</span>
                        <p className="text-slate-600 mt-1 mb-2">Les joints à lèvres anti-poussières avant ne contiennent plus l'air ou l'huile de guidage.</p>
                        <span className="text-amber-600 font-extrabold uppercase">Procédure de secours :</span>
                        <p className="text-slate-600">Démonter le nez et installer un joint à lèvre neuf (Panne 3.4).</p>
                      </div>
                    )}

                  </motion.div>
                )}

              </div>
            </div>

            {/* DIAGNOSTIC PAR ÉLIMINATION BLOCS */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide mb-2">📋 STRATÉGIE DE DIAGNOSTIC PAR ÉLIMINATION</h4>
              <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                "Si tu as vérifié la <strong>cause 1</strong> et que ce n'est pas cela, passe à la <strong>cause 2</strong>. Si ce n'est toujours pas cela, c'est la <strong>cause 3</strong>."
              </p>
              <div className="space-y-2 text-[11px]">
                <div className="bg-white p-3 rounded border border-slate-800/60">
                  <span className="font-bold text-slate-850 block mb-1">Fuite d'air par l'avant de l'appareil (Nez) :</span>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600">
                    <li>Vérifie d'abord l'intégrité du joint racleur de nez. Si neuf et lubrifié...</li>
                    <li>Mesure le jeu d'usure de la douille de guidage (bushing). Si le jeu est sous 1.2 mm...</li>
                    <li>La cause est forcément l'usure de la bague de guidage interne du piston qui laisse fuir la haute pression vers l'avant.</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="mt-4 text-right">
              <button onClick={() => scrollToId("sec0")} className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-500 inline-flex items-center gap-1">
                <ArrowUp className="w-3 h-3" /> Retour en haut
              </button>
            </div>
          </section>

          {/* SECTION 6: QUICK FIX (Actions sans démontage) */}
          <section id="sec6" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
              <h2 className="text-base font-black uppercase text-slate-900 flex items-center gap-2">
                <span className="bg-amber-500 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black">6</span>
                QUICK FIX — ACTIONS RAPIDES SUR CHANTIER (SANS DÉMONTAGE)
              </h2>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Interventions de secours réalisables de 30 secondes à 5 minutes directement sur le berceau de forage sans outillage lourd.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-black uppercase text-[9px] border-b border-slate-200">
                    <th className="p-2.5">Symptôme de chantier</th>
                    <th className="p-2.5">Action corrective immédiate</th>
                    <th className="p-2.5 text-center">Temps estimé</th>
                    <th className="p-2.5">Si échec (Action de repli)</th>
                  </tr>
                </thead>
                <tbody>
                  {QUICK_FIXES.map((q, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50/50">
                      <td className="p-2.5 font-bold text-slate-700">{q.symptom}</td>
                      <td className="p-2.5 text-slate-600 font-medium">🔧 {q.action}</td>
                      <td className="p-2.5 text-center"><span className="bg-amber-50 text-amber-700 font-extrabold px-2 py-0.5 rounded text-[10px] inline-block whitespace-nowrap">⏱️ {q.time}</span></td>
                      <td className="p-2.5 text-slate-500 italic text-[11px]">{q.fallback}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-right">
              <button onClick={() => scrollToId("sec0")} className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-500 inline-flex items-center gap-1">
                <ArrowUp className="w-3 h-3" /> Retour en haut
              </button>
            </div>
          </section>

          {/* SECTION 7: TABLEAU RÉCAPITULATIF DES PANNES (Matrice filtrable) */}
          <section id="sec7" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
              <h2 className="text-base font-black uppercase text-slate-900 flex items-center gap-2">
                <span className="bg-amber-500 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black">7</span>
                MATRICE TECHNIQUE DES DEFAILLANCES CRITIQUES
              </h2>
            </div>

            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Filtre la matrice ci-dessous par gravité, sous-système concerné ou temps estimé de réparation pour charger les procédures d'urgence adéquates.
            </p>

            {/* FILTERS PANEL */}
            <div className="p-4 bg-slate-50 text-slate-900 rounded-2xl border border-slate-200 mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                
                {/* System filter */}
                <div>
                  <label className="text-[10px] font-black uppercase text-amber-500 block mb-1">SOUS-SYSTÈME</label>
                  <select 
                    value={selectedSystem} 
                    onChange={(e) => setSelectedSystem(e.target.value)}
                    className="w-full bg-white text-slate-800 rounded-lg p-2 text-xs border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="TOUS">Tous les systèmes</option>
                    <option value="AIR">Circuit pneumatique (AIR)</option>
                    <option value="PISTON">Piston & Chambre (PISTON)</option>
                    <option value="MANCHON">Manchon de guidage (MANCHON)</option>
                    <option value="CORPS">Corps de cylindre (CORPS)</option>
                    <option value="GRAISSAGE">Lubrification & Refroidissement</option>
                    <option value="FIXATION">Fixations & berceau (FIXATION)</option>
                    <option value="OUTILLAGE">Outils & fleurets (OUTILLAGE)</option>
                  </select>
                </div>

                {/* Severity filter */}
                <div>
                  <label className="text-[10px] font-black uppercase text-amber-500 block mb-1">DEGRÉ DE GRAVITÉ</label>
                  <div className="flex gap-1">
                    {["TOUS", "ROUGE", "ORANGE", "VERT"].map(sev => (
                      <button
                        key={sev}
                        onClick={() => setSelectedSeverity(sev)}
                        className={`flex-1 py-2 rounded text-[10px] font-black uppercase border transition-all ${
                          selectedSeverity === sev 
                            ? "bg-amber-500 text-white border-white" 
                            : "bg-slate-800 text-slate-700 border-slate-700"
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Repair Time filter */}
                <div>
                  <label className="text-[10px] font-black uppercase text-amber-500 block mb-1">TEMPS RÉPARATION</label>
                  <select 
                    value={selectedTimeFilter} 
                    onChange={(e) => setSelectedTimeFilter(e.target.value)}
                    className="w-full bg-white text-slate-800 rounded-lg p-2 text-xs border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="TOUS">Tous les temps</option>
                    <option value="SHORT">Rapide (moins de 1h)</option>
                    <option value="MEDIUM">Moyen (1h à 2h30)</option>
                    <option value="LONG">Lourd (plus de 2h30)</option>
                  </select>
                </div>

                {/* Text Search inside pannes */}
                <div>
                  <label className="text-[10px] font-black uppercase text-amber-500 block mb-1">RECHERCHE DE SYMPTÔME</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Mots-clés..."
                      value={panneSearch}
                      onChange={(e) => setPanneSearch(e.target.value)}
                      className="w-full bg-white text-slate-800 rounded-lg p-2 pl-7 text-xs border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
                  </div>
                </div>

              </div>
            </div>

            {/* RESULTS MATRIX */}
            <div className="overflow-x-auto max-h-96 overflow-y-auto border border-slate-800 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-black uppercase text-[9px] sticky top-0 border-b border-slate-200">
                    <th className="p-3">CODE</th>
                    <th className="p-3">SYMPTÔME / DESCRIPTION</th>
                    <th className="p-3">CAUSE PROBABLE (PARETO 70%)</th>
                    <th className="p-3">SOUS-SYSTÈME</th>
                    <th className="p-3 text-center">GRAVITÉ</th>
                    <th className="p-3 text-center">TEMPS</th>
                    <th className="p-3 text-center">LIEN</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPannes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 font-bold">
                        Aucune panne critique ne correspond aux critères de filtres actifs.
                      </td>
                    </tr>
                  ) : (
                    filteredPannes.map(p => (
                      <tr key={p.id} className="border-b border-slate-200 hover:bg-slate-50/50 transition-all">
                        <td className="p-3 font-mono font-black text-slate-850">{p.id}</td>
                        <td className="p-3 font-semibold text-slate-700">
                          <span className="block">{p.title}</span>
                          <span className="text-[10px] text-slate-450 font-normal line-clamp-1">{p.symptoms}</span>
                        </td>
                        <td className="p-3 text-slate-500 font-medium">
                          {p.causes[0]?.cause}
                        </td>
                        <td className="p-3">
                          <span className="bg-slate-850 text-slate-600 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                            {p.system}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded text-[9px] font-black inline-block ${
                            p.severity === "ROUGE" 
                              ? "bg-rose-50 text-rose-600 border border-rose-100" 
                              : p.severity === "ORANGE"
                              ? "bg-amber-50 text-amber-700 border border-amber-100"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}>
                            {p.severity === "ROUGE" ? "🔴 ARRÊT" : p.severity === "ORANGE" ? "🟠 ATELIER" : "🟢 CONSERV."}
                          </span>
                        </td>
                        <td className="p-3 text-center whitespace-nowrap font-mono font-bold">
                          ⏱️ {p.repTime} h
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => scrollToId(`panne_${p.id}`)}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-black px-2.5 py-1.5 rounded text-[10px] uppercase cursor-pointer whitespace-nowrap"
                            style={{ minHeight: "36px" }}
                          >
                            Consulter →
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-right">
              <button onClick={() => scrollToId("sec0")} className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-500 inline-flex items-center gap-1">
                <ArrowUp className="w-3 h-3" /> Retour en haut
              </button>
            </div>
          </section>

          {/* SECTION 8: PANNES DÉTAILLÉES PAR SYSTÈME */}
          <section id="sec8" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800/60">
              <h2 className="text-base font-black uppercase text-slate-900 flex items-center gap-2">
                <span className="bg-amber-500 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black">8</span>
                MANUEL DE DÉPANNAGE CRITIQUE ET PROTOCOLES TECHNIQUES
              </h2>
              <span className="text-xs text-slate-500 font-black">({filteredPannes.length} pannes chargées)</span>
            </div>

            <div className="space-y-8 max-h-[1000px] overflow-y-auto pr-2 scroll-industrial">
              {filteredPannes.map(p => (
                <div 
                  key={p.id} 
                  id={`panne_${p.id}`} 
                  className={`border-2 rounded-2xl p-5 bg-white shadow-xs transition-all relative ${
                    p.severity === "ROUGE" 
                      ? "border-rose-200 hover:border-rose-400" 
                      : p.severity === "ORANGE" 
                      ? "border-amber-200 hover:border-amber-400" 
                      : "border-emerald-200 hover:border-emerald-400"
                  }`}
                >
                  
                  {/* Title & Metadata row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-800/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="bg-amber-50 text-amber-700 text-xs font-bold font-mono px-3 py-1 rounded-xl border border-amber-200">
                        PANNE {p.id}
                      </span>
                      <h3 className="text-sm font-black text-slate-900 uppercase">{p.title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider ${
                        p.severity === "ROUGE" 
                          ? "bg-rose-50 text-rose-600 border border-rose-200" 
                          : p.severity === "ORANGE" 
                          ? "bg-amber-50 text-amber-700 border border-amber-200" 
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>
                        {p.severity === "ROUGE" ? "🛑 ARRÊT IMMÉDIAT" : p.severity === "ORANGE" ? "🟠 ATELIER PROGRAMMÉ" : "🟢 SURVEILLANCE DIRECTE"}
                      </span>
                    </div>
                  </div>

                  {/* Specs parameters columns */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 rounded-xl p-3 mb-4 text-xs font-semibold text-slate-800 border border-slate-200">
                    <div>
                      <span className="text-[9px] font-black text-slate-500 uppercase block">⏱️ Diagnostic</span>
                      <span className="text-slate-700">{p.diagTime} minutes</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-500 uppercase block">⏱️ Réparation</span>
                      <span className="text-slate-700">{p.repTime} heures</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-500 uppercase block">💰 Coût Pièces estimé</span>
                      <span className="text-amber-600 font-bold">{p.partsCost}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-500 uppercase block">📋 Niveau requis</span>
                      <span className="text-slate-700 font-mono">
                        {"★".repeat(p.difficulty)}{"☆".repeat(5-p.difficulty)} (Expertise {p.difficulty}/5)
                      </span>
                    </div>
                  </div>

                  {/* Details text */}
                  <div className="space-y-3 text-xs leading-relaxed text-slate-600 mb-4">
                    <p><strong className="text-slate-800">Description générale :</strong> {p.description}</p>
                    <p><strong className="text-slate-800">Symptômes observables :</strong> {p.symptoms}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 text-slate-500 p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="font-bold text-amber-500 text-[10px] uppercase block mb-0.5">👁️ Signalement Visuel</span>
                        <p className="text-[11px] font-medium">{p.visualCheck}</p>
                      </div>
                      <div>
                        <span className="font-bold text-amber-500 text-[10px] uppercase block mb-0.5">🔊 Diagnostic Sonore</span>
                        <p className="text-[11px] font-medium">{p.soundCheck}</p>
                      </div>
                    </div>

                    {/* Causes (Pareto weighted) */}
                    <div>
                      <strong className="text-slate-800 block mb-1.5">Mécanismes de défaillance & Probabilité Pareto :</strong>
                      <div className="space-y-1.5">
                        {p.causes.map((c, i) => (
                          <div key={i} className="bg-white border border-slate-100 rounded-lg p-2.5 flex justify-between items-start gap-4">
                            <div>
                              <span className="font-bold text-slate-700 text-[11px]">{c.cause}</span>
                              <p className="text-slate-500 text-[10px] mt-0.5">🔧 Remède : {c.remedy}</p>
                            </div>
                            <span className="bg-slate-100 text-slate-800 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap border border-slate-200">
                              {c.prob}% cas
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Diagnostic step by step */}
                    <div>
                      <strong className="text-slate-800 block mb-1">Protocole de diagnostic pas-à-pas :</strong>
                      <ul className="list-decimal list-inside space-y-1 text-[11px] font-medium text-slate-600">
                        {p.diagnosticSteps.map((step, sIdx) => (
                          <li key={sIdx} className="bg-slate-50 p-1 rounded">✅ {step}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Error Cost warnings */}
                    <div className="bg-rose-50 border-l-4 border-rose-500 p-3 rounded-r-xl text-[11px] font-semibold text-rose-900">
                      <span className="font-black uppercase tracking-wider block mb-0.5">⚠️ Coût de l'erreur d'inattention :</span>
                      <p className="text-rose-800 leading-tight">{p.costOfError}</p>
                      <span className="text-[10px] text-rose-500 block mt-1">Piège fréquent : {p.pitfall}</span>
                    </div>

                    <div className="text-[10px] text-slate-450 border-t border-slate-100 pt-2 flex justify-between">
                      <span>Pièces d'usure concernées : {p.partsInvolved}</span>
                      <span>{p.crossReferences}</span>
                    </div>

                  </div>

                </div>
              ))}
            </div>

            <div className="mt-4 text-right">
              <button onClick={() => scrollToId("sec0")} className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-500 inline-flex items-center gap-1">
                <ArrowUp className="w-3 h-3" /> Retour en haut
              </button>
            </div>
          </section>

          {/* SECTION 9: PIÈGES ET ERREURS DE MONTAGE CLASSIQUES */}
          <section id="sec9" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
              <h2 className="text-base font-black uppercase text-slate-900 flex items-center gap-2">
                <span className="bg-amber-500 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black">9</span>
                PIÈGES ET ERREURS CLASSIQUES DE MONTAGE (10 ERREURS CRITIQUES)
              </h2>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Mecanicien, évite absolument de commettre les dix erreurs ci-dessous sous peine de détruire le perforateur en moins d'une demi-heure de travail en fond de mine.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {COMMON_ERRORS.map((err, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-rose-300 transition-all flex gap-3">
                  <span className="bg-slate-100 text-slate-850 w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black border border-slate-200 shrink-0">{index+1}</span>
                  <div className="text-xs leading-relaxed">
                    <span className="font-black text-slate-800 uppercase block mb-1">{err.title}</span>
                    <p className="text-rose-700 font-bold mb-1">💥 Impact : {err.impact}</p>
                    <p className="text-slate-500">✅ Solution correcte : {err.solution}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-right">
              <button onClick={() => scrollToId("sec0")} className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-500 inline-flex items-center gap-1">
                <ArrowUp className="w-3 h-3" /> Retour en haut
              </button>
            </div>
          </section>

          {/* SECTION 10: PIÈCES DE RECHANGE "STOCK CHANTIER" */}
          <section id="sec10" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
              <h2 className="text-base font-black uppercase text-slate-900 flex items-center gap-2">
                <span className="bg-amber-500 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black">10</span>
                PIÈCES DE RECHANGE "STOCK CHANTIER" INDISPENSABLES
              </h2>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Suivi et ajustement des pièces de secours stockées au conteneur de maintenance de la mine.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: "kit-joints", label: "Kit complet joints d'étanchéité", target: "1 kit", why: "Usure fréquente par friction" },
                { id: "soupapes", label: "Soupape oscillante de distribution", target: "2 unités", why: "Panne bloquante critique" },
                { id: "bague-guidage", label: "Bague de guidage du piston", target: "2 unités", why: "Évite l'usure de biseau" },
                { id: "bushing", label: "Bushing (Bague de forage avant)", target: "2 unités", why: "Pièce d'usure directe" },
                { id: "retainers", label: "Retainers (Axes verrous d'outil)", target: "4 unités", why: "Rupture fréquente par coup blanc" },
                { id: "joints-section", label: "Joints de section plats", target: "4 unités", why: "Prévient les fuites de carter" },
                { id: "graisse", label: "Graisse spécifique pneumatique", target: "2 cartouches", why: "Consommation quotidienne" },
                { id: "boulons-section", label: "Boulons / Tirants latéraux", target: "1 jeu complet", why: "Risque d'élongation de filet" },
                { id: "raccords", label: "Raccords rapides d'air 1\"", target: "2 unités", why: "Casse fréquente sur galerie" }
              ].map(item => {
                const currentQty = stock[item.id] || 0;
                return (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center gap-4">
                    <div className="text-xs">
                      <span className="font-bold text-slate-800 block leading-tight">{item.label}</span>
                      <span className="text-[10px] text-slate-450 block mt-0.5">Cible stock : {item.target} • {item.why}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button 
                        onClick={() => updateStock(item.id, -1)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer"
                        style={{ minWidth: "32px" }}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className={`w-10 text-center text-sm font-black font-mono py-1 rounded-md ${currentQty === 0 ? "bg-rose-100 text-rose-700 animate-pulse" : "bg-slate-100 text-slate-800"}`}>
                        {currentQty}
                      </span>

                      <button 
                        onClick={() => updateStock(item.id, 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer"
                        style={{ minWidth: "32px" }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 text-right">
              <button onClick={() => scrollToId("sec0")} className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-500 inline-flex items-center gap-1">
                <ArrowUp className="w-3 h-3" /> Retour en haut
              </button>
            </div>
          </section>

          {/* SECTION 11: PROCÉDURES DE DÉMONTAGE / REMONTAGE */}
          <section id="sec11" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
              <h2 className="text-base font-black uppercase text-slate-900 flex items-center gap-2">
                <span className="bg-amber-500 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black">11</span>
                PROCÉDURES MÉCANIQUES DE MAINTENANCE (PAS-À-PAS)
              </h2>
            </div>

            <div className="space-y-6 text-xs text-slate-600 leading-relaxed">
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <h3 className="font-black text-slate-800 uppercase mb-2 flex items-center gap-1.5">
                  <span className="bg-amber-500 text-white w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] font-black">A</span>
                  PROCÉDURE A : DÉPOSE DU COMPOSANT DE LA FOREUSE
                </h3>
                <ol className="list-decimal list-inside space-y-1 text-[11px] font-medium">
                  <li>Couper la vanne d'air au compresseur général.</li>
                  <li>Ouvrir le levier de purge pour vidanger l'air de ligne comprimé.</li>
                  <li>Desserrer les écrous de la platine support à la clé à chocs de 24.</li>
                  <li>Dégager le perforateur de 23 kg de ses glissières.</li>
                  <li>✅ <strong className="text-emerald-600">Checkpoint :</strong> Placer des bouchons de protection filetés sur les raccords air/eau.</li>
                </ol>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <h3 className="font-black text-slate-800 uppercase mb-2 flex items-center gap-1.5">
                  <span className="bg-amber-500 text-white w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] font-black">B</span>
                  PROCÉDURE B : OUVERTURE DE LA CELLULE DE PERCUSSION
                </h3>
                <ol className="list-decimal list-inside space-y-1 text-[11px] font-medium">
                  <li>Fixer le corps du perforateur dans un étau d'établi équipé de mors doux en plomb.</li>
                  <li>Desserrer de manière alternative et progressive les deux écrous des tirants latéraux.</li>
                  <li>Déposer la tête arrière (Back Head) pour libérer la soupape oscillante.</li>
                  <li>✅ <strong className="text-emerald-600">Checkpoint :</strong> Ne pas faire levier avec un tournevis plat tranchant sur les plans de joint d'étanchéité.</li>
                </ol>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <h3 className="font-black text-slate-800 uppercase mb-2 flex items-center gap-1.5">
                  <span className="bg-amber-500 text-white w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] font-black">C</span>
                  PROCÉDURE C : REMONTAGE ET CALIBRAGE DES TIRANTS
                </h3>
                <p className="text-[11px] mb-2 font-bold text-rose-700">⚠️ LE RESPECT DE LA SÉQUENCE EST OBLIGATOIRE !</p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] font-medium">
                  <li>Enduire les filetages d'huile propre ou de graisse graphitée.</li>
                  <li>Serrer à la main les deux écrous de tirants.</li>
                  <li>Serrer alternativement par paliers successifs : 30 Nm, puis 60 Nm, puis 90 Nm, et enfin 120 Nm.</li>
                  <li>✅ <strong className="text-emerald-600">Checkpoint :</strong> Vérifier à chaque palier que le piston interne coulisse librement à la main.</li>
                </ol>
              </div>

            </div>

            <div className="mt-4 text-right">
              <button onClick={() => scrollToId("sec0")} className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-500 inline-flex items-center gap-1">
                <ArrowUp className="w-3 h-3" /> Retour en haut
              </button>
            </div>
          </section>

          {/* SECTION 12: VALEURS DE CONTRÔLE ET TOLÉRANCES */}
          <section id="sec12" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
              <h2 className="text-base font-black uppercase text-slate-900 flex items-center gap-2">
                <span className="bg-amber-500 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black">12</span>
                VALEURS DE CONTRÔLE ET TOLÉRANCES CONSTRUCTEUR
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-black uppercase text-[9px] border-b border-slate-200">
                    <th className="p-2.5">Paramètre mécanique</th>
                    <th className="p-2.5">Valeur nominale (Neuf)</th>
                    <th className="p-2.5">Seuil d'usure critique</th>
                    <th className="p-2.5">Méthode de mesure de contrôle</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200 hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-700">Jeu piston / chemise cylindre</td>
                    <td className="p-2.5">0.015 - 0.025 mm</td>
                    <td className="p-2.5 font-bold text-rose-600">0.055 mm</td>
                    <td className="p-2.5 text-slate-500">Micromètre d'alésage & palmer</td>
                  </tr>
                  <tr className="border-b border-slate-200 hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-700">Jeu de guidage du fleuret (Bushing)</td>
                    <td className="p-2.5">0.20 - 0.40 mm</td>
                    <td className="p-2.5 font-bold text-rose-600">1.50 mm</td>
                    <td className="p-2.5 text-slate-500">Cales d'épaisseur radiale</td>
                  </tr>
                  <tr className="border-b border-slate-200 hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-700">Diamètre du piston de percussion</td>
                    <td className="p-2.5">44.00 mm</td>
                    <td className="p-2.5 font-bold text-rose-600">43.88 mm</td>
                    <td className="p-2.5 text-slate-500">Palmer extérieur</td>
                  </tr>
                  <tr className="border-b border-slate-200 hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-700">Pression dynamique de commande d'air</td>
                    <td className="p-2.5">6.0 bar</td>
                    <td className="p-2.5 font-bold text-rose-600">4.8 bar</td>
                    <td className="p-2.5 text-slate-500">Manomètre de ligne en frappe</td>
                  </tr>
                  <tr className="border-b border-slate-200 hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-700">Température de service max corps</td>
                    <td className="p-2.5">50°C - 65°C</td>
                    <td className="p-2.5 font-bold text-rose-600">85°C</td>
                    <td className="p-2.5 text-slate-500">Thermomètre infrarouge laser</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-right">
              <button onClick={() => scrollToId("sec0")} className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-500 inline-flex items-center gap-1">
                <ArrowUp className="w-3 h-3" /> Retour en haut
              </button>
            </div>
          </section>

          {/* SECTION 13: TABLEAU DES COUPLES DE SERRAGE ET KITS */}
          <section id="sec13" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
              <h2 className="text-base font-black uppercase text-slate-900 flex items-center gap-2">
                <span className="bg-amber-500 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black">13</span>
                TABLEAU DES COUPLES DE SERRAGE & KITS DE MAINTENANCE
              </h2>
            </div>

            <div className="overflow-x-auto mb-6">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-black uppercase text-[9px] border-b border-slate-200">
                    <th className="p-2.5">Élément assemblé</th>
                    <th className="p-2.5">Dimensions filetage</th>
                    <th className="p-2.5">Couple de serrage</th>
                    <th className="p-2.5">Dispositif freinage d'écrou</th>
                    <th className="p-2.5">Fréquence contrôle</th>
                  </tr>
                </thead>
                <tbody>
                  {TORQUES_DATA.map((t, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50/50">
                      <td className="p-2.5 font-bold text-slate-700">{t.item}</td>
                      <td className="p-2.5 font-mono text-slate-500">{t.size}</td>
                      <td className="p-2.5 text-amber-600 font-black">{t.torque}</td>
                      <td className="p-2.5 text-slate-650">{t.lock}</td>
                      <td className="p-2.5 font-semibold text-slate-500">{t.check}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-800">
              <h4 className="text-xs font-black text-slate-800 uppercase mb-3">📦 COMPOSITION DES KITS DE MAINTENANCE CONSTRUCTEUR</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">Kit maintenance 100h</span>
                  <p className="text-[10px] text-slate-500 leading-tight">Comprend tous les joints toriques de sections, les joints d'étanchéité de nez et le filtre tamis d'admission.</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">Kit maintenance 400h</span>
                  <p className="text-[10px] text-slate-500 leading-tight">Comprend le kit 100h + bague de guidage du piston + deux verrous de retainers + bague d'usure de nez.</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">Révision majeure 1000h</span>
                  <p className="text-[10px] text-slate-500 leading-tight">Remplacement du piston de percussion + jeu de tirants de section latéraux complet + soupape oscillante arrière.</p>
                </div>
              </div>
            </div>

            <div className="mt-4 text-right">
              <button onClick={() => scrollToId("sec0")} className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-500 inline-flex items-center gap-1">
                <ArrowUp className="w-3 h-3" /> Retour en haut
              </button>
            </div>
          </section>

          {/* SECTION 14: TESTS DE VALIDATION POST-RÉPARATION */}
          <section id="sec14" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
              <h2 className="text-base font-black uppercase text-slate-900 flex items-center gap-2">
                <span className="bg-amber-500 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black">14</span>
                TESTS DE VALIDATION & PROTOCOLE DE FIN DE TRAVAIL
              </h2>
            </div>

            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Mecanicien, coche chaque étape après réparation pour enregistrer formellement la fiche de validation du perforateur.
            </p>

            <form onSubmit={saveValidationLog} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* Checkboxes of validation tests */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider block mb-2">CHECKS DE SÉCURITÉ ET TESTS DE FONCTIONNEMENT</span>
                {[
                  { id: "test1", label: "Test à blanc (sans outil) réalisé pendant 5 minutes, absence de fuite." },
                  { id: "test2", label: "Test avec outil dans le bois tendre, force de frappe nominale." },
                  { id: "test3", label: "Contrôle de la pression amont (doit se stabiliser à 5.8 bar)." },
                  { id: "test4", label: "Vérification du brouillard d'huile à l'échappement (graissage OK)." },
                  { id: "test5", label: "Contrôle de la température du corps (restée sous 65°C)." },
                  { id: "test6", label: "Serrage final des tirants latéraux contrôlé à 120 Nm." }
                ].map(item => (
                  <label key={item.id} className="flex items-start gap-3 p-2 bg-white rounded-lg border border-slate-800/60 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={(validationForm as any)[item.id]}
                      onChange={(e) => setValidationForm(prev => ({ ...prev, [item.id]: e.target.checked }))}
                      className="w-4.5 h-4.5 text-amber-500 rounded border-slate-700 focus:ring-amber-500 mt-0.5"
                    />
                    <span className="text-[11px] font-semibold text-slate-600 leading-tight">{item.label}</span>
                  </label>
                ))}
              </div>

              {/* Signature form */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Nom du Mécanicien Praticien</label>
                  <input
                    type="text"
                    required
                    placeholder="Saisir nom et prénom..."
                    value={validationForm.mecanicienName}
                    onChange={(e) => setValidationForm(prev => ({ ...prev, mecanicienName: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-3 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Date d'intervention</label>
                  <input
                    type="date"
                    value={validationForm.validationDate}
                    onChange={(e) => setValidationForm(prev => ({ ...prev, validationDate: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-3 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Notes ou observations additionnelles</label>
                  <textarea
                    rows={3}
                    placeholder="Saisir observations de pièces ou retards éventuels..."
                    value={validationForm.notes}
                    onChange={(e) => setValidationForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-3 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-xl py-3 cursor-pointer flex items-center justify-center gap-2 shadow-sm border border-amber-600"
                  style={{ minHeight: "48px" }}
                >
                  <ThumbsUp className="w-4 h-4 text-amber-500" />
                  <span>SIGNER ET VALIDER LA REMISE EN SERVICE</span>
                </button>
              </div>

            </form>

            {/* Validation Logs history list */}
            {validationLogs.length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">HISTORIQUE DES REMISES EN SERVICE SIGNÉES</span>
                <div className="space-y-2">
                  {validationLogs.map(log => (
                    <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-start gap-4">
                      <div>
                        <span className="font-bold text-slate-800 text-xs">🛠️ Perforateur T23 validé par {log.mecanicienName}</span>
                        <p className="text-[10px] text-slate-500 mt-1">Observations : {log.notes || "Aucune note."}</p>
                      </div>
                      <span className="bg-slate-100 text-slate-800 font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-slate-200">
                        {log.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 text-right">
              <button onClick={() => scrollToId("sec0")} className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-500 inline-flex items-center gap-1">
                <ArrowUp className="w-3 h-3" /> Retour en haut
              </button>
            </div>
          </section>

          {/* SECTION 15: CONSIGNES DE SÉCURITÉ */}
          <section id="sec15" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
              <h2 className="text-base font-black uppercase text-slate-900 flex items-center gap-2">
                <span className="bg-amber-500 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black">15</span>
                CONSIGNES DE SÉCURITÉ ABSOLUES DES COMPOSANTS DE PERCUSSION
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-rose-50 border-l-4 border-rose-600 rounded-r-xl">
                <h3 className="text-xs font-black text-rose-950 uppercase mb-2 flex items-center gap-1.5">
                  <Ban className="w-4.5 h-4.5 text-rose-600" /> ACTIONS INTERDITES EN TOUT TEMPS
                </h3>
                <ul className="list-disc list-inside text-[11px] font-semibold text-rose-900 space-y-1.5 leading-tight">
                  <li>NE JAMAIS desserrer les tirants d'assemblage sous pression.</li>
                  <li>NE JAMAIS forer à sec (sans injection d'eau ou d'air comprimé continu).</li>
                  <li>NE JAMAIS chauffer le corps de cylindre au chalumeau pour le dégivrer.</li>
                  <li>NE JAMAIS tenter de souder les tirants ou la structure trempée du piston.</li>
                  <li>NE JAMAIS utiliser d'outil aftermarket non homologué par la mine.</li>
                </ul>
              </div>

              <div className="p-4 bg-emerald-950/40 border-l-4 border-emerald-600 rounded-r-xl">
                <h3 className="text-xs font-black text-emerald-950 uppercase mb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-600" /> OBLIGATIONS ET EPI DU FOREUR
                </h3>
                <ul className="list-disc list-inside text-[11px] font-semibold text-emerald-900 space-y-1.5 leading-tight">
                  <li>Casque de protection, lunettes étanches et gants de cuir de protection.</li>
                  <li>Casque anti-bruit de chantier de mine de fond (émissions &gt; 110 dB).</li>
                  <li>Purger systématiquement le flexible d'air principal de mine avant raccord.</li>
                  <li>Fixer solidement la chaîne de sécurité anti-fouettement sur le raccord rapide.</li>
                  <li>Vérifier la bonne tension des tirants toutes les 50 heures.</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 text-right">
              <button onClick={() => scrollToId("sec0")} className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-500 inline-flex items-center gap-1">
                <ArrowUp className="w-3 h-3" /> Retour en haut
              </button>
            </div>
          </section>

        </div>

      </div>
        </>
      )}

    </div>
  );
}
