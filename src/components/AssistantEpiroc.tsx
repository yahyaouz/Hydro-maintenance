import * as React from "react";
import { 
  Flame, Shuffle, Droplets, Compass, ShieldAlert, Zap, 
  ThermometerSnowflake, Wind, Disc, Hammer, ShieldCheck, 
  Search, Wrench, Printer, BookOpen, Plus, Minus, 
  AlertTriangle, CheckCircle2, Languages, Activity, 
  FileText, Check, ExternalLink, Lock, Scale, 
  GraduationCap, AlertCircle, Save, Trash2, Send, ShoppingCart
} from "lucide-react";
import { 
  EPIROC_PANNES, EPIROC_SYSTEMS, EPIROC_ERRORS, 
  EPIROC_STOCK, EPIROC_CONSUMABLES, EPIROC_PROCEDURES, 
  EPIROC_URGENCES, EPIROC_REFERENCES, EPIROC_COUPLES, 
  EPIROC_KITS, EPIROC_SYMPTOMS_INDEX, EpirocPanne 
} from "./epirocData";
import { PageBanner } from "@/components/ui/PageBanner";
import { useAuthStore } from "@/lib/store";
import { HydrominesLogo } from "./auth/HydrominesLogo";

export function AssistantEpiroc() {
  // 🌍 Language state
  const lang = "FR";
  const { activeSite } = useAuthStore();

  // ⚙️ Operating Mode: Dépannage (default), Apprentissage, Chef, ÉCO
  const [mode, setMode] = React.useState<"DEP" | "APP" | "CHF" | "ECO">("DEP");

  // ⚠️ Emergency filter state (only show ROUGE pannes if active)
  const [isEmergencyActive, setIsEmergencyActive] = React.useState(false);

  // 📂 Main navigation tabs
  const [activeTab, setActiveTab] = React.useState<"depannage" | "procedures" | "magasin" | "securite" | "fiche" | "referentiel" | "regulations">("depannage");

  // State for the interactive tab explanation guide
  const [activeTabGuide, setActiveTabGuide] = React.useState<{ tabId: string; step: number } | null>(null);

  // Reset tab guide step to 1 when tab changes, only showing it if it hasn't been shown in the last 7 days
  React.useEffect(() => {
    const key = `guide_shown_st2g_${activeTab}`;
    const lastShown = localStorage.getItem(key);
    const now = Date.now();
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
    
    if (!lastShown || now - parseInt(lastShown, 10) > oneWeekInMs) {
      setActiveTabGuide({ tabId: activeTab, step: 1 });
      localStorage.setItem(key, now.toString());
    } else {
      setActiveTabGuide(null);
    }
  }, [activeTab]);

  // Helper data for the tab guides
  const getGuideTabName = (tabId: string) => {
    switch (tabId) {
      case "depannage": return "Diagnostic & Pannes";
      case "procedures": return "Procédures & LOTO";
      case "magasin": return "Stock & Consommables";
      case "securite": return "Urgences & Sécurité";
      case "fiche": return "Fiche d'Intervention";
      case "referentiel": return "Valeurs & Couples";
      case "regulations": return "Régulations & Schémas";
      default: return "Guide";
    }
  };

  const getGuideTotalSteps = (tabId: string) => {
    return 2; // All tabs have 2 elegant steps
  };

  const getGuideStepTitle = (tabId: string, step: number) => {
    if (tabId === "depannage") {
      return step === 1 ? "🔧 Diagnostic & Pannes (ST2G)" : "🔍 Recherche Intuitive";
    }
    if (tabId === "procedures") {
      return step === 1 ? "⚙️ Procédures & LOTO" : "🛠️ Dépose Pas-à-Pas";
    }
    if (tabId === "magasin") {
      return step === 1 ? "📦 Stock & Consommables" : "📊 Ajustement des Quantités";
    }
    if (tabId === "securite") {
      return step === 1 ? "🆘 Urgences & Sécurité" : "⚠️ Alarmes & Sévérité";
    }
    if (tabId === "fiche") {
      return step === 1 ? "✍️ Fiche d'Intervention" : "📂 Historique local";
    }
    if (tabId === "referentiel") {
      return step === 1 ? "⚖️ Valeurs & Couples de Serrage" : "📐 Cotes d'Usure";
    }
    if (tabId === "regulations") {
      return step === 1 ? "🎓 Régulations & Hydraulique" : "💡 Apprentissage Continu";
    }
    return "";
  };

  const getGuideStepText = (tabId: string, step: number) => {
    if (tabId === "depannage") {
      return step === 1 
        ? "Base de données de pannes classées pour le Scooptram ST2G. Filtrez par système (Moteur, Hydraulique, Freins, Électrique) pour trouver rapidement la panne."
        : "Utilisez la barre de recherche ou l'index des symptômes pour identifier les fiches de pannes par des symptômes physiques vécus sur le terrain.";
    }
    if (tabId === "procedures") {
      return step === 1 
        ? "Consultez le protocole de consignation (Lock-Out / Tag-Out) pour sécuriser l'engin avant d'ouvrir un circuit ou d'intervenir."
        : "Suivez les instructions détaillées pour l'entretien et la dépose des pompes hydrauliques et des vérins.";
    }
    if (tabId === "magasin") {
      return step === 1 
        ? "Visualisez l'état du stock de pièces de rechange et consommables spécifiques au ST2G (joints de rechange, filtres à carburant, etc.)."
        : "Ajustez le niveau des stocks locaux après utilisation pour maintenir l'inventaire à jour.";
    }
    if (tabId === "securite") {
      return step === 1 
        ? "Découvrez les protocoles d'évacuation en mine, de sécurité cabine et les mesures environnementales à respecter."
        : "Comprenez la sévérité des indicateurs de tableau de bord (Rouge = arrêt immédiat, Jaune = surveillance).";
    }
    if (tabId === "fiche") {
      return step === 1 
        ? "Enregistrez vos travaux de réparation sur le ST2G avec les détails de diagnostic, de temps d'arrêt et de pièces remplacées."
        : "Visualisez les dernières interventions enregistrées localement pour analyser la récurrence des pannes.";
    }
    if (tabId === "referentiel") {
      return step === 1 
        ? "Trouvez les couples de serrage précis recommandés pour les écrous de roues, culasses et flasques hydrauliques."
        : "Consultez les tolérances et dimensions d'usure maximales admises pour les disques et articulations.";
    }
    if (tabId === "regulations") {
      return step === 1 
        ? "Comprenez la logique de régulation de débit et pression du système hydraulique du ST2G grâce à des schémas explicatifs."
        : "Idéal pour former les nouveaux techniciens aux spécificités de régulation de charge (Load Sensing).";
    }
    return "";
  };

  // 🔍 Search and filter states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSystemFilter, setSelectedSystemFilter] = React.useState<string>("TOUS");
  const [selectedSeverityFilter, setSelectedSeverityFilter] = React.useState<string>("TOUS");

  // 📦 Interactive Stock State (loaded and persisted to localStorage)
  const [stocks, setStocks] = React.useState<{ [key: string]: number }>(() => {
    const saved = localStorage.getItem("epiroc_st2g_stock_qty");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    // Default fallback quantities
    const defaults: { [key: string]: number } = {};
    Object.keys(EPIROC_STOCK).forEach(key => {
      defaults[key] = (EPIROC_STOCK as any)[key].qty;
    });
    return defaults;
  });

  React.useEffect(() => {
    localStorage.setItem("epiroc_st2g_stock_qty", JSON.stringify(stocks));
  }, [stocks]);

  const updateStockQty = (key: string, delta: number) => {
    setStocks(prev => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta)
    }));
  };

  // 📋 Disassembly checklist progress tracker
  const [procedureProgress, setProcedureProgress] = React.useState<{ [key: string]: boolean }>(() => {
    const saved = localStorage.getItem("epiroc_st2g_proc_checklist");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {};
  });

  const toggleStep = (procId: string, index: number) => {
    const key = `${procId}_${index}`;
    setProcedureProgress(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem("epiroc_st2g_proc_checklist", JSON.stringify(updated));
      return updated;
    });
  };

  // LOTO Checklist states
  const [lotoCompleted, setLotoCompleted] = React.useState<{ [key: number]: boolean }>(() => {
    const saved = localStorage.getItem("epiroc_st2g_loto_steps");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {};
  });

  const toggleLotoStep = (idx: number) => {
    setLotoCompleted(prev => {
      const updated = { ...prev, [idx]: !prev[idx] };
      localStorage.setItem("epiroc_st2g_loto_steps", JSON.stringify(updated));
      return updated;
    });
  };

  // ✍️ Interactive Intervention form states
  const [formState, setFormState] = React.useState({
    date: new Date().toISOString().split("T")[0],
    machineHours: "",
    mecoName: "",
    level: "1",
    parkNo: "ST2G-03",
    symptom: "",
    context: "Démarrage",
    panneNo: "",
    repaired: "oui",
    partsUsed: "",
    diagTime: "",
    repairTime: "",
    downTime: "",
    partsWaitTime: "",
    validationSigned: false,
    supervisorSigned: false,
    comments: ""
  });

  const [interventionHistory, setInterventionHistory] = React.useState<any[]>(() => {
    const saved = localStorage.getItem("epiroc_st2g_interventions_history");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  const submitInterventionForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.mecoName || !formState.machineHours) {
      alert("Veuillez remplir au moins le nom du mécanicien et les heures de l'engin.");
      return;
    }
    const newRecord = {
      id: Date.now(),
      ...formState
    };
    const updatedHistory = [newRecord, ...interventionHistory].slice(0, 10);
    setInterventionHistory(updatedHistory);
    localStorage.setItem("epiroc_st2g_interventions_history", JSON.stringify(updatedHistory));
    
    // Reset form partially
    setFormState(prev => ({
      ...prev,
      symptom: "",
      panneNo: "",
      machineHours: "",
      partsUsed: "",
      diagTime: "",
      repairTime: "",
      downTime: "",
      partsWaitTime: "",
      comments: "",
      validationSigned: false,
      supervisorSigned: false
    }));
  };

  const deleteInterventionRecord = (id: number) => {
    const updated = interventionHistory.filter(r => r.id !== id);
    setInterventionHistory(updated);
    localStorage.setItem("epiroc_st2g_interventions_history", JSON.stringify(updated));
  };

  // Inverted symptoms search triggers
  const triggerSymptomSearch = (tag: string) => {
    setSearchQuery(tag);
    setActiveTab("depannage");
  };

  // Filtered failures list
  const filteredPannes = React.useMemo(() => {
    return EPIROC_PANNES.filter(p => {
      // Emergency mode filter (Only RED severity)
      if (isEmergencyActive && p.severity !== "ROUGE") return false;

      // System filter
      if (selectedSystemFilter !== "TOUS" && p.system !== selectedSystemFilter) return false;

      // Severity filter
      if (selectedSeverityFilter !== "TOUS" && p.severity !== selectedSeverityFilter) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query) || 
                             p.titleEn.toLowerCase().includes(query) || 
                             p.titleEs.toLowerCase().includes(query);
        const matchesSymptoms = p.symptoms.toLowerCase().includes(query) || 
                                p.symptomsEn.toLowerCase().includes(query) || 
                                p.symptomsEs.toLowerCase().includes(query);
        const matchesCause = p.cause.toLowerCase().includes(query) || 
                             p.causeEn.toLowerCase().includes(query) || 
                             p.causeEs.toLowerCase().includes(query);
        const matchesAction = p.action.toLowerCase().includes(query) || 
                              p.actionEn.toLowerCase().includes(query) || 
                              p.actionEs.toLowerCase().includes(query);
        return p.id.toLowerCase().includes(query) || matchesTitle || matchesSymptoms || matchesCause || matchesAction;
      }

      return true;
    });
  }, [isEmergencyActive, selectedSystemFilter, selectedSeverityFilter, searchQuery]);

  // Translate helpers
  const t = (fr: string, en: string, es: string) => {
    return fr;
  };

  // Mode helpers
  const isEco = mode === "ECO";

  return (
    <div className={`w-full min-h-screen bg-slate-50 text-slate-900 font-sans ${isEco ? 'contrast-125' : ''}`}>
      
      {/* 🚀 PAGE BANNER */}
      <div className="p-4 md:p-6 pb-0 print:hidden">
        <PageBanner
          icon={Wrench}
          badgeLabel="ASSISTANT TECHNIQUE"
          title="Epiroc Scooptram ST2G"
          subtitle="Chargeur Souterrain • Diagnostic mobile & maintenance assistée"
          siteLabel={activeSite === 'TOUS' ? 'TOUS LES SITES' : activeSite}
          logo={<HydrominesLogo size={110} variant="full" className="mb-1" />}
        >
          {/* Emergency mode activator */}
          <button
            onClick={() => setIsEmergencyActive(!isEmergencyActive)}
            className={`px-4 h-10 rounded-lg font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 shadow-sm cursor-pointer ${
              isEmergencyActive 
                ? "bg-red-600 text-white animate-bounce border border-white" 
                : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>{isEmergencyActive ? "⚠️ URGENCE ACTIVE" : "🚨 MODE URGENCE"}</span>
          </button>

          {/* Mode Selector */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 h-10 items-center">
            <button 
              onClick={() => setMode("DEP")} 
              className={`px-2.5 py-1 text-[11px] font-black rounded-md transition-all cursor-pointer ${mode === "DEP" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              title="Mode standard : actions claires et directes"
            >
              🛠️ DEP
            </button>
            <button 
              onClick={() => setMode("APP")} 
              className={`px-2.5 py-1 text-[11px] font-black rounded-md transition-all cursor-pointer ${mode === "APP" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              title="Mode Apprentissage : explications pédagogiques détaillées"
            >
              🎓 APP
            </button>
            <button 
              onClick={() => setMode("CHF")} 
              className={`px-2.5 py-1 text-[11px] font-black rounded-md transition-all cursor-pointer ${mode === "CHF" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              title="Mode Chef d'Atelier : signatures, logs et suivis"
            >
              👨‍✈️ CHEF
            </button>
            <button 
              onClick={() => setMode("ECO")} 
              className={`px-2.5 py-1 text-[11px] font-black rounded-md transition-all cursor-pointer ${mode === "ECO" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              title="Mode ECO : contrastes augmentés, sans fioritures"
            >
              🔋 ÉCO
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="p-2 h-10 w-10 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 flex items-center justify-center cursor-pointer transition-all shadow-sm"
            title="Imprimer cette section"
          >
            <Printer className="w-4 h-4" />
          </button>
        </PageBanner>
      </div>

      {/* 🚨 EMERGENCY MODE WARNING BANNER */}
      {isEmergencyActive && (
        <div className="bg-red-50 text-red-700 px-4 py-3 border-b border-red-200 font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-3 animate-pulse">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>Filtre de crise actif : seules les pannes avec arrêt immédiat (ROUGE) s'affichent pour une résolution de survie immédiate !</span>
          <button 
            onClick={() => setIsEmergencyActive(false)}
            className="underline ml-4 bg-red-100 hover:bg-red-200 px-2 py-1 rounded text-[10px] font-bold"
          >
            Désactiver
          </button>
        </div>
      )}

      {/* SUB-TAB CENTRAL NAVIGATOR */}
      <div className="bg-slate-100 border-b border-slate-200 p-2 grid grid-cols-2 md:grid-cols-5 gap-1.5 md:gap-2 print:hidden mb-4 rounded-xl mx-4 shadow-sm">
        <button
          onClick={() => { setActiveTab("depannage"); setActiveTabGuide({ tabId: "depannage", step: 1 }); }}
          className={`px-3 py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
            activeTab === "depannage" ? "bg-amber-500 text-slate-900 border-amber-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Wrench className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">1. Pannes</span>
        </button>
        <button
          onClick={() => { setActiveTab("procedures"); setActiveTabGuide({ tabId: "procedures", step: 1 }); }}
          className={`px-3 py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
            activeTab === "procedures" ? "bg-amber-500 text-slate-900 border-amber-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Activity className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">2. Procédures LOTO</span>
        </button>
        <button
          onClick={() => { setActiveTab("magasin"); setActiveTabGuide({ tabId: "magasin", step: 1 }); }}
          className={`px-3 py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
            activeTab === "magasin" ? "bg-amber-500 text-slate-900 border-amber-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">3. Magasin Stock</span>
        </button>
        <button
          onClick={() => { setActiveTab("securite"); setActiveTabGuide({ tabId: "securite", step: 1 }); }}
          className={`px-3 py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
            activeTab === "securite" ? "bg-amber-500 text-slate-900 border-amber-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">4. Sécurité & Urgences</span>
        </button>
        <button
          onClick={() => { setActiveTab("fiche"); setActiveTabGuide({ tabId: "fiche", step: 1 }); }}
          className={`px-3 py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
            activeTab === "fiche" ? "bg-amber-500 text-slate-900 border-amber-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <FileText className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">5. Fiche Suivi</span>
        </button>
        <button
          onClick={() => { setActiveTab("referentiel"); setActiveTabGuide({ tabId: "referentiel", step: 1 }); }}
          className={`px-3 py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
            activeTab === "referentiel" ? "bg-amber-500 text-slate-900 border-amber-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Scale className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">6. Couples</span>
        </button>
        <button
          onClick={() => { setActiveTab("regulations"); setActiveTabGuide({ tabId: "regulations", step: 1 }); }}
          className={`px-3 py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
            activeTab === "regulations" ? "bg-amber-500 text-slate-900 border-amber-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">7. Régulations</span>
        </button>
      </div>

      {/* 🧭 TAB GUIDE OVERLAY */}
      {activeTabGuide && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black tracking-widest text-amber-600 uppercase">
                Guide : {getGuideTabName(activeTabGuide.tabId)} (Étape {activeTabGuide.step} sur {getGuideTotalSteps(activeTabGuide.tabId)})
              </span>
              <button 
                onClick={() => setActiveTabGuide(null)} 
                className="text-xs text-slate-400 hover:text-slate-600 uppercase font-bold cursor-pointer"
              >
                Passer ✕
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm md:text-base font-black text-slate-900">
                {getGuideStepTitle(activeTabGuide.tabId, activeTabGuide.step)}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {getGuideStepText(activeTabGuide.tabId, activeTabGuide.step)}
              </p>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-6">
              {activeTabGuide.step > 1 ? (
                <button 
                  onClick={() => setActiveTabGuide(prev => prev ? { ...prev, step: prev.step - 1 } : null)} 
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Précédent
                </button>
              ) : <div />}
              
              {activeTabGuide.step < getGuideTotalSteps(activeTabGuide.tabId) ? (
                <button 
                  onClick={() => setActiveTabGuide(prev => prev ? { ...prev, step: prev.step + 1 } : null)} 
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-black rounded-lg cursor-pointer shadow-sm"
                >
                  Continuer
                </button>
              ) : (
                <button 
                  onClick={() => setActiveTabGuide(null)} 
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg cursor-pointer shadow-sm"
                >
                  Ouvrir l'onglet
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CORE FRAMEWORK GRID */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: FILTERS, SYMPTOM INDEX, QUICK SEARCH (4/12 WIDTH) */}
        <div className="lg:col-span-4 space-y-6 print:hidden">
          
          {/* SEARCH CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-500" />
              Recherche Avancée
            </h3>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Code SPN, mot-clé, symptôme..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
              />
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded px-1.5 py-0.5"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Filter buttons */}
            <div className="mt-3 flex flex-wrap gap-1">
              <button 
                onClick={() => { setSelectedSystemFilter("TOUS"); setSelectedSeverityFilter("TOUS"); setSearchQuery(""); }} 
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[9px] font-bold"
              >
                🔄 Reset Filtres
              </button>
              <button 
                onClick={() => setSearchQuery("SPN")} 
                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded text-[9px] font-bold"
              >
                📟 Codes SPN
              </button>
              <button 
                onClick={() => setSelectedSeverityFilter("ROUGE")} 
                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[9px] font-bold"
              >
                🔴 Critique Uniquement
              </button>
            </div>
          </div>

          {/* INVERTED SYMPTOMS SEARCH INDEX */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-500" />
              Index Inversé par Symptômes
            </h3>
            <p className="text-[10px] text-slate-500 mb-4">
              Cliquez sur un symptôme physique constaté pour filtrer instantanément les fiches de pannes corrélées.
            </p>

            <div className="space-y-3">
              {Object.entries(EPIROC_SYMPTOMS_INDEX).map(([category, items]) => (
                <div key={category} className="border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                  <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase block mb-1">
                    {category}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((item) => {
                      const idCode = item.split(" ")[0];
                      const label = item.substring(item.indexOf("(") + 1, item.indexOf(")"));
                      return (
                        <button
                          key={item}
                          onClick={() => triggerSymptomSearch(idCode)}
                          className="px-2 py-1 rounded bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-[10px] font-semibold text-slate-700 hover:text-amber-800 transition-all cursor-pointer text-left flex items-center justify-between gap-1 w-full"
                        >
                          <span className="truncate">{label}</span>
                          <span className="font-mono text-[9px] bg-slate-200 px-1 py-0.5 rounded text-slate-600 font-bold shrink-0">
                            {idCode}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CRITICAL PITFALLS MINI BOARD */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Pièges Fréquents ST2G
              </h3>
              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                15 Pièges
              </span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
              {EPIROC_ERRORS.map((err) => (
                <div key={err.id} className="p-2.5 bg-slate-50 rounded-lg border-l-4 border-amber-500 text-[10px] text-slate-700 leading-relaxed font-semibold">
                  <span className="text-amber-700 font-black mr-1">#{err.id}</span>
                  {err.text}
                </div>
              ))}
            </div>
          </div>
          
        </div>

        {/* RIGHT COLUMN: MAIN PANEL DISPLAY (8/12 WIDTH) */}
        <div className="lg:col-span-8 space-y-6">

          {/* TAB 1: DIAGNOSTICS & FAULTS */}
          {activeTab === "depannage" && (
            <div className="space-y-6">
              
              {/* FILTER TOOLBAR */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center print:hidden">
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Filtrer par Système</label>
                    <select
                      value={selectedSystemFilter}
                      onChange={(e) => setSelectedSystemFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-2 py-1.5 outline-none"
                    >
                      <option value="TOUS">TOUS LES SYSTÈMES</option>
                      {EPIROC_SYSTEMS.map(sys => (
                        <option key={sys.id} value={sys.id}>{sys.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Filtrer par Gravité</label>
                    <select
                      value={selectedSeverityFilter}
                      onChange={(e) => setSelectedSeverityFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-2 py-1.5 outline-none"
                    >
                      <option value="TOUS">TOUTES LES GRAVITÉS</option>
                      <option value="VERT">VERT (Mineur)</option>
                      <option value="JAUNE">JAUNE (Moyen)</option>
                      <option value="ROUGE">ROUGE (Critique / Arrêt)</option>
                    </select>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-slate-700">
                    {filteredPannes.length} / {EPIROC_PANNES.length} fiches trouvées
                  </span>
                </div>
              </div>

              {/* SYSTEMS MATRIX GRID */}
              <div className="space-y-4">
                {filteredPannes.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 font-medium">
                    Aucun résultat correspondant aux filtres. Veuillez réinitialiser la recherche.
                  </div>
                ) : (
                  filteredPannes.map((panne) => {
                    return (
                      <div 
                        key={panne.id} 
                        id={`panne_${panne.id}`}
                        className={`bg-white rounded-2xl border ${
                          panne.severity === "ROUGE" 
                            ? "border-red-200 shadow-xs" 
                            : panne.severity === "JAUNE" 
                              ? "border-amber-200 shadow-xs" 
                              : "border-slate-200"
                        } p-5 relative transition-all duration-300 hover:shadow-md`}
                      >
                        {/* CARD BANNER METADATA */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black bg-slate-900 text-white px-2.5 py-0.5 rounded-md">
                              {panne.id}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              panne.severity === "ROUGE" 
                                ? "bg-red-50 text-red-700 border border-red-200" 
                                : panne.severity === "JAUNE" 
                                  ? "bg-amber-50 text-amber-700 border border-amber-200" 
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}>
                              {panne.severity === "ROUGE" ? "🔴 ARRÊT IMMÉDIAT" : panne.severity === "JAUNE" ? "🟡 VOYANT ORANGE" : "🟢 VÉRIF STANDARD"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                            <span>Temps de réparation estimé:</span>
                            <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                              {panne.repTime} H
                            </span>
                          </div>
                        </div>

                        {/* FAILURE BILINGUAL TITLES */}
                        <div className="mb-4">
                          <h4 className="text-base font-black text-slate-900 leading-tight">
                            {t(panne.title, panne.titleEn, panne.titleEs)}
                          </h4>
                          {/* Mini translation tag */}
                          {lang !== "FR" && (
                            <p className="text-xs text-slate-400 font-semibold italic mt-0.5">
                              FR: {panne.title}
                            </p>
                          )}
                        </div>

                        {/* DIAGNOSTIC GRID: SYMPTOME, CAUSE, ACTION */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          
                          {/* SYMPTOMS BLOCK */}
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[9px] font-black tracking-wider uppercase text-slate-400 block mb-1">
                              Symptômes observés
                            </span>
                            <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                              {t(panne.symptoms, panne.symptomsEn, panne.symptomsEs)}
                            </p>
                          </div>

                          {/* CAUSES BLOCK */}
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[9px] font-black tracking-wider uppercase text-slate-400 block mb-1">
                              Causes probables
                            </span>
                            <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                              {t(panne.cause, panne.causeEn, panne.causeEs)}
                            </p>
                          </div>

                          {/* ACTION BLOCK */}
                          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                            <span className="text-[9px] font-black tracking-wider uppercase text-amber-700 block mb-1">
                              Remède technique (Action)
                            </span>
                            <p className="text-xs font-bold text-slate-900 leading-relaxed">
                              {t(panne.action, panne.actionEn, panne.actionEs)}
                            </p>
                          </div>

                        </div>

                        {/* MODE SPECIFIC DETAILS DISPLAY */}
                        {mode === "APP" && (
                          <div className="p-3 mb-4 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl text-xs leading-relaxed font-semibold">
                            💡 <strong>Théorie & Apprentissage :</strong> Cette défaillance est fréquemment causée par l'accumulation d'acide ou de poussières de silice présentes dans l'atmosphère souterraine des galeries. L'entretien régulier et le lavage périodique du moteur au jet vapeur préviennent plus de 80% de ces incidents. Toujours tester la continuité du faisceau avant de remplacer un composant onéreux.
                          </div>
                        )}

                        {mode === "CHF" && (
                          <div className="p-3 mb-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs leading-relaxed flex items-center justify-between font-bold">
                            <span>👨‍✈️ Niveau de supervision : Nécessite validation de fin d'intervention signée par un mécanicien de Niveau 2 minimum.</span>
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] shrink-0 font-black">ST2G RE-CHECK OK</span>
                          </div>
                        )}


                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

          {/* TAB 2: PROCEDURES & LOTO */}
          {activeTab === "procedures" && (
            <div className="space-y-6">
              
              {/* 9-STEP LOTO BLOCK */}
              <div className="bg-white rounded-2xl border border-red-200 p-5 shadow-xs relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-red-500/5 rounded-full -mr-10 -mt-10" />
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-red-600 animate-pulse" />
                  <h3 className="text-base font-black uppercase text-red-700">
                    SÉCURITÉ VITALE : Procédure LOTO Consignation (9 étapes)
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold mb-4">
                  Pour tout travail sous le capot ou près du boom de l'Epiroc ST2G, appliquez scrupuleusement ces 9 règles d'or. Cochez-les au fur et à mesure pour débloquer votre autonomie de travail.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    "Arrêt moteur, clé retirée",
                    "Couper coupe-circuit principal (+ & -)",
                    "Dépressuriser le réservoir hydraulique",
                    "Dépressuriser les accumulateurs SAHR",
                    "Placer les deux cales de roues",
                    "Abaisser et verrouiller le boom",
                    "Poser le godet à plat au sol",
                    "Étiquette 'NE PAS DÉMARRER' cabine",
                    "Clé de consignation gardée par mécano"
                  ].map((step, idx) => {
                    const stepNo = idx + 1;
                    const isDone = !!lotoCompleted[stepNo];
                    return (
                      <div 
                        key={stepNo}
                        onClick={() => toggleLotoStep(stepNo)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                          isDone 
                            ? "bg-red-50 border-red-300 text-red-900" 
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 ${
                          isDone ? "bg-red-600 text-white" : "bg-slate-200 text-slate-600"
                        }`}>
                          {stepNo}
                        </span>
                        <div className="text-xs font-bold leading-tight pt-0.5">
                          {step}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4 text-right">
                  <button 
                    onClick={() => setLotoCompleted({})}
                    className="text-[10px] text-red-600 bg-red-100/50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-bold"
                  >
                    🔄 Réinitialiser LOTO
                  </button>
                </div>
              </div>

              {/* DISASSEMBLY & REASSEMBLY LIST */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">
                  LISTE DES PROCÉDURES DE DÉMONTAGE / REMONTAGE (A à K)
                </h3>

                {EPIROC_PROCEDURES.map((proc) => (
                  <div key={proc.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black bg-amber-500 text-white w-6 h-6 rounded-lg flex items-center justify-center">
                          {proc.id}
                        </span>
                        <h4 className="text-sm font-black text-slate-900">
                          {proc.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        {proc.steps.length} Étapes obligatoires
                      </span>
                    </div>

                    <div className="space-y-2">
                      {proc.steps.map((step, index) => {
                        const progressKey = `${proc.id}_${index}`;
                        const isCompleted = !!procedureProgress[progressKey];
                        return (
                          <div
                            key={index}
                            onClick={() => toggleStep(proc.id, index)}
                            className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                              isCompleted 
                                ? "bg-emerald-50 border-emerald-200 text-slate-800" 
                                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                              isCompleted ? "bg-emerald-500 border-emerald-600 text-white" : "border-slate-300 bg-white"
                            }`}>
                              {isCompleted && <Check className="w-3 h-3" />}
                            </div>
                            <span className="text-xs font-semibold leading-relaxed">
                              {index + 1}. {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 3: STOCK & CONSUMABLES */}
          {activeTab === "magasin" && (
            <div className="space-y-6">
              
              {/* STOCK QUANTITIES TABLE */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-black uppercase text-slate-950">
                      Tableau des Pièces de Rechange (SOU-MAG Mine Stock)
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Gérez les stocks en temps réel. Les alertes automatiques s'activent lorsque le seuil critique est atteint.
                    </p>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded font-black">
                    Nouveau Stock ST2G
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {Object.entries(EPIROC_STOCK).map(([key, item]: [string, any]) => {
                    const currentQty = stocks[key] ?? 0;
                    return (
                      <div key={key} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                        <div className="truncate">
                          <span className="text-xs font-bold text-slate-900 block truncate">
                            {item.desc}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                            REF: EP-ST2G-{key.toUpperCase().substring(0,6)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button 
                            onClick={() => updateStockQty(key, -1)}
                            className="w-7 h-7 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          
                          <span className={`w-8 text-center text-xs font-black font-mono py-1 rounded-md ${
                            currentQty === 0 
                              ? "bg-rose-100 text-rose-700 animate-pulse" 
                              : "bg-slate-900 text-white"
                          }`}>
                            {currentQty}
                          </span>

                          <button 
                            onClick={() => updateStockQty(key, 1)}
                            className="w-7 h-7 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-right">
                  <button 
                    onClick={() => {
                      const defaults: { [key: string]: number } = {};
                      Object.keys(EPIROC_STOCK).forEach(k => {
                        defaults[k] = (EPIROC_STOCK as any)[k].qty;
                      });
                      setStocks(defaults);
                    }}
                    className="text-[10px] text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-bold"
                  >
                    🔄 Rétablir quantités par défaut
                  </button>
                </div>
              </div>

              {/* INTERCHANGEABILITY PIECE SUMMARY */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">
                  MATRICE D'INTERCHANGEABILITÉ SOU-GMAO
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                    <span className="font-black text-amber-800 block mb-1">MOTEUR CUMMINS QSB 4.5</span>
                    Le filtre à huile de l'Epiroc ST2G est rigoureusement identique aux engins <strong>ST2D, ST3.5</strong> ainsi qu'aux groupes électrogènes de secours <strong>Cummins C150D5</strong>.
                  </div>
                  <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 text-xs">
                    <span className="font-black text-sky-800 block mb-1">ACCUMULATEUR FREIN SAHR</span>
                    L'accumulateur d'azote de release est compatible avec les engins concurrents <strong>Sandvik LH410</strong> et <strong>LH307</strong> de la flotte fond.
                  </div>
                  <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-xs">
                    <span className="font-black text-rose-800 block mb-1">VÉRIN DE LEVAGE (HOIST)</span>
                    Le vérin hoist de l'Epiroc ST2G est plus compact que celui du <strong>ST3.5</strong>. Ne jamais tenter de montage croisé (tiges et alésages asymétriques).
                  </div>
                </div>
              </div>

              {/* CONSUMABLES TABLE */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-sm font-black uppercase text-slate-950 mb-3">
                  Spécifications des Fluides & Consommables Exacts
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider">
                        <th className="p-2 font-black">Produit</th>
                        <th className="p-2 font-black">Spec Technique</th>
                        <th className="p-2 font-black">Réf Epiroc</th>
                        <th className="p-2 font-black">Alternative Acceptée</th>
                      </tr>
                    </thead>
                    <tbody>
                      {EPIROC_CONSUMABLES.map((c, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-900">{c.product}</td>
                          <td className="p-2.5 font-semibold text-slate-700">{c.spec}</td>
                          <td className="p-2.5 font-mono text-amber-600 font-bold">{c.ref}</td>
                          <td className="p-2.5 font-semibold text-emerald-700">{c.alt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: EMERGENCIES & SAFETY */}
          {activeTab === "securite" && (
            <div className="space-y-6">
              
              {/* URGENCES VIE SECTION 13 */}
              <div className="bg-red-600 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
                <div className="absolute right-0 bottom-0 w-48 h-48 bg-white/5 rounded-full -mr-16 -mb-16" />
                <h3 className="text-base font-black uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6 animate-bounce" />
                  SECTION 13 — PROCÉDURES DE SAUVETAGE & URGENCES VIE
                </h3>

                <div className="space-y-4">
                  {EPIROC_URGENCES.map((urg) => (
                    <div key={urg.id} className="p-4 bg-white/10 rounded-xl border border-white/20 backdrop-blur-xs">
                      <span className="text-xs font-black bg-white text-red-700 px-2.5 py-0.5 rounded mr-2">
                        {urg.id}
                      </span>
                      <strong className="text-sm font-black uppercase tracking-wide">{urg.title}</strong>
                      <p className="text-xs mt-2 text-red-50 leading-relaxed font-semibold">
                        {urg.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SPECIFIC MINING TOOLS */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-sm font-black uppercase text-slate-950 mb-3">
                  SECTION 18 — Outillage Spécifique Requis pour l'Atelier
                </h3>
                <p className="text-xs text-slate-500 font-medium mb-4">
                  La maintenance de l'Epiroc ST2G requiert un jeu d'outils calibrés et normés. Ne jamais substituer par de l'outillage standard.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-bold text-slate-700">
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-2">
                    🔧 Clé dynamométrique 1200 Nm
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-2">
                    🗜️ Extracteur vérin lourd
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-2">
                    🔌 Testeur pression hydro (0-20 MPa)
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-2">
                    🎈 Testeur azote (0-200 bar)
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-2">
                    💻 INSITE Cummins Diagnostic
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-2">
                    ⛓️ Extracteur chaîne pont
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: INTERACTIVE WORK ORDER FORM */}
          {activeTab === "fiche" && (
            <div className="space-y-6">
              
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-sm font-black uppercase text-slate-950">
                    FICHE INTERVENTION ST2G (SOU-GMAO Mobile)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Formulaire obligatoire de suivi d'activité. Sauvegardé automatiquement en local et prêt à être synchronisé.
                  </p>
                </div>

                <form onSubmit={submitInterventionForm} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Date d'intervention</label>
                      <input 
                        type="date" 
                        value={formState.date} 
                        onChange={(e) => setFormState({...formState, date: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Heures machine (Engine hours)</label>
                      <input 
                        type="number" 
                        placeholder="Ex: 14502" 
                        value={formState.machineHours} 
                        onChange={(e) => setFormState({...formState, machineHours: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500/20"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nom du Mécanicien</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Y. Ouzrirou" 
                        value={formState.mecoName} 
                        onChange={(e) => setFormState({...formState, mecoName: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Niveau Certif Mécano</label>
                      <select 
                        value={formState.level} 
                        onChange={(e) => setFormState({...formState, level: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none"
                      >
                        <option value="1">Niveau 1 — Apprenti</option>
                        <option value="2">Niveau 2 — Confirmé</option>
                        <option value="3">Niveau 3 — Expert</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Numéro de Parc Engin</label>
                      <input 
                        type="text" 
                        value={formState.parkNo} 
                        onChange={(e) => setFormState({...formState, parkNo: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Code Fiche Panne</label>
                      <input 
                        type="text" 
                        placeholder="Ex: 1.1.4.A" 
                        value={formState.panneNo} 
                        onChange={(e) => setFormState({...formState, panneNo: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Contexte de panne</label>
                      <select 
                        value={formState.context} 
                        onChange={(e) => setFormState({...formState, context: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none"
                      >
                        <option value="Démarrage">Au Démarrage</option>
                        <option value="Charge">En Charge</option>
                        <option value="Descente">En Descente</option>
                        <option value="Montée">En Montée</option>
                        <option value="Routine">Maintenance Routine</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Symptôme principal constaté</label>
                    <textarea 
                      rows={2}
                      placeholder="Décrire le comportement inhabituel constaté par le mécanicien ou rapporté par l'opérateur..."
                      value={formState.symptom} 
                      onChange={(e) => setFormState({...formState, symptom: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Pièces remplacées</label>
                      <input 
                        type="text" 
                        placeholder="Réf ou libellé" 
                        value={formState.partsUsed} 
                        onChange={(e) => setFormState({...formState, partsUsed: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Diagnostic (min)</label>
                      <input 
                        type="number" 
                        placeholder="Minutes" 
                        value={formState.diagTime} 
                        onChange={(e) => setFormState({...formState, diagTime: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Réparation (h)</label>
                      <input 
                        type="number" 
                        step="0.5" 
                        placeholder="Heures" 
                        value={formState.repairTime} 
                        onChange={(e) => setFormState({...formState, repairTime: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Attente Pièces (h)</label>
                      <input 
                        type="number" 
                        placeholder="Heures d'attente" 
                        value={formState.partsWaitTime} 
                        onChange={(e) => setFormState({...formState, partsWaitTime: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  {/* Signatures & approval flags */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={formState.validationSigned} 
                        onChange={(e) => setFormState({...formState, validationSigned: e.target.checked})}
                        className="w-4 h-4 rounded text-amber-500 border-slate-300 focus:ring-0"
                      />
                      <span className="text-xs font-bold text-slate-700">✍️ Signer l'intervention en tant que Mécanicien</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={formState.supervisorSigned} 
                        onChange={(e) => setFormState({...formState, supervisorSigned: e.target.checked})}
                        className="w-4 h-4 rounded text-amber-500 border-slate-300 focus:ring-0"
                      />
                      <span className="text-xs font-bold text-slate-700">👨‍✈️ Contresigner (Chef de Mine / Superviseur)</span>
                    </label>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-xl py-3 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Save className="w-4 h-4" />
                      Enregistrer la Fiche d'Intervention
                    </button>
                  </div>
                </form>
              </div>

              {/* INTERVENTION SHEET LOCAL HISTORY */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-4">
                  Historique des 10 Dernières Fiches Enregistrées
                </h3>

                {interventionHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium text-center py-6">
                    Aucune fiche enregistrée en local pour l'Epiroc ST2G pour le moment.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {interventionHistory.map((record) => (
                      <div key={record.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-4">
                        <div className="text-xs leading-relaxed font-semibold">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-mono bg-slate-900 text-white text-[9px] px-2 py-0.5 rounded font-black">
                              ID: {record.parkNo}
                            </span>
                            <span className="text-slate-400 font-bold">•</span>
                            <span className="text-slate-700 font-black">{record.date}</span>
                            <span className="text-slate-400 font-bold">•</span>
                            <span className="text-amber-700 font-black">{record.machineHours} Heures</span>
                          </div>
                          <p className="text-slate-900">
                            <strong>Mécano :</strong> {record.mecoName} (Niveau {record.level})
                          </p>
                          {record.symptom && (
                            <p className="text-slate-600 mt-1">
                              <strong>Symptômes :</strong> {record.symptom}
                            </p>
                          )}
                          <div className="mt-2 flex gap-3 text-[10px] text-slate-400">
                            <span>Diagnostic : {record.diagTime || "0"} min</span>
                            <span>Réparation : {record.repairTime || "0"} h</span>
                            <span>Approuvé Mécano : {record.validationSigned ? "✅" : "❌"}</span>
                            <span>Signé Chef : {record.supervisorSigned ? "✅" : "❌"}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteInterventionRecord(record.id)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-md border border-rose-100"
                          title="Supprimer cette fiche"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 6: REFERENCE VALUES & TORQUE VALUES */}
          {activeTab === "referentiel" && (
            <div className="space-y-6">
              
              {/* COMPREHENSIVE LIMIT VALUES */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-sm font-black uppercase text-slate-950 mb-3">
                  SECTION 14 — VALEURS DE RÉFÉRENCE & COMPRESSIONS
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider">
                        <th className="p-2 font-black">Paramètre Machine</th>
                        <th className="p-2 font-black">Valeur Normale</th>
                        <th className="p-2 font-black">Seuil Alarme (Voyant)</th>
                        <th className="p-2 font-black">Arrêt Immédiat (Rouge)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {EPIROC_REFERENCES.map((r, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 font-semibold text-slate-800">
                          <td className="p-2.5 font-bold text-slate-900">{r.param}</td>
                          <td className="p-2.5 text-emerald-700">{r.normal}</td>
                          <td className="p-2.5 text-amber-700">{r.alarme}</td>
                          <td className="p-2.5 text-red-700 font-bold">{r.arret}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TORQUE VALUES & LOCK CODES */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-sm font-black uppercase text-slate-950 mb-3">
                  SECTION 15 — COUPLES DE SERRAGE DES SENSORS & STRUCTURES
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider">
                        <th className="p-2 font-black">Assemblage</th>
                        <th className="p-2 font-black">Filetage</th>
                        <th className="p-2 font-black">Couple (Nm)</th>
                        <th className="p-2 font-black">Type Freinage</th>
                        <th className="p-2 font-black">Fréquence Contrôle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {EPIROC_COUPLES.map((c, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 font-semibold text-slate-800">
                          <td className="p-2.5 font-bold text-slate-900">{c.item}</td>
                          <td className="p-2.5 text-slate-600 font-mono">{c.filetage}</td>
                          <td className="p-2.5 text-slate-900 font-black">{c.torque}</td>
                          <td className="p-2.5 text-slate-600">{c.lock}</td>
                          <td className="p-2.5 text-amber-700 font-bold">{c.check}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MAINTENANCE INTERVAL KITS */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3">
                  SECTIONS & INTERVALLLES DES KITS DE MAINTENANCE
                </h3>

                <div className="space-y-3">
                  {EPIROC_KITS.map((k) => (
                    <div key={k.interval} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                      <span className="text-xs font-mono font-black bg-slate-900 text-white px-2.5 py-0.5 rounded shrink-0">
                        {k.interval}
                      </span>
                      <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                        {k.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: REGULATIONS & CERTIFICATION LEVELS */}
          {activeTab === "regulations" && (
            <div className="space-y-6">
              
              {/* CERTIFICATION LEVELS */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-sm font-black uppercase text-slate-950 mb-3">
                  SECTION 22 — NIVEAUX DE CERTIFICATION DES MÉCANICIENS SOU-GMAO
                </h3>
                <p className="text-xs text-slate-500 font-medium mb-4">
                  Pour des raisons d'assurances minières et de sécurité vitale au fond, certaines actions lourdes sont strictement restreintes selon le niveau professionnel.
                </p>

                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-xs">
                    <span className="font-black text-emerald-800 block mb-1">NIVEAU 1 — APPRENTI (0-2 ans d'expérience au fond)</span>
                    <strong className="text-emerald-700">Autorisé :</strong> Quick Fixes mineurs, filtres standard, graissage périodique, vérifications de niveaux, remplacement de pièces non-critiques (lampes, fusibles).<br />
                    <strong className="text-rose-700">Strictement interdit :</strong> Interventions moteur interne, couple de transmission lourd, démontage de frein SAHR, ouverture du circuit hydraulique sous pression.
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-xs">
                    <span className="font-black text-blue-800 block mb-1">NIVEAU 2 — MECO CONFIRMÉ (2-5 ans d'expérience au fond)</span>
                    <strong className="text-blue-700">Autorisé :</strong> Niveau 1 + dépose de vérins standards, révision des étriers et plaquettes SAHR, diagnostic d'arbre d'articulation, direction standard, électricité générale.<br />
                    <strong className="text-rose-700">Strictement interdit :</strong> Reconditionnement interne de pompes, recharges d'accumulateurs sous azote critique, flashage firmware ECM.
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-xs">
                    <span className="font-black text-amber-800 block mb-1">NIVEAU 3 — EXPERT / CHEF DE SOU-GMAO Ateliers (5+ ans d'expérience)</span>
                    <strong className="text-amber-700">Autorisé :</strong> Accès universel. Reconditionnement moteur Cummins, étalonnage complet des pressions, recharges d'azote de release, décisions d'arrêt technique d'engin de flotte.<br />
                    <strong className="text-slate-800">Responsabilités :</strong> Validation de fin d'interventions Niveau 1 et 2, signature légale du carnet de santé de la machine ST2G.
                  </div>
                </div>
              </div>

              {/* ECM FIRMWARE INSTRUCTIONS */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-sm font-black uppercase text-slate-950 mb-3">
                  SECTION 23 — MISE À JOUR ET FLASH FIRMWARE ECM CUMMINS
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold mb-3">
                  Les mises à jour de firmware résolvent des bugs connus de communication CAN bus avec l'écran cockpit. Cette action est <strong>réservée exclusivement au Niveau 3</strong>.
                </p>

                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs mb-4 font-bold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>Précautions de sécurité : Ne jamais flasher sur batterie faible (&lt;24V). Une coupure d'alimentation durant le flash détruit l'ECM de façon irréversible.</span>
                </div>

                <div className="space-y-2 text-xs font-semibold text-slate-700 leading-relaxed pl-4 list-decimal">
                  <li>Brancher le câble INSITE Cummins sur le port diagnostic cabine.</li>
                  <li>Connecter un chargeur stabilisé de 24V sur les bornes batterie de secours.</li>
                  <li>Lancer le logiciel de service technique et vérifier la version de firmware actuelle.</li>
                  <li>Télécharger la rom certifiée <strong>EP-ST2G-CUMM-V2.12</strong>.</li>
                  <li>Démarrer le processus de flashage (ne manipuler aucun interrupteur pendant 15 minutes).</li>
                  <li>Une fois terminé, effectuer un cycle d'alimentation complet (Power Cycle de 60 secondes).</li>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
